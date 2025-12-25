
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { View, User, UserRole } from './types';
import { Loader2 } from 'lucide-react';

// Lazy loading components
const ArtGenerator = lazy(() => import('./components/ArtGenerator').then(m => ({ default: m.ArtGenerator })));
const FaceGenerator = lazy(() => import('./components/FaceGenerator').then(m => ({ default: m.FaceGenerator })));
const WeddingGenerator = lazy(() => import('./components/WeddingGenerator').then(m => ({ default: m.WeddingGenerator })));
const TTSGenerator = lazy(() => import('./components/TTSGenerator').then(m => ({ default: m.TTSGenerator })));
const VoiceCloner = lazy(() => import('./components/VoiceCloner').then(m => ({ default: m.VoiceCloner })));
const BackgroundGenerator = lazy(() => import('./components/BackgroundGenerator').then(m => ({ default: m.BackgroundGenerator })));
const TetGenerator = lazy(() => import('./components/TetGenerator').then(m => ({ default: m.TetGenerator })));
const ChristmasGenerator = lazy(() => import('./components/ChristmasGenerator').then(m => ({ default: m.ChristmasGenerator })));
const SlideGenerator = lazy(() => import('./components/SlideGenerator').then(m => ({ default: m.SlideGenerator })));
const PosterGenerator = lazy(() => import('./components/PosterGenerator').then(m => ({ default: m.PosterGenerator })));
const QuizGenerator = lazy(() => import('./components/QuizGenerator').then(m => ({ default: m.QuizGenerator })));
const QuizGrader = lazy(() => import('./components/QuizGrader').then(m => ({ default: m.QuizGrader })));
const SoundMixer = lazy(() => import('./components/SoundMixer').then(m => ({ default: m.SoundMixer })));

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
    <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
    <p className="text-stone-500 font-medium text-xs uppercase tracking-widest">Đang khởi tạo công cụ...</p>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState<View>(View.AUTH);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ncc_ai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView(View.DASHBOARD);
    }
  }, []);

  const handleLogin = (userData: { email: string; name: string; photoURL: string }) => {
    const newUser: User = {
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL,
      role: UserRole.CREATOR,
      credits: 9999
    };
    setUser(newUser);
    localStorage.setItem('ncc_ai_user', JSON.stringify(newUser));
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ncc_ai_user');
    setCurrentView(View.AUTH);
  };

  if (currentView === View.AUTH) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      default:
        return (
          <Suspense fallback={<LoadingView />}>
            {(() => {
              switch (currentView) {
                case View.QUIZ_GRADER: return <QuizGrader />;
                case View.QUIZ_GEN: return <QuizGenerator />;
                case View.SLIDE_GEN: return <SlideGenerator />;
                case View.BG_GEN: return <BackgroundGenerator />;
                case View.FACE_GEN: return <FaceGenerator />;
                case View.WEDDING_GEN: return <WeddingGenerator />;
                case View.ART_GEN: return <ArtGenerator />;
                case View.TTS: return <TTSGenerator />;
                case View.VOICE_CLONE: return <VoiceCloner />;
                case View.TET_2026_GEN: return <TetGenerator />;
                case View.CHRISTMAS_GEN: return <ChristmasGenerator />;
                case View.POSTER_GEN: return <PosterGenerator />;
                case View.SOUND_MIXER: return <SoundMixer />;
                default: return <Dashboard setView={setCurrentView} />;
              }
            })()}
          </Suspense>
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      user={user} 
      onLogout={handleLogout} 
    >
      {renderView()}
    </Layout>
  );
}

export default App;
