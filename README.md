<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>

<!-- PROJECT LOGO & HEADER -->
<br />
<div align="center">
  <a href="https://github.com/rafaelpacinii/my-book-writer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/brand/logo-horizontal-dark.svg">
      <img src="public/brand/logo-horizontal-color.svg" alt="My Book Writer" width="360" height="88">
    </picture>
  </a>

  <h1 align="center">My Book Writer</h1>

  <p align="center">
    <strong>A calm, professional, local-first desktop editorial studio for authors and book makers.</strong>
    <br />
    Distraction-free writing, dual-mode typography engine (Continuous & Paged), automated version snapshots, and print-ready PDF/EPUB/DOCX exports powered by Tauri v2, Next.js, and SQLite.
    <br />
    <br />
    <a href="#about-the-project"><strong>Explore the documentation »</strong></a>
    <br />
    <br />
    <a href="#key-features">Key Features</a>
    ·
    <a href="#system-architecture">Architecture</a>
    ·
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#automated-testing--quality">Testing & Quality</a>
    ·
    <a href="branding/README.md">Brand Guidelines</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#local-first-philosophy">Local-First Philosophy</a></li>
      </ul>
    </li>
    <li>
      <a href="#key-features">Key Features</a>
      <ul>
        <li><a href="#editorial-writing--dual-mode-engine">Editorial Writing & Dual-Mode Engine</a></li>
        <li><a href="#version-control--track-changes">Version Control & Track Changes</a></li>
        <li><a href="#book-formatting--front-matter">Book Formatting & Front Matter</a></li>
        <li><a href="#high-fidelity-exports">High-Fidelity Exports (PDF, EPUB, DOCX)</a></li>
        <li><a href="#deterministic-geometric-covers">Deterministic Geometric Covers</a></li>
        <li><a href="#sqlite-backup--portability">SQLite Backup & Portability</a></li>
      </ul>
    </li>
    <li><a href="#system-architecture">System Architecture</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation--setup">Installation & Setup</a></li>
        <li><a href="#running-locally">Running Locally</a></li>
        <li><a href="#building-for-production">Building for Production</a></li>
      </ul>
    </li>
    <li><a href="#automated-testing--quality">Automated Testing & Quality</a></li>
    <li><a href="#design-system--editorial-aesthetics">Design System & Editorial Aesthetics</a></li>
    <li><a href="#git-workflow--conventions">Git Workflow & Conventions</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact--author">Contact & Author</a></li>
  </ol>
</details>

---

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Preview][product-screenshot]](docs/prototipo-ui/visao-geral.png)

Writing a book requires intense concentration, typographic accuracy, and sovereign ownership of intellectual property. Most contemporary word processors fail authors either by forcing complex cloud dependencies or by treating page layout as an afterthought.

**My Book Writer** is an offline-first desktop editorial workstation engineered to bridge the gap between creative writing and physical book manufacturing:

* **Sovereign & Local-First**: Your manuscripts, versions, revisions, and metadata reside directly on your machine in an embedded SQLite database (`WAL` mode). No mandatory accounts, no telemetry, no subscription lock-ins.
* **True Dual-Mode Editor**: Seamlessly switch between a comfortable **Continuous Mode** (fluid reading and drafting) and a **Paged Mode** (pixel-precise print preview with real page dimensions, inner/outer margins, running headers, and folio counts).
* **Automated Versioning & Track Changes**: Automatic snapshots created during major saves and track changes sessions, complete with side-by-side text diffing.
* **High-Fidelity Offline PDF Export**: Embedded Chromium headless engine orchestrated via Rust DevTools Protocol ensures that the exported PDF mirrors the exact physical dimensions, typographic kerning, and pagination rules defined in the project.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Tauri][Tauri-badge]][Tauri-url]
* [![Rust][Rust-badge]][Rust-url]
* [![Next.js][Next-badge]][Next-url]
* [![React 19][React-badge]][React-url]
* [![TypeScript][TypeScript-badge]][TypeScript-url]
* [![SQLite][SQLite-badge]][SQLite-url]
* [![Tailwind CSS v4][Tailwind-badge]][Tailwind-url]
* [![Playwright][Playwright-badge]][Playwright-url]
* [![Vitest][Vitest-badge]][Vitest-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Local-First Philosophy

```
User Action ──► SQLite (WAL) ──► Local UI ──► Sync Queue (Optional) ──► Remote API
```

1. **Immediate Local Persistence**: All operations write to the local SQLite database first.
2. **Zero Network Latency**: Typing, autosave, chapter reordering, and exports execute with sub-millisecond local latency.
3. **Resilient Data Safety**: Every entity uses client-generated **UUIDv7** identifiers, ensuring conflict-free offline generation and timeline-consistent sorting.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- KEY FEATURES -->
## Key Features

### Editorial Writing & Dual-Mode Engine

* **Canonical JSON Document**: Text is represented as a versioned, structured JSON schema (`content_revision`), preventing fragile HTML rendering bugs.
* **Continuous Mode**: Adaptive single-column canvas designed for ergonomic drafting, respecting active dark and light themes.
* **Paged Mode**: Realistic simulation of physical book leaves with exact trim size (e.g., 14 × 21 cm, 6 × 9 in), accurate line-height ratios, typographic points (`pt`), visible margin boundaries, and smooth cross-page caret navigation.
* **Dynamic Page Estimator**: Real-time calculation of print page counts based on font metrics, margins, and content volume.

### Version Control & Track Changes

* **Automatic Version Snapshots**: Captures milestone revisions with word counts and timestamps.
* **Visual Text Diffing**: Dedicated versions screen (`/books/versions`) highlighting added, deleted, and preserved text segments.
* **Point-in-Time Restore**: One-click rollback to any historical milestone without data loss.

### Book Formatting & Front Matter

* **Standard Catalog Presets**: National and international trim sizes (14 × 21 cm Padrão Nacional, 16 × 23 cm, Pocket 10.5 × 17.5 cm, US Trade 6 × 9 in, US Digest 5.5 × 8.5 in).
* **Embedded Offline Typefaces**: EB Garamond, Merriweather, Inter, Libre Baskerville, Libre Caslon Text, and Crimson Pro bundled directly into application resources.
* **Comprehensive Front Matter**: Native support for half title, title page, copyright page (ISBN, CIP, cataloging data, credits), dedication, epigraph, and automated table of contents.
* **Structural Chapter Types**: Standard chapters, prologues, epilogues, and custom subdivisions with drag-and-drop reordering.

### High-Fidelity Exports

* **Print-Ready PDF**: Headless Chromium driven via Rust DevTools Protocol applies exact CSS `@page` declarations and embeds local font subsets offline.
* **Standard EPUB 3.0**: Fully validated e-book structure with semantic navigation and metadata.
* **Editable DOCX**: Microsoft Word compatible document generation for external editorial review.

### Deterministic Geometric Covers

* Procedural SVG cover art synthesized mathematically from the book's UUID.
* Custom cover image upload, crop, and file storage pipeline supporting PNG, JPEG, and WebP up to 25 MiB.

### SQLite Backup & Portability

* Single-click full database export (`.sqlite`) and atomic database restoration.
* Live SQLite diagnostics: active table row counts, storage utilization, and schema version.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- SYSTEM ARCHITECTURE -->
## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend: Next.js 16 + React 19                      │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │  Route Pages (<70 L)  │  │ Domain Hooks    │  │ UI Primitives    │  │
│  │  (Static App Router)  │  │ (useBooks, etc) │  │ (Tailwind v4)    │  │
│  └───────────┬───────────┘  └────────┬────────┘  └──────────────────┘  │
│              └───────────────────────┼─────────────────────────────────┘
│                                      ▼ IPC (Tauri v2 invoke)
├────────────────────────────────────────────────────────────────────────┤
│                     Native Core: Tauri v2 + Rust                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Tauri Commands (Thin input/output boundary)                      │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Application Services (Business Logic & Validation)               │  │
│  │ ├─ BookService        ├─ ChapterService    ├─ ExportService(PDF) │  │
│  │ ├─ VersionService     ├─ BackupService     ├─ FrontMatterService │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Repositories (Data Access Layer via SQLx)                        │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
├─────────────────────────────────────┼──────────────────────────────────┤
│                                     ▼                                  │
│                    SQLite Database (WAL Mode + UUIDv7)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Clean Architecture Boundaries

* **Frontend (`src/`)**: Pure UI rendering, client-side view state, and event routing. Strict rule: **Never access SQLite or filesystem APIs directly from React components**.
* **Native Backend (`src-tauri/`)**: All filesystem operations, SQLite persistence, cryptographic hashing, and Chromium automation execute in Rust.
* **Component Line Limit**: Strict maximum of **70 lines** per `.tsx` file, enforcing clean component separation and hook extraction.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Ensure you have the following installed on your development workstation:

* **Node.js**: `v22.x` or `v24.x` (LTS recommended)
* **npm**: `v10.x+`
* **Rust & Cargo**: Latest stable toolchain (`rustup update stable`)
* **Tauri v2 System Dependencies**:
  * **Linux (Debian/Ubuntu)**:

    ```bash
    sudo apt update
    sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
    ```

  * **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  * **Windows**: Microsoft Visual Studio C++ Build Tools & WebView2 Runtime

### Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rafaelpacinii/my-book-writer.git
   cd my-book-writer
   ```

2. **Install frontend dependencies**:

   ```bash
   npm ci
   ```

3. **Install and prepare Chromium for offline PDF export**:

   ```bash
   npm run pdf:install
   npm run pdf:prepare
   ```

### Running Locally

Launch the Tauri desktop application with Hot Module Replacement (HMR):

```bash
npm run tauri dev
```

When running from a WSL/Linux terminal in VS Code, this launches the Linux app
through WSLg, rather than a native Windows WebView2 app. If the window loses its
cursor, stops accepting clicks, or flickers, close that development session and try:

```bash
npm run tauri:dev:wsl
```

This opt-in command selects the GTK X11 backend and disables WebKitGTK's DMABUF
renderer for that session. It is a graphics troubleshooting option; restoring mouse
input must be checked in the actual WSLg window. See the
[Tauri Linux graphics guide](https://v2.tauri.app/develop/debug/linux-graphics/).
It does not change the default launch command or native Windows builds. To test
Windows WebView2 itself, run the project with Windows Node.js and Rust/MSVC from a
Windows terminal, using a separate Windows checkout and its own dependencies.

### Building for Production

Compile optimized native binaries and platform installers (DEB/AppImage on Linux, DMG on macOS, MSI/NSIS on Windows):

```bash
npm run tauri build
```

The resulting installers will be generated under `src-tauri/target/release/bundle/`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- AUTOMATED TESTING & QUALITY -->
## Automated Testing & Quality

My Book Writer employs a rigorous multi-tier testing and validation pipeline:

### 1. TypeScript & Lint

```bash
npx tsc --noEmit
npm run lint
```

### 2. Unit & Integration Tests (Vitest)

```bash
npm test
```

* Validates book pagination algorithms, front matter page sequences, keyboard shortcuts, chapter typing, and text diff calculations.

### 3. End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

* Exercises complete desktop flows from onboarding to chapter writing and export.

### 4. Rust Engine Checks & Tests

```bash
cd src-tauri
cargo fmt --check
cargo check
cargo test --lib
cargo test chromium_exports_real_pdf_offline --lib -- --ignored --nocapture
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- DESIGN SYSTEM -->
## Design System & Editorial Aesthetics

The application's visual system follows a **Calm Editorial Studio** philosophy:

* **Color Tokens**: Warm neutrals, sage accents, sand highlights, and subdued borders with strict WCAG contrast compliance.
* **Typography**:
  * **UI & Controls**: `Inter` (sans-serif) for high legibility in menus, toolbars, and dialogs.
  * **Manuscript & Reading**: `Merriweather` and curated literary serif presets for authentic book printing feel.
* **Theme Modes**: Full support for Light, Dark, and System preference with zero flickering during startup.
* **Prototype Vector Catalog**: Explore all 94 vector and PNG prototype screens under [`docs/prototipo-ui/`](docs/prototipo-ui/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GIT WORKFLOW -->
## Git Workflow & Conventions

This project strictly follows the **Atlassian Gitflow Workflow**:

* `main`: Production-ready release history.
* `develop`: Integration branch for ongoing engineering.
* `feature/*`: New functional capabilities branched from `develop`.
* `fix/*`: Bug fixes and UI consistency improvements branched from `develop`.
* `hotfix/*`: Urgent production fixes branched from `main`.

### Commit Style

Conventional Commits format:

* `feat: add dedicated versions screen with direct navigation`
* `fix: eliminate cover image flicker and add diagonal skeleton loaders`
* `refactor: split library components to conform to 70-line limit`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTACT & AUTHOR -->
## Contact & Author

**Rafael Pacini**  
GitHub: [@rafaelpacinii](https://github.com/rafaelpacinii)  
Project Link: [https://github.com/rafaelpacinii/my-book-writer](https://github.com/rafaelpacinii/my-book-writer)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/rafaelpacinii/my-book-writer.svg?style=for-the-badge
[contributors-url]: https://github.com/rafaelpacinii/my-book-writer/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/rafaelpacinii/my-book-writer.svg?style=for-the-badge
[forks-url]: https://github.com/rafaelpacinii/my-book-writer/network/members
[stars-shield]: https://img.shields.io/github/stars/rafaelpacinii/my-book-writer.svg?style=for-the-badge
[stars-url]: https://github.com/rafaelpacinii/my-book-writer/stargazers
[issues-shield]: https://img.shields.io/github/issues/rafaelpacinii/my-book-writer.svg?style=for-the-badge
[issues-url]: https://github.com/rafaelpacinii/my-book-writer/issues
[license-shield]: https://img.shields.io/github/license/rafaelpacinii/my-book-writer.svg?style=for-the-badge
[license-url]: https://github.com/rafaelpacinii/my-book-writer/blob/main/LICENSE
[product-screenshot]: docs/prototipo-ui/visao-geral.png

[Tauri-badge]: https://img.shields.io/badge/Tauri_v2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white
[Tauri-url]: https://v2.tauri.app/
[Rust-badge]: https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white
[Rust-url]: https://www.rust-lang.org/
[Next-badge]: https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React-badge]: https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript-badge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[SQLite-badge]: https://img.shields.io/badge/SQLite_WAL-07405E?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://www.sqlite.org/
[Tailwind-badge]: https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Playwright-badge]: https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white
[Playwright-url]: https://playwright.dev/
[Vitest-badge]: https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white
[Vitest-url]: https://vitest.dev/
