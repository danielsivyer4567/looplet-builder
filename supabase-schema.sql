-- Supabase Schema for Aut0 Pilot
-- Run this in your Supabase SQL editor to set up the database

-- Projects table - stores generated applications
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  architecture JSONB NOT NULL DEFAULT '{}'::jsonb,
  stats JSONB NOT NULL DEFAULT '{"totalFiles": 0, "components": 0, "routes": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Templates table - stores quick-start templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Code',
  category TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO templates (name, description, prompt, icon, category, is_featured) VALUES
  ('Construction Dashboard', 'Project management dashboard for construction companies', 'Build a construction project management dashboard with job tracking, crew scheduling, material inventory, and budget monitoring. Include charts for project progress and timeline views.', 'Construction', 'business', true),
  ('Todo App', 'Simple task management application', 'Create a modern todo app with categories, due dates, priority levels, and drag-and-drop reordering. Include a dashboard with productivity stats.', 'ListTodo', 'productivity', true),
  ('Blog CMS', 'Content management system for blogs', 'Build a blog CMS with rich text editor, image uploads, categories, tags, draft/publish workflow, and SEO settings. Include an admin dashboard.', 'FileText', 'content', true),
  ('E-commerce Store', 'Online shopping platform', 'Create an e-commerce store with product catalog, shopping cart, checkout flow, order history, and admin dashboard for inventory management.', 'ShoppingCart', 'commerce', true)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Allow read access to templates for everyone
CREATE POLICY "Templates are viewable by everyone" ON templates
  FOR SELECT USING (true);

-- Projects are only viewable by their owner
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = 'anonymous');

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid()::text = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
