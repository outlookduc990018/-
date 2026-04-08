import { GoogleGenAI } from "@google/genai";
import { Classroom } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

const GENERATION_PROMPT = (topic: string) => `
You are an expert educator creating an interactive multi-agent classroom lesson.
Generate a classroom JSON for the topic: "${topic}"

Return ONLY a valid JSON object — no markdown, no code fences, just raw JSON — with this exact structure:

{
  "topic": "${topic}",
  "agents": [
    {
      "id": "teacher",
      "name": "Professor Chen",
      "role": "teacher",
      "avatar": "👨‍🏫",
      "color": "bg-violet-600",
      "personality": "Enthusiastic, clear, uses helpful analogies"
    },
    {
      "id": "student1",
      "name": "Alex",
      "role": "student",
      "avatar": "👨‍🎓",
      "color": "bg-sky-600",
      "personality": "Curious and analytical, asks good follow-up questions"
    },
    {
      "id": "student2",
      "name": "Maya",
      "role": "student",
      "avatar": "👩‍🎓",
      "color": "bg-emerald-600",
      "personality": "Creative thinker who relates concepts to real life"
    }
  ],
  "scenes": [
    {
      "id": "scene1",
      "type": "slide",
      "title": "Introduction",
      "slideContent": {
        "title": "A clear slide title for the introduction",
        "points": [
          "First key concept or fact",
          "Second key concept or fact",
          "Third key concept or fact"
        ],
        "teacherNote": "What Professor Chen says when presenting this slide (2-3 sentences)"
      },
      "messages": [
        { "agentId": "teacher", "text": "Welcome to today's class on ${topic}! Let's start with the basics." },
        { "agentId": "student1", "text": "I've always been curious about this topic!" },
        { "agentId": "teacher", "text": "Great! By the end, you'll have a solid foundation." }
      ]
    },
    {
      "id": "scene2",
      "type": "slide",
      "title": "Core Concepts",
      "slideContent": {
        "title": "A clear slide title for core concepts",
        "points": [
          "Core concept 1 with brief explanation",
          "Core concept 2 with brief explanation",
          "Core concept 3 with brief explanation",
          "Core concept 4 with brief explanation"
        ],
        "teacherNote": "Detailed explanation from Professor Chen (2-3 sentences)"
      },
      "messages": [
        { "agentId": "teacher", "text": "These core concepts are the building blocks you'll use." },
        { "agentId": "student2", "text": "How does concept 1 connect to everyday life?" },
        { "agentId": "teacher", "text": "Great question! Think of it like..." },
        { "agentId": "student1", "text": "That analogy makes it much clearer!" }
      ]
    },
    {
      "id": "scene3",
      "type": "slide",
      "title": "Deep Dive",
      "slideContent": {
        "title": "A clear slide title for the deep dive",
        "points": [
          "Advanced insight 1",
          "Advanced insight 2",
          "Advanced insight 3"
        ],
        "teacherNote": "Professor Chen's deeper explanation (2-3 sentences)"
      },
      "messages": [
        { "agentId": "teacher", "text": "Now let's go deeper." },
        { "agentId": "student2", "text": "This reminds me of something I read..." },
        { "agentId": "teacher", "text": "Exactly right! That connection is key." }
      ]
    },
    {
      "id": "scene4",
      "type": "quiz",
      "title": "Knowledge Check",
      "quiz": {
        "question": "A clear multiple-choice question testing understanding of ${topic}",
        "options": [
          "Option A — plausible but incorrect",
          "Option B — the correct answer",
          "Option C — plausible but incorrect",
          "Option D — plausible but incorrect"
        ],
        "correctIndex": 1,
        "explanation": "2-3 sentence explanation of why the correct answer is right"
      },
      "messages": [
        { "agentId": "teacher", "text": "Time to test your understanding! Take your time." },
        { "agentId": "student1", "text": "I think I know this one." },
        { "agentId": "student2", "text": "Let me think through the options carefully." }
      ]
    },
    {
      "id": "scene5",
      "type": "discussion",
      "title": "Open Discussion",
      "messages": [
        { "agentId": "teacher", "text": "Excellent work! Let's discuss: what surprised you most about ${topic}?" },
        { "agentId": "student1", "text": "I was surprised by [something specific and interesting about the topic]." },
        { "agentId": "student2", "text": "For me it was [a different surprising aspect]. It changes how I think about [related real-world thing]." },
        { "agentId": "teacher", "text": "Those are both excellent observations. [Topic] really does challenge our assumptions." },
        { "agentId": "student1", "text": "Where can we learn more after this class?" },
        { "agentId": "teacher", "text": "Great question! I'd recommend exploring [practical next step or resource]. Keep that curiosity alive!" }
      ]
    }
  ]
}

Make every piece of content genuinely educational and specific to "${topic}". Replace all placeholder text with real content about the topic.
`;

export const generateClassroom = async (topic: string): Promise<Classroom> => {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: GENERATION_PROMPT(topic),
  });

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip optional markdown code fences
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let data: Omit<Classroom, "id">;
  try {
    data = JSON.parse(jsonText);
  } catch {
    // Try extracting the first JSON object from the text
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Gemini did not return valid JSON. Please try again.");
    }
    data = JSON.parse(match[0]);
  }

  return { id: String(Date.now()), ...data };
};
