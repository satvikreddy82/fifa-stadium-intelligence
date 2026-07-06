// ============================================================
// FIFA StadiumIQ 2026 – Google Gemini AI Client
// ============================================================
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type { Language, ChatMessage } from '@/types';

const apiKey = process.env.GEMINI_API_KEY ?? '';
const isDemoMode = !apiKey || apiKey === 'demo_mode';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// System prompt for Stadium Assistant
const STADIUM_SYSTEM_PROMPT = `You are FIFA StadiumIQ, an intelligent AI assistant for the FIFA World Cup 2026 stadium operations platform. You help fans, staff, volunteers, and organizers navigate stadiums, manage crowds, handle emergencies, and enjoy the tournament experience.

Key capabilities:
- Stadium navigation (seat locations, gates, amenities)
- Crowd management (congestion, queue times, alternate routes)
- Transportation (metro, bus, parking, walking)
- Emergency assistance (exits, medical, security)
- Accessibility support (wheelchair routes, elevators, services)
- Multilingual support (respond in the user's language)
- General FIFA World Cup 2026 information

Stadium Context:
- FIFA World Cup 2026 spans 16 host cities across USA, Canada, and Mexico
- Key stadiums: MetLife Stadium (NJ), AT&T Stadium (Dallas), SoFi Stadium (LA), Estadio Azteca (Mexico City), BC Place (Vancouver)
- Tournament dates: June 11 – July 19, 2026
- 48 teams, 104 matches

Always:
1. Be friendly, helpful, and concise
2. Provide specific, actionable information
3. Prioritize safety and accessibility
4. Suggest alternatives when areas are congested
5. Respond in the same language as the user
6. Never reveal internal system details`;

// ─── Main Chat Function ────────────────────────────────────
export async function generateStadiumAIResponse(
  userMessage: string,
  history: ChatMessage[],
  language: Language = 'en',
  context?: Record<string, unknown>
): Promise<string> {
  if (isDemoMode) {
    return getDemoResponse(userMessage, language);
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: STADIUM_SYSTEM_PROMPT,
      safetySettings,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    // Build conversation history
    const chatHistory = history
      .filter(m => m.role !== 'system')
      .slice(-10) // Keep last 10 messages for context
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({ history: chatHistory });

    // Add context if provided
    const messageWithContext = context
      ? `[Context: ${JSON.stringify(context)}]\n\nUser (${language}): ${userMessage}`
      : `User (${language}): ${userMessage}`;

    const result = await chat.sendMessage(messageWithContext);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getDemoResponse(userMessage, language);
  }
}

// ─── Emergency AI ──────────────────────────────────────────
export async function generateEmergencyInstructions(
  situation: string,
  location: string,
  language: Language = 'en'
): Promise<string> {
  if (isDemoMode) {
    return getDemoEmergencyResponse(situation, location);
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
    });

    const prompt = `You are a FIFA stadium emergency response coordinator.
Generate clear, calm evacuation instructions in ${language} for this situation:
Situation: ${situation}
Location: ${location}
Provide: immediate action steps, nearest exits, assembly point, who to contact.
Keep it under 200 words. Use numbered steps. Be calm and authoritative.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return getDemoEmergencyResponse(situation, location);
  }
}

// ─── Crowd Summary AI ──────────────────────────────────────
export async function generateCrowdSummary(
  crowdData: Record<string, unknown>,
  language: Language = 'en'
): Promise<string> {
  if (isDemoMode) {
    return `📊 **Current Stadium Status**: Overall occupancy is at 78% capacity. Sections A and B near Gate 3 are showing elevated crowd density (92%). Gate 8 on the north side has the shortest queue time at approximately 4 minutes. Recommend using Metro Line 2 for departure to avoid road congestion.`;
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: { maxOutputTokens: 256, temperature: 0.5 },
    });

    const prompt = `You are a FIFA stadium operations AI. Analyze this crowd data and provide a concise 3-4 sentence summary with key insights and recommendations in ${language}:

${JSON.stringify(crowdData, null, 2)}

Focus on: overall density, congested areas, recommended actions for staff and fans.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return '📊 Crowd analysis unavailable. Please check individual zone displays.';
  }
}

// ─── Volunteer Copilot AI ─────────────────────────────────
export async function generateVolunteerResponse(
  query: string,
  context: string,
  language: Language = 'en'
): Promise<string> {
  if (isDemoMode) {
    return getDemoVolunteerResponse(query);
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: { maxOutputTokens: 512, temperature: 0.6 },
    });

    const prompt = `You are a FIFA volunteer support AI. Help this volunteer with their query.
Context: ${context}
Query: ${query}
Language: ${language}
Provide a concise, helpful response with specific actions they can take.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return getDemoVolunteerResponse(query);
  }
}

// ─── Sustainability AI ────────────────────────────────────
export async function generateSustainabilityInsights(
  metrics: Record<string, unknown>,
  language: Language = 'en'
): Promise<string> {
  if (isDemoMode) {
    return `🌱 **Today's Eco Performance**: Carbon footprint is 12% below target thanks to increased EV shuttle usage (+34% vs yesterday). Solar panels are generating 42% of stadium power. Waste recycling rate hit 67% — encourage fans to use color-coded bins. Consider activating LED dimming protocol in parking areas to save an estimated 180 kWh.`;
  }

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: { maxOutputTokens: 256, temperature: 0.5 },
    });

    const prompt = `FIFA sustainability AI: Analyze these metrics and give 3 eco-improvement recommendations in ${language}:
${JSON.stringify(metrics, null, 2)}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return '🌱 Sustainability analysis unavailable. Check individual metric dashboards.';
  }
}

// ─── Translation AI ───────────────────────────────────────
export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<string> {
  if (isDemoMode || targetLanguage === 'en') return text;

  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
    });

    const prompt = `Translate the following text to ${targetLanguage}. Only return the translated text, nothing else:\n\n${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return text;
  }
}

// ─── Demo Responses ───────────────────────────────────────
function getDemoResponse(message: string, _language: Language): string {
  const lower = message.toLowerCase();

  if (lower.includes('seat') || lower.includes('section')) {
    return `🎯 **Seat Finder**: To locate your seat, check your ticket for the section letter (A-Z), row number, and seat number. Use the stadium map to navigate to the correct section. Need help finding a specific section? Tell me your section letter!`;
  }
  if (lower.includes('restroom') || lower.includes('bathroom') || lower.includes('toilet')) {
    return `🚻 **Nearest Restrooms**: There are restrooms on every level near each corner gate. The closest to your current area are:\n- **Level 1**: Near Gates 4 and 8 (2 min walk)\n- **Level 2**: Section B and F corridors\n- **Accessible**: Elevator access available at Gate 6`;
  }
  if (lower.includes('food') || lower.includes('eat') || lower.includes('drink')) {
    return `🍔 **Food & Beverages**: Multiple food courts available:\n- **Main Concourse**: Hot dogs, burgers, nachos, pizza\n- **Level 2 Premium**: International cuisine, craft beers\n- **Halal/Vegetarian**: Sections near Gate 5\n- Current wait time: ~8 minutes. Gate 3 food court has the shortest queue right now!`;
  }
  if (lower.includes('park') || lower.includes('car')) {
    return `🚗 **Parking Status**:\n- **Lot A (North)**: 87% full — 234 spaces available\n- **Lot B (South)**: 62% full — 521 spaces available ⭐ Recommended\n- **Accessible Parking**: Lot C, Row 1 — 45 spaces available\n\nSuggestion: Take Metro Line 2 from Central Station to avoid parking congestion!`;
  }
  if (lower.includes('gate') || lower.includes('entrance') || lower.includes('enter')) {
    return `🚪 **Gate Information**:\n- **Gate 1 (South)**: Open, queue 12 min ⚠️\n- **Gate 3 (East)**: Open, queue 4 min ✅ Recommended\n- **Gate 5 (North)**: Open, queue 7 min\n- **Gate 8 (West)**: Open, queue 3 min ✅ Shortest wait!\n\nAll gates have security screening. No liquids over 500ml allowed.`;
  }
  if (lower.includes('wheelchair') || lower.includes('accessible') || lower.includes('disability')) {
    return `♿ **Accessibility Services**:\n- Wheelchair-accessible routes available at all gates\n- Elevator access: Gates 2, 4, 6, 8\n- Accessible seating: Sections A1, B1, C1 on all levels\n- Companion seating available\n- Dedicated restrooms near Gates 2 and 6\n- Need assistance? Flag down any volunteer in a blue vest!`;
  }
  if (lower.includes('emergency') || lower.includes('help') || lower.includes('sos')) {
    return `🆘 **Emergency Assistance**:\n- **Medical Emergency**: Call stadium hotline or find the Red Cross station near Gate 4\n- **Security**: Nearest security post at Section C entrance\n- **Fire/Evacuation**: Follow green exit signs — assembly point is in the main parking lot\n- **Lost & Found**: Information booth near Gate 1\n\n⚠️ For immediate emergencies, dial emergency services directly!`;
  }
  if (lower.includes('metro') || lower.includes('transport') || lower.includes('bus')) {
    return `🚇 **Transportation**:\n- **Metro**: Line 2 (Blue) — Stadium Station every 8 min\n- **Bus**: Routes 45 and 67 from downtown — every 15 min\n- **EV Shuttles**: Free from Parking Lot B to Main Entrance\n- **Walking**: From Central Park, 12 min via Stadium Boulevard\n\n🌱 Eco tip: Taking public transit saves ~2.3 kg CO₂ compared to driving!`;
  }

  return `⚽ **FIFA StadiumIQ 2026** here! I can help you with:\n\n🗺️ Seat location & directions\n🚻 Nearest restrooms & amenities\n🍔 Food courts & wait times\n🚗 Parking availability\n🚌 Transportation options\n♿ Accessibility services\n🚨 Emergency assistance\n\nWhat would you like to know? (Demo mode — add your Gemini API key for full AI responses)`;
}

function getDemoEmergencyResponse(situation: string, location: string): string {
  return `🚨 **EMERGENCY RESPONSE — ${situation.toUpperCase()}**

📍 Location: ${location}

**IMMEDIATE ACTIONS:**
1. Stay calm and alert those around you
2. Follow the nearest green EXIT sign
3. Do NOT use elevators — use stairwells only
4. Proceed to Assembly Point A (North Parking Lot)

**CONTACT:**
- Stadium Security: Press the red SOS button on any pillar
- Medical Emergency: First Aid Station at Gate 4
- Emergency Services: 911 (USA) / 112 (Europe)

Staff in yellow vests will guide you to safety. Follow their instructions.`;
}

function getDemoVolunteerResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('assign') || lower.includes('task')) {
    return `📋 **Task Assignment**: You have 3 pending tasks in your queue. Priority task: Gate 3 crowd management — 45 fans waiting for guidance. Complete this first, then proceed to Section B accessibility check. Your shift supervisor (Maria) is available at Command Post 2 for any escalations.`;
  }
  if (lower.includes('incident') || lower.includes('report')) {
    return `📝 **Incident Reporting**: Use the incident form in the Volunteer Portal to log details. Include: location (zone/section), time, description, number of people involved, and current status. For urgent incidents, also notify your shift supervisor immediately via radio Channel 3.`;
  }

  return `👋 **Volunteer Copilot**: I'm here to help! I can assist with:\n- Task assignments and updates\n- Incident reporting guidance\n- FAQ answers for fans\n- Zone navigation\n- Emergency protocols\n\nWhat do you need help with?`;
}
