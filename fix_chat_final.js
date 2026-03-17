const fs = require('fs');
let content = fs.readFileSync('webapp/src/app/chat/page.tsx', 'utf8');

// Restore input and loading states
content = content.replace(
    /\/\/ const \[input, setInput\] = useState\(''\);/g,
    "const [input, setInput] = useState('');"
);

// Simplify useChat to only get what we need and avoid type errors
content = content.replace(
    /const \{ messages, input, handleInputChange, handleSubmit, isLoading: loading, setMessages, setInput, append \} = useChat\(\{/g,
    "const { messages, append, isLoading: loading, setMessages } = useChat({"
);

// Fix the sendMessage function to use append
const newSendMessage = `async function sendMessage(e?: any) {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        const currentInput = input;
        setInput('');
        
        append({
            role: 'user',
            content: currentInput
        });
    }`;

// Replace the existing sendMessage function
const sendMessageRegex = /async function sendMessage\(e\?: any\) \{[\s\S]*?handleSubmit\(e\);\s*\}/;
content = content.replace(sendMessageRegex, newSendMessage);

// Fix the input change handler back to setInput
content = content.replace(/onChange=\{handleInputChange\}/g, "onChange={(e) => setInput(e.target.value)}");

fs.writeFileSync('webapp/src/app/chat/page.tsx', content);
