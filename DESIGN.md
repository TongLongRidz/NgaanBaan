---
name: NgaanBaan Board
description: Ergonomic Kanban workspace for software engineering sprint management
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

**Creative North Star: "The Ergonomic Sprint Studio"**

NgaanBaan Board is designed as a focused, high-density engineering workspace built to minimize cognitive strain during intense sprint planning and daily standups. It balances sleek dark mode aesthetics with crisp light mode adaptability, employing subtle slate depth, intuitive tabular figures, and deliberate micro-interactions to make task progression effortless.

The system emphasizes high information density without visual clutter. Clean borders, soft focus halos, and consistent tactile feedback guide developers through complex issue tracking without distraction.

**Key Characteristics:**
- **High Ergonomic Contrast**: Deep dark slate surfaces (`#0d0f17` / `#121522`) alongside clean light surfaces (`#fafafa` / `#ffffff`).
- **Tactile Precision**: `12px` to `16px` rounded corners (`rounded-xl` / `rounded-2xl`) with subtle 1px border rules.
- **Bilingual & Tabular Clarity**: Native support for IBM Plex Sans Thai with tabular numeric figures for issue IDs and timestamps.

## Colors

The color palette uses Indigo as the primary interactive voice, supported by dark slate neutrals, amber user accents, and semantic status indicators.

### Primary
- **Indigo Pulse** (`#6366f1` / `oklch(60% 0.23 275)`): Used for interactive primary actions, active navigation items, focus halos, and key brand badges.

### Neutral
- **Dark Void Background** (`#0d0f17`): Base canvas for dark mode layout pages.
- **Dark Slate Surface** (`#121522` / `#131625`): Card surfaces, navbar headers, and modal containers in dark mode.
- **Light Paper Canvas** (`#fafafa`): Base canvas for light mode layout pages.
- **Light Surface Card** (`#ffffff`): Card containers and navbar headers in light mode.
- **Slate Border Divider** (`#1e293b` dark / `#e2e8f0` light): 1px structural borders separating header, column, and card bounds.

### Accent & Status
- **User Amber** (`#f59e0b`): User avatar highlights, assigned task indicator rings, and key callouts.
- **Emerald Done** (`#10b981`): Status badge for completed tasks and online indicators.
- **Rose Alert** (`#ef4444`): High-priority issues, deletion triggers, and error messages.

### Named Rules
**The Rarity of Primary Accent Rule.** Indigo accent fills are reserved exclusively for primary CTAs, active selection states, and focus rings. Never flood content cards with accent backgrounds.

## Typography

**Display & Body Font:** IBM Plex Sans Thai (with system-ui, -apple-system, BlinkMacSystemFont, sans-serif)

**Character:** Technical, clean, and highly legible across both English engineering terms and Thai task copy.

### Hierarchy
- **Display** (Bold, 1.25rem - 1.5rem, 1.2 line-height): Top navigation title and main page header titles.
- **Headline** (Bold / Semi-bold, 1rem - 1.125rem, 1.3 line-height): Board column headers, modal titles, section headers.
- **Body** (Regular / Medium, 0.875rem, 1.5 line-height): Task descriptions, user messages, and card details.
- **Label** (Semi-bold / Bold, 0.75rem, tracking-wider, uppercase): Column category headers, tag badges, and metadata labels.

### Named Rules
**The Tabular Data Rule.** All timestamps, task IDs, numbers, and counts must use the `.tabular-nums` utility class (`font-variant-numeric: tabular-nums`) to ensure zero visual jitter during real-time updates.

## Layout

NgaanBaan Board utilizes a sticky top navbar (`h-16`), a collapsible side navigation drawer, and a flexible horizontal scrolling grid for Kanban columns (`max-w-7xl` or full-bleed board canvas).

- **Spacing Rhythm**: 4px, 8px, 12px, 16px, 24px, 32px increments.
- **Card Padding**: Compact padding (`px-4 py-3`) for dense task listings.
- **Responsive Adaptability**: Flexbox layouts collapse to single-column lists on mobile viewports (<640px) while maintaining full multi-column drag-and-drop on desktop (>1024px).

## Elevation & Depth

The elevation model relies on 1px crisp borders (`border-slate-800/80` in dark, `border-slate-200` in light) combined with subtle backdrop blur (`backdrop-blur-md`) rather than heavy drop shadows.

### Shadow Vocabulary
- **Surface Elevation** (`shadow-sm`): Lightweight shadow (`0 1px 2px 0 rgba(0,0,0,0.05)`) applied to elevated light-mode cards and dropdown popovers.
- **Focus Halo Glow** (`0 0 0 2px rgba(99, 102, 241, 0.8)`): Indigo focus halo on interactive controls and active focus states.

### Named Rules
**The Border-First Depth Rule.** Surfaces are defined by crisp 1px borders and subtle background contrast. Shadows appear strictly as state feedback for hover, drag, or active popovers.

## Shapes

- **Containers & Cards**: `12px` to `16px` border-radius (`rounded-xl` to `rounded-2xl`).
- **Interactive Controls**: `8px` to `12px` border-radius (`rounded-lg` to `rounded-xl`).
- **Avatars & Badges**: Fully rounded (`rounded-full` / `9999px`).

## Components

### Buttons
- **Shape**: Rounded-xl (`12px` radius)
- **Primary**: Indigo fill (`#6366f1`), text white (`#ffffff`), padding `8px 16px`. Hover: Indigo deep (`#4f46e5`).
- **Ghost / Icon Button**: Transparent background, slate border (`1px`), text slate-300 (dark) / slate-700 (light). Hover: slate-800/60 (dark) / slate-100 (light).

### Cards
- **Corner Style**: `12px` radius (`rounded-xl`).
- **Background**: `#121522` in dark mode, `#ffffff` in light mode.
- **Border**: 1px `border-slate-800` (dark) / `border-slate-200` (light).
- **Internal Padding**: `16px` (`p-4`).

### Inputs / Search Fields
- **Style**: 1px border (`border-slate-800` dark / `border-slate-200` light), `12px` radius (`rounded-xl`), padding `8px 16px 8px 36px` (with search icon).
- **Focus**: Indigo ring (`ring-2 ring-indigo-500/80`), border glow.

### Navigation
- **Top Navbar**: Height `64px` (`h-16`), sticky `top-0`, backdrop blur (`backdrop-blur-md`), 1px bottom border.

## Do's and Don'ts

### Do:
- **Do** maintain high contrast between text and background in both light (`#fafafa`) and dark (`#0d0f17`) modes.
- **Do** apply `font-variant-numeric: tabular-nums` to numbers, task counts, and timestamps.
- **Do** keep interactive touch/click targets to a minimum of 36x36px with rounded-xl boundaries.

### Don't:
- **Don't** use heavy, dark, diffuse drop shadows that muddy the card layout.
- **Don't** mix unstyled system sans-serif fonts; always utilize IBM Plex Sans Thai with fallback stacks.
- **Don't** use colored left/right accent borders over 1px on task cards.
