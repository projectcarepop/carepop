// This is the main test runner file. It orchestrates all other test suites.
import { runProfileTests } from '../profiles/profiles.test';

const BASE_URL = 'http://localhost:3000/api/v1/auth';

async function testAuthApiCall({
  endpoint,
  email,
  password,
  confirmPassword,
  expectedStatus,
  testName,
}: {
  endpoint: 'register' | 'login';
  email: string;
  password?: string;
  confirmPassword?: string;
  expectedStatus: number;
  testName: string;
}) {
  console.log(`\n--- Testing: ${testName} (${email}) ---`);
  const body: any = { email };
  if (password) body.password = password;
  if (confirmPassword) body.confirmPassword = confirmPassword;

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  
  if (response.status !== expectedStatus) {
    console.log('Response:', data);
    console.log(`❌ FAILED: Expected status ${expectedStatus} but got ${response.status}.`);
    throw new Error(`Test failed: ${testName}`);
  }
  
  console.log(`✅ PASSED: Received expected status ${expectedStatus}.`);
  return data;
}

async function runAuthTests() {
  console.log('--- STARTING AUTHENTICATION TESTS ---');
  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const validPassword = 'password123';
  const invalidPassword = 'wrong-password';
  const nonExistentEmail = `ghost-${Date.now()}@example.com`;

    // --- Success Cases ---
    await testAuthApiCall({
      endpoint: 'register',
      email: uniqueEmail,
      password: validPassword,
      confirmPassword: validPassword,
      expectedStatus: 201,
      testName: 'Successful Registration',
    });

    const loginSuccessData = await testAuthApiCall({
      endpoint: 'login',
      email: uniqueEmail,
      password: validPassword,
      expectedStatus: 200,
      testName: 'Successful Login',
    });

    // --- Failure Cases ---
    await testAuthApiCall({
      endpoint: 'register',
      email: uniqueEmail, // Use the same email again
      password: validPassword,
      confirmPassword: validPassword,
      expectedStatus: 400,
      testName: 'Registration with Duplicate Email',
    });

    await testAuthApiCall({
      endpoint: 'login',
      email: uniqueEmail,
      password: invalidPassword, // Use the wrong password
      expectedStatus: 401,
      testName: 'Login with Incorrect Password',
    });

    await testAuthApiCall({
        endpoint: 'login',
        email: nonExistentEmail, // Use an unregistered email
        password: validPassword,
        expectedStatus: 401,
        testName: 'Login with Non-Existent User',
      });

    console.log('\n--- ALL AUTHENTICATION TESTS PASSED ---');
    
    // Return the access token for the next suite of tests
    if (!loginSuccessData?.session?.access_token) {
        throw new Error('Login test did not return an access token.');
    }
    return loginSuccessData.session.access_token;
}

async function runAllTests() {
    try {
        const accessToken = await runAuthTests();
        await runProfileTests(accessToken);

        console.log('\n\n===================================');
        console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY');
        console.log('===================================\n');

    } catch (error) {
        console.error('\n\n==========================');
        console.error('❌ A TEST SUITE FAILED');
        console.error('==========================\n');
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('An unknown error occurred:', error);
        }
        process.exit(1); // Exit with error code
    }
}

runAllTests(); 