# Parent Pilot: Product Requirements Document (PRD)

### **Goals and Background Context**

#### **Vision**
Evolve from a **Holiday Program Aggregator** into a comprehensive **Parent Activity Planning Platform** that becomes the trusted hub for all children's activities.

#### **Goals**
* **Primary**: Validate a subscription-based business model for a niche, high-value market segment.
* **Core Value**: Become the most trusted and convenient platform for parents to discover and vet school holiday programs.
* **User Impact**: Significantly reduce the time and stress parents experience during holiday planning.
* **Growth**: Build a scalable platform that expands into adjacent markets including:
  - Provider self-registration and management
  - Smart parent profiles with auto-updating preferences
  - Parent communities and group activity planning
  - Weekend sports and year-round activities (future)

#### **Background Context**
This document outlines the requirements for the Parent Pilot platform, addressing a critical gap in the Australian market. Busy, "Urban Professional Parents" currently lack a centralized, trusted, and efficient way to find and book holiday activities for their children. This PRD details a premium aggregator service that will solve this problem through a curated, well-vetted selection of programs, intelligent agent-powered provider discovery, and a seamless, user-centric web experience.

> **See Also**: [Customer Journeys Proposal](/docs/reference/customer-journeys-proposal.md) for detailed journey maps and priority matrix.

#### **Change Log**
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 27/07/2025 | 1.0 | Initial PRD draft creation and validation. | John (PM) |
| 10/01/2026 | 2.0 | Expanded vision to Parent Activity Platform. Added Epics 5-10. | Sergei (PM) |
| 10/01/2026 | 2.1 | Rebranded to "Parent Pilot". Added contact-based friend discovery. | Sergei (PM) |
| 10/01/2026 | 2.2 | Added mobile strategy: PWA (Story 1.8) + Native App (Epic 11). | Sergei (PM) |
| 10/01/2026 | 2.3 | Reconciled MVP scope: Epic 5 moved to P1, Stories 1.6-1.7 merged into Epic 5. | Sergei (PM) |

---
### **User Personas**

#### **Primary: Urban Professional Parent ("Sarah")**
* **Demographics**: 30-45 years old, dual-income household, 1-3 children aged 4-14
* **Pain Points**:
  - Limited time for research during work hours
  - Overwhelmed by fragmented information across provider websites
  - Anxiety about program quality and child safety
  - Last-minute scrambling before each school holiday
* **Goals**: Find trustworthy, age-appropriate activities quickly; reduce planning stress
* **Behaviour**: Mobile-first, values reviews and recommendations, willing to pay for convenience

#### **Secondary: Holiday Program Provider ("James")**
* **Demographics**: Small business owner or program coordinator, runs holiday camps/activities
* **Pain Points**:
  - Marketing to reach new parents is expensive and fragmented
  - Managing bookings and parent inquiries is time-consuming
  - Competing with larger providers for visibility
* **Goals**: Attract more families, establish credibility, reduce admin burden
* **Behaviour**: Values exposure over cost, wants simple onboarding, appreciates analytics

#### **Tertiary: Admin/Platform Operator**
* **Role**: Internal team managing provider vetting, content quality, and platform operations
* **Goals**: Efficiently onboard quality providers, maintain data freshness, handle support

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

**Agentic Provider Discovery (P0)**
* **FR11:** The system shall include an AI-powered research agent that autonomously discovers holiday program providers via Google Places, web search, and manual seeds.
* **FR12:** The research agent shall extract provider information using Claude API and create leads with confidence scores for human review.
* **FR13:** The system shall provide an outreach workflow where the agent drafts transparent emails (from platform founder) for admin approval before sending.
* **FR14:** The system shall integrate with ABN Lookup API for automated business verification.
* **FR15:** The system shall display Google Reviews ratings and review counts on provider pages with links to Google Maps.

**Provider Self-Registration (P1)**
* **FR16:** The system shall allow providers to self-register by submitting business details, ABN, and required certifications (WWCC, insurance).
* **FR17:** The system shall provide providers with a dashboard to manage their programs, view analytics, and respond to reviews.

**Smart Parent Profiles (P1)**
* **FR18:** The system shall allow parents to add children with date of birth, automatically calculating and updating ages.
* **FR19:** The system shall support multiple locations (home, work) for proximity-based search.
* **FR20:** The system shall allow parents to configure notification preferences (frequency, types of updates).

**Proactive Planning Triggers (P1)**
* **FR21:** The system shall integrate Australian school calendars (by state) to trigger planning reminders at 6, 4, and 2 weeks before each holiday period.
* **FR22:** The system shall support waitlist functionality for fully booked programs with availability notifications.

**Reviews & Social Features (P2)**
* **FR23:** The system shall allow verified subscribers to submit reviews with star ratings, comments, and optional photos.
* **FR24:** The system shall support parent friend groups with shared visibility of preferences and group activity planning.

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

#### **MVP Epics (P0)**
* **Epic 1: Foundation & Subscriptions:** Core technical foundation, user auth, subscriptions, admin tools. *(85% complete)*
* **Epic 2: Parent-Facing Search & Discovery:** Core search functionality for MVP - the primary user value proposition.
* **Epic 4: Security & Observability (subset):** Priority security stories (headers, CSP, rate limiting) for MVP launch.

#### **Post-MVP Epics (P1)**
* **Epic 5: Agentic Provider Discovery:** AI-powered agent system for autonomous provider research and onboarding. *(Includes former Stories 1.6-1.7)*
* **Epic 3: Proactive Suggestions & User Preferences:** Preference center and automated email suggestions.
* **Epic 6: Provider Self-Registration & Dashboard:** Provider self-service portal and analytics.
* **Epic 7: Smart Parent Profiles & Notifications:** Auto-evolving profiles with child age tracking.

#### **Engagement Epics (P2)**
* **Epic 8: Reviews & Ratings System:** Parent reviews and social proof.
* **Epic 9: Parent Communities & Group Planning:** Friend connections and group activity planning.
* **Epic 11: Native Mobile App:** Expo/React Native app for contacts API and push notifications.

#### **Expansion Epics (P3 - Future)**
* **Epic 10: Weekend Sports & Year-Round Activities:** Expand beyond holiday programs.

> **Note on Stories 1.6-1.7**: The crawler-assisted data entry (1.6) and automated data refresh (1.7) stories have been merged into Epic 5 (Agentic Provider Discovery) as they require the same infrastructure (job queues, AI integration, background processing).

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

#### **Story 1.6: Crawler-Assisted Data Entry** *(Deferred to Epic 5)*
*As an admin, I want a tool that can take a provider's URL and attempt to automatically pre-fill the data entry form, so that I can speed up the manual onboarding process.*
* **Acceptance Criteria:** 1. The "New Provider" form has a URL field. 2. Submitting a URL triggers the crawling agent to extract key info. 3. Extracted data pre-populates the form fields. 4. The admin can then review, correct, and complete the form.
* **Status:** Merged into Epic 5 - requires job queue and AI infrastructure.

#### **Story 1.7: Automated Data Refresh & Review** *(Deferred to Epic 5)*
*As an admin, I want the system to periodically re-crawl existing providers and highlight potential changes, so I can efficiently keep the data up to date.*
* **Acceptance Criteria:** 1. The crawling agent runs automatically on a schedule. 2. If the agent detects a potential change, it flags the provider in the admin dashboard. 3. The admin dashboard has a queue for reviewing flagged providers.
* **Status:** Merged into Epic 5 - requires scheduled jobs and change detection.

#### **Story 1.8: Progressive Web App (PWA) Configuration**
*As a parent, I want to install Parent Pilot on my phone's home screen, so that I can access it quickly like a native app.*
* **Acceptance Criteria:** 1. Web app manifest configured with icons and theme. 2. Service worker provides offline caching for core pages. 3. Install prompt shown on supported browsers. 4. App works offline for cached content. 5. Lighthouse PWA score ≥90.

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
### **Epic 5: Agentic Provider Discovery (P0)**

**Epic Goal:** Implement an AI-powered agent system that autonomously researches, discovers, and onboards holiday program providers with human-in-the-loop approval at key decision points. This reduces manual acquisition effort while maintaining quality control.

> **See Also**: [Agent System Architecture](/docs/architecture/agent-system.md) | [Agent Journey Map](/docs/architecture/agent-journey-map.md)

#### **Story 5.1: Research Agent Infrastructure**
*As an admin, I want an agent system that can research providers from multiple sources, so that we can scale provider acquisition.*
* **Acceptance Criteria:** 1. Trigger.dev background jobs configured for agent tasks. 2. PostgreSQL job queue with retry logic. 3. Feature toggle (AGENT_ENABLED) controls agent system. 4. Claude API integration for research analysis.

#### **Story 5.2: Google Places & Web Discovery**
*As the research agent, I want to discover providers via Google Places and web search, so that I can find providers across regions.*
* **Acceptance Criteria:** 1. Google Places API integration for business discovery. 2. Google Reviews data captured (rating, count, place ID). 3. Web scraping for additional provider info. 4. Leads created with confidence scores.

#### **Story 5.3: Provider Lead Queue**
*As an admin, I want to review discovered provider leads before they're contacted, so that I can ensure quality.*
* **Acceptance Criteria:** 1. Admin dashboard shows lead queue with filters. 2. Lead details include research summary and confidence score. 3. Admin can approve, reject, or mark duplicate. 4. ABN auto-verified via API.

#### **Story 5.4: Transparent Outreach Workflow**
*As an admin, I want to review and approve outreach emails before sending, so that communications are appropriate.*
* **Acceptance Criteria:** 1. Claude generates email drafts (founder persona). 2. Email appears in approval queue (DRAFT status). 3. Admin can edit and approve. 4. Approved emails sent via Resend.

#### **Story 5.5: Term Confirmation System**
*As the system, I want to remind providers to confirm their programs each term, so that data stays fresh.*
* **Acceptance Criteria:** 1. Australian school calendar integration by state. 2. Reminder emails sent 4 weeks before term end. 3. Provider self-service portal (no login required). 4. Non-responders flagged after 3 attempts.

---
### **Epic 6: Provider Self-Registration & Dashboard (P1)**

**Epic Goal:** Enable providers to self-register on the platform, reducing acquisition costs while giving providers control over their listings and access to performance analytics.

#### **Story 6.1: Provider Registration Flow**
*As a provider, I want to register my business on Parent Pilot, so that parents can find my programs.*
* **Acceptance Criteria:** 1. Multi-step registration form. 2. ABN auto-verification. 3. Document upload for WWCC and insurance. 4. Email confirmation and progress tracking.

#### **Story 6.2: Provider Dashboard**
*As a registered provider, I want a dashboard to manage my programs, so that I can keep listings up to date.*
* **Acceptance Criteria:** 1. Program CRUD operations. 2. Analytics view (impressions, clicks). 3. Review management (view and respond). 4. Profile and certification management.

#### **Story 6.3: Admin Provider Review**
*As an admin, I want to review provider applications, so that only quality providers are listed.*
* **Acceptance Criteria:** 1. Application queue with status filters. 2. Document verification workflow. 3. Approve/reject with messaging. 4. Welcome email on approval.

---
### **Epic 7: Smart Parent Profiles & Notifications (P1)**

**Epic Goal:** Create intelligent parent profiles that evolve automatically (e.g., children's ages update on birthdays) and provide configurable notification preferences for a personalized experience.

#### **Story 7.1: Child Profiles with DOB**
*As a parent, I want to add my children with their dates of birth, so that age-appropriate programs are recommended.*
* **Acceptance Criteria:** 1. Add/edit/remove children. 2. DOB stored, age calculated dynamically. 3. Age updates automatically on birthdays. 4. Age-based activity category mapping.

#### **Story 7.2: Multiple Location Support**
*As a parent, I want to save multiple locations (home, work), so that I can search for programs near either.*
* **Acceptance Criteria:** 1. Primary and secondary location fields. 2. Toggle between locations in search. 3. Location-based program recommendations.

#### **Story 7.3: Notification Preferences**
*As a parent, I want to control what notifications I receive, so that I only get relevant updates.*
* **Acceptance Criteria:** 1. Granular notification toggles (planning reminders, new programs, waitlist). 2. Frequency options (instant, daily, weekly). 3. Channel preferences (email, future: push). 4. Unsubscribe management.

---
### **Epic 8: Reviews & Ratings System (P2)**

**Epic Goal:** Build a comprehensive review system that allows parents to rate and review programs, creating social proof and helping other parents make informed decisions.

#### **Story 8.1: Review Submission**
*As a parent, I want to review programs I've attended, so that I can help other parents.*
* **Acceptance Criteria:** 1. Star rating (1-5). 2. Written review with pros/cons. 3. Child age at time of review. 4. Optional photo upload.

#### **Story 8.2: Review Display & Moderation**
*As a visitor, I want to see reviews on program pages, so that I can evaluate quality.*
* **Acceptance Criteria:** 1. Reviews displayed with ratings. 2. Helpful votes on reviews. 3. Admin moderation queue. 4. Provider response capability.

#### **Story 8.3: Review Prompts**
*As the system, I want to prompt parents to review after programs end, so that we collect feedback.*
* **Acceptance Criteria:** 1. Post-program email prompt. 2. Click tracking for conversions. 3. Reminder if not reviewed.

---
### **Epic 9: Parent Communities & Group Planning (P2)**

**Epic Goal:** Enable parents to connect with friends, form groups, and coordinate activities together with AI-assisted group planning recommendations.

#### **Story 9.1: Contact-Based Friend Discovery**
*As a parent, I want to find friends from my phone contacts who are already on Parent Pilot, so that I can easily connect with people I know.*
* **Acceptance Criteria:** 1. Opt-in contacts permission request. 2. Phone/email matching against existing users. 3. "Parents you may know" suggestions displayed. 4. One-tap friend requests. 5. Privacy-compliant (hashed matching, no raw storage).

#### **Story 9.2: Friend Connections**
*As a parent, I want to connect with other parents, so that we can plan activities together.*
* **Acceptance Criteria:** 1. Invite friends via email/link/SMS. 2. Accept/decline friend requests. 3. View friends' public preferences (opt-in). 4. See friends interested in same programs.

#### **Story 9.3: Parent Groups**
*As a parent, I want to create/join groups (e.g., school parents, neighborhood), so that we can coordinate.*
* **Acceptance Criteria:** 1. Create and manage groups. 2. Group member management. 3. Group activity feed. 4. Group messaging/chat.

#### **Story 9.4: AI Group Planning**
*As a group member, I want AI-powered activity suggestions for our group, so that planning is easier.*
* **Acceptance Criteria:** 1. Aggregate group preferences. 2. Claude-powered recommendations. 3. RSVP/interest tracking. 4. Booking threshold notifications.

---
### **Epic 10: Weekend Sports & Year-Round Activities (P3 - Future)**

**Epic Goal:** Expand beyond holiday programs into weekly sports, after-school activities, and term-based programs, transforming Holiday Hero into a comprehensive activity planning platform.

#### **Story 10.1: Activity Type Expansion**
*As a parent, I want to search for weekend and ongoing activities, so that I can plan year-round.*
* **Acceptance Criteria:** 1. New activity types (weekly, term, ongoing). 2. Frequency filters in search. 3. Season/term scheduling. 4. Registration period tracking.

#### **Story 10.2: Sports Club Onboarding**
*As a sports club, I want to list our programs, so that families can find us.*
* **Acceptance Criteria:** 1. Sports-specific registration flow. 2. Team/age group management. 3. Season scheduling. 4. Tryout/registration windows.

> **Note:** Epic 10 expands the platform into year-round activities, fully realizing the "Parent Pilot" vision as a comprehensive activity planning platform.

---
### **Epic 11: Native Mobile App (P2)**

**Epic Goal:** Build a native mobile app using Expo/React Native to provide full access to device features (contacts, push notifications) and App Store presence, enabling the contact-based friend discovery feature.

> **Note:** PWA (Story 1.8) provides immediate mobile support. This epic delivers the full native experience when P2 community features require native device APIs.

#### **Story 11.1: Expo Project Setup**
*As a developer, I want an Expo project configured to share code with the web app, so that we can build efficiently.*
* **Acceptance Criteria:** 1. Expo project initialized in monorepo. 2. Shared TypeScript types and API client. 3. Authentication flow integrated. 4. Development builds working on iOS/Android.

#### **Story 11.2: Core Navigation & Search**
*As a parent, I want to search and browse programs on my phone, so that I can find activities on the go.*
* **Acceptance Criteria:** 1. Tab-based navigation. 2. Search interface with filters. 3. Program list and detail views. 4. Map integration. 5. Performance matches web app.

#### **Story 11.3: Profile & Preferences**
*As a parent, I want to manage my profile and children on the app, so that recommendations stay relevant.*
* **Acceptance Criteria:** 1. Profile editing. 2. Child management (add/edit/remove). 3. Location preferences. 4. Notification settings.

#### **Story 11.4: Contact-Based Friend Discovery**
*As a parent, I want to find friends from my phone contacts, so that I can connect with parents I know.*
* **Acceptance Criteria:** 1. Native contacts permission request. 2. Phone/email matching against users. 3. "Parents you may know" screen. 4. Privacy-compliant (hashed matching).

#### **Story 11.5: Push Notifications**
*As a parent, I want to receive push notifications for planning reminders and updates, so that I don't miss important dates.*
* **Acceptance Criteria:** 1. Push notification registration. 2. Holiday reminder notifications. 3. Waitlist availability alerts. 4. Friend activity notifications (opt-in).

#### **Story 11.6: App Store Submission**
*As the business, I want the app published on iOS App Store and Google Play, so that parents can discover us.*
* **Acceptance Criteria:** 1. App Store assets (icons, screenshots, description). 2. Privacy policy and terms. 3. App review compliance. 4. Published on both stores.

---
### **Priority Roadmap**

| Phase | Priority | Epics | Focus |
|-------|----------|-------|-------|
| **MVP** | P0 | 1, 2, 4 (subset) | Foundation + Search + Security basics + PWA |
| **V1.0** | P1 | 5, 3, 6-7 | Agent Discovery + Proactive + Provider Portal |
| **V2.0** | P2 | 8-9, 11 | Reviews + Communities + Native Mobile App |
| **V3.0** | P3 | 10 | Weekend Sports |

> **MVP Scope Clarification**: Epic 5 (Agentic Provider Discovery) moved from P0 to P1. MVP focuses on enabling parents to search manually-onboarded providers. Agent automation scales provider acquisition post-launch.

#### **Mobile Strategy**
- **P0 (MVP)**: PWA via Story 1.8 - installable, offline-capable, no app store needed
- **P2**: Native Expo app (Epic 11) - required for contacts API and push notifications

#### **Journey-to-Epic Mapping**

| Journey | Epic(s) |
|---------|---------|
| J1: Parent Discovery & Search | Epic 2, Epic 3 |
| J2: Agentic Provider Discovery | Epic 5 |
| J3: Provider Self-Registration | Epic 6 |
| J4: Smart Parent Profile | Epic 7 |
| J5: Proactive Planning Triggers | Epic 3, Epic 7 |
| J6: Reviews & Ratings | Epic 8 |
| J7: Parent Communities | Epic 9 |
| J8: AI Group Planning | Epic 9 |
| J9: Weekend Sports | Epic 10 |

> **See Also**: [Customer Journeys Proposal](/docs/reference/customer-journeys-proposal.md) for detailed priority matrix and success metrics.

---
### **Checklist Results Report**

* **Executive Summary:** The PRD has been validated and is **Ready** for the next phase. The document is comprehensive, consistent, and provides a clear, actionable plan for the MVP. No blocking issues were identified.
* **Final Decision:** ✅ **READY FOR ARCHITECT**
* **V2.0 Update:** Expanded to include 10 Epics covering the full Parent Activity Platform vision.

---
### **Next Steps**

* **MVP Focus:** Complete Epic 2 (Search & Discovery) - Stories 2.1-2.4. This is the core user value.
* **Security Baseline:** Implement Epic 4 priority stories (#23, #26, #8) in parallel with Epic 2.
* **Post-MVP:** Begin Epic 5 (Agentic Provider Discovery) once MVP search is live. See GitHub Issues #230-236.

> **See Also**: [Project Roadmap](/docs/project/roadmap.md) for current sprint focus and detailed story-to-issue mapping.