import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not configured. Database features disabled.");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

// Database types
export interface Project {
  id: string;
  user_id: string;
  prompt: string;
  name: string;
  description: string;
  files: ProjectFile[];
  requirements: Record<string, unknown>;
  architecture: Record<string, unknown>;
  stats: {
    totalFiles: number;
    components: number;
    routes: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  category: string;
  is_featured: boolean;
  created_at: string;
}

// Project service functions
export const projectService = {
  async saveProject(data: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project | null> {
    if (!supabase) {
      console.warn("Supabase not configured - project not saved");
      return null;
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error("Failed to save project:", error);
      return null;
    }

    return project;
  },

  async getProjects(userId: string): Promise<Project[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch projects:", error);
      return [];
    }

    return data || [];
  },

  async getProject(id: string): Promise<Project | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch project:", error);
      return null;
    }

    return data;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete project:", error);
      return false;
    }

    return true;
  },
};

// Template service functions
export const templateService = {
  async getTemplates(): Promise<Template[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("is_featured", { ascending: false });

    if (error) {
      console.error("Failed to fetch templates:", error);
      return [];
    }

    return data || [];
  },

  async getFeaturedTemplates(): Promise<Template[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("is_featured", true)
      .limit(4);

    if (error) {
      console.error("Failed to fetch featured templates:", error);
      return [];
    }

    return data || [];
  },
};
