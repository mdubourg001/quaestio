# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based web application using React integration and Tailwind CSS v4. The project uses pnpm as the package manager and follows a minimal Astro starter structure.

## Key Technologies

- **Framework**: Astro 5.x with React integration
- **Styling**: Tailwind CSS v4 (using the new Vite plugin approach)
- **Package Manager**: pnpm
- **TypeScript**: Configured with strict Astro TypeScript settings
- **Build Tool**: Vite (integrated with Astro)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (localhost:4321)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run Astro CLI commands
pnpm astro [command]
```

## Project Structure

```
/
├── public/          # Static assets (images, favicon, etc.)
├── src/
│   ├── pages/       # File-based routing (.astro or .md files)
│   │   └── index.astro
│   └── styles/
│       └── global.css  # Tailwind CSS imports
├── astro.config.mjs # Astro configuration with React and Tailwind
└── tsconfig.json    # TypeScript config extending Astro strict preset
```

## Architecture Notes

- **Routing**: File-based routing through `src/pages/` directory
- **Components**: Place Astro/React components in `src/components/` (when created)
- **Styling**: Tailwind CSS v4 integrated via Vite plugin, imported in `src/styles/global.css`
- **React Integration**: Configured with `react-jsx` and React 19.x
- **Static Assets**: Place in `public/` directory for direct access

## Configuration Details

- **Astro Config**: Uses React integration and Tailwind via Vite plugin
- **TypeScript**: Extends `astro/tsconfigs/strict` with React JSX settings
- **Tailwind**: Version 4.x using the new `@tailwindcss/vite` plugin approach
- **VSCode**: Configured with Astro extension recommendation

## Development Notes

- The project uses React 19.x with the new JSX transform
- Tailwind CSS v4 syntax and features are available
- Astro's component islands architecture allows for optimal client-side hydration
- Static site generation is the default build target
