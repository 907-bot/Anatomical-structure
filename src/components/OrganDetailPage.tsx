import React, { useState, useEffect } from 'react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { ANATOMICAL_STRUCTURES } from '../data/anatomyData';
import { SYSTEMS_DATA } from '../data/systemsData';
import { OrganViewport3D } from './OrganViewport3D';
import { MBBS_VIVA_CARDS } from '../data/mbbsData';

export const OrganDetailPage: React.FC = () => {
  const { selectedStructureId, closeOrganDetail, openOrganDetail } = useAnatomyStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'neurovascular' | 'physiology' | 'mbbs' | 'network'>('overview');

  const currentIndex = ANATOMICAL_STRUCTURES.findIndex((s) => s.id === selectedStructureId);
  const structure = currentIndex !== -1 ? ANATOMICAL_STRUCTURES[currentIndex] : ANATOMICAL_STRUCTURES[0];
  const system = SYSTEMS_DATA.find((s) => s.id === structure.system);

  // Find associated viva card if present
  const vivaCard = MBBS_VIVA_CARDS.find((c) => c.structureId === structure.id);

  // Keyboard navigation: Escape to go back, ArrowLeft/Right to switch organs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOrganDetail();
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (currentIndex - 1 + ANATOMICAL_STRUCTURES.length) % ANATOMICAL_STRUCTURES.length;
        openOrganDetail(ANATOMICAL_STRUCTURES[prevIdx].id);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentIndex + 1) % ANATOMICAL_STRUCTURES.length;
        openOrganDetail(ANATOMICAL_STRUCTURES[nextIdx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, closeOrganDetail, openOrganDetail]);

  const handlePrevOrgan = () => {
    const prevIdx = (currentIndex - 1 + ANATOMICAL_STRUCTURES.length) % ANATOMICAL_STRUCTURES.length;
    openOrganDetail(ANATOMICAL_STRUCTURES[prevIdx].id);
  };

  const handleNextOrgan = () => {
    const nextIdx = (currentIndex + 1) % ANATOMICAL_STRUCTURES.length;
    openOrganDetail(ANATOMICAL_STRUCTURES[nextIdx].id);
  };

  const sameSystemStructures = ANATOMICAL_STRUCTURES.filter(
    (s) => s.system === structure.system && s.id !== structure.id
  );

  return (
    <div
      id="organ-detail-page"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#040711',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ========================================== */}
      {/* 1. TOP HEADER & WORKSPACE NAVIGATION */}
      {/* ========================================== */}
      <header
        style={{
          height: '64px',
          background: 'rgba(11, 19, 43, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 60,
          flexShrink: 0,
        }}
      >
        {/* Left: Return to Full Body Atlas Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={closeOrganDetail}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)';
              e.currentTarget.style.borderColor = '#00f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
            }}
          >
            <span style={{ fontSize: '16px' }}>←</span>
            <span>Back to Full Body Atlas</span>
            <kbd
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#94a3b8',
              }}
            >
              Esc
            </kbd>
          </button>

          {/* Breadcrumb Path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
            <span>Atlas</span>
            <span>/</span>
            <span style={{ color: system?.color || '#38bdf8', fontWeight: 600 }}>{system?.name}</span>
            <span>/</span>
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>{structure.name}</span>
          </div>
        </div>

        {/* Center: System Badge & Latin Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              background: `${system?.color || '#38bdf8'}22`,
              border: `1px solid ${system?.color || '#38bdf8'}55`,
              color: system?.color || '#38bdf8',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {system?.name}
          </span>
          <span
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '12px',
              fontStyle: 'italic',
            }}
          >
            {structure.latinName}
          </span>
          <span
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
          >
            {structure.fmaId}
          </span>
        </div>

        {/* Right: Prev / Next Structure Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevOrgan}
            title="Previous Organ (Arrow Left)"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>‹</span>
            <span>Prev</span>
          </button>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {currentIndex + 1} / {ANATOMICAL_STRUCTURES.length}
          </span>
          <button
            onClick={handleNextOrgan}
            title="Next Organ (Arrow Right)"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Next</span>
            <span>›</span>
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* 2. MAIN WORKSPACE: 3D CENTER STAGE + DOSSIER */}
      {/* ========================================== */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left/Center: 3D Viewport with Single Organ Centered */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <OrganViewport3D structureId={structure.id} structureName={structure.name} />
        </div>

        {/* Right: Rich Medical & Clinical Dossier */}
        <aside
          style={{
            width: '460px',
            height: '100%',
            background: 'rgba(10, 15, 30, 0.94)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          {/* Dossier Header */}
          <div
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Clinical & Anatomical Dossier
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Category: {structure.category}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              {structure.name}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>
              {structure.latinName}
            </p>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              padding: '8px 16px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              gap: '4px',
              background: 'rgba(15, 23, 42, 0.5)',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'overview', label: 'Anatomy' },
              { id: 'neurovascular', label: 'Vascular & Nerves' },
              { id: 'physiology', label: 'Physiology' },
              { id: 'mbbs', label: '🎓 MBBS Viva' },
              { id: 'network', label: 'System' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                  color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* TAB 1: OVERVIEW & MORPHOLOGY */}
            {activeTab === 'overview' && (
              <>
                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Anatomical Summary
                  </h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                    {structure.function}
                  </p>
                </section>

                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Hierarchical Membership
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {structure.partOf.map((part, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          color: '#e2e8f0',
                        }}
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                </section>

                {structure.articulatesWith && structure.articulatesWith.length > 0 && (
                  <section>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Articulations & Adjacent Landmarks
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {structure.articulatesWith.map((art, idx) => (
                        <li key={idx}>{art}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Clinical Synonyms
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {structure.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#94a3b8',
                        }}
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* TAB 2: NEUROVASCULAR & RELATIONS */}
            {activeTab === 'neurovascular' && (
              <>
                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Arterial Blood Supply & Venous Drainage
                  </h3>
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#fca5a5',
                    }}
                  >
                    {structure.bloodSupply || 'Supplied by regional vascular network and systemic capillaries.'}
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Nerve Innervation
                  </h3>
                  <div
                    style={{
                      background: 'rgba(234, 179, 8, 0.08)',
                      border: '1px solid rgba(234, 179, 8, 0.25)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#fde047',
                    }}
                  >
                    {structure.innervation || 'Somatic sensory/motor or autonomic autonomic vasomotor control.'}
                  </div>
                </section>

                {structure.mbbsData?.relations && (
                  <section>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Gray’s Anatomical Relations
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {structure.mbbsData.relations.anterior && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong style={{ color: '#38bdf8' }}>Anterior: </strong>
                          <span style={{ color: '#e2e8f0' }}>{structure.mbbsData.relations.anterior}</span>
                        </div>
                      )}
                      {structure.mbbsData.relations.posterior && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong style={{ color: '#38bdf8' }}>Posterior: </strong>
                          <span style={{ color: '#e2e8f0' }}>{structure.mbbsData.relations.posterior}</span>
                        </div>
                      )}
                      {structure.mbbsData.relations.superior && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong style={{ color: '#38bdf8' }}>Superior: </strong>
                          <span style={{ color: '#e2e8f0' }}>{structure.mbbsData.relations.superior}</span>
                        </div>
                      )}
                      {structure.mbbsData.relations.inferior && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong style={{ color: '#38bdf8' }}>Inferior: </strong>
                          <span style={{ color: '#e2e8f0' }}>{structure.mbbsData.relations.inferior}</span>
                        </div>
                      )}
                      {structure.mbbsData.relations.medial && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong style={{ color: '#38bdf8' }}>Medial: </strong>
                          <span style={{ color: '#e2e8f0' }}>{structure.mbbsData.relations.medial}</span>
                        </div>
                      )}
                      {structure.mbbsData.relations.lateral && (
                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                          <strong style={{ color: '#38bdf8' }}>Lateral: </strong>
                          <span style={{ color: '#e2e8f0' }}>{structure.mbbsData.relations.lateral}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* TAB 3: PHYSIOLOGY & FUNCTION */}
            {activeTab === 'physiology' && (
              <>
                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Physiological Function & Biomechanics
                  </h3>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '10px',
                      padding: '16px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#a7f3d0',
                    }}
                  >
                    {structure.function}
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Physiological Context in {system?.name}
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                    {system?.description}
                  </p>
                </section>
              </>
            )}

            {/* TAB 4: MBBS VIVA VOCE & CLINICAL PATHOLOGY */}
            {activeTab === 'mbbs' && (
              <>
                {vivaCard ? (
                  <div
                    style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          background: '#a855f7',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {vivaCard.examImportance}
                      </span>
                      <span style={{ fontSize: '11px', color: '#c084fc' }}>{vivaCard.subject}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                        University Viva Question:
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.5 }}>
                        "{vivaCard.vivaQuestion}"
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>
                        Model Viva Answer:
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6 }}>
                        {vivaCard.vivaAnswer}
                      </p>
                    </div>

                    {vivaCard.mnemonic && (
                      <div
                        style={{
                          background: 'rgba(234, 179, 8, 0.12)',
                          border: '1px dashed rgba(234, 179, 8, 0.4)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: '#fef08a',
                        }}
                      >
                        <strong>💡 Mnemonic: </strong> {vivaCard.mnemonic}
                      </div>
                    )}
                  </div>
                ) : structure.mbbsData ? (
                  <div
                    style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                      MBBS Viva Pearl:
                    </span>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#f8fafc', lineHeight: 1.6 }}>
                      {structure.mbbsData.vivaQuestion || structure.mbbsData.examPearl}
                    </p>
                  </div>
                ) : null}

                <section>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Clinical Pathology & Medical Complications
                  </h3>
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '10px',
                      padding: '14px',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: '#fef3c7',
                    }}
                  >
                    {structure.clinicalNotes}
                  </div>
                </section>
              </>
            )}

            {/* TAB 5: SAME-SYSTEM ORGAN NETWORK */}
            {activeTab === 'network' && (
              <section>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Related Structures in {system?.name} ({sameSystemStructures.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sameSystemStructures.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openOrganDetail(item.id)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                        e.currentTarget.style.borderColor = '#38bdf8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>{item.latinName}</div>
                      </div>
                      <span style={{ fontSize: '14px', color: '#38bdf8' }}>→</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
