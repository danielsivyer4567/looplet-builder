import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const RequirementsSchema = z.object({
  appType: z.enum(["web", "dashboard", "blog", "ecommerce", "saas", "tool", "construction"]),
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  authentication: z.boolean(),
  database: z.boolean(),
  api: z.boolean(),
  realtime: z.boolean(),
  payments: z.boolean(),
  techStack: z.object({
    framework: z.string().default("nextjs"),
    styling: z.string().default("tailwind"),
    database: z.string().optional(),
  }),
  complexity: z.enum(["simple", "medium", "complex"]),
  estimatedCredits: z.number(),
  pages: z.array(z.string()),
  components: z.array(z.string()),
});

export type Requirements = z.infer<typeof RequirementsSchema>;

export class PromptAnalyzer {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyze(prompt: string): Promise<Requirements> {
    const systemPrompt = `You are an expert software architect. Analyze the user's prompt and extract structured requirements for building a web application.

Return a JSON object with these exact fields:
- appType: Type of application (web, dashboard, blog, ecommerce, saas, tool, construction)
- name: A short name for the app (2-3 words, no spaces, PascalCase)
- description: Brief description of what the app does
- features: Array of specific features needed
- authentication: Boolean - whether user auth is needed
- database: Boolean - whether database storage is needed
- api: Boolean - whether API routes are needed
- realtime: Boolean - whether real-time features are needed
- payments: Boolean - whether payment processing is needed
- techStack: { framework: "nextjs", styling: "tailwind", database: "supabase" or null }
- complexity: "simple" | "medium" | "complex"
- estimatedCredits: Number 1-10 based on complexity
- pages: Array of page routes needed (e.g., ["/", "/dashboard", "/settings"])
- components: Array of React components needed (e.g., ["Header", "Sidebar", "TaskList"])

Be comprehensive and practical. Return ONLY valid JSON, no markdown.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Analyze this app request and return JSON:\n\n"${prompt}"`,
        },
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Invalid response type from Claude");
    }

    // Extract JSON from response
    let jsonStr = content.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Clean up common JSON issues from LLM output
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/[\u0000-\u001F]+/g, ' ')  // Remove control characters
      .replace(/\n\s*\n/g, '\n');  // Remove excessive newlines

    try {
      const parsed = JSON.parse(jsonStr);
      return RequirementsSchema.parse(parsed);
    } catch (error) {
      console.error("Failed to parse requirements:", error);
      console.error("Raw response (first 500 chars):", content.text.substring(0, 500));

      // Return a sensible default based on the prompt
      return {
        appType: "web" as const,
        name: "GeneratedApp",
        description: prompt.substring(0, 100),
        features: ["Basic functionality"],
        authentication: prompt.toLowerCase().includes("auth") || prompt.toLowerCase().includes("login"),
        database: prompt.toLowerCase().includes("data") || prompt.toLowerCase().includes("store"),
        api: true,
        realtime: false,
        payments: prompt.toLowerCase().includes("payment") || prompt.toLowerCase().includes("checkout"),
        techStack: { framework: "nextjs", styling: "tailwind" },
        complexity: "medium" as const,
        estimatedCredits: 5,
        pages: ["/", "/dashboard"],
        components: ["Header", "Main", "Footer"],
      };
    }
  }
}

export const promptAnalyzer = new PromptAnalyzer();
