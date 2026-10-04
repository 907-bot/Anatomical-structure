import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { ANATOMICAL_STRUCTURES } from '../data/anatomyData';
import { SYSTEMS_DATA } from '../data/systemsData';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, selectStructure, openOrganDetail } = useAnatomyStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setSelectedIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();
  const filtered = ANATOMICAL_STRUCTURES.filter((s) => {
    if (!normalizedQuery) return true;
    return (
      s.name.toLowerCase().includes(normalizedQuery) ||
      s.latinName.toLowerCase().includes(normalizedQuery) ||
      s.fmaId.toLowerCase().includes(normalizedQuery) ||
      s.category.toLowerCase().includes(normalizedQuery) ||
      s.system.toLowerCase().includes(normalizedQuery) ||
      s.synonyms.some((syn) => syn.toLowerCase().includes(normalizedQuery))
    );
  }).slice(0, 10);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      const targetId = filtered[selectedIndex].id;
      selectStructure(targetId);
      openOrganDetail(targetId);
      setIsSearchOpen(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
    }
  };

  return (
    <div
      id="search-modal-backdrop"
      onClick={() => setIsSearchOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(3, 6, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12px',
        paddingTop: 'calc(48px + var(--safe-top))',
        boxSizing: 'border-box',
      }}
    >
      <div
        id="search-dialog"
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(540px, calc(100vw - 24px))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.25)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <Search size={18} color="var(--accent-cyan)" />
          <input
            ref={inputRef}
            id="input-anatomy-search"
            type="text"
            placeholder="Search anatomy by name, Latin term, or FMA ID (e.g. Femur, C7, FMA:9611)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            id="btn-close-search"
            onClick={() => setIsSearchOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length > 0 ? (
            filtered.map((struct, idx) => {
              const isHighlighted = idx === selectedIndex;
              const sys = SYSTEMS_DATA.find((s) => s.id === struct.system);

              return (
                <div
                  key={struct.id}
                  id={`search-result-${struct.id}`}
                  onClick={() => {
                    selectStructure(struct.id);
                    openOrganDetail(struct.id);
                    setIsSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isHighlighted ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                    border: isHighlighted ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid transparent',
                    transition: 'all 0.1s ease',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: isHighlighted ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        {struct.name}
                      </span>
                      <span className="fma-badge">{struct.fmaId}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {struct.latinName} • {struct.category}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${sys?.color}22`,
                        color: sys?.color,
                        fontWeight: 600,
                      }}
                    >
                      {sys?.name.split(' ')[0]}
                    </span>
                    <ChevronRight size={14} color="var(--accent-cyan)" />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No anatomical structures matching "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(6, 10, 22, 0.6)',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Use ↑↓ to navigate • ↵ to select • ESC to dismiss</span>
          <span>FMA Ontological Index</span>
        </div>
      </div>
    </div>
  );
};
