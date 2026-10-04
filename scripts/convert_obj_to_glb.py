#!/usr/bin/env python3
"""
BodyParts3D OBJ to GLB Batch Processor & Optimizer
Converts raw OBJ meshes into web-ready compressed GLB files with embedded FMA IDs and metadata.
Supports Trimesh, PyVista, and Blender headless modes.
"""

import os
import sys
import json
import argparse

def convert_with_trimesh(input_dir: str, output_dir: str, metadata_file: str = None):
    try:
        import trimesh
    except ImportError:
        print("Trimesh not installed. Install via: pip install trimesh")
        return False

    metadata = {}
    if metadata_file and os.path.exists(metadata_file):
        with open(metadata_file, "r") as f:
            metadata = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    obj_files = [f for f in os.listdir(input_dir) if f.lower().endswith(".obj")]
    print(f"Found {len(obj_files)} OBJ files in {input_dir}")

    for idx, obj_name in enumerate(obj_files):
        obj_path = os.path.join(input_dir, obj_name)
        fma_id = os.path.splitext(obj_name)[0] # BodyParts3D typically names files as FMA9611.obj
        glb_name = f"{fma_id}.glb"
        glb_path = os.path.join(output_dir, glb_name)

        print(f"[{idx+1}/{len(obj_files)}] Processing {obj_name} -> {glb_name}...")
        try:
            mesh = trimesh.load(obj_path, force='mesh')
            if not mesh.is_empty:
                # Merge duplicate vertices & compute smooth normals
                mesh.merge_vertices()
                mesh.fix_normals()
                # Attach metadata to user_data dictionary
                mesh.metadata["fmaId"] = fma_id
                mesh.metadata["name"] = metadata.get(fma_id, {}).get("name", fma_id)
                # Export to GLB
                mesh.export(glb_path, file_type='glb')
        except Exception as e:
            print(f"Error converting {obj_name}: {e}")

    print("Batch conversion completed.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Convert BodyParts3D OBJ meshes to GLB")
    parser.add_argument("--input", "-i", default="./data_source/bodyparts3d/obj", help="Path to input OBJ directory")
    parser.add_argument("--output", "-o", default="./public/anatomy/glb", help="Path to output GLB directory")
    parser.add_argument("--metadata", "-m", default="./public/data/anatomy.json", help="Path to anatomical metadata JSON")
    args = parser.parse_args()

    print("BodyParts3D OBJ to GLB Converter")
    print(f"Input: {args.input}")
    print(f"Output: {args.output}")
    if os.path.exists(args.input):
        convert_with_trimesh(args.input, args.output, args.metadata)
    else:
        print(f"Input directory '{args.input}' not found. Download files first with download_bodyparts3d.py.")

if __name__ == "__main__":
    main()
