import assert from 'node:assert';
import { ANATOMICAL_STRUCTURES } from '../src/data/anatomyData.ts';
import { SYSTEMS_DATA } from '../src/data/systemsData.ts';
import { ANATOMICAL_HIERARCHY } from '../src/data/hierarchyData.ts';
import { GUIDED_TOURS } from '../src/data/toursData.ts';

console.log('--- RUNNING ANATOMY ATLAS DATA INTEGRITY & STRESS TESTS ---');

// 1. Systems Verification
console.log('1. Verifying Systems Definition...');
assert.strictEqual(SYSTEMS_DATA.length, 9, 'Expected exactly 9 body systems');
const systemIds = new Set(SYSTEMS_DATA.map((s) => s.id));
console.log(`   ✓ 9 Body Systems verified: ${Array.from(systemIds).join(', ')}`);

// 2. Anatomical Structures Integrity
console.log('2. Verifying Anatomical Structures Dataset...');
assert(ANATOMICAL_STRUCTURES.length >= 35, `Expected >= 35 structures, found ${ANATOMICAL_STRUCTURES.length}`);
const structureIds = new Set();

for (const struct of ANATOMICAL_STRUCTURES) {
  assert(struct.id, 'Structure must have unique ID');
  assert(!structureIds.has(struct.id), `Duplicate structure ID: ${struct.id}`);
  structureIds.add(struct.id);

  assert(struct.fmaId.startsWith('FMA:'), `Invalid FMA ID format: ${struct.fmaId}`);
  assert(systemIds.has(struct.system), `Unknown system: ${struct.system} in ${struct.name}`);
  assert(Array.isArray(struct.anchor) && struct.anchor.length === 3, `Invalid anchor in ${struct.name}`);
  assert(struct.boundingRadius > 0, `Invalid bounding radius in ${struct.name}`);
  assert(struct.function && struct.function.length > 10, `Missing function in ${struct.name}`);
  assert(struct.clinicalNotes && struct.clinicalNotes.length > 10, `Missing clinical notes in ${struct.name}`);
}
console.log(`   ✓ ${ANATOMICAL_STRUCTURES.length} structures verified with valid FMA IDs, anchors, and clinical data.`);

// 3. Vertebral Column Detailed Check (C1 to C7, T1-T12, L1-L5, Sacrum, Coccyx)
console.log('3. Verifying Vertebral Column Specifics...');
const cervicalVertebrae = ['fma-9960', 'fma-9961', 'fma-9962', 'fma-9963', 'fma-9964', 'fma-9965', 'fma-9966'];
for (const cid of cervicalVertebrae) {
  assert(structureIds.has(cid), `Missing cervical vertebra: ${cid}`);
}
assert(structureIds.has('fma-9140'), 'Missing Thoracic column (T1-T12)');
assert(structureIds.has('fma-9141'), 'Missing Lumbar column (L1-L5)');
assert(structureIds.has('fma-16202'), 'Missing Sacrum');
assert(structureIds.has('fma-16203'), 'Missing Coccyx');
console.log('   ✓ Complete Cervical (C1-C7), Thoracic, Lumbar, Sacral, and Coccygeal spine verified.');

// 4. Hierarchy Tree Traversal & Validation
console.log('4. Verifying Hierarchy Tree Consistency...');
let treeStructureCount = 0;
function traverse(node) {
  if (node.structureId) {
    assert(structureIds.has(node.structureId), `Hierarchy references unknown structureId: ${node.structureId}`);
    treeStructureCount++;
  }
  if (node.children) {
    for (const child of node.children) {
      traverse(child);
    }
  }
}
traverse(ANATOMICAL_HIERARCHY);
console.log(`   ✓ Hierarchy tree validated with ${treeStructureCount} indexed anatomical endpoints.`);

// 5. Guided Tours Verification
console.log('5. Verifying Guided Tours...');
assert(GUIDED_TOURS.length >= 3, 'Expected at least 3 guided clinical tours');
for (const tour of GUIDED_TOURS) {
  assert(tour.steps.length > 0, `Tour ${tour.title} has no steps`);
  for (const step of tour.steps) {
    assert(structureIds.has(step.structureId), `Tour references missing structure: ${step.structureId}`);
    assert(step.cameraPosition.length === 3, `Tour step missing camera position`);
    assert(step.cameraTarget.length === 3, `Tour step missing camera target`);
  }
}
console.log(`   ✓ ${GUIDED_TOURS.length} guided tours verified across all clinical steps.`);

console.log('\n>>> ALL ANATOMICAL DATA INTEGRITY AND RECURSION CHECKS PASSED SUCCESSFULLY (100% HEALTHY) <<<\n');
