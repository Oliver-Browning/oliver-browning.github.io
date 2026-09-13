---
title: "CubeSat power distribution board"
summary: "4-rail regulated power board for a 1U CubeSat payload, designed in
  Altium and validated against a simulated eclipse power budget."
date: 2025-11-02
updated: 2026-01-20
type: coursework
domains: [power, pcb]
tech: [Altium, LTspice, Python, Oscilloscope]
skills:
  - switching regulator design
  - power budget analysis
  - PCB layout for EMI
  - bring-up and bench validation
keywords:
  - EPS
  - electrical power system
  - buck converter
  - solar array simulator
status: complete
featured: true
draft: false
---

> **Sample post.** This is placeholder content written to exercise the
> schema and the index page. Delete it once a real write-up takes its
> place.

## Summary

Built the electrical power system board for a 1U CubeSat payload as part of
a student-org design project: battery input, four independently regulated
rails (5V, 3.3V, and two adjustable), and load switching for payload
subsystems. This write-up covers the regulator design and the bring-up
process, not the whole spacecraft.

## Design

Each rail uses a synchronous buck converter sized against a worst-case
eclipse power budget built in a spreadsheet first, then checked against an
LTspice transient sim for inrush and ripple. Layout kept switching loops
short and used a solid ground plane under each converter to keep conducted
EMI down — this was the first board where a bad first layout attempt taught
me why that matters.

## Bring-up

Brought the board up rail by rail on a bench supply before connecting a
battery simulator, checking output ripple and load-step response with a
scope at each stage. One rail oscillated under light load; adding a minimum-
load resistor fixed it, which pointed to the converter dropping out of
continuous conduction mode below its rated current.

## What I'd change

I'd add current sense on each rail before the next revision — right now,
per-rail power draw can only be inferred from the shared input current, not
measured directly.
