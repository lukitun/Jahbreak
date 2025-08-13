const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_LINK, process.env.SUPABASE_SERVICE_KEY);

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

    const { error } = await supabase
      .from('feedback_logs')
      .insert([entry]);
    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Failed to store feedback:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to store feedback' })
    };
  }
};
