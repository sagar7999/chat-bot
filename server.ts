import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini AI Client with standard user-agent header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Emergency keywords check
const EMERGENCY_REGEX = /(chest pain|can't breathe|cannot breathe|difficulty breathing|unresponsive|heart attack|stroke|severe allergic reaction|anaphylaxis|choking|heavy bleeding|suicidal|blue lips|infant fever 104)/i;

/**
 * Intelligent Local FAQ Matcher (Used as fallback or complementary grounding)
 */
function findMatchingFaqs(query: string, faqs: any[] = []): any[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matches: { faq: any; score: number }[] = [];

  for (const faq of faqs) {
    if (faq.isActive === false) continue;
    let score = 0;
    const qLower = faq.question.toLowerCase();
    const aLower = faq.answer.toLowerCase();
    const keywords = (faq.keywords || []).map((k: string) => k.toLowerCase());

    for (const kw of keywords) {
      if (query.toLowerCase().includes(kw)) {
        score += 5;
      }
    }

    for (const word of queryWords) {
      if (qLower.includes(word)) score += 3;
      if (aLower.includes(word)) score += 1;
    }

    if (score > 2) {
      matches.push({ faq, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 4).map(m => m.faq);
}

// API: Process Patient Chat Message
app.post('/api/chat', async (req, res) => {
  try {
    const { clinic, messages, modelPreference, customOpenAiKey } = req.body;

    if (!clinic || !messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing clinic or messages payload' });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.text || '';

    // Check emergency priority immediately
    const isEmergency = EMERGENCY_REGEX.test(userQuery);
    if (isEmergency) {
      return res.json({
        text: `⚠️ **URGENT MEDICAL NOTICE**\n\nThe symptoms you described may require emergency intervention. Please call **911** or go to the nearest hospital Emergency Room immediately.\n\nOur clinic (${clinic.name}) does not handle acute life-threatening emergencies. Clinic triage: ${clinic.phone}.`,
        sourceFaqIds: [],
        isEmergencyWarning: true,
        suggestedActions: [
          { label: 'Call 911', action: 'call', payload: '911' },
          { label: `Call ${clinic.name}`, action: 'call', payload: clinic.phone },
        ],
        modelUsed: 'Emergency Triage Protocol',
      });
    }

    // Match relevant FAQs for grounding
    const matchingFaqs = findMatchingFaqs(userQuery, clinic.faqs);
    const matchedFaqIds = matchingFaqs.map(f => f.id);

    // Format Knowledge Base Context
    const knowledgeBaseText = `
Clinic Name: ${clinic.name}
Specialty: ${clinic.specialty}
Tagline: ${clinic.tagline}
Phone: ${clinic.phone} | Email: ${clinic.email}
Address: ${clinic.address}
Hours of Operation:
${clinic.hours.map((h: any) => `- ${h.days}: ${h.time}`).join('\n')}

Accepted Insurance Networks:
${clinic.acceptedInsurances.map((i: string) => `- ${i}`).join('\n')}

Doctors on Staff:
${clinic.doctors.map((d: any) => `- ${d.name} (${d.title}) - Specialty: ${d.specialty} - Availability: ${d.availability}`).join('\n')}

Emergency Disclaimer:
${clinic.emergencyDisclaimer}

Official Clinic FAQs & Protocols:
${clinic.faqs
  .filter((f: any) => f.isActive !== false)
  .map(
    (f: any, i: number) =>
      `[FAQ ${i + 1}] Category: ${f.category}
Q: ${f.question}
A: ${f.answer}`
  )
  .join('\n\n')}
`;

    // System instructions for GPT-4 / Gemini
    const systemInstruction = `You are the compassionate, highly professional Customer Support & FAQ Chatbot for "${clinic.name}" (${clinic.specialty}).
Your role is to assist patients by answering questions accurately based strictly on the official clinic knowledge base provided below.

RULES:
1. Always base answers on the clinic's provided hours, doctors, insurances, and FAQs.
2. If the user asks about an accepted insurance, check the list and state clearly whether it is in-network or handled through claim submission.
3. If the user asks about preparing for an appointment or procedure, give step-by-step guidance as outlined in the clinic's FAQs.
4. If the question cannot be answered from the provided knowledge base, politely explain that the details are not listed in the official clinic guide and offer to connect them with clinic reception at ${clinic.phone}.
5. Keep your tone warm, reassuring, and concise (under 3-4 short paragraphs). Use bolding for hours, dates, phone numbers, or critical instructions.
6. Do NOT provide personal medical diagnoses or prescribe medications. Suggest booking a consultation with their doctor.
`;

    let generatedText = '';
    let modelUsed = 'Gemini 3.8 Flash (Auto Grounded)';

    // Scenario A: Custom OpenAI GPT-4 Key provided by user
    if (customOpenAiKey && (modelPreference?.startsWith('gpt-4') || modelPreference === 'custom-gpt4')) {
      try {
        const openAiModel = modelPreference === 'gpt-4' ? 'gpt-4' : 'gpt-4o';
        const openAiMessages = [
          { role: 'system', content: `${systemInstruction}\n\nOFFICIAL CLINIC KNOWLEDGE BASE:\n${knowledgeBaseText}` },
          ...messages.slice(-6).map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        ];

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customOpenAiKey}`,
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: openAiMessages,
            temperature: 0.2,
            max_tokens: 600,
          }),
        });

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          generatedText = openAiData.choices?.[0]?.message?.content || '';
          modelUsed = `OpenAI ${openAiModel.toUpperCase()}`;
        } else {
          const errBody = await openAiRes.text();
          console.warn('OpenAI error, falling back to Gemini:', errBody);
        }
      } catch (err) {
        console.warn('OpenAI request failed, will use Gemini fallback:', err);
      }
    }

    // Scenario B: Gemini 3.8 Flash (Server-Side using @google/genai)
    if (!generatedText && ai) {
      try {
        const conversationHistory = messages.slice(-5).map((m: any) => `${m.sender === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`).join('\n');
        const prompt = `Official Clinic Knowledge Base:
${knowledgeBaseText}

Recent Conversation:
${conversationHistory}

Patient: ${userQuery}
Assistant:`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        generatedText = response.text || '';
        modelUsed = 'Gemini 3.8 Flash (AI Studio)';
      } catch (geminiError: any) {
        console.error('Gemini error:', geminiError);
      }
    }

    // Scenario C: Local Grounded FAQ Matcher Fallback
    if (!generatedText) {
      if (matchingFaqs.length > 0) {
        const topFaq = matchingFaqs[0];
        const secondary = matchingFaqs.length > 1 ? `\n\nRelated information: ${matchingFaqs[1].answer}` : '';
        generatedText = `${topFaq.answer}${secondary}\n\n*If you need further help, please contact our front desk at ${clinic.phone}.*`;
        modelUsed = 'Clinic Knowledge Engine (Local Semantic)';
      } else {
        generatedText = `Thank you for reaching out to ${clinic.name}. I don't see specific details about that in our published clinic FAQ guide. Our reception team is happy to help you directly at **${clinic.phone}** during regular hours (${clinic.hours[0]?.days || 'Weekdays'}, ${clinic.hours[0]?.time || '8am - 5pm'}). Would you like to request an appointment or have our nurse call you back?`;
        modelUsed = 'Clinic Knowledge Engine (Local Semantic)';
      }
    }

    // Determine smart suggested actions based on context
    const suggestedActions: any[] = [];
    const textLower = (generatedText + ' ' + userQuery).toLowerCase();

    if (textLower.includes('appointment') || textLower.includes('schedule') || textLower.includes('book') || textLower.includes('visit') || textLower.includes('exam')) {
      suggestedActions.push({ label: 'Request Appointment', action: 'book' });
    }
    if (textLower.includes('refill') || textLower.includes('prescription') || textLower.includes('pharmacy')) {
      suggestedActions.push({ label: 'Refill Guidelines', action: 'refill' });
    }
    suggestedActions.push({ label: `Call Reception (${clinic.phone})`, action: 'call', payload: clinic.phone });
    suggestedActions.push({ label: 'Speak with Nurse / Staff', action: 'escalate' });

    return res.json({
      text: generatedText,
      sourceFaqIds: matchedFaqIds,
      isEmergencyWarning: false,
      suggestedActions,
      modelUsed,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: error?.message || 'Internal server error',
    });
  }
});

// API: Generate New FAQ with AI from topic or raw clinical text
app.post('/api/generate-faq', async (req, res) => {
  try {
    const { clinicName, specialty, topicOrText } = req.body;
    if (!topicOrText) {
      return res.status(400).json({ error: 'Missing topic or text' });
    }

    if (ai) {
      const prompt = `You are a medical practice management specialist for "${clinicName || 'Clinic'}" (${specialty || 'General Practice'}).
Generate 2 to 3 professional, patient-friendly FAQ questions and comprehensive answers based on the following input:
"${topicOrText}"

Format your response strictly as a JSON array of objects with keys:
"category" (one of: "insurance", "appointment", "preparation", "prescriptions", "billing", "general"),
"question" (string),
"answer" (string),
"keywords" (array of 4-6 lowercase keyword strings).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '[]');
      return res.json({ faqs: parsed });
    } else {
      // Offline fallback generator
      return res.json({
        faqs: [
          {
            category: 'general',
            question: `What should patients know about ${topicOrText}?`,
            answer: `At ${clinicName}, we provide clear guidelines regarding ${topicOrText}. Please contact our front desk at our main phone number or speak with your care team for individualized advice.`,
            keywords: [topicOrText.toLowerCase(), 'policy', 'guidelines', 'information'],
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('Generate FAQ error:', error);
    return res.status(500).json({ error: 'Failed to generate FAQ', details: error?.message });
  }
});

// API: Check AI engine status
app.get('/api/engine-status', (req, res) => {
  res.json({
    geminiConfigured: !!geminiApiKey,
    defaultModel: 'gemini-3.8-flash',
    supportedModels: ['gemini-3.8-flash', 'gpt-4o', 'gpt-4', 'local-knowledge-engine'],
    serverTime: new Date().toISOString(),
  });
});

// Handle Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
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
    console.log(`CuraDesk server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
