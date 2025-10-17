# Contributing to Bready 🍞

Thank you for your interest in contributing to Bready! We welcome contributions from the community and are grateful for your help in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Message Convention](#commit-message-convention)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, professional, and constructive in all interactions.

---

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, yarn, pnpm, or bun package manager
- Basic knowledge of Next.js, React, and TypeScript
- A [Clerk Account](https://clerk.com) (free tier available)
- Git installed and configured

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bready.git
   cd bready
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/milleely/bready.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then configure your `.env` with your Clerk API keys.

6. **Set up the database:**
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/milleely/bready/issues/new) with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node version)

### Suggesting Features

Have an idea? We'd love to hear it! [Open a feature request](https://github.com/milleely/bready/issues/new) with:
- A clear description of the feature
- The problem it solves
- Any alternative solutions you've considered
- Mockups or examples (if applicable)

### Code Contributions

1. **Check existing issues** to avoid duplicate work
2. **Comment on the issue** you'd like to work on
3. **Wait for assignment** before starting work
4. **Create a feature branch** and start coding!

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` for new features (e.g., `feature/csv-export`)
- `fix/` for bug fixes (e.g., `fix/budget-calculation`)
- `docs/` for documentation (e.g., `docs/update-readme`)
- `refactor/` for code refactoring (e.g., `refactor/expense-service`)

### 2. Make Your Changes

- Write clean, readable code
- Follow our [style guidelines](#style-guidelines)
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run the dev server and test manually
npm run dev

# Run type checking
npx tsc --noEmit

# Test the build
npm run build
```

### 4. Commit Your Changes

Follow our [commit message convention](#commit-message-convention):

```bash
git add .
git commit -m "feat: add CSV export functionality"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub!

---

## Pull Request Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] All tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is updated
- [ ] Commit messages follow our convention
- [ ] No merge conflicts with `main`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List key changes
- Bullet points work well

## Screenshots (if applicable)
![description](url)

## Testing Done
Describe how you tested your changes

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks** will run (linting, type checking, build)
2. **Maintainers will review** your code
3. **Address feedback** by pushing new commits to your branch
4. Once approved, a maintainer will **merge your PR**

---

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use strict mode

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

```typescript
interface MyComponentProps {
  title: string
  onSubmit: () => void
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  // Component logic
}
```

### File Organization

- Place components in `components/` directory
- Place API routes in `app/api/` directory
- Place utilities in `lib/` directory
- Group related files together

### Code Formatting

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Max line length: 100 characters

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```bash
# New feature
git commit -m "feat: add CSV export functionality"

# Bug fix
git commit -m "fix: correct budget calculation for shared expenses"

# Documentation
git commit -m "docs: update installation instructions"

# Breaking change
git commit -m "feat!: redesign API response format

BREAKING CHANGE: API now returns data in different structure"
```

---

## Database Changes

If your contribution involves database schema changes:

1. **Create a migration:**
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

2. **Update `prisma/seed.ts`** if needed
3. **Document the changes** in your PR description
4. **Test the migration** on a fresh database

---

## Need Help?

- **Questions?** [Open a discussion](https://github.com/milleely/bready/discussions)
- **Stuck?** Comment on the issue you're working on
- **General help:** Check our [documentation](./README.md)

---

## Recognition

Contributors will be recognized in:
- Our README contributors section
- Release notes for significant contributions
- Special thanks in the project

---

**Thank you for contributing to Bready! Your help makes this project better for everyone.** 🍞✨
