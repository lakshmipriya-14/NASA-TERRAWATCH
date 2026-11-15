import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Send,
  RefreshCw,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { api } from '../api';

const QUICK_QUESTIONS = [
  "What changed in this location?",
  "Why might this change have happened?",
  "Which areas need attention?",
  "Explain this result in simple language."
];

export default function AIInsightsPanel({ analysisId, analysisData }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(null);

  const fetchInsights = (query = null) => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    if (query) setActiveQuestion(query);

    api.getAIInsights(analysisId, query)
      .then(res => setInsight(res))
      .catch(err => setError(err.message || 'Could not generate explanation.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (analysisId) {
      setActiveQuestion(null);
      fetchInsights();
    }
  }, [analysisId]);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    fetchInsights(userQuery);
  };

  const handleQuickQuestionClick = (q) => {
    setUserQuery(q);
    fetchInsights(q);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-space-850 via-space-900 to-space-850 border border-cyan-500/30 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-space-750 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-glow-cyan">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">AI Satellite Explanation</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Simple Plain English
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Explaining what the satellite saw in simple everyday language
            </p>
          </div>
        </div>

        <button
          onClick={() => { setActiveQuestion(null); setUserQuery(''); fetchInsights(); }}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-750 text-slate-300 text-xs font-medium border border-space-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Reset Explanation</span>
        </button>
      </div>

      {/* Quick Question Buttons */}
      <div className="space-y-1.5 relative z-10">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any question to get an instant simple answer:</span>
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestionClick(q)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                activeQuestion === q
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                  : 'bg-space-800/90 text-slate-300 hover:bg-space-750 hover:text-white border-space-700'
              }`}
            >
              <span className="text-cyan-400 font-bold">?</span>
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-300 font-medium">
            Reading satellite observations and writing explanation in simple words...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchInsights()} className="underline font-semibold ml-2">Try Again</button>
        </div>
      )}

      {/* Content */}
      {!loading && insight && (
        <div className="space-y-4 relative z-10">
          {/* Main Headline & Simple Summary */}
          <div className="p-4 rounded-xl bg-space-800/80 border border-cyan-800/50 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 leading-snug">
              {insight.headline}
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {insight.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Why this might have happened */}
            <div className="p-4 rounded-xl bg-space-900/90 border border-space-750 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Why Might This Have Happened?</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                {insight.physical_drivers?.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 2: What this means for the area */}
            <div className="p-4 rounded-xl bg-space-900/90 border border-space-750 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
                <span>What This Means For the Area</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                {insight.environmental_implications?.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 3: Recommended verification */}
            <div className="p-4 rounded-xl bg-space-900/90 border border-space-750 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Recommended Simple Checks</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                {insight.recommended_verification?.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Question Input */}
          <form onSubmit={handleAsk} className="pt-1">
            <div className="relative flex items-center">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask any question in simple words (e.g., 'Is this safe for farmers?' or 'What caused the water spread?')..."
                className="w-full bg-space-850 border border-space-700 rounded-xl pl-4 pr-24 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={loading || !userQuery.trim()}
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-space-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Friendly Note */}
          <div className="p-3 rounded-xl bg-space-950/80 border border-space-750 text-[11px] text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Simple Advice: </span>
              {insight.scientific_disclaimer ||
                'Satellite radar easily spots surface water and changes, but local weather checks and visits to the site help confirm the exact conditions.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
