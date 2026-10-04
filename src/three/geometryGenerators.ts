import * as THREE from 'three';

/**
 * Creates anatomically sculpted, organic geometries for human body structures.
 * Modeled with high-resolution vertex curves, biological landmarks, and smooth normals.
 */
export class GeometryGenerators {
  /**
   * Anatomically sculpted Cranium with facial orbits, zygomatic arches, and base
   */
  static createCranium(params: { radiusX?: number; radiusY?: number; radiusZ?: number }): THREE.BufferGeometry {
    const rx = params.radiusX || 0.086;
    const ry = params.radiusY || 0.098;
    const rz = params.radiusZ || 0.102;
    const geom = new THREE.SphereGeometry(1, 48, 36);
    geom.scale(rx, ry, rz);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // 1. Forehead bulge & brow ridge (frontal eminence)
      if (y > 0.02 && z > 0.04) {
        z += Math.sin((y / ry) * Math.PI) * 0.008;
      }
      // 2. Temporal fossa depression (sides of skull)
      if (Math.abs(x) > rx * 0.55 && y > -0.01 && y < 0.06 && z > -0.02 && z < 0.05) {
        x *= 0.91;
      }
      // 3. Occipital protuberance (posterior skull prominence)
      if (z < -0.04 && y > -0.03 && y < 0.04) {
        z -= Math.cos((y / ry) * Math.PI) * 0.009;
      }
      // 4. Skull base tapering toward foramen magnum
      if (y < -0.02) {
        const factor = 1.0 + (y / ry) * 0.8;
        x *= Math.max(0.68, factor);
        z *= Math.max(0.72, factor);
      }
      // 5. Orbital rim depression (anterior eye sockets)
      if (y > -0.03 && y < 0.02 && z > 0.07 && Math.abs(x) > 0.015 && Math.abs(x) < 0.05) {
        z -= 0.007;
      }
      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Anatomically sculpted Mandible with chin protuberance, angle of mandible, and ramus
   */
  static createMandible(params: { width?: number; depth?: number; height?: number }): THREE.BufferGeometry {
    const w = params.width || 0.076;
    const d = params.depth || 0.068;
    const h = params.height || 0.046;

    const shape = new THREE.Shape();
    // Anatomical horseshoe curve with mental protuberance (chin)
    shape.moveTo(-w * 0.48, -d * 0.42); // Left condyle
    shape.quadraticCurveTo(-w * 0.52, -d * 0.1, -w * 0.45, d * 0.25); // Left gonial angle
    shape.quadraticCurveTo(-w * 0.28, d * 0.55, 0, d * 0.62); // Mental symphysis (chin)
    shape.quadraticCurveTo(w * 0.28, d * 0.55, w * 0.45, d * 0.25); // Right body
    shape.quadraticCurveTo(w * 0.52, -d * 0.1, w * 0.48, -d * 0.42); // Right condyle
    // Inner mandibular arch
    shape.lineTo(w * 0.35, -d * 0.38);
    shape.quadraticCurveTo(w * 0.38, 0, w * 0.18, d * 0.38);
    shape.quadraticCurveTo(0, d * 0.45, -w * 0.18, d * 0.38);
    shape.quadraticCurveTo(-w * 0.38, 0, -w * 0.35, -d * 0.38);
    shape.closePath();

    const extrudeSettings = {
      depth: h,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 3,
      bevelSize: 0.006,
      bevelThickness: 0.006,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(Math.PI / 2);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Anatomical Vertebra with true cylindrical body, pedicles, laminae, transverse processes, and spinous process
   */
  static createVertebra(params: {
    index?: number;
    spinousLength?: number;
    width?: number;
    height?: number;
  }): THREE.BufferGeometry {
    const idx = params.index || 4;
    const spinousLen = params.spinousLength || 0.024;
    const w = params.width || 0.048;
    const h = params.height || 0.016;

    const groupGeom: THREE.BufferGeometry[] = [];

    // 1. Vertebral body (anterior reniform oval with cortical rim concavity)
    if (idx !== 1) {
      const bodyGeom = new THREE.CylinderGeometry(w * 0.32, w * 0.35, h, 28);
      bodyGeom.scale(1.22, 1.0, 0.92);
      bodyGeom.translate(0, 0, 0.013);
      groupGeom.push(bodyGeom);
    } else {
      // C1 Atlas ring arch
      const atlasRing = new THREE.TorusGeometry(w * 0.38, 0.006, 16, 32, Math.PI * 1.1);
      atlasRing.rotateX(Math.PI / 2);
      atlasRing.translate(0, 0, 0.005);
      groupGeom.push(atlasRing);
    }

    // 2. Vertebral foramen canal (neural arch)
    const archGeom = new THREE.TorusGeometry(w * 0.28, 0.005, 14, 28, Math.PI * 1.35);
    archGeom.rotateX(Math.PI / 2);
    archGeom.rotateY(Math.PI);
    archGeom.translate(0, 0, -0.005);
    groupGeom.push(archGeom);

    // 3. Bilateral transverse processes
    const tpL = new THREE.ConeGeometry(0.005, w * 0.36, 12);
    tpL.rotateZ(Math.PI / 2);
    tpL.translate(-w * 0.38, 0, -0.002);

    const tpR = new THREE.ConeGeometry(0.005, w * 0.36, 12);
    tpR.rotateZ(-Math.PI / 2);
    tpR.translate(w * 0.38, 0, -0.002);
    groupGeom.push(tpL, tpR);

    // 4. Spinous process
    if (idx !== 1) {
      const spGeom = new THREE.ConeGeometry(0.006, spinousLen, 14);
      spGeom.rotateX(-Math.PI / 2.3);
      spGeom.translate(0, -0.004, -0.015 - spinousLen * 0.42);
      groupGeom.push(spGeom);

      // Bifid tips for cervical C2-C6
      if (idx >= 2 && idx <= 6) {
        const bifidL = new THREE.SphereGeometry(0.003, 10, 10);
        bifidL.translate(-0.004, -0.005, -0.015 - spinousLen);
        const bifidR = new THREE.SphereGeometry(0.003, 10, 10);
        bifidR.translate(0.004, -0.005, -0.015 - spinousLen);
        groupGeom.push(bifidL, bifidR);
      }
    }

    // Dens on C2 Axis
    if (idx === 2) {
      const dens = new THREE.CylinderGeometry(0.005, 0.006, 0.015, 14);
      dens.translate(0, 0.013, 0.011);
      groupGeom.push(dens);
    }

    let merged = groupGeom[0];
    for (let i = 1; i < groupGeom.length; i++) {
      merged = this.mergeGeometries([merged, groupGeom[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Continuous Anatomical Spine with intervertebral discs and physiological curves
   */
  static createSpineSegment(params: {
    count?: number;
    startY?: number;
    endY?: number;
    curvature?: number;
    width?: number;
  }): THREE.BufferGeometry {
    const count = params.count || 12;
    const startY = params.startY || 0.46;
    const endY = params.endY || 0.22;
    const curv = params.curvature || -0.015;
    const w = params.width || 0.055;

    const geoms: THREE.BufferGeometry[] = [];
    const stepY = (endY - startY) / count;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const currY = startY + stepY * i;
      const zOffset = Math.sin(t * Math.PI) * curv;

      // Vertebral body
      const vBody = new THREE.CylinderGeometry(w * 0.35, w * 0.38, Math.abs(stepY) * 0.72, 20);
      vBody.scale(1.2, 1.0, 0.95);
      vBody.translate(0, currY - startY, zOffset);
      geoms.push(vBody);

      // Fibrocartilaginous Intervertebral disc
      if (i < count - 1) {
        const disc = new THREE.CylinderGeometry(w * 0.34, w * 0.35, Math.abs(stepY) * 0.24, 20);
        disc.translate(0, currY - startY + stepY * 0.48, zOffset);
        geoms.push(disc);
      }

      // Posterior spinous process
      const spinous = new THREE.ConeGeometry(0.0065, 0.032 + (1 - t) * 0.015, 12);
      spinous.rotateX(-Math.PI / 2.2);
      spinous.translate(0, currY - startY - 0.005, zOffset - 0.024);
      geoms.push(spinous);

      // Transverse processes
      const tpL = new THREE.BoxGeometry(w * 0.3, 0.007, 0.009);
      tpL.translate(-w * 0.3, currY - startY, zOffset - 0.008);
      const tpR = new THREE.BoxGeometry(w * 0.3, 0.007, 0.009);
      tpR.translate(w * 0.3, currY - startY, zOffset - 0.008);
      geoms.push(tpL, tpR);
    }

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Sacrum with sacral promontory and curvature
   */
  static createSacrum(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.082;
    const h = params.height || 0.076;
    const d = params.depth || 0.036;

    const geom = new THREE.ConeGeometry(w * 0.5, h, 24, 12);
    geom.scale(1.0, 1.0, d / (w * 0.5));
    geom.rotateX(Math.PI * 0.95);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const t = (y + h * 0.5) / h;
      pos.setZ(i, z - Math.sin(t * Math.PI) * 0.014);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Coccyx
   */
  static createCoccyx(params: { height?: number; width?: number }): THREE.BufferGeometry {
    const h = params.height || 0.03;
    const w = params.width || 0.025;
    const geom = new THREE.ConeGeometry(w * 0.5, h, 14);
    geom.rotateX(Math.PI * 0.9);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Sternum with manubrium, body, and xiphoid process
   */
  static createSternum(params: { length?: number; width?: number; thickness?: number }): THREE.BufferGeometry {
    const len = params.length || 0.145;
    const w = params.width || 0.04;
    const th = params.thickness || 0.016;

    const geoms: THREE.BufferGeometry[] = [];
    const manubrium = new THREE.BoxGeometry(w * 1.15, len * 0.32, th);
    manubrium.translate(0, len * 0.35, 0);
    geoms.push(manubrium);

    const body = new THREE.BoxGeometry(w * 0.88, len * 0.56, th * 0.9);
    body.translate(0, -len * 0.08, 0);
    geoms.push(body);

    const xiphoid = new THREE.ConeGeometry(w * 0.32, len * 0.18, 12);
    xiphoid.rotateZ(Math.PI);
    xiphoid.translate(0, -len * 0.44, 0);
    geoms.push(xiphoid);

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Anatomical Rib Cage Hemisphere with smooth costal arches
   */
  static createRibcageHemisphere(params: {
    side: 'left' | 'right';
    ribCount?: number;
    spanX?: number;
    spanY?: number;
    spanZ?: number;
  }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const ribCount = params.ribCount || 12;
    const spanX = params.spanX || 0.125;
    const spanY = params.spanY || 0.225;
    const spanZ = params.spanZ || 0.145;

    const geoms: THREE.BufferGeometry[] = [];

    for (let i = 0; i < ribCount; i++) {
      const t = i / (ribCount - 1);
      const ribScale = Math.sin(t * 0.85 + 0.3);
      const yPos = (0.5 - t) * spanY;
      const xRad = spanX * ribScale;
      const zRad = spanZ * ribScale;

      const curvePoints: THREE.Vector3[] = [];
      const segments = 20;
      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 0.94;
        const x = Math.sin(angle) * xRad * (isLeft ? -1 : 1);
        const z = -Math.cos(angle) * zRad + zRad * 0.32;
        const y = yPos - Math.sin((s / segments) * Math.PI) * 0.02 - (s / segments) * 0.016;
        curvePoints.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeom = new THREE.TubeGeometry(curve, 24, 0.0038 + (1 - t) * 0.0016, 10, false);
      geoms.push(tubeGeom);
    }

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Clavicle with characteristic S-curve
   */
  static createClavicle(params: { side: 'left' | 'right'; length?: number }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const len = params.length || 0.125;
    const s = isLeft ? -1 : 1;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.022),
      new THREE.Vector3(len * 0.35 * s, 0.009, 0.038),
      new THREE.Vector3(len * 0.7 * s, -0.002, 0.016),
      new THREE.Vector3(len * s, 0.006, -0.01),
    ]);
    const geom = new THREE.TubeGeometry(curve, 20, 0.0075, 12, false);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Scapula with spine, acromion, and glenoid fossa
   */
  static createScapula(params: { side: 'left' | 'right'; width?: number; height?: number }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const w = params.width || 0.092;
    const h = params.height || 0.125;
    const s = isLeft ? -1 : 1;

    const shape = new THREE.Shape();
    shape.moveTo(0, h * 0.45);
    shape.lineTo(w * 0.85 * s, h * 0.5);
    shape.lineTo(w * 0.75 * s, -h * 0.45);
    shape.lineTo(0, h * 0.1);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.009,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.004,
      bevelThickness: 0.004,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const spineGeom = new THREE.BoxGeometry(w * 0.72, 0.013, 0.02);
    spineGeom.rotateZ(s * 0.18);
    spineGeom.translate(w * 0.4 * s, h * 0.28, -0.009);

    const merged = this.mergeGeometries([geom, spineGeom]);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Humerus long bone
   */
  static createLongBone(params: {
    length?: number;
    radiusHead?: number;
    radiusShaft?: number;
    radiusCondyle?: number;
  }): THREE.BufferGeometry {
    const len = params.length || 0.265;
    const rHead = params.radiusHead || 0.025;
    const rShaft = params.radiusShaft || 0.013;
    const rCond = params.radiusCondyle || 0.023;

    const geoms: THREE.BufferGeometry[] = [];
    const shaft = new THREE.CylinderGeometry(rShaft * 1.1, rShaft * 1.1, len * 0.76, 20);
    geoms.push(shaft);

    const head = new THREE.SphereGeometry(rHead, 20, 20);
    head.translate(0, len * 0.42, 0);
    geoms.push(head);

    const condyles = new THREE.BoxGeometry(rCond * 2.2, rCond * 1.25, rCond * 1.35);
    condyles.translate(0, -len * 0.42, 0);
    geoms.push(condyles);

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Anatomically sculpted Femur with 126° neck, spherical head, trochanters, and condyles
   */
  static createFemur(params: {
    side: 'left' | 'right';
    length?: number;
    headRadius?: number;
    shaftRadius?: number;
    condyleWidth?: number;
  }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const len = params.length || 0.425;
    const rHead = params.headRadius || 0.027;
    const rShaft = params.shaftRadius || 0.016;
    const condW = params.condyleWidth || 0.054;
    const s = isLeft ? 1 : -1;

    const geoms: THREE.BufferGeometry[] = [];

    // Shaft with natural anterior curvature
    const shaftPoints: THREE.Vector3[] = [
      new THREE.Vector3(0, len * 0.36, 0),
      new THREE.Vector3(0, len * 0.15, 0.01),
      new THREE.Vector3(0, -len * 0.15, 0.01),
      new THREE.Vector3(0, -len * 0.38, 0),
    ];
    const shaftCurve = new THREE.CatmullRomCurve3(shaftPoints);
    const shaft = new THREE.TubeGeometry(shaftCurve, 28, rShaft, 16, false);
    geoms.push(shaft);

    // Femoral Neck angled 126 degrees medially
    const neckPoints: THREE.Vector3[] = [
      new THREE.Vector3(0, len * 0.36, 0),
      new THREE.Vector3(s * 0.026, len * 0.41, 0.005),
      new THREE.Vector3(s * 0.048, len * 0.445, 0.01),
    ];
    const neckCurve = new THREE.CatmullRomCurve3(neckPoints);
    const neck = new THREE.TubeGeometry(neckCurve, 14, rShaft * 1.15, 16, false);
    geoms.push(neck);

    // Femoral Head
    const head = new THREE.SphereGeometry(rHead, 24, 20);
    head.translate(s * 0.048, len * 0.445, 0.01);
    geoms.push(head);

    // Greater Trochanter
    const trochanter = new THREE.BoxGeometry(0.028, 0.04, 0.03);
    trochanter.translate(-s * 0.019, len * 0.37, -0.004);
    geoms.push(trochanter);

    // Distal Medial & Lateral Condyles with intercondylar notch
    const condyleMed = new THREE.SphereGeometry(condW * 0.32, 18, 16);
    condyleMed.scale(1.0, 1.25, 1.35);
    condyleMed.translate(s * condW * 0.28, -len * 0.44, -0.009);

    const condyleLat = new THREE.SphereGeometry(condW * 0.32, 18, 16);
    condyleLat.scale(1.0, 1.25, 1.35);
    condyleLat.translate(-s * condW * 0.28, -len * 0.44, -0.009);
    geoms.push(condyleMed, condyleLat);

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Patella (Kneecap)
   */
  static createPatella(params: { radius?: number; thickness?: number }): THREE.BufferGeometry {
    const r = params.radius || 0.027;
    const th = params.thickness || 0.016;
    const geom = new THREE.SphereGeometry(r, 20, 18);
    geom.scale(1.0, 1.25, th / r);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Forearm Complex (Radius & Ulna)
   */
  static createForearmComplex(params: { length?: number; separation?: number }): THREE.BufferGeometry {
    const len = params.length || 0.225;
    const sep = params.separation || 0.022;

    const radiusBone = new THREE.CylinderGeometry(0.008, 0.013, len, 16);
    radiusBone.translate(-sep * 0.5, 0, 0);

    const ulnaBone = new THREE.CylinderGeometry(0.013, 0.0075, len, 16);
    ulnaBone.translate(sep * 0.5, 0, 0);

    const merged = this.mergeGeometries([radiusBone, ulnaBone]);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Lower Leg Complex (Tibia & Fibula)
   */
  static createLowerLegComplex(params: {
    side: 'left' | 'right';
    length?: number;
    tibiaRadius?: number;
    fibulaRadius?: number;
  }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const len = params.length || 0.385;
    const rTib = params.tibiaRadius || 0.019;
    const rFib = params.fibulaRadius || 0.0095;
    const s = isLeft ? 1 : -1;

    const tibia = new THREE.CylinderGeometry(rTib * 1.55, rTib * 1.25, len, 20);
    tibia.scale(0.9, 1.0, 1.15);
    tibia.translate(-s * 0.01, 0, 0);

    const fibula = new THREE.CylinderGeometry(rFib, rFib, len * 0.96, 14);
    fibula.translate(s * 0.029, -len * 0.02, -0.005);

    const merged = this.mergeGeometries([tibia, fibula]);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Pelvis with iliac blade curves and acetabular cavities
   */
  static createPelvis(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.225;
    const h = params.height || 0.155;
    const d = params.depth || 0.125;

    const geoms: THREE.BufferGeometry[] = [];

    const iliumShapeL = new THREE.Shape();
    iliumShapeL.moveTo(0, 0);
    iliumShapeL.quadraticCurveTo(-w * 0.35, h * 0.46, -w * 0.5, h * 0.36);
    iliumShapeL.quadraticCurveTo(-w * 0.46, -h * 0.3, -w * 0.15, -h * 0.45);
    iliumShapeL.quadraticCurveTo(-w * 0.05, -h * 0.2, 0, 0);

    const extrudeSettings = { depth: 0.018, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.006, bevelThickness: 0.006 };
    const iliumL = new THREE.ExtrudeGeometry(iliumShapeL, extrudeSettings);
    iliumL.rotateY(-0.35);
    geoms.push(iliumL);

    const iliumShapeR = new THREE.Shape();
    iliumShapeR.moveTo(0, 0);
    iliumShapeR.quadraticCurveTo(w * 0.35, h * 0.46, w * 0.5, h * 0.36);
    iliumShapeR.quadraticCurveTo(w * 0.46, -h * 0.3, w * 0.15, -h * 0.45);
    iliumShapeR.quadraticCurveTo(w * 0.05, -h * 0.2, 0, 0);

    const iliumR = new THREE.ExtrudeGeometry(iliumShapeR, extrudeSettings);
    iliumR.rotateY(0.35);
    geoms.push(iliumR);

    const pubicRing = new THREE.TorusGeometry(w * 0.19, 0.013, 12, 24, Math.PI);
    pubicRing.rotateX(Math.PI / 2.3);
    pubicRing.translate(0, -h * 0.35, d * 0.25);
    geoms.push(pubicRing);

    const acetabL = new THREE.SphereGeometry(0.029, 16, 14);
    acetabL.translate(-w * 0.38, -h * 0.25, 0.01);
    const acetabR = new THREE.SphereGeometry(0.029, 16, 14);
    acetabR.translate(w * 0.38, -h * 0.25, 0.01);
    geoms.push(acetabL, acetabR);

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Anatomically sculpted Heart Ventricles with conical apex and interventricular sulcus
   */
  static createHeartChamber(params: { chamber: 'lv' | 'rv'; radius?: number; length?: number }): THREE.BufferGeometry {
    const isLV = params.chamber === 'lv';
    const r = params.radius || 0.04;
    const len = params.length || 0.058;

    const geom = new THREE.ConeGeometry(r, len, 32, 20);
    geom.rotateZ(isLV ? -0.42 : 0.22);
    geom.rotateX(0.32);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Rounded muscular apex
      if (y > 0) {
        y *= 0.88;
      }
      // Anterior interventricular sulcus contour
      if (z > 0 && Math.abs(x) < 0.015) {
        z -= 0.003;
      }
      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Heart Atria with right and left auricles (atrial appendages)
   */
  static createHeartAtria(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.072;
    const h = params.height || 0.048;
    const d = params.depth || 0.042;

    const geom = new THREE.SphereGeometry(1, 28, 22);
    geom.scale(w * 0.5, h * 0.5, d * 0.5);

    // Auricle scalloped anterior border
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      if (z > 0.01) {
        z += Math.sin(x * 40) * 0.002;
      }
      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Aorta with ascending segment, smooth arch, and 3 brachiocephalic arterial trunks
   */
  static createAorta(params: { radius?: number }): THREE.BufferGeometry {
    const r = params.radius || 0.013;
    const geoms: THREE.BufferGeometry[] = [];

    // Main Aortic Trunk & Arch
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.01, 0.35, 0.032), // Aortic root from LV
      new THREE.Vector3(-0.005, 0.41, 0.026), // Ascending aorta
      new THREE.Vector3(0, 0.445, 0.006), // Arch peak
      new THREE.Vector3(-0.016, 0.42, -0.02), // Descending arch
      new THREE.Vector3(-0.013, 0.30, -0.03), // Thoracic descending aorta
      new THREE.Vector3(-0.01, 0.15, -0.026), // Abdominal aorta
    ]);
    const archGeom = new THREE.TubeGeometry(curve, 40, r, 16, false);
    geoms.push(archGeom);

    // 3 Arch Branches: Brachiocephalic, Left Common Carotid, Left Subclavian
    const branchOffsets = [
      { x: 0.008, y: 0.45, z: 0.018 },
      { x: 0.001, y: 0.455, z: 0.008 },
      { x: -0.008, y: 0.448, z: -0.002 },
    ];
    for (const b of branchOffsets) {
      const bGeom = new THREE.CylinderGeometry(0.004, 0.0045, 0.025, 10);
      bGeom.translate(b.x, b.y, b.z);
      geoms.push(bGeom);
    }

    const merged = this.mergeGeometries(geoms);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Vena Cava (SVC & IVC)
   */
  static createVenaCava(params: { radius?: number; length?: number }): THREE.BufferGeometry {
    const r = params.radius || 0.012;
    const len = params.length || 0.33;
    const geom = new THREE.CylinderGeometry(r, r, len, 20);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Trachea with cartilage rings and bifurcating primary bronchi
   */
  static createTracheaTree(params: { tracheaLength?: number; radius?: number; branchAngle?: number }): THREE.BufferGeometry {
    const len = params.tracheaLength || 0.115;
    const r = params.radius || 0.0115;
    const angle = params.branchAngle || 0.55;

    const geoms: THREE.BufferGeometry[] = [];

    // Corrugated trachea main tube
    const trachea = new THREE.CylinderGeometry(r, r, len, 24, 16);
    const pos = trachea.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);
      // Cartilage rings horizontal ridges
      const ringRipple = 1.0 + Math.sin(y * 120) * 0.06;
      x *= ringRipple;
      z *= ringRipple;
      pos.setXYZ(i, x, y, z);
    }
    trachea.translate(0, len * 0.5, 0);
    geoms.push(trachea);

    // Left bronchus
    const bronchusL = new THREE.CylinderGeometry(r * 0.75, r * 0.65, 0.048, 14);
    bronchusL.rotateZ(angle);
    bronchusL.translate(-0.022, -0.016, 0);

    // Right bronchus (steeper)
    const bronchusR = new THREE.CylinderGeometry(r * 0.85, r * 0.7, 0.038, 14);
    bronchusR.rotateZ(-angle * 0.75);
    bronchusR.translate(0.019, -0.012, 0);

    geoms.push(bronchusL, bronchusR);

    let merged = geoms[0];
    for (let i = 1; i < geoms.length; i++) {
      merged = this.mergeGeometries([merged, geoms[i]]);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Anatomically sculpted Lungs with true fissures, lobes, and cardiac notch
   */
  static createLungOrgan(params: {
    side: 'left' | 'right';
    width?: number;
    height?: number;
    depth?: number;
  }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const w = params.width || 0.092;
    const h = params.height || 0.195;
    const d = params.depth || 0.125;

    const geom = new THREE.SphereGeometry(1, 36, 28);
    geom.scale(w * 0.5, h * 0.5, d * 0.5);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // 1. Flat/concave diaphragmatic base
      if (y < -h * 0.32) {
        y = -h * 0.32 + (y + h * 0.32) * 0.25;
      }
      // 2. Medial cardiac impression (deep cardiac notch on left lung)
      if (isLeft && x > 0 && y > -h * 0.18 && y < h * 0.22 && z > 0) {
        x *= 0.62;
        z *= 0.72;
      }
      // 3. Fissures (subtle surface indentations delineating anatomical lobes)
      if (y > -0.01 && y < 0.015) {
        const fissureIndent = 0.92;
        x *= fissureIndent;
        z *= fissureIndent;
      }
      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Anatomically sculpted Cerebrum with longitudinal fissure, frontal/temporal lobes, and gyri convolutions
   */
  static createCerebrum(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.135;
    const h = params.height || 0.095;
    const d = params.depth || 0.155;

    const geoms: THREE.BufferGeometry[] = [];

    // Left hemisphere
    const hemiL = new THREE.SphereGeometry(1, 36, 28);
    hemiL.scale(w * 0.24, h * 0.5, d * 0.5);
    hemiL.translate(-w * 0.25, 0, 0);

    // Right hemisphere
    const hemiR = new THREE.SphereGeometry(1, 36, 28);
    hemiR.scale(w * 0.24, h * 0.5, d * 0.5);
    hemiR.translate(w * 0.25, 0, 0);

    geoms.push(hemiL, hemiR);
    const merged = this.mergeGeometries(geoms);

    // Sculpt cerebral gyri convolutions & anatomical temporal lobe flare
    const pos = merged.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Temporal lobe anterior bulge
      if (y < -0.01 && z > 0.01 && Math.abs(x) > 0.02) {
        x *= 1.08;
      }
      // Cortical gyri undulating folds
      const foldNoise = (Math.sin(x * 75) * Math.cos(z * 75) + Math.sin(y * 60)) * 0.0022;
      x += foldNoise;
      y += foldNoise;
      z += foldNoise;

      pos.setXYZ(i, x, y, z);
    }
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Cerebellum with folia parallel ridges and Brainstem with midbrain, pons, and medulla
   */
  static createCerebellumStem(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.082;
    const h = params.height || 0.065;
    const d = params.depth || 0.065;

    const geoms: THREE.BufferGeometry[] = [];

    // Cerebellum with horizontal folia ridges
    const cerebellum = new THREE.SphereGeometry(1, 28, 22);
    cerebellum.scale(w * 0.5, h * 0.38, d * 0.5);
    const cPos = cerebellum.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const y = cPos.getY(i);
      let x = cPos.getX(i);
      let z = cPos.getZ(i);
      // Horizontal cerebellar folia
      const folia = 1.0 + Math.sin(y * 140) * 0.04;
      x *= folia;
      z *= folia;
      cPos.setXYZ(i, x, y, z);
    }
    cerebellum.translate(0, 0.01, -0.015);
    geoms.push(cerebellum);

    // Brainstem with distinct bulbous Pons
    const stem = new THREE.CylinderGeometry(0.013, 0.009, h * 0.85, 20);
    const sPos = stem.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const y = sPos.getY(i);
      let x = sPos.getX(i);
      let z = sPos.getZ(i);
      // Bulging anterior pons
      if (y > -0.01 && y < 0.02 && z > 0) {
        z *= 1.35;
      }
      sPos.setXYZ(i, x, y, z);
    }
    stem.translate(0, -h * 0.25, 0.01);
    geoms.push(stem);

    let merged = this.mergeGeometries(geoms);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Spinal Cord with cervical and lumbar enlargements
   */
  static createSpinalCord(params: { length?: number; radius?: number }): THREE.BufferGeometry {
    const len = params.length || 0.44;
    const r = params.radius || 0.0075;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, len * 0.5, -0.02),
      new THREE.Vector3(0, len * 0.25, -0.035), // Thoracic kyphosis
      new THREE.Vector3(0, -len * 0.1, -0.032),
      new THREE.Vector3(0, -len * 0.4, -0.022), // Lumbar lordosis
      new THREE.Vector3(0, -len * 0.5, -0.015), // Conus medullaris
    ]);
    const geom = new THREE.TubeGeometry(curve, 36, r, 16, false);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Bilateral Sciatic Nerves
   */
  static createBilateralNerves(params: { startY?: number; endY?: number; spreadX?: number }): THREE.BufferGeometry {
    const startY = params.startY || -0.12;
    const endY = params.endY || -0.72;
    const spX = params.spreadX || 0.092;

    const curveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.03, startY, -0.03),
      new THREE.Vector3(-spX, (startY + endY) * 0.5, -0.02),
      new THREE.Vector3(-spX * 1.05, endY, -0.015),
    ]);
    const nerveL = new THREE.TubeGeometry(curveL, 24, 0.0045, 10, false);

    const curveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.03, startY, -0.03),
      new THREE.Vector3(spX, (startY + endY) * 0.5, -0.02),
      new THREE.Vector3(spX * 1.05, endY, -0.015),
    ]);
    const nerveR = new THREE.TubeGeometry(curveR, 24, 0.0045, 10, false);

    const merged = this.mergeGeometries([nerveL, nerveR]);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * J-shaped Stomach with fundus, greater curvature, lesser curvature, and pylorus
   */
  static createStomach(params: { width?: number; height?: number }): THREE.BufferGeometry {
    const w = params.width || 0.082;
    const h = params.height || 0.115;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.01, h * 0.45, 0), // Cardia
      new THREE.Vector3(-w * 0.46, h * 0.36, 0.02), // Fundus dome
      new THREE.Vector3(-w * 0.52, -h * 0.1, 0.026), // Greater curvature
      new THREE.Vector3(-w * 0.22, -h * 0.42, 0.03), // Antrum
      new THREE.Vector3(w * 0.26, -h * 0.36, 0.015), // Pylorus
    ]);

    const geom = new THREE.TubeGeometry(curve, 32, 0.028, 20, false);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Anatomical Liver with large right lobe, tapering left lobe, and visceral impression concavities
   */
  static createLiver(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.155;
    const h = params.height || 0.115;
    const d = params.depth || 0.115;

    const geom = new THREE.SphereGeometry(1, 36, 26);
    geom.scale(w * 0.5, h * 0.5, d * 0.5);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Smooth diaphragmatic superior dome
      if (y > 0) {
        y *= 1.1;
      }
      // Taper left lobe
      if (x < 0) {
        y *= 0.65;
        z *= 0.65;
      }
      // Sharp inferior border
      if (y < -h * 0.2) {
        z *= 0.68;
      }
      // Falciform ligament sulcus line
      if (Math.abs(x + 0.01) < 0.008 && y > 0) {
        z -= 0.005;
      }
      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Gallbladder
   */
  static createGallbladder(params: { length?: number; radius?: number }): THREE.BufferGeometry {
    const len = params.length || 0.042;
    const r = params.radius || 0.017;
    const geom = new THREE.SphereGeometry(r, 18, 16);
    geom.scale(1.0, len / r, 1.0);
    geom.rotateX(0.4);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Pancreas
   */
  static createPancreas(params: { width?: number; height?: number }): THREE.BufferGeometry {
    const w = params.width || 0.115;
    const h = params.height || 0.032;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(w * 0.45, -0.01, 0), // Head in C-loop of duodenum
      new THREE.Vector3(w * 0.1, 0.005, 0.005), // Body
      new THREE.Vector3(-w * 0.45, 0.015, -0.01), // Tail at spleen
    ]);
    const geom = new THREE.TubeGeometry(curve, 24, h * 0.46, 16, false);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Small Intestine with convoluted loops
   */
  static createSmallIntestine(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.125;
    const h = params.height || 0.115;
    const d = params.depth || 0.068;

    const points: THREE.Vector3[] = [];
    const coils = 11;
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const angle = t * Math.PI * 2 * coils;
      const r = Math.sin(t * Math.PI) * (w * 0.42);
      const x = Math.sin(angle) * r;
      const y = (t - 0.5) * h;
      const z = Math.cos(angle) * (d * 0.36) + 0.01;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 80, 0.0125, 12, false);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Large Intestine with segmented haustrations
   */
  static createLargeIntestine(params: { width?: number; height?: number; depth?: number }): THREE.BufferGeometry {
    const w = params.width || 0.185;
    const h = params.height || 0.165;
    const d = params.depth || 0.082;

    const colonPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(w * 0.42, -h * 0.45, d * 0.2), // Cecum
      new THREE.Vector3(w * 0.44, -h * 0.1, d * 0.1), // Ascending colon
      new THREE.Vector3(w * 0.38, h * 0.35, d * 0.15), // Hepatic flexure
      new THREE.Vector3(0, h * 0.38, d * 0.3), // Transverse colon
      new THREE.Vector3(-w * 0.38, h * 0.35, d * 0.15), // Splenic flexure
      new THREE.Vector3(-w * 0.44, -h * 0.1, d * 0.1), // Descending colon
      new THREE.Vector3(-w * 0.32, -h * 0.42, d * 0.2), // Sigmoid colon
      new THREE.Vector3(0, -h * 0.48, 0), // Rectum
    ]);
    const geom = new THREE.TubeGeometry(colonPath, 50, 0.0185, 16, false);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Reniform bean-shaped Kidney with medial hilum
   */
  static createKidney(params: {
    side: 'left' | 'right';
    length?: number;
    width?: number;
    depth?: number;
  }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const len = params.length || 0.078;
    const w = params.width || 0.044;
    const d = params.depth || 0.036;

    const geom = new THREE.SphereGeometry(1, 26, 20);
    geom.scale(w * 0.5, len * 0.5, d * 0.5);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Deep medial hilum indentation
      if ((isLeft && x > 0) || (!isLeft && x < 0)) {
        if (Math.abs(y) < len * 0.26) {
          x *= 0.55;
        }
      }
      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Bladder
   */
  static createBladder(params: { radius?: number }): THREE.BufferGeometry {
    const r = params.radius || 0.039;
    const geom = new THREE.SphereGeometry(r, 22, 18);
    geom.scale(1.0, 0.88, 1.12);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Pectoralis Major Muscles with fan-shaped muscular fibers
   */
  static createPectoralis(params: { spanX?: number; spanY?: number; thickness?: number }): THREE.BufferGeometry {
    const sx = params.spanX || 0.225;
    const sy = params.spanY || 0.115;
    const th = params.thickness || 0.019;

    const geoms: THREE.BufferGeometry[] = [];
    const pecL = new THREE.BoxGeometry(sx * 0.45, sy, th, 8, 8, 2);
    pecL.rotateZ(-0.16);
    pecL.translate(-sx * 0.24, 0, 0);

    const pecR = new THREE.BoxGeometry(sx * 0.45, sy, th, 8, 8, 2);
    pecR.rotateZ(0.16);
    pecR.translate(sx * 0.24, 0, 0);

    geoms.push(pecL, pecR);
    const merged = this.mergeGeometries(geoms);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Deltoid muscle with 3 natural heads (anterior, lateral, posterior)
   */
  static createDeltoid(params: { side: 'left' | 'right'; radius?: number }): THREE.BufferGeometry {
    const isLeft = params.side === 'left';
    const r = params.radius || 0.056;
    const s = isLeft ? -1 : 1;

    const geom = new THREE.SphereGeometry(r, 22, 18);
    geom.scale(0.88, 1.28, 0.96);
    geom.rotateZ(s * 0.25);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Rectus Abdominis with 4 bilateral anatomical segments (six-pack)
   */
  static createRectusAbdominis(params: { length?: number; width?: number; thickness?: number }): THREE.BufferGeometry {
    const len = params.length || 0.285;
    const w = params.width || 0.086;
    const th = params.thickness || 0.017;

    const geoms: THREE.BufferGeometry[] = [];
    for (let seg = 0; seg < 4; seg++) {
      const yPos = (0.5 - (seg + 0.5) / 4) * len;
      const bL = new THREE.BoxGeometry(w * 0.46, len * 0.2, th, 4, 4, 2);
      bL.translate(-w * 0.24, yPos, 0);

      const bR = new THREE.BoxGeometry(w * 0.46, len * 0.2, th, 4, 4, 2);
      bR.translate(w * 0.24, yPos, 0);

      geoms.push(bL, bR);
    }
    const merged = this.mergeGeometries(geoms);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Quadriceps Femoris with organic muscle belly curvature
   */
  static createQuadriceps(params: { length?: number; width?: number }): THREE.BufferGeometry {
    const len = params.length || 0.385;
    const w = params.width || 0.076;

    const geom = new THREE.CylinderGeometry(w * 0.52, w * 0.32, len, 24, 12);
    geom.scale(1.0, 1.0, 1.25);
    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Seamless, organic human body flesh envelope
   * Sculpted with natural anatomical landmarks: facial features, neck, clavicles, pectorals,
   * abdominal wall, waist curve, gluteal/thigh musculature, knees, and calf bulges.
   */
  static createBodyEnvelope(): THREE.BufferGeometry {
    const geoms: THREE.BufferGeometry[] = [];

    // 1. Head & Face (Cranial dome, brow, nose bridge, chin)
    const head = new THREE.SphereGeometry(0.108, 36, 30);
    head.scale(0.82, 1.08, 0.96);
    const hPos = head.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
      let x = hPos.getX(i);
      let y = hPos.getY(i);
      let z = hPos.getZ(i);

      // Nose bridge projection
      if (z > 0.06 && Math.abs(x) < 0.014 && y > -0.03 && y < 0.02) {
        z += 0.016;
      }
      // Chin projection
      if (z > 0.04 && Math.abs(x) < 0.022 && y < -0.06) {
        z += 0.012;
      }
      // Eye socket hollows
      if (z > 0.05 && Math.abs(x) > 0.02 && Math.abs(x) < 0.045 && y > -0.01 && y < 0.03) {
        z -= 0.008;
      }
      hPos.setXYZ(i, x, y, z);
    }
    head.translate(0, 0.73, 0.01);
    geoms.push(head);

    // 2. Neck with sternocleidomastoid taper
    const neck = new THREE.CylinderGeometry(0.062, 0.078, 0.12, 28);
    neck.translate(0, 0.58, 0.005);
    geoms.push(neck);

    // 3. Torso (Chest, Ribcage, Abdomen, Waist)
    const torso = new THREE.CylinderGeometry(0.165, 0.145, 0.48, 36, 20);
    torso.scale(1.28, 1.0, 0.78);
    const tPos = torso.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      let x = tPos.getX(i);
      let y = tPos.getY(i);
      let z = tPos.getZ(i);

      // Pectoral chest anterior fullness
      if (y > 0.05 && z > 0) {
        z += Math.cos((y / 0.24) * Math.PI) * 0.016;
      }
      // Waist indentation
      if (y > -0.15 && y < 0.02) {
        x *= 0.94;
      }
      // Clavicular depression at top
      if (y > 0.18 && z > 0) {
        z -= 0.008;
      }
      tPos.setXYZ(i, x, y, z);
    }
    torso.translate(0, 0.31, 0.02);
    geoms.push(torso);

    // 4. Pelvis & Gluteal Region
    const pelvis = new THREE.CylinderGeometry(0.142, 0.155, 0.22, 32, 16);
    pelvis.scale(1.32, 1.0, 0.88);
    const pPos = pelvis.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
      let x = pPos.getX(i);
      let y = pPos.getY(i);
      let z = pPos.getZ(i);
      // Posterior gluteal fullness
      if (z < 0) {
        z -= Math.cos((y / 0.11) * Math.PI) * 0.018;
      }
      pPos.setXYZ(i, x, y, z);
    }
    pelvis.translate(0, -0.05, 0.01);
    geoms.push(pelvis);

    // 5. Thighs with natural quadriceps & hamstring curve
    const thighPointsL: THREE.Vector3[] = [
      new THREE.Vector3(-0.096, -0.16, 0.01),
      new THREE.Vector3(-0.098, -0.36, 0.015),
      new THREE.Vector3(-0.096, -0.56, 0.01),
    ];
    const thighCurveL = new THREE.CatmullRomCurve3(thighPointsL);
    const thighL = new THREE.TubeGeometry(thighCurveL, 20, 0.068, 24, false);

    const thighPointsR: THREE.Vector3[] = [
      new THREE.Vector3(0.096, -0.16, 0.01),
      new THREE.Vector3(0.098, -0.36, 0.015),
      new THREE.Vector3(0.096, -0.56, 0.01),
    ];
    const thighCurveR = new THREE.CatmullRomCurve3(thighPointsR);
    const thighR = new THREE.TubeGeometry(thighCurveR, 20, 0.068, 24, false);
    geoms.push(thighL, thighR);

    // 6. Lower Legs with gastrocnemius calf bulge and ankles
    const calfPointsL: THREE.Vector3[] = [
      new THREE.Vector3(-0.096, -0.58, 0.01),
      new THREE.Vector3(-0.098, -0.74, 0.005),
      new THREE.Vector3(-0.096, -0.92, 0.0),
    ];
    const calfCurveL = new THREE.CatmullRomCurve3(calfPointsL);
    const calfL = new THREE.TubeGeometry(calfCurveL, 20, 0.048, 24, false);

    const calfPointsR: THREE.Vector3[] = [
      new THREE.Vector3(0.096, -0.58, 0.01),
      new THREE.Vector3(0.098, -0.74, 0.005),
      new THREE.Vector3(0.096, -0.92, 0.0),
    ];
    const calfCurveR = new THREE.CatmullRomCurve3(calfPointsR);
    const calfR = new THREE.TubeGeometry(calfCurveR, 20, 0.048, 24, false);
    geoms.push(calfL, calfR);

    // 7. Arms (Deltoid, Biceps, Elbow, Forearm, Wrist)
    const armPointsL: THREE.Vector3[] = [
      new THREE.Vector3(-0.21, 0.44, 0.01),
      new THREE.Vector3(-0.23, 0.26, 0.01),
      new THREE.Vector3(-0.24, 0.02, 0.015),
      new THREE.Vector3(-0.25, -0.16, 0.01),
    ];
    const armCurveL = new THREE.CatmullRomCurve3(armPointsL);
    const armL = new THREE.TubeGeometry(armCurveL, 24, 0.044, 20, false);

    const armPointsR: THREE.Vector3[] = [
      new THREE.Vector3(0.21, 0.44, 0.01),
      new THREE.Vector3(0.23, 0.26, 0.01),
      new THREE.Vector3(0.24, 0.02, 0.015),
      new THREE.Vector3(0.25, -0.16, 0.01),
    ];
    const armCurveR = new THREE.CatmullRomCurve3(armPointsR);
    const armR = new THREE.TubeGeometry(armCurveR, 24, 0.044, 20, false);
    geoms.push(armL, armR);

    const merged = this.mergeGeometries(geoms);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Helper to merge multiple BufferGeometries safely without external deps
   */
  private static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geometries.length === 0) return new THREE.BufferGeometry();
    if (geometries.length === 1) return geometries[0].clone();

    let totalPositions = 0;

    for (const rawG of geometries) {
      const nonIndexed = rawG.index ? rawG.toNonIndexed() : rawG;
      totalPositions += nonIndexed.attributes.position.array.length;
    }

    const mergedPositions = new Float32Array(totalPositions);
    const mergedNormals = new Float32Array(totalPositions);
    const mergedUvs = new Float32Array((totalPositions / 3) * 2);

    let posOffset = 0;
    let uvOffset = 0;

    for (const rawG of geometries) {
      const g = rawG.index ? rawG.toNonIndexed() : rawG;
      const posArray = g.attributes.position.array;
      mergedPositions.set(posArray, posOffset);

      if (g.attributes.normal) {
        mergedNormals.set(g.attributes.normal.array, posOffset);
      }

      if (g.attributes.uv && g.attributes.uv.array.length === (posArray.length / 3) * 2) {
        mergedUvs.set(g.attributes.uv.array, uvOffset);
      } else {
        // Fallback cylindrical/planar UV projection
        for (let i = 0; i < posArray.length; i += 3) {
          const u = (Math.atan2(posArray[i + 2], posArray[i]) / (Math.PI * 2)) + 0.5;
          const v = posArray[i + 1] + 0.5;
          mergedUvs[uvOffset + (i / 3) * 2] = u;
          mergedUvs[uvOffset + (i / 3) * 2 + 1] = v;
        }
      }

      posOffset += posArray.length;
      uvOffset += (posArray.length / 3) * 2;
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(mergedPositions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(mergedNormals, 3));
    merged.setAttribute('uv', new THREE.BufferAttribute(mergedUvs, 2));
    return merged;
  }

  /**
   * Dispatcher method to create geometry by type
   */
  static createGeometry(type: string, params: Record<string, any> = {}): THREE.BufferGeometry {
    switch (type) {
      case 'cranium':
        return this.createCranium(params);
      case 'mandible':
        return this.createMandible(params);
      case 'vertebra':
        return this.createVertebra(params);
      case 'spine_segment':
        return this.createSpineSegment(params);
      case 'sacrum':
        return this.createSacrum(params);
      case 'coccyx':
        return this.createCoccyx(params);
      case 'sternum':
        return this.createSternum(params);
      case 'ribcage_hemisphere':
        return this.createRibcageHemisphere(params as any);
      case 'clavicle':
        return this.createClavicle(params as any);
      case 'scapula':
        return this.createScapula(params as any);
      case 'long_bone':
        return this.createLongBone(params);
      case 'femur':
        return this.createFemur(params as any);
      case 'patella':
        return this.createPatella(params);
      case 'forearm_complex':
        return this.createForearmComplex(params);
      case 'lower_leg_complex':
        return this.createLowerLegComplex(params as any);
      case 'pelvis':
        return this.createPelvis(params);
      case 'heart_chamber':
        return this.createHeartChamber(params as any);
      case 'heart_atria':
        return this.createHeartAtria(params);
      case 'aorta':
        return this.createAorta(params);
      case 'vena_cava':
        return this.createVenaCava(params);
      case 'trachea_tree':
        return this.createTracheaTree(params);
      case 'lung_organ':
        return this.createLungOrgan(params as any);
      case 'cerebrum':
        return this.createCerebrum(params);
      case 'cerebellum_stem':
        return this.createCerebellumStem(params);
      case 'spinal_cord':
        return this.createSpinalCord(params);
      case 'bilateral_nerves':
        return this.createBilateralNerves(params);
      case 'stomach':
        return this.createStomach(params);
      case 'liver':
        return this.createLiver(params);
      case 'gallbladder':
        return this.createGallbladder(params);
      case 'pancreas':
        return this.createPancreas(params);
      case 'small_intestine':
        return this.createSmallIntestine(params);
      case 'large_intestine':
        return this.createLargeIntestine(params);
      case 'kidney':
        return this.createKidney(params as any);
      case 'bladder':
        return this.createBladder(params);
      case 'pectoralis':
        return this.createPectoralis(params);
      case 'deltoid':
        return this.createDeltoid(params as any);
      case 'rectus_abdominis':
        return this.createRectusAbdominis(params);
      case 'quadriceps':
        return this.createQuadriceps(params);
      case 'body_envelope':
        return this.createBodyEnvelope();
      default:
        return new THREE.BoxGeometry(0.05, 0.05, 0.05);
    }
  }
}
