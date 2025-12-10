# Prompt Builder

Prompt Builder is a powerful desktop application designed to help you craft, optimize, and manage AI prompts effortlessly. Inspired by tools like the Logitech Prompt Builder, this application provides a streamlined interface for interacting with Large Language Models, specifically tailored for **Google Gemini**.

## Features

- **Prompt Recipes**: Pre-defined templates to quickly generate common prompt types (Summarize, Rephrase, Email, etc.).
- **Customization**: Easily adjust the tone, length, and style of your prompts with a few clicks.
- **Gemini Integration**: Built to work natively with Google's Gemini AI models.
- **Desktop Experience**: Fast, responsive desktop application built with Electron.

## precise Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS (if applicable)
- **Backend/Shell**: Electron
- **Language**: TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd prompt_builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the application in development mode with hot-reloading:

```bash
npm run dev
```

This will launch both the Vite dev server and the Electron app window.

## Building the Application

There are two ways to build the application for distribution:

### method 1: Portable Executable (Recommended)

To create a portable folder containing the executable (uses `electron-packager`):

```bash
npm run pack
```
**Output**: `release-packager/prompt_builder-win32-x64/prompt_builder.exe`

### Method 2: Installer (NSIS)

To create a standard Windows installer (uses `electron-builder`):

```bash
npm run package
```
**Output**: `release/Prompt Builder Setup <version>.exe`

> **Note**: If you encounter network issues downloading build dependencies (like `winCodeSign`) with `electron-builder`, use Method 1.
