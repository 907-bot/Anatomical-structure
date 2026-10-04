import { create } from 'zustand';
import type {
  SystemId,
  ViewPreset,
  ClippingAxis,
  PerformanceTelemetry,
} from '../types/anatomy';
import type { DissectionStage } from '../data/mbbsData';
import { SYSTEMS_DATA } from '../data/systemsData';
import { GUIDED_TOURS } from '../data/toursData';

interface AnatomyState {
  // Selection & Interaction
  selectedStructureId: string | null;
  hoveredStructureId: string | null;

  // System Layer Visibilities & Opacities
  visibleSystems: Record<SystemId, boolean>;
  systemOpacities: Record<SystemId, number>;

  // Display & Clinical Tools
  isXRayMode: boolean;
  isIsolatedMode: boolean;
  explodedValue: number; // 0 to 1
  clippingAxis: ClippingAxis;
  clippingPosition: number; // -1 to 1
  showLabels: boolean;
  viewPreset: ViewPreset;

  // Search & Navigation
  searchQuery: string;
  isSearchOpen: boolean;

  // Modals & Panels
  isStressTestOpen: boolean;
  isHierarchyExpanded: boolean;
  leftSidebarTab: 'systems' | 'hierarchy';
  isMbbsHubOpen: boolean;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;

  // Guided Tours
  activeTourId: string | null;
  currentTourStepIndex: number;

  // Render Quality & Gender
  qualityPreset: 'ultra' | 'high' | 'medium' | 'low';
  gender: 'male' | 'female';

  // Performance Telemetry
  telemetry: PerformanceTelemetry;

  // Page Navigation Mode
  pageMode: 'atlas' | 'organ-detail';

  // Actions
  setPageMode: (mode: 'atlas' | 'organ-detail') => void;
  openOrganDetail: (structureId: string) => void;
  closeOrganDetail: () => void;
  selectStructure: (id: string | null) => void;
  hoverStructure: (id: string | null) => void;
  toggleSystem: (systemId: SystemId) => void;
  setSystemVisible: (systemId: SystemId, visible: boolean) => void;
  setSystemOpacity: (systemId: SystemId, opacity: number) => void;
  showAllSystems: () => void;
  hideAllSystems: () => void;
  soloSystem: (systemId: SystemId) => void;
  setXRayMode: (enabled: boolean) => void;
  setIsIsolatedMode: (enabled: boolean) => void;
  setExplodedValue: (val: number) => void;
  setClippingAxis: (axis: ClippingAxis) => void;
  setClippingPosition: (pos: number) => void;
  setShowLabels: (show: boolean) => void;
  setViewPreset: (preset: ViewPreset) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsStressTestOpen: (open: boolean) => void;
  setLeftSidebarTab: (tab: 'systems' | 'hierarchy') => void;
  setIsHierarchyExpanded: (expanded: boolean) => void;
  setIsMbbsHubOpen: (open: boolean) => void;
  setIsLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
  setIsRightSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  applyDissectionStage: (stage: DissectionStage) => void;
  startTour: (tourId: string) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  stopTour: () => void;
  setQualityPreset: (preset: 'ultra' | 'high' | 'medium' | 'low') => void;
  setGender: (gender: 'male' | 'female') => void;
  updateTelemetry: (partial: Partial<PerformanceTelemetry>) => void;
}

const getInitialHashState = (): { mode: 'atlas' | 'organ-detail'; structureId: string | null } => {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#/organ/')) {
    const organId = window.location.hash.replace('#/organ/', '').trim();
    if (organId) {
      return { mode: 'organ-detail', structureId: organId };
    }
  }
  return { mode: 'atlas', structureId: null };
};

const initialHash = getInitialHashState();

const initialVisibleSystems: Record<SystemId, boolean> = SYSTEMS_DATA.reduce(
  (acc, sys) => ({ ...acc, [sys.id]: sys.defaultVisible }),
  {} as Record<SystemId, boolean>
);

const initialSystemOpacities: Record<SystemId, number> = SYSTEMS_DATA.reduce(
  (acc, sys) => ({ ...acc, [sys.id]: sys.defaultOpacity }),
  {} as Record<SystemId, number>
);

export const useAnatomyStore = create<AnatomyState>((set, get) => ({
  pageMode: initialHash.mode,
  selectedStructureId: initialHash.structureId,
  hoveredStructureId: null,

  setPageMode: (mode) => set({ pageMode: mode }),

  openOrganDetail: (structureId) => {
    set({
      selectedStructureId: structureId,
      pageMode: 'organ-detail',
    });
    if (typeof window !== 'undefined') {
      window.location.hash = `#/organ/${structureId}`;
    }
  },

  closeOrganDetail: () => {
    set({ pageMode: 'atlas' });
    if (typeof window !== 'undefined') {
      window.location.hash = '#/';
    }
  },

  visibleSystems: initialVisibleSystems,
  systemOpacities: initialSystemOpacities,

  isXRayMode: false,
  isIsolatedMode: false,
  explodedValue: 0.0,
  clippingAxis: 'none',
  clippingPosition: 0.0,
  showLabels: true,
  viewPreset: 'anterior',

  searchQuery: '',
  isSearchOpen: false,

  isStressTestOpen: false,
  isHierarchyExpanded: true,
  leftSidebarTab: 'systems',
  isMbbsHubOpen: false,
  isLeftSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  isRightSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,

  activeTourId: null,
  currentTourStepIndex: 0,

  qualityPreset: 'high',
  gender: 'male',

  telemetry: {
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 0,
    triangles: 0,
    activeMeshes: 0,
    memoryEstimateMB: 38,
    stressTestStatus: 'idle',
    raycastLatencyMs: 0.5,
  },

  selectStructure: (id) => {
    set({ selectedStructureId: id });
    if (id && typeof window !== 'undefined' && window.innerWidth < 1024) {
      set({ isRightSidebarOpen: true, isLeftSidebarOpen: false });
    }
  },

  hoverStructure: (id) => {
    set({ hoveredStructureId: id });
  },

  toggleSystem: (systemId) => {
    set((state) => ({
      visibleSystems: {
        ...state.visibleSystems,
        [systemId]: !state.visibleSystems[systemId],
      },
    }));
  },

  setSystemVisible: (systemId, visible) => {
    set((state) => ({
      visibleSystems: {
        ...state.visibleSystems,
        [systemId]: visible,
      },
    }));
  },

  setSystemOpacity: (systemId, opacity) => {
    set((state) => ({
      systemOpacities: {
        ...state.systemOpacities,
        [systemId]: opacity,
      },
    }));
  },

  showAllSystems: () => {
    const allVis = { ...get().visibleSystems };
    (Object.keys(allVis) as SystemId[]).forEach((sys) => {
      allVis[sys] = true;
    });
    set({ visibleSystems: allVis });
  },

  hideAllSystems: () => {
    const allVis = { ...get().visibleSystems };
    (Object.keys(allVis) as SystemId[]).forEach((sys) => {
      allVis[sys] = false;
    });
    set({ visibleSystems: allVis });
  },

  soloSystem: (systemId) => {
    const newVis = {} as Record<SystemId, boolean>;
    (Object.keys(get().visibleSystems) as SystemId[]).forEach((sys) => {
      newVis[sys] = sys === systemId;
    });
    set({ visibleSystems: newVis });
  },

  setXRayMode: (enabled) => set({ isXRayMode: enabled }),
  setIsIsolatedMode: (enabled) => set({ isIsolatedMode: enabled }),
  setExplodedValue: (val) => set({ explodedValue: Math.max(0, Math.min(1, val)) }),
  setClippingAxis: (axis) => set({ clippingAxis: axis }),
  setClippingPosition: (pos) => set({ clippingPosition: Math.max(-1, Math.min(1, pos)) }),
  setShowLabels: (show) => set({ showLabels: show }),
  setViewPreset: (preset) => set({ viewPreset: preset }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setIsStressTestOpen: (open) => set({ isStressTestOpen: open }),
  setLeftSidebarTab: (tab) => set({ leftSidebarTab: tab }),
  setIsHierarchyExpanded: (expanded) => set({ isHierarchyExpanded: expanded }),
  setIsMbbsHubOpen: (open) => set({ isMbbsHubOpen: open }),
  setIsLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),
  toggleLeftSidebar: () =>
    set((state) => {
      const next = !state.isLeftSidebarOpen;
      const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
      return {
        isLeftSidebarOpen: next,
        isRightSidebarOpen: next && isNarrow ? false : state.isRightSidebarOpen,
      };
    }),
  setIsRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
  toggleRightSidebar: () =>
    set((state) => {
      const next = !state.isRightSidebarOpen;
      const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
      return {
        isRightSidebarOpen: next,
        isLeftSidebarOpen: next && isNarrow ? false : state.isLeftSidebarOpen,
      };
    }),
  applyDissectionStage: (stage) =>
    set({
      visibleSystems: { ...stage.visibilities },
      systemOpacities: { ...stage.opacities },
    }),

  startTour: (tourId) => {
    const tour = GUIDED_TOURS.find((t) => t.id === tourId);
    if (tour && tour.steps.length > 0) {
      set({
        activeTourId: tourId,
        currentTourStepIndex: 0,
        selectedStructureId: tour.steps[0].structureId,
      });
    }
  },

  nextTourStep: () => {
    const { activeTourId, currentTourStepIndex } = get();
    if (!activeTourId) return;
    const tour = GUIDED_TOURS.find((t) => t.id === activeTourId);
    if (tour && currentTourStepIndex < tour.steps.length - 1) {
      const nextIdx = currentTourStepIndex + 1;
      set({
        currentTourStepIndex: nextIdx,
        selectedStructureId: tour.steps[nextIdx].structureId,
      });
    }
  },

  prevTourStep: () => {
    const { activeTourId, currentTourStepIndex } = get();
    if (!activeTourId) return;
    const tour = GUIDED_TOURS.find((t) => t.id === activeTourId);
    if (tour && currentTourStepIndex > 0) {
      const prevIdx = currentTourStepIndex - 1;
      set({
        currentTourStepIndex: prevIdx,
        selectedStructureId: tour.steps[prevIdx].structureId,
      });
    }
  },

  stopTour: () => {
    set({ activeTourId: null, currentTourStepIndex: 0 });
  },

  setQualityPreset: (preset) => set({ qualityPreset: preset }),
  setGender: (gender) => set({ gender }),
  updateTelemetry: (partial) => {
    set((state) => ({
      telemetry: { ...state.telemetry, ...partial },
    }));
  },
}));
