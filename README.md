# Pteronautics

The home page of the Pteronautics family: free, open-source aerospace engineering that runs in the browser.

| Program | What it's for | Site |
| --- | --- | --- |
| **Pteronautics Atlas** | Learn how the physics works, one concept at a time, with a live visual for every concept | https://blazingdrako.github.io/pteronautics-atlas/ |
| **Pteronautics Works** | Design whole vehicles on the same validated solvers, coupled together, with requirements checked live | https://blazingdrako.github.io/pteronautics-works/ |
| **Pteronautics Loom** | Model the system in SysML: requirements, functions, logical and physical architecture, interfaces and verification, traced end to end | https://blazingdrako.github.io/pteronautics-loom/ |

This repository is only the umbrella site: https://blazingdrako.github.io/pteronautics/

## How the live figures work

GitHub Pages serves this site and the three programs from the same origin, side by side:

```
https://blazingdrako.github.io/pteronautics/          this site
https://blazingdrako.github.io/pteronautics-atlas/    Atlas
https://blazingdrako.github.io/pteronautics-works/    Works
https://blazingdrako.github.io/pteronautics-loom/     Loom
```

So the page imports the programs' own modules at run time, from `../pteronautics-atlas/` and `../pteronautics-works/`:

- **From Atlas:** the line-art preview of every tool (`js/previews.js`), the same drawings as the Atlas home page.
- **From Works:** Kestrel solved by the coupling graph and drawn in 3D, the slider demo that drives the real graph, and an mfoil airfoil solution run in a Web Worker.
- **From Loom:** the CubeSat power system sample, live and read-only (pan, zoom, select), in a frame: Loom's `embed.html` builds the sample and shows the view the tabs pick (the Systems V, a block diagram, an activity, equations, requirements, states). It is drawn by Loom with Loom's own styles, which is why it is a frame rather than an import, and it follows this page's light or dark theme.

Nothing is copied or screenshotted, so the page always shows the programs as they are. If either program cannot be reached, or a module it imports moves, those figures fall back to text and every link still works. If you rename or move these files in Atlas or Works, update `js/site.js`:

- Atlas: `js/previews.js` (export `PREVIEWS`)
- Loom: `embed.html` (and `src/embed.js`); the view names in `js/site.js` (`VIEWS` in the Loom section) are diagram names in Loom's CubeSat sample
- Works: `src/ui/dom.js`, `src/engine/graph.js`, `src/analyses/fixedWing.js`, `src/model/seeds.js`, `src/model/vehicle.js`, `src/ui/view3d.js`, `src/ui/planform.js`, `src/ui/graphView.js`, `src/ui/airfoilLab.js`, `src/workers/client.js`, `src/adapters/airfoil.js`

The tool names and one-line summaries of Atlas's tools are written into `js/site.js` (the `ATLAS_TOOLS` list), following the Atlas home page; update them there when Atlas gains a tool.

The design tokens and fonts are copied from the family's shared design system (`css/pteronautics.css`, from Works, whose tokens come from Atlas), and the preview styles from Atlas (`css/previews.css`), so the site keeps its look on its own.

## Run it locally

Clone the three repositories side by side, then serve them together:

```bash
git clone https://github.com/BlazingDrako/pteronautics
```

```bash
git clone https://github.com/BlazingDrako/pteronautics-atlas
```

```bash
git clone https://github.com/BlazingDrako/pteronautics-works
```

```bash
git clone https://github.com/BlazingDrako/pteronautics-loom
```

```bash
python3 pteronautics/serve.py
```

It opens http://localhost:8780/pteronautics/ and serves only those four folders, only to this computer (folders named `Atlas`, `Works` and `Loom` work too). Without the programs beside it, the page still works and shows its fallbacks.

## Publishing

GitHub Pages serves the `main` branch as it is (Settings → Pages → Deploy from a branch: `main`, root). `.nojekyll` makes Pages serve the files without processing them.

## License

Copyright (C) 2026 Andrew Aguiar. Free software under the GNU General Public License v3.0 (see `LICENSE` and `COPYRIGHT`). The bundled fonts are under the SIL Open Font License (see `assets/fonts/`).
