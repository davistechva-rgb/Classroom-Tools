# Classroom Tools

Free, kid-friendly classroom tools that run in any browser, including smartboards and Chromebooks. Open the launcher, pick a tool, and go. Everything works offline after the first visit.

## Setup
All 50 tools are included. Drag this whole folder onto Netlify (Add new site > Deploy manually). No build step, no accounts, no API keys.

## Good to know
- Each tool saves its settings and lists on that device only (browser storage). Nothing is sent anywhere.
- Every tool has a full screen button in the top right.
- To add a tool: build it in apps/<name>/index.html using shared/kit.css and shared/kit.js, then mark it ready in the CATS list in index.html.
- After changing files, bump VERSION in sw.js so devices pick up the update.

## Project files
- index.html: launcher
- apps/: one folder per tool
- shared/: styles and helpers used by every tool
- sw.js, manifest.webmanifest, icon.svg: offline and install support

## License
MIT. See LICENSE. The Davis Tech Support name and logo are covered by TRADEMARKS.md.

## Contact
Davis Tech Support: davis-tech-support.com, davis.tech.va@gmail.com, 434-294-4456
