import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { projectService, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured", projects: [] },
      { status: 503 }
    );
  }

  const auth = authorizeRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status || 401 }
    );
  }

  const userId = auth.userId || "anonymous";
  const projects = await projectService.getProjects(userId);

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const auth = authorizeRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status || 401 }
    );
  }

  try {
    const body = await request.json();
    const { prompt, name, description, files, requirements, architecture, stats } = body;

    if (!prompt || !name || !files) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, name, files" },
        { status: 400 }
      );
    }

    const userId = auth.userId || "anonymous";
    const project = await projectService.saveProject({
      user_id: userId,
      prompt,
      name,
      description: description || "",
      files,
      requirements: requirements || {},
      architecture: architecture || {},
      stats: stats || { totalFiles: 0, components: 0, routes: 0 },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Failed to save project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Failed to save project:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const auth = authorizeRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status || 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("id");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID required" },
      { status: 400 }
    );
  }

  const success = await projectService.deleteProject(projectId);

  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
