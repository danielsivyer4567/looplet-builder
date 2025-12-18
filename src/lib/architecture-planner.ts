import Anthropic from "@anthropic-ai/sdk";
import { Requirements } from "./prompt-analyzer";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export interface ComponentSpec {
  name: string;
  path: string;
  description: string;
  props: Record<string, string>;
  isClientComponent: boolean;
}

export interface RouteSpec {
  path: string;
  type: "page" | "api" | "layout";
  description: string;
  authentication: boolean;
}

export interface Architecture {
  fileStructure: FileNode[];
  components: ComponentSpec[];
  routes: RouteSpec[];
  dependencies: Record<string, string>;
}

export class ArchitecturePlanner {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async plan(requirements: Requirements): Promise<Architecture> {
    const systemPrompt = `You are an expert Next.js 15 architect. Given app requirements, create a complete architecture plan.

Return a JSON object with:
1. fileStructure: Array of file/directory nodes for the project
2. components: Array of React components with { name, path, description, props, isClientComponent }
3. routes: Array of routes with { path, type, description, authentication }
4. dependencies: Object of npm packages needed { "package-name": "version" }

Follow Next.js 15 App Router conventions:
- Pages go in src/app/[route]/page.tsx
- Layouts in src/app/[route]/layout.tsx
- API routes in src/app/api/[route]/route.ts
- Components in src/components/
- Use 'use client' only when needed (interactivity, hooks)
- Use Server Components by default

Return ONLY valid JSON, no markdown code blocks.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Create architecture for this app:\n\n${JSON.stringify(requirements, null, 2)}`,
        },
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Invalid response type");
    }

    let jsonStr = content.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    try {
      return JSON.parse(jsonStr) as Architecture;
    } catch (error) {
      console.error("Failed to parse architecture:", error);
      throw new Error("Failed to parse architecture plan");
    }
  }
}

export const architecturePlanner = new ArchitecturePlanner();
