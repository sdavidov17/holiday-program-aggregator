# CI/CD Shift-Left Strategy

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) strategy for the Holiday Program Aggregator. We employ a "Shift Left" approach alongside a Stage-Gate model to ensure security and quality are verified early in the development lifecycle.

## Pipeline Overview

The pipeline enforces rigorous checks on every Pull Request (PR) before code can be merged to the `main` branch. This ensures that the `main` branch is always in a deployable state.

### Workflow Stages

1.  **Local Pre-commit (Husky)**:
    *   **Lint-Staged**: Runs `biome check` on changing files. Enforces quality before commit.
    *   **Commitlint**: Enforces semantic commit messages (e.g., `feat:`, `fix:`).
2.  **Commit & Push**: Developer pushes code to a feature branch.
3.  **Pull Request**: A PR is opened against `main`.
4.  **Automated Checks (Parallel)**:
    *   **Linting & Formatting**: Biome ensures code style and quality.
    *   **Type Checking**: TypeScript validation.
    *   **Unit Tests**: Jest tests for isolated logic.
    *   **Build Verification**: Runs `pnpm build` to ensure the application compiles successfully.
    *   **Security Audit**: `pnpm audit` checks for high-severity vulnerabilities in dependencies (Blocking).
    *   **E2E Tests**: Playwright tests run against a full instance of the app with a dedicated Postgres service.
4.  **Review**: Code review (including automated Claude AI review) must pass.
5.  **Merge**: Once all checks pass, code is merged to `main`.
6.  **Deployment**: Vercel automatically deploys `main` to Staging/Production (based on branch configuration).

## CI/CD Flow Diagram

```mermaid
graph TD
    A([Developer Push]) --> B[Pull Request]
    
    subgraph "CI Pipeline (GitHub Actions)"
        direction TB
        B --> C{Parallel Checks}
        C --> D[Lint & Format]
        C --> E[Type Check]
        C --> F[Unit Tests]
        C --> G[Build Check]
        C --> H[Security Audit]
        C --> I[E2E Tests (Playwright)]
        
        I -- Uses --> J[(Postgres Service)]
    end
    
    D & E & F & G & H & I --> K{All Pass?}
    K -- No --> L[Block Merge]
    K -- Yes --> M[Allow Merge]
    
    M --> N[Merge to Main]
    N -->|Auto Deploy| O([Staging / Beta])
    N -- Tag v* --> P([Production Release])
```

## Environment Strategy

*   **Preview**: Deployed automatically for every PR.
*   **Staging**: The `main` branch acts as Staging. It is always deployable and reflects the latest integrated state.
*   **Production**: Deployed via release tags (e.g., `v*`). This ensures you only promote thoroughly tested code from `main`.

## URL Examples (Free Vercel Subdomains)

Vercel generates free `.vercel.app` subdomains. You do **not** need to pay for these.

1.  **Production (Live)**:
    *   URL: `https://holiday-program-aggregator.vercel.app`
    *   Updates: Only when release tag (e.g., `v0.1`) is pushed.

2.  **Beta / Staging (`main`)**:
    *   URL: `https://holiday-program-aggregator.vercel.app` (or `https://holiday-program-aggregator-git-main-sdavidov17.vercel.app`)
    *   Updates: Automatically on every push to `main`.
    *   **Persistent**: The tip of `main` is your latest "Beta".

3.  **Ephemeral Preview (Pull Requests)**:
    *   URL: `https://holiday-program-aggregator-git-feature-login-sdavidov17.vercel.app`
    *   Updates: Created automatically for every PR.
    *   **Ephemeral**: Unique to that specific branch/PR. Perfect for isolation.
    *   URL: `https://holiday-program-aggregator-git-feature-login-sdavidov17.vercel.app`
    *   Updates: Created automatically for every PR.
    *   **Ephemeral**: Unique to that specific branch/PR. Perfect for isolation.
