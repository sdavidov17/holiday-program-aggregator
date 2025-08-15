# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.1: Initial Project & CI/CD Setup

*As a development team, I want a configured project foundation with automated deployment, so that we can build and deploy features efficiently and reliably.*

### Acceptance Criteria
1. A Monorepo is initialized.
2. The web app is configured with Next.js and TypeScript.
3. The backend is configured for serverless functions.
4. A basic CI/CD pipeline is established.
5. A health-check endpoint on the backend returns a `200 OK`.

### Development Tasks
- [x] Initialize a new Turborepo monorepo.
- [x] Use the `create-t3-app` initializer to set up the Next.js web application within the monorepo's `apps/web` directory, including Prisma, tRPC, and NextAuth.js.
- [x] Configure the project for Vercel deployment, ensuring the Git repository is linked to a Vercel project.
- [x] Create a simple `healthz` tRPC procedure in the backend API package.
- [x] Implement the `healthz` procedure to return a status string (e.g., "ok").
- [x] Verify that the health-check endpoint is accessible and returns a `200 OK` status after a successful Vercel deployment.
- [x] Push the complete initial project structure to the remote Git repository.
