#!/usr/bin/env python3
"""
Batch converts BodyParts3D segmented OBJ meshes from partof_BP3D_4.0_obj_99.zip
into WebGL-optimized GLB models with authentic anatomical coordinates.
"""

import os
import sys
import io
import zipfile
import trimesh
import numpy as np

ZIP_PATH = "data_source/bodyparts3d/partof_BP3D_4.0_obj_99.zip"
OUT_DIR = "public/anatomy/glb"

# Mapping of target GLB to one or more BodyParts3D OBJ file IDs
MODELS_TO_GENERATE = {
    # 1. Integumentary Flesh Envelope
    "human_body_skin": ["FJ2810"],

    # 2. Cranium & Skull
    "cranium": ["FJ3199", "FJ3200", "FJ3274", "FJ3281", "FJ3309", "FJ3380", "FJ3386"],
    "mandible": ["FJ3289"],

    # 3. Cervical Spine (C1 - C7)
    "c1_atlas": ["FJ3176"],
    "c2_axis": ["FJ3177"],
    "c3": ["FJ3161"],
    "c4": ["FJ3164"],
    "c5": ["FJ3167"],
    "c6": ["FJ3170"],
    "c7": ["FJ3172"],

    # 4. Thoracic & Lumbar Column, Sacrum, Sternum, Ribcage
    "thoracic_spine": ["FJ3158", "FJ3160", "FJ3163", "FJ3166", "FJ3169", "FJ3171", "FJ3173", "FJ3174", "FJ3175", "FJ3154", "FJ3155", "FJ3156"],
    "lumbar_spine": ["FJ3157", "FJ3159", "FJ3162", "FJ3165", "FJ3168"],
    "sacrum": ["FJ3393"],
    "sternum": ["FJ3178"],
    "ribs_left": ["FJ3225", "FJ3226", "FJ3227", "FJ3228", "FJ3229", "FJ3230", "FJ3231", "FJ3232", "FJ3233", "FJ3234", "FJ3235", "FJ3236", "FJ3239", "FJ3242", "FJ3245", "FJ3248", "FJ3251", "FJ3254", "FJ3255"],
    "ribs_right": ["FJ3330", "FJ3331", "FJ3332", "FJ3333", "FJ3334", "FJ3335", "FJ3336", "FJ3337", "FJ3338", "FJ3339", "FJ3340", "FJ3341", "FJ3344", "FJ3347", "FJ3350", "FJ3353", "FJ3356", "FJ3359", "FJ3360"],

    # 5. Shoulder Girdle & Upper Limb
    "clavicle_left": ["FJ3237"],
    "clavicle_right": ["FJ3362"],
    "scapula_left": ["FJ3279"],
    "scapula_right": ["FJ3384"],
    "humerus_left": ["FJ3262"],
    "humerus_right": ["FJ3368"],
    "forearm_left": ["FJ3286", "FJ3277"],
    "forearm_right": ["FJ3391", "FJ3349"],

    # 6. Pelvis & Lower Extremity
    "pelvis": ["FJ3152", "FJ3288"],
    "femur_left": ["FJ3259"],
    "femur_right": ["FJ3365"],
    "patella_left": ["FJ3275"],
    "patella_right": ["FJ3381"],
    "lower_leg_left": ["FJ3282", "FJ3260"],
    "lower_leg_right": ["FJ3387", "FJ3366"],

    # 7. Cardiopulmonary & Vascular Tree
    "heart_lv": ["FJ2418", "FJ2420", "FJ2422", "FJ2426", "FJ2429", "FJ2431", "FJ2432", "FJ2435"],
    "heart_rv": ["FJ2417", "FJ2419", "FJ2421", "FJ2423", "FJ2427", "FJ2430", "FJ2433", "FJ2434", "FJ2436", "FJ2437"],
    "heart_atria": ["FJ2425", "FJ2438"],
    "aorta": ["FJ1931", "FJ1932", "FJ3411", "FJ3413", "FJ3427"],
    "vena_cava": ["FJ3645", "FJ3441", "FJ3659"],
    "trachea": ["FJ2541"],
    "lung_left": ["FJ2441", "FJ2442", "FJ2443", "FJ2444", "FJ2445", "FJ2446", "FJ2447", "FJ2448"],
    "lung_right": ["FJ2041", "FJ2044", "FJ2449", "FJ2451", "FJ2452", "FJ2453"],

    # 8. Central Nervous System (Brain & Spinal Cord)
    "cerebrum": ["FJ1732", "FJ1733", "FJ1739", "FJ1740", "FJ1744", "FJ1745", "FJ1746", "FJ1747", "FJ1748", "FJ1749", "FJ1750", "FJ1751", "FJ1783", "FJ1784", "FJ1785", "FJ1786", "FJ1787", "FJ1788", "FJ1789", "FJ1790", "FJ1791", "FJ1792", "FJ1797", "FJ1798", "FJ1800", "FJ1801", "FJ1833", "FJ1834", "FJ1835", "FJ1836", "FJ1841", "FJ1842"],
    "cerebellum_stem": ["FJ1781", "FJ1830", "FJ1738", "FJ1762", "FJ1769", "FJ1770", "FJ1775", "FJ1779", "FJ1810", "FJ1817", "FJ1822", "FJ1826", "FJ1831"],
    "spinal_cord": ["FJ1737"],

    # 9. Gastrointestinal & Abdominal Viscera
    "stomach": ["FJ2564"],
    "liver": ["FJ1883", "FJ1893", "FJ1913"],
    "gallbladder": ["FJ2817"],
    "pancreas": ["FJ1895", "FJ1896", "FJ2629", "FJ2630"],
    "small_intestine": ["FJ2599"],
    "large_intestine": ["FJ2566", "FJ2572", "FJ2567"],

    # 10. Urogenital System
    "kidney_left": ["FJ3145"],
    "kidney_right": ["FJ3147"],
    "bladder": ["FJ3149"],
}

def transform_vertices(vertices: np.ndarray) -> np.ndarray:
    """
    Transforms BodyParts3D mm coordinates (Z up) into Three.js meter coordinates (Y up, -Z depth).
    """
    new_v = np.zeros_like(vertices)
    new_v[:, 0] = vertices[:, 0] * 0.001
    new_v[:, 1] = (vertices[:, 2] - 880.0) * 0.001
    new_v[:, 2] = -vertices[:, 1] * 0.001 - 0.08
    return new_v

def main():
    if not os.path.exists(ZIP_PATH):
        print(f"Error: {ZIP_PATH} not found.")
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"=== Converting BodyParts3D Real Models to GLB ===")

    manifest = {}

    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        available_files = set(z.namelist())

        for model_name, file_ids in MODELS_TO_GENERATE.items():
            print(f"\nProcessing {model_name} (from {len(file_ids)} part files)...")
            sub_meshes = []

            for fid in file_ids:
                entry = f"partof_BP3D_4.0_obj_99/{fid}.obj"
                if entry in available_files:
                    try:
                        data = z.read(entry)
                        m = trimesh.load(io.BytesIO(data), file_type='obj', force='mesh')
                        if not m.is_empty:
                            sub_meshes.append(m)
                    except Exception as e:
                        print(f"  Warning: Failed to load {fid}: {e}")
                else:
                    print(f"  Warning: {entry} not in zip")

            if not sub_meshes:
                print(f"  Skip: No valid sub-meshes for {model_name}")
                continue

            if len(sub_meshes) == 1:
                merged = sub_meshes[0]
            else:
                merged = trimesh.util.concatenate(sub_meshes)

            # Apply anatomical coordinate registration
            merged.vertices = transform_vertices(merged.vertices)

            # Ensure smooth normals
            merged.fix_normals()

            out_file = os.path.join(OUT_DIR, f"{model_name}.glb")
            merged.export(out_file, file_type='glb')
            size_kb = os.path.getsize(out_file) / 1024

            bounds = merged.bounds.tolist()
            centroid = merged.centroid.tolist()

            manifest[model_name] = {
                "file": f"/anatomy/glb/{model_name}.glb",
                "vertexCount": len(merged.vertices),
                "faceCount": len(merged.faces),
                "sizeKB": round(size_kb, 1),
                "bounds": bounds,
                "center": centroid,
            }

            print(f"  ✓ Saved {out_file} ({size_kb:.1f} KB, {len(merged.vertices)} verts, {len(merged.faces)} faces)")

    manifest_path = "public/anatomy/manifest.json"
    with open(manifest_path, "w") as f:
        import json
        json.dump(manifest, f, indent=2)
    print(f"\nManifest successfully written to {manifest_path}")

if __name__ == "__main__":
    main()
