import React, { useState, useEffect } from 'react';
import {
  Search,
  Activity,
  Compass,
  Maximize2,
  Minimize2,
  Cpu,
  GraduationCap,
  Layers,
  Info,
} from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import type { ViewPreset } from '../types/anatomy';
import { GUIDED_TOURS } from '../data/toursData';

export const Header: React.FC = () => {
  const {
    gender,
    setGender,
    viewPreset,
    setViewPreset,
    setIsSearchOpen,
    setIsStressTestOpen,
    setIsMbbsHubOpen,
    startTour,
    telemetry,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    isRightSidebarOpen,
    toggleRightSidebar,
    selectedStructureId,
  } = useAnatomyStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isToursDropdownOpen, setIsToursDropdownOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const presets: { id: ViewPreset; label: string }[] = [
    { id: 'anterior', label: 'Anterior' },
    { id: 'posterior', label: 'Posterior' },
    { id: 'lateral-left', label: 'Left Lat' },
    { id: 'lateral-right', label: 'Right Lat' },
    { id: 'spine-focus', label: 'Spine' },
    { id: 'cardiac-focus', label: 'Cardiac' },
  ];

  return (
    <header
      id="main-header"
      className="glass-panel"
      style={{
        height: '56px',
        margin: '10px 12px 0 12px',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
        position: 'relative',
        gap: '8px',
      }}
    >
      {/* Left: Sidebar Toggle + Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Toggle Systems & Hierarchy Tree Drawer */}
        <button
          id="btn-toggle-left-sidebar"
          className={`btn-icon ${isLeftSidebarOpen ? 'active' : ''}`}
          onClick={toggleLeftSidebar}
          title={isLeftSidebarOpen ? 'Hide Body Systems Panel' : 'Show Body Systems & Hierarchy'}
          style={{ width: '34px', height: '34px', flexShrink: 0 }}
        >
          <Layers size={17} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)',
              flexShrink: 0,
            }}
          >
            <Activity size={18} color="#060913" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.04em' }}>
                ANATOMA
              </span>
              <span
                className="desktop-only"
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                4.0
              </span>
            </div>
            <div className="desktop-only" style={{ fontSize: '0.66rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              FMA Ontological 3D Atlas
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search & Presets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {/* Search trigger button (Responsive: pill on desktop, compact icon/pill on mobile) */}
        <button
          id="btn-search-trigger"
          onClick={() => setIsSearchOpen(true)}
          className="btn-glow"
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '6px 10px',
            justifyContent: 'space-between',
            gap: '8px',
          }}
          title="Press / or click to search anatomical structures"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={15} color="var(--accent-cyan)" />
            <span className="desktop-only" style={{ fontSize: '0.78rem' }}>
              Search anatomy, FMA...
            </span>
            <span className="mobile-only" style={{ fontSize: '0.74rem' }}>
              Search
            </span>
          </div>
          <span
            className="desktop-only"
            style={{
              fontSize: '0.65rem',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            /
          </span>
        </button>

        {/* View Presets Selector (Desktop & Tablet landscape) */}
        <div
          className="desktop-only"
          style={{
            display: 'flex',
            background: 'rgba(11, 17, 32, 0.7)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            gap: '2px',
          }}
        >
          {presets.map((p) => (
            <button
              key={p.id}
              id={`preset-${p.id}`}
              onClick={() => setViewPreset(p.id)}
              style={{
                background: viewPreset === p.id ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                color: viewPreset === p.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: viewPreset === p.id ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: viewPreset === p.id ? 600 : 400,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Gender, MBBS Viva Hub, Tours, Telemetry, Fullscreen, Inspector Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Gender Toggle (Hidden on very narrow mobile, visible on desktop/laptop) */}
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            background: 'rgba(11, 17, 32, 0.7)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            id="btn-gender-male"
            onClick={() => setGender('male')}
            style={{
              background: gender === 'male' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: gender === 'male' ? '#38bdf8' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '5px',
              padding: '4px 7px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Male
          </button>
          <button
            id="btn-gender-female"
            onClick={() => setGender('female')}
            style={{
              background: gender === 'female' ? 'rgba(244, 63, 94, 0.25)' : 'transparent',
              color: gender === 'female' ? '#f43f5e' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '5px',
              padding: '4px 7px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Female
          </button>
        </div>

        {/* MBBS Study Hub Trigger Button */}
        <button
          id="btn-mbbs-hub"
          className="btn-glow"
          onClick={() => setIsMbbsHubOpen(true)}
          style={{
            fontSize: '0.72rem',
            padding: '5px 10px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.45)',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
          }}
          title="Open MBBS 1st Prof Clinical Anatomy Hub (Viva Cards & Cunningham Dissection Planes)"
        >
          <GraduationCap size={15} />
          <span className="desktop-only">MBBS Viva Hub</span>
          <span className="mobile-only">MBBS</span>
        </button>

        {/* Guided Tours Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="btn-guided-tours"
            className="btn-glow hide-on-mobile"
            onClick={() => setIsToursDropdownOpen(!isToursDropdownOpen)}
            style={{ fontSize: '0.72rem', padding: '5px 9px' }}
          >
            <Compass size={14} />
            <span>Tours</span>
          </button>

          {isToursDropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '260px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '4px 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Guided Clinical Tours
              </div>
              {GUIDED_TOURS.map((tour) => (
                <button
                  key={tour.id}
                  id={`tour-item-${tour.id}`}
                  onClick={() => {
                    startTour(tour.id);
                    setIsToursDropdownOpen(false);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    padding: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {tour.title}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {tour.subtitle}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry / Stress Test Button */}
        <button
          id="btn-stress-test"
          className="btn-icon hide-on-mobile"
          onClick={() => setIsStressTestOpen(true)}
          title={`Engine Telemetry: ${telemetry.fps} FPS, ${telemetry.drawCalls} calls`}
        >
          <Cpu size={16} />
        </button>

        {/* Fullscreen Button */}
        <button
          id="btn-fullscreen"
          className="btn-icon hide-on-mobile"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        {/* Toggle Right Inspector Drawer Button */}
        <button
          id="btn-toggle-right-sidebar"
          className={`btn-icon ${isRightSidebarOpen ? 'active' : ''}`}
          onClick={toggleRightSidebar}
          title={isRightSidebarOpen ? 'Hide Anatomy Inspector' : 'Show Anatomy Inspector'}
          style={{
            width: '34px',
            height: '34px',
            position: 'relative',
            borderColor: selectedStructureId ? 'var(--accent-cyan)' : undefined,
          }}
        >
          <Info size={17} />
          {selectedStructureId && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                boxShadow: '0 0 6px var(--accent-cyan)',
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
};
