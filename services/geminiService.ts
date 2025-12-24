
// Fix: Use correct import for GoogleGenAI and associated types
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { QuizQuestion, SlideContent, GradingResult } from "../types";

/**
 * Ghi nhận email người dùng vào Google Sheet thông qua Google Apps Script Web App.
 * Đảm bảo dữ liệu được gửi về tài khoản quản lý nguyenccong@gmail.com.
 * Luồng này là bắt buộc sau khi xác thực thành công qua Google GSI.
 */
export const logUserToSheet = async (email: string, name: string) => {
  try {
    // NCC: Thay thế SCRIPT_URL này bằng URL Web App đã deploy từ Apps Script
    // Spreadsheet: https://docs.google.com/spreadsheets/d/...
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_placeholder_real/exec";
    
    const payload = { 
      email, 
      name, 
      timestamp: new Date().toISOString(), 
      app: "CREATE AI Studio - NCC",
      status: "Verified Login"
    };

    // Sử dụng fetch với mode no-cors cho Google Apps Script
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`[Log-Auth] Verified: ${email}`);
  } catch (error) {
    // Fail silently in UI but log to console for debugging
    console.warn("[Log-Auth] Sheet logging error:", error);
  }
};

/**
 * Cơ chế Retry Siêu bền bỉ (Ultra-Resilient)
 * Được thiết kế riêng cho mục đích giáo dục phi lợi nhuận
 */
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 20, delay = 10000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toLowerCase() || "";
    const isQuotaError = 
      errorMsg.includes("429") || 
      errorMsg.includes("limit") || 
      errorMsg.includes("quota") || 
      errorMsg.includes("exhausted");
      
    if (isQuotaError && retries > 0) {
      const jitter = Math.random() * 3000;
      const actualDelay = delay + jitter;
      console.warn(`[AI Studio] Đang xếp hàng thử lại... Chờ ${Math.round(actualDelay/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, actualDelay));
      return callWithRetry<T>(fn, retries - 1, delay * 1.2);
    }
    throw error;
  }
};

const cleanJsonString = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const analyzeQuizSheet = async (imageBase64: string): Promise<GradingResult> => {
  return callWithRetry<GradingResult>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    // Fix: Use gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: [{
        parts: [
          { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
          { text: `CONTEXT: Non-profit Education Project. TASK: Analyze quiz sheet. Return JSON only.` }
        ]
      }],
      config: { responseMimeType: "application/json" }
    });
    // Fix: Access response.text directly (property, not method)
    return JSON.parse(cleanJsonString(response.text || "{}")) as GradingResult;
  });
};

export const parseAnswerKeyFromMedia = async (mediaBase64: string, mimeType: string): Promise<Record<string, Record<number, string>>> => {
  return callWithRetry<Record<string, Record<number, string>>>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Use gemini-3-pro-preview for complex text extraction tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{
        parts: [
          { inlineData: { data: mediaBase64.split(',')[1] || mediaBase64, mimeType } },
          { text: "Extract quiz answer keys. Return JSON." }
        ]
      }],
      config: { responseMimeType: "application/json" }
    });
    // Fix: Access response.text directly (property, not method)
    return JSON.parse(cleanJsonString(response.text || "{}")) as Record<string, Record<number, string>>;
  });
};

export const parseQuestionBank = async (htmlContent: string): Promise<QuizQuestion[]> => {
  return callWithRetry<QuizQuestion[]>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Use gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Extract questions from: ${htmlContent}` }] }],
      config: { responseMimeType: "application/json" }
    });
    // Fix: Safely parse and ensure array return to prevent unknown[] type issues
    const text = response.text || "[]";
    const parsed = JSON.parse(cleanJsonString(text));
    // Support both direct array and object with questions property
    const list = Array.isArray(parsed) ? parsed : (parsed?.questions || []);
    return (Array.isArray(list) ? list : []) as QuizQuestion[];
  });
};

export const generateArtFromPhoto = async (facesSource: string | string[], style: string, env: string, instr: string, item?: string | null, logo?: string | null): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    const faces = Array.isArray(facesSource) ? facesSource : [facesSource];
    faces.forEach((f) => parts.push({ inlineData: { data: f.split(',')[1] || f, mimeType: 'image/png' } }));
    if (item) parts.push({ inlineData: { data: item.split(',')[1] || item, mimeType: 'image/png' } });
    if (logo) parts.push({ inlineData: { data: logo.split(',')[1] || logo, mimeType: 'image/png' } });
    parts.push({ text: instr });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { imageConfig: { aspectRatio: '3:4' } } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Không tạo được ảnh.");
  });
};

export const generatePoster = async (models: string[], products: string[], prompt: string, style: string, ratio: string, logo?: string | null): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    models.forEach((m) => parts.push({ inlineData: { data: m.split(',')[1] || m, mimeType: 'image/png' } }));
    products.forEach((p) => parts.push({ inlineData: { data: p.split(',')[1] || p, mimeType: 'image/png' } }));
    if (logo) parts.push({ inlineData: { data: logo.split(',')[1] || logo, mimeType: 'image/png' } });
    parts.push({ text: prompt });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { imageConfig: { aspectRatio: ratio as any } } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Lỗi tạo poster.");
  });
};

export const generateSlideContent = async (text: string): Promise<SlideContent[]> => {
  return callWithRetry<SlideContent[]>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Use gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Create slide contents: ${text}` }] }],
      config: { responseMimeType: "application/json" }
    });
    // Fix: Access response.text directly (property, not method)
    return JSON.parse(cleanJsonString(response.text || "[]")) as SlideContent[];
  });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
    });
    // Fix: Correct candidate and part access
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};

export const playAudio = async (base64Audio: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    // Fix: Manual base64 decode implementation
    const decodeBase64 = (base64: string) => {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    };
    const bytes = decodeBase64(base64Audio);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
};

export const generateWeddingPhoto = async (bride: string | null, groom: string | null, style: string, theme: string, loc: string, prompt: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    if (bride) parts.push({ inlineData: { data: bride.split(',')[1] || bride, mimeType: 'image/png' } });
    if (groom) parts.push({ inlineData: { data: groom.split(',')[1] || groom, mimeType: 'image/png' } });
    parts.push({ text: prompt });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Lỗi tạo ảnh cưới.");
  });
};

export const generateBackgroundImage = async (prompt: string, ratio: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: [{ text: prompt }], config: { imageConfig: { aspectRatio: ratio as any } } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Lỗi tạo phông nền.");
  });
};

export const generateVideo = async (prompt: string, image: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let op = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, image: { imageBytes: image.split(',')[1] || image, mimeType: 'image/png' }, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' } });
    while (!op.done) { await new Promise(r => setTimeout(r, 10000)); op = await ai.operations.getVideosOperation({ operation: op }); }
    const res = await fetch(`${op.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`);
    return URL.createObjectURL(await res.blob());
  });
};

export const generateMultiSpeakerSpeech = async (dialogue: { speaker: string, text: string, voice: string }[]): Promise<string> => {
  return callWithRetry<string>(async () => {
    // Fix: named parameter for apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { 
          multiSpeakerVoiceConfig: { 
            speakerVoiceConfigs: dialogue.map(d => ({ 
              speaker: d.speaker, 
              voiceConfig: { prebuiltVoiceConfig: { voiceName: d.voice } } 
            })) 
          } 
        } 
      }
    });
    // Fix: Correct candidate and part access
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};
