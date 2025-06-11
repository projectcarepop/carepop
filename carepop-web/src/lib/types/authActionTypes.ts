// Basic types to satisfy the linter and improve safety.
// For a fully shared setup, consider a shared types package.
export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
} 