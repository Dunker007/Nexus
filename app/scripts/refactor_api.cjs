const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = path.join(__dirname, '../src');

walkDir(srcDir, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace single quote strings
        if (content.match(/fetch\('(\/api\/[^']+)'/)) {
            content = content.replace(/fetch\('(\/api\/[^']+)'/g, "fetch(`${import.meta.env.VITE_API_URL || ''}$1`");
            modified = true;
        }
        
        // Replace template literals
        if (content.match(/fetch\(`(\/api\/[^`]+)`/)) {
            content = content.replace(/fetch\(`(\/api\/[^`]+)`/g, "fetch(`${import.meta.env.VITE_API_URL || ''}$1`");
            modified = true;
        }
        
        // Handle LUXRIG bridge
        if (content.includes("= '/api';") && content.includes("LUXRIG")) {
            content = content.replace(/= '\/api';/g, "= import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';");
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated', filePath);
        }
    }
});
