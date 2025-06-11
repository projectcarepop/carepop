import { registerUserService, loginUserService } from '../authService';
import { supabase } from '../../config/supabaseClient'; // Import the actual client

// Mock the Supabase client module
jest.mock('../../config/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));

// Define types for the mocked functions
const mockSignUp = supabase.auth.signUp as jest.Mock;
const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;

describe('registerUserService', () => {
  beforeEach(() => {
    // Clear mock history and reset implementation before each test
    mockSignUp.mockClear();
    mockSignUp.mockReset();
  });

  it('should register a user successfully', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    const mockUser = { id: 'user-123', email: userData.email };
    mockSignUp.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

    const result = await registerUserService(userData);

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({ email: userData.email, password: userData.password });
    expect(result).toEqual({
      success: true,
      user: mockUser,
      message: 'User registered successfully. Please check your email for verification.',
    });
  });

  it('should throw an error if email is missing', async () => {
    const userData = { password: 'password123' };
    
    // Use try/catch for async functions or expect().rejects for promises
    await expect(registerUserService(userData)).rejects.toThrow('Email and password are required.');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should throw an error if password is missing', async () => {
    const userData = { email: 'test@example.com' };

    await expect(registerUserService(userData)).rejects.toThrow('Email and password are required.');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should return an error if Supabase signUp fails', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    const mockError = { message: 'User already registered', status: 400 }; // Example error
    mockSignUp.mockResolvedValueOnce({ data: { user: null }, error: mockError });

    const result = await registerUserService(userData);

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: mockError,
      message: mockError.message,
    });
  });

  it('should return an error if Supabase returns no user and no error', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    mockSignUp.mockResolvedValueOnce({ data: { user: null }, error: null }); // Unlikely case

    const result = await registerUserService(userData);

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: 'User registration failed for an unknown reason.',
    });
  });
});

describe('loginUserService', () => {
  beforeEach(() => {
    // Clear mock history and reset implementation before each test
    mockSignIn.mockClear();
    mockSignIn.mockReset();
  });

  it('should log in a user successfully', async () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    const mockUser = { id: 'user-123', email: loginData.email };
    const mockSession = { access_token: 'fake-jwt', user: mockUser }; // Example session
    mockSignIn.mockResolvedValueOnce({ data: { user: mockUser, session: mockSession }, error: null });

    const result = await loginUserService(loginData);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith({ email: loginData.email, password: loginData.password });
    expect(result).toEqual({
      success: true,
      user: mockUser,
      session: mockSession,
      message: 'User logged in successfully.',
    });
  });

   it('should throw an error if email is missing', async () => {
    const loginData = { password: 'password123' };
    
    await expect(loginUserService(loginData)).rejects.toThrow('Email and password are required.');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should throw an error if password is missing', async () => {
    const loginData = { email: 'test@example.com' };

    await expect(loginUserService(loginData)).rejects.toThrow('Email and password are required.');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('should return an error if Supabase signIn fails', async () => {
    const loginData = { email: 'test@example.com', password: 'wrongpassword' };
    const mockError = { message: 'Invalid login credentials', status: 400 };
    mockSignIn.mockResolvedValueOnce({ data: { user: null, session: null }, error: mockError });

    const result = await loginUserService(loginData);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: mockError,
      message: mockError.message,
    });
  });

  it('should return an error if Supabase returns no session/user and no error', async () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    mockSignIn.mockResolvedValueOnce({ data: { user: null, session: null }, error: null }); // Unlikely case

    const result = await loginUserService(loginData);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: 'Login failed for an unknown reason.',
    });
  });
}); 