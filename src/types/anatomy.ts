export type SystemId =
  | 'skeletal'
  | 'muscular'
  | 'nervous'
  | 'cardiovascular'
  | 'respiratory'
  | 'digestive'
  | 'urinary'
  | 'endocrine'
  | 'integumentary';

export type BodyRegion =
  | 'head-neck'
  | 'thorax'
  | 'abdomen'
  | 'pelvis'
  | 'upper-limb'
  | 'lower-limb'
  | 'spine'
  | 'systemic';

export interface SystemInfo {
  id: SystemId;
  name: string;
  latinName: string;
  description: string;
  color: string;
  structureCount: number;
  iconName: string;
  defaultVisible: boolean;
  defaultOpacity: number;
}

export interface AnatomicalStructure {
  id: string;
  fmaId: string;
  name: string;
  latinName: string;
  system: SystemId;
  category: string;
  region: BodyRegion;
  parent: string;
  partOf: string[];
  articulatesWith?: string[];
  innervation?: string;
  bloodSupply?: string;
  function: string;
  clinicalNotes: string;
  synonyms: string[];
  color: string;
  anchor: [number, number, number];
  boundingRadius: number;
  geometryType: string;
  geometryParams: Record<string, any>;
  explodedOffset: [number, number, number];
  mbbsData?: MBBSHighYieldData;
}

export interface MBBSHighYieldData {
  vivaQuestion?: string;
  vivaAnswer?: string;
  relations?: {
    anterior?: string;
    posterior?: string;
    superior?: string;
    inferior?: string;
    medial?: string;
    lateral?: string;
  };
  examPearl?: string;
  mnemonic?: string;
  clinicalSign?: string;
}

export interface HierarchyNode {
  id: string;
  label: string;
  type: 'region' | 'system' | 'group' | 'structure';
  systemId?: SystemId;
  structureId?: string;
  fmaId?: string;
  children?: HierarchyNode[];
}

export interface TourStep {
  id: string;
  structureId: string;
  title: string;
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface GuidedTour {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  system: SystemId;
  steps: TourStep[];
}

export type ViewPreset =
  | 'anterior'
  | 'posterior'
  | 'lateral-left'
  | 'lateral-right'
  | 'superior'
  | 'inferior'
  | 'spine-focus'
  | 'cardiac-focus';

export type ClippingAxis = 'none' | 'sagittal' | 'coronal' | 'transverse';

export interface PerformanceTelemetry {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  activeMeshes: number;
  memoryEstimateMB: number;
  stressTestStatus: 'idle' | 'running' | 'completed';
  stressTestScore?: number;
  raycastLatencyMs: number;
}
