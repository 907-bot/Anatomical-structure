import React, { useState, useEffect } from 'react';
import {
  Layers,
  Network,
  Eye,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import { useAnatomyStore } from '../store/useAnatomyStore';
import { SYSTEMS_DATA } from '../data/systemsData';
import { ANATOMICAL_HIERARCHY } from '../data/hierarchyData';
import type { HierarchyNode } from '../types/anatomy';

export const LeftSidebar: React.FC = () => {
  const {
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    leftSidebarTab,
    setLeftSidebarTab,
    visibleSystems,
    toggleSystem,
    systemOpacities,
    setSystemOpacity,
    soloSystem,
    showAllSystems,
    hideAllSystems,
    selectedStructureId,
    selectStructure,
    openOrganDetail,
  } = useAnatomyStore();

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root-body': true,
    'region-trunk': true,
    'grp-spine': true,
    'grp-cervical': true,
    'grp-thoracic-cage': true,
    'grp-cardiovascular': true,
  });

  if (!isLeftSidebarOpen) return null;

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleSelectStructure = (structureId: string) => {
    selectStructure(structureId);
    openOrganDetail(structureId);
    if (window.innerWidth < 768) {
      setIsLeftSidebarOpen(false);
    }
  };

  const renderHierarchyNode = (node: HierarchyNode, level: number = 0) => {
    const isExpanded = expandedNodes[node.id] ?? false;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.structureId && selectedStructureId === node.structureId;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          id={`tree-node-${node.id}`}
          onClick={() => {
            if (node.structureId) {
              handleSelectStructure(node.structureId);
            } else if (hasChildren) {
              toggleNode(node.id);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 8px',
            paddingLeft: `${level * 14 + 8}px`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            background: isSelected
              ? 'rgba(0, 240, 255, 0.18)'
              : 'transparent',
            border: isSelected
              ? '1px solid rgba(0, 240, 255, 0.45)'
              : '1px solid transparent',
            color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
            fontWeight: isSelected ? 600 : 400,
            transition: 'all 0.12s ease',
            minHeight: '34px',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                }}
              />
            </div>
          )}

          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.label}
          </span>

          {node.fmaId && (
            <span
              style={{
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-cyan)',
                opacity: 0.8,
              }}
            >
              {node.fmaId.replace('FMA:', '')}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {node.children!.map((child) => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isMobile && (
        <div
          className="drawer-backdrop"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      <aside
        id="left-sidebar"
        className={`glass-panel ${isMobile ? 'animate-slide-left' : ''}`}
        style={
          isMobile
            ? {
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: 'min(330px, 86vw)',
                zIndex: 55,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'rgba(8, 14, 28, 0.97)',
                boxShadow: '10px 0 40px rgba(0, 0, 0, 0.75)',
                paddingTop: 'var(--safe-top)',
                paddingBottom: 'var(--safe-bottom)',
              }
            : {
                position: 'absolute',
                top: '76px',
                bottom: '76px',
                left: '16px',
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 20,
                overflow: 'hidden',
              }
        }
      >
        {/* Tab Switcher & Close button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(6, 9, 19, 0.6)',
          }}
        >
          <button
            id="tab-systems"
            onClick={() => setLeftSidebarTab('systems')}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: leftSidebarTab === 'systems' ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
              color: leftSidebarTab === 'systems' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: leftSidebarTab === 'systems' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={15} />
            <span>Systems</span>
          </button>

          <button
            id="tab-hierarchy"
            onClick={() => setLeftSidebarTab('hierarchy')}
            style={{
              flex: 1,
              padding: '12px 8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: leftSidebarTab === 'hierarchy' ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
              color: leftSidebarTab === 'hierarchy' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: leftSidebarTab === 'hierarchy' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Network size={15} />
            <span>Tree</span>
          </button>

          {/* Close Sidebar button */}
          <button
            id="btn-close-left-sidebar"
            className="btn-icon"
            onClick={() => setIsLeftSidebarOpen(false)}
            title="Close Panel"
            style={{
              width: '28px',
              height: '28px',
              margin: '0 8px',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* SYSTEMS TAB CONTENT */}
        {leftSidebarTab === 'systems' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Quick Actions */}
            <div
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Systems Matrix (9)</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  id="btn-show-all-systems"
                  onClick={showAllSystems}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                  }}
                >
                  All On
                </button>
                <button
                  id="btn-hide-all-systems"
                  onClick={hideAllSystems}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                  }}
                >
                  All Off
                </button>
              </div>
            </div>

            {/* Systems List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {SYSTEMS_DATA.map((sys) => {
                const isVisible = visibleSystems[sys.id] ?? true;
                const opacity = systemOpacities[sys.id] ?? 1.0;

                return (
                  <div
                    key={sys.id}
                    id={`system-row-${sys.id}`}
                    style={{
                      background: isVisible ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      opacity: isVisible ? 1.0 : 0.55,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        onClick={() => toggleSystem(sys.id)}
                      >
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isVisible ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0,
                          }}
                        >
                          {isVisible ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>

                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: sys.color,
                            boxShadow: isVisible ? `0 0 8px ${sys.color}` : 'none',
                          }}
                        />

                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{sys.name}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {sys.structureCount}
                        </span>
                        {/* Solo Button */}
                        <button
                          id={`btn-solo-${sys.id}`}
                          onClick={() => soloSystem(sys.id)}
                          className="btn-icon"
                          style={{ width: '26px', height: '26px' }}
                          title={`Isolate only ${sys.name}`}
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Opacity Slider for System */}
                    {isVisible && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Opacity</span>
                        <input
                          type="range"
                          id={`slider-opacity-${sys.id}`}
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={opacity}
                          onChange={(e) => setSystemOpacity(sys.id, parseFloat(e.target.value))}
                          style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', width: '28px', textAlign: 'right' }}>
                          {Math.round(opacity * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HIERARCHY TREE CONTENT */}
        {leftSidebarTab === 'hierarchy' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Foundational Ontology Tree</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>FMA 4.0</span>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '8px',
              }}
            >
              {renderHierarchyNode(ANATOMICAL_HIERARCHY, 0)}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
