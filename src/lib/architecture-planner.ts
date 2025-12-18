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

    // Clean up common JSON issues from LLM output
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/[\u0000-\u001F]+/g, ' ')  // Remove control characters
      .replace(/\n\s*\n/g, '\n');  // Remove excessive newlines

    try {
      return JSON.parse(jsonStr) as Architecture;
    } catch (error) {
      console.error("Failed to parse architecture:", error);
      console.error("Raw JSON (first 500 chars):", jsonStr.substring(0, 500));

      // Try to return a minimal valid architecture as fallback
      return {
        fileStructure: [
          { name: "src", path: "src", type: "directory", children: [
            { name: "app", path: "src/app", type: "directory", children: [
              { name: "page.tsx", path: "src/app/page.tsx", type: "file" },
              { name: "layout.tsx", path: "src/app/layout.tsx", type: "file" },
              { name: "globals.css", path: "src/app/globals.css", type: "file" },
            ]},
            { name: "components", path: "src/components", type: "directory", children: [] },
          ]},
        ],
        components: [],
        routes: [{ path: "/", type: "page", description: "Main page", authentication: false }],
        dependencies: {
          "next": "^14.0.0",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "tailwindcss": "^3.4.0",
        }
      };
    }
  }
}

export const architecturePlanner = new ArchitecturePlanner();
