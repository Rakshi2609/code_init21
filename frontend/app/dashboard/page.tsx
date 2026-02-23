"use client"
import { useState, useEffect } from 'react'
import { predictDelay } from '../../lib/api'
import Link from 'next/link'

export default function Dashboard() {
  const [history, setHistory] = useState('2024-01-10, 2024-02-10, 2024-03-12')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const arr = history.split(',').map(s => s.trim())
      const res = await predictDelay({ payment_history: arr })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    submit()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome back, Ramesh</h2>
          <p className="text-slate-500">Here is your pension health overview for May 2024.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            Download Summary
          </button>
          <Link href="/upload-doc" className="px-5 py-2.5 bg-brand-600 border border-brand-600 rounded-xl text-sm font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all">
            + New Document
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Status Cards */}
        <div className="lg:col-span-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prediction Card */}
            <div className="glass-card p-8 bg-slate-900 text-white border-0">
              <div className="flex justify-between items-start mb-10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🔮</div>
                <span className="text-[10px] font-bold bg-white/10 text-white/60 px-2 py-1 rounded uppercase tracking-widest">AI Prediction</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Next Estimated Payment</p>
              <h3 className="text-3xl font-black mb-6">{result ? result.expected_next_date : '...'}</h3>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Status: {result ? result.status : 'Analyzing...'}
              </div>
            </div>

            {/* Risk Card */}
            <div className="glass-card p-8">
              <div className="flex justify-between items-start mb-10">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded uppercase tracking-widest">Risk Meter</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Delay Probability</p>
              <h3 className="text-3xl font-black text-slate-900 mb-6">{result ? Math.round(result.risk_score * 100) : '0'}%</h3>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${result?.risk_score > 0.6 ? 'bg-rose-500' : 'bg-brand-600'}`}
                  style={{ width: `${result ? result.risk_score * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="glass-card overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Pension Activity</h3>
              <button className="text-xs font-bold text-brand-600">View All Records</button>
            </div>
            <div className="p-0">
              {[
                { date: '2024-03-12', label: 'IGNOAPS Monthly', amount: '₹1,500', status: 'Success' },
                { date: '2024-02-10', label: 'IGNOAPS Monthly', amount: '₹1,500', status: 'Success' },
                { date: '2024-01-10', label: 'IGNOAPS Monthly', amount: '₹1,500', status: 'Success' },
              ].map((item, i) => (
                <div key={i} className="px-8 py-5 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                      {item.date.split('-')[1]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{item.amount}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Tools */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8">
            <h3 className="font-bold text-slate-900 mb-6">Tools & Assistance</h3>
            <div className="space-y-4">
              {[
                { name: 'Document OCR', href: '/upload-doc', desc: 'Scan your pension slips' },
                { name: 'Grievance Filer', href: '/grievance', desc: 'Draft legal letters' },
                { name: 'Language Clarifier', href: '/simplify', desc: 'Simplify legal jargon' }
              ].map((tool, i) => (
                <Link key={i} href={tool.href} className="group block p-4 rounded-2xl border border-slate-100 hover:border-brand-500/30 hover:bg-brand-50/30 transition-all">
                  <div className="flex justify-between items-center bg-transparent group-hover:bg-transparent">
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-700">{tool.name}</p>
                      <p className="text-xs text-slate-400">{tool.desc}</p>
                    </div>
                    <span className="text-brand-300 group-hover:text-brand-600 transition-colors">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-4">Emergency Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">If your pension is delayed by more than 90 days, you are eligible for expedited legal review.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                Contact Nodal Officer
              </button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
