# Classroom Tools for Windows

The desktop app wraps the same web pages from the main folder in a Windows app (Electron).

## For teachers
- `Classroom-Tools-Setup-<version>.exe` installs for the current user only. No admin password is needed. It adds Start menu and desktop shortcuts.
- `Classroom-Tools-Portable-<version>.exe` runs without installing, for example from a USB drive.
- Everything works offline.
- Saved work is written automatically to **Documents\Classroom Tools\classroom-data.json**. A dated copy goes into `Daily backups` (the last 30 days are kept).
- After a reinstall, the app reads that file back in on first launch. Uninstalling never deletes it.
- **Updates:** the app checks for a new version a few seconds after it opens and every 6 hours. When one is found, it asks **Update now / Later / Skip this version**. Update now downloads the installer, checks it isn't damaged, then closes, updates and reopens the app. Saved work is kept. Help → Check for updates looks right away. The portable version opens the download instead.

## Releasing an update
1. Make your changes to the tools (the main folder).
2. In `desktop/package.json`, raise `"version"` (for example 1.39.0 → 1.40.0).
3. Write what's new in `desktop/notes.txt`. Teachers see this in the update prompt.
4. Commit and push, then publish one of two ways:
   - **GitHub (easiest, builds on Windows in the cloud):** `git tag desktop-v1.40.0 && git push origin desktop-v1.40.0`
   - **From your computer:** `cd desktop && npm install && npm run release`. This needs the GitHub CLI (`gh`) signed in.

Either way, a GitHub release named `desktop-v<version>` is published with the installer, the portable app and `latest.json`. Installed apps read `latest.json` from the newest release, so keep desktop releases as the repo's "latest" release.

`npm run dist` builds without publishing. `npm start` tries the app on this computer.

The .exe files are not code-signed, so Windows SmartScreen shows "Windows protected your PC" when someone downloads the installer. Automatic updates are not affected, because downloads made inside the app don't get that warning.
