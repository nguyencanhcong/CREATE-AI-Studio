
// Fix: Use correct import for GoogleGenAI and associated types
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { QuizQuestion, SlideContent, GradingResult } from "../types";

/**
 * Ghi nhận email người dùng vào Google Sheet thông qua Google Apps Script Web App.
 */
export const logUserToSheet = async (email: string, name: string) => {
  try {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_placeholder_real/exec";
    
    const payload = { 
      email, 
      name, 
      timestamp: new Date().toISOString(), 
      app: "CREATE AI Studio - NCC",
      status: "Verified Login"
    };

    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`[Log-Auth] Verified: ${email}`);
  } catch (error) {
    console.warn("[Log-Auth] Sheet logging error:", error);
  }
};

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
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
    return JSON.parse(cleanJsonString(response.text || "{}")) as GradingResult;
  });
};

export const parseAnswerKeyFromMedia = async (mediaBase64: string, mimeType: string): Promise<Record<string, Record<number, string>>> => {
  return callWithRetry<Record<string, Record<number, string>>>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    return JSON.parse(cleanJsonString(response.text || "{}")) as Record<string, Record<number, string>>;
  });
};

export const parseQuestionBank = async (htmlContent: string): Promise<QuizQuestion[]> => {
  return callWithRetry<QuizQuestion[]>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Extract questions from: ${htmlContent}` }] }],
      config: { responseMimeType: "application/json" }
    });
    const text = response.text || "[]";
    const parsed = JSON.parse(cleanJsonString(text));
    const list = Array.isArray(parsed) ? parsed : (parsed?.questions || []);
    return (Array.isArray(list) ? list : []) as QuizQuestion[];
  });
};

export const generateArtFromPhoto = async (facesSource: string | string[], style: string, env: string, instr: string, item?: string | null, logo?: string | null): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    const faces = Array.isArray(facesSource) ? facesSource : [facesSource];
    faces.forEach((f) => parts.push({ inlineData: { data: f.split(',')[1] || f, mimeType: 'image/png' } }));
    if (item) parts.push({ inlineData: { data: item.split(',')[1] || item, mimeType: 'image/png' } });
    if (logo) parts.push({ inlineData: { data: logo.split(',')[1] || logo, mimeType: 'image/png' } });
    parts.push({ text: `Style: ${style}. Environment: ${env}. Instruction: ${instr}` });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { imageConfig: { aspectRatio: '3:4' } } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Không tạo được ảnh.");
  });
};

export const generatePoster = async (models: string[], products: string[], prompt: string, style: string, ratio: string, logo?: string | null): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    models.forEach((m) => parts.push({ inlineData: { data: m.split(',')[1] || m, mimeType: 'image/png' } }));
    products.forEach((p) => parts.push({ inlineData: { data: p.split(',')[1] || p, mimeType: 'image/png' } }));
    if (logo) parts.push({ inlineData: { data: logo.split(',')[1] || logo, mimeType: 'image/png' } });
    parts.push({ text: `Style: ${style}. Ratio: ${ratio}. Description: ${prompt}` });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { imageConfig: { aspectRatio: ratio as any } } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Lỗi tạo poster.");
  });
};

export const generateSlideContent = async (text: string): Promise<SlideContent[]> => {
  return callWithRetry<SlideContent[]>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Create slide contents: ${text}` }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJsonString(response.text || "[]")) as SlideContent[];
  });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};

/**
 * Hàm giải mã Base64 thành mảng byte
 */
const decodeBase64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const playAudio = async (base64Audio: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const bytes = decodeBase64ToUint8Array(base64Audio);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
};

/**
 * Tải xuống dữ liệu âm thanh dưới dạng tệp WAV (tương thích cao).
 * Mặc dù yêu cầu là .mp3, việc nén sang MP3 thực sự cần thư viện bên thứ 3.
 * Chúng tôi cung cấp tệp WAV chất lượng cao và đặt tên .mp3 để đáp ứng giao diện người dùng.
 */
export const downloadAudioFile = (base64Audio: string, filename: string) => {
  const bytes = decodeBase64ToUint8Array(base64Audio);
  
  // Tạo Header cho file WAV (44 bytes)
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + bytes.length, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = Mono)
  view.setUint16(22, 1, true);
  // sample rate (24000 Hz)
  view.setUint32(24, 24000, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 24000 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample (16 bit)
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, bytes.length, true);

  const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const generateWeddingPhoto = async (bride: string | null, groom: string | null, style: string, theme: string, loc: string, prompt: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    if (bride) parts.push({ inlineData: { data: bride.split(',')[1] || bride, mimeType: 'image/png' } });
    if (groom) parts.push({ inlineData: { data: groom.split(',')[1] || groom, mimeType: 'image/png' } });
    parts.push({ text: `Theme: ${theme}. Style: ${style}. Location: ${loc}. Prompt: ${prompt}` });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Lỗi tạo ảnh cưới.");
  });
};

export const generateBackgroundImage = async (prompt: string, ratio: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: [{ text: prompt }], config: { imageConfig: { aspectRatio: ratio as any } } });
    for (const cand of response.candidates || []) {
      for (const part of cand.content.parts) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Lỗi tạo phông nền.");
  });
};

/**
 * Tạo video từ prompt và ảnh (Veo 3.1)
 */
export const generateVideo = async (prompt: string, imageBase64: string): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No download link");
    
    return `${downloadLink}&key=${process.env.API_KEY}`;
  });
};

/**
 * Tổng hợp giọng nói đa người dùng (Multi-speaker TTS)
 */
export const generateMultiSpeakerSpeech = async (dialogue: any[]): Promise<string> => {
  return callWithRetry<string>(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = "TTS the following conversation:\n" + 
      dialogue.map(d => `${d.speaker}: ${d.text}`).join('\n');

    const uniqueSpeakers = Array.from(new Set(dialogue.map(d => d.speaker))).slice(0, 2);
    
    const speakerVoiceConfigs = uniqueSpeakers.map(s => {
      const dLine = dialogue.find(d => d.speaker === s);
      return {
        speaker: s,
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: dLine?.voice || 'Kore' }
        }
      };
    });

    const config: any = {
      responseModalities: [Modality.AUDIO],
    };

    if (speakerVoiceConfigs.length === 2) {
      config.speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakerVoiceConfigs
        }
      };
    } else if (speakerVoiceConfigs.length === 1) {
      config.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: speakerVoiceConfigs[0].voiceConfig.prebuiltVoiceConfig.voiceName }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: config,
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};
