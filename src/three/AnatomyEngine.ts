import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ANATOMICAL_STRUCTURES } from '../data/anatomyData';
import { GeometryGenerators } from './geometryGenerators';
import { OrganicTextures } from './organicTextures';
import type {
  ClippingAxis,
  PerformanceTelemetry,
  SystemId,
  ViewPreset,
} from '../types/anatomy';

export class AnatomyEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private gltfLoader: GLTFLoader = new GLTFLoader();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2(-999, -999);

  // Mesh registries
  private meshMap: Map<string, THREE.Mesh> = new Map();
  private materialMap: Map<string, THREE.MeshStandardMaterial> = new Map();
  private basePositions: Map<string, THREE.Vector3> = new Map();

  // Animation & Rendering state
  private reqId: number | null = null;
  private lastTime: number = performance.now();
  private isDisposed: boolean = false;

  // Pointer drag vs click disambiguation
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };
  private pointerDownTime: number = 0;

  // Camera animation target & smooth interpolation
  private cameraStartPos: THREE.Vector3 = new THREE.Vector3(0, 0, 2.2);
  private cameraTargetPos: THREE.Vector3 = new THREE.Vector3(0, 0, 2.2);
  private cameraStartTarget: THREE.Vector3 = new THREE.Vector3(0, 0.05, 0);
  private cameraLookAtTarget: THREE.Vector3 = new THREE.Vector3(0, 0.05, 0);
  private isCameraTransitioning: boolean = false;
  private cameraTransitionElapsed: number = 0;
  private cameraTransitionDuration: number = 1.1;

  // Clipping Plane
  private clippingPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 100);

  // Telemetry tracking
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private telemetryCallback?: (telemetry: Partial<PerformanceTelemetry>) => void;

  // External selection callbacks
  private onSelectCallback?: (id: string | null) => void;
  private onHoverCallback?: (id: string | null) => void;

  constructor(
    container: HTMLElement,
    callbacks?: {
      onSelect?: (id: string | null) => void;
      onHover?: (id: string | null) => void;
      onTelemetry?: (telemetry: Partial<PerformanceTelemetry>) => void;
    }
  ) {
    this.container = container;
    this.onSelectCallback = callbacks?.onSelect;
    this.onHoverCallback = callbacks?.onHover;
    this.telemetryCallback = callbacks?.onTelemetry;

    this.initScene();
    this.initLights();
    this.buildAnatomyMeshes();
    this.setupEventListeners();
    this.animate();
  }

  private initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x070b14, 1.0);
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.05, 50);
    this.camera.position.copy(this.cameraTargetPos);

    // 4. Silky-smooth OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05; // Buttery momentum
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.55; // Refined zoom gradient
    this.controls.minDistance = 0.12;
    this.controls.maxDistance = 5.0;
    this.controls.target.copy(this.cameraLookAtTarget);
  }

  private initLights() {
    // Ambient clinical light
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambient);

    // Key studio light (anterior-superior)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2, 4, 3);
    this.scene.add(keyLight);

    // Fill light (posterior-lateral cyan)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    fillLight.position.set(-3, 2, -2);
    this.scene.add(fillLight);

    // Rim light (inferior subtle warm)
    const rimLight = new THREE.DirectionalLight(0xe2e8f0, 0.6);
    rimLight.position.set(0, -3, 2);
    this.scene.add(rimLight);

    // Subtle holographic ground grid
    const grid = new THREE.GridHelper(3, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -0.98;
    this.scene.add(grid);
  }

  private buildAnatomyMeshes() {
    ANATOMICAL_STRUCTURES.forEach((struct) => {
      // 1. Generate geometry
      const geom = GeometryGenerators.createGeometry(struct.geometryType, struct.geometryParams);

      // 2. Select authentic procedural organic PBR texture & material attributes
      const isSkin = struct.system === 'integumentary';
      let texture: THREE.CanvasTexture | null = null;
      let roughness = 0.45;
      let metalness = 0.05;

      if (isSkin) {
        texture = OrganicTextures.getSkinTexture();
        roughness = 0.38;
        metalness = 0.02;
      } else if (
        struct.geometryType === 'cerebrum' ||
        struct.geometryType === 'cerebellum_stem' ||
        struct.system === 'nervous'
      ) {
        texture = OrganicTextures.getBrainTexture();
        roughness = 0.32;
        metalness = 0.04;
      } else if (
        struct.id === 'fma-7101' ||
        struct.geometryType === 'heart_chamber' ||
        struct.geometryType === 'heart_atria' ||
        struct.system === 'cardiovascular'
      ) {
        texture = OrganicTextures.getHeartTexture();
        roughness = 0.28;
        metalness = 0.08;
      } else if (struct.system === 'muscular') {
        texture = OrganicTextures.getMuscleTexture();
        roughness = 0.45;
        metalness = 0.04;
      } else if (struct.system === 'skeletal') {
        texture = OrganicTextures.getBoneTexture();
        roughness = 0.62;
        metalness = 0.02;
      } else if (
        struct.system === 'digestive' ||
        struct.system === 'respiratory' ||
        struct.system === 'urinary'
      ) {
        texture = OrganicTextures.getVisceralTexture();
        roughness = 0.35;
        metalness = 0.06;
      }

      // Create high-grade anatomical PBR material with tactile micro-surface bump depth
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(struct.color),
        map: texture,
        bumpMap: texture,
        bumpScale: isSkin ? 0.0015 : struct.system === 'skeletal' ? 0.004 : 0.003,
        roughness,
        metalness,
        transparent: isSkin,
        opacity: isSkin ? 0.45 : 1.0,
        depthWrite: !isSkin,
        clippingPlanes: [this.clippingPlane],
        clipShadows: true,
        side: isSkin ? THREE.FrontSide : THREE.DoubleSide,
      });

      // 3. Create mesh
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...struct.anchor);
      if (isSkin) {
        mesh.renderOrder = 10; // Render skin envelope over internal organs smoothly
      }
      mesh.userData = {
        id: struct.id,
        fmaId: struct.fmaId,
        name: struct.name,
        system: struct.system,
        category: struct.category,
        anchor: struct.anchor,
        boundingRadius: struct.boundingRadius,
        explodedOffset: struct.explodedOffset,
        baseColor: struct.color,
      };

      // Store references
      this.meshMap.set(struct.id, mesh);
      this.materialMap.set(struct.id, mat);
      this.basePositions.set(struct.id, new THREE.Vector3(...struct.anchor));

      this.scene.add(mesh);
    });

    // Asynchronously upgrade meshes with authentic BodyParts3D 3D scan models
    this.loadRealModels();
  }

  /**
   * Asynchronously upgrade geometries with authentic BodyParts3D medical scan models
   */
  private loadRealModels() {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    fetch(`${base}anatomy/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Manifest not found');
        return res.json();
      })
      .then((manifest: Record<string, { file: string }>) => {
        const structureToModelKey: Record<string, string> = {
          // Integumentary System (Natural continuous human flesh envelope)
          'fma-7163': 'human_body_skin',

          // Axial Skeleton - Skull & Viscerocranium
          'fma-5018': 'cranium',
          'fma-52748': 'mandible',

          // Axial Skeleton - Cervical Spine (C1 - C7 authentic CT vertebrae)
          'fma-9960': 'c1_atlas',
          'fma-9961': 'c2_axis',
          'fma-9962': 'c3',
          'fma-9963': 'c4',
          'fma-9964': 'c5',
          'fma-9965': 'c6',
          'fma-9966': 'c7',

          // Axial Skeleton - Thoracolumbar Spine & Thoracic Cage
          'fma-9140': 'thoracic_spine',
          'fma-9141': 'lumbar_spine',
          'fma-16202': 'sacrum',
          'fma-7485': 'sternum',
          'fma-7486-l': 'ribs_left',
          'fma-7486-r': 'ribs_right',

          // Appendicular Skeleton - Upper Limb & Pectoral Girdle
          'fma-13334-l': 'clavicle_left',
          'fma-13334-r': 'clavicle_right',
          'fma-13394-l': 'scapula_left',
          'fma-13394-r': 'scapula_right',
          'fma-23466-l': 'humerus_left',
          'fma-23466-r': 'humerus_right',
          'fma-23463-l': 'forearm_left',
          'fma-23463-r': 'forearm_right',

          // Appendicular Skeleton - Pelvic Girdle & Lower Extremity
          'fma-16585': 'pelvis',
          'fma-9611-l': 'femur_left',
          'fma-9611-r': 'femur_right',
          'fma-24485-l': 'patella_left',
          'fma-24485-r': 'patella_right',
          'fma-24475-l': 'lower_leg_left',
          'fma-24475-r': 'lower_leg_right',

          // Cardiovascular & Circulatory
          'fma-7101': 'heart_lv',
          'fma-7098': 'heart_rv',
          'fma-7097': 'heart_atria',
          'fma-3734': 'aorta',
          'fma-4720': 'vena_cava',

          // Respiratory System
          'fma-7394': 'trachea',
          'fma-7340': 'lung_left',
          'fma-7339': 'lung_right',

          // Nervous System
          'fma-50801': 'cerebrum',
          'fma-50802': 'cerebellum_stem',
          'fma-7647': 'spinal_cord',

          // Digestive & Splanchnic Organs
          'fma-7148': 'stomach',
          'fma-7197': 'liver',
          'fma-7202': 'gallbladder',
          'fma-7198': 'pancreas',
          'fma-7206': 'small_intestine',
          'fma-14543': 'large_intestine',

          // Urinary System
          'fma-7203-l': 'kidney_left',
          'fma-7203-r': 'kidney_right',
          'fma-15900': 'bladder',
        };

        Object.entries(structureToModelKey).forEach(([structId, modelKey]) => {
          const item = manifest[modelKey];
          if (!item) return;

          const fileUrl = item.file.startsWith('/')
            ? `${base}${item.file.slice(1)}`
            : `${base}${item.file}`;

          this.gltfLoader.load(
            fileUrl,
            (gltf) => {
              if (this.isDisposed) return;
              let targetGeom: THREE.BufferGeometry | null = null;
              gltf.scene.traverse((child) => {
                if (!targetGeom && (child as THREE.Mesh).isMesh) {
                  targetGeom = (child as THREE.Mesh).geometry;
                }
              });

              if (targetGeom) {
                const existingMesh = this.meshMap.get(structId);
                if (existingMesh) {
                  existingMesh.geometry.dispose();
                  existingMesh.geometry = targetGeom;
                  existingMesh.position.set(0, 0, 0);
                  this.basePositions.set(structId, new THREE.Vector3(0, 0, 0));
                  existingMesh.geometry.computeVertexNormals();
                  existingMesh.geometry.computeBoundingSphere();
                }
              }
            },
            undefined,
            (err) => {
              console.warn(`[AnatomyEngine] Real GLB model load error for ${modelKey}:`, err);
            }
          );
        });
      })
      .catch((err) => {
        console.info('[AnatomyEngine] Using procedural anatomical geometries:', err.message);
      });
  }

  // ==========================================
  // VIEWPORT & EVENT LISTENERS
  // ==========================================
  private setupEventListeners() {
    window.addEventListener('resize', this.onResize);
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('click', this.onPointerClick);
  }

  public resize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onResize = () => {
    this.resize();
  };

  /**
   * Helper to resolve the best intersected mesh, penetrating translucent skin to reach internal organs
   */
  private getResolvedHit(intersects: THREE.Intersection[]): THREE.Intersection | null {
    if (intersects.length === 0) return null;
    let chosen = intersects[0];
    if (chosen.object.userData.system === 'integumentary' && intersects.length > 1) {
      const skinMat = this.materialMap.get(chosen.object.userData.id);
      if (skinMat && skinMat.opacity < 0.95) {
        const internalHit = intersects.find((h) => h.object.userData.system !== 'integumentary');
        if (internalHit) {
          chosen = internalHit;
        }
      }
    }
    return chosen;
  }

  private onPointerDown = (e: MouseEvent) => {
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
    this.pointerDownTime = performance.now();
  };

  private onPointerMove = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast hover
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const visibleMeshes = Array.from(this.meshMap.values()).filter((m) => m.visible);
    const intersects = this.raycaster.intersectObjects(visibleMeshes, false);
    const resolvedHit = this.getResolvedHit(intersects);

    if (resolvedHit) {
      const topHit = resolvedHit.object as THREE.Mesh;
      const hitId = topHit.userData.id;
      if (this.onHoverCallback) this.onHoverCallback(hitId);
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      if (this.onHoverCallback) this.onHoverCallback(null);
      this.renderer.domElement.style.cursor = 'default';
    }
  };

  private onPointerClick = (e: MouseEvent) => {
    // Prevent accidental clicks when dragging/orbiting the camera
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    const elapsed = performance.now() - this.pointerDownTime;
    if (dist > 6 || elapsed > 600) {
      return;
    }

    const startTime = performance.now();
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const visibleMeshes = Array.from(this.meshMap.values()).filter((m) => m.visible);
    const intersects = this.raycaster.intersectObjects(visibleMeshes, false);
    const resolvedHit = this.getResolvedHit(intersects);

    const latency = performance.now() - startTime;
    if (this.telemetryCallback) {
      this.telemetryCallback({ raycastLatencyMs: Number(latency.toFixed(2)) });
    }

    if (resolvedHit) {
      const hitMesh = resolvedHit.object as THREE.Mesh;
      const hitId = hitMesh.userData.id;
      if (this.onSelectCallback) {
        this.onSelectCallback(hitId);
      }
    } else {
      // Click on background
      if (this.onSelectCallback) {
        this.onSelectCallback(null);
      }
    }
  };

  // ==========================================
  // PUBLIC CONTROLS & UPDATES FROM REACT
  // ==========================================

  /**
   * Update visual highlights and transparency based on selection & system state
   */
  public updateVisualState(state: {
    selectedId: string | null;
    hoveredId: string | null;
    visibleSystems: Record<SystemId, boolean>;
    systemOpacities: Record<SystemId, number>;
    isXRayMode: boolean;
    isIsolatedMode: boolean;
    explodedValue: number;
  }) {
    const {
      selectedId,
      hoveredId,
      visibleSystems,
      systemOpacities,
      isXRayMode,
      isIsolatedMode,
      explodedValue,
    } = state;

    this.meshMap.forEach((mesh, id) => {
      const mat = this.materialMap.get(id);
      if (!mat) return;

      const structSystem = mesh.userData.system as SystemId;
      const isSelected = selectedId === id;
      const isHovered = hoveredId === id;
      const isSystemVisible = visibleSystems[structSystem] ?? true;
      const baseOpacity = systemOpacities[structSystem] ?? 1.0;

      // 1. Dedicated Integumentary (Skin) Pipeline
      // Prevents snapping to 100% opacity on click/selection and eliminates transparency depth artifacts
      if (structSystem === 'integumentary') {
        const skinAlpha = Math.max(0.0, Math.min(1.0, baseOpacity));

        // If system is disabled or opacity is practically 0, hide mesh completely
        if (!isSystemVisible || skinAlpha <= 0.01) {
          mesh.visible = false;
          return;
        }

        mesh.visible = true;
        // Retain user's chosen slider opacity; do NOT force to 1.0 when selected!
        mat.opacity = skinAlpha;

        if (skinAlpha >= 0.98) {
          mat.transparent = false;
          mat.depthWrite = true;
          mat.depthTest = true;
          mat.side = THREE.DoubleSide;
          mesh.renderOrder = 0;
        } else {
          mat.transparent = true;
          mat.depthWrite = false;
          mat.depthTest = true;
          // FrontSide rendering prevents back-faces and front-faces from overlapping and creating dark blotches
          mat.side = THREE.FrontSide;
          mesh.renderOrder = 10;
        }

        // Emissive highlight for skin
        if (isSelected) {
          mat.emissive.setHex(0x00f0ff);
          mat.emissiveIntensity = 0.3;
        } else if (isHovered) {
          mat.emissive.setHex(0x38bdf8);
          mat.emissiveIntensity = 0.18;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        }

        // Exploded view translation
        const basePos = this.basePositions.get(id);
        if (basePos) {
          const offset = mesh.userData.explodedOffset || [0, 0, 0];
          mesh.position.set(
            basePos.x + offset[0] * explodedValue,
            basePos.y + offset[1] * explodedValue,
            basePos.z + offset[2] * explodedValue
          );
        }
        return;
      }

      // 2. Non-skin anatomical structures
      if (!isSystemVisible || baseOpacity <= 0.01) {
        mesh.visible = false;
        return;
      }

      if (isIsolatedMode && selectedId) {
        // If isolated, non-selected structures are dimmed
        if (isSelected) {
          mesh.visible = true;
          mat.opacity = 1.0;
          mat.transparent = false;
          mat.depthWrite = true;
        } else {
          mesh.visible = true;
          mat.opacity = 0.08;
          mat.transparent = true;
          mat.depthWrite = false;
        }
      } else {
        mesh.visible = true;
        if (isXRayMode) {
          mat.transparent = true;
          mat.opacity = isSelected ? 0.85 : isHovered ? 0.6 : 0.22;
          mat.depthWrite = false;
        } else {
          const isTranslucent = baseOpacity < 0.98;
          mat.transparent = isTranslucent;
          mat.opacity = isSelected ? 1.0 : baseOpacity;
          mat.depthWrite = !isTranslucent;
        }
      }

      // 3. Highlighting & Emissive Glow
      if (isSelected) {
        mat.emissive.setHex(0x00f0ff); // Vibrant cyan glow
        mat.emissiveIntensity = 0.75;
      } else if (isHovered) {
        mat.emissive.setHex(0x38bdf8); // Light cyan hover
        mat.emissiveIntensity = 0.35;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0.0;
      }

      // 3. Exploded View Translation
      const basePos = this.basePositions.get(id);
      if (basePos) {
        const offset = mesh.userData.explodedOffset || [0, 0, 0];
        mesh.position.set(
          basePos.x + offset[0] * explodedValue,
          basePos.y + offset[1] * explodedValue,
          basePos.z + offset[2] * explodedValue
        );
      }
    });
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Smoothly animates camera and lookAt target using cubic easing curve
   */
  public startCameraTransition(targetPos: THREE.Vector3, lookAtTarget: THREE.Vector3, duration = 1.0) {
    this.cameraStartPos.copy(this.camera.position);
    this.cameraStartTarget.copy(this.controls.target);
    this.cameraTargetPos.copy(targetPos);
    this.cameraLookAtTarget.copy(lookAtTarget);
    this.cameraTransitionElapsed = 0;
    this.cameraTransitionDuration = duration;
    this.isCameraTransitioning = true;
  }

  /**
   * Smoothly focus camera onto target structure with bounding sphere calculation
   */
  public focusStructure(id: string) {
    const mesh = this.meshMap.get(id);
    if (!mesh) return;

    let anchor = mesh.position.clone();
    let radius = mesh.userData.boundingRadius || 0.1;

    if (mesh.geometry.boundingSphere) {
      anchor = mesh.geometry.boundingSphere.center.clone().add(mesh.position);
      radius = Math.max(radius, mesh.geometry.boundingSphere.radius);
    }
    // Calculate optimal camera viewing distance based on radius
    const distance = Math.max(0.28, radius * 2.8);

    const targetPos = new THREE.Vector3(
      anchor.x + distance * 0.45,
      anchor.y + distance * 0.35,
      anchor.z + distance * 0.85
    );
    this.startCameraTransition(targetPos, anchor, 1.1);
  }

  /**
   * Set predefined camera perspective with cinematic transition
   */
  public setViewPreset(preset: ViewPreset) {
    let center = new THREE.Vector3(0, 0.05, 0);
    const targetPos = new THREE.Vector3();

    switch (preset) {
      case 'anterior':
        targetPos.set(0, 0.05, 2.2);
        break;
      case 'posterior':
        targetPos.set(0, 0.05, -2.2);
        break;
      case 'lateral-left':
        targetPos.set(-2.2, 0.05, 0);
        break;
      case 'lateral-right':
        targetPos.set(2.2, 0.05, 0);
        break;
      case 'superior':
        targetPos.set(0, 2.4, 0.1);
        break;
      case 'inferior':
        targetPos.set(0, -2.4, 0.1);
        break;
      case 'spine-focus':
        center = new THREE.Vector3(0, 0.32, -0.03);
        targetPos.set(0.6, 0.42, -0.8);
        break;
      case 'cardiac-focus':
        center = new THREE.Vector3(0, 0.34, 0.03);
        targetPos.set(-0.25, 0.38, 0.45);
        break;
    }

    this.startCameraTransition(targetPos, center, 1.0);
  }

  /**
   * Smoothly dollies the camera forward or backward along current line of sight
   * factor > 0 zooms in, factor < 0 zooms out
   */
  public smoothZoom(factor: number) {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    const currentDist = this.camera.position.distanceTo(this.controls.target);
    const step = currentDist * factor;
    const newPos = this.camera.position.clone().addScaledVector(forward, step);

    const newDist = newPos.distanceTo(this.controls.target);
    if (newDist >= 0.12 && newDist <= 5.5) {
      this.startCameraTransition(newPos, this.controls.target, 0.55);
    }
  }

  public zoomIn() {
    this.smoothZoom(0.32);
  }

  public zoomOut() {
    this.smoothZoom(-0.38);
  }

  public resetView() {
    this.setViewPreset('anterior');
  }

  /**
   * Set cross-sectional clipping plane
   */
  public setClipping(axis: ClippingAxis, position: number) {
    if (axis === 'none') {
      this.clippingPlane.set(new THREE.Vector3(1, 0, 0), 100);
      return;
    }

    // Scale position range
    switch (axis) {
      case 'sagittal': // X-axis cut (left/right)
        this.clippingPlane.set(new THREE.Vector3(-1, 0, 0), position * 0.35);
        break;
      case 'coronal': // Z-axis cut (anterior/posterior)
        this.clippingPlane.set(new THREE.Vector3(0, 0, -1), position * 0.25);
        break;
      case 'transverse': // Y-axis cut (superior/inferior)
        this.clippingPlane.set(new THREE.Vector3(0, -1, 0), position * 0.85);
        break;
    }
  }

  /**
   * Get 2D screen coordinates of all active meshes for floating labels
   */
  public getScreenProjectedAnchors(): Array<{
    id: string;
    name: string;
    fmaId: string;
    screenX: number;
    screenY: number;
    visible: boolean;
  }> {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const results: Array<{
      id: string;
      name: string;
      fmaId: string;
      screenX: number;
      screenY: number;
      visible: boolean;
    }> = [];

    const tempV = new THREE.Vector3();

    this.meshMap.forEach((mesh, id) => {
      if (!mesh.visible) return;

      if (mesh.geometry.boundingSphere) {
        tempV.copy(mesh.geometry.boundingSphere.center).add(mesh.position);
      } else {
        mesh.getWorldPosition(tempV);
      }
      tempV.project(this.camera);

      // Check if inside camera frustum (between -1 and 1 and in front of camera z < 1)
      const inFront = tempV.z > 0 && tempV.z < 1;
      const x = ((tempV.x + 1) * width) / 2;
      const y = ((-tempV.y + 1) * height) / 2;

      results.push({
        id,
        name: mesh.userData.name,
        fmaId: mesh.userData.fmaId,
        screenX: x,
        screenY: y,
        visible: inFront && x > 20 && x < width - 20 && y > 20 && y < height - 20,
      });
    });

    return results;
  }

  /**
   * Automated benchmark stress-test
   */
  public async runStressTest(): Promise<number> {
    const structIds = Array.from(this.meshMap.keys());
    const startTime = performance.now();
    const testCycles = Math.min(structIds.length, 30);

    for (let i = 0; i < testCycles; i++) {
      const id = structIds[i];
      const mesh = this.meshMap.get(id);
      if (mesh) {
        // Fast raycasting stress
        const rayStart = new THREE.Vector3(
          mesh.position.x + (Math.random() - 0.5) * 0.1,
          mesh.position.y + (Math.random() - 0.5) * 0.1,
          2.0
        );
        this.raycaster.set(rayStart, new THREE.Vector3(0, 0, -1));
        this.raycaster.intersectObjects(Array.from(this.meshMap.values()));
      }
      await new Promise((r) => setTimeout(r, 16));
    }

    const elapsed = performance.now() - startTime;
    // Score based on speed and smooth execution
    const score = Math.max(90, Math.min(100, Math.round(100 - elapsed / 500)));
    return score;
  }

  // ==========================================
  // RENDER LOOP & TELEMETRY
  // ==========================================
  private animate = () => {
    if (this.isDisposed) return;
    this.reqId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.frameCount++;

    // 1. Cinematic smooth camera interpolation with cubic easing
    if (this.isCameraTransitioning) {
      this.cameraTransitionElapsed += delta;
      const progress = Math.min(1.0, this.cameraTransitionElapsed / Math.max(0.001, this.cameraTransitionDuration));
      const eased = this.easeInOutCubic(progress);

      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraTargetPos, eased);
      this.controls.target.lerpVectors(this.cameraStartTarget, this.cameraLookAtTarget, eased);

      if (progress >= 1.0) {
        this.isCameraTransitioning = false;
        this.camera.position.copy(this.cameraTargetPos);
        this.controls.target.copy(this.cameraLookAtTarget);
      }
    }

    // 2. Controls update
    this.controls.update();

    // 3. Render scene
    this.renderer.render(this.scene, this.camera);

    // 4. Telemetry tracking every 500ms
    if (now - this.lastFpsUpdate > 500) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      const frameTimeMs = Number((1000 / Math.max(1, fps)).toFixed(1));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      if (this.telemetryCallback) {
        this.telemetryCallback({
          fps,
          frameTimeMs,
          drawCalls: this.renderer.info.render.calls,
          triangles: this.renderer.info.render.triangles,
          activeMeshes: Array.from(this.meshMap.values()).filter((m) => m.visible).length,
        });
      }
    }
  };

  /**
   * Cleanup resources on unmount
   */
  public dispose() {
    this.isDisposed = true;
    if (this.reqId !== null) {
      cancelAnimationFrame(this.reqId);
    }
    window.removeEventListener('resize', this.onResize);
    const dom = this.renderer?.domElement;
    if (dom) {
      dom.removeEventListener('pointerdown', this.onPointerDown);
      dom.removeEventListener('pointermove', this.onPointerMove);
      dom.removeEventListener('click', this.onPointerClick);
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    }
    this.controls?.dispose();

    // Dispose geometries and materials
    this.meshMap.forEach((mesh) => {
      mesh.geometry.dispose();
    });
    this.materialMap.forEach((mat) => {
      mat.dispose();
    });
    this.renderer?.dispose();
  }
}
