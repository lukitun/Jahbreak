<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jahbreak - Advanced Prompt Engineering</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            flex: 1;
        }

        header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #2a2a2a;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        h1 {
            font-size: 3rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: #888;
            font-size: 1.1rem;
        }

        .github-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 6px;
            text-decoration: none;
            color: #e0e0e0;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .github-link:hover {
            background: #252525;
            border-color: #667eea;
        }

        .github-icon {
            width: 20px;
            height: 20px;
        }

        .input-section {
            margin-bottom: 2rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #b4b4b4;
            font-weight: 500;
        }

        textarea {
            width: 100%;
            min-height: 120px;
            padding: 1rem;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            color: #e0e0e0;
            font-family: inherit;
            font-size: 1rem;
            resize: vertical;
            transition: border-color 0.3s ease;
        }

        textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        input[type="text"] {
            width: 100%;
            padding: 0.75rem 1rem;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            color: #e0e0e0;
            font-family: inherit;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }

        .option-group {
            background: #1a1a1a;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #2a2a2a;
            margin-bottom: 1.5rem;
        }

        .option-group h3 {
            margin-bottom: 1rem;
            color: #667eea;
            font-size: 1.1rem;
        }

        select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 6px;
            color: #e0e0e0;
            font-family: inherit;
            font-size: 0.95rem;
            cursor: pointer;
            transition: border-color 0.3s ease;
        }

        select:focus {
            outline: none;
            border-color: #667eea;
        }

        button {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 2rem;
        }

        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .output-section {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .output-header h3 {
            color: #667eea;
        }

        .copy-button {
            padding: 0.5rem 1rem;
            background: #2a2a2a;
            border: 1px solid #333;
            border-radius: 6px;
            color: #e0e0e0;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .copy-button:hover {
            background: #333;
            border-color: #667eea;
        }

        .output-content {
            background: #0f0f0f;
            border-radius: 6px;
            padding: 1rem;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            word-break: break-all;
            max-height: 400px;
            overflow-y: auto;
        }

        footer {
            background: #0f0f0f;
            border-top: 1px solid #2a2a2a;
            padding: 1.5rem 0;
            text-align: center;
            margin-top: auto;
        }

        .footer-content {
            color: #888;
            font-size: 0.9rem;
        }

        .footer-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .footer-link:hover {
            color: #764ba2;
            text-decoration: underline;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 2rem;
            color: #667eea;
        }

        .loading.active {
            display: block;
        }

        .error {
            background: #2a1a1a;
            border: 1px solid #ff4444;
            color: #ff6666;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            display: none;
        }

        .error.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-top">
                <div>
                    <h1>Jahbreak</h1>
                    <p class="subtitle">Advanced Prompt Engineering Tool</p>
                </div>
                <a href="https://github.com/lukitun/Jahbreak" target="_blank" rel="noopener noreferrer" class="github-link">
                    <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </a>
            </div>
        </header>

        <main>
            <div class="input-section">
                <label for="payload">Enter your query:</label>
                <textarea id="payload" placeholder="Enter your prompt or query here..."></textarea>
            </div>

            <div class="input-section">
                <label for="personality">Personality/Role (optional):</label>
                <input type="text" id="personality" placeholder="Leave blank for auto-detection">
            </div>

            <div class="option-group">
                <h3>Obfuscation</h3>
                <select id="obfuscation">
                    <option value="none">None</option>
                    <option value="base64">Base64</option>
                    <option value="leet">Leet Speak</option>
                    <option value="rot13">ROT13</option>
                    <option value="reverse">Reverse</option>
                    <option value="unicode">Unicode</option>
                </select>
            </div>

            <button id="generateBtn" onclick="generatePrompt()">Generate Prompt</button>

            <div class="error" id="error"></div>
            <div class="loading" id="loading">Generating prompt...</div>

            <div class="output-section" id="outputSection" style="display: none;">
                <div class="output-header">
                    <h3>Generated Prompt</h3>
                    <button class="copy-button" onclick="copyToClipboard()">Copy</button>
                </div>
                <div class="output-content" id="output"></div>
            </div>
        </main>
    </div>

    <footer>
        <div class="footer-content">
            Built and made by <a href="https://lukitun.xyz" target="_blank" rel="noopener noreferrer" class="footer-link">lukitun</a>
        </div>
    </footer>

    <script>
        async function generatePrompt() {
            const payload = document.getElementById('payload').value;
            const personality = document.getElementById('personality').value;
            const obfuscation = document.getElementById('obfuscation').value;
            
            if (!payload.trim()) {
                showError('Please enter a query');
                return;
            }

            const generateBtn = document.getElementById('generateBtn');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const outputSection = document.getElementById('outputSection');
            
            generateBtn.disabled = true;
            loading.classList.add('active');
            error.classList.remove('active');
            outputSection.style.display = 'none';

            try {
                const response = await fetch('/.netlify/functions/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        payload,
                        personality,
                        ofuscation: obfuscation,
                        contextualization: 'structured_config',
                        options: {
                            format: 'xml'
                        }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to generate prompt');
                }

                displayOutput(data);
            } catch (err) {
                showError(err.message);
            } finally {
                generateBtn.disabled = false;
                loading.classList.remove('active');
            }
        }

        function displayOutput(data) {
            const outputSection = document.getElementById('outputSection');
            const output = document.getElementById('output');
            
            output.textContent = data.prompt;
            outputSection.style.display = 'block';
        }

        function showError(message) {
            const error = document.getElementById('error');
            error.textContent = message;
            error.classList.add('active');
            setTimeout(() => {
                error.classList.remove('active');
            }, 5000);
        }

        function copyToClipboard() {
            const output = document.getElementById('output').textContent;
            navigator.clipboard.writeText(output).then(() => {
                const copyBtn = document.querySelector('.copy-button');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }).catch(() => {
                showError('Failed to copy to clipboard');
            });
        }

        // Handle Enter key in textarea
        document.getElementById('payload').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                generatePrompt();
            }
        });
    </script>
</body>
</html>
