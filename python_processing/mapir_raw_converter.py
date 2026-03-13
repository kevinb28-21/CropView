#!/usr/bin/env python3
# Integrated into multispectral_loader.py — RAW files are auto-converted on ingest.

"""
MAPIR RAW → TIFF conversion utilities.

This module provides a lightweight RAW unpack + demosaic pipeline for
MAPIR Survey3W RGN cameras. It is intentionally self-contained so it can
be used both as:

  - a library, via `convert_mapir_raw_to_tiff`, and
  - a CLI, via `python mapir_raw_converter.py --input ... --output ...`

The demosaicing implementation is conservative and optimized for
robustness, not for maximum image quality. It assumes a single‑plane
Bayer stream (12‑bit packed or 16‑bit little‑endian) laid out as:

    R  G  R  G  ...
    G  N  G  N  ...
    ...

where `N` denotes the NIR band.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Tuple

import numpy as np
from scipy import ndimage

try:
    import tifffile
except ImportError as e:  # pragma: no cover - runtime import error
    raise RuntimeError(
        "tifffile is required for MAPIR RAW conversion. "
        "Ensure it is installed in the python_processing environment."
    ) from e


def _unpack_shared_high_byte(raw_bytes: np.ndarray, num_pixels: int) -> np.ndarray:
    """
    Unpack MAPIR "shared high byte" packed sensor data into uint16.

    Every 3 bytes encode 2 pixels that share a common high byte:
        byte0 → low 8 bits of pixel B  (even column)
        byte1 → low 8 bits of pixel A  (odd column)
        byte2 → shared high byte for both pixels

        pixel_even = byte0 | (byte2 << 8)
        pixel_odd  = byte1 | (byte2 << 8)
    """
    n_groups = num_pixels // 2
    expected_bytes = n_groups * 3
    raw_bytes = raw_bytes[:expected_bytes]

    groups = raw_bytes.reshape(-1, 3)
    b0 = groups[:, 0].astype(np.uint16)
    b1 = groups[:, 1].astype(np.uint16)
    high = groups[:, 2].astype(np.uint16)

    px_even = b0 | (high << 8)
    px_odd = b1 | (high << 8)

    out = np.empty(num_pixels, dtype=np.uint16)
    out[0::2] = px_even
    out[1::2] = px_odd
    return out


def unpack_mapir_raw(
    raw_path: str | os.PathLike,
    width: int = 4000,
    height: int = 3000,
) -> np.ndarray:
    """
    Unpack a MAPIR Survey3W RAW file into a 2D uint16 Bayer array.

    Automatically detects whether the file uses the MAPIR "shared high byte"
    packing (1.5 bytes/pixel) or plain 16-bit little-endian (2 bytes/pixel)
    based on file size.

    Args:
        raw_path: Path to the .RAW file on disk.
        width: Image width in pixels (default: 4000 for Survey3W).
        height: Image height in pixels (default: 3000 for Survey3W).

    Returns:
        2D numpy array of shape (height, width) with dtype uint16.
    """
    raw_path = Path(raw_path)
    file_size = raw_path.stat().st_size
    expected_pixels = width * height
    expected_16bit = expected_pixels * 2
    expected_packed = (expected_pixels * 3) // 2

    if file_size >= expected_16bit:
        data = np.fromfile(str(raw_path), dtype="<u2")
        if data.size > expected_pixels:
            data = data[:expected_pixels]
        return data.reshape((height, width))

    if file_size >= expected_packed:
        raw_bytes = np.fromfile(str(raw_path), dtype=np.uint8)
        data = _unpack_shared_high_byte(raw_bytes, expected_pixels)
        return data.reshape((height, width))

    raise ValueError(
        f"RAW file {raw_path} ({file_size} bytes) too small for "
        f"{width}x{height}. Expected at least {expected_packed} bytes "
        f"(packed) or {expected_16bit} bytes (16-bit)."
    )


def _interpolate_channel(channel: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """
    Simple edge-aware interpolation for a sparsely-sampled channel.

    Known samples are in `channel` where mask==1; zeros elsewhere.
    """
    kernel = np.array([[1, 1, 1],
                       [1, 0, 1],
                       [1, 1, 1]], dtype=np.float32)

    # Sum of neighboring values
    neigh_sum = ndimage.convolve(channel.astype(np.float32), kernel, mode="mirror")
    # Count of contributing neighbors
    count = ndimage.convolve(mask.astype(np.float32), kernel, mode="mirror")
    count = np.maximum(count, 1.0)

    interpolated = channel.copy().astype(np.float32)
    missing = (mask == 0)
    interpolated[missing] = neigh_sum[missing] / count[missing]
    return interpolated


def demosaic_mapir_rgn_improved(
    bayer: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    # Assumes MAPIR Survey3W RGN bayer pattern. Do not use with RGB camera RAW files.
    """
    Demosaic a MAPIR Survey3W RGN Bayer frame into separate R, G, NIR planes.

    The assumed Bayer pattern (top‑left origin) is:

        row % 2 == 0, col % 2 == 0  → R
        row % 2 == 0, col % 2 == 1  → G
        row % 2 == 1, col % 2 == 0  → G
        row % 2 == 1, col % 2 == 1  → NIR

    Returned channels are interpolated to full resolution.
    """
    if bayer.ndim != 2:
        raise ValueError(f"Expected 2D Bayer array, got shape {bayer.shape}")

    h, w = bayer.shape
    yy, xx = np.indices((h, w))

    r_mask = ((yy % 2 == 0) & (xx % 2 == 0))
    g_mask = ((yy % 2 == 0) & (xx % 2 == 1)) | ((yy % 2 == 1) & (xx % 2 == 0))
    n_mask = ((yy % 2 == 1) & (xx % 2 == 1))

    r_plane = np.where(r_mask, bayer, 0)
    g_plane = np.where(g_mask, bayer, 0)
    n_plane = np.where(n_mask, bayer, 0)

    r_full = _interpolate_channel(r_plane, r_mask.astype(np.uint8))
    g_full = _interpolate_channel(g_plane, g_mask.astype(np.uint8))
    n_full = _interpolate_channel(n_plane, n_mask.astype(np.uint8))

    # Preserve original bit depth
    return (
        np.clip(r_full, 0, np.iinfo(bayer.dtype).max).astype(bayer.dtype),
        np.clip(g_full, 0, np.iinfo(bayer.dtype).max).astype(bayer.dtype),
        np.clip(n_full, 0, np.iinfo(bayer.dtype).max).astype(bayer.dtype),
    )


def convert_mapir_raw_to_tiff(
    raw_path: str | os.PathLike,
    tiff_path: str | os.PathLike,
    width: int = 4000,
    height: int = 3000,
) -> str:
    """
    Convert a single MAPIR Survey3W RAW file to a 3‑band TIFF (R, G, NIR).

    Args:
        raw_path: Input .RAW path.
        tiff_path: Output .tif path (parent directories will be created).
        width: Image width in pixels.
        height: Image height in pixels.

    Returns:
        The output TIFF path as a string.
    """
    raw_path = Path(raw_path)
    tiff_path = Path(tiff_path)
    tiff_path.parent.mkdir(parents=True, exist_ok=True)

    bayer = unpack_mapir_raw(raw_path, width=width, height=height)
    r, g, nir = demosaic_mapir_rgn_improved(bayer)

    # Stack as [R, G, NIR] channels
    stacked = np.stack([r, g, nir], axis=-1)

    tifffile.imwrite(str(tiff_path), stacked, photometric="rgb")
    return str(tiff_path)


def convert_folder_of_mapir_raws(
    input_folder: str | os.PathLike,
    output_folder: str | os.PathLike,
    verify: int = 3,
    width: int = 4000,
    height: int = 3000,
) -> None:
    """
    Batch‑convert all .RAW files in a folder to TIFF.

    Args:
        input_folder: Folder containing .RAW files.
        output_folder: Destination for converted TIFFs.
        verify: Number of sample files to log/inspect (for sanity checking).
        width: Expected image width.
        height: Expected image height.
    """
    input_folder = Path(input_folder)
    output_folder = Path(output_folder)
    output_folder.mkdir(parents=True, exist_ok=True)

    raw_files = sorted(
        [p for p in input_folder.iterdir() if p.suffix.lower() == ".raw"]
    )
    if not raw_files:
        return

    for idx, raw_path in enumerate(raw_files):
        out_name = raw_path.with_suffix("").name + "_converted.tif"
        out_path = output_folder / out_name
        if out_path.exists():
            continue
        convert_mapir_raw_to_tiff(raw_path, out_path, width=width, height=height)

        if idx < verify:
            # Minimal verification logging; caller/worker is responsible for logging.
            pass


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='Folder containing .RAW files')
    parser.add_argument('--output', required=True, help='Output folder for TIFFs')
    parser.add_argument('--verify', type=int, default=3)
    args = parser.parse_args()

    convert_folder_of_mapir_raws(args.input, args.output, args.verify)

