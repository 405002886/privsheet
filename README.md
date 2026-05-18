# PrivSheet - Browser-Only Excel Data Processing Tool

> All data processing happens locally in your browser. No uploads, no registration, no internet required.

Live at: [https://privsheet.com](https://privsheet.com)

## The Story Behind PrivSheet

This project started with my wife. She had to process large volumes of Excel files at work but wasn't familiar with Excel's complex features. At first, I built just a few simple but essential tools to ease her workload. Then it hit me — there must be many people just like her: intimidated by Excel's steep learning curve, just wanting to get their data tasks done quickly. So PrivSheet grew into a full-featured, easy-to-use tool built specifically for people who'd rather not learn the intricacies of Excel.

## Features

| Category | Features |
|----------|----------|
| **Data Cleaning** | Remove empty rows/columns, trim spaces, remove special characters, normalize date formats, round numbers, full-width/half-width conversion |
| **Sensitive Data Masking** | ID cards (30+ country formats), phone numbers, emails, names, custom masking (quick mask + regex mask) |
| **Split & Merge** | Split by delimiter, split by fixed width, merge columns, transpose rows & columns |
| **Dedup & Sort** | Full-row dedup, key-column dedup, ascending/descending sort, random shuffle |
| **Format Conversion** | Excel → CSV / JSON / SQL INSERT / SQL IN |
| **Batch Extraction** | Column to string, regex extraction |
| **Statistics & Calculation** | Sum, count, average, max/min, batch arithmetic, grouped summary |
| **Text Processing** | Text replacement, letter mapping, case conversion, capitalize first letter |
| **Multi-File Operations** | Append rows, horizontal concatenation |
| **VLOOKUP Matching** | Exact match, fuzzy match, custom fill for unmatched rows |
| **Payslip Splitting** | Split by name into payslips with headers, export to Excel / PDF |
| **Custom Pipeline** | Combine multiple operations into a sequential batch, with step management and live preview |
| **Smart Intent Input** | Natural language input auto-detects operation intent, multiple intents automatically enter pipeline mode |

## Tech Stack

- **Vue 3** + Composition API (`<script setup>`)
- **Vite 5** build tool
- **Pinia** state management
- **Vue Router 4** routing
- **Vue I18n 9** internationalization (Chinese / English)
- **SheetJS (xlsx)** Excel parsing
- **ExcelJS** high-fidelity styled Excel export
- **pdfmake** PDF generation
- **VitePWA** offline support

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (default http://localhost:3000)
npm run dev

# Build for Chinese
npm run build:zh

# Build for English
npm run build:en

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.js                 # App entry
├── App.vue                 # Root component
├── assets/                 # Static assets
├── config/                 # Config (error codes, ID card country configs)
├── i18n/                   # i18n setup
├── locales/                # Chinese & English translation files
├── router/                 # Route definitions
├── pages/                  # Page components
│   ├── HomePage.vue        # Home (task cards + intent input)
│   ├── TaskPage.vue        # Task execution (4-step wizard)
│   └── HelpPage.vue        # Help docs
├── components/             # Components
│   ├── common/             # Shared (upload, preview, loading, toast, network monitor)
│   ├── intent/             # Intent input
│   ├── pipeline/           # Pipeline editor
│   ├── merge/              # Multi-file merge wizard
│   └── lookup/             # VLOOKUP wizard
├── stores/                 # Pinia stores
│   ├── fileStore.js        # File data, multi-file, VLOOKUP, intent state
│   ├── pipelineStore.js    # Pipeline step state
│   └── settingsStore.js    # Theme, language, engine, file size limits
├── services/               # Business services
│   ├── intent/             # Intent parsing engine (rule-based)
│   ├── pipeline/           # Pipeline execution engine
│   └── toastService.js     # Toast notification service
└── utils/                  # Utilities
    ├── parser/             # Excel/CSV file parsing
    ├── operations/         # 43 atomic operation modules + registry
    └── export/             # Excel/PDF export
```

## Data Security

- 100% browser-local processing — no data upload capability
- Built-in network activity monitor (NetworkMonitor)
- No account registration needed; works offline
- File size limits: Desktop 100MB / Mobile 50MB

## Code Standards

```bash
# ESLint check & auto-fix
npm run lint

# Prettier formatting
npm run format
```

The project uses Husky + Commitlint for conventional commit messages.

## License

Private — All rights reserved
