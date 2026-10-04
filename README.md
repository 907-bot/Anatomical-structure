# 🫀 ANATOMA — 3D Human Anatomy Digital Twin & Medical Atlas

> **Interactive WebGL 3D Human Anatomy Atlas & Clinical Knowledge Engine**  
> Built with **Three.js**, **React 19**, **TypeScript**, and authentic anatomical datasets from **DBCLS BodyParts3D 4.0** (Foundational Model of Anatomy - FMA taxonomy). Tailored for medical students (MBBS viva & dissection prep) and clinicians.

🌐 **Live Demo on GitHub Pages**: [https://907-bot.github.io/Anatomical-structure/](https://907-bot.github.io/Anatomical-structure/)

---

## 🌟 Key Features

* **Authentic 3D Medical Scans**: 49 authentic CT/MRI surface polygon models from DBCLS BodyParts3D 4.0, normalized and web-optimized as GLB assets.
* **Continuous Human Flesh Envelope (Integumentary System)**: Natural continuous human skin with real-time translucency peel slider (0% skeleton core, 45% translucent veil, 100% full skin) with zero depth artifacts.
* **Dedicated Isolated 3D Organ Inspection Page**: Click any organ to isolate it at origin `(0, 0, 0)` with 360° turntable, wireframe, cross-section clipping, and comprehensive Gray's Anatomy dossier.
* **9 Anatomical Body Systems**:
  * 💀 Skeletal System (Cranial, C1–C7 Cervical vertebrae, Thoracic, Lumbar, Pelvis, Appendicular)
  * 💪 Muscular System (Pectoralis, Biceps, Quadriceps, Deltoid, Rectus abdominis)
  * 🫀 Cardiovascular System (Four-chambered heart, Aorta, Superior/Inferior Vena Cava)
  * 🧠 Nervous System (Cerebrum, Cerebellum, Brainstem, Spinal Cord)
  * 🫁 Respiratory System (Trachea, Bilateral multi-lobed lungs)
  * 🍽️ Digestive System (Esophagus, Stomach, Liver, Gallbladder, Pancreas, Small/Large Intestine)
  * 🔬 Endocrine & 💧 Urinary Systems (Bilateral Kidneys, Bladder)
  * 🛡️ Integumentary System (Skin envelope)
* **MBBS Viva & Dissection Hub**: High-yield exam notes, clinical correlations, neurovascular relations, and Gray's Anatomy tables.
* **High Refresh Rate Performance**: Synchronized at 60Hz and 120Hz/144Hz ProMotion with OrbitControls momentum damping and cubic eased camera dolly zoom.
* **Multi-Planar Cross-Section Slicing**: Real-time Sagittal, Coronal, and Transverse clipping planes.

---

## 🚀 Getting Started Locally

### Prerequisites
* Node.js 18+
* npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/907-bot/Anatomical-structure.git
cd Anatomical-structure

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build & Linting
```bash
# Verify TypeScript and create production bundle
npm run build

# Run Oxlint validation
npm run lint

# Run anatomical dataset validation tests
npm test
```

---

## 🏛️ Dataset & Ontological Attribution
* **Anatomy Models**: DBCLS BodyParts3D 4.0 (National Bioscience Database Center, Japan). Licensed under Creative Commons Attribution 2.1 Japan (CC BY-SA 2.1 JP).
* **Taxonomy**: Foundational Model of Anatomy (FMA) ontology, Structural Informatics Group, University of Washington.

---

## 📄 License
This project is open-source under the MIT License.
