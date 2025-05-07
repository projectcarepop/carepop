# Project Brief: CarePoP/QueerCare Integrated Healthcare Platform

## 1. Project Name

CarePoP / QueerCare (Integrated Healthcare Platform)

## 2. Client/Partner

Family Planning Organization of the Philippines (FPOP)

## 3. Vision

To enhance healthcare accessibility and efficiency, particularly for diverse and underserved communities in the Philippines, through a secure, user-friendly, and inclusive digital platform comprising distinct native mobile and web application experiences.

## 4. Core Problem

The platform addresses significant barriers to healthcare access within underserved communities in Quezon City, Philippines, including:
*   Inefficiencies in manual healthcare workflows.
*   Lack of digital integration and varying tech literacy among users.
*   Fragmented service access and difficulty finding suitable, inclusive providers (especially for SRH and LGBTQIA+ needs).
*   Prevalence of misinformation and stigma related to sensitive health topics.
*   Limited access to comprehensive, unified health data for both patients and providers.

## 5. Solution Approach

Develop a platform delivered through **three distinct top-level applications** within a single Git repository:

1.  **`carepop-nativeapp/`**: A **native mobile application (iOS/Android)** built with **Expo (React Native)**, providing a rich, optimized, on-the-go user experience for accessing services and managing health data.
2.  **`carepop-web/`**: A **comprehensive web application** built with **Next.js, Tailwind CSS, and Shadcn UI**. This provides broader accessibility, includes public-facing informational pages (optimized for SEO), hosts the full suite of user-facing functional modules (mirroring the native app), and contains administrative interfaces.
3.  **`carepop-backend/`**: A **backend system** utilizing **Supabase** for core BaaS features (PostgreSQL Database, Authentication, RLS, Storage, Triggers) and **Google Cloud Run** (Node.js/TypeScript) for custom serverless functions (complex logic, integrations, scheduled jobs, application-level security processing). This backend serves as the single source of truth and logic layer for *both* the native mobile and web applications.

This structure simplifies development and deployment for each platform while leveraging the strengths of specific technologies. The entire system emphasizes a user-centered design focused on accessibility, security (DPA/HIPAA compliance), inclusivity, and a modern, trustworthy aesthetic across both frontend applications.

## 6. Target Audience

Individuals from diverse communities in Quezon City, Philippines, including those seeking family planning, sexual and reproductive health (SRH) services, general consultations, and specifically including the LGBTQIA+ community. The audience extends to broader underserved populations facing healthcare barriers. Both the native mobile app and the web application must be designed to be highly approachable, easy to use for users with varying tech literacy, and inspire trust.

## 7. High-Level Scope (Core Modules - Available via Native & Web UIs, Powered by Backend)

*   **User Management:** Secure registration/login (Direct Client-Supabase Auth + Profile Trigger), profile management, viewing linked data.
*   **Appointment Scheduling:** Online booking, provider/availability browsing, schedule management (Admin/Provider), confirmations, reminders, cancellations.
*   **Healthcare Provider & Location Directory:** Searchable directory (specialty, location, inclusive care flags), mapping integration (client-side), admin management. Web version requires SEO.
*   **Health Tracking:** Pill Tracker & Menstrual Tracker features (User logging, reminders). Requires high security (App-level encryption via Backend).
*   **Medicine Inventory Management:** (Admin focused) Tracking supplies, stock levels, expiry dates. Primarily web admin UI.
*   **Reporting:** (Admin focused) Generation of aggregate platform usage, operational statistics, and anonymized health trend summaries. Primarily web admin UI.
*   **Security & Compliance:** Foundational architecture ensuring DPA compliance and security best practices across the stack (Supabase RLS, Backend Cloud Run Logic, App Encryption, Secure Infrastructure).

## 8. Key Success Metrics (Implied)

*   Increased user registration and engagement on both native and web platforms.
*   Improved ease and success rate of appointment booking.
*   Positive user feedback regarding usability, accessibility, and inclusivity across both platforms.
*   Demonstrable security posture and compliance with Philippines DPA.
*   High availability and performance of both frontend applications and backend services.
*   Measurable web traffic and discoverability for the `carepop-web` application's public pages.
*   Efficiency gains reported by FPOP administrative staff using potential admin features.