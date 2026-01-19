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

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Use the default Next.js build settings.

