import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ANATOMICAL_STRUCTURES } from '../data/anatomyData';
import { GeometryGenerators } from './geometryGenerators';
import { OrganicTextures } from './organicTextures';

export interface OrganEngineCallbacks {
  onLoadComplete?: () => void;
  onAutoRotateChange?: (rotating: boolean) => void;
  onWireframeChange?: (wireframe: boolean) => void;
}

/**
 * High-precision isolated 3D engine dedicated to showcasing a single organ or body part.
 * Automatically centers, frames, and illuminates the isolated structure at the exact center of the page.
 */
export class OrganInspectionEngine {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private gltfLoader: GLTFLoader = new GLTFLoader();
  private reqId: number | null = null;
  private lastTime: number = performance.now();
  private isDisposed: boolean = false;

  // Active mesh & material
  private organMesh: THREE.Mesh | null = null;
  private organMaterial: THREE.MeshStandardMaterial | null = null;
  private structureId: string;
  private callbacks?: OrganEngineCallbacks;

  // Camera transition state
  private cameraStartPos: THREE.Vector3 = new THREE.Vector3();
  private cameraTargetPos: THREE.Vector3 = new THREE.Vector3();
  private cameraStartTarget: THREE.Vector3 = new THREE.Vector3();
  private cameraLookAtTarget: THREE.Vector3 = new THREE.Vector3();
  private isCameraTransitioning: boolean = false;
  private cameraTransitionElapsed: number = 0;
  private cameraTransitionDuration: number = 0.8;

  // Clipping Plane
  private clippingPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 100);

  // Base bounding radius for framing
  private currentBoundingRadius: number = 0.2;

  constructor(container: HTMLElement, structureId: string, callbacks?: OrganEngineCallbacks) {
    this.container = container;
    this.structureId = structureId;
    this.callbacks = callbacks;

    this.initScene();
    this.initLights();
    this.loadOrganMesh(structureId);
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
    this.renderer.setClearColor(0x050811, 1.0);
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 50);
    this.camera.position.set(0, 0.15, 1.2);

    // 4. OrbitControls with silky smooth damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.55;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1.4;
    this.controls.target.set(0, 0, 0);
  }

  private initLights() {
    // 1. Ambient clinical base
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambient);

    // 2. Key studio light (anterior-superior-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 3, 3);
    this.scene.add(keyLight);

    // 3. Fill light (lateral-left cyan)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    fillLight.position.set(-3, 1.5, -1.5);
    this.scene.add(fillLight);

    // 4. Rim light (inferior-posterior crisp white)
    const rimLight = new THREE.DirectionalLight(0xe2e8f0, 0.75);
    rimLight.position.set(0, -2, 2);
    this.scene.add(rimLight);

    // 5. Subtle studio ground shadow ring helper
    const groundGrid = new THREE.GridHelper(1.8, 18, 0x1e293b, 0x0f172a);
    groundGrid.position.y = -0.35;
    this.scene.add(groundGrid);
  }

  /**
   * Loads the single organ model, centers its geometry precisely at (0, 0, 0),
   * and auto-frames the camera to showcase it at the center of the page.
   */
  public loadOrganMesh(structureId: string) {
    this.structureId = structureId;

    // Remove existing mesh if present
    if (this.organMesh) {
      this.scene.remove(this.organMesh);
      this.organMesh.geometry.dispose();
      this.organMesh = null;
    }

    const struct = ANATOMICAL_STRUCTURES.find((s) => s.id === structureId);
    if (!struct) return;

    // 1. Determine Organic Texture
    let texture: THREE.CanvasTexture | null = null;
    let roughness = 0.42;
    let metalness = 0.04;

    const isSkin = struct.system === 'integumentary';
    if (isSkin) {
      texture = OrganicTextures.getSkinTexture();
      roughness = 0.38;
      metalness = 0.02;
    } else if (struct.system === 'nervous' || struct.id === 'fma-50801' || struct.id === 'fma-50802') {
      texture = OrganicTextures.getBrainTexture();
      roughness = 0.32;
      metalness = 0.04;
    } else if (struct.system === 'cardiovascular') {
      texture = OrganicTextures.getHeartTexture();
      roughness = 0.28;
      metalness = 0.06;
    } else if (struct.system === 'muscular') {
      texture = OrganicTextures.getMuscleTexture();
      roughness = 0.45;
      metalness = 0.04;
    } else if (struct.system === 'skeletal') {
      texture = OrganicTextures.getBoneTexture();
      roughness = 0.62;
      metalness = 0.02;
    } else {
      texture = OrganicTextures.getVisceralTexture();
      roughness = 0.35;
      metalness = 0.06;
    }

    // 2. High-grade tactile PBR material
    this.organMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(struct.color),
      map: texture,
      bumpMap: texture,
      bumpScale: isSkin ? 0.0015 : struct.system === 'skeletal' ? 0.004 : 0.003,
      roughness,
      metalness,
      clippingPlanes: [this.clippingPlane],
      clipShadows: true,
      side: THREE.DoubleSide,
    });

    // 3. Create initial procedural geometry fallback
    const geom = GeometryGenerators.createGeometry(struct.geometryType, struct.geometryParams);
    geom.center(); // Center at origin (0, 0, 0)
    geom.computeBoundingSphere();

    this.organMesh = new THREE.Mesh(geom, this.organMaterial);
    this.organMesh.position.set(0, 0, 0);
    this.scene.add(this.organMesh);

    this.autoFrameGeometry(geom);

    // 4. Asynchronously upgrade with authentic BodyParts3D GLB model
    this.loadRealGLB(structureId);
  }

  private loadRealGLB(structureId: string) {
    const structureToModelKey: Record<string, string> = {
      'fma-7163': 'human_body_skin',
      'fma-5018': 'cranium',
      'fma-52748': 'mandible',
      'fma-9960': 'c1_atlas',
      'fma-9961': 'c2_axis',
      'fma-9962': 'c3',
      'fma-9963': 'c4',
      'fma-9964': 'c5',
      'fma-9965': 'c6',
      'fma-9966': 'c7',
      'fma-9140': 'thoracic_spine',
      'fma-9141': 'lumbar_spine',
      'fma-16202': 'sacrum',
      'fma-7485': 'sternum',
      'fma-7486-l': 'ribs_left',
      'fma-7486-r': 'ribs_right',
      'fma-13334-l': 'clavicle_left',
      'fma-13334-r': 'clavicle_right',
      'fma-13394-l': 'scapula_left',
      'fma-13394-r': 'scapula_right',
      'fma-23466-l': 'humerus_left',
      'fma-23466-r': 'humerus_right',
      'fma-23463-l': 'forearm_left',
      'fma-23463-r': 'forearm_right',
      'fma-16585': 'pelvis',
      'fma-9611-l': 'femur_left',
      'fma-9611-r': 'femur_right',
      'fma-24485-l': 'patella_left',
      'fma-24485-r': 'patella_right',
      'fma-24475-l': 'lower_leg_left',
      'fma-24475-r': 'lower_leg_right',
      'fma-7101': 'heart_lv',
      'fma-7098': 'heart_rv',
      'fma-7097': 'heart_atria',
      'fma-3734': 'aorta',
      'fma-4720': 'vena_cava',
      'fma-7394': 'trachea',
      'fma-7340': 'lung_left',
      'fma-7339': 'lung_right',
      'fma-50801': 'cerebrum',
      'fma-50802': 'cerebellum_stem',
      'fma-7647': 'spinal_cord',
      'fma-7148': 'stomach',
      'fma-7197': 'liver',
      'fma-7202': 'gallbladder',
      'fma-7198': 'pancreas',
      'fma-7206': 'small_intestine',
      'fma-14543': 'large_intestine',
      'fma-7203-l': 'kidney_left',
      'fma-7203-r': 'kidney_right',
      'fma-15900': 'bladder',
    };

    const modelKey = structureToModelKey[structureId];
    if (!modelKey) return;

    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    fetch(`${base}anatomy/manifest.json`)
      .then((res) => res.json())
      .then((manifest) => {
        const item = manifest[modelKey];
        if (!item || this.isDisposed) return;

        const fileUrl = item.file.startsWith('/')
          ? `${base}${item.file.slice(1)}`
          : `${base}${item.file}`;

        this.gltfLoader.load(
          fileUrl,
          (gltf) => {
            if (this.isDisposed || this.structureId !== structureId) return;

            let extractedGeom: THREE.BufferGeometry | null = null;
            gltf.scene.traverse((child) => {
              const m = child as THREE.Mesh;
              if (!extractedGeom && m.isMesh && m.geometry) {
                extractedGeom = m.geometry.clone();
              }
            });

            if (extractedGeom && this.organMesh) {
              const targetGeom = extractedGeom as THREE.BufferGeometry;
              // Exact centering: shift vertices so center is precisely (0, 0, 0)
              targetGeom.center();
              targetGeom.computeVertexNormals();
              targetGeom.computeBoundingSphere();

              this.organMesh.geometry.dispose();
              this.organMesh.geometry = targetGeom;
              this.organMesh.position.set(0, 0, 0);

              this.autoFrameGeometry(targetGeom);

              if (this.callbacks?.onLoadComplete) {
                this.callbacks.onLoadComplete();
              }
            }
          },
          undefined,
          (err) => {
            console.warn('[OrganInspectionEngine] Failed to load real GLB:', err);
          }
        );
      })
      .catch((err) => {
        console.info('[OrganInspectionEngine] Using procedural geometry:', err.message);
      });
  }

  /**
   * Computes optimal camera distance and angles to frame any size organ perfectly
   */
  private autoFrameGeometry(geom: THREE.BufferGeometry) {
    if (!geom.boundingSphere) geom.computeBoundingSphere();
    const sphere = geom.boundingSphere || { radius: 0.15 };
    const radius = Math.max(0.04, sphere.radius);
    this.currentBoundingRadius = radius;

    // Optimal viewing distance based on FOV
    const distance = radius * 2.3;

    // Smooth elevated perspective
    const targetPos = new THREE.Vector3(0, radius * 0.25, distance);
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    this.controls.minDistance = radius * 0.2;
    this.controls.maxDistance = radius * 6.5;

    this.startCameraTransition(targetPos, lookAtTarget, 0.9);
  }

  // ==========================================
  // SMOOTH CAMERA TRANSITION & ZOOM
  // ==========================================
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public startCameraTransition(targetPos: THREE.Vector3, lookAtTarget: THREE.Vector3, duration = 0.8) {
    this.cameraStartPos.copy(this.camera.position);
    this.cameraStartTarget.copy(this.controls.target);
    this.cameraTargetPos.copy(targetPos);
    this.cameraLookAtTarget.copy(lookAtTarget);
    this.cameraTransitionElapsed = 0;
    this.cameraTransitionDuration = duration;
    this.isCameraTransitioning = true;
  }

  /**
   * Smooth animated zoom by factor
   * factor > 0 zooms in, factor < 0 zooms out
   */
  public smoothZoom(factor: number) {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    const currentDist = this.camera.position.distanceTo(this.controls.target);
    const step = currentDist * factor;
    const newPos = this.camera.position.clone().addScaledVector(forward, step);

    const newDist = newPos.distanceTo(this.controls.target);
    if (newDist >= this.controls.minDistance && newDist <= this.controls.maxDistance) {
      this.startCameraTransition(newPos, this.controls.target, 0.5);
    }
  }

  public zoomIn() {
    this.smoothZoom(0.35);
  }

  public zoomOut() {
    this.smoothZoom(-0.4);
  }

  public resetCamera() {
    const distance = this.currentBoundingRadius * 2.3;
    const targetPos = new THREE.Vector3(0, this.currentBoundingRadius * 0.25, distance);
    this.startCameraTransition(targetPos, new THREE.Vector3(0, 0, 0), 0.8);
  }

  // ==========================================
  // VIEW PRESETS
  // ==========================================
  public setViewPreset(preset: 'anterior' | 'posterior' | 'lateral-left' | 'lateral-right' | 'superior' | 'inferior' | 'isometric') {
    const d = this.currentBoundingRadius * 2.3;
    const pos = new THREE.Vector3();
    const lookAt = new THREE.Vector3(0, 0, 0);

    switch (preset) {
      case 'anterior':
        pos.set(0, 0, d);
        break;
      case 'posterior':
        pos.set(0, 0, -d);
        break;
      case 'lateral-left':
        pos.set(-d, 0, 0);
        break;
      case 'lateral-right':
        pos.set(d, 0, 0);
        break;
      case 'superior':
        pos.set(0, d, 0.01);
        break;
      case 'inferior':
        pos.set(0, -d, 0.01);
        break;
      case 'isometric':
        pos.set(d * 0.65, d * 0.55, d * 0.65);
        break;
    }

    this.startCameraTransition(pos, lookAt, 0.8);
  }

  // ==========================================
  // INTERACTIVE TOOLS
  // ==========================================
  public toggleAutoRotate(enable?: boolean): boolean {
    const newState = enable !== undefined ? enable : !this.controls.autoRotate;
    this.controls.autoRotate = newState;
    if (this.callbacks?.onAutoRotateChange) {
      this.callbacks.onAutoRotateChange(newState);
    }
    return newState;
  }

  public toggleWireframe(enable?: boolean): boolean {
    if (!this.organMaterial) return false;
    const newState = enable !== undefined ? enable : !this.organMaterial.wireframe;
    this.organMaterial.wireframe = newState;
    if (this.callbacks?.onWireframeChange) {
      this.callbacks.onWireframeChange(newState);
    }
    return newState;
  }

  public setClipping(axis: 'x' | 'y' | 'z' | 'none', position: number) {
    if (axis === 'none') {
      this.clippingPlane.set(new THREE.Vector3(1, 0, 0), 100);
      return;
    }

    const normal = new THREE.Vector3();
    if (axis === 'x') normal.set(1, 0, 0);
    else if (axis === 'y') normal.set(0, 1, 0);
    else normal.set(0, 0, 1);

    // Plane offset scaled by organ bounding radius
    const planeDistance = -position * this.currentBoundingRadius * 1.2;
    this.clippingPlane.set(normal, planeDistance);
  }

  // ==========================================
  // EVENT LISTENERS & RESIZE
  // ==========================================
  private setupEventListeners() {
    window.addEventListener('resize', this.onResize);
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

  // ==========================================
  // ANIMATION LOOP
  // ==========================================
  private animate = () => {
    if (this.isDisposed) return;
    this.reqId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

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

    // 2. Controls update (handles auto-rotation & inertia)
    this.controls.update();

    // 3. Render scene
    this.renderer.render(this.scene, this.camera);
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
    if (dom && dom.parentElement) {
      dom.parentElement.removeChild(dom);
    }
    this.controls?.dispose();
    this.renderer?.dispose();
  }
}
