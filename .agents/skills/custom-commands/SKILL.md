---
name: custom-commands
description: Custom commands and templates for common developer workflows (refactor, test, explain, doc, review, fix-bugs).
---

# Custom Commands & Prompt Templates

This skill defines standard procedures and templates for recurring coding tasks in this project.

## Available Workflows

### 1. Refactor Code (`/refactor` or "refactor this code")
- Focus on clean code principles, DRY, readability, and performance.
- Maintain existing functionality while improving structure.

### 2. Unit Testing (`/test` or "generate unit tests")
- Generate comprehensive unit tests covering:
  - Happy path
  - Edge cases
  - Error scenarios & boundaries

### 3. Explain Code (`/explain` or "explain this code")
- Provide a step-by-step breakdown of how the selected logic works, including key data flow and dependencies.

### 4. Code Documentation (`/doc` or "document this code")
- Add concise, clear docstrings and inline comments explaining complex logic, parameters, and return values.

### 5. Security & Quality Review (`/review` or "review this code")
- Inspect code for potential bugs, security vulnerabilities (OWASP), memory leaks, and performance bottlenecks.

### 6. Bug Fixing (`/fix-bugs` or "fix bugs in this code")
- Analyze error tracebacks/logs, pinpoint root causes, and provide corrected, production-ready code without masking symptoms.
