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
        const { payload, personality, ofuscation, contextualization, options } = requestBody;

        // Validación básica
        if (!payload) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Payload es requerido' })
            };
        }

        let result = payload;

        // Aplicar ofuscación si se seleccionó
        if (ofuscation && ofuscation !== 'none') {
            switch (ofuscation) {
                case 'base64':
                    result = Buffer.from(result).toString('base64');
                    break;
                case 'leet':
                    result = result
                        .replace(/a/gi, '4')
                        .replace(/e/gi, '3')
                        .replace(/i/gi, '1')
                        .replace(/o/gi, '0')
                        .replace(/s/gi, '5')
                        .replace(/t/gi, '7')
                        .replace(/g/gi, '9')
                        .replace(/b/gi, '8');
                    break;
            }
        }

        // Aplicar contextualización si se seleccionó
        if (contextualization && contextualization !== 'none') {
            switch (contextualization) {
                case 'role_assignment':
                    try {
                        const groqResponse = await callGroqAPI({
                            systemPrompt: 'Eres un motor de generación de prompts. Tu tarea es crear un escenario de rol para que un LLM interprete una consulta. La personalidad del rol es fundamental. La respuesta debe ser únicamente el prompt final, sin preámbulos.',
                            userPrompt: `La consulta a contextualizar es "${result}". La personalidad que debe adoptar el LLM es "${personality}". Genera un prompt de rol que combine la consulta con la personalidad de manera efectiva.`
                        });
                        result = groqResponse;
                    } catch (error) {
                        return {
                            statusCode: 500,
                            body: JSON.stringify({ error: 'Error al llamar a la API de Groq para asignación de rol' })
                        };
                    }
                    break;

                case 'structured_config':
                    const format = options?.format || 'json';
                    try {
                        const groqResponse = await callGroqAPI({
                            systemPrompt: `Eres un generador de configuraciones de datos estructurados. Tu tarea es tomar una consulta de usuario y una personalidad, y envolverlas en una estructura de configuración en el formato especificado. La estructura debe definir un escenario y reglas. La personalidad proporcionada debe usarse como el nombre o la descripción del rol/personaje dentro de la configuración. La consulta del usuario debe insertarse en el campo 'query'. El formato de salida debe ser ${format} válido y completo.`,
                            userPrompt: `La consulta es "${result}". La personalidad es "${personality}". El formato de salida requerido es ${format}. Genera la configuración completa.`
                        });
                        result = groqResponse;
                    } catch (error) {
                        console.error('Error detallado en structured_config:', error);
                        return {
                            statusCode: 500,
                            body: JSON.stringify({ 
                                error: 'Error al llamar a la API de Groq para configuración estructurada',
                                details: error.message,
                                format: format,
                                personality: personality
                            })
                        };
                    }
                    break;ación estructurada' })
                        };
                    }
                    break;
            }
        }

        // Respuesta exitosa
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: result })
        };

    } catch (error) {
        console.error('Error en generate.js:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
};

// Función auxiliar para llamar a la API de Groq
async function callGroqAPI({ systemPrompt, userPrompt }) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY no está configurada en las variables de entorno');
        throw new Error('GROQ_API_KEY no configurada');
    }

    console.log('Llamando a Groq API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Groq API error: ${response.status}`, errorBody);
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
