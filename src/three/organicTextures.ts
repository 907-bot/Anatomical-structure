import * as THREE from 'three';

/**
 * Generates procedural photorealistic organic texture maps for medical visualization.
 * Creates procedural normal, roughness, and diffuse maps on the fly via HTML5 Canvas.
 */
export class OrganicTextures {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Realistic human dermal skin texture with subtle micro-cellular pores and vascular blush
   */
  static getSkinTexture(): THREE.CanvasTexture {
    if (this.cache.has('skin')) return this.cache.get('skin')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm natural dermal tone base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#d9a786');
    grad.addColorStop(0.5, '#c89574');
    grad.addColorStop(1, '#b88363');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Micro-vascular warmth & subdermal tone variations
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Natural melanin & micro-vascular variation
      const noise = (Math.random() - 0.5) * 16;
      const vascularBlush = Math.sin((i / 4) * 0.05) * 6;

      data[i] = Math.min(255, Math.max(0, data[i] + noise + vascularBlush)); // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.7)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.5)); // B
    }
    ctx.putImageData(imgData, 0, 0);

    // Soft cellular pores
    ctx.fillStyle = 'rgba(120, 60, 40, 0.035)';
    for (let p = 0; p < 3000; p++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const r = 0.5 + Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set('skin', texture);
    return texture;
  }

  /**
   * Brain Cortex gyri & sulci convoluted normal/diffuse map
   */
  static getBrainTexture(): THREE.CanvasTexture {
    if (this.cache.has('brain')) return this.cache.get('brain')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Cerebral gray-matter baseline
    ctx.fillStyle = '#eed6c4';
    ctx.fillRect(0, 0, 512, 512);

    // Serpentine cortical convolutions (sulci & gyri folds)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let s = 0; s < 45; s++) {
      ctx.strokeStyle = `rgba(160, 100, 90, ${0.25 + Math.random() * 0.25})`;
      ctx.lineWidth = 4 + Math.random() * 6;
      ctx.beginPath();
      let sx = Math.random() * 512;
      let sy = Math.random() * 512;
      ctx.moveTo(sx, sy);

      for (let pt = 0; pt < 7; pt++) {
        sx += (Math.random() - 0.5) * 80;
        sy += (Math.random() - 0.5) * 80;
        ctx.quadraticCurveTo(sx + (Math.random() - 0.5) * 30, sy + (Math.random() - 0.5) * 30, sx, sy);
      }
      ctx.stroke();
    }

    // Pial micro-vasculature (delicate red surface vessels)
    for (let v = 0; v < 30; v++) {
      ctx.strokeStyle = 'rgba(190, 40, 40, 0.4)';
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      let vx = Math.random() * 512;
      let vy = Math.random() * 512;
      ctx.moveTo(vx, vy);
      for (let seg = 0; seg < 4; seg++) {
        vx += (Math.random() - 0.5) * 50;
        vy += (Math.random() - 0.5) * 50;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.set('brain', texture);
    return texture;
  }

  /**
   * Myocardial heart muscle fiber texture with glistening pericardial sheen
   */
  static getHeartTexture(): THREE.CanvasTexture {
    if (this.cache.has('heart')) return this.cache.get('heart')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich deep myocardial red gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#991b1b');
    grad.addColorStop(0.5, '#7f1d1d');
    grad.addColorStop(1, '#601212');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Diagonal cardiac muscle swirling fibers
    for (let i = 0; i < 512; i += 3) {
      ctx.strokeStyle = `rgba(185, 28, 28, ${0.15 + Math.random() * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.bezierCurveTo(150, i - 20, 350, i + 40, 512, i + 10);
      ctx.stroke();
    }

    // Epicardial adipose streaks (natural pale-yellow fatty sulcus padding)
    ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
    ctx.beginPath();
    ctx.ellipse(256, 180, 80, 25, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Coronary branching arteries (vibrant oxygenated crimson)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(256, 80);
    ctx.quadraticCurveTo(240, 220, 200, 340);
    ctx.quadraticCurveTo(180, 420, 160, 480);
    ctx.stroke();

    // Small branch
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(230, 240);
    ctx.quadraticCurveTo(290, 310, 310, 380);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('heart', texture);
    return texture;
  }

  /**
   * Striated skeletal muscle fiber texture
   */
  static getMuscleTexture(): THREE.CanvasTexture {
    if (this.cache.has('muscle')) return this.cache.get('muscle')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Arterial rich muscle red
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, 0, 512, 512);

    // Longitudinal striated fascicle streaks
    for (let y = 0; y < 512; y += 2) {
      const alpha = 0.1 + Math.random() * 0.3;
      ctx.fillStyle = Math.random() > 0.4 ? `rgba(185, 28, 28, ${alpha})` : `rgba(69, 10, 10, ${alpha})`;
      ctx.fillRect(0, y, 512, 1.5);
    }

    // Perimysium connective tissue fascia sheen (pale streaks)
    for (let f = 0; f < 12; f++) {
      ctx.strokeStyle = 'rgba(254, 226, 226, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const py = Math.random() * 512;
      ctx.moveTo(0, py);
      ctx.lineTo(512, py + (Math.random() - 0.5) * 30);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    this.cache.set('muscle', texture);
    return texture;
  }

  /**
   * Cortical Bone texture with organic osteon rings and ivory sheen
   */
  static getBoneTexture(): THREE.CanvasTexture {
    if (this.cache.has('bone')) return this.cache.get('bone')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm natural ivory base
    ctx.fillStyle = '#e8decb';
    ctx.fillRect(0, 0, 512, 512);

    // Organic bone grain and nutrient pits
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.8));
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle microscopic vascular canaliculi
    ctx.strokeStyle = 'rgba(180, 160, 140, 0.15)';
    ctx.lineWidth = 1;
    for (let c = 0; c < 30; c++) {
      ctx.beginPath();
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      ctx.arc(cx, cy, 3 + Math.random() * 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.set('bone', texture);
    return texture;
  }

  /**
   * Visceral Glistening Peritoneal Texture (Liver, Kidneys, Viscera)
   */
  static getVisceralTexture(): THREE.CanvasTexture {
    if (this.cache.has('viscera')) return this.cache.get('viscera')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Glistening hepatic/visceral base
    ctx.fillStyle = '#8b2510';
    ctx.fillRect(0, 0, 512, 512);

    // Micro-vascular networks
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(180, 50, 20, ${0.15 + Math.random() * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let s = 0; s < 5; s++) {
        x += (Math.random() - 0.5) * 40;
        y += (Math.random() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.set('viscera', texture);
    return texture;
  }
}
