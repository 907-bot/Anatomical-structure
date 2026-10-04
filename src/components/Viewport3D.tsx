import React, { useEffect, useRef, useState } from 'react';
import { AnatomyEngine } from '../three/AnatomyEngine';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { FloatingLabels } from './FloatingLabels';
import { StressTestModal } from './StressTestModal';
import { GUIDED_TOURS } from '../data/toursData';

interface ProjectedPin {
  id: string;
  name: string;
  fmaId: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const Viewport3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AnatomyEngine | null>(null);
  const [projectedPins, setProjectedPins] = useState<ProjectedPin[]>([]);

  const {
    selectedStructureId,
    hoveredStructureId,
    visibleSystems,
    systemOpacities,
    isXRayMode,
    isIsolatedMode,
    explodedValue,
    clippingAxis,
    clippingPosition,
    viewPreset,
    activeTourId,
    currentTourStepIndex,
    pageMode,
  } = useAnatomyStore();

  // 1. Initialize Anatomy Engine once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new AnatomyEngine(mountRef.current, {
      onSelect: (id) => {
        const store = useAnatomyStore.getState();
        store.selectStructure(id);
        if (id) {
          store.openOrganDetail(id);
        }
      },
      onHover: (id) => {
        useAnatomyStore.getState().hoverStructure(id);
      },
      onTelemetry: (data) => {
        useAnatomyStore.getState().updateTelemetry(data);
      },
    });

    engineRef.current = engine;

    // Periodically update 2D label projections
    const labelInterval = setInterval(() => {
      if (engineRef.current) {
        const pins = engineRef.current.getScreenProjectedAnchors();
        setProjectedPins(pins);
      }
    }, 90);

    return () => {
      clearInterval(labelInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Ensure canvas dimensions & projections are synchronized when returning to atlas mode
  useEffect(() => {
    if (pageMode === 'atlas' && engineRef.current) {
      requestAnimationFrame(() => {
        engineRef.current?.resize();
      });
    }
  }, [pageMode]);

  // 2. Sync visual state on store changes
  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.updateVisualState({
      selectedId: selectedStructureId,
      hoveredId: hoveredStructureId,
      visibleSystems,
      systemOpacities,
      isXRayMode,
      isIsolatedMode,
      explodedValue,
    });
  }, [
    selectedStructureId,
    hoveredStructureId,
    visibleSystems,
    systemOpacities,
    isXRayMode,
    isIsolatedMode,
    explodedValue,
  ]);

  // 3. Smooth Camera Focus on structure selection
  useEffect(() => {
    if (engineRef.current && selectedStructureId) {
      engineRef.current.focusStructure(selectedStructureId);
    }
  }, [selectedStructureId]);

  // 4. View Presets change
  useEffect(() => {
    if (engineRef.current && viewPreset) {
      engineRef.current.setViewPreset(viewPreset);
    }
  }, [viewPreset]);

  // 5. Cross-Section Clipping changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setClipping(clippingAxis, clippingPosition);
    }
  }, [clippingAxis, clippingPosition]);

  // 6. Tour Step transitions
  useEffect(() => {
    if (activeTourId && engineRef.current) {
      const tour = GUIDED_TOURS.find((t) => t.id === activeTourId);
      if (tour && tour.steps[currentTourStepIndex]) {
        const step = tour.steps[currentTourStepIndex];
        engineRef.current.focusStructure(step.structureId);
      }
    }
  }, [activeTourId, currentTourStepIndex]);

  const handleRunStressTest = async (): Promise<number> => {
    if (!engineRef.current) return 95;
    return await engineRef.current.runStressTest();
  };

  return (
    <div
      id="viewport-3d-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        id="canvas-3d-container"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Floating 3D Pins & Labels */}
      <FloatingLabels pins={projectedPins} />

      {/* Cinematic Smooth Zoom & Reset Controls */}
      <div
        id="smooth-zoom-controls"
        style={{
          position: 'absolute',
          bottom: '96px',
          right: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 15,
        }}
      >
        <button
          onClick={() => engineRef.current?.zoomIn()}
          title="Smooth Zoom In (+)"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          +
        </button>
        <button
          onClick={() => engineRef.current?.zoomOut()}
          title="Smooth Zoom Out (-)"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00f0ff';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          −
        </button>
        <button
          onClick={() => engineRef.current?.resetView()}
          title="Reset Whole Body View (⟲)"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            color: '#94a3b8',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00f0ff';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ⟲
        </button>
      </div>

      {/* Diagnostics & Stress Benchmark Modal */}
      <StressTestModal onRunEngineStressTest={handleRunStressTest} />
    </div>
  );
};
