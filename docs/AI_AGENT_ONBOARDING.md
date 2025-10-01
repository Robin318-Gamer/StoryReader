# AI Agent Onboarding Checklist

Use this checklist when starting development on the StoryReader project.

---

## 📚 Step 1: Read Required Documentation

Review these documents in order before starting:

- [ ] `README.md` - Project overview and quick start
- [ ] `docs/APPLICATION_DESIGN.md` - Architecture, components, data flow
- [ ] `docs/DEVELOPMENT_GUIDE.md` - Setup instructions and workflows
- [ ] `docs/API.md` - Backend endpoint specifications
- [ ] `docs/TESTING_STRATEGY.md` - TDD approach and requirements
- [ ] `docs/PROGRESS.md` - Current status and next tasks
- [ ] `.github/copilot-instructions.md` - React development standards

---

## 🎯 Step 2: Understand the Context

After reading the documentation, verify you understand:

- [ ] The overall architecture (React + TypeScript + Supabase + Google TTS)
- [ ] The tech stack and why each technology was chosen
- [ ] The data flow from user input to audio playback
- [ ] The TDD approach and testing requirements
- [ ] The current development phase and next tasks
- [ ] The deployment strategy (Vercel + GitHub Actions)

---

## 🔧 Step 3: Environment Setup

If starting fresh development:

- [ ] Check Node.js version (18+)
- [ ] Review `.env.example` for required environment variables
- [ ] Understand Supabase configuration requirements
- [ ] Understand Google Cloud TTS API setup
- [ ] Know where to find API keys (not in code!)

---

## 📋 Step 4: Development Workflow

Before writing code:

- [ ] Identify the current task from `docs/PROGRESS.md`
- [ ] Understand acceptance criteria for the task
- [ ] Write tests first (TDD approach)
- [ ] Implement minimal code to pass tests
- [ ] Refactor while keeping tests green
- [ ] Update `docs/PROGRESS.md` when task is complete
- [ ] Update `CHANGELOG.md` for significant changes

---

## ✅ Step 5: Code Quality Checks

Before committing:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Test coverage meets requirements (>80%)
- [ ] Code follows React best practices (see copilot-instructions.md)
- [ ] Accessibility standards met (ARIA, keyboard nav)

---

## 🚀 Step 6: Ready to Code!

You're now ready to start development. Remember:

- Follow TDD: Test → Code → Refactor
- Keep commits small and focused
- Write clear commit messages
- Update documentation as you go
- Ask questions if requirements are unclear

---

## 📞 Need Help?

If you encounter unclear requirements or blockers:

1. Check if it's documented in the existing files
2. Review similar patterns in the codebase
3. Ask the user for clarification with Yes/No questions
4. Provide suggestions based on best practices

---

_Last updated: 2025-10-01_
