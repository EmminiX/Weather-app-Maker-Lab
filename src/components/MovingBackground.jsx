import React, { useEffect, useRef } from 'react';
import weatherVideo from '../assets/weather.mov';
export function MovingBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.onerror = (e) => {
        console.error('Error loading video:', e);
      };
      
      // Force video reload
      video.load();
    }
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls // Temporarily added for debugging
      >
        <source src={weatherVideo} type="video/quicktime" />
        <source src={weatherVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
