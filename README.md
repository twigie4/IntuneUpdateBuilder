# Intune Update Builder

Intune Update Builder is a Next.js (App Router) + TypeScript web app that generates PowerShell scripts for packaging an .MSU Windows Update as a Win32 app in Intune.

## Features

- Single input that accepts a KB number, MSU filename, path, or URL.
- Client-side generation of Install.ps1, Uninstall.ps1, Detect.ps1, and Requirement.ps1.
- Optional requirement rules for OS build, architecture, client-only gating, and KB precheck.
- Copy buttons, tabbed script viewer, and one-click ZIP download via JSZip.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm run test
```

## Deploy

1. Build the app with `npm run build`.
2. Start the production server with `npm run start`.
3. Configure your hosting platform to run the Node.js server.
