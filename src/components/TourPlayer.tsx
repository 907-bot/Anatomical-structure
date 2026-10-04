import React from 'react';
import { Compass, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { GUIDED_TOURS } from '../data/toursData';

export const TourPlayer: React.FC = () => {
  const {
    activeTourId,
    currentTourStepIndex,
    nextTourStep,
    prevTourStep,
    stopTour,
  } = useAnatomyStore();

  if (!activeTourId) return null;

  const tour = GUIDED_TOURS.find((t) => t.id === activeTourId);
  if (!tour) return null;

  const currentStep = tour.steps[currentTourStepIndex];
  if (!currentStep) return null;

  return (
    <div
      id="tour-player-hud"
      className="glass-panel glass-panel-active"
      style={{
        position: 'absolute',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '480px',
        maxWidth: '90vw',
        zIndex: 40,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {tour.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Step {currentTourStepIndex + 1} of {tour.steps.length}
          </span>
          <button
            id="btn-exit-tour"
            onClick={stopTour}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {currentStep.title}
        </h3>
        <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45 }}>
          {currentStep.description}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <button
          id="btn-prev-tour-step"
          onClick={prevTourStep}
          disabled={currentTourStepIndex === 0}
          className="btn-glow"
          style={{ opacity: currentTourStepIndex === 0 ? 0.4 : 1, padding: '4px 10px' }}
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <button
          id="btn-next-tour-step"
          onClick={nextTourStep}
          disabled={currentTourStepIndex === tour.steps.length - 1}
          className="btn-glow"
          style={{ opacity: currentTourStepIndex === tour.steps.length - 1 ? 0.4 : 1, padding: '4px 10px' }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
