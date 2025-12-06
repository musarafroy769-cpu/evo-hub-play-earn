import { useEffect, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay ad loading to not block initial render
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isVisible]);

  if (!isVisible) return <div className="w-full h-[90px]" />;

  return (
    <div className="w-full min-h-[90px]">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4369139472734181"
        data-ad-slot="5746798032"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
