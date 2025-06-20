# CarePoP Hono Backend: System Patterns & Architecture

**Version:** 2.1
**Last Updated:** 2024-08-23
**Objective:** To provide a definitive architectural guide for the new CarePoP backend (codename: `carepop-backend-new`). All development must adhere to these patterns to ensure consistency, maintainability, and scalability. This backend's primary consumer is the `carepop-web` Next.js application.

---

## 1. Core Technology & Philosophy

-   **Framework:** Hono
-   **Runtime:** Node.js (deployed on Vercel as Serverless Functions)
-   **Language:** TypeScript (strict mode)
-   **Database:** Supabase PostgreSQL
-   **Authentication:** Supabase Auth (JWT-based)
-   **Transactional Email:** Resend (via `carepop.online` domain)
-   **File Storage:** Supabase Storage
-   **Validation:** Zod

**Philosophy:** We build a robust, modular, and performant API layer. The backend is headless and serves data and logic to consumers. We prioritize clear separation of concerns, with each feature module being self-contained.

---

## 2. Exhaustive Project Structure Blueprint

The backend follows a strict module-based architecture. This is the single source of truth for file and folder organization.

```
carepop-backend-new/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── vercel.json
│
├── api/
│   └── index.ts                # Vercel's Serverless Function entry point.
│
├── supabase/
│   ├── config.toml
│   └── migrations/
│
└── src/
    ├── app.ts                  # Main Hono app instance. Registers global middleware and module routes.
    ├── index.ts                # Entry point for LOCAL development (using ts-node/nodemon).
    │
    ├── config/                 # Environment variable management (Zod-validated).
    ├── lib/                    # Shared libraries (e.g., email.ts), helpers, and custom error classes (ApiError).
    ├── middleware/             # Request-intercepting logic (auth, centralized error handling, logging).
    │
    └── modules/                # <--- ALL CORE APPLICATION LOGIC LIVES HERE --->
        ├── auth/               # Handles user registration, login, and session management.
        └── ...                 # Other feature modules (clinics, appointments, etc.)
```
Each module folder (e.g., `src/modules/auth/`) contains its own `*.routes.ts`, `*.service.ts`, and `*.validation.ts` files.

---

## 3. Module Responsibilities & Domain Language

-   **`auth`**: Handles all public-facing authentication (registration, login). It is the gateway to the system.
-   **`users`**: Provides **admin-only** endpoints for viewing the entire user base. This is distinct from `profiles`.
-   **`profiles`**: Allows an authenticated user to perform CRUD operations on their **own** profile data.
-   **`services`**: Manages `Services` and `Specializations`.
    -   **Domain Note:** A `Specialization` is the primary category for a `Service` (e.g., "Cardiology" is a Specialization, "Annual Check-up" is a Service within it).
-   **`providers`**: Manages healthcare providers and their schedules, linking them to their `Specializations`.
-   **`clinics`**: Manages clinic information, including their associations with providers and available services.
-   **`appointments`**: The core booking engine. Manages the lifecycle of appointments.
-   **`medical-records`**: Manages the dynamic form engine, including form templates and encrypted user submissions.
-   **`files`**: A utility module to generate secure, signed URLs for direct-to-storage file uploads, primarily for medical records.
-   **`inventory`**: An **admin-only** module to manage `Suppliers`, `Inventory Items`, and `Inventory Item Batches`.

---

## 4. Key Implementation Patterns

### 4.1. API Design
-   **Versioning:** All API routes are prefixed with `/api/v1`.
-   **Resource Naming:** Endpoints use plural nouns and kebab-case (e.g., `/api/v1/medical-records`).
-   **Admin Endpoints:** Admin-only CRUD operations are protected by role checks in the auth middleware (e.g., `app.use('/admin/*', authMiddleware('admin'))`).

### 4.2. Data Flow & Logic
-   **Route Layer (`*.routes.ts`):** Defines endpoints and attaches middleware (validation, auth). It contains **no `try...catch` blocks** and no business logic. It delegates immediately to the service layer.
-   **Service Layer (`*.service.ts`):** Contains the core business logic. **It is self-contained and creates its own Supabase clients.** It does not receive clients via parameters. It interacts with the database, performs calculations, and throws custom errors. It is completely unaware of the HTTP context.
-   **Validation (`*.validation.ts`):** Uses Zod schemas to define data shapes. Enforced at the route layer via `zValidator` middleware.

### 4.3. Error Handling (Centralized)
-   Route handlers **must not** use `try...catch`.
-   Service layers should `throw new ApiError(statusCode, message)` for expected, controllable errors (e.g., `throw new ApiError(404, 'User not found')`).
-   The main `app.ts` registers a global error handler (`app.onError(...)`). This middleware is the **only** place where errors are caught. It formats all thrown `ApiError` instances and other unexpected errors into a standardized JSON response.

### 4.4. Security

#### 4.4.1. Authentication (JWT Middleware)
-   Route protection is handled by `src/middleware/auth.middleware.ts`.
-   This middleware inspects the `Authorization: Bearer <token>` header.
-   It uses the public Supabase client to verify the JWT and fetch the user.
-   If the token is invalid or the user doesn't exist, it throws a `401 ApiError`.
-   If successful, it attaches the `user` object to the Hono context (`c.var.user`) for use in downstream protected routes.

#### 4.4.2. Authorization (Role Checks)
-   The `authMiddleware` is a factory function that can accept a required role (e.g., `authMiddleware('admin')`).
-   If a role is passed, the middleware will perform an additional check after validating the JWT to ensure the user has the required role in the `user_roles` table.
-   If the role check fails, it throws a `403 ApiError`.

#### 4.4.3. Database Access
-   Services use the **public Supabase client** for standard, user-facing queries that must respect RLS.
-   For privileged operations that must bypass RLS (e.g., creating a user's profile during registration), services **must** use the `supabaseAdmin` client, which is initialized with the `SERVICE_ROLE_KEY`.

#### 4.4.4. Domain & Email
-   **Domain Registrar:** GoDaddy (`carepop.online`)
-   **DNS Management:** Vercel (for the `carepop.online` domain)
-   **Transactional Email (SMTP):** Resend is configured as the SMTP provider within Supabase to handle all transactional emails (e.g., email confirmation, password resets).
-   **Email Forwarding:** `app.improvmx.com` is used for creating and forwarding email aliases (e.g., `support@carepop.online`).

### 4.5. Deployment (CI/CD)
-   **Pattern Name**: Automated Deployment via Vercel Git Integration
-   **Trigger**: Push to the `main` branch.
-   **Workflow**: Vercel's native Git integration with GitHub.
-   **Process**:
    1.  **Push to `main`**: A commit is pushed to the `main` branch of the GitHub repository.
    2.  **Vercel Build**: Vercel automatically detects the push, pulls the latest code, and starts a new deployment.
    3.  **Environment Variables**: Vercel injects the environment variables configured in the project settings (including Supabase keys).
    4.  **Deployment**: Vercel builds the Hono application and deploys it as a Serverless Function. On success, the new deployment is promoted to production.
-   **Rationale**: This leverages Vercel's native, highly-optimized CI/CD pipeline, removing the need for custom GitHub Actions workflows for simple deployments. It's faster and requires less maintenance.

---

## 5. Foundational Pattern: User Registration & Login

### 5.1. Registration Flow
This flow is a critical pattern demonstrating self-contained services and privileged operations.

1.  **Client Request:** `POST /api/v1/auth/register` with `email`, `password`, `confirmPassword`.
2.  **Validation:** The route uses `zValidator` to validate the body.
3.  **Service Call:** The route handler calls `authService.registerUser(input)`.
4.  **Service Logic (`auth.service.ts`):**
    a. Calls `supabase.auth.signUp()` using its **local public Supabase client**. This triggers a transactional email via the configured **Resend** SMTP service.
    b. **On success, it immediately uses the imported `supabaseAdmin` client** (service_role) to perform two privileged actions:
       i.  `INSERT` a new row into `public.profiles`.
       ii. `INSERT` a new row into `public.user_roles` with the default `'user'` role.
    c. If the user already exists, it throws a `400 ApiError`.
5.  **API Response:** `201 Created` with a success message and the new `user` object.

### 5.2. Login Flow
1.  **Client Request:** `POST /api/v1/auth/login` with `email` and `password`.
2.  **Validation:** The route uses `zValidator` to validate the body.
3.  **Service Call:** The route handler calls `authService.loginUser(input)`.
4.  **Service Logic (`auth.service.ts`):**
    a. Calls `supabase.auth.signInWithPassword()` using its local public client.
    b. If credentials are invalid, Supabase throws an error which is caught by the global handler and formatted as a `401` response.
5.  **API Response:** `200 OK` with the full `session` object, including the JWT access token.
