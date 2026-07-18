# Telescope - AI Research Synthesis Tool

A modern Next.js 14 application for AI-powered research synthesis and analysis.

## Project Overview

Telescope is designed to help researchers synthesize and analyze multiple research documents using advanced AI capabilities. The application features:

- **Upload**: Upload and manage research documents
- **Thinking**: AI processes and analyzes the uploaded research
- **Report**: Generates comprehensive synthesis reports with insights

## Tech Stack

- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark mode
- **UI Components**: Lucide React icons
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Fonts**: Inter (sans) and JetBrains Mono (mono)

## Project Structure

```
telescope/
├── app/                      # Next.js app directory
│   ├── upload/              # Upload page
│   ├── thinking/            # AI processing page
│   ├── report/              # Report generation page
│   ├── layout.tsx           # Root layout with navbar
│   ├── page.tsx             # Home page (redirects to /upload)
│   └── globals.css          # Global styles and Tailwind setup
├── components/
│   └── report/              # Report-specific components
│       └── header.tsx       # Report header component
├── lib/                     # Utility functions
│   └── cn.ts               # Tailwind class utility
├── types/                   # TypeScript type definitions
│   └── research.ts         # Research-related types
├── public/
│   └── data/               # Static data files
├── package.json
├── tsconfig.json
├── tailwind.config.ts      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── next.config.js          # Next.js configuration
└── .eslintrc.json          # ESLint configuration
```

## Color Scheme (Dark Mode)

- **Background**: #0A0A0A
- **Surface**: #141414
- **Surface Raised**: #1A1A1A
- **Border**: #2A2A2A
- **Text Primary**: #FAFAFA
- **Text Secondary**: #A0A0A0
- **Text Muted**: #6A6A6A
- **Accent**: #6C5CE7
- **Accent Hover**: #7C6CF7
- **Success**: #00C853
- **Warning**: #FFD600
- **Error**: #FF3D00

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Development

The project uses:
- App Router for file-based routing
- TypeScript for type safety
- Tailwind CSS for styling with custom configuration
- Dark mode by default with custom color palette

## Available Routes

- `/` - Redirects to `/upload`
- `/upload` - Upload research documents
- `/thinking` - AI processing view
- `/report` - Synthesis report view

## Component Structure

### Layout Components
- **RootLayout** (`app/layout.tsx`) - Main layout with navigation bar featuring Telescope logo and branding

### Page Components
- **UploadPage** (`app/upload/page.tsx`)
- **ThinkingPage** (`app/thinking/page.tsx`)
- **ReportPage** (`app/report/page.tsx`)

### Report Components
- **ReportHeader** (`components/report/header.tsx`) - Report header with title and description

## Utilities

- **cn()** (`lib/cn.ts`) - Class name merge utility combining clsx and tailwind-merge

## Types

- **ResearchDocument** - Document upload interface
- **SynthesisResult** - Result of AI synthesis
- **ThinkingState** - AI processing state

## Notes

- Dark mode is enabled by default
- The navbar uses a semi-transparent surface with backdrop blur
- All text is styled according to the custom dark mode palette
- The Telescope logo uses a custom SVG icon with gradient background
