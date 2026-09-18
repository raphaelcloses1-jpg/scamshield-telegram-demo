# ScamShield — Telegram Scam Detection Demo

A self-initiated portfolio prototype demonstrating an explainable scam-message analysis workflow.

## What it demonstrates

- Message analysis through a Next.js API route
- Risk scoring from 0–100
- SAFE / SUSPICIOUS / SCAM classification
- Explainable detection signals
- URL extraction and basic suspicious-link checks
- Responsive dashboard UI
- Architecture designed so a Telegram webhook can feed the same analysis API

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important

This is a portfolio/demo project using heuristic rules. It is not production-grade security software and does not claim to provide definitive scam detection.

## Possible next step

A production version could connect the analysis layer to a trained model or LLM, add reputation services for URLs/domains, persist events, authenticate users, and connect a real Telegram Bot API webhook.
