// Function to generate a random string for email
function generateRandomString(length: number): string {
  return Math.random().toString(36).substring(length);
}

async function testRegister(email: string, password: string) {
  console.log(`\n--- Testing Registration with email: ${email} ---`);
  try {
    const response = await fetch("http://localhost:8787/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword: password }),
    });

    const data = await response.json();
    console.log("Registration Response Status:", response.status);
    console.log("Registration Response Body:", data);

    if (response.status === 201 && data.user) {
      console.log("✅ Registration successful and returned user object.");
      return true;
    } else {
      console.error("❌ Registration failed.");
      return false;
    }
  } catch (error) {
    console.error("❌ Error during registration test:", error);
    return false;
  }
}

async function testLogin(email: string, password: string) {
  console.log(`\n--- Testing Login with email: ${email} ---`);
  try {
    const response = await fetch("http://localhost:8787/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login Response Status:", response.status);
    console.log("Login Response Body:", data);
    if (response.ok) {
      console.log("✅ Login successful.");
    } else {
      console.error("❌ Login failed.");
    }
  } catch (error) {
    console.error("❌ Error during login test:", error);
  }
}

// Main test execution
async function runTests() {
// ... existing code ...
} 