# BillPro - Smart Billing Management System

**Version:** 1.0.0  
**Built with:** React 18, Tailwind CSS, Chart.js

## Quick Start

### Option 1 - Use the ready HTML file
1. Open `index.html` in any modern browser.
2. The app runs directly in the browser with CDN-hosted dependencies.

### Option 2 - Work from the source files
Requires Node.js 18+.

```bash
npm install react react-dom
```

`src/` contains JSX source/reference files and is not directly runnable on its own without a build step or JSX transpilation. The browser-ready entrypoint in this project is `index.html`.

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `raj@billpro.com` | `super123` |
| Admin | `admin@techsoft.com` | `admin123` |
| Staff | `ravi@techsoft.com` | `user123` |

New accounts are created by Admin or Super Admin users only.

## Project Structure

```text
billing-app/
|-- index.html                  <- Main browser entrypoint
|-- README.md
`-- src/
    |-- App.js                  <- Root app/state source (JSX)
    |-- components/
    |-- data/
    |-- pages/
    `-- utils/
```

## Key Features

- Multi-business billing with Super Admin, Admin, and Staff roles
- Invoice creation, payment tracking, and overdue management
- Customer management with billing summaries
- Product and service catalog
- Reports, charts, and notifications
- PDF invoice generation and reminder helpers

## Notes

- App data is currently in-memory only. Refreshing the page resets it to the bundled sample data.
- `index.html` uses CDN-hosted React, Tailwind, Chart.js, jsPDF, and Babel to run as a standalone file.
- The `src/` directory is useful as source/reference code, but it is not wired to a bundler in this repo.
