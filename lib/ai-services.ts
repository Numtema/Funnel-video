// Configuration pour Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY environment variable not set. AI features will not work.")
}

const parseJsonResponse = <T>(jsonString: string): T => {\
  let cleanJsonString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanJsonString.match(fenceRegex);
  
  if (match && match[2]) {\
    cleanJsonString = match[2].trim();
  }
  
  try {\
    return JSON.parse(cleanJsonString);
  } catch (e) {\
    console.error("Failed to parse JSON response:\", e);
    console.error("Original string:", jsonString);
    throw new Error("The AI returned an invalid response format. Please try again.");
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {\
  return new Promise((resolve, reject) => {\
    const reader = new FileReader();
    reader.onloadend = () => {\
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const typeDefinitions = `
export enum StepType {
  Welcome,
  Question,
  Message,
  LeadCapture,
}

export type MediaType = 'image' | 'video' | 'audio';

export interface Media {\
  type: MediaType;
  url: string;
}

export type AnswerInputType = 'buttons' | 'text' | 'voice' | 'video';

export interface AnswerInput {\
  type: AnswerInputType;
}

export interface WelcomeStep {\
  id: string;
  type: StepType.Welcome;
  title: string;
  buttonText: string;
  media: Media;
}

export interface QuestionOption {\
  id: string;
  text: string;
  nextStepId?: string;
}

export interface QuestionStep {\
  id: string;
  type: StepType.Question;
  question: string;
  answerInput: AnswerInput;
  options?: QuestionOption[];
  media: Media;
}

export interface MessageStep {\
  id: string;
  type: StepType.Message;
  title: string;
  buttonText: string;
  media: Media;
}

export interface SocialLink {\
  id: string;
  type: 'whatsapp' | 'youtube' | 'instagram' | 'facebook' | 'twitter' | 'website';
  url: string;
}

export interface LeadCaptureStep {\
  id: string;
  type: StepType.LeadCapture;
  title: string;
  subtitle: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  subscriptionText: string;
  privacyPolicyUrl: string;
  buttonText: string;
  socialLinks: SocialLink[];
  media: Media;
}

export type QuizStep = WelcomeStep | QuestionStep | MessageStep | LeadCaptureStep;

export interface ThemeConfig {\
  font: string;
  colors: {\
    background: string;
    primary: string;
    accent: string;
    text: string;
    buttonText: string;
  };
}

export interface QuizConfig {\
  steps: QuizStep[];
  theme: ThemeConfig;
}

export interface AIAnalysisResult {\
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  keywords: string[];
  summary: string;
}
`;

// Fonction pour appeler l'API Gemini
async function callGeminiAPI(prompt: string, systemInstruction: string, model: string = 'gemini-2.0-flash-exp'): Promise<string> {\
  if (!GEMINI_API_KEY) {\
    throw new Error("API Key is not configured. Cannot use AI features.");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {\
    method: 'POST',
    headers: {
      'Content-Type\': \'application/json',
    },
    body: JSON.stringify({\
      contents: [{\
        parts: [{\
          text: `${systemInstruction}\n\nUser Request: ${prompt}`
        }]
      }],
      generationConfig: {\
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {\
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function generateFunnelFromPrompt(prompt: string, model: string = 'gemini-2.0-flash-exp'): Promise<QuizConfig> {
  const systemInstruction = `
    You are an expert in marketing, psychology, and instructional design.
    Your task is to create a complete, interactive quiz funnel configuration based on a user's prompt.
    The output MUST be a single, valid JSON object that conforms to the 'QuizConfig' TypeScript interface provided below.
    DO NOT include any text, explanation, or markdown formatting outside of the JSON object.

    GUIDELINES:
    1. **Understand the Goal:** Deeply analyze the user's prompt to understand the target audience and the desired outcome of the funnel.
    2. **Create a Compelling Flow:** Design a logical sequence of 5-7 steps that guide the user on a journey of self-discovery, leading them naturally to the lead capture form. Start with a Welcome step, use a mix of Question and Message steps, and end with a LeadCapture step.
    3. **Engaging Content:** Write compelling, empathetic, and clear text for all titles, questions, and options.
    4. **Unique IDs:** Ensure ALL 'id' fields throughout the entire JSON object are unique strings (e.g., "step-1", "opt-1-1", "social-1"). This is critical.
    5. **Media Suggestions:** For each step's 'media' property, provide a valid, public, royalty-free URL from Pexels or use placeholder URLs.
    6. **Thematic Design:** Create a 'theme' object with a font from Google Fonts and a harmonious color palette that matches the mood of the funnel.
    7. **Final Output:** The entire response must be ONLY the JSON object.

    ${typeDefinitions}
  `;

  const response = await callGeminiAPI(prompt, systemInstruction, model);
  return parseJsonResponse<QuizConfig>(response);
}

export async function suggestChangesForStep(step: QuizStep, field: string, currentValue: string): Promise<string> {
  const systemInstruction = `
    You are an expert copywriter specializing in creating engaging micro-copy for interactive funnels.
    A user is building a quiz step and wants a better suggestion for a specific text field.
    Your response MUST be a single, valid JSON object with one key: "suggestion".
    Example Response: {"suggestion": "A new, improved version of the text."}
  `;

  const prompt = `
    The current step is of type: "${getStepTypeName(step.type)}"
    The field to improve is: "${String(field)}"
    The current text is: "${currentValue}"
    Based on this context, generate a more compelling, clear, or empathetic version of the text.
  `;

  const response = await callGeminiAPI(prompt, systemInstruction);
  const parsed = parseJsonResponse<{ suggestion: string }>(response);
  return parsed.suggestion;
}

export async function analyzeTextResponse(text: string): Promise<AIAnalysisResult> {
  if (!text.trim()) throw new Error("Cannot analyze empty text.");

  const systemInstruction = `
    You are an expert at analyzing user feedback. Your task is to process the user's text and return a structured analysis.
    The output MUST be a single, valid JSON object that conforms to the 'AIAnalysisResult' TypeScript interface provided below.
    - 'sentiment' must be one of 'Positive', 'Negative', or 'Neutral'.
    - 'keywords' must be an array of 3-5 most relevant keywords from the text.
    - 'summary' must be a single, concise, actionable sentence summarizing the core of the user's statement.
    DO NOT include any text, explanation, or markdown formatting outside of the JSON object.

    ${typeDefinitions}
  `;

  const response = await callGeminiAPI(`Analyze the following text: "${text}"`, systemInstruction);
  return parseJsonResponse<AIAnalysisResult>(response);
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
  // Pour l'instant, on retourne une image placeholder
  // Dans une vraie implémentation, on utiliserait l'API Imagen de Google
  const encodedPrompt = encodeURIComponent(prompt);
  return `/placeholder.svg?height=400&width=600&text=${encodedPrompt}`;
}

export async function generateAudioFromText(text: string): Promise<string> {
  // Pour l'instant, on retourne un placeholder
  // Dans une vraie implémentation, on utiliserait l'API Text-to-Speech
  return "data:audio/mpeg;base64,placeholder";
}

export async function transcribeAndAnalyzeAudio(audioBlob: Blob): Promise<AIAnalysisResult> {
  // Pour l'instant, on retourne une analyse par défaut
  // Dans une vraie implémentation, on transcrirait d'abord l'audio
  return {
    sentiment: 'Neutral',
    keywords: ['audio', 'response', 'user'],
    summary: 'User provided an audio response that needs analysis.'
  };
}

const getStepTypeName = (type: StepType) => {
  switch(type) {
    case StepType.Welcome: return 'Welcome';
    case StepType.Question: return 'Question';
    case StepType.Message: return 'Message';
    case StepType.LeadCapture: return 'Lead Capture';
    default: return 'Step';
  }
};
