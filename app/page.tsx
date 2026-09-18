"use client";

import { useState } from "react";

type Analysis = {
  score: number;
  verdict: "SAFE" | "SUSPICIOUS" | "SCAM";
  summary: string;
  flags: string[];
  urls: string[];
  recommendation: string;
};

const examples = [
  {
    label: "Fake reward",
    text: "Congratulations! You have been selected for a $500 reward. Claim it now at http://secure-reward.example/claim before your account expires."
  },
  {
    label: "Account warning",
    text: "Your account will be suspended today. Verify your login immediately at https://account-check.example/login to avoid losing access."
  },
  {
    label: "Normal message",
    text: "Hey, are we still meeting at 3pm tomorrow? I can send the location here."
  }
];

export default function Home() {
  const [message, setMessage] = useState(examples[0].text);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!message.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      setAnalysis(data);
    } catch {
      setAnalysis({
        score: 0,
        verdict: "SUSPICIOUS",
        summary: "The analysis service could not be reached.",
        flags: ["API connection error"],
        urls: [],
        recommendation: "Try again in a moment."
      });
    } finally {
      setLoading(false);
    }
  }

  const verdictClass =
    analysis?.verdict === "SCAM"
      ? "danger"
      : analysis?.verdict === "SUSPICIOUS"
      ? "warning"
      : "safe";

  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">ScamShield</div>
            <div className="brand-sub">Message intelligence demo</div>
          </div>
        </div>
        <div className="nav-pill">Portfolio prototype</div>
      </nav>

      <section className="hero">
        <div className="eyebrow">ONLINE SAFETY • EXPLAINABLE DETECTION</div>
        <h1>Spot suspicious messages <span>before</span> they become a problem.</h1>
        <p className="hero-copy">
          Paste a Telegram-style message and ScamShield analyzes common scam
          signals, suspicious links, urgency, impersonation and financial requests.
        </p>
      </section>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="panel-heading">
            <div>
              <span className="step">01</span>
              <h2>Analyze a message</h2>
            </div>
            <span className="status-dot"><i /> API ready</span>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste a suspicious message here..."
          />

          <div className="examples">
            <span>Try an example:</span>
            {examples.map((example) => (
              <button
                key={example.label}
                onClick={() => {
                  setMessage(example.text);
                  setAnalysis(null);
                }}
              >
                {example.label}
              </button>
            ))}
          </div>

          <button className="analyze-btn" onClick={analyze} disabled={loading || !message.trim()}>
            {loading ? "Analyzing..." : "Analyze message →"}
          </button>

          <div className="privacy-note">
            <span>✦</span> Demo analysis runs through the app API. No real credentials are requested.
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <div>
              <span className="step">02</span>
              <h2>Risk assessment</h2>
            </div>
            {analysis && <span className={`verdict-chip ${verdictClass}`}>{analysis.verdict}</span>}
          </div>

          {!analysis ? (
            <div className="empty-state">
              <div className="shield">◈</div>
              <h3>Waiting for a message</h3>
              <p>Your score, detected signals and recommended action will appear here.</p>
            </div>
          ) : (
            <div className="result-content">
              <div className="score-row">
                <div>
                  <div className="score-label">RISK SCORE</div>
                  <div className={`score ${verdictClass}`}>{analysis.score}<small>/100</small></div>
                </div>
                <div className={`score-ring ${verdictClass}`}>
                  <span>{analysis.score}</span>
                </div>
              </div>

              <p className="summary">{analysis.summary}</p>

              <div className="result-section">
                <div className="section-title">Detected signals</div>
                <div className="flags">
                  {analysis.flags.map((flag) => (
                    <div className="flag" key={flag}>
                      <span>✓</span>{flag}
                    </div>
                  ))}
                </div>
              </div>

              {analysis.urls.length > 0 && (
                <div className="result-section">
                  <div className="section-title">Extracted links</div>
                  {analysis.urls.map((url) => (
                    <div className="url-box" key={url}>{url}</div>
                  ))}
                </div>
              )}

              <div className={`recommendation ${verdictClass}`}>
                <div className="section-title">Recommended action</div>
                <p>{analysis.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="architecture">
        <div className="arch-copy">
          <div className="eyebrow">HOW THE DEMO FITS TOGETHER</div>
          <h2>From message → analysis → decision.</h2>
          <p>
            The prototype is structured so a Telegram webhook or another messaging
            source can send text to the same analysis API used by this dashboard.
          </p>
        </div>
        <div className="flow">
          <div className="flow-card"><strong>01</strong><b>Message</b><span>Telegram / web input</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-card"><strong>02</strong><b>Analysis API</b><span>Signals + URL checks</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-card"><strong>03</strong><b>Risk engine</b><span>Score + explanation</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-card"><strong>04</strong><b>User action</b><span>Safe / review / avoid</span></div>
        </div>
      </section>

      <footer>
        ScamShield is a self-initiated portfolio demonstration. Its detection logic is heuristic and should not be treated as production security software.
      </footer>
    </main>
  );
}
