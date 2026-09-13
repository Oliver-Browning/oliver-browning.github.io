---
title: "Teardown: low-cost SDR front end"
summary: "Reverse-engineering a $30 RTL-SDR dongle's RF front end to
  understand its tuner architecture and image-rejection tradeoffs."
date: 2026-08-30
type: teardown
domains: [rf, signal-processing]
tech: [Python, Spectrum Analyzer]
skills:
  - RF front-end analysis
  - image rejection tradeoff evaluation
keywords:
  - RTL-SDR
  - direct sampling
  - tuner IC
  - image rejection
status: in-progress
featured: false
draft: false
---

> **Sample post.** This is placeholder content written to exercise the
> schema and the index page — it also shows what an `in-progress` post
> looks like. Delete it once a real write-up takes its place.

## Why

Wanted to understand what a commodity SDR dongle actually does between the
antenna and the ADC before trusting one for a measurement, rather than
treating it as a black box.

## So far

Traced the front end to a direct-conversion tuner IC feeding a USB
demodulator chip. Confirmed the tuner's reported IF bandwidth against a
signal generator and spectrum analyzer; measured image rejection is
noticeably worse near the tuner's PLL boundary frequencies, which matches
the datasheet's caveats.

## Next

Still need to characterize gain compression at the front end's input to
know what signal levels will start distorting measurements before this is
useful as a bench tool.
