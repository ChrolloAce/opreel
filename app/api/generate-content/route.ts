import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, quantity, userContext, styleExamples } = body;

    if (!platform || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: platform, quantity" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_APIKEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt
    const contentType = platform === "youtube" ? "YouTube video titles" : "X/Twitter posts";
    const styleExamplesText = styleExamples && styleExamples.length > 0
      ? `\n\nEXAMPLES OF THEIR STYLE:\n${styleExamples.join('\n')}`
      : '';

    const prompt = `You are a content strategist helping an entrepreneur create ${contentType}.

CONTEXT:
${userContext.aboutYou || "An ambitious entrepreneur building and scaling digital products."}

STYLE GUIDELINES:
Tone: ${userContext.tone || "Confident, transparent, results-driven"}
Target Audience: ${userContext.targetAudience || "Aspiring entrepreneurs and app builders"}
Content Pillars: ${userContext.contentPillars || "Building in public, growth strategies, monetization"}
Topics to Avoid: ${userContext.topicsToAvoid || "None"}${styleExamplesText}

Generate exactly ${quantity} ${contentType} that match their voice and style. 
${platform === "youtube" ? "Make the titles compelling, clear, and click-worthy. Include numbers, results, or timeframes when relevant." : "Make the posts engaging, authentic, and conversation-starting. Keep them under 280 characters."}

Return ONLY a valid JSON array of strings, nothing else. No markdown, no explanation, just the JSON array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a content strategist who generates engaging content ideas. Always return valid JSON arrays of strings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let ideas: string[];
    try {
      ideas = JSON.parse(responseText);
      if (!Array.isArray(ideas)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}

