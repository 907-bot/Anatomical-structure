#!/usr/bin/env python3
"""
BodyParts3D 4.0 Downloader and Data Pipeline Helper
Dataset Source: Life Science Database Archive (LSDB) Japan / BodyParts3D
License: CC BY 4.0 (Attribution required: BodyParts3D, © The Database Center for Life Science)
URL: https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/
"""

import os
import sys
import urllib.request
import zipfile
import tarfile

BODYPARTS3D_ARCHIVES = {
    # 99% reduced polygon release for web delivery (~136 MB)
    "isa_99_reduced": "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/bp3d_99_obj_IS-A.tar.gz",
    "partof_99_reduced": "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/bp3d_99_obj_PART-OF.tar.gz",
    # Ontological metadata TSV tables
    "concept_id_tsv": "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/concept_id.tsv",
    "tree_tsv": "https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/tree.tsv",
}

def download_file(url: str, dest_path: str):
    print(f"Downloading: {url} -> {dest_path}")
    def reporthook(block_num, block_size, total_size):
        read = block_num * block_size
        if total_size > 0:
            percent = min(100.0, read * 100.0 / total_size)
            sys.stdout.write(f"\rProgress: {percent:.1f}% ({read // (1024*1024)} MB / {total_size // (1024*1024)} MB)")
            sys.stdout.flush()
    urllib.request.urlretrieve(url, dest_path, reporthook)
    print("\nDownload complete.")

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "..", "data_source", "bodyparts3d")
    os.makedirs(target_dir, exist_ok=True)
    print(f"=== BodyParts3D 4.0 Pipeline Scaffolder ===")
    print(f"Target directory: {target_dir}")
    print("\nAvailable archives:")
    for key, url in BODYPARTS3D_ARCHIVES.items():
        print(f" - {key}: {url}")
    print("\nTo download a specific archive run:")
    print("  python3 download_bodyparts3d.py --download isa_99_reduced")

if __name__ == "__main__":
    main()
