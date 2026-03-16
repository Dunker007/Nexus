const fs = require('fs');
let content = fs.readFileSync('webapp/src/app/chat/page.tsx', 'utf8');

// Replace sendMessage implementation
const regex = /async function sendMessage\(\) \{([\s\S]*?)catch \(error: any\) \{([\s\S]*?)finally \{([\s\S]*?)\}\n    \}/m;
content = content.replace(regex, `async function sendMessage(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        // Just let useChat handle the submission to the Gemini endpoint
        handleSubmit(e);
    }`);
fs.writeFileSync('webapp/src/app/chat/page.tsx', content);
