import { NextResponse } from "next/server";
import { templateService, isSupabaseConfigured } from "@/lib/supabase";

// Default templates when database is not configured
const defaultTemplates = [
  {
    id: "construction",
    name: "Construction Dashboard",
    description: "Project management dashboard for construction companies",
    prompt: "Build a construction project management dashboard with job tracking, crew scheduling, material inventory, and budget monitoring. Include charts for project progress and timeline views.",
    icon: "Construction",
    category: "business",
    is_featured: true,
  },
  {
    id: "todo",
    name: "Todo App",
    description: "Simple task management application",
    prompt: "Create a modern todo app with categories, due dates, priority levels, and drag-and-drop reordering. Include a dashboard with productivity stats.",
    icon: "ListTodo",
    category: "productivity",
    is_featured: true,
  },
  {
    id: "blog",
    name: "Blog CMS",
    description: "Content management system for blogs",
    prompt: "Build a blog CMS with rich text editor, image uploads, categories, tags, draft/publish workflow, and SEO settings. Include an admin dashboard.",
    icon: "FileText",
    category: "content",
    is_featured: true,
  },
  {
    id: "ecommerce",
    name: "E-commerce Store",
    description: "Online shopping platform",
    prompt: "Create an e-commerce store with product catalog, shopping cart, checkout flow, order history, and admin dashboard for inventory management.",
    icon: "ShoppingCart",
    category: "commerce",
    is_featured: true,
  },
];

export async function GET() {
  // If Supabase is configured, fetch from database
  if (isSupabaseConfigured()) {
    const templates = await templateService.getFeaturedTemplates();
    if (templates.length > 0) {
      return NextResponse.json({ templates });
    }
  }

  // Fall back to default templates
  return NextResponse.json({ templates: defaultTemplates });
}
