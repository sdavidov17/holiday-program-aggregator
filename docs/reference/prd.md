# Holiday Program Aggregator: Product Requirements Document (PRD)

### **Goals and Background Context**

#### **Goals**
* Validate a subscription-based business model for a niche, high-value market segment.
* Become the most trusted and convenient platform for parents to discover and vet school holiday programs.
* Significantly reduce the time and stress parents experience during holiday planning.
* Build a scalable platform that can expand into adjacent markets (e.g., after-school activities) in the future.

#### **Background Context**
This document outlines the requirements for a Minimum Viable Product (MVP) designed to address a critical gap in the Australian market. Busy, "Urban Professional Parents" currently lack a centralized, trusted, and efficient way to find and book holiday activities for their children. This PRD details a premium aggregator service that will solve this problem through a curated, well-vetted selection of programs and a seamless, user-centric web experience.

#### **Change Log**
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 27/07/2025 | 1.0 | Initial PRD draft creation and validation. | John (PM) |

---
### **Requirements**

#### **Functional**
* **FR1:** The system shall allow parents to create a secure account, log in, and manage a basic user profile.
* **FR2:** The system shall include an automated web crawling agent to discover and extract key information about holiday program providers from their public websites.
* **FR3:** The crawling agent shall operate on an automated schedule to refresh program data, identifying changes to existing programs.
* **FR4:** The system shall provide an administrative interface for internal staff to review crawled data, approve new providers, and mark a provider as 'Vetted' after a manual verification step.
* **FR5:** The system shall allow parents to easily find and compare programs based on their proximity to a specified address or postcode.
* **FR6:** The system shall display detailed profile pages for each provider, showing their description, photos, vetting status, location, schedule, and cost.
* **FR7:** The system shall allow logged-in users to save their core preferences (e.g., location radius, activity types) to their profile.
* **FR8:** The system shall automatically generate and send a curated email of program suggestions to users based on their saved preferences prior to each school holiday period.
* **FR9:** The system shall securely process annual subscription payments through an integrated third-party payment provider.
* **FR10:** The system shall manage the user's subscription lifecycle, including sending renewal reminders and restricting access to premium features upon subscription expiry.

#### **Non-Functional**
* **NFR1 (Performance):** The core search and discovery interface shall load in under 3 seconds and achieve a Largest Contentful Paint (LCP) of under 2.5 seconds.
* **NFR2 (Platform):** The system shall be a responsive web application, providing a consistent and fully functional experience on all modern desktop, tablet, and mobile browsers.
* **NFR3 (Security & Compliance):** The system must comply with the Australian Privacy Principles (APP) for all user data.
* **NFR4 (Usability):** A first-time user shall be able to successfully perform a search, filter results, and view a provider's page without needing a tutorial or help document.
* **NFR5 (Data Freshness):** Program data displayed to users must be timestamped, and the system should not display data older than 48 hours from the last successful data refresh.
* **NFR6 (PII Data):** The system must encrypt all Personally Identifiable Information (PII), such as user and children's names, both at rest and in transit. No PII shall ever be included in system logs.
* **NFR7 (Performance Testing):** The system must undergo load testing to ensure the search functionality can handle a simulated load of 500 concurrent users without performance degradation below the standard set in NFR1.
* **NFR8 (Input Validation):** All user-submitted data must be rigorously validated on both the client and server-side to prevent common web vulnerabilities (e.g., XSS, SQL Injection).
* **NFR9 (Password Security):** User passwords must be securely hashed using a modern, strong hashing algorithm (e.g., Argon2 or bcrypt). Plaintext passwords must never be stored.
* **NFR10 (Observability):** The system must implement comprehensive distributed tracing, structured logging with correlation IDs, and metrics collection for all critical user journeys to enable proactive monitoring and rapid incident response.
* **NFR11 (Security Headers):** The system must implement security headers including CSP, HSTS, X-Frame-Options, and other OWASP recommended headers to protect against common web vulnerabilities.
* **NFR12 (Monitoring & Alerting):** The system must monitor all critical user journeys with defined SLOs (99.9% availability for authentication, 99.5% for payments) and alert the team within 2 minutes of SLO violations.
* **NFR13 (Audit Logging):** All authentication events, data access, and administrative actions must be logged with tamper-proof audit trails retained for a minimum of 2 years to comply with Australian Privacy Principles.
* **NFR14 (Error Tracking):** The system must capture and track all errors with full context (user, session, journey) while ensuring PII is properly scrubbed from error reports.
* **NFR15 (Synthetic Monitoring):** Critical user journeys (signup, login, search, payment) must be continuously tested from Sydney region every 5 minutes with alerts for failures.

---
### **User Interface Design Goals**

* **Overall UX Vision:** Clean, professional, and instantly trustworthy. The interface should be a premium, time-saving tool that prioritizes clarity and efficiency.
* **Key Interaction Paradigms:** Map-centric discovery, real-time filtering, and "set and forget" preferences.
* **Core Screens and Views:** Homepage / Search & Map Interface, Program Details Page, User Profile & Preferences Page, Subscription & Billing Page, Login / Sign-up Page, and **Admin Dashboard (for provider vetting & crawl management)**.
* **Accessibility:** Target WCAG 2.1 AA compliance.
* **Branding:** To be defined. Must convey trust, safety, and premium quality.
* **Target Device and Platforms:** A responsive web application, designed mobile-first.

---
### **Technical Assumptions**

* **Repository Structure:** Monorepo
* **Service Architecture:** Serverless
* **Testing Requirements:** Unit + Integration tests for the MVP.
* **Additional Assumptions:** The stack will be based on React (Next.js), Node.js, and PostgreSQL with PostGIS, deployed on a PaaS like Vercel or Supabase.

---
### **Epic List**

* **Epic 1: Foundation, Provider Management & Subscriptions:** To establish the core technical foundation, build the internal admin tools for provider management, and implement the user subscription and payment system.
* **Epic 2: Parent-Facing Search & Discovery:** To launch the primary application, allowing subscribed users to search, filter, and view vetted holiday programs.
* **Epic 3: Proactive Suggestions & User Preferences:** To enhance user value by implementing the preference center and the automated email system for curated suggestions.
* **Epic 4: Security, SRE & Observability:** To implement comprehensive monitoring, security hardening, and observability practices ensuring the platform's reliability, security, and ability to proactively detect and respond to issues.

---
### **Epic 1: Foundation, Provider Management & Subscriptions (Hybrid Approach)**

**Expanded Epic Goal:** This foundational epic delivers two critical pieces of value: the internal engine for managing provider data, which is the core of our platform's quality, and the complete subscription system, allowing us to onboard paying customers from day one. By the end of this epic, the business will be ready to accept subscribers and the internal team will have the tools to efficiently populate the platform with high-quality, vetted providers.

#### **Story 1.1: Initial Project & CI/CD Setup**
*As a development team, I want a configured project foundation with automated deployment, so that we can build and deploy features efficiently and reliably.*
* **Acceptance Criteria:** 1. A Monorepo is initialized. 2. The web app is configured with Next.js and TypeScript. 3. The backend is configured for serverless functions. 4. A basic CI/CD pipeline is established. 5. A health-check endpoint on the backend returns a `200 OK`.

#### **Story 1.2: User Account System (with Google/Apple Login)**
*As a parent, I want to be able to sign up and log in securely and conveniently, so that I can manage my profile and subscription.*
* **Acceptance Criteria:** 1. A user can create an account using email/password. 2. A user can create an account using their Google account. 3. A user can create an account using their Apple account. 4. A registered user can log in using any method. 5. A logged-in user can view a basic profile page. 6. All user PII is encrypted.

#### **Story 1.3: Subscription & Payment Integration**
*As a new user, I want to be able to pay for an annual subscription, so that I can access the service.*
* **Acceptance Criteria:** 1. The application integrates with Stripe. 2. A logged-in user without a subscription is prompted to subscribe. 3. A user can successfully purchase a subscription. 4. Upon payment, the user's account is marked as 'active'.

#### **Story 1.4: Subscription Lifecycle Management**
*As the business, I want the system to manage subscription status, so that we can handle renewals and expirations automatically.*
* **Acceptance Criteria:** 1. The system sends a renewal reminder 7 days before expiration. 2. If a subscription expires, their status is updated to 'expired'. 3. Expired users are restricted from premium features.

#### **Story 1.5: Manual Provider Onboarding Tool**
*As an admin, I want a simple interface to manually enter, edit, and vet new provider data, so that we have a reliable way to onboard our first providers for launch.*
* **Acceptance Criteria:** 1. A logged-in admin can access a secure admin dashboard. 2. The admin can create a new provider profile using a data entry form. 3. The form includes all necessary fields. 4. The admin can mark the provider as 'Vetted' and 'Published'.

#### **Story 1.6: Crawler-Assisted Data Entry**
*As an admin, I want a tool that can take a provider's URL and attempt to automatically pre-fill the data entry form, so that I can speed up the manual onboarding process.*
* **Acceptance Criteria:** 1. The "New Provider" form has a URL field. 2. Submitting a URL triggers the crawling agent to extract key info. 3. Extracted data pre-populates the form fields. 4. The admin can then review, correct, and complete the form.

#### **Story 1.7: Automated Data Refresh & Review**
*As an admin, I want the system to periodically re-crawl existing providers and highlight potential changes, so I can efficiently keep the data up to date.*
* **Acceptance Criteria:** 1. The crawling agent runs automatically on a schedule. 2. If the agent detects a potential change, it flags the provider in the admin dashboard. 3. The admin dashboard has a queue for reviewing flagged providers.

---
### **Epic 2: Parent-Facing Search & Discovery**

**Expanded Epic Goal:** This epic represents the core of the parent-facing application. It builds on the foundation of Epic 1 to deliver the primary value proposition to our subscribed users: a powerful, intuitive, and trustworthy tool to find the perfect holiday program. By the end of this epic, the main user-facing functionality of the MVP will be complete and ready for use.

#### **Story 2.1: Search & Filter Interface**
*As a subscribed parent, I want a clean interface with search and filter options, so that I can easily begin my search for relevant holiday programs.*
* **Acceptance Criteria:** 1. The main page displays a search bar for location. 2. The interface includes filters for dates, activity type, and child's age. 3. The layout is responsive. 4. The page includes sections for a results list and a map view.

#### **Story 2.2: Display Program Search Results**
*As a subscribed parent, I want to see a list of programs that match my search criteria, so that I can quickly scan the available options.*
* **Acceptance Criteria:** 1. A search queries the database for vetted, published providers matching the filters. 2. A list of matching programs is displayed. 3. A user-friendly "no results" message is shown if applicable. 4. Search results load within performance standards.

#### **Story 2.3: Interactive Map View**
*As a subscribed parent, I want to see the program results plotted on a map, so that I can understand their proximity to me at a glance.*
* **Acceptance Criteria:** 1. All programs in the results are displayed as interactive pins on a map. 2. Interacting with a map pin highlights the program in the list. 3. The map is centered and zoomed appropriately. 4. The user can pan and zoom the map.

#### **Story 2.4: Detailed Provider Profile Page**
*As a subscribed parent, I want to view a detailed page for a specific program, so that I can get all the information I need to make a decision.*
* **Acceptance Criteria:** 1. Clicking a program from the results leads to its unique details page. 2. The page displays all relevant information. 3. The provider's "Vetted" status is prominently displayed. 4. The page includes a clear link to the provider's website for booking.

---
### **Epic 3: Proactive Suggestions & User Preferences**

**Expanded Epic Goal:** This epic delivers the key 'convenience' differentiator for our service, transforming it from a simple search tool into a proactive assistant. By allowing parents to save their preferences and receive automated, curated suggestions, we solve their problem of 'not knowing where to start' and save them even more time.

#### **Story 3.1: User Preference Center**
*As a subscribed parent, I want to save my preferences for activities, so that the service can send me relevant suggestions.*
* **Acceptance Criteria:** 1. A logged-in user can access a "Preferences" page. 2. The user can set and save their preferred location radius. 3. The user can select preferred activity types. 4. The user can enter the ages of their children. 5. Saved preferences are stored correctly.

#### **Story 3.2: Proactive Email Generation**
*As the system, I want to generate a personalized list of programs for each user, so that they can receive a relevant, curated email.*
* **Acceptance Criteria:** 1. A backend process can be triggered for a specific user. 2. The process retrieves the user's saved preferences. 3. The process queries for matching programs for the upcoming holiday period. 4. The process compiles a list of the top 5-10 matches. 5. A "no matches found" state is handled.

#### **Story 3.3: Email Delivery & Scheduling**
*As the business, I want to automatically send the proactive suggestion emails to all subscribed users, so that we can deliver on our core value proposition.*
* **Acceptance Criteria:** 1. The system integrates with a third-party email service. 2. A mobile-friendly email template is created. 3. A scheduled task runs automatically before each school holiday period. 4. The task triggers the email generation and sending for all active subscribers.

---
### **Epic 4: Security, SRE & Observability**

**Epic Goal:** Implement comprehensive monitoring, security hardening, and observability practices ensuring the platform's reliability, security, and ability to proactively detect and respond to issues affecting critical user journeys.

#### **Story 4.1: Security Headers & CSP Implementation**
*As a security engineer, I want the application to implement comprehensive security headers, so that we protect users from common web vulnerabilities.*
* **Acceptance Criteria:** 1. Security headers middleware implemented. 2. CSP configured for Stripe and OAuth. 3. Security headers score A+ on securityheaders.com. 4. No CSP violations in normal operation.

#### **Story 4.2: Structured Logging with Correlation IDs**
*As a developer, I want all logs to include correlation IDs and structured data, so that I can trace requests across the entire system.*
* **Acceptance Criteria:** 1. Unique correlation IDs for all requests. 2. JSON structured logs with consistent schema. 3. No PII in logs. 4. Log aggregation configured.

#### **Story 4.3: OpenTelemetry Distributed Tracing**
*As an SRE, I want distributed tracing across all services, so that I can identify performance bottlenecks and debug issues quickly.*
* **Acceptance Criteria:** 1. OpenTelemetry SDK integrated. 2. All endpoints create trace spans. 3. External API calls included in traces. 4. P95 latency dashboards available.

#### **Story 4.4: Critical Journey Monitoring & Alerting**
*As a product owner, I want monitoring of critical user journeys with proactive alerting, so that we detect and fix issues before users are impacted.*
* **Acceptance Criteria:** 1. Synthetic tests for signup, login, search, payment. 2. Tests run every 5 minutes from Sydney. 3. Alerts within 2 minutes of failures. 4. SLOs defined and monitored for all journeys.

---
### **Checklist Results Report**

* **Executive Summary:** The PRD has been validated and is **Ready** for the next phase. The document is comprehensive, consistent, and provides a clear, actionable plan for the MVP. No blocking issues were identified.
* **Final Decision:** ✅ **READY FOR ARCHITECT**

---
### **Next Steps**

* **UX Expert Prompt:** "Hello Sally (UX Expert). Here is the completed and validated PRD. Please review it, particularly the 'User Interface Design Goals' and detailed Epics, and then begin the UI/UX Specification process."
* **Architect Prompt:** "Hello Winston (Architect). Here is the completed and validated PRD, which includes high-level Technical Assumptions. Please review it thoroughly and begin the fullstack architecture design process."