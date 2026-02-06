const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config(); // Add this line

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('✅ OpenAI API configured successfully');

// System prompt for the AI
const SYSTEM_PROMPT = `You are an expert Coding Interview Assistant specialized in Data Structures and Algorithms.

When answering questions, ALWAYS follow this format:

1. **Explanation**: Provide a clear, concise explanation of the concept
2. **Code Example**: Provide clean, well-commented code (default to Python unless specified)
3. **Time Complexity**: Analyze time complexity with explanation
4. **Space Complexity**: Analyze space complexity with explanation
5. **Interview Tips**: Add helpful tips for interviews

For coding problems:
- Provide multiple approaches (brute force → optimized)
- Explain the thought process
- Add edge cases to consider

For debugging:
- Identify the issue
- Explain why it's wrong
- Provide corrected code

Be concise but thorough. Use code blocks with proper syntax highlighting.`;

router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const botResponse = completion.choices[0].message.content;

    res.json({
      response: botResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message 
    });
  }
});

// Mock interview endpoint
router.post('/mock-interview', async (req, res) => {
  try {
    const { difficulty = 'medium', topic = 'general' } = req.body;

    const mockPrompt = `Generate a coding interview question with the following:
- Difficulty: ${difficulty}
- Topic: ${topic}
- Include: Problem statement, examples, constraints, and follow-up questions
Format it as an interviewer would ask.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: mockPrompt }
      ],
      temperature: 0.8,
    });

    res.json({
      question: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate interview question' });
  }
});

// Complexity analyzer endpoint
router.post('/analyze-complexity', async (req, res) => {
  try {
    const { code, language = 'python' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const analysisPrompt = `Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Time Complexity with explanation
2. Space Complexity with explanation
3. Optimization suggestions (if any)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.5,
    });

    res.json({
      analysis: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze complexity' });
  }
});

module.exports = router;