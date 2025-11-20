import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

type AIAction = "punch-up" | "shorten" | "curious" | "brutal" | "bullets" | "casual";

const ACTION_PROMPTS: Record<AIAction, string> = {
  "punch-up": "Make this text more powerful, impactful, and engaging. Add energy and confidence. Keep the core message but make it hit harder.",
  "shorten": "Condense this text to its essential message. Remove fluff and unnecessary words while keeping the key point clear and impactful.",
  "curious": "Rewrite this as a curiosity-driven hook that makes people want to know more. Use intrigue, open loops, and compelling questions or statements.",
  "brutal": "Make this more direct, raw, and brutally honest. No sugar-coating. Be bold and confrontational in a way that grabs attention.",
  "bullets": "Convert this text into a concise bullet point list. Each point should be clear, actionable, and easy to scan.",
  "casual": "Rewrite this in a more casual, conversational tone. Make it feel like you're talking to a friend. Use simpler words and a relaxed vibe.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, action } = body as { text: string; action: AIAction };

    if (!text || !action) {
      return NextResponse.json(
        { error: "Missing required fields: text, action" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_APIKEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const actionPrompt = ACTION_PROMPTS[action];
    if (!actionPrompt) {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional content editor helping to enhance video scripts. Follow the user's instructions precisely. Return ONLY the enhanced text with no explanations, quotes, or markdown formatting.`,
        },
        {
          role: "user",
          content: `${actionPrompt}\n\nOriginal text:\n${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhanced = completion.choices[0]?.message?.content?.trim();

    if (!enhanced) {
      throw new Error("No response from AI");
    }

    // Remove any quotes that might wrap the response
    const cleanedEnhanced = enhanced.replace(/^["']|["']$/g, "");

    return NextResponse.json({ enhanced: cleanedEnhanced });
  } catch (error: any) {
    console.error("Error enhancing text:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance text" },
      { status: 500 }
    );
  }
}

