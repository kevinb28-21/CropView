/**
 * Mouse-based Rotation Control
 * Allows rotating the map by right-click drag or Ctrl+left-click drag (like Google Maps)
 */
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function MouseRotation({ rotation, onRotationChange }) {
  const map = useMap();
  const isRotatingRef = useRef(false);
  const startAngleRef = useRef(0);
  const startRotationRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Apply rotation to map panes
  const applyRotation = (angle) => {
    const mapContainer = map.getContainer();
    const tilePane = map.getPane('tilePane');
    const overlayPane = map.getPane('overlayPane');
    const markerPane = map.getPane('markerPane');
    const shadowPane = map.getPane('shadowPane');
    
    // Get map center in pixels for transform origin
    const mapSize = map.getSize();
    const centerX = mapSize.x / 2;
    const centerY = mapSize.y / 2;
    
    if (tilePane) {
      tilePane.style.transform = `rotate(${angle}deg)`;
      tilePane.style.transformOrigin = `${centerX}px ${centerY}px`;
      tilePane.style.willChange = 'transform';
    }
    
    // Counter-rotate overlay pane to keep polylines/polygons upright
    // But they should stay at their geographic positions
    if (overlayPane) {
      overlayPane.style.transform = `rotate(${-angle}deg)`;
      overlayPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      overlayPane.style.willChange = 'transform';
    }
    
    // Counter-rotate marker pane to keep markers upright
    // Markers should stay at their geographic lat/lng positions
    if (markerPane) {
      markerPane.style.transform = `rotate(${-angle}deg)`;
      markerPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      markerPane.style.willChange = 'transform';
    }
    
    // Also rotate shadow pane if it exists
    if (shadowPane) {
      shadowPane.style.transform = `rotate(${-angle}deg)`;
      shadowPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      shadowPane.style.willChange = 'transform';
    }
  };

  // Calculate angle from center to mouse position
  const getAngleFromCenter = (e) => {
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    return Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
  };

  useEffect(() => {
    let currentRotation = rotation || 0;
    applyRotation(currentRotation);

    const handleMouseDown = (e) => {
      // Right-click drag OR Ctrl/Cmd + left-click drag
      const isRightClick = e.originalEvent.button === 2;
      const isCtrlClick = (e.originalEvent.ctrlKey || e.originalEvent.metaKey) && e.originalEvent.button === 0;
      
      if (isRightClick || isCtrlClick) {
        e.originalEvent.preventDefault();
        isRotatingRef.current = true;
        startAngleRef.current = getAngleFromCenter(e.originalEvent);
        startRotationRef.current = currentRotation;
        lastMousePosRef.current = { x: e.originalEvent.clientX, y: e.originalEvent.clientY };
        
        // Change cursor
        map.getContainer().style.cursor = 'grabbing';
        
        // Disable map dragging temporarily
        map.dragging.disable();
      }
    };

    const handleMouseMove = (e) => {
      if (!isRotatingRef.current) return;
      
      e.originalEvent.preventDefault();
      const currentAngle = getAngleFromCenter(e.originalEvent);
      const deltaAngle = currentAngle - startAngleRef.current;
      
      // Calculate new rotation
      const newRotation = ((startRotationRef.current + deltaAngle) % 360 + 360) % 360;
      currentRotation = newRotation;
      
      // Apply rotation immediately (no transition during drag)
      const mapSize = map.getSize();
      const centerX = mapSize.x / 2;
      const centerY = mapSize.y / 2;
      
      const tilePane = map.getPane('tilePane');
      const overlayPane = map.getPane('overlayPane');
      const markerPane = map.getPane('markerPane');
      const shadowPane = map.getPane('shadowPane');
      
      if (tilePane) {
        tilePane.style.transition = 'none';
        tilePane.style.transform = `rotate(${newRotation}deg)`;
        tilePane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (overlayPane) {
        overlayPane.style.transition = 'none';
        overlayPane.style.transform = `rotate(${-newRotation}deg)`;
        overlayPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (markerPane) {
        markerPane.style.transition = 'none';
        markerPane.style.transform = `rotate(${-newRotation}deg)`;
        markerPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (shadowPane) {
        shadowPane.style.transition = 'none';
        shadowPane.style.transform = `rotate(${-newRotation}deg)`;
        shadowPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      
      lastMousePosRef.current = { x: e.originalEvent.clientX, y: e.originalEvent.clientY };
    };

    const handleMouseUp = (e) => {
      if (!isRotatingRef.current) return;
      
      isRotatingRef.current = false;
      map.getContainer().style.cursor = '';
      map.dragging.enable();
      
      // Re-enable transitions and update transform origins
      const mapSize = map.getSize();
      const centerX = mapSize.x / 2;
      const centerY = mapSize.y / 2;
      
      const tilePane = map.getPane('tilePane');
      const overlayPane = map.getPane('overlayPane');
      const markerPane = map.getPane('markerPane');
      const shadowPane = map.getPane('shadowPane');
      
      if (tilePane) {
        tilePane.style.transition = 'transform 0.1s ease';
        tilePane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (overlayPane) {
        overlayPane.style.transition = 'transform 0.1s ease';
        overlayPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (markerPane) {
        markerPane.style.transition = 'transform 0.1s ease';
        markerPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (shadowPane) {
        shadowPane.style.transition = 'transform 0.1s ease';
        shadowPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      
      // Update parent component
      if (onRotationChange) {
        onRotationChange(currentRotation);
      }
      
      // Force tile refresh after rotation
      requestAnimationFrame(() => {
        map.invalidateSize();
        map.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            layer.redraw();
          }
        });
      });
    };

    const handleContextMenu = (e) => {
      // Prevent default right-click menu when rotating
      if (isRotatingRef.current) {
        e.originalEvent.preventDefault();
      }
    };

    // Enable right-click context menu prevention
    map.getContainer().addEventListener('contextmenu', handleContextMenu);
    
    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);
    map.on('mouseleave', handleMouseUp); // Stop rotation if mouse leaves map

    return () => {
      map.getContainer().removeEventListener('contextmenu', handleContextMenu);
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
      map.off('mouseleave', handleMouseUp);
      map.dragging.enable();
      map.getContainer().style.cursor = '';
    };
  }, [map, rotation, onRotationChange]);

  // Update rotation when prop changes
  useEffect(() => {
    if (rotation !== undefined && !isRotatingRef.current) {
      const mapSize = map.getSize();
      const centerX = mapSize.x / 2;
      const centerY = mapSize.y / 2;
      
      applyRotation(rotation);
      
      const tilePane = map.getPane('tilePane');
      const overlayPane = map.getPane('overlayPane');
      const markerPane = map.getPane('markerPane');
      const shadowPane = map.getPane('shadowPane');
      
      if (tilePane) {
        tilePane.style.transition = 'transform 0.3s ease';
        tilePane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (overlayPane) {
        overlayPane.style.transition = 'transform 0.3s ease';
        overlayPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (markerPane) {
        markerPane.style.transition = 'transform 0.3s ease';
        markerPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
      if (shadowPane) {
        shadowPane.style.transition = 'transform 0.3s ease';
        shadowPane.style.transformOrigin = `${centerX}px ${centerY}px`;
      }
    }
  }, [rotation, map]);

  return null;
}

