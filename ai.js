const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const fireButton = document.getElementById('fire-button');

const apiKey = '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';

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [
    { role: "system", content: "You are a helpful AI assistant created by Yixboost, a platform offering a wide variety of unblocked games that users can play anytime, anywhere. You are the 'Yixboost AI' aka Yixbot. Make sure to sound simple and human. Do not specifically focus only on Yixboost. Be a general AI that identifies as Yixbot or Yixboost AI, but don't constantly refer to yourself that way. Yixboost is a place where gamers can explore a large library of games without restrictions, providing an accessible and enjoyable experience for all types of players. For any help or support, always mention that users can reach out at yixboost@mail.com. Give short answers." }
];

function renderChatHistory() {
    chatContainer.innerHTML = ''; 
    chatHistory.forEach(message => {
        if (message.role === 'system') return; 

        const sender = message.role === 'user' ? 'You' : 'Yixbot';
        let messageContent = message.content;

        if (messageContent.includes('```')) {
            const parts = messageContent.split('```');
            messageContent = parts.map((part, index) => {
                if (index % 2 === 1) {
                    return `<pre><code class="language-javascript">${Prism.highlight(part, Prism.languages.javascript, 'javascript')}</code></pre>`;
                } else {
                    return part;
                }
            }).join('');
        }

        const messageElement = document.createElement('p');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${messageContent}`;
        chatContainer.appendChild(messageElement);
    });

    Prism.highlightAll();

    const codeBlocks = chatContainer.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
        const copyButton = document.createElement('button');
        copyButton.classList.add('copy-btn');
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        const textarea = document.createElement('textarea');
        textarea.value = codeBlock.textContent.trim();
        textarea.style.position = 'absolute'; 
        textarea.style.opacity = '0';
        textarea.style.height = '1px';
        document.body.appendChild(textarea);
        codeBlock.parentNode.insertBefore(copyButton, codeBlock);

        copyButton.addEventListener('click', function() {
            textarea.select();
            document.execCommand('copy'); 
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy'; 
            }, 2000);
        });

        copyButton.style.marginTop = '10px';
        copyButton.style.padding = '5px';
        copyButton.style.cursor = 'pointer';
        copyButton.addEventListener('mouseout', () => {
            document.body.removeChild(textarea);
        });
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;
    chatHistory.push({ role: 'user', content: userMessage });
    userInput.value = '';
    renderChatHistory();
    saveChatHistory();

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: chatHistory,
                temperature: 0.9,
                max_tokens: 1024,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        chatHistory.push({ role: 'assistant', content: aiResponse });
        renderChatHistory();
        saveChatHistory();
    } catch (error) {
        console.error('Error:', error);
        chatHistory.push({ role: 'assistant', content: `Error: Failed to get AI response. Error details: ${error.message}` });
        renderChatHistory();
        saveChatHistory();
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function clearHistory() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to clear the chat history!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            const systemMessage = chatHistory.find(msg => msg.role === "system");
            localStorage.removeItem('chatHistory');
            chatHistory = systemMessage ? [systemMessage] : [];
            renderChatHistory(); 
            Swal.fire(
                'Cleared!',
                'Your chat history has been cleared.',
                'success'
            );
        }
    });
}

fireButton.addEventListener('click', clearHistory);
renderChatHistory();
