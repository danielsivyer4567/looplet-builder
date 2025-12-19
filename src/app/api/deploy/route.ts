import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { features } from "@/lib/env";

export async function POST(request: NextRequest) {
  const auth = authorizeRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status || 401 }
    );
  }

  // Check if Vercel deployment is configured
  if (!features.vercelDeploy) {
    return NextResponse.json(
      {
        error: "Vercel deployment not configured",
        message: "Set VERCEL_API_TOKEN environment variable to enable deployment",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { projectName, files } = body;

    if (!projectName || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Missing required fields: projectName, files" },
        { status: 400 }
      );
    }

    // Create deployment using Vercel API
    const vercelToken = process.env.VERCEL_API_TOKEN;

    // Step 1: Create the project if it doesn't exist
    const projectSlug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    // Step 2: Create deployment with files
    const deploymentFiles = files.map((file: { path: string; content: string }) => ({
      file: file.path.startsWith("/") ? file.path.slice(1) : file.path,
      data: file.content,
    }));

    const deployResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectSlug,
        files: deploymentFiles,
        projectSettings: {
          framework: "nextjs",
          buildCommand: "npm run build",
          outputDirectory: ".next",
          installCommand: "npm install",
        },
        target: "production",
      }),
    });

    if (!deployResponse.ok) {
      const errorData = await deployResponse.json();
      console.error("Vercel deployment failed:", errorData);
      return NextResponse.json(
        {
          error: "Deployment failed",
          details: errorData.error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

    const deployment = await deployResponse.json();

    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.id,
        url: `https://${deployment.url}`,
        projectName: deployment.name,
        status: deployment.readyState,
      },
    });
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: "Deployment failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: features.vercelDeploy,
    message: features.vercelDeploy
      ? "Vercel deployment is available"
      : "Set VERCEL_API_TOKEN to enable deployment",
  });
}
