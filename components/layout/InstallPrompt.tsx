"use client";

import { useState, useEffect } from "react";
import { X, Share } from "lucide-react";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 현재 앱(Standalone) 모드로 실행 중인지 확인
    const checkStandalone = () => {
      return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    };
    
    const isApp = checkStandalone();
    setIsStandalone(isApp);

    // 앱으로 실행 중이면 프롬프트 띄우지 않음
    if (isApp) return;

    // iOS 기기 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // iOS의 경우 설치 안내를 위해 항상 프롬프트를 띄움 (원한다면 localStorage로 한 번만 띄우게 제어 가능)
    if (isIosDevice) {
      // 너무 자주 뜨는 것을 막으려면 여기에 localStorage 로직 추가
      const hasDismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!hasDismissed) setShowPrompt(true);
    }

    // Android / Chrome (설치 가능 이벤트 발생 시)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!hasDismissed) setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  // 앱 모드이거나 프롬프트를 보여줄 필요가 없으면 렌더링하지 않음
  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-[340px] bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl z-[100] flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex-1">
        <h3 className="font-bold mb-1">앱으로 설치하기</h3>
        {isIOS ? (
          <p className="text-sm text-primary-foreground/90 leading-relaxed">
            Safari 하단의 <Share className="inline w-4 h-4 mx-0.5 align-text-bottom" /> 공유 버튼을 누르고<br/>
            <strong>홈 화면에 추가</strong>를 선택해주세요.
          </p>
        ) : (
          <p className="text-sm text-primary-foreground/90 leading-relaxed">
            홈 화면에 앱을 설치하여 더 빠르고 편리하게 이용하세요.
          </p>
        )}
      </div>
      
      {!isIOS && deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="bg-background text-primary hover:bg-background/90 transition-colors px-3 py-1.5 rounded-md text-sm font-bold shrink-0 shadow-sm"
        >
          설치
        </button>
      )}
      
      <button 
        onClick={handleClose} 
        className="p-1 shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="닫기"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
