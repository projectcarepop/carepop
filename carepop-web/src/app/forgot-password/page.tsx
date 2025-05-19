'use client';

import React from 'react';

const ForgotPasswordPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-pink-600">Forgot Password</h1>
      </header>
      <main>
        <section className="mb-8 p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Reset Your Password</h2>
          <p className="text-gray-600 mb-6 text-center">
            Enter your email address below and we&apos;ll send you a link to reset your password.
          </p>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" id="email-forgot" name="email" autoComplete="email" required 
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
            </div>
            <div>
              <button type="submit" 
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                Send Password Reset Link
              </button>
            </div>
          </form>
        </section>
      </main>
      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} CarePop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage; 