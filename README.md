# Focus App 🌊

A modern, highly-gamified, anti-procrastination productivity application designed to enforce a deep "flow state" and block distracting apps. Built with Electron, React, and Firebase, featuring AI-powered verification quizzes via the Gemini API.

## ⚠️ Current Status: In Development
**Focus App is currently in active development and not yet available for direct download.**
We are polishing the UI (featuring "Pro Max" Glassmorphism aesthetics), implementing an unbreakable Hardcore Mode, Pomodoro integrations, and preparing official Linux (`.deb`, `AppImage`) and Windows packages.

A beautiful landing page with official installers is coming soon!

---

## 🛠️ Testing the Application (Windows / Linux)
If you want to compile and test the app yourself, follow these steps.

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.
- Git installed.

### 1. Clone the repository
```bash
git clone https://github.com/cavalinho-xdd/focus.git
cd focus
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the Development Server
To start the Vite frontend and Electron backend simultaneously, run:
```bash
npm run start:dev
```

### 4. Build for Windows (.exe)
To compile a standalone Windows installer:
```bash
npm run package:win
```
The resulting `.exe` installer will be located in the `release/` folder.

### 5. Build for Linux (.deb / AppImage)
To compile for Linux:
```bash
npm run package:linux
```
The resulting packages will be located in the `release/` folder.