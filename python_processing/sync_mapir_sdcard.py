#!/usr/bin/env python3
"""
Sync images from a mounted MAPIR Survey3(W) SD card to a local mission folder.

This script is designed for the common MAPIR workflow:
1) Trigger captures via PWM during flight (camera writes to SD)
2) After flight, mount SD over USB (MAPIR PWM mount toggle) or remove SD and mount normally
3) Copy images from the camera/DCIM folder into /home/pi/drone_images (or another output dir)
4) Then upload images via the web client or `POST /api/images` on the Node server

The script:
- Finds a likely mountpoint under /media/pi that contains a DCIM folder
- Copies new files (jpg/jpeg/png/tif/tiff) into the output folder
- Tracks copied filenames in a manifest to avoid duplicates

Usage:
  python3 sync_mapir_sdcard.py --output /home/pi/drone_images
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


EXTS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}


def find_dcim_roots() -> list[Path]:
    candidates: list[Path] = []
    media_root = Path("/media/pi")
    if not media_root.exists():
        return candidates
    for mount in media_root.glob("*"):
        dcim = mount / "DCIM"
        if dcim.exists() and dcim.is_dir():
            candidates.append(dcim)
    return candidates


def load_manifest(manifest_path: Path) -> set[str]:
    if not manifest_path.exists():
        return set()
    try:
        return set(manifest_path.read_text(encoding="utf-8").splitlines())
    except Exception:
        return set()


def save_manifest(manifest_path: Path, names: set[str]) -> None:
    manifest_path.write_text("\n".join(sorted(names)) + "\n", encoding="utf-8")


def sync(output_dir: Path, source_dcim: Path | None = None) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = output_dir / ".mapir_synced_manifest.txt"
    already = load_manifest(manifest_path)

    dcim_roots = [source_dcim] if source_dcim else find_dcim_roots()
    if not dcim_roots:
        raise RuntimeError("No DCIM folder found under /media/pi. Is the SD card mounted?")

    copied = 0
    for dcim in dcim_roots:
        for p in dcim.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() not in EXTS:
                continue
            if p.name in already:
                continue
            dest = output_dir / p.name
            # If a file with same name exists, avoid overwriting by suffixing.
            if dest.exists():
                stem = dest.stem
                suffix = dest.suffix
                i = 1
                while True:
                    candidate = output_dir / f"{stem}_{i}{suffix}"
                    if not candidate.exists():
                        dest = candidate
                        break
                    i += 1
            shutil.copy2(p, dest)
            already.add(p.name)
            copied += 1
            print(f"✓ Copied {p} -> {dest}")

    save_manifest(manifest_path, already)
    return copied


def main():
    ap = argparse.ArgumentParser(description="Sync MAPIR SD images from DCIM to output folder")
    ap.add_argument("--output", type=str, default="/home/pi/drone_images", help="Output folder")
    ap.add_argument("--dcim", type=str, default=None, help="Optional explicit DCIM path")
    args = ap.parse_args()

    out = Path(args.output)
    dcim = Path(args.dcim) if args.dcim else None
    n = sync(out, dcim)
    print(f"\nDone. Copied {n} new file(s) into {out}")


if __name__ == "__main__":
    main()

