# Classroom Tools

Free, kid-friendly classroom tools that run in any browser, including smartboards and Chromebooks. Open the launcher, pick a tool, and go. Everything works offline after the first visit.

## Setup
All 50 tools are included. Drag this whole folder onto Netlify (Add new site > Deploy manually). No build step, no accounts, no API keys.

## Your logo
Save your logo as logo.png (a PNG with a transparent background works best, about 300 px wide). It shows at the bottom of every page. Until that file exists, the pages show "Davis Tech Support" as text.

## Good to know
- Each tool saves its settings and lists on that device only (browser storage). Nothing is sent anywhere.
- Every tool has a full screen button in the top right. Full screen hides the setup panels and resizes the tool to fit the screen with no scrolling.
- To add a tool: make a new <name>.html file that uses kit.css and kit.js, then add it to the CATS list in index.html.
- After changing files, bump VERSION in sw.js so devices pick up the update.

## Project files
Everything is in one folder, so it uploads to GitHub in one step.
- index.html: the home screen
- One .html file per tool (50 total)
- kit.css, kit.js, quiz.js, logo.png: shared styles, helpers, and logo used by every tool
- sw.js, manifest.webmanifest, icon.svg: offline and install support

## Upload to GitHub
1. Open your repository on github.com and click Add file, then Upload files.
2. Click "choose your files", open this folder, press Ctrl+A (Cmd+A on a Mac) to select all 61 files, and click Open.
3. Click Commit changes.

## License
MIT. See LICENSE. The Davis Tech Support name and logo are covered by TRADEMARKS.md.

## Contact
Davis Tech Support: davis-tech-support.com, davis.tech.va@gmail.com, 434-294-4456
