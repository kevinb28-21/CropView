/**
 * Google Maps-style Map Controls
 * Provides zoom, rotation, compass, and other map controls
 */
import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

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
      className="leaflet-control"
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
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
          borderBottom: '1px solid #e0e0e0',
          background: 'white',
          cursor: 'pointer',
          fontSize: '20px',
          lineHeight: '1',
          padding: 0,
          transition: 'background 0.2s',
          userSelect: 'none',
          fontWeight: 'bold',
          color: '#333'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
        onMouseLeave={(e) => e.target.style.background = 'white'}
        onMouseDown={(e) => e.target.style.background = '#e0e0e0'}
        onMouseUp={(e) => e.target.style.background = '#f5f5f5'}
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
          background: 'white',
          cursor: 'pointer',
          fontSize: '24px',
          lineHeight: '1',
          padding: 0,
          transition: 'background 0.2s',
          userSelect: 'none',
          fontWeight: 'bold',
          color: '#333'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
        onMouseLeave={(e) => e.target.style.background = 'white'}
        onMouseDown={(e) => e.target.style.background = '#e0e0e0'}
        onMouseUp={(e) => e.target.style.background = '#f5f5f5'}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

export function CompassControl({ rotation = 0, onRotationChange }) {
  const map = useMap();
  const [currentRotation, setCurrentRotation] = React.useState(rotation || 0);

  React.useEffect(() => {
    if (rotation !== undefined && rotation !== currentRotation) {
      setCurrentRotation(rotation);
    }
  }, [rotation]);

  const handleCompassClick = () => {
    // Reset rotation to 0
    const newRotation = 0;
    setCurrentRotation(newRotation);
    onRotationChange?.(newRotation);
    applyRotation(newRotation);
  };

  const applyRotation = (angle, immediate = false) => {
    // Get map center in pixels for accurate transform origin
    const mapSize = map.getSize();
    const centerX = mapSize.x / 2;
    const centerY = mapSize.y / 2;
    
    // Apply rotation to tile pane and overlay pane
    const tilePane = map.getPane('tilePane');
    const overlayPane = map.getPane('overlayPane');
    const markerPane = map.getPane('markerPane');
    const shadowPane = map.getPane('shadowPane');
    
    if (tilePane) {
      tilePane.style.transform = `rotate(${angle}deg)`;
      tilePane.style.transformOrigin = `${centerX}px ${centerY}px`;
      tilePane.style.transition = immediate ? 'none' : 'transform 0.1s ease';
      tilePane.style.willChange = 'transform';
    }
    
    // Rotate overlay pane (markers, lines) in opposite direction to keep them upright
    if (overlayPane) {
      overlayPane.style.transform = `rotate(${-angle}deg)`;
      overlayPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      overlayPane.style.transition = immediate ? 'none' : 'transform 0.1s ease';
      overlayPane.style.willChange = 'transform';
    }
    
    // Also rotate marker pane to keep markers upright
    if (markerPane) {
      markerPane.style.transform = `rotate(${-angle}deg)`;
      markerPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      markerPane.style.transition = immediate ? 'none' : 'transform 0.1s ease';
      markerPane.style.willChange = 'transform';
    }
    
    if (shadowPane) {
      shadowPane.style.transform = `rotate(${-angle}deg)`;
      shadowPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      shadowPane.style.transition = immediate ? 'none' : 'transform 0.1s ease';
      shadowPane.style.willChange = 'transform';
    }
    
    // Only force refresh if not immediate (during drag)
    if (!immediate) {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        map.invalidateSize();
        // Force a tile refresh by redrawing all tile layers
        map.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            layer.redraw();
          }
        });
      });
    }
  };

  React.useEffect(() => {
    applyRotation(currentRotation);
    
    // Update on map resize
    const handleResize = () => {
      applyRotation(currentRotation);
    };
    
    map.on('resize', handleResize);
    
    return () => {
      map.off('resize', handleResize);
    };
  }, [currentRotation, map]);

  const handleRotate = (delta) => {
    const newRotation = ((currentRotation + delta) % 360 + 360) % 360;
    setCurrentRotation(newRotation);
    onRotationChange?.(newRotation);
    applyRotation(newRotation);
  };

  return (
    <div 
      className="leaflet-control"
      style={{
        position: 'absolute',
        top: '60px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        pointerEvents: 'auto',
        minWidth: '60px'
      }}
    >
      <button
        onClick={() => handleRotate(-15)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '24px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.2s',
          userSelect: 'none',
          color: '#333',
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f5f5f5';
          e.target.style.borderColor = '#ccc';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#e0e0e0';
        }}
        title="Rotate counterclockwise"
        aria-label="Rotate counterclockwise"
      >
        ↺
      </button>
      
      <div
        onClick={handleCompassClick}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'white',
          border: '2px solid #4285f4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f8f9fa';
          e.currentTarget.style.borderColor = '#1a73e8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#4285f4';
        }}
        title="Click to reset rotation. Right-click drag or Ctrl+drag to rotate."
      >
        <div
          style={{
            fontSize: '24px',
            transform: `rotate(${currentRotation}deg)`,
            transition: 'transform 0.3s ease',
            lineHeight: '1'
          }}
        >
          🧭
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            fontSize: '10px',
            color: '#666',
            fontWeight: 500
          }}
        >
          {currentRotation}°
        </div>
      </div>
      
      <button
        onClick={() => handleRotate(15)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '24px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.2s',
          userSelect: 'none',
          color: '#333',
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f5f5f5';
          e.target.style.borderColor = '#ccc';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#e0e0e0';
        }}
        title="Rotate clockwise"
        aria-label="Rotate clockwise"
      >
        ↻
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
      className="leaflet-control"
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
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
          background: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          padding: 0,
          transition: 'background 0.2s',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333',
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
        onMouseLeave={(e) => e.target.style.background = 'white'}
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? '⤓' : '⤢'}
      </button>
    </div>
  );
}

