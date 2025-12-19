// Environment variable validation
// Run this at app startup to catch missing config early

interface EnvConfig {
  // Required for core functionality
  ANTHROPIC_API_KEY: string;

  // Optional - Supabase (graceful degradation if missing)
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;

  // Optional - API authentication
  AUT0_API_KEY?: string;

  // Optional - Vercel deployment
  VERCEL_API_TOKEN?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  if (!process.env.ANTHROPIC_API_KEY) {
    errors.push("ANTHROPIC_API_KEY is required for AI generation");
  }

  // Optional but recommended
  if (!process.env.AUT0_API_KEY) {
    warnings.push("AUT0_API_KEY not set - API is open to all requests");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    warnings.push("Supabase not configured - project history disabled");
  }

  if (!process.env.VERCEL_API_TOKEN) {
    warnings.push("VERCEL_API_TOKEN not set - deploy feature disabled");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvStatus(): void {
  const result = validateEnv();

  if (result.errors.length > 0) {
    console.error("Environment configuration errors:");
    result.errors.forEach((e) => console.error(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.warn("Environment configuration warnings:");
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log("Environment configuration: All variables set");
  }
}

export function getEnvConfig(): Partial<EnvConfig> {
  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    AUT0_API_KEY: process.env.AUT0_API_KEY,
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
  };
}

// Feature flags based on environment
export const features = {
  get database() {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  get authentication() {
    return !!process.env.AUT0_API_KEY;
  },
  get vercelDeploy() {
    return !!process.env.VERCEL_API_TOKEN;
  },
};
