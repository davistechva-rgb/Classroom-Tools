# Classroom Tools for Windows

The desktop app wraps the same web pages from the main folder in a Windows app (Electron).

**For teachers**
- `Classroom-Tools-Setup-<version>.exe` installs for the current user only. No admin password is needed. It adds Start menu and desktop shortcuts and shows up in Settings → Apps.
- `Classroom-Tools-Portable-<version>.exe` runs without installing, for example from a USB drive.
- Everything works offline, and the font is included.
- Saved work is written automatically to **Documents\Classroom Tools\classroom-data.json** every few seconds. A dated copy goes into `Daily backups` (the last 30 days are kept).
- After a reinstall or a new computer, the app reads that file back in on first launch. To move to a new PC, copy the `Documents\Classroom Tools` folder over.
- Uninstalling never deletes the saved files.

**To build** (Linux or macOS, Node 18+):
```
cd desktop
npm install
npm run dist        # → dist/Classroom-Tools-Setup-<version>.exe and dist/Classroom-Tools-Portable-<version>.exe
npm start           # try the app on this computer
```
Bump `version` in `package.json` before each release.

The .exe files are not code-signed, so Windows SmartScreen shows "Windows protected your PC". Teachers click **More info → Run anyway**. A code-signing certificate removes that warning.
