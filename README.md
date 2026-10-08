# PromptVault: Private Organization Prompt Hub & Engineering Lab

PromptVault is a private, self-hosted prompt management platform and engineering community hub for enterprise teams. It centralizes, tests, organizes, and shares battle-tested prompts for ChatGPT, Claude, and Gemini across departments with custom corporate branding, zero-trust security rules, and an AI Playground powered by **Gemini 3.1 Pro Preview with HIGH Thinking Mode**.

---

## Key Features

1. **Enterprise Prompt Library & Hub**:
   - Filter by AI Tools (ChatGPT, Claude, Gemini, Midjourney, etc.), Departments, Tags, Staff Picks, and Verified Standards.
   - 1-Click Interactive Variable Fill-in Form (`{{variable}}` substitution) and live compiled copying.
   - Star, copy tracking, and team ratings.

2. **Gemini 3.1 Pro High Thinking AI Lab**:
   - **Playground & Test Bench**: Benchmark prompt performance with multi-variable substitution using `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH`.
   - **Deep Thinking Prompt Architect**: Analyze raw draft prompts for edge cases, ambiguity, and rewrite into clean structured templates.
   - **Prompt Injection & Leakage Audit**: Scan prompt templates for security vulnerabilities.

3. **White-Label Corporate Branding**:
   - Organization name, tagline, company logo, and custom color themes (Tech Indigo, Forest Emerald, Quantum Violet, Deep Sky, Solar Amber, Crimson Rose).
   - Domain-restricted Single Sign-On (enforces `@yourcompany.com`).

4. **Multi-Role User Profiles & Audit Log**:
   - Roles: `admin`, `contributor`, `member`.
   - User preferences: Dark/Light/System theme mode, default AI tool, notification settings.
   - Immutable activity audit trail tracking creations, updates, and benchmarks.

5. **Self-Hosting & Docker Support**:
   - Ready-to-run `Dockerfile` and `docker-compose.yml`.
   - Production Express + Vite server with server-side Gemini SDK integration.

---

## Getting Started

### Local Development
```bash
npm install
npm run dev
```

### Run Unit & Security Tests
```bash
npm run test
```

### Docker Deployment
```bash
docker compose up --build -d
```
