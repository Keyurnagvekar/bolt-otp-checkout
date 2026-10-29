# LLM Prompts — OTP-Based Checkout Application

## 1. Project Architecture

### Prompt 1: Application Design
Build an OTP-based user login and checkout application with three distinct layers: frontend, API backend, and database. Organize the project into maintainable components and provide a complete source-code structure suitable for GitHub submission.

### Prompt 2: Technology Stack
Use React and TypeScript for the frontend, FastAPI and Python for the backend, SQLAlchemy for database access, and a relational database for persistent storage. Use pytest for API testing and Playwright with Python for end-to-end testing.

## 2. Frontend Development

### Prompt 3: Checkout Interface
Create a clean, professional, responsive checkout interface with customer information fields, email-based account recognition, an OTP verification modal, and a guest checkout option.

### Prompt 4: Email Recognition
Implement frontend behavior that allows a customer to enter an email address and proceed through the appropriate authentication or checkout flow based on whether the email is registered.

### Prompt 5: OTP Verification UI
Create an OTP verification modal that accepts a six-digit code, provides validation feedback, and allows customers to continue checkout without signing in when guest checkout is available.

### Prompt 6: User Experience
Improve the application's visual hierarchy, form usability, validation messages, loading states, error handling, and responsive behavior for desktop and mobile screens.

## 3. Backend and API Development

### Prompt 7: FastAPI Backend
Implement a FastAPI backend with separate routes, database models, configuration, and application initialization. Provide endpoints for health checks, user registration, OTP operations, authentication, and checkout.

### Prompt 8: User Registration
Implement an API endpoint that registers a user using their email address, first name, and last name. Validate input and persist user information in the database.

### Prompt 9: OTP Generation and Verification
Implement six-digit OTP generation and verification for email-based authentication. Store OTPs securely using hashing, enforce an expiration period, validate submitted codes, and return appropriate success or error responses.

### Prompt 10: Registered Email Recognition
Implement backend logic to determine whether an email address belongs to a registered user and return the information required by the frontend to select the appropriate checkout flow.

### Prompt 11: Authentication and Sessions
Implement authentication following successful OTP verification. Maintain the authenticated user's session and provide a logout mechanism.

### Prompt 12: Guest Checkout
Allow customers to continue checkout without authenticating when guest checkout is supported. Ensure guest and authenticated checkout follow the appropriate application logic.

### Prompt 13: Checkout Persistence
Create an API endpoint that accepts checkout information, validates submitted data, and persists the checkout record in the database. Return meaningful responses for successful submissions and validation failures.

### Prompt 14: Health Check
Add a health-check endpoint that allows developers and hosting platforms to confirm that the backend service is running.

## 4. Database Design

### Prompt 15: Database Models
Create relational database models for users, OTP verification data, and checkout records. Define appropriate primary keys, relationships, constraints, and timestamps.

### Prompt 16: SQL Schema
Create a standalone SQL schema file under the database directory. Include the required tables, columns, primary keys, foreign keys, and relevant constraints. Ensure the schema file is committed to the GitHub repository.

### Prompt 17: Database Configuration
Configure SQLite for local development and support PostgreSQL through environment-based database configuration for deployment.

## 5. Automated Testing

### Prompt 18: API Tests
Write pytest tests for the backend API. Cover successful registration, input validation, OTP verification, authentication behavior, checkout submission, and relevant error cases.

### Prompt 19: Playwright End-to-End Tests
Use Playwright with Python and pytest to automate important checkout scenarios, including registration, OTP verification, guest checkout, form validation, and successful checkout submission.

### Prompt 20: Application Workflow Validation
Review the end-to-end application workflow and identify missing validations, integration problems, and failure scenarios. Recommend improvements to application reliability and maintainability.

## 6. Debugging and Configuration

### Prompt 21: Backend Startup
Help diagnose and resolve backend startup issues involving Python dependencies, FastAPI configuration, database initialization, and Uvicorn.

### Prompt 22: Frontend Setup
Help configure and run the React and TypeScript frontend using Node.js, npm, and Vite. Diagnose dependency installation and frontend startup issues.

### Prompt 23: API Integration
Help diagnose frontend-to-backend communication issues, including incorrect API URLs, CORS configuration, request validation, and unexpected API responses.

### Prompt 24: Error Handling
Review the application's error handling and ensure that API failures and invalid user input produce clear responses without exposing sensitive implementation details.

## 7. Documentation and Deployment

### Prompt 25: README Documentation
Create a README.md describing the application, architecture, technology stack, project structure, prerequisites, installation steps, environment configuration, startup commands, and testing instructions.

### Prompt 26: Deployment Configuration
Prepare deployment configuration for hosting the frontend and backend separately. Document required environment variables, database connectivity, CORS settings, and the public application URL.

### Prompt 27: GitHub Submission
Review the project structure for submission. Ensure the frontend, backend, tests, SQL schema, README.md, and prompts.md are included while excluding virtual environments, unnecessary generated files, and secrets.

### Prompt 28: Assignment Compliance
Compare the application against the assignment requirements for a publicly accessible website, GitHub repository access, a checked-in SQL schema, a prompts.md file, and distinct frontend, API, and database layers. Identify outstanding work before submission.

## 8. Prompt Log Accuracy

This document is a structured reconstruction of prompts relevant to the application's development. It is not a verified verbatim transcript of every LLM interaction.

Before submission, compare this document against the actual development conversation history and update it to include the prompts actually used during implementation, debugging, testing, and deployment. Do not claim that reconstructed prompts are verbatim historical records. Do not include API keys, passwords, access tokens, or other secrets.