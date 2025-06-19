const fs = require('fs');
const path = require('path');

// This script fixes invalid module import paths in the backend codebase.
// Vercel's serverless environment does not support TypeScript path aliases like '@/',
// causing "Cannot find module" errors. This script replaces all aliases
// with the correct relative paths, ensuring the application can run.

const projectRoot = path.join(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Regex to find imports like: from '@/lib/utils/appError'
    const importRegex = /from\s+['"]@\/(.*?)['"]/g;

    content = content.replace(importRegex, (match, importPath) => {
        const fullImportPath = path.join(srcRoot, importPath);
        const fileDir = path.dirname(filePath);
        let relativePath = path.relative(fileDir, fullImportPath);

        // Format for module imports
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        // Replace backslashes for cross-platform compatibility
        relativePath = relativePath.replace(/\\/g, '/');
        
        console.log(`  - Replacing '@/${importPath}' with '${relativePath}'`);
        return `from '${relativePath}'`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true; // Indicates a change was made
    }
    return false;
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    let changesMade = false;

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (traverseDir(fullPath)) {
                changesMade = true;
            }
        } else if (fullPath.endsWith('.ts')) {
            console.log(`Processing ${fullPath}...`);
            if (fixImportsInFile(fullPath)) {
                changesMade = true;
            }
        }
    });

    return changesMade;
}

console.log('Starting import path fixup...');
const hadChanges = traverseDir(srcRoot);
if (!hadChanges) {
    console.log('No files needed fixing.');
} else {
    console.log('Finished fixing import paths.');
} 