import type { SystemInfo } from '../types/anatomy';

export const SYSTEMS_DATA: SystemInfo[] = [
  {
    id: 'skeletal',
    name: 'Skeletal System',
    latinName: 'Systema skeletale',
    description: 'The internal biological scaffold composed of 206 bones, cartilages, and associated ligaments that provide structural support, protect vital organs, and store essential minerals.',
    color: '#e2d9c8', // Bone ivory
    structureCount: 42,
    iconName: 'Bone',
    defaultVisible: true,
    defaultOpacity: 1.0,
  },
  {
    id: 'muscular',
    name: 'Muscular System',
    latinName: 'Systema musculare',
    description: 'Over 600 skeletal, smooth, and cardiac muscles responsible for biomechanical locomotion, posture maintenance, and blood circulation.',
    color: '#b91c1c', // Deep muscle crimson
    structureCount: 16,
    iconName: 'Activity',
    defaultVisible: true,
    defaultOpacity: 0.95,
  },
  {
    id: 'nervous',
    name: 'Nervous System',
    latinName: 'Systema nervosum',
    description: 'Complex computational electro-chemical network comprising the brain, spinal cord, cranial nerves, and peripheral sensory-motor neural plexuses.',
    color: '#eab308', // Neural gold
    structureCount: 14,
    iconName: 'Zap',
    defaultVisible: true,
    defaultOpacity: 1.0,
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    latinName: 'Systema cardiovasculare',
    description: 'The heart and closed vascular network of systemic arteries, arterioles, capillaries, and venous returns that circulate oxygenated blood and nutrients.',
    color: '#ef4444', // Arterial red / heart
    structureCount: 15,
    iconName: 'Heart',
    defaultVisible: true,
    defaultOpacity: 1.0,
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    latinName: 'Systema respiratorium',
    description: 'The pulmonary tract including the larynx, trachea, bronchial arborization, and bilateral lobed lungs facilitating oxygen-carbon dioxide gas exchange.',
    color: '#06b6d4', // Pulmonary cyan
    structureCount: 8,
    iconName: 'Wind',
    defaultVisible: true,
    defaultOpacity: 0.9,
  },
  {
    id: 'digestive',
    name: 'Digestive System',
    latinName: 'Systema digestorium',
    description: 'The gastrointestinal tract and accessory organs including stomach, liver, pancreas, and intestines processing nutrients and water absorption.',
    color: '#f97316', // Hepatic/visceral amber
    structureCount: 9,
    iconName: 'Utensils',
    defaultVisible: true,
    defaultOpacity: 0.9,
  },
  {
    id: 'urinary',
    name: 'Urinary System',
    latinName: 'Systema urinarium',
    description: 'Renal filtration system consisting of bilateral kidneys, ureters, bladder, and urethra maintaining hemodynamic homeostasis and osmoregulation.',
    color: '#10b981', // Emerald filtration
    structureCount: 5,
    iconName: 'Droplet',
    defaultVisible: true,
    defaultOpacity: 0.9,
  },
  {
    id: 'endocrine',
    name: 'Endocrine System',
    latinName: 'Systema endocrinum',
    description: 'Ductless glandular network regulating metabolic rate, growth, fluid balance, and stress responses via circulatory hormone signaling.',
    color: '#a855f7', // Endocrine violet
    structureCount: 4,
    iconName: 'Sparkles',
    defaultVisible: false,
    defaultOpacity: 0.85,
  },
  {
    id: 'integumentary',
    name: 'Integumentary System (Flesh & Skin)',
    latinName: 'Integumentum commune (Cutis)',
    description: 'The natural human dermal and subcutaneous flesh envelope wrapping the musculature and skeletal framework.',
    color: '#d4a373', // Natural human dermal flesh tone
    structureCount: 2,
    iconName: 'Shield',
    defaultVisible: true,
    defaultOpacity: 0.45,
  },
];
