const fs = require('fs');
let content = fs.readFileSync('webapp/src/app/chat/page.tsx', 'utf8');

const regex = /async function sendMessage\(\) \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\}/;

const newFunc = `async function sendMessage(e?: any) {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        handleSubmit(e);
    }`;

content = content.replace(regex, newFunc);
fs.writeFileSync('webapp/src/app/chat/page.tsx', content);
