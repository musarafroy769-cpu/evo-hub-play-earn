import { useEffect, useRef } from "react";

interface BannerAdProps {
  className?: string;
}

export const BannerAd = ({ className = "" }: BannerAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adId = useRef(`banner-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Monetag banner ad script injection
    if (adRef.current && window) {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "//pl25123239.cpmrevenuegate.com/9dcce4a6ee6b93f2a946b4e29ae39eac/invoke.js";
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div 
        ref={adRef}
        id={adId.current}
        className="min-h-[100px] w-full max-w-lg"
      />
    </div>
  );
};
