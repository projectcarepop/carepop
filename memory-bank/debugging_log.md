## Debugging Log: User Signup Failures

**Date:** 2025-06-15

**Issue:** Users were unable to register, receiving a `400 Bad Request` from the backend, with frontend logs showing an empty error object `{}` which later changed to `{message: 'User not allowed'}`.

### Summary of Investigation

The root cause was a multi-layered issue involving incorrect backend validation logic and, ultimately, a configuration issue within the Supabase project's authentication settings.

### Path to Resolution:

1.  **Initial Misdiagnosis:** Initially suspected Supabase configuration (domain whitelisting) and client-side password validation. These were incorrect.
2.  **CORS & Routing:** Investigated a potential CORS or routing issue. The `server.ts` file was missing the route for `/api/v1/public/auth`. This was corrected, but the error persisted.
3.  **Validation Middleware Fix:** Discovered a critical flaw in the `validate` middleware and the associated Zod schemas. The schemas expected a `body` object that was being incorrectly wrapped, causing a silent validation failure and the empty `{}` error response.
    *   **Action:** Removed the `.body` wrapper from all schemas in `auth.validation.ts`.
    *   **Action:** Simplified the `validate.ts` middleware to only parse `req.body`.
4.  **Type Definition Fix:** The previous fix broke the TypeScript build because the type definitions in `auth.service.ts` still referenced the old `.body` property.
    *   **Action:** Corrected the `SignUpInput` and `ResetPasswordInput` types in `auth.service.ts`.
5.  **Final Root Cause Identification:** After all code fixes, the backend correctly propagated the true error from Supabase: `{message: 'User not allowed'}`. This error originates directly from the `supabase.auth.admin.createUser` call when Supabase itself rejects the user.
6.  **Isolation Test:** The final step was to isolate the cause of the Supabase rejection. We temporarily set `email_confirm: false` in `auth.service.ts`. A successful signup with this change proves the issue is with Supabase's email-sending capabilities (likely rate-limiting on the default provider), not a direct user block.

### Key Learnings:

*   An empty error object `{}` from the backend often points to a pre-logic failure, such as routing or validation middleware, not the business logic itself.
*   The Supabase error `User not allowed` can be misleading. In the context of user creation with email confirmation, it often means "I am unable to send the required confirmation email."
*   Always check build logs in the CI/CD pipeline, as they can reveal compilation errors that are not present locally. 