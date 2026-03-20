const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;

walkDir(path.join(__dirname, '../src'), (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Replace imports like: import { motion } from 'motion/react';
  // With: import { m } from 'motion/react';
  content = content.replace(/import\s*{([^}]*)\bmotion\b([^}]*)}\s*from\s*['"]motion\/react['"]/g, (match, p1, p2) => {
    return `import {${p1}m${p2}} from 'motion/react'`;
  });

  // Since we also have framer-motion if they had any leftover:
  content = content.replace(/import\s*{([^}]*)\bmotion\b([^}]*)}\s*from\s*['"]framer-motion['"]/g, (match, p1, p2) => {
    return `import {${p1}m${p2}} from 'framer-motion'`;
  });

  // Replace usage string: <motion.div to <m.div
  content = content.replace(/<motion\./g, '<m.');
  content = content.replace(/<\/motion\./g, '</m.');

  // Replace variable variants like motion(Component) or motion.div
  // Be careful with not replacing something like motionValue.
  content = content.replace(/\bmotion\(/g, 'm(');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedFiles++;
    console.log('Updated:', filePath);
  }
});

console.log(`Refactored ${modifiedFiles} files.`);
