---
title: "X-band phased array beamformer"
summary: "8-element passive array with a 5-bit digital phase shifter, measured
  against a simulated pattern in an anechoic chamber."
date: 2026-03-14
type: project
domains: [rf, antennas, signal-processing]
tech: [HFSS, Python, VNA]
skills:
  - S-parameter measurement
  - link budget analysis
  - antenna pattern characterization
keywords:
  - X band
  - 8-12 GHz
  - beam steering
  - AESA
status: complete
featured: true
draft: false
---

> **Sample post.** This is placeholder content written to exercise the
> schema and the index page. Delete it once a real write-up takes its
> place.

## Summary

Designed and measured an 8-element passive phased array at X-band, driven by
a 5-bit digital phase shifter per element. The goal was to get hands-on with
the full loop — simulate a pattern in HFSS, build the feed network, measure
it on a VNA, and compare the measured pattern against simulation in an
anechoic chamber.

## Design

Each element is a probe-fed patch tuned for 10 GHz, spaced at 0.5λ to avoid
grating lobes across a ±45° scan range. The phase shifters are 5-bit digital
parts (11.25° resolution), controlled from a microcontroller over SPI so the
whole array can be swept programmatically during test.

## Measurement

Far-field cuts were taken at broadside and at ±30° scan angles. Sidelobe
levels tracked simulation within about 2 dB out to the third sidelobe; the
divergence past that is consistent with feed-network amplitude mismatch that
HFSS's ideal excitation doesn't capture.

## What I'd change

The phase shifter's insertion-loss variance across states wasn't calibrated
out before the scan sweep, which shows up as slight beam-pointing error at
the extremes. A per-state calibration table would fix it.
