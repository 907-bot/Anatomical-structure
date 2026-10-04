import React, { useState } from 'react';
import {
  GraduationCap,
  X,
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import {
  MBBS_VIVA_CARDS,
  DISSECTION_STAGES,
  type DissectionStage,
} from '../data/mbbsData';

export const MbbsHubModal: React.FC = () => {
  const {
    isMbbsHubOpen,
    setIsMbbsHubOpen,
    selectStructure,
    openOrganDetail,
    applyDissectionStage,
  } = useAnatomyStore();

  const [activeTab, setActiveTab] = useState<'viva' | 'dissection' | 'spotter'>('viva');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [activeStageId, setActiveStageId] = useState<string>('stage-surface');

  if (!isMbbsHubOpen) return null;

  const subjects = [
    'All',
    'Neuroanatomy',
    'Thorax & Cardiovascular',
    'Abdomen & Pelvis',
    'Osteology & Spine',
    'Locomotor & Limbs',
  ];

  const filteredCards = MBBS_VIVA_CARDS.filter((card) => {
    const matchesSubject = selectedSubject === 'All' || card.subject === selectedSubject;
    const matchesSearch =
      card.structureName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      card.vivaQuestion.toLowerCase().includes(searchFilter.toLowerCase()) ||
      card.clinicalCorrelation.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (card.mnemonic && card.mnemonic.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const toggleAnswer = (cardId: string) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleInspectIn3D = (structureId: string) => {
    selectStructure(structureId);
    openOrganDetail(structureId);
    setIsMbbsHubOpen(false);
  };

  const handleApplyStage = (stage: DissectionStage) => {
    setActiveStageId(stage.id);
    applyDissectionStage(stage);
  };

  return (
    <div
      id="mbbs-hub-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={() => setIsMbbsHubOpen(false)}
    >
      <div
        id="mbbs-hub-modal"
        className="glass-panel"
        style={{
          width: '920px',
          maxWidth: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 240, 255, 0.25)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          overflow: 'hidden',
          background: 'rgba(8, 14, 28, 0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0, 240, 255, 0.45)',
              }}
            >
              <GraduationCap size={20} color="#060913" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                  MBBS Clinical Anatomy Study Hub
                </h2>
                <span
                  style={{
                    fontSize: '0.66rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-emerald)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  1st Prof High-Yield
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Gross anatomy viva questions, high-yield clinical correlations & Cunningham’s dissection planes
              </p>
            </div>
          </div>

          <button
            id="btn-close-mbbs-hub"
            className="btn-icon"
            onClick={() => setIsMbbsHubOpen(false)}
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(6, 9, 19, 0.6)',
            padding: '0 20px',
            gap: '8px',
          }}
        >
          <button
            id="tab-mbbs-viva"
            onClick={() => setActiveTab('viva')}
            style={{
              padding: '12px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: activeTab === 'viva' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'viva' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <BookOpen size={15} />
            <span>Viva Voce Cards & Pearls ({MBBS_VIVA_CARDS.length})</span>
          </button>

          <button
            id="tab-mbbs-dissection"
            onClick={() => setActiveTab('dissection')}
            style={{
              padding: '12px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: activeTab === 'dissection' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'dissection' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={15} />
            <span>Cunningham’s Dissection Stages ({DISSECTION_STAGES.length})</span>
          </button>
        </div>

        {/* Tab 1: VIVA VOCE CARDS */}
        {activeTab === 'viva' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Filters Row */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {/* Subject Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1 }}>
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    id={`filter-subject-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedSubject === sub ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      background: selectedSubject === sub ? 'rgba(0, 240, 255, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      color: selectedSubject === sub ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontWeight: selectedSubject === sub ? 600 : 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search question, mnemonic, trauma..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: 'var(--text-primary)',
                  width: '220px',
                }}
              />
            </div>

            {/* Cards List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredCards.map((card) => {
                const isRevealed = revealedAnswers[card.id] ?? false;

                return (
                  <div
                    key={card.id}
                    id={`viva-card-${card.id}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    {/* Card Top Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background:
                              card.examImportance === 'Golden Viva Point'
                                ? 'rgba(234, 179, 8, 0.18)'
                                : 'rgba(56, 189, 248, 0.18)',
                            color: card.examImportance === 'Golden Viva Point' ? '#facc15' : '#38bdf8',
                            border: `1px solid ${
                              card.examImportance === 'Golden Viva Point' ? 'rgba(234, 179, 8, 0.35)' : 'rgba(56, 189, 248, 0.35)'
                            }`,
                          }}
                        >
                          {card.examImportance}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {card.subject} • {card.structureName}
                        </span>
                      </div>

                      <button
                        onClick={() => handleInspectIn3D(card.structureId)}
                        style={{
                          background: 'rgba(0, 240, 255, 0.12)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: 'var(--accent-cyan)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>Locate in 3D</span>
                      </button>
                    </div>

                    {/* Question */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(244, 63, 94, 0.2)',
                          color: '#f43f5e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        Q
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {card.vivaQuestion}
                      </div>
                    </div>

                    {/* Reveal Answer Toggle */}
                    <div>
                      <button
                        onClick={() => toggleAnswer(card.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-cyan)',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <HelpCircle size={13} />
                        <span>{isRevealed ? 'Hide Model Answer' : 'Reveal Model Answer & Key Points'}</span>
                      </button>
                    </div>

                    {/* Revealed Answer Box */}
                    {isRevealed && (
                      <div
                        style={{
                          background: 'rgba(15, 23, 42, 0.65)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          border: '1px solid rgba(0, 240, 255, 0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          fontSize: '0.76rem',
                          lineHeight: 1.5,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>Model Answer: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{card.vivaAnswer}</span>
                        </div>

                        {card.keyPoints && card.keyPoints.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              ESSENTIAL VIVA POINTS:
                            </span>
                            {card.keyPoints.map((pt, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <CheckCircle2 size={12} color="var(--accent-cyan)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{pt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {card.mnemonic && (
                          <div
                            style={{
                              background: 'rgba(234, 179, 8, 0.08)',
                              border: '1px solid rgba(234, 179, 8, 0.25)',
                              borderRadius: '6px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: '#facc15',
                              fontSize: '0.72rem',
                            }}
                          >
                            <Bookmark size={14} />
                            <span>
                              <strong>Mnemonic: </strong> {card.mnemonic}
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            background: 'rgba(244, 63, 94, 0.08)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#fda4af',
                            fontSize: '0.72rem',
                          }}
                        >
                          <strong>Clinical Pathology & Trauma: </strong>
                          {card.clinicalCorrelation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: CUNNINGHAM'S DISSECTION STAGES */}
        {activeTab === 'dissection' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Follow the classical Cunningham’s manual gross anatomy sequence. Select any dissection plane to automatically set layer visibilities and opacities in 3D:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {DISSECTION_STAGES.map((stage) => {
                const isActive = activeStageId === stage.id;

                return (
                  <div
                    key={stage.id}
                    id={`dissection-stage-${stage.id}`}
                    onClick={() => handleApplyStage(stage)}
                    style={{
                      background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                      border: isActive ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        {stage.name}
                      </span>
                      {isActive && <CheckCircle2 size={16} color="var(--accent-cyan)" />}
                    </div>

                    <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      {stage.latinStage}
                    </div>

                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      {stage.description}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyStage(stage);
                        setIsMbbsHubOpen(false);
                      }}
                      style={{
                        marginTop: '4px',
                        background: isActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#060913' : 'var(--text-primary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{isActive ? 'Active Stage (Inspect)' : 'Dissect to this Layer'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
