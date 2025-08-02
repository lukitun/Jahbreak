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
