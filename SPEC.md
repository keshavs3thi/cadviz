# Specification: Minimalist 3D CAD & Portfolio Visualizer Sandbox

## 1. Project Overview & Objective
Build a lightweight, high-performance web-based 3D visualizer tailored for an industrial design portfolio. The tool allows testing and previewing 3D models (GLB, GLTF, STL, OBJ), tweaking materials/finishes in real time, and evaluating performance before integrating the module into the main portfolio.

---

## 2. Tech Stack & Dependencies
* **Framework:** React + Vite + TypeScript
* **3D Engine:** Three.js + `@react-three/fiber` (R3F)
* **3D Helpers:** `@react-three/drei` (OrbitControls, Environment, Bounds, ContactShadows)
* **Styling:** Tailwind CSS (Strict custom config)
* **Icons:** Lucide-React (minimal, 1px stroke weight)

---

## 3. UI & Visual Design System (Strict Anti-AI Rules)
* **Palette:** Pure Monochrome.
  * Background: `#FFFFFF` (Light Mode default) / `#0A0A0A` (Dark Mode toggle)
  * Surface/Borders: `#000000` / `#E5E5E5` / `#262626`
  * Text: `#000000` (Primary), `#737373` (Secondary / Muted)
  * Accents: No colors. Active states indicated by inverted background (`#000000` fill, `#FFFFFF` text).
* **Typography:**
  * Primary Body & Headers: `Helvetica Neue`, `Helvetica`, `Arial`, sans-serif.
  * Data/HUD/Metrics: System Monospace (`ui-monospace`, `SFMono-Regular`, `Menlo`, monospace).
  * Scale: Tight editorial scale, heavy tracking on small uppercase tags (`text-[10px] tracking-widest uppercase`).
* **Layout Structure:**
  * Clean split-screen / architectural layout.
  * Left / Main: Full-bleed 3D Canvas with technical HUD overlays (FPS, Polycount, Model Dimensions).
  * Right Sidebar (or Bottom Dock): 320px fixed-width inspector with crisp 1px borders (`border-neutral-200`). No blur shadows or rounded floating cards.

---

## 4. Core Functional Requirements

### A. File Ingestion & Handling
* **Drag-and-Drop Area & Native File Picker** supporting `.glb`, `.gltf`, `.stl`, and `.obj`.
* Local, client-side only (no remote backend uploads; load via `URL.createObjectURL`).
* Automatic scene reset and camera auto-framing on model load (utilize `<Bounds fit clip observe>` from `@react-three/drei`).
* Default fallback: Load a minimal sample industrial object if no file is uploaded.

### B. 3D Scene & Lighting Configuration
* Studio-grade neutral 3-point lighting setup + HDR studio environment (`@react-three/drei` Environment preset: `studio` or `city`).
* Smooth OrbitControls with damping, clamped zoom distances, and auto-rotation toggle.
* Subtle contact shadow plane beneath the object (`ContactShadows` opacity: 0.4, blur: 1.5).

### C. Material & Surface Controls (The Sandbox Layer)
Allow applying global override materials or adjusting active mesh PBR properties:
* **Shading Presets:**
  * *Original* (Keep embedded GLTF materials)
  * *Matte Clay* (Roughness: 0.9, Metalness: 0.0, Color: `#E0E0E0`)
  * *Gloss Plastic* (Roughness: 0.15, Metalness: 0.0, Clearcoat: 0.8)
  * *Brushed Aluminum* (Roughness: 0.35, Metalness: 0.95)
  * *Technical Wireframe* (Black wireframe over transparent or solid base)
  * *Surface Normals* (Visualizes mesh normal vectors)
* **Granular Sliders (HUD panel):**
  * Roughness ($0.0 - 1.0$)
  * Metalness ($0.0 - 1.0$)
  * Color Picker (Monochrome grayscale ramp + hex input)
  * Wireframe Overlay Toggle

### D. Model Metrics & Diagnostic HUD
Display non-intrusive technical data in the corner:
* Vertex count / Triangle (face) count.
* Bounding box dimensions ($X \times Y \times Z$ in bounding units).
* Reset Camera / Recenter Button.

---
