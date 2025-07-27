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

***
