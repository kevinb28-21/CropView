/**
 * Google Maps-style Map Controls
 * Dark theme — matches CropView design system
 */
import React from 'react';
import { useMap } from 'react-leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';

export function ZoomControl() {
  const map = useMap();

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  return (
    <div
      className="map-control"
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        pointerEvents: 'auto'
      }}
    >
      <button
        onClick={zoomIn}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          border: 'none',
          borderBottom: '1px solid var(--bg-border)',
          background: 'var(--bg-surface)',
          cursor: 'pointer',
          fontSize: '20px',
          lineHeight: '1',
          padding: 0,
          transition: 'background 0.2s',
          userSelect: 'none',
          fontWeight: 'bold',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'var(--bg-surface)'; }}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          border: 'none',
          background: 'var(--bg-surface)',
          cursor: 'pointer',
          fontSize: '24px',
          lineHeight: '1',
          padding: 0,
          transition: 'background 0.2s',
          userSelect: 'none',
          fontWeight: 'bold',
          color: 'var(--text-primary)'
        }}
        onMouseEnter={(e) => { e.target.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'var(--bg-surface)'; }}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

export function FullscreenControl() {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    const mapContainer = map.getContainer().parentElement;
    
    if (!isFullscreen) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer.webkitRequestFullscreen) {
        mapContainer.webkitRequestFullscreen();
      } else if (mapContainer.msRequestFullscreen) {
        mapContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
    
    // Invalidate map size after fullscreen change
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [map]);

  return (
    <div
      className="map-control"
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'var(--bg-surface)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        pointerEvents: 'auto'
      }}
    >
      <button
        onClick={toggleFullscreen}
        style={{
          width: '40px',
          height: '40px',
          border: 'none',
          background: 'var(--bg-surface)',
          cursor: 'pointer',
          fontSize: '18px',
          padding: 0,
          transition: 'background 0.2s',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
        onMouseLeave={(e) => e.target.style.background = 'var(--bg-surface)'}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );
}

