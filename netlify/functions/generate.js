const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Parsear el body de la petición
        const requestBody = JSON.parse(event.body);
        const { payload, personality, technique, options } = requestBody;

        // Validación básica
        if (!payload || !technique) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Payload y technique son requeridos' })
            };
        }

        let prompt = '';

        // Switch basado en la técnica
        switch (technique) {
            case 'base64':
                // Transformación simple: Base64
                prompt = Buffer.from(payload).toString('base64');
                break;

            case 'leet':
                // Transformación simple: Leet Speak
                prompt = payload
                    .replace(/a/gi, '4')
                    .replace(/e/gi, '3')
                    .replace(/i/gi, '1')
                    .replace(/o/gi, '0')
                    .replace(/s/gi, '5')
                    .replace(/t/gi, '7')
                    .replace(/g/gi, '9')
                    .replace(/b/gi, '8');
                break;

            case 'role_assignment':
                // Llamada a la API de Groq
                try {
                    const groqResponse = await callGroqAPI({
                        systemPrompt: 'Eres un motor de generación de prompts. Tu tarea es crear un escenario de rol para que un LLM interprete una consulta. La personalidad del rol es fundamental. La respuesta debe ser únicamente el prompt final, sin preámbulos.',
                        userPrompt: `La consulta a contextualizar es "${payload}". La personalidad que debe adoptar el LLM es "${personality}". Genera un prompt de rol que combine la consulta con la personalidad de manera efectiva.`
                    });
                    prompt = groqResponse;
                } catch (error) {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Error al llamar a la API de Groq' })
                    };
                }
                break;

            case 'structured_config':
                // Extraer formato
                const format = options?.format || 'json';
                
                // Llamada a la API de Groq
                try {
                    const groqResponse = await callGroqAPI({
                        systemPrompt: `Eres un generador de configuraciones de datos estructurados. Tu tarea es tomar una consulta de usuario y una personalidad, y envolverlas en una estructura de configuración en el formato especificado. La estructura debe definir un escenario y reglas. La personalidad proporcionada debe usarse como el nombre o la descripción del rol/personaje dentro de la configuración. La consulta del usuario debe insertarse en el campo 'query'. El formato de salida debe ser ${format} válido y completo.`,
                        userPrompt: `La consulta es "${payload}". La personalidad es "${personality}". El formato de salida requerido es ${format}. Genera la configuración completa.`
                    });
                    prompt = groqResponse;
                } catch (error) {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Error al llamar a la API de Groq' })
                    };
                }
                break;

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Técnica no válida' })
                };
        }

        // Respuesta exitosa
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno del servidor' })
        };
    }
};

// Función auxiliar para llamar a la API de Groq
async function callGroqAPI({ systemPrompt, userPrompt }) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY no configurada');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
