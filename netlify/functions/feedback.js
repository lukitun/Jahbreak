
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



    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to store feedback' })
    };
  }
};
