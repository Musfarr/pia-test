import { useState, useEffect } from 'react';

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <button
      className="fullscreen-toggle btn btn-dark"
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
    </button>
  );
}
