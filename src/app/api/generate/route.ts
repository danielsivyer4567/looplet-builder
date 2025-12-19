import { NextRequest, NextResponse } from "next/server";
import { promptAnalyzer } from "@/lib/prompt-analyzer";
import { architecturePlanner } from "@/lib/architecture-planner";
import { codeGenerator } from "@/lib/code-generator";
import { authorizeRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const maxDuration = 60; // Allow up to 60 seconds for generation

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const endTimer = logger.time(`generation-${requestId}`);

  try {
    // Authentication and rate limiting
    const auth = authorizeRequest(request);
    if (!auth.authorized) {
      logger.warn("Unauthorized request", { requestId, error: auth.error });
      return NextResponse.json(
        { error: auth.error },
        {
          status: auth.status || 401,
          headers: auth.rateLimit ? { "X-RateLimit-Remaining": String(auth.rateLimit.remaining) } : {}
        }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    // Input sanitization - remove potential injection patterns
    const sanitizedPrompt = typeof prompt === "string"
      ? prompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
              .replace(/javascript:/gi, "")
              .trim()
      : "";

    if (!sanitizedPrompt || typeof sanitizedPrompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (sanitizedPrompt.length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters" },
        { status: 400 }
      );
    }

    logger.info("Starting generation", { requestId, promptLength: sanitizedPrompt.length });

    // Step 1: Analyze the prompt
    logger.debug("Step 1: Analyzing prompt", { requestId });
    const requirements = await promptAnalyzer.analyze(sanitizedPrompt);

    // Step 2: Plan the architecture
    logger.debug("Step 2: Planning architecture", { requestId });
    const architecture = await architecturePlanner.plan(requirements);

    // Step 3: Generate code
    logger.debug("Step 3: Generating code", { requestId });
    const files = await codeGenerator.generateProject(requirements, architecture);

    endTimer();
    logger.track("generation_complete", {
      requestId,
      totalFiles: files.length,
      components: architecture.components.length,
      routes: architecture.routes.length,
    });

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
    endTimer();
    logger.error("Generation failed", error instanceof Error ? error : new Error(String(error)), { requestId });

    // Don't expose stack traces in production
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
        ...(isDev && { details: error instanceof Error ? error.stack : undefined }),
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
