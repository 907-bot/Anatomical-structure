import React from 'react';
import {
  Info,
  Crosshair,
  Shield,
  Activity,
  GitBranch,
  AlertTriangle,
  ChevronRight,
  GraduationCap,
  Bookmark,
} from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { ANATOMICAL_STRUCTURES } from '../data/anatomyData';
import { SYSTEMS_DATA } from '../data/systemsData';
import { MBBS_VIVA_CARDS } from '../data/mbbsData';

export const RightSidebar: React.FC = () => {
  const {
    selectedStructureId,
    selectStructure,
    isIsolatedMode,
    setIsIsolatedMode,
    openOrganDetail,
  } = useAnatomyStore();

  const currentStruct = ANATOMICAL_STRUCTURES.find((s) => s.id === selectedStructureId);
  const currentSystem = currentStruct
    ? SYSTEMS_DATA.find((sys) => sys.id === currentStruct.system)
    : null;

  const mbbsCard = currentStruct
    ? MBBS_VIVA_CARDS.find((c) => c.structureId === currentStruct.id)
    : null;

  // Find related structures (e.g. sharing parent or in articulatesWith)
  const relatedStructures = currentStruct
    ? ANATOMICAL_STRUCTURES.filter(
        (s) =>
          s.id !== currentStruct.id &&
          (s.parent === currentStruct.parent ||
            s.category === currentStruct.category ||
            currentStruct.articulatesWith?.some((rel) =>
              rel.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])
            ))
      ).slice(0, 4)
    : [];

  return (
    <aside
      id="right-sidebar"
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '80px',
        bottom: '80px',
        right: '16px',
        width: '340px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(6, 9, 19, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em' }}>
            ANATOMICAL INSPECTOR
          </span>
        </div>
        {currentStruct && (
          <span className="fma-badge">{currentStruct.fmaId}</span>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {currentStruct ? (
          <>
            {/* Structure Identification Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: currentSystem?.color || 'var(--accent-cyan)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.66rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: `${currentSystem?.color}22`,
                    color: currentSystem?.color,
                    fontWeight: 600,
                  }}
                >
                  {currentSystem?.name}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {currentStruct.category}
                </span>
              </div>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                {currentStruct.name}
              </h2>

              <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--accent-cyan)' }}>
                {currentStruct.latinName}
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  id="btn-focus-structure"
                  className="btn-glow"
                  onClick={() => selectStructure(currentStruct.id)}
                  style={{ flex: 1, justifyContent: 'center' }}
                  title="Center and zoom camera onto structure"
                >
                  <Crosshair size={13} />
                  <span>Focus</span>
                </button>

                <button
                  id="btn-isolate-structure"
                  className={`btn-glow ${isIsolatedMode ? 'glass-panel-active' : ''}`}
                  onClick={() => setIsIsolatedMode(!isIsolatedMode)}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: isIsolatedMode ? 'rgba(0, 240, 255, 0.3)' : undefined,
                  }}
                  title="Dim all non-selected structures"
                >
                  <Shield size={13} />
                  <span>{isIsolatedMode ? 'Isolated' : 'Isolate'}</span>
                </button>
              </div>

              <button
                id="btn-open-organ-page"
                className="btn-glow"
                onClick={() => openOrganDetail(currentStruct.id)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  justifyContent: 'center',
                  background: 'rgba(56, 189, 248, 0.2)',
                  borderColor: '#38bdf8',
                  color: '#38bdf8',
                  fontWeight: 700,
                  padding: '8px 12px',
                }}
                title="Open this organ in its dedicated 3D center stage page with all medical info"
              >
                <span>🔍 Open in Dedicated 3D Page →</span>
              </button>
            </div>

            {/* Physiological & Mechanical Role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Activity size={14} color="var(--accent-emerald)" />
                <span>PHYSIOLOGICAL & BIOMECHANICAL FUNCTION</span>
              </div>
              <p
                style={{
                  fontSize: '0.76rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                {currentStruct.function}
              </p>
            </div>

            {/* Anatomical Relationships & Articulations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <GitBranch size={14} color="var(--accent-sky)" />
                <span>RELATIONS & ARTICULATIONS</span>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.74rem',
                }}
              >
                {currentStruct.articulatesWith && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Articulates with: </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {currentStruct.articulatesWith.join(', ')}
                    </span>
                  </div>
                )}
                {currentStruct.innervation && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Innervation: </span>
                    <span style={{ color: '#facc15' }}>{currentStruct.innervation}</span>
                  </div>
                )}
                {currentStruct.bloodSupply && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Blood Supply: </span>
                    <span style={{ color: '#f43f5e' }}>{currentStruct.bloodSupply}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Anatomical Part of: </span>
                  <span style={{ color: 'var(--accent-cyan)' }}>
                    {currentStruct.partOf.join(' → ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Pathology & Surgical Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
                <AlertTriangle size={14} />
                <span>CLINICAL PATHOLOGY & TRAUMA</span>
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  lineHeight: 1.5,
                  color: '#cbd5e1',
                  background: 'rgba(245, 158, 11, 0.06)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                {currentStruct.clinicalNotes}
              </div>
            </div>

            {/* MBBS 1st Prof Viva Voce & High-Yield Section */}
            {mbbsCard && (
              <div
                style={{
                  background: 'rgba(0, 240, 255, 0.04)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={15} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                      MBBS VIVA VOCE PEARL
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(234, 179, 8, 0.18)',
                      color: '#facc15',
                      border: '1px solid rgba(234, 179, 8, 0.35)',
                    }}
                  >
                    {mbbsCard.examImportance}
                  </span>
                </div>

                <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  <strong>Q: </strong>{mbbsCard.vivaQuestion}
                </div>

                <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--accent-emerald)' }}>Ans: </strong>
                  {mbbsCard.vivaAnswer}
                </div>

                {mbbsCard.mnemonic && (
                  <div
                    style={{
                      background: 'rgba(234, 179, 8, 0.08)',
                      border: '1px solid rgba(234, 179, 8, 0.25)',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.7rem',
                      color: '#facc15',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Bookmark size={12} />
                    <span><strong>Mnemonic: </strong>{mbbsCard.mnemonic}</span>
                  </div>
                )}
              </div>
            )}

            {/* Neighboring & Related Structures */}
            {relatedStructures.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  RELATED ANATOMICAL STRUCTURES
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {relatedStructures.map((rel) => (
                    <button
                      key={rel.id}
                      id={`btn-rel-${rel.id}`}
                      onClick={() => selectStructure(rel.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        transition: 'all 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                      }}
                    >
                      <span>{rel.name}</span>
                      <ChevronRight size={13} color="var(--accent-cyan)" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State: Overview Instructions */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              gap: '14px',
              padding: '20px',
              color: 'var(--text-muted)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Crosshair size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Select Any Anatomical Structure
              </div>
              <p style={{ fontSize: '0.74rem', lineHeight: 1.5 }}>
                Click directly on any bone, organ, or muscle in the 3D viewport, or search with{' '}
                <span className="fma-badge">/</span> to inspect FMA ontology, physiological functions, and clinical pathology.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
