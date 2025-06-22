import { describe, it, expect } from '@jest/globals';

describe('Profiles Module', () => {
    it('should have tests', () => {
        expect(true).toBe(true);
    });
});

const BASE_URL = 'http://localhost:3000/api/v1/profiles';

async function testProfileApiCall({
  method,
  token,
  body,
  expectedStatus,
  testName,
}: {
  method: 'GET' | 'PUT';
  token: string;
  body?: any;
  expectedStatus: number;
  testName: string;
}) {
  console.log(`\n--- Testing: ${testName} ---`);
  
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}/me`, options);
  const data = await response.json();

  console.log(`Status: ${response.status}`);
  console.log('Response:', data);

  if (response.status !== expectedStatus) {
    throw new Error(`Test failed: ${testName}. Expected ${expectedStatus}, got ${response.status}`);
  }
  
  console.log(`✅ PASSED: Received expected status ${expectedStatus}.`);
  return data;
}


export async function runProfileTests(token: string) {
    console.log('\n\n--- STARTING PROFILE TESTS ---');
    
    // 1. Get initial profile
    const initialProfile = await testProfileApiCall({
        method: 'GET',
        token,
        expectedStatus: 200,
        testName: 'Get User Profile',
    });

    if (!initialProfile || !initialProfile.id) {
        throw new Error('Initial profile fetch failed to return a valid profile.');
    }

    // 2. Update the profile
    const newFirstName = `Testy-${Date.now()}`;
    const updatedProfile = await testProfileApiCall({
        method: 'PUT',
        token,
        body: { first_name: newFirstName },
        expectedStatus: 200,
        testName: 'Update User Profile',
    });

    if (updatedProfile.first_name !== newFirstName) {
        throw new Error('Update profile test failed. First name was not updated correctly.');
    }
    console.log('✅ PASSED: Profile first_name updated correctly.');

    // 3. Get the profile again to verify the update
    const finalProfile = await testProfileApiCall({
        method: 'GET',
        token,
        expectedStatus: 200,
        testName: 'Verify Profile Update',
    });

    if (finalProfile.first_name !== newFirstName) {
        throw new Error('Verify profile update test failed. The change was not persisted.');
    }
    console.log('✅ PASSED: Profile update was persisted correctly.');
    
    console.log('\n--- ALL PROFILE TESTS PASSED ---');
} 