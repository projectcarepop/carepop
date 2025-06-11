export interface SignUpData {
    email: string;
    password?: string;
}

export interface LoginData {
    email: string;
    password?: string;
}

export interface ResetPasswordData {
    token: string;
    password?: string;
} 