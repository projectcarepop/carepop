export type TApiSuccess<T> = {
    success: true;
    data: T;
};

export type TApiError = {
    success: false;
    error: {
        message: string;
        details?: unknown;
    };
}; 