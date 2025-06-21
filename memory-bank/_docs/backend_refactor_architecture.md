# Backend Architecture: Modular Refactor

This document outlines the refactored backend architecture for the CarePoP project. The primary goal of this refactor is to move from a monolithic, tightly-coupled structure to a modular, scalable, and maintainable system.

## Core Principles

- **Modularity:** Each API resource (e.g., Clinics, Users) is encapsulated within its own module, with a clear distinction between `admin` and `public` scopes.
- **Separation of Concerns:** Logic is clearly separated into layers: Routing, Controllers, and Services.
- **Centralized Middleware:** Security and error handling are handled by a robust, reusable middleware stack.
- **Standardized Responses:** All API responses follow a consistent format for success and error states.

## Final Directory Structure

The new backend structure is organized under `carepop-backend/src/`:

```
carepop-backend/src/
├── config/
├── controllers/
│   ├── admin/
│   │   └── ... (admin controllers)
│   └── public/
│       ├── clinic.controller.ts
│       └── service.controller.ts
├── lib/
│   ├── middleware/
│   └── utils/
├── routes/
│   ├── admin/
│   │   ├── ... (admin routes)
│   │   └── index.ts  // <-- Main Admin Router
│   └── public/
│       ├── clinic.routes.ts
│       ├── service.routes.ts
│       └── index.ts  // <-- Main Public Router
├── services/
│   ├── admin/
│   │   └── ... (admin services)
│   └── public/
│       ├── clinic.service.ts
│       └── service.service.ts
├── types/
├── utils/
└── validation/
    └── admin/
        └── ... (admin validation schemas)
```

## Architectural Layers

This section describes the different layers of the API, from routing to business logic.

### API Entrypoints (`server.ts`)

The main Express server application in `server.ts` mounts two primary routers to define the API's entrypoints:

- **Public API:** Mounted at `/api/v1`. Open to the public for read-only operations; no authentication required.
- **Admin API:** Mounted at `/api/v1/admin`. Requires authentication and admin role privileges for CUD operations.

```typescript
// In carepop-backend/src/server.ts (simplified)
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

// ...
app.use('/api/v1', publicRoutes); // All public data routes
app.use('/api/v1/admin', adminRoutes); // All protected admin routes
// ...
```

### 1. Main Routers

#### Public Router (`routes/public/index.ts`)

The entry point for all public-facing routes. It simply groups and mounts all individual public resource routers. No global authentication middleware is applied here.

```typescript
import { Router } from 'express';
import clinicRoutes from './clinic.routes';
import serviceRoutes from './service.routes';

const publicRouter = Router();

publicRouter.use('/clinics', clinicRoutes);
publicRouter.use('/services', serviceRoutes);

export default publicRouter;
```

#### Admin Router (`routes/admin/index.ts`)

The entry point for all `/admin` routes. It applies global security middleware (`authMiddleware`, `authorize`) and mounts all the individual admin resource routers.

```typescript
// Example from routes/admin/index.ts
// ... (imports)
const adminRouter = Router();

adminRouter.use(authMiddleware as any);
adminRouter.use(authorize(['Admin', 'Super-Admin']) as any);

adminRouter.use('/clinics', adminClinicRoutes);
adminRouter.use('/services', adminServiceRoutes);
// ... etc.

export default adminRouter;
```

### 2. Resource Router (`routes/.../*.routes.ts`)
Defines the specific endpoints for a single resource within either the `public` or `admin` scope.

**Example Public Route (`routes/public/clinic.routes.ts`):**
```typescript
import { Router } from 'express';
import * as clinicPublicController from '@/controllers/public/clinic.controller';

const router = Router();

// Maps to: GET /api/v1/clinics
router.get('/', clinicPublicController.listPublicClinics);

export default router;
```

### 3. Controller (`controllers/.../*.controller.ts`)
Orchestrates the request-response cycle, calling the appropriate service and sending a standardized response. All methods are wrapped in `asyncHandler` for centralized error handling.

### 4. Service (`services/.../*.service.ts`)
Contains all business logic and data access, interacting directly with Supabase. Public services may include caching logic to improve performance for frequently accessed, non-sensitive data.

**Example `UserService` Logic:**
```typescript
// In src/services/public/userService.ts

/**
 * Finds a user's profile from the public.profiles table using their auth ID.
 * @param userId The user's UUID from the JWT ('sub' claim).
 * @returns The user profile object or null if not found.
 * @note Updated to correctly query the public.profiles table using the user's auth ID. This resolves a critical 404 bug that caused a redirect loop on the frontend.
 */
public async findProfileById(userId: string): Promise<any | null> {
    if (!userId) {
        throw new AppError('User ID must be provided to fetch a profile.', 400);
    }

    // We query the 'profiles' table and match the 'user_id' column with the user ID from the token.
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId) // <-- Note: uses 'user_id' based on our specific schema
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = "no rows found"
        console.error('Supabase error fetching profile:', error);
        throw new AppError('Failed to retrieve user profile from the database.', 500);
    }

    return data; // `data` is the profile object or null
}

### 5. Validation (`validation/admin/*.validation.ts`)
Defines `zod` schemas for request `body`, `params`, and `query` to be used by the `validateRequest` middleware. This layer is primarily used for the Admin API to ensure data integrity for write operations.

## Advanced Scenarios

### Nested Routes

For resources that are logically nested, such as a provider's association with a specific clinic, we use nested routers.

- **Parent Router (`clinic.routes.ts`):** Mounts the child router on a parameterized path.
  ```typescript
  // In carepop-backend/src/routes/admin/clinic.routes.ts
  import { Router } from 'express';
  import clinicProviderRoutes from './clinic-provider.routes';
  // ... other imports

  const router = Router();
  // ... other clinic routes

  // Mount the nested router
  router.use('/:clinicId/providers', clinicProviderRoutes);

  export default router;
  ```

- **Child Router (`clinic-provider.routes.ts`):** Is created with `mergeParams: true` to access parameters from the parent router (e.g., `:clinicId`).
  ```typescript
  // In carepop-backend/src/routes/admin/clinic-provider.routes.ts
  import { Router } from 'express';
  
  const router = Router({ mergeParams: true });
  
  // This route is now effectively /api/v1/admin/clinics/:clinicId/providers
  router.get('/', listProvidersForClinic); 
  
  // This route is now effectively /api/v1/admin/clinics/:clinicId/providers/:providerId
  router.delete('/:providerId', disassociateProvider);

  export default router;
  ```

### Handling Many-to-Many Relationships

To manage many-to-many relationships, such as between `providers` and `services`, we use a similar nested routing pattern but from two perspectives, handled by a single shared module.

1.  **Provider's Perspective (`provider-services.routes.ts`):** Manages the services for a *specific provider*. This router is mounted under `/providers/:id/services`.

    ```typescript
    // In carepop-backend/src/routes/admin/provider.routes.ts
    import providerServicesRoutes from './provider-services.routes';
    // ...
    router.use('/:id/services', providerServicesRoutes);
    ```

2.  **Service's Perspective (`service-providers.routes.ts`):** Manages the providers for a *specific service*. This router is mounted under `/services/:id/providers`.

    ```typescript
    // In carepop-backend/src/routes/admin/service.routes.ts
    import serviceProvidersRoutes from './service-providers.routes';
    // ...
    router.use('/:id/providers', serviceProvidersRoutes);
    ```

This approach creates a clean, intuitive, and RESTful API for managing complex relationships.

### File Uploads with Multer

For endpoints that accept file uploads, such as adding a medical record, we use `multer` as middleware directly in the resource's route definition.

```typescript
// In carepop-backend/src/routes/admin/medical-record.routes.ts
import { Router } from 'express';
import multer from 'multer';
import * as medicalRecordController from '@/controllers/admin/medical-record.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import { createMedicalRecordSchema } from '@/validation/admin/medical-record.validation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/user/:userId',
  upload.single('recordFile'), // Multer middleware to handle a single file upload from the 'recordFile' field
  validateRequest({
    params: createMedicalRecordSchema.shape.params,
    body: createMedicalRecordSchema.shape.body,
  }),
  medicalRecordController.createRecord
);

export default router;
```
The `createRecord` controller then accesses the file via `req.file`.

## Public Authentication Module (Adapter for Web & React Native Clients)

*This module was engineered to restore authentication for all our existing client platforms after the backend refactor. It functions as an "adapter" layer to ensure compatibility without requiring any changes to the frontend code.*

### File: `src/validation/public/authValidation.ts`
- **`signUpSchema`, `loginSchema`**: Zod schemas that precisely match the legacy data structures sent by our frontend clients for sign-up and login.

### File: `src/services/public/authService.ts`
- **`AuthService`**: A service built according to our new architecture that interfaces with Supabase Auth to handle core identity logic. It interfaces with Supabase Auth and enriches the user data by fetching their associated profile and RBAC role upon a successful login.

### File: `src/controllers/public/authController.ts`
- **`authController`**: **(Adapter Layer)** This controller's primary role is to translate legacy UI requests for the new `AuthService` and to transform the modern service responses back into the legacy JSON structure the clients expect. It transforms the modern service response (including the user's role) back into the legacy JSON structure that our clients expect. **Critically, it returns all tokens in the response body to support both our web and React Native clients.**

### File: `src/routes/public/authRoutes.ts`
- **`authRouter`**: Defines the API endpoints at the exact legacy paths our UIs are programmed to call, applying all standard middleware from our new architecture.

## Core Middleware (`lib/middleware/`)

- **`auth.middleware.ts`:** Updated to be fully Supabase-compatible and includes robust error handling to prevent 500 server errors from invalid tokens. It protects routes by verifying a Supabase JWT using the `SUPABASE_JWT_SECRET`. It catches verification errors (e.g., expired token, invalid signature) and returns a standard 401 Unauthorized response instead of crashing the server.
- **`role.middleware.ts`:** RBAC guard to check user roles.
- **`validate.middleware.ts`:** Validates requests against Zod schemas.
- **`error.middleware.ts`:** Global error handler for standardized error responses. 