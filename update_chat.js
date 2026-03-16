const fs = require('fs');

let content = fs.readFileSync('webapp/src/app/chat/page.tsx', 'utf8');

// Add import
content = content.replace("import { useState, useEffect, useRef } from 'react';", "import { useState, useEffect, useRef } from 'react';\nimport { useChat } from 'ai/react';");

// Replace useState hooks with useChat
content = content.replace(
    "const [messages, setMessages] = useState<Message[]>([]);\n    const [input, setInput] = useState('');\n    const [loading, setLoading] = useState(false);",
    "// const [messages, setMessages] = useState<Message[]>([]);\n    // const [input, setInput] = useState('');\n    // const [loading, setLoading] = useState(false);\n    \n    const { messages, input, handleInputChange, handleSubmit, isLoading: loading, setMessages, setInput, append } = useChat({\n        api: '/api/chat',\n        body: {\n            agentId: activeAgentId,\n            customSystemPrompt: customSystemPrompt\n        }\n    });"
);

// We need to keep the "Message" type interface for ai/react, but rename our local interface to LocalMessage
content = content.replace("interface Message {", "interface LocalMessage {");
content = content.replace("const [messages, setMessages] = useState<Message[]>([]);", "const [messages, setMessages] = useState<LocalMessage[]>([]);");

fs.writeFileSync('webapp/src/app/chat/page.tsx', content);
