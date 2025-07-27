# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.6: Crawler-Assisted Data Entry

*As an admin, I want a tool that can take a provider's URL and attempt to automatically pre-fill the data entry form, so that I can speed up the manual onboarding process.*

### Acceptance Criteria
1. The "New Provider" form has a URL field.
2. Submitting a URL triggers the crawling agent to extract key info.
3. Extracted data pre-populates the form fields.
4. The admin can then review, correct, and complete the form.

### Development Tasks
- [ ] Add a URL input field to the top of the "New Provider" form.
- [ ] Create a new serverless function responsible for web crawling.
- [ ] Choose and integrate a web scraping library (e.g., Cheerio, Puppeteer) into the serverless function.
- [ ] Create a new tRPC procedure (`prefillProviderFromUrl`) that takes a URL as input.
- [ ] The procedure should invoke the crawling function to fetch and parse the HTML from the given URL.
- [ ] Implement logic within the crawler to extract key information (e.g., provider name, description, contact details) using CSS selectors.
- [ ] The `prefillProviderFromUrl` procedure should return the extracted data as a JSON object.
- [ ] On the frontend, when the admin submits a URL, call the `prefillProviderFromUrl` procedure.
- [ ] Use the returned data to pre-populate the corresponding fields in the "New Provider" form.
- [ ] Ensure the admin can still manually edit all pre-populated fields before submitting the form for creation.