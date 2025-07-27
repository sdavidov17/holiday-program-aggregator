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

***
