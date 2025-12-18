import { NextRequest, NextResponse } from "next/server";
import { promptAnalyzer } from "@/lib/prompt-analyzer";
import { architecturePlanner } from "@/lib/architecture-planner";
import { codeGenerator } from "@/lib/code-generator";

export const maxDuration = 60; // Allow up to 60 seconds for generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Step 1: Analyze the prompt
    console.log("Step 1: Analyzing prompt...");
    const requirements = await promptAnalyzer.analyze(prompt);

    // Step 2: Plan the architecture
    console.log("Step 2: Planning architecture...");
    const architecture = await architecturePlanner.plan(requirements);

    // Step 3: Generate code
    console.log("Step 3: Generating code...");
    const files = await codeGenerator.generateProject(requirements, architecture);

    return NextResponse.json({
      success: true,
      requirements,
      architecture,
      files,
      stats: {
        totalFiles: files.length,
        components: architecture.components.length,
        routes: architecture.routes.length,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Looplet Builder API - POST a prompt to generate an app",
  });
}
