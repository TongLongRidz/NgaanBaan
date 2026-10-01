---
name: NgaanBaan Board
description: Ergonomic Kanban workspace with strict Dark/Light theme adaptation
colors:
  primary: "#6366f1"
  primary-hover: "#4f46e5"
  neutral-dark-bg: "#0d0f17"
  neutral-dark-card: "#121522"
  neutral-light-bg: "#fafafa"
  neutral-light-card: "#ffffff"
  accent-user: "#f59e0b"
  status-success: "#10b981"
  status-error: "#ef4444"
typography:
  display:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: "1.2"
  body:
    fontFamily: "IBM Plex Sans Thai, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: NgaanBaan Board

## Overview

**Creative North Star: "Clean & Adaptive Dual-Theme Workspace"**

NgaanBaan Board is designed with a strict, minimalist **Dark & Light Mode** paradigm. It avoids unusual saturated colors, bright neon gradients, or overwhelming accent overlays. Instead, it relies on clean Slate neutrals (`#0d0f17` in Dark / `#fafafa` in Light), crisp 1px border dividers, and subtle Indigo actions to provide maximum legibility and zero visual fatigue.

**Key Characteristics:**
- **Strict Dual-Theme System**: Seamless adaptation between Dark Mode (`#0d0f17` bg / `#121522` card) and Light Mode (`#fafafa` bg / `#ffffff` card).
- **Clean Neutral Palette**: No exotic rainbow gradients or non-standard saturated backgrounds.
- **Ergonomic Precision**: Rounded corners (`12px` to `16px`) with crisp 1px structural borders (`border-slate-800` in Dark / `border-slate-200` in Light).
- **Bilingual Typography**: Native IBM Plex Sans Thai font hierarchy with tabular numbers for timestamps and counts.

## Colors

The color palette uses refined Slate neutrals for structure and deep Indigo for primary actions, with clear semantic status indicators.

### Primary
- **Indigo Action** (`#6366f1` / `#4f46e5`): Used for primary buttons, active tab indicators, selection highlights, and key focus rings.

### Neutral (Dark & Light)
- **Dark Mode Canvas** (`#0d0f17`): Pure dark background for overall pages in dark mode.
- **Dark Mode Surface** (`#121522` / `#131625`): Card surfaces, sidebar panels, and modal containers in dark mode.
- **Light Mode Canvas** (`#fafafa`): Soft neutral light background for overall pages in light mode.
- **Light Mode Surface** (`#ffffff`): Crisp white cards, sidebars, and modals in light mode.
- **Border Rules** (`#1e293b` in Dark / `#e2e8f0` in Light): Subtle 1px structural dividers.

### Status Indicators
- **Emerald Success** (`#10b981`): Active user status, completed tasks, and success alerts.
- **Amber Notice** (`#f59e0b`): Away status and medium-priority indicators.
- **Rose Danger** (`#ef4444`): High-priority tasks, delete triggers, and error messages.

### Strict Rules
- **No Unusual Colors or Loud Gradients**: Avoid bright purple/pink gradient backgrounds or neon surfaces. Maintain dark slate or crisp white surface contrast.
- **Controlled Accent Use**: Indigo and status colors are used strictly for badges, buttons, and state indicators, never as full container backgrounds.

## Typography

**Font Family:** IBM Plex Sans Thai (with system-ui, -apple-system, sans-serif)

### Hierarchy
- **Display** (Bold, 1.25rem - 1.5rem): Main headers and brand title.
- **Headline** (Bold / Semi-bold, 1rem - 1.125rem): Section titles, modal headers, card titles.
- **Body** (Regular / Medium, 0.875rem): Standard UI text, descriptions, and labels.
- **Label & Metadata** (Semi-bold, 0.75rem): Metadata, tag badges, and timestamps (`.tabular-nums`).

## Layout & Elevation

- **Top Navbar**: Height `64px` (`h-16`), sticky top, with dynamic theme border (`border-slate-200` light / `border-slate-800` dark).
- **Side Navbar**: Collapsible width (`16rem` expanded / `4rem` collapsed), sticky left side.
- **Depth**: Defined by 1px crisp borders and subtle contrast between canvas (`#fafafa` / `#0d0f17`) and card surfaces (`#ffffff` / `#121522`). Heavy shadows are avoided.

## Components

### Buttons & Toggles
- **Primary**: Indigo background (`#6366f1`), white text, rounded-xl (`12px`).
- **Pill Switchers**: Rounded-full container (`bg-[var(--input-bg)]`), active pill highlighted with `#10b981` (Emerald) or `#6366f1` (Indigo).
- **Secondary / Ghost**: Neutral surface with 1px border (`border-slate-200` light / `border-slate-800` dark).

### Cards & Modals
- **Card Container**: `12px` - `16px` border-radius, background matching the active theme (`bg-white` in light, `bg-slate-900` in dark), 1px border.

## Guidelines
- **Do** strictly follow the Dark / Light theme variables (`var(--background)`, `var(--card-bg)`, `var(--foreground)`, `var(--card-border)`).
- **Do** keep design clean, ergonomic, and easy on the eyes for extended software usage.
- **Don't** add random saturated background colors or bright gradients to page containers.
- **Don't** use decorative emojis in titles, headers, or buttons (e.g. 👋, 🚀, ✨, 🔥). Emojis clutter professional interface typography.
- **Don't** add unnecessary decorative pill badges or sparkle tag labels above page headers unless explicitly requested. Keep page headers clean, direct, and purposeful.


