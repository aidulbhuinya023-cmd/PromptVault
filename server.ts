import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required user-agent
const getAiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Endpoint: Run Prompt Playground with Gemini 3.1 Pro Thinking Mode
 * Implements ThinkingLevel.HIGH and does NOT set maxOutputTokens.
 */
app.post('/api/ai/test-prompt', async (req, res) => {
  try {
    const { promptText, variables = {}, systemInstruction = '', model = 'gemini-3.1-pro-preview' } = req.body;

    if (!promptText) {
      return res.status(400).json({ error: 'promptText is required' });
    }

    // Replace {{variable}} with provided values
    let compiledPrompt = promptText;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiledPrompt = compiledPrompt.replace(regex, String(value || ''));
    }

    const ai = getAiClient();
    const startTime = Date.now();

    // Call gemini-3.1-pro-preview with thinkingLevel HIGH
    const config: any = {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: compiledPrompt,
      config,
    });

    const durationMs = Date.now() - startTime;
    const output = response.text || '';

    return res.json({
      output,
      model: 'gemini-3.1-pro-preview',
      thinkingLevel: 'HIGH',
      durationMs,
      compiledPrompt,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/test-prompt:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate output using gemini-3.1-pro-preview',
      details: err.stack,
    });
  }
});

/**
 * Endpoint: Optimize and Deep-Reason Prompt Architecture
 * Uses gemini-3.1-pro-preview with ThinkingLevel.HIGH
 */
app.post('/api/ai/optimize-prompt', async (req, res) => {
  try {
    const { rawPrompt, targetTools = ['ChatGPT', 'Claude', 'Gemini'], category = 'Engineering', objective = '' } = req.body;

    if (!rawPrompt) {
      return res.status(400).json({ error: 'rawPrompt is required' });
    }

    const ai = getAiClient();
    const startTime = Date.now();

    const instruction = `You are a Principal Prompt Engineer at an elite enterprise technology firm.
Your mission is to perform a deep-reasoning review and architectural optimization of the user-provided prompt template for production team usage across ${targetTools.join(', ')}.

Requirements:
1. Identify all ambiguities, missing boundary conditions, formatting edge cases, and hallucinations risks.
2. Structure the optimized prompt cleanly using XML/markdown tags, role-framing, input/output delimiters, and templated placeholders in the {{variable_name}} syntax.
3. Provide recommended system instructions, suggested temperature, and few-shot examples if beneficial.
4. Output your analysis and optimized prompt in clean JSON format matching this schema:
{
  "summaryOfImprovements": "High-level summary of what was enhanced",
  "reasoningInsights": ["point 1", "point 2", "point 3"],
  "optimizedPrompt": "The enhanced prompt template with {{variables}}",
  "suggestedSystemInstruction": "Recommended system prompt",
  "detectedVariables": ["var1", "var2"],
  "suggestedTemperature": 0.3,
  "recommendedTips": "Key usage tips for colleagues"
}
Ensure the response is valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Raw prompt to optimize:
"""
${rawPrompt}
"""
Category: ${category}
User Goal: ${objective || 'Maximize precision, structured output, and repeatability'}`,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        systemInstruction: instruction,
        responseMimeType: 'application/json',
      },
    });

    const durationMs = Date.now() - startTime;
    let resultJson;
    try {
      resultJson = JSON.parse(response.text || '{}');
    } catch {
      resultJson = {
        summaryOfImprovements: 'Optimized with High Thinking reasoning',
        reasoningInsights: ['Standardized structure and variables', 'Refined output delimiters'],
        optimizedPrompt: response.text || rawPrompt,
        suggestedSystemInstruction: '',
        detectedVariables: [],
        suggestedTemperature: 0.3,
        recommendedTips: 'Review variable inputs before running.',
      };
    }

    return res.json({
      ...resultJson,
      model: 'gemini-3.1-pro-preview',
      thinkingLevel: 'HIGH',
      durationMs,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/optimize-prompt:', err);
    return res.status(500).json({
      error: err.message || 'Failed to optimize prompt with gemini-3.1-pro-preview',
    });
  }
});

/**
 * Endpoint: Prompt Security, Jailbreak & Leakage Audit
 */
app.post('/api/ai/audit-prompt', async (req, res) => {
  try {
    const { promptText } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: 'promptText is required' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Audit this enterprise prompt for prompt injection vulnerabilities, data leakage risks, and robustness:
"""
${promptText}
"""
Return JSON:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "securityScore": 85,
  "vulnerabilities": ["issue 1"],
  "hardeningRecommendations": ["recommendation 1"],
  "overallVerdict": "Safe for production deployment"
}`,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/ai/audit-prompt:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Mount Vite or static server
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptVault server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
