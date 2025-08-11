# Fullstack Architecture Document: Holiday Program Aggregator

### **Introduction**

This document outlines the complete fullstack architecture for the Holiday Program Aggregator, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

* **Starter Template or Existing Project**
    * **Recommendation:** This project will be initialized using the **"T3 Stack"**.
    * **Rationale:** This starter provides a production-ready, scalable, and type-safe foundation that directly aligns with our selected technologies (Next.js, TypeScript, PostgreSQL, Tailwind CSS). Its inclusion of tRPC and Prisma will significantly improve developer experience and code quality, while the pre-configured NextAuth.js will accelerate the implementation of our required social logins.

### **High Level Architecture**

* **Technical Summary:** The architecture will be a modern, full-stack, serverless web application built on the T3 Stack. It leverages Next.js for the frontend and tRPC for a type-safe API layer, housed within a Turborepo monorepo. The system will be deployed on Vercel for seamless integration and scalability, with a PostgreSQL database managed by a service like Supabase or Neon.
* **Platform and Infrastructure Choice:**
    * **Platform:** **Vercel**.
    * **Key Services:** Vercel Serverless Functions, Vercel Edge Network, and a managed PostgreSQL provider (e.g., Supabase, Neon).
    * **Regions:** Database hosted in **ap-southeast-2 (Sydney)**.
* **Repository Structure:**
    * **Structure:** **Monorepo**.
    * **Tool:** **Turborepo**.
* **High Level Architecture Diagram:**
    ```mermaid
    graph TD
        subgraph User Browser
            U[Parent User]
        end

        subgraph Vercel Platform
            V_CDN[Edge Network / CDN]
            V_FE[Next.js Frontend]
            V_API[Serverless Functions <br> (tRPC API)]
        end

        subgraph Third-Party Services
            DB[(PostgreSQL Database <br> e.g., Supabase/Neon)]
            Stripe[Stripe Payments]
            Email[Email Service <br> e.g., SendGrid]
        end
        
        U --> V_CDN;
        V_CDN --> V_FE;
        V_FE --> V_API;
        V_API --> DB;
        V_API --> Stripe;
        V_API --> Email;
    ```
* **Architectural Patterns:** Jamstack Architecture, Serverless Functions, Repository Pattern (with Prisma), and API Gateway Pattern (implicit via Next.js/Vercel).

### **Tech Stack**

| Category | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | ~5.5.3 | End-to-end type safety. |
| **Frontend Framework** | Next.js | ~15.1.0 | Production-grade React framework. |
| **UI Component Lib**| Shadcn/UI & Radix UI | Latest | Unstyled, accessible components for our design system. |
| **State Management**| TanStack Query & Zustand| ~5.50.1| High-performance server state and simple client state. |
| **Backend Language** | TypeScript | ~5.5.3 | Shared language across the stack. |
| **Backend Framework**| tRPC | ~11.0.0 | End-to-end type-safe APIs. |
| **API Style** | tRPC | ~11.0.0 | Ensures frontend/backend are in sync. |
| **Database** | PostgreSQL | 16.3 | Powerful, reliable, supports geospatial queries. |
| **ORM** | Prisma | ~5.15.0 | Type-safe database client. |
| **Authentication** | NextAuth.js | ~5.0.0 | Simplifies social and email logins. |
| **Frontend Testing**| Vitest & RTL | Latest | Fast unit/integration testing for React. |
| **Backend Testing** | Vitest | Latest | Consistent and fast testing for backend logic. |
| **E2E Testing** | Playwright | ~1.45.0 | Robust end-to-end testing. |
| **CI/CD** | Vercel | N/A | Seamless, Git-based continuous deployment. |
| **Monitoring** | Vercel Analytics | N/A | Built-in performance monitoring. |
| **Logging** | Vercel Logs | N/A | Real-time log streaming. |
| **Styling** | Tailwind CSS | ~3.4.4 | Utility-first CSS framework for rapid styling. |

### **Data Models**

*Includes the detailed models and TypeScript interfaces for Provider (with SafetyChecks), User, Program, and Subscription.*

### **API Specification**

*Includes the tRPC router definitions for `providerRouter` (searchPrograms, getProgramById), `userRouter` (getProfile, updatePreferences), and `subscriptionRouter` (createCheckoutSession, getSubscriptionStatus).*

### **Unified Project Structure**

*Defines the monorepo folder structure using Turborepo, with an `/apps/web` directory for the Next.js application and a `/packages` directory for shared code (api, db, ui, config).*

### **Development Workflow**

*Outlines the steps for local setup (prerequisites, install commands) and the core development commands (`pnpm dev`, `pnpm test`, etc.). Includes a template `.env.example` file with required environment variables for database, authentication, and NextAuth.js.*

### **Checklist Results Report**

* **Executive Summary:** The Fullstack Architecture Document has been validated and is **Ready for Development**. The architecture is sound, pragmatic, and well-aligned with our MVP goals.
* **Final Decision:** ✅ **READY FOR DEVELOPMENT**

### **Next Steps**

The completed PRD and this Architecture Document should now be handed to the **Product Owner (PO)** to be "sharded" into smaller pieces for the development team. Following that, the **Story Manager (SM)** can begin creating the first story from Epic 1 for implementation.