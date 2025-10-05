
  

# 🧩 Pull Request Template

  

Dear contributor use this template to create clear, consistent, and effective Pull Requests for the Scouts Platform project.

  

---

  

## � Related clickup-ticket (optional) 

  

Link to the GitHub issue this PR addresses (if applicable):

  

Closes #[issue_number]

  

>  **Example:** Closes #42

  

---

  

## 📝 Description

  

Provide a clear and concise explanation of the changes introduced in this PR.

  

Include any relevant context, such as **why** the change was needed or **what problem** it solves.

  

>  **Example:**

> This PR adds medical records management for scouts members, including:

>  - New `MedicalRecord` entity with vaccine and medication tracking

>  - REST API endpoints for CRUD operations

>  - Unit tests with 85% coverage

  

---

  

## 👤 Authors

  

List all contributors involved in this pull request.

  

- [@username](https://github.com/username)

  

---

  

## 🔍 Type of Change

  

Select the type of change your PR introduces:

  

- [ ] **Feature** – A new capability or improvement

- [ ] **Fix** – A bug or defect resolution

- [ ] **Refactor** – Code improvement without behavior change

- [ ] **Docs** – Documentation updates only

- [ ] **Chore** – Maintenance, tooling, or dependencies

  

---

  

## 🚀 How to Test

  

Explain how reviewers or QA can verify that the changes work as intended.

  

### Backend Testing:

>  **Example:**

>  1. Navigate to `/backend` directory

>  2. Run `./mvnw clean test` to execute unit tests

>  3. Run `./mvnw spring-boot:run` to start the application

>  4. Test endpoints using Swagger UI at `http://localhost:8080/swagger-ui.html`

>  5. Verify the new `/api/v1/members/medical-records` endpoints

  

### Frontend Testing (if applicable):

>  **Example:**

>  1. Navigate to `/frontend` directory

>  2. Run `npm install` and `npm run dev`

>  3. Test the medical records form at `http://localhost:5173/members/medical`

  

---

  

## ✅ Pre-Merge Checklist

  

Ensure all items are completed before requesting review:

 
- [ ] Unit tests added/updated and passing (min. 80% coverage)

- [ ] All existing tests pass (`./mvnw test`)

- [ ] Database schema changes documented (if applicable)

- [ ] API documentation updated (Swagger annotations)

- [ ] No merge conflicts with target branch

- [ ] Self-reviewed the code changes

- [ ] Tested locally in both scenarios: with and without .env variables

 ---
  


  




## 🧠 Additional Notes (Optional)

  

Add any extra context or details that might help reviewers understand your approach — such as design decisions, trade-offs, or potential follow-ups.

  

>  **Example:**

>  - Used JSONB for vaccine details to allow flexible schema

>  - Considered Redis caching but deferred for future optimization

>  - Follow-up: Add bulk import feature for medical records
