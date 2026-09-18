import { NextResponse } from "next/server";

type Verdict = "SAFE" | "SUSPICIOUS" | "SCAM";

const patterns = [
  { regex: /\b(urgent|immediately|act now|right away|expires today|last chance)\b/i, points: 18, label: "Urgency / pressure language" },
  { regex: /\b(win|won|winner|reward|prize|bonus|giveaway|free money|cash)\b/i, points: 20, label: "Unexpected reward or money promise" },
  { regex: /\b(password|passcode|otp|one[- ]time code|verification code|login|sign in|credentials)\b/i, points: 22, label: "Credential or verification request" },
  { regex: /\b(send|transfer|pay)\b.{0,50}\b(money|crypto|bitcoin|usdt|gift card)\b/i, points: 22, label: "Financial request" },
  { regex: /\b(account|wallet|bank)\b.{0,60}\b(suspend|locked|freeze|verify)\b/i, points: 18, label: "Account-threat language" },
  { regex: /\b(admin|support|security team|official|manager)\b/i, points: 8, label: "Possible impersonation language" }
];

function extractUrls(text: string) {
  return text.match(/https?:\/\/[^\s<]+/gi) ?? [];
}

function analyzeMessage(message: string) {
  let score = 0;
  const flags: string[] = [];
  const urls = extractUrls(message);

  for (const pattern of patterns) {
    if (pattern.regex.test(message)) {
      score += pattern.points;
      flags.push(pattern.label);
    }
  }

  if (urls.length > 0) {
    score += 15;
    flags.push("External link detected");

    for (const url of urls) {
      if (/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i.test(url)) {
        score += 12;
        flags.push("Link uses a raw IP address");
      }
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|shorturl/i.test(url)) {
        score += 10;
        flags.push("Shortened URL hides the destination");
      }
      if (/login|verify|claim|gift|wallet|secure|reward|account/i.test(url)) {
        score += 10;
        flags.push("Link contains a high-risk keyword");
      }
      if (/\.example(?:\/|$)/i.test(url)) {
        score += 8;
        flags.push("Demo/test domain detected");
      }
    }
  }

  score = Math.min(100, score);

  let verdict: Verdict = "SAFE";
  if (score >= 65) verdict = "SCAM";
  else if (score >= 30) verdict = "SUSPICIOUS";

  const summary =
    verdict === "SCAM"
      ? "Multiple high-risk signals were detected. The message has characteristics commonly associated with scam attempts."
      : verdict === "SUSPICIOUS"
      ? "Some risk signals were detected. The message deserves additional verification before you interact with it."
      : "No major scam signals were detected by this demo's heuristic checks.";

  const recommendation =
    verdict === "SCAM"
      ? "Do not click links, send money, or share passwords and verification codes. Verify the sender through a trusted channel."
      : verdict === "SUSPICIOUS"
      ? "Pause before responding. Verify the sender and destination independently rather than using links in the message."
      : "Normal caution still applies. Avoid sharing sensitive information and verify unexpected requests.";

  return {
    score,
    verdict,
    summary,
    flags: flags.length ? flags : ["No major risk signals detected"],
    urls,
    recommendation
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Please provide a message to analyze." },
        { status: 400 }
      );
    }

    return NextResponse.json(analyzeMessage(message));
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
