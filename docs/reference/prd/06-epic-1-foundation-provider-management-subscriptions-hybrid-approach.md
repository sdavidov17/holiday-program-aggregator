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

***
