"use client"
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      title: "Dashboard",
      description: "Overview of your pension, payouts, and scheduled updates.",
      href: "/dashboard",
      icon: "📊",
      color: "bg-blue-500"
    },
    {
      title: "Document OCR",
      description: "Upload pension slips or legal letters for instant AI reading.",
      href: "/upload-doc",
      icon: "📄",
      color: "bg-indigo-500"
    },
    {
      title: "Case Prediction",
      description: "Predict potential delays or outcomes of your pension processing.",
      href: "/prediction",
      icon: "🔮",
      color: "bg-purple-500"
    },
    {
      title: "File Grievance",
      description: "Generate professionally worded grievance letters in seconds.",
      href: "/grievance",
      icon: "⚖️",
      color: "bg-emerald-500"
    },
    {
      title: "Simplify Text",
      description: "Convert complex legal jargon into easy-to-understand language.",
      href: "/simplify",
      icon: "✨",
      color: "bg-amber-500"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Your Intelligent <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">
            Pension Companion
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          SAMAAN helps seniors navigate the legal and administrative complexities of pension management with cutting-edge AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-full font-bold shadow-lg shadow-brand-600/30 hover:scale-105 transition-transform"
          >
            Get Started Now
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <Link
            key={idx}
            href={feature.href}
            className="glass-card p-8 group hover:-translate-y-2 transition-all duration-300"
          >
            <div className={`w-12 h-12 ${feature.color} text-white rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-black/5`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
              {feature.title}
            </h3>
            <p className="text-slate-500 leading-relaxed">
              {feature.description}
            </p>
            <div className="mt-8 flex items-center text-brand-600 font-bold text-sm">
              Explore Tool
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        ))}
      </section>

      {/* Quick Summary Section */}
      <section className="mt-32 glass-card overflow-hidden">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 p-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Built for accessibility</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-4 mb-6">Simplifying the complex.</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Legal documents are hard. Pension delays are stressful. SAMAAN uses Optical Character Recognition and NLP to translate formal notices into simple actions you can take.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-slate-900">95%</div>
                <div className="text-sm text-slate-500">OCR Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">2s</div>
                <div className="text-sm text-slate-500">Response Time</div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full h-80 bg-slate-100 flex items-center justify-center">
            <div className="w-64 h-40 bg-white rounded-3xl shadow-2xl border border-slate-200"></div>
          </div>
        </div>
      </section>
    </div>
  )
}
