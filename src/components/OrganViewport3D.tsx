import React, { useEffect, useRef, useState } from 'react';
import { OrganInspectionEngine } from '../three/OrganInspectionEngine';

interface OrganViewport3DProps {
  structureId: string;
  structureName: string;
}

export const OrganViewport3D: React.FC<OrganViewport3DProps> = ({
  structureId,
  structureName,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrganInspectionEngine | null>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isClippingActive, setIsClippingActive] = useState(false);
  const [clippingPosition, setClippingPosition] = useState(0);
  const [clippingAxis, setClippingAxis] = useState<'x' | 'y' | 'z'>('y');
  const [activePreset, setActivePreset] = useState<string>('anterior');

  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new OrganInspectionEngine(mountRef.current, structureId, {
      onAutoRotateChange: (rotating) => setIsAutoRotating(rotating),
      onWireframeChange: (wireframe) => setIsWireframe(wireframe),
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [structureId]);

  const handleZoomIn = () => engineRef.current?.zoomIn();
  const handleZoomOut = () => engineRef.current?.zoomOut();
  const handleResetCamera = () => {
    setActivePreset('anterior');
    engineRef.current?.resetCamera();
  };

  const handleToggleAutoRotate = () => {
    if (engineRef.current) {
      const next = engineRef.current.toggleAutoRotate();
      setIsAutoRotating(next);
    }
  };

  const handleToggleWireframe = () => {
    if (engineRef.current) {
      const next = engineRef.current.toggleWireframe();
      setIsWireframe(next);
    }
  };

  const handlePreset = (preset: 'anterior' | 'posterior' | 'lateral-left' | 'lateral-right' | 'superior' | 'inferior' | 'isometric') => {
    setActivePreset(preset);
    engineRef.current?.setViewPreset(preset);
  };

  const handleClippingChange = (pos: number) => {
    setClippingPosition(pos);
    if (engineRef.current) {
      engineRef.current.setClipping(isClippingActive ? clippingAxis : 'none', pos);
    }
  };

  const handleToggleClipping = () => {
    const next = !isClippingActive;
    setIsClippingActive(next);
    if (engineRef.current) {
      engineRef.current.setClipping(next ? clippingAxis : 'none', clippingPosition);
    }
  };

  const handleAxisChange = (axis: 'x' | 'y' | 'z') => {
    setClippingAxis(axis);
    if (engineRef.current && isClippingActive) {
      engineRef.current.setClipping(axis, clippingPosition);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 45%, #0b1329 0%, #050811 100%)',
        userSelect: 'none',
      }}
    >
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        id="organ-canvas-container"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          touchAction: 'none',
        }}
      />

      {/* Top Floating Badge (Hidden on mobile to avoid pill collisions) */}
      <div
        className="desktop-only"
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '9999px',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#e2e8f0',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.03em',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00f0ff',
            boxShadow: '0 0 8px #00f0ff',
          }}
        />
        <span>Isolated 3D Inspection Center</span>
        <span style={{ color: '#64748b' }}>•</span>
        <span style={{ color: '#38bdf8' }}>{structureName}</span>
      </div>

      {/* Camera Perspective Quick Pills (Top-Right) */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '3px',
          display: 'flex',
          gap: '3px',
          zIndex: 10,
          maxWidth: 'calc(100vw - 20px)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'anterior', label: 'Ant' },
          { id: 'posterior', label: 'Post' },
          { id: 'lateral-left', label: 'Left' },
          { id: 'lateral-right', label: 'Right' },
          { id: 'superior', label: 'Sup' },
          { id: 'isometric', label: '3D' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handlePreset(item.id as any)}
            style={{
              background: activePreset === item.id ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: activePreset === item.id ? '1px solid #38bdf8' : '1px solid transparent',
              color: activePreset === item.id ? '#38bdf8' : '#94a3b8',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Floating 3D Controls Bar (Bottom-Center) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          padding: '5px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 10,
          maxWidth: 'calc(100vw - 20px)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Ultra-Smooth Zoom In (+) */}
        <button
          onClick={handleZoomIn}
          title="Smooth Zoom In (+)"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
        >
          +
        </button>

        {/* Ultra-Smooth Zoom Out (-) */}
        <button
          onClick={handleZoomOut}
          title="Smooth Zoom Out (-)"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
        >
          −
        </button>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          title="Reset Camera Center"
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          ⟲
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* 360° Turntable Auto-Rotate Toggle */}
        <button
          onClick={handleToggleAutoRotate}
          title="360° Turntable Auto-Rotate"
          style={{
            background: isAutoRotating ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.7)',
            border: isAutoRotating ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
            color: isAutoRotating ? '#38bdf8' : '#94a3b8',
            padding: '0 12px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span>↺</span>
          <span>{isAutoRotating ? 'Rotating' : 'Turntable'}</span>
        </button>

        {/* Wireframe Toggle */}
        <button
          onClick={handleToggleWireframe}
          title="Wireframe Mesh Toggle"
          style={{
            background: isWireframe ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.7)',
            border: isWireframe ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
            color: isWireframe ? '#c084fc' : '#94a3b8',
            padding: '0 12px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span>⊞</span>
          <span>Wireframe</span>
        </button>

        {/* Cross-Section Slice Toggle */}
        <button
          onClick={handleToggleClipping}
          title="Cross-Section Anatomical Cut"
          style={{
            background: isClippingActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 41, 59, 0.7)',
            border: isClippingActive ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
            color: isClippingActive ? '#f87171' : '#94a3b8',
            padding: '0 12px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span>✂</span>
          <span>Cut</span>
        </button>
      </div>

      {/* Slicing Controls Popover (if active) */}
      {isClippingActive && (
        <div
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>Axis:</span>
          {(['x', 'y', 'z'] as const).map((ax) => (
            <button
              key={ax}
              onClick={() => handleAxisChange(ax)}
              style={{
                background: clippingAxis === ax ? '#ef4444' : 'rgba(30, 41, 59, 0.8)',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {ax === 'x' ? 'Sagittal (X)' : ax === 'y' ? 'Transverse (Y)' : 'Coronal (Z)'}
            </button>
          ))}
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={clippingPosition}
            onChange={(e) => handleClippingChange(parseFloat(e.target.value))}
            style={{
              width: '120px',
              accentColor: '#ef4444',
              cursor: 'pointer',
            }}
          />
        </div>
      )}

      {/* Interactive Helper Text (Desktop Only) */}
      <div
        className="desktop-only"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          color: 'rgba(148, 163, 184, 0.5)',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          pointerEvents: 'none',
        }}
      >
        <span>🖱 Left Click + Drag to rotate in 3D</span>
        <span>🔍 Scroll or use + / − buttons for smooth zoom</span>
        <span>✋ Right Click + Drag to pan</span>
      </div>
    </div>
  );
};
