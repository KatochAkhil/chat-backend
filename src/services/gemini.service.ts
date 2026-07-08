import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const GEMINI_MODEL = "gemini-3.5-flash";

export class GeminiService {
  private readonly client = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  async generateSuggestedReplies(context: string) {
    const model = this.client.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent([
      "You are assisting inside a team chat app.",
      "Return exactly three concise, natural chat reply suggestions as a JSON array of strings only.",
      "Do not add markdown, numbering, labels, or backticks.",
      context
    ]);
    const rawText = result.response.text();

    try {
      const parsed = JSON.parse(rawText) as string[];
      return parsed.slice(0, 3);
    } catch {
      return rawText
        .split("\n")
        .map((line) => line.replace(/^[\-\d\.\s"]+/, "").replace(/"$/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
    }
  }

  async summarizeChat(context: string) {
    const model = this.client.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent([
      "Summarize this team chat for a sidebar card in 2 short sentences.",
      "Focus on concrete decisions, blockers, and next steps. Do not use bullet points.",
      context
    ]);
    return result.response.text().trim();
  }
}
