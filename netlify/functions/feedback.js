const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { payload, prompt, feedback } = JSON.parse(event.body);
    const entry = {
      timestamp: new Date().toISOString(),
      payload,
      prompt,
      feedback
    };

    const dataDir = path.join(__dirname, '..', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    const filePath = path.join(dataDir, 'feedback.json');
    let logs = [];
    if (fs.existsSync(filePath)) {
      logs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    logs.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Failed to write feedback log:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to store feedback' })
    };
  }
};
