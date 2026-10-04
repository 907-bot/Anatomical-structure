import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { BottomDock } from './components/BottomDock';
import { Viewport3D } from './components/Viewport3D';
import { TourPlayer } from './components/TourPlayer';
import { SearchModal } from './components/SearchModal';
import { MbbsHubModal } from './components/MbbsHubModal';
import { OrganDetailPage } from './components/OrganDetailPage';
import { useAnatomyStore } from './store/useAnatomyStore';

export const App: React.FC = () => {
  const { pageMode, setPageMode, selectStructure } = useAnatomyStore();

  // Listen to browser hash changes (e.g. back/forward navigation)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/organ/')) {
        const id = hash.replace('#/organ/', '').trim();
        if (id) {
          selectStructure(id);
          setPageMode('organ-detail');
        }
      } else {
        setPageMode('atlas');
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [setPageMode, selectStructure]);

  return (
    <div
      id="anatomy-app-root"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#060913',
      }}
    >
      {/* 3D WebGL Canvas Layer (Preserved in memory for seamless zero-latency navigation) */}
      <div
        style={{
          width: '100%',
          height: '100%',
          visibility: pageMode === 'atlas' ? 'visible' : 'hidden',
          pointerEvents: pageMode === 'atlas' ? 'auto' : 'none',
        }}
      >
        <Viewport3D />
        <Header />
        <TourPlayer />
        <LeftSidebar />
        <RightSidebar />
        <BottomDock />
        <SearchModal />
        <MbbsHubModal />
      </div>

      {/* Dedicated Isolated Organ Page */}
      {pageMode === 'organ-detail' && <OrganDetailPage />}
    </div>
  );
};

export default App;
