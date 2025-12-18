import Anthropic from "@anthropic-ai/sdk";
import { Requirements } from "./prompt-analyzer";
import { Architecture, ComponentSpec, RouteSpec } from "./architecture-planner";

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export class CodeGenerator {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateProject(
    requirements: Requirements,
    architecture: Architecture
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate package.json
    files.push(this.generatePackageJson(requirements, architecture));

    // Generate components
    for (const component of architecture.components) {
      const file = await this.generateComponent(component, requirements);
      files.push(file);
    }

    // Generate routes/pages
    for (const route of architecture.routes) {
      const file = await this.generateRoute(route, requirements);
      files.push(file);
    }

    // Generate utility files
    files.push(this.generateUtilsFile());
    files.push(this.generateTailwindConfig());

    return files;
  }

  private async generateComponent(
    component: ComponentSpec,
    requirements: Requirements
  ): Promise<GeneratedFile> {
    const prompt = `Generate a React component for Next.js 15:

Component: ${component.name}
Description: ${component.description}
Props: ${JSON.stringify(component.props)}
Client Component: ${component.isClientComponent}

App Context: ${requirements.description}
App Type: ${requirements.appType}

Requirements:
- Use TypeScript with proper types
- ${component.isClientComponent ? "Add 'use client' at the top" : "Server Component (no 'use client')"}
- Use Tailwind CSS for styling
- Use lucide-react for icons if needed
- Follow React best practices
- Make it visually appealing with good spacing and colors

Return ONLY the component code, no explanations or markdown.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Sonnet for bulk code generation
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      system: "You are an expert React/Next.js developer. Return only clean TypeScript code.",
    });

    const content = response.content[0];
    const code = content.type === "text" ? this.cleanCode(content.text) : "";

    return {
      path: component.path,
      content: code,
      language: "typescript",
    };
  }

  private async generateRoute(
    route: RouteSpec,
    requirements: Requirements
  ): Promise<GeneratedFile> {
    const isApi = route.type === "api";

    const prompt = isApi
      ? `Generate a Next.js 15 API route handler:

Endpoint: ${route.path}
Description: ${route.description}
Requires Auth: ${route.authentication}

Requirements:
- Use Next.js App Router format (export async function GET/POST/etc)
- Include proper TypeScript types
- Add error handling with try/catch
- Return NextResponse.json() for responses
- ${route.authentication ? "Add authentication check" : "No auth needed"}

Return ONLY the code, no explanations.`
      : `Generate a Next.js 15 page component:

Route: ${route.path}
Description: ${route.description}
Type: ${route.type}

App Context: ${requirements.description}

Requirements:
- Use TypeScript
- Export default function as Server Component
- Add proper metadata export if it's a page
- Use Tailwind CSS for styling
- Make it visually appealing

Return ONLY the code, no explanations.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Sonnet for bulk code generation
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      system: "You are an expert Next.js developer. Return only clean TypeScript code.",
    });

    const content = response.content[0];
    const code = content.type === "text" ? this.cleanCode(content.text) : "";

    // Determine file path based on route type
    let filePath: string;
    if (isApi) {
      filePath = `src/app/api${route.path}/route.ts`;
    } else if (route.type === "layout") {
      filePath = `src/app${route.path}/layout.tsx`;
    } else {
      filePath = `src/app${route.path === "/" ? "" : route.path}/page.tsx`;
    }

    return {
      path: filePath,
      content: code,
      language: "typescript",
    };
  }

  private generatePackageJson(
    requirements: Requirements,
    architecture: Architecture
  ): GeneratedFile {
    const pkg = {
      name: requirements.name.toLowerCase().replace(/\s+/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        "lucide-react": "^0.400.0",
        clsx: "^2.1.0",
        "tailwind-merge": "^2.2.0",
        ...architecture.dependencies,
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        typescript: "^5",
        tailwindcss: "^4",
        "@tailwindcss/postcss": "^4",
        eslint: "^9",
        "eslint-config-next": "^15",
      },
    };

    return {
      path: "package.json",
      content: JSON.stringify(pkg, null, 2),
      language: "json",
    };
  }

  private generateUtilsFile(): GeneratedFile {
    return {
      path: "src/lib/utils.ts",
      content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
      language: "typescript",
    };
  }

  private generateTailwindConfig(): GeneratedFile {
    return {
      path: "tailwind.config.ts",
      content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        accent: {
          500: "#f97316",
          600: "#ea580c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
`,
      language: "typescript",
    };
  }

  private cleanCode(code: string): string {
    // Remove markdown code fences
    code = code.replace(/^```[\w]*\n?/gm, "");
    code = code.replace(/```$/gm, "");
    return code.trim();
  }
}

export const codeGenerator = new CodeGenerator();
