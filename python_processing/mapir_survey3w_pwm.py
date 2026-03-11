#!/usr/bin/env python3
"""
MAPIR Survey3(W) PWM controller for Raspberry Pi.

Based on MAPIR's documented PWM control concept:
- 1000µs: idle / do-nothing (keep sending)
- 1500µs: mount/unmount SD
- 2000µs: trigger capture

This module is Pi-only (requires RPi.GPIO). It is imported lazily so the rest
of the codebase remains usable on non-Pi systems.

Default pin uses hardware PWM on BCM18 (physical pin 12), which matches many
MAPIR examples.
"""

from __future__ import annotations

import time
from dataclasses import dataclass


def _duty_cycle_for_pulse_us(pulse_us: int, period_us: int = 20000) -> float:
    """Convert microsecond pulse width to PWM duty cycle percentage."""
    return (pulse_us / period_us) * 100.0


@dataclass
class Survey3WPWMConfig:
    gpio_bcm_pin: int = 18  # BCM18 (physical pin 12), hardware PWM capable
    frequency_hz: int = 50  # 20ms period (servo PWM)
    idle_pulse_us: int = 1000
    mount_pulse_us: int = 1500
    trigger_pulse_us: int = 2000

    # Timing: MAPIR docs commonly recommend >=1.5s between JPG captures
    min_trigger_interval_s: float = 1.6


class Survey3WPWMController:
    """
    Sends PWM pulses to control a MAPIR Survey3(W) camera.
    """

    def __init__(self, config: Survey3WPWMConfig | None = None):
        self.config = config or Survey3WPWMConfig()
        self._gpio = None
        self._pwm = None
        self._last_trigger_ts = 0.0

    def start(self) -> None:
        try:
            import RPi.GPIO as GPIO  # type: ignore
        except Exception as e:
            raise RuntimeError(
                "RPi.GPIO is required for MAPIR PWM control. "
                "Install on the Raspberry Pi (e.g., `sudo apt-get install -y python3-rpi.gpio`) "
                "and run this script on a Pi."
            ) from e

        self._gpio = GPIO
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.config.gpio_bcm_pin, GPIO.OUT)

        pwm = GPIO.PWM(self.config.gpio_bcm_pin, self.config.frequency_hz)
        pwm.start(_duty_cycle_for_pulse_us(self.config.idle_pulse_us))
        self._pwm = pwm

    def stop(self) -> None:
        if self._pwm is not None:
            try:
                self._pwm.stop()
            except Exception:
                pass
            self._pwm = None
        if self._gpio is not None:
            try:
                self._gpio.cleanup()
            except Exception:
                pass
            self._gpio = None

    def __enter__(self) -> "Survey3WPWMController":
        self.start()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.stop()

    def _pulse(self, pulse_us: int, hold_s: float = 0.25) -> None:
        if self._pwm is None:
            raise RuntimeError("PWM controller not started. Call start() first.")
        duty = _duty_cycle_for_pulse_us(pulse_us)
        self._pwm.ChangeDutyCycle(duty)
        time.sleep(hold_s)
        # Return to idle
        self._pwm.ChangeDutyCycle(_duty_cycle_for_pulse_us(self.config.idle_pulse_us))

    def trigger(self) -> None:
        now = time.time()
        if (now - self._last_trigger_ts) < self.config.min_trigger_interval_s:
            # Avoid spamming trigger faster than camera can capture
            time.sleep(self.config.min_trigger_interval_s - (now - self._last_trigger_ts))
        self._pulse(self.config.trigger_pulse_us, hold_s=0.25)
        self._last_trigger_ts = time.time()

    def mount_sd_toggle(self) -> None:
        # Same pulse toggles mount/unmount; the camera decides based on current state.
        self._pulse(self.config.mount_pulse_us, hold_s=0.5)

