# Contributing to Mataram Dev Website

Thank you for your interest in contributing to the Mataram Dev community website. All contributions, including bug reports, feature requests, documentation improvements, and code changes, are welcome.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this standard. Please report unacceptable behavior to the maintainers.

---

## How to Contribute

1. **Fork** the repository.
2. **Clone** your fork locally.

   ```bash
   git clone https://github.com/your-username/mataramdev-website.git
   cd mataramdev-website
   ```

3. **Create a branch** from `main` for your change (see [Branch Naming](#branch-naming)).
4. **Make your changes** and test them locally.
5. **Push** your branch to your fork.
6. **Open a Pull Request** against `main` on the upstream repository.

---

## Development Setup

No build tools or package manager are required. The project is plain HTML, CSS, and JavaScript.

**Run a local server:**

```bash
python -m http.server 8000
# or
python312 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

**Environment variables:**

Copy `.env.example` to `.env` and fill in your Supabase credentials.

```bash
cp .env.example .env
```

---

## Branch Naming

Use the following prefixes:

| Prefix      | Purpose                              |
|-------------|--------------------------------------|
| `feat/`     | New features                         |
| `fix/`      | Bug fixes                            |
| `docs/`     | Documentation changes only           |
| `style/`    | CSS or formatting changes            |
| `refactor/` | Code refactoring without behavior change |
| `chore/`    | Maintenance tasks                    |

Example: `feat/add-dark-mode-toggle`, `fix/nav-layout-shift`

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(<scope>): <short description>

[optional body]
```

Examples:

```
feat(nav): add language toggle button
fix(css): correct nav layout shift on language change
docs(readme): update environment variable table
```

- Use the imperative mood in the short description ("add", not "added" or "adds").
- Keep the first line under 72 characters.
- Reference related issues with `Closes #<issue-number>` in the body when applicable.

---

## Pull Request Guidelines

- Keep PRs focused on a single concern. Large, unrelated changes are harder to review.
- Provide a clear description of what the PR does and why.
- Reference any related issues.
- Ensure your branch is up to date with `main` before opening the PR.
- Screenshots or recordings are appreciated for visual changes.

---

## Reporting Bugs

Open an issue using the **Bug Report** template and include:

- A clear and descriptive title.
- Steps to reproduce the behavior.
- Expected vs. actual behavior.
- Browser and OS information.
- Screenshots if applicable.

---

## Suggesting Features

Open an issue using the **Feature Request** template and include:

- A clear description of the proposed feature.
- The problem it solves or the value it adds.
- Any relevant examples or references.

---

Thank you for contributing and helping improve the Mataram Dev community.
