import type { SystemId } from '../types/anatomy';

export interface MBBSVivaCard {
  id: string;
  structureId: string;
  structureName: string;
  subject:
    | 'Neuroanatomy'
    | 'Thorax & Cardiovascular'
    | 'Abdomen & Pelvis'
    | 'Osteology & Spine'
    | 'Locomotor & Limbs'
    | 'Head & Neck';
  vivaQuestion: string;
  vivaAnswer: string;
  keyPoints: string[];
  mnemonic?: string;
  examImportance: 'High Yield' | 'Must Know' | 'Golden Viva Point';
  clinicalCorrelation: string;
}

export interface DissectionStage {
  id: string;
  name: string;
  latinStage: string;
  description: string;
  opacities: Record<SystemId, number>;
  visibilities: Record<SystemId, boolean>;
}

export const DISSECTION_STAGES: DissectionStage[] = [
  {
    id: 'stage-surface',
    name: '1. Surface Anatomy & Flesh Envelope',
    latinStage: 'Habitus & Cutis externa',
    description: 'Complete human body with natural skin envelope wrapping the muscular scaffold and vital viscera.',
    visibilities: {
      integumentary: true,
      muscular: true,
      skeletal: true,
      cardiovascular: true,
      nervous: true,
      respiratory: true,
      digestive: true,
      urinary: true,
      endocrine: false,
    },
    opacities: {
      integumentary: 0.88,
      muscular: 0.3,
      skeletal: 0.25,
      cardiovascular: 0.4,
      nervous: 0.3,
      respiratory: 0.35,
      digestive: 0.3,
      urinary: 0.3,
      endocrine: 0.2,
    },
  },
  {
    id: 'stage-ecorche',
    name: '2. Muscular Ecorché & Fascia',
    latinStage: 'Myologia & Fasciae',
    description: 'Flesh peeled away to reveal superficial and deep muscle groups, aponeuroses, and biomechanical levers.',
    visibilities: {
      integumentary: false,
      muscular: true,
      skeletal: true,
      cardiovascular: false,
      nervous: false,
      respiratory: false,
      digestive: false,
      urinary: false,
      endocrine: false,
    },
    opacities: {
      integumentary: 0.0,
      muscular: 1.0,
      skeletal: 0.45,
      cardiovascular: 0.0,
      nervous: 0.0,
      respiratory: 0.0,
      digestive: 0.0,
      urinary: 0.0,
      endocrine: 0.0,
    },
  },
  {
    id: 'stage-splanchno',
    name: '3. Splanchnology (Viscera & Thoraco-Abdominal Cavities)',
    latinStage: 'Splanchnologia (Viscera)',
    description: 'Cardiothoracic and peritoneal viscera: Heart, lungs, liver, stomach, and kidneys with minimal skeletal distraction.',
    visibilities: {
      integumentary: false,
      muscular: false,
      skeletal: true,
      cardiovascular: true,
      nervous: false,
      respiratory: true,
      digestive: true,
      urinary: true,
      endocrine: true,
    },
    opacities: {
      integumentary: 0.0,
      muscular: 0.0,
      skeletal: 0.12,
      cardiovascular: 1.0,
      nervous: 0.0,
      respiratory: 0.95,
      digestive: 0.95,
      urinary: 0.95,
      endocrine: 0.85,
    },
  },
  {
    id: 'stage-neurovascular',
    name: '4. Neurovascular Conduits & Central Nervous Axis',
    latinStage: 'Systema Nervosum & Angiologia',
    description: 'Brain, cerebellum, spinal cord, aortic arch, and vena cava showing electrical and systemic vascular conduits.',
    visibilities: {
      integumentary: false,
      muscular: false,
      skeletal: true,
      cardiovascular: true,
      nervous: true,
      respiratory: false,
      digestive: false,
      urinary: false,
      endocrine: false,
    },
    opacities: {
      integumentary: 0.0,
      muscular: 0.0,
      skeletal: 0.14,
      cardiovascular: 1.0,
      nervous: 1.0,
      respiratory: 0.0,
      digestive: 0.0,
      urinary: 0.0,
      endocrine: 0.0,
    },
  },
  {
    id: 'stage-osteology',
    name: '5. Pure Osteology & Bone Landmarks',
    latinStage: 'Osteologia Scaffolding',
    description: 'All 206 bones of the human axial and appendicular skeleton isolated for studying foramina, sulci, and fracture lines.',
    visibilities: {
      integumentary: false,
      muscular: false,
      skeletal: true,
      cardiovascular: false,
      nervous: false,
      respiratory: false,
      digestive: false,
      urinary: false,
      endocrine: false,
    },
    opacities: {
      integumentary: 0.0,
      muscular: 0.0,
      skeletal: 1.0,
      cardiovascular: 0.0,
      nervous: 0.0,
      respiratory: 0.0,
      digestive: 0.0,
      urinary: 0.0,
      endocrine: 0.0,
    },
  },
];

export const MBBS_VIVA_CARDS: MBBSVivaCard[] = [
  // 1. NEUROANATOMY
  {
    id: 'viva-c1-atlas',
    structureId: 'fma-9960',
    structureName: 'C1 Atlas Vertebra',
    subject: 'Neuroanatomy',
    vivaQuestion: 'Why does the C1 Atlas lack a vertebral body and spinous process?',
    vivaAnswer:
      'During embryological chondrification and sclerotome remodeling, the centrum (body) of C1 detaches and fuses with the body of C2 (Axis) to form the odontoid process (dens). C1 becomes a ring that rotates around this dens pivot.',
    keyPoints: [
      'Articulates with occipital condyles at atlanto-occipital joints (allows nodding "yes" motion).',
      'No true spinous process; has a posterior tubercle to prevent restricting hyperextension.',
      'Transverse ligament of atlas holds dens firmly against anterior arch.',
    ],
    mnemonic: 'Atlas shrugs and says "YES" (atlanto-occipital flexion/extension)',
    examImportance: 'Golden Viva Point',
    clinicalCorrelation:
      "Jefferson fracture (burst fracture of C1 ring caused by axial loading, e.g. diving into shallow water). Dens displacement can compress spinal cord.",
  },
  {
    id: 'viva-c2-axis',
    structureId: 'fma-9961',
    structureName: 'C2 Axis Vertebra',
    subject: 'Neuroanatomy',
    vivaQuestion: 'What is the clinical significance of the dens (odontoid process) and Hangman’s fracture?',
    vivaAnswer:
      'The dens acts as the rotational pivot for the skull and atlas. Hangman’s fracture is a bilateral fracture through the pars interarticularis of C2, typically caused by acute hyperextension and distraction.',
    keyPoints: [
      'Alar ligaments ("check ligaments") connect dens tip to margins of foramen magnum, limiting excessive rotation.',
      'Bifid spinous process provides insertion for suboccipital muscles.',
      'Damage can cause transection of the upper spinal cord or medulla oblongata.',
    ],
    mnemonic: 'Axis says "NO" (atlanto-axial rotation around dens)',
    examImportance: 'Must Know',
    clinicalCorrelation:
      'High-velocity hyperextension trauma in motor accidents causes Hangman’s fracture; displacement causes fatal respiratory arrest due to phrenic/medullary compromise.',
  },
  {
    id: 'viva-cerebrum',
    structureId: 'fma-50801',
    structureName: 'Cerebrum (Dual Hemispheres)',
    subject: 'Neuroanatomy',
    vivaQuestion: 'What are the boundaries of the frontal and parietal lobes, and which cortex lies on either side?',
    vivaAnswer:
      'Separated by the Central Sulcus of Rolando. Anterior to the central sulcus is the Precentral Gyrus (Primary Motor Cortex, Brodmann area 4). Posterior is the Postcentral Gyrus (Primary Somatosensory Cortex, Brodmann areas 3, 1, 2).',
    keyPoints: [
      'Motor and sensory homunculus: head/face laterally, lower limb medially over the paracentral lobule.',
      'Supplied by anterior and middle cerebral arteries (branches of internal carotid).',
      'Longitudinal cerebral fissure separates left and right hemispheres, connected by the corpus callosum.',
    ],
    mnemonic: 'Motor is FRONT (Precentral = Primary Motor), Sensory is BACK (Postcentral = Somatosensory)',
    examImportance: 'High Yield',
    clinicalCorrelation:
      'Middle Cerebral Artery (MCA) ischemic stroke causes contralateral hemiparesis and hemisensory loss predominantly affecting face and upper extremity, plus Broca/Wernicke aphasia in dominant hemisphere.',
  },
  {
    id: 'viva-cerebellum',
    structureId: 'fma-50802',
    structureName: 'Cerebellum & Brainstem',
    subject: 'Neuroanatomy',
    vivaQuestion: 'What are the classic clinical signs of a cerebellar hemisphere lesion?',
    vivaAnswer:
      'Cerebellar signs are strictly IPSILATERAL (unlike cerebral signs which are contralateral). Signs include intention tremor, dysdiadochokinesia, ataxia, nystagmus, and dysmetria (past-pointing).',
    keyPoints: [
      'Vermis controls midline axial posture and gait (lesions produce truncal ataxia).',
      'Hemispheres control appendicular motor coordination and fine voluntary movements.',
      'Surface characterized by parallel horizontal folia ridges and arbor vitae branching pattern.',
    ],
    mnemonic: 'VANISHED: Vertigo, Ataxia, Nystagmus, Intention tremor, Slurred speech, Hypotonia, Exaggerated rebound, Dysdiadochokinesia',
    examImportance: 'Golden Viva Point',
    clinicalCorrelation:
      'Posterior Inferior Cerebellar Artery (PICA) thrombosis causes Lateral Medullary Syndrome (Wallenberg syndrome) with ipsilateral cerebellar ataxia and Horner syndrome.',
  },

  // 2. THORAX & CARDIOVASCULAR
  {
    id: 'viva-heart-lv',
    structureId: 'fma-7101',
    structureName: 'Left Ventricle',
    subject: 'Thorax & Cardiovascular',
    vivaQuestion: 'How does the left ventricle differ anatomically from the right ventricle, and what determines coronary dominance?',
    vivaAnswer:
      'Left ventricle has 3x thicker muscular walls (8-12 mm vs 3-5 mm in RV), is conical in shape, and reaches the cardiac apex. Coronary dominance is determined by which coronary artery gives off the Posterior Descending Artery (PDA) / Posterior Interventricular Artery (85% Right Coronary Artery).',
    keyPoints: [
      'Possesses two massive papillary muscles (anterior and posterior) securing the bicuspid (mitral) valve chordae tendineae.',
      'Internal surface features fine trabeculae carneae (no moderator band, which is unique to RV).',
      'Apex beat located at left 5th intercostal space in the midclavicular line (9 cm from midsternal line).',
    ],
    mnemonic: 'Right is Dominant in 85% of people (PDA from RCA)',
    examImportance: 'Must Know',
    clinicalCorrelation:
      'Left Anterior Descending (LAD) artery occlusion is termed the "Widow Maker" because it supplies the anterior 2/3 of the interventricular septum and LV apex, leading to fatal cardiogenic shock.',
  },
  {
    id: 'viva-aorta',
    structureId: 'fma-3734',
    structureName: 'Aorta & Great Vessels',
    subject: 'Thorax & Cardiovascular',
    vivaQuestion: 'What are the three great branches of the aortic arch and what is the landmark for the beginning and end of the arch?',
    vivaAnswer:
      'Branches from right to left: 1. Brachiocephalic trunk (innominate), 2. Left common carotid artery, 3. Left subclavian artery. The arch begins and ends at the Sternal Angle of Louis (T4/T5 vertebral disc level).',
    keyPoints: [
      'Ligamentum arteriosum connects underside of aortic arch to pulmonary trunk (remnant of ductus arteriosus).',
      'Left recurrent laryngeal nerve hooks around aortic arch beneath ligamentum arteriosum.',
      'Sternal angle (T4/T5) divides superior from inferior mediastinum.',
    ],
    mnemonic: 'ABC’S of Aortic Arch: Aorta gives Brachiocephalic, Common Carotid (L), Subclavian (L)',
    examImportance: 'Golden Viva Point',
    clinicalCorrelation:
      'Aortic aneurysm or bronchogenic carcinoma compressing the left recurrent laryngeal nerve under the arch produces hoarseness of voice (Ortner syndrome).',
  },
  {
    id: 'viva-lung-left',
    structureId: 'fma-7340',
    structureName: 'Left Lung & Cardiac Notch',
    subject: 'Thorax & Cardiovascular',
    vivaQuestion: 'What anatomical features distinguish the left lung from the right lung?',
    vivaAnswer:
      'Left lung has only 2 lobes (superior and inferior) divided by an oblique fissure, a prominent Cardiac Notch on its anterior border, and an inferior tongue-like projection called the Lingula (homologue of right middle lobe). Right lung has 3 lobes and 2 fissures.',
    keyPoints: [
      'Left hilum arrangement from superior to inferior: Pulmonary Artery, Principal Bronchus, Inferior Pulmonary Vein.',
      'Impression of aortic arch and descending thoracic aorta on medial mediastinal surface.',
      'Cardiac notch allows pericardium to contact the anterior chest wall directly (area of superficial cardiac dullness).',
    ],
    mnemonic: 'RALS: Right pulmonary Artery is Anterior to bronchus; Left pulmonary Artery is Superior to bronchus in hilum',
    examImportance: 'High Yield',
    clinicalCorrelation:
      'Pericardiocentesis is performed via the cardiac notch at the left 5th/6th intercostal space adjacent to the sternum to relieve life-threatening cardiac tamponade without puncturing lung pleura.',
  },

  // 3. ABDOMEN & PELVIS
  {
    id: 'viva-liver',
    structureId: 'fma-7197',
    structureName: 'Liver & Hepatic Lobes',
    subject: 'Abdomen & Pelvis',
    vivaQuestion: 'Describe the anatomical vs functional lobes of the liver and Pringle’s maneuver.',
    vivaAnswer:
      'Anatomically, divided by the Falciform ligament into right and left lobes. Functionally (Couinaud segmentation), divided by the middle hepatic vein (Cantlie’s line) into equal right and left functional hemilivers, each with 4 segments (total 8) based on independent portal triads. Pringle’s maneuver clamps the hepatoduodenal ligament to control hepatic bleeding.',
    keyPoints: [
      'Hepatoduodenal ligament contains Portal Triad: Portal Vein (posterior), Hepatic Artery Proper (anterior left), Common Bile Duct (anterior right).',
      'Dual blood supply: 75% portal vein (nutrient-rich), 25% hepatic artery (oxygen-rich).',
      'Portacaval anastomoses occur at lower esophagus, anal canal, umbilicus, and retroperitoneum.',
    ],
    mnemonic: 'Portal Triad from behind to front: Vein behind, Duct on Right, Artery on Left (V-D-A)',
    examImportance: 'Golden Viva Point',
    clinicalCorrelation:
      'Cirrhosis leads to portal hypertension, manifesting as esophageal varices, caput medusae around the umbilicus, and splenomegaly.',
  },
  {
    id: 'viva-kidney',
    structureId: 'fma-7203-l',
    structureName: 'Left Kidney',
    subject: 'Abdomen & Pelvis',
    vivaQuestion: 'Why is the left kidney placed higher than the right kidney, and what structures cross the renal hilum?',
    vivaAnswer:
      'The left kidney lies from T12 to L3, higher than the right kidney because the massive right hepatic lobe pushes the right kidney down. Renal hilum structures from anterior to posterior: Renal Vein, Renal Artery, Renal Pelvis (ureter).',
    keyPoints: [
      'Retroperitoneal organ enveloped in Gerota’s renal fascia and perinephric fat pad.',
      'Left renal vein is 3x longer than right and receives the left gonadal and left suprarenal veins.',
      'Anterior relations of left kidney: Stomach, pancreas tail, spleen, splenic flexure of colon, jejunal loops.',
    ],
    mnemonic: 'Renal Hilum from Front to Back: V-A-P (Vein, Artery, Pelvis)',
    examImportance: 'Must Know',
    clinicalCorrelation:
      'Nutcracker Syndrome: Left renal vein is compressed between Abdominal Aorta and Superior Mesenteric Artery (SMA), causing hematuria, flank pain, and left testicular varicocele.',
  },

  // 4. OSTEOLOGY & LIMBS
  {
    id: 'viva-femur',
    structureId: 'fma-9611-l',
    structureName: 'Femur (Thigh Bone)',
    subject: 'Locomotor & Limbs',
    vivaQuestion: 'What is the angle of inclination of the femoral neck and why are neck fractures perilous?',
    vivaAnswer:
      'The angle between the femoral neck and shaft is ~125° in adults (larger in infants ~160°, smaller in coxa vara <120°). Subcapital and transcervical neck fractures disrupt retinacular arteries from the Trochanteric Anastomosis (medial circumflex femoral artery), causing Avascular Necrosis (AVN) of the femoral head.',
    keyPoints: [
      'Greater trochanter provides insertion for gluteus medius and minimus (essential pelvic stabilizers in gait).',
      'Linear aspera on posterior shaft provides vastus and adductor origins/insertions.',
      'Longest and strongest bone in the human body (carries up to 30x body weight in jumping).',
    ],
    mnemonic: 'Trendelenburg sign: Superior Gluteal Nerve damage causes contralateral pelvic drop during stance phase',
    examImportance: 'Golden Viva Point',
    clinicalCorrelation:
      'Elderly osteoporotic individuals who fall suffer subcapital femoral neck fractures requiring hemiarthroplasty or total hip replacement due to poor osteogenesis and AVN risk.',
  },
  {
    id: 'viva-lumbar',
    structureId: 'fma-9141',
    structureName: 'Lumbar Spine (L1 - L5)',
    subject: 'Osteology & Spine',
    vivaQuestion: 'Where does the spinal cord terminate in adults and at what level is a Lumbar Puncture performed?',
    vivaAnswer:
      'The spinal cord ends as the Conus Medullaris at the lower border of L1 (or upper L2) in adults (L3 in newborns). Lumbar puncture is safely performed at the L3-L4 or L4-L5 intervertebral disc space, safely below the conus in the lumbar cistern containing cauda equina nerve roots.',
    keyPoints: [
      'Intercrestal line of Tuffier (connecting bilateral highest points of iliac crests) passes through L4 spinous process.',
      'Layers pierced in LP: Skin → Superficial fascia → Supraspinous ligament → Interspinous ligament → Ligamentum flavum ("pop") → Epidural space → Dura mater → Arachnoid mater ("second pop") into Subarachnoid space.',
      'Massive reniform vertebral bodies resist compressive loads of erect posture.',
    ],
    mnemonic: 'SCALP of Lumbar Puncture: Skin, Subcutaneous, Supraspinous, Interspinous, Ligamentum flavum, Dura/Arachnoid',
    examImportance: 'Golden Viva Point',
    clinicalCorrelation:
      'Herniated nucleus pulposus (slipped disc) most commonly occurs posterolaterally at L4-L5 or L5-S1, compressing the traversing sciatic nerve root producing sciatica and loss of ankle jerk.',
  },
];
