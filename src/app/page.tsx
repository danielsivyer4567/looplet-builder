import { PromptBuilder } from "@/components/prompt-builder";
import { Sparkles, Zap, Code2, Rocket, Shield, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-morphism px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg shadow-blue-500/20 animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white text-shadow-glow">Looplet Builder</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-all hover:scale-105">Features</a>
              <a href="#demo" className="text-sm font-medium text-gray-300 hover:text-white transition-all hover:scale-105">Demo</a>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/10 hover:border-white/20 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-40 pb-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-10 border border-white/5 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-400/90">AI-Powered App Generation</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter animate-fadeIn">
          <span className="text-white drop-shadow-2xl">From Prompt to</span>
          <br />
          <span className="gradient-text drop-shadow-2xl">Deployed App</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400/90 max-w-3xl mx-auto mb-16 leading-relaxed font-light animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          Describe your vision in plain English. Our neural engine builds, 
          validates, and deploys your application in a high-performance cloud environment.
        </p>

        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-20 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <StatCard label="Avg. Build Time" value="5 min" />
          <StatCard label="Code Ownership" value="100%" />
          <StatCard label="Modern Stack" value="Next.js" />
        </div>
      </section>

      {/* Prompt Builder Area */}
      <section id="demo" className="relative z-10 px-6 pb-32 max-w-5xl mx-auto animate-fadeIn" style={{ animationDelay: "0.6s" }}>
        <div className="p-1 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent">
          <div className="glass-morphism rounded-[31px] overflow-hidden">
            <PromptBuilder />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Engineered for Performance
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI-Powered Generation"
            description="Claude and GPT-4 analyze your requirements and generate production-ready code with extreme precision."
          />
          <FeatureCard
            icon={<Code2 className="w-6 h-6" />}
            title="Enterprise Stack"
            description="Next.js 15, React 19, and Tailwind CSS v4. The bleeding edge of web development, automated."
          />
          <FeatureCard
            icon={<Rocket className="w-6 h-6" />}
            title="Instant Deployment"
            description="Seamless integration with cloud providers. Your application goes from concept to live URL in seconds."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Strict Validation"
            description="Every line of code undergoes automated TypeScript verification and security auditing before delivery."
          />
          <FeatureCard
            icon={<Download className="w-6 h-6" />}
            title="Zero Lock-in"
            description="Export your entire repository anytime. Clean, documented code that you own entirely."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Industry Optimized"
            description="Pre-configured templates for construction, service industries, and professional workflows."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 glass border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-white">Looplet Builder</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            © 2025 Looplet AI Systems. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all group">
      <div className="text-3xl font-black text-white mb-1 group-hover:gradient-text transition-all">{value}</div>
      <div className="text-sm font-medium text-gray-500 tracking-wide uppercase">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card p-8 hover-glow group border border-white/5">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed font-light">{description}</p>
    </div>
  );
}
