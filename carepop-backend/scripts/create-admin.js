#!/usr/bin/env node

// Simple wrapper script to run the TypeScript admin creation script
const { spawnSync } = require('child_process');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

// Run the TypeScript script with ts-node
const result = spawnSync('npx', ['ts-node', path.join(__dirname, 'create-admin-user.ts'), args[0], args[1]], {
  stdio: 'inherit',
  shell: true
});

// Exit with the same code as the child process
process.exit(result.status); 