# Contributing to AssetFlow

Thank you for your interest in contributing to **AssetFlow**! This document provides guidelines for contributing code, styling conventions, testing practices, and our standard Git workflow.

---

## 🛠️ Tech Stack & Architecture

AssetFlow is built on the **PERN stack**:
- **Database**: PostgreSQL (managed via Drizzle ORM)
- **Backend**: Node.js & Express
- **Frontend**: React (Vite, React Router v6, Tailwind CSS v4, Zustand)
- **Comms & Alerts**: Twilio (WhatsApp/SMS), Nodemailer (SMTP), html5-qrcode (QR Code scanner), react-pdf (A4 PDF reports)

---

## 🌿 Git Workflow & Branches

1. **Fork the Repository** and clone your fork locally.
2. **Create a Feature Branch** from the main branch:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
3. **Write Meaningful Commits** following the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat(auth): add google sign-in option`
   - `fix(scanner): correct video aspect ratio on mobile`
   - `docs(readme): update build commands and env vars`
   - `style(components): unify primary solid buttons`
4. **Push and Create a Pull Request** targeting the main branch.

---

## 📝 Code Style & Guidelines

- **JavaScript / JSX**: Use clean, modern JavaScript. Keep functional React components clean, modular, and reusable.
- **CSS Variables**: Use the custom theme properties defined in [theme.css](file:///c:/Users/jagdi/Downloads/OdoFlagship/pern-template/client/src/app/styles/theme.css) rather than writing inline raw hex values where possible.
- **Tailwind Rules**: Use utility classes logically. For complex styles or global overrides, define a utility class in [index.css](file:///c:/Users/jagdi/Downloads/OdoFlagship/pern-template/client/src/index.css).
- **No Hardcoded Credentials**: Never commit `.env` or credentials. Use `process.env` (server) or `import.meta.env` (client) and document them in `.env.example`.

---

## 🧪 Testing and Verification

Before submitting a Pull Request, ensure that:
1. **The application builds successfully**:
   ```bash
   # In client/
   npm run build
   
   # In server/
   # Run local validation or lint if configured
   ```
2. **Local developer servers run cleanly**:
   ```bash
   npm run dev
   ```
3. Verify changes on multiple screen sizes to ensure responsive designs match the system theme.

---

## 📞 Reporting Issues & Vulnerabilities

If you identify a bug, feel free to open a detailed issue in our issue tracker. For security vulnerabilities, please refer to our [SECURITY.md](file:///c:/Users/jagdi/Downloads/OdoFlagship/pern-template/SECURITY.md) guidelines.
