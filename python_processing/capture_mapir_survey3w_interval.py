#!/usr/bin/env python3
"""
Interval-based capture for MAPIR Survey3(W) using PWM trigger from a Raspberry Pi.

This script:
1) Sends PWM trigger pulses to the camera at a fixed interval.
2) Logs trigger events to a JSONL file (optionally with MAVLink GPS if configured).

Important:
- Survey3(W) stores images on its SD card. This script does NOT download images.
- After the mission, run a separate "sync/download" step (mount SD via PWM, then copy files)
  or remove the SD card and copy images manually.

Usage (Pi):
  python3 capture_mapir_survey3w_interval.py --interval 2 --duration 60

Optional GPS logging (Pixhawk):
  python3 capture_mapir_survey3w_interval.py --interval 2 --duration 60 --mavlink /dev/ttyUSB0 --baud 57600
"""

from __future__ import annotations

import argparse
import json
import time
from datetime import datetime
from pathlib import Path

from mapir_survey3w_pwm import Survey3WPWMController, Survey3WPWMConfig


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _try_get_vehicle(mavlink: str | None, baud: int):
    if not mavlink:
        return None
    try:
        from dronekit import connect  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "dronekit is required for --mavlink GPS logging. "
            "Install on the Pi: `pip install dronekit pymavlink`"
        ) from e
    return connect(mavlink, baud=baud, wait_ready=True)


def _read_gps(vehicle):
    """
    Normalize GPS fields into the format used by Node backend:
    latitude, longitude, altitude, bearing, speed, accuracy, timestamp
    """
    if vehicle is None:
        return None
    try:
        loc = vehicle.location.global_frame
        if not loc:
            return None
        lat = getattr(loc, "lat", None)
        lon = getattr(loc, "lon", None) or getattr(loc, "lng", None)
        alt = getattr(loc, "alt", None)
        if lat is None or lon is None:
            return None
        return {
            "latitude": float(lat),
            "longitude": float(lon),
            "altitude": float(alt) if alt is not None else None,
            "bearing": float(getattr(vehicle, "heading", 0.0) or 0.0),
            "speed": float(getattr(vehicle, "groundspeed", 0.0) or 0.0),
            "timestamp": int(time.time() * 1000),
        }
    except Exception:
        return None


def run(interval_s: float, duration_s: float, log_path: str, mavlink: str | None, baud: int, gpio_pin: int):
    output = Path(log_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    vehicle = _try_get_vehicle(mavlink, baud)
    cfg = Survey3WPWMConfig(gpio_bcm_pin=gpio_pin)

    start = time.time()
    n = 0

    with Survey3WPWMController(cfg) as cam:
        try:
            while (time.time() - start) < duration_s:
                cam.trigger()
                n += 1
                gps = _read_gps(vehicle)
                event = {
                    "event": "trigger",
                    "index": n,
                    "timestamp": _now_iso(),
                    "gps": gps,
                }
                with open(output, "a", encoding="utf-8") as f:
                    f.write(json.dumps(event) + "\n")
                print(f"[{n}] Triggered capture" + (f" @ {gps['latitude']:.6f},{gps['longitude']:.6f}" if gps else ""))
                time.sleep(interval_s)
        except KeyboardInterrupt:
            print("\nStopped by user.")
        finally:
            if vehicle is not None:
                try:
                    vehicle.close()
                except Exception:
                    pass
    print(f"Done. Triggers sent: {n}. Log: {output}")


def main():
    p = argparse.ArgumentParser(description="MAPIR Survey3(W) interval capture via PWM")
    p.add_argument("--interval", type=float, default=2.0, help="Seconds between triggers (>=1.6 recommended)")
    p.add_argument("--duration", type=float, default=60.0, help="Total duration in seconds")
    p.add_argument("--log", type=str, default="/home/pi/drone_images/mapir_triggers.jsonl", help="JSONL log path")
    p.add_argument("--mavlink", type=str, default=None, help="Pixhawk connection string (e.g., /dev/ttyUSB0)")
    p.add_argument("--baud", type=int, default=57600, help="MAVLink baud rate (default 57600)")
    p.add_argument("--gpio", type=int, default=18, help="BCM GPIO pin for PWM (default 18)")
    args = p.parse_args()
    run(args.interval, args.duration, args.log, args.mavlink, args.baud, args.gpio)


if __name__ == "__main__":
    main()

