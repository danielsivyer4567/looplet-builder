import { PromptBuilder } from "@/components/prompt-builder";
import { Sparkles, Zap, Code2, Rocket, Shield, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(222.2,84%,4.9%)]">
      {/* Floating background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Looplet Builder</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#demo" className="text-gray-400 hover:text-white transition-colors">Demo</a>
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-16 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">AI-Powered App Generation</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-white">From Prompt to</span>
          <br />
          <span className="gradient-text">Deployed App</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Describe your app in plain English. Our AI builds it, validates it, and deploys it.
          Get a production-ready application in minutes, not months.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-12 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">5 min</div>
            <div className="text-sm text-gray-500">Avg. Build Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm text-gray-500">Code Ownership</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">Next.js</div>
            <div className="text-sm text-gray-500">Modern Stack</div>
          </div>
        </div>
      </section>

      {/* Prompt Builder */}
      <section id="demo" className="relative z-10 px-6 pb-20 max-w-4xl mx-auto">
        <PromptBuilder />
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything You Need
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI-Powered Generation"
            description="Claude and GPT-4 analyze your requirements and generate production-ready code."
          />
          <FeatureCard
            icon={<Code2 className="w-6 h-6" />}
            title="Full-Stack Ready"
            description="Next.js 15, React 19, TypeScript, Tailwind CSS. Modern stack out of the box."
          />
          <FeatureCard
            icon={<Rocket className="w-6 h-6" />}
            title="Instant Deployment"
            description="One-click deploy to Vercel. Your app goes live in seconds."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Validated & Secure"
            description="Every generated app passes TypeScript checks and security scans."
          />
          <FeatureCard
            icon={<Download className="w-6 h-6" />}
            title="Full Code Access"
            description="Download the complete source code. No lock-in, no hidden files."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Construction Focus"
            description="Built for tradies. Job tracking, quotes, scheduling templates ready."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400">Looplet Builder</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built for the construction industry
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass rounded-xl p-6 hover-glow">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
