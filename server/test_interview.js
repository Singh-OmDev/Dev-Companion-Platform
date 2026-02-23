require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const test = async () => {
    const topic = "frontend";
    const prompt = `You are a Senior Technical Mock Interviewer. The user is interviewing for the following role/topic: "${topic}".
        Generate the VERY FIRST technical interview question. 
        It should be moderately difficult, realistic, and open-ended.
        
        Return ONLY a JSON object (no markdown, no conversational text) with this exact schema:
        {
            "question": "The interview question text"
        }`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });
        let text = chatCompletion.choices[0]?.message?.content || "";
        console.log("Raw Response:");
        console.log(text);

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let data = JSON.parse(text);
        console.log("Parsed JSON:", data);
    } catch (e) {
        console.error("Error:", e);
    }
};

test();
