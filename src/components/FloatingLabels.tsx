import React from 'react';
import { useAnatomyStore } from '../store/useAnatomyStore';

interface ProjectedPin {
  id: string;
  name: string;
  fmaId: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

interface FloatingLabelsProps {
  pins: ProjectedPin[];
}

export const FloatingLabels: React.FC<FloatingLabelsProps> = ({ pins }) => {
  const { showLabels, selectedStructureId, selectStructure } = useAnatomyStore();

  if (!showLabels) return null;

  // Filter to avoid label clutter: prioritize selected structure or key landmarks
  const keyLandmarkIds = [
    'fma-5018', // Cranium
    'fma-9960', // C1
    'fma-9966', // C7
    'fma-7101', // Heart
    'fma-7339', // Right lung
    'fma-7197', // Liver
    'fma-9611-l', // Femur Left
    'fma-24485-l', // Patella
  ];

  const displayPins = pins.filter((p) => {
    if (!p.visible) return false;
    if (selectedStructureId && p.id === selectedStructureId) return true;
    return keyLandmarkIds.includes(p.id);
  });

  return (
    <div
      id="floating-labels-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 15,
      }}
    >
      {displayPins.map((pin) => {
        const isSelected = selectedStructureId === pin.id;

        return (
          <div
            key={pin.id}
            id={`pin-${pin.id}`}
            className="anatomy-pin"
            style={{
              left: `${pin.screenX}px`,
              top: `${pin.screenY}px`,
              opacity: isSelected ? 1 : 0.82,
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectStructure(pin.id);
            }}
          >
            <div
              className="pin-bubble"
              style={{
                borderColor: isSelected ? 'var(--accent-cyan)' : 'rgba(56, 189, 248, 0.35)',
                background: isSelected ? 'rgba(6, 10, 22, 0.95)' : 'rgba(6, 10, 22, 0.8)',
                boxShadow: isSelected ? '0 0 14px var(--accent-cyan-glow)' : undefined,
              }}
            >
              <span>{pin.name}</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                }}
              >
                {pin.fmaId.replace('FMA:', '')}
              </span>
            </div>
            <div className="pin-line" />
            <div className="pin-dot" />
          </div>
        );
      })}
    </div>
  );
};
