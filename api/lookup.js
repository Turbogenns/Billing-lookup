import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Condensed Ontario Schedule of Benefits for testing
// (Full PDF reference in system prompt)
const BILLING_GUIDE = `
ONTARIO SCHEDULE OF BENEFITS - ANAESTHESIA SECTION (SIMPLIFIED)

ANAESTHESIOLOGISTS' SERVICES
==========================================

BASIC CODES:
- A090A: Consultation - General assessment by anaesthetist
- E792: General anaesthesia for minor procedure (< 30 min)
- E793: General anaesthesia for moderate procedure (30-60 min)
- E794: General anaesthesia for major procedure (> 60 min)
- E795: Local/regional anaesthesia with minimal monitoring
- E796: Epidural anaesthesia
- E797: Spinal anaesthesia

MODIFIERS:
"#E792" - when performed laparoscopically, add 25% to base fee
"#E793" - when performed with difficult airway management, add 30%
"#E794" - when performed after hours (after 6pm or weekends), add 50%
"#E796" - when performed with ultrasound guidance, add 25%

After-Hours Premium: Services rendered between 18:00-07:00 on weekdays, or anytime on statutory holidays are eligible for +50% premium.

SURGICAL PREAMBLE - ANAESTHESIA (GENERAL)
==========================================

Time-based calculations:
- All anaesthesia services include pre-operative assessment
- Post-operative monitoring up to 30 minutes included
- Base units calculated on procedure type and complexity

Common Surgical Codes Requiring Anaesthesia:
- M104A: Simple laceration repair - may be done under local
- M201A: Excision of skin lesion > 2cm - general or local
- N306A: Arthroscopic knee surgery - regional or general
- S410A: Laparoscopic cholecystectomy - general anaesthesia (modifier applies)
- T201A: Cystoscopy - local or general
- U401A: Vasectomy - local or general

SPECIAL RULES:
- Anaesthetist must be present for all general anaesthesia
- Must document start/end times
- Second anaesthetist premium if required (add base fee amount)
- Cancelled surgery: 50% of base fee if cancelled within 24 hours
`;

async function callClaude(userInput, conversationHistory = []) {
  try {
    const systemPrompt = `You are an expert Ontario OHIP billing code advisor helping anesthetists and surgeons find the correct billing codes.

You have access to the Ontario Schedule of Benefits: Physician Services.

ONTARIO BILLING GUIDE:
${BILLING_GUIDE}

Your job is to:
1. Ask clarifying questions naturally in conversation to determine the procedure details
2. Suggest the most appropriate billing code(s) based on the procedure description
3. Identify relevant modifiers (like "add 25% for laparoscopic")
4. Explain your recommendation briefly

When the user describes a procedure, ask follow-up questions if needed like:
- "Was this done laparoscopically?"
- "What time of day was the procedure?"
- "Was this done under general anaesthesia or local?"
- "Did you encounter any complications or special circumstances?"

Be conversational and helpful. Once you have enough information, provide:
1. The primary billing code (e.g., E792)
2. Any applicable modifiers
3. Brief explanation of why this code applies

Remember: The user is busy in a clinical setting, so be concise.`;

    const messages = [
      ...conversationHistory,
      {
        role: "user",
        content: userInput,
      },
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to get billing code suggestion: ${error.message}`);
  }
}

async function logFeedback(feedback) {
  try {
    // For MVP, we'll log to console and a simple file
    // In production, this would POST to Google Sheets API
    console.log("Feedback received:", feedback);
    return { success: true };
  } catch (error) {
    console.error("Feedback logging error:", error);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    const { action, userMessage, conversationHistory = [] } = req.body;

    if (action === "lookup") {
      try {
        const response = await callClaude(userMessage, conversationHistory);
        return res.status(200).json({ response });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (action === "feedback") {
      const { code, helpful, reason } = req.body;
      const feedbackData = {
        timestamp: new Date().toISOString(),
        code,
        helpful,
        reason,
      };
      try {
        await logFeedback(feedbackData);
        return res
          .status(200)
          .json({ success: true, message: "Feedback recorded" });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
