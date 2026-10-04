import React, { useState } from 'react';
import {
  RotateCcw,
  Shield,
  Ghost,
  Scissors,
  Tag,
  Sparkles,
  User,
} from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { ClippingAxis } from '../types/anatomy';

export const BottomDock: React.FC = () => {
  const {
    isXRayMode,
    setXRayMode,
    isIsolatedMode,
    setIsIsolatedMode,
    explodedValue,
    setExplodedValue,
    clippingAxis,
    setClippingAxis,
    clippingPosition,
    setClippingPosition,
    showLabels,
    setShowLabels,
    setViewPreset,
    visibleSystems,
    setSystemVisible,
    systemOpacities,
    setSystemOpacity,
    telemetry,
  } = useAnatomyStore();

  const [isExplodeSliderOpen, setIsExplodeSliderOpen] = useState(false);
  const [isClipPanelOpen, setIsClipPanelOpen] = useState(false);
  const [isFleshPanelOpen, setIsFleshPanelOpen] = useState(false);

  const isFleshVisible = visibleSystems['integumentary'] ?? true;
  const fleshOpacity = isFleshVisible ? (systemOpacities['integumentary'] ?? 0.45) : 0;

  const clippingModes: { id: ClippingAxis; label: string }[] = [
    { id: 'none', label: 'Off' },
    { id: 'sagittal', label: 'Sagittal (X)' },
    { id: 'transverse', label: 'Transverse (Y)' },
    { id: 'coronal', label: 'Coronal (Z)' },
  ];

  return (
    <div
      id="bottom-dock-container"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Popover Slider: Exploded View */}
      {isExplodeSliderOpen && (
        <div
          className="glass-panel"
          style={{
            padding: '10px 16px',
            width: '260px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>Exploded View Disassembly</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {Math.round(explodedValue * 100)}%
            </span>
          </div>
          <input
            type="range"
            id="slider-exploded-view"
            min="0"
            max="1"
            step="0.02"
            value={explodedValue}
            onChange={(e) => setExplodedValue(parseFloat(e.target.value))}
          />
        </div>
      )}

      {/* Popover Slider: Cross-Section Clipping */}
      {isClipPanelOpen && (
        <div
          className="glass-panel"
          style={{
            padding: '12px 16px',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>Anatomical Cross-Section Plane</span>
            <span style={{ color: 'var(--accent-cyan)', textTransform: 'capitalize' }}>{clippingAxis}</span>
          </div>

          {/* Axis Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {clippingModes.map((m) => (
              <button
                key={m.id}
                id={`clip-axis-${m.id}`}
                onClick={() => setClippingAxis(m.id)}
                style={{
                  flex: 1,
                  padding: '4px',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  border: clippingAxis === m.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: clippingAxis === m.id ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: clippingAxis === m.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: clippingAxis === m.id ? 600 : 400,
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {clippingAxis !== 'none' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                <span>Cut Position</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{clippingPosition.toFixed(2)}</span>
              </div>
              <input
                type="range"
                id="slider-clipping-pos"
                min="-1"
                max="1"
                step="0.02"
                value={clippingPosition}
                onChange={(e) => setClippingPosition(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>
      )}

      {/* Popover Slider: Human Flesh Peel */}
      {isFleshPanelOpen && (
        <div
          className="glass-panel"
          style={{
            padding: '12px 16px',
            width: '290px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>Human Flesh Peel (Dermis / Cutis)</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {Math.round(fleshOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            id="slider-flesh-opacity"
            min="0"
            max="1"
            step="0.02"
            value={fleshOpacity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val <= 0.02) {
                setSystemVisible('integumentary', false);
                setSystemOpacity('integumentary', 0);
              } else {
                setSystemVisible('integumentary', true);
                setSystemOpacity('integumentary', val);
              }
            }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
            <button
              id="btn-flesh-preset-0"
              onClick={() => {
                setSystemVisible('integumentary', false);
                setSystemOpacity('integumentary', 0);
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '0.66rem',
                borderRadius: '4px',
                cursor: 'pointer',
                background: fleshOpacity <= 0.05 ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: fleshOpacity <= 0.05 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: fleshOpacity <= 0.05 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              Skeleton Core
            </button>
            <button
              id="btn-flesh-preset-45"
              onClick={() => {
                setSystemVisible('integumentary', true);
                setSystemOpacity('integumentary', 0.45);
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '0.66rem',
                borderRadius: '4px',
                cursor: 'pointer',
                background: fleshOpacity > 0.2 && fleshOpacity < 0.8 ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: fleshOpacity > 0.2 && fleshOpacity < 0.8 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: fleshOpacity > 0.2 && fleshOpacity < 0.8 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              Flesh Veil (45%)
            </button>
            <button
              id="btn-flesh-preset-100"
              onClick={() => {
                setSystemVisible('integumentary', true);
                setSystemOpacity('integumentary', 1.0);
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '0.66rem',
                borderRadius: '4px',
                cursor: 'pointer',
                background: fleshOpacity >= 0.8 ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: fleshOpacity >= 0.8 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: fleshOpacity >= 0.8 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              Full Skin
            </button>
          </div>
        </div>
      )}

      {/* Main HUD Bar */}
      <div
        id="medical-hud-dock"
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
        }}
      >
        {/* Reset Camera */}
        <button
          id="btn-reset-view"
          className="btn-icon"
          onClick={() => setViewPreset('anterior')}
          title="Reset Camera & Center Body"
        >
          <RotateCcw size={16} />
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

        {/* Human Flesh Peel Toggle */}
        <button
          id="btn-toggle-flesh-peel"
          className={`btn-icon ${isFleshPanelOpen || fleshOpacity > 0 ? 'active' : ''}`}
          onClick={() => setIsFleshPanelOpen(!isFleshPanelOpen)}
          title="Human Flesh & Skin Peel Controls (adjust dermal transparency)"
        >
          <User size={16} />
        </button>

        {/* Isolate Mode */}
        <button
          id="btn-toggle-isolate"
          className={`btn-icon ${isIsolatedMode ? 'active' : ''}`}
          onClick={() => setIsIsolatedMode(!isIsolatedMode)}
          title={isIsolatedMode ? 'Disable Isolate Mode' : 'Enable Isolate Mode (focuses selected structure)'}
        >
          <Shield size={16} />
        </button>

        {/* X-Ray Mode */}
        <button
          id="btn-toggle-xray"
          className={`btn-icon ${isXRayMode ? 'active' : ''}`}
          onClick={() => setXRayMode(!isXRayMode)}
          title={isXRayMode ? 'Disable X-Ray Mode' : 'Enable Translucent Holographic X-Ray'}
        >
          <Ghost size={16} />
        </button>

        {/* Exploded View Toggle */}
        <button
          id="btn-toggle-explode"
          className={`btn-icon ${isExplodeSliderOpen || explodedValue > 0 ? 'active' : ''}`}
          onClick={() => setIsExplodeSliderOpen(!isExplodeSliderOpen)}
          title="Exploded Anatomical Disassembly"
        >
          <Sparkles size={16} />
        </button>

        {/* Cross-Section Cutting Tool */}
        <button
          id="btn-toggle-clipping"
          className={`btn-icon ${isClipPanelOpen || clippingAxis !== 'none' ? 'active' : ''}`}
          onClick={() => setIsClipPanelOpen(!isClipPanelOpen)}
          title="Anatomical Cross-Section Slicing"
        >
          <Scissors size={16} />
        </button>

        {/* 3D Labels Toggle */}
        <button
          id="btn-toggle-labels"
          className={`btn-icon ${showLabels ? 'active' : ''}`}
          onClick={() => setShowLabels(!showLabels)}
          title={showLabels ? 'Hide 3D Floating Labels' : 'Show 3D Floating Labels'}
        >
          <Tag size={16} />
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

        {/* Mini Performance Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '2px 8px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: telemetry.fps >= 50 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: telemetry.fps >= 50 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              boxShadow: `0 0 6px ${telemetry.fps >= 50 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
            }}
          />
          <span>{telemetry.fps} FPS</span>
        </div>
      </div>
    </div>
  );
};
