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
    N --> O[Vercel Deployment]
    O --> P([Live Preview/Staging])
```

## Environment Strategy

*   **Preview**: Deployed for every PR (Ephemeral).
*   **Staging/Production**: Deployed from `main`. We recommend using `main` as Staging and a stable release tag or `production` branch for Live users.
