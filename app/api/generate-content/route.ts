import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, quantity, category, userContext, styleExamples } = body;

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

    // Build category instruction
    let categoryInstruction = "";
    if (category && category !== "mixed") {
      const categoryMap: Record<string, string> = {
        "case-study": "Focus on CASE STUDIES - real examples and success stories with specific numbers and timeframes (e.g., 'I Built This App in 14 Days… Now It Makes $30K/Month')",
        "personal-results": "Focus on PERSONAL RESULTS - your achievements and milestones that inspire (e.g., 'How I Went From Broke To Retiring My Mom at 21')",
        "step-by-step": "Focus on STEP-BY-STEP GUIDES - actionable tutorials and frameworks (e.g., 'The No BS Guide To Quit Your Job in 90 Days and Hit $10K/Month')",
        "contrarian": "Focus on CONTRARIAN TAKES - bold statements and urgent opportunities (e.g., 'The Gold Rush Is Here: Build an AI App in 48 Hours and Quit Your Job')",
        "tutorial": "Focus on TUTORIALS - how-to and instructional content (e.g., 'How To Go From 0 to 1,000 Users With Your App')",
        "comparison": "Focus on COMPARISONS - before/after transformations and cloning success (e.g., 'I Cloned a $300M/Year App in 67 Minutes')"
      };
      categoryInstruction = `\n\nCATEGORY FOCUS:\n${categoryMap[category] || ""}`;
    }

    // Build the prompt with style examples prominently featured
    const contentType = platform === "youtube" ? "YouTube video titles" : "X/Twitter posts";
    const styleExamplesText = styleExamples && styleExamples.length > 0
      ? `\n\nSTYLE EXAMPLES (Study these CAREFULLY - match this exact style, tone, and structure):\n${styleExamples.map((ex: string, i: number) => `${i + 1}. ${ex}`).join('\n')}`
      : '';

    const detailedInstructionsText = userContext.detailedInstructions
      ? `\n\nDETAILED INSTRUCTIONS (Follow these EXACTLY):\n${userContext.detailedInstructions}`
      : '';

    let prompt = "";
    
    if (platform === "x") {
      // X/Twitter specific prompt for full tweets
      prompt = `You are an expert X/Twitter content creator crafting viral tweets for a successful entrepreneur.

ABOUT THE CREATOR:
${userContext.aboutYou || "An ambitious entrepreneur building and scaling digital products."}

STYLE GUIDELINES:
• Tone: ${userContext.tone || "Confident, transparent, results-driven"}
• Target Audience: ${userContext.targetAudience || "Aspiring entrepreneurs and app builders"}
• Content Pillars: ${userContext.contentPillars || "Building in public, growth strategies, monetization"}
• Topics to Avoid: ${userContext.topicsToAvoid || "None"}${detailedInstructionsText}${categoryInstruction}${styleExamplesText}

TWEET WRITING RULES:
1. Write COMPLETE, STANDALONE tweets (not just titles or hooks)
2. Each tweet should be 150-280 characters
3. Use line breaks for readability when appropriate
4. Include numbers, metrics, and results when relevant
5. Use emojis sparingly (max 1-2 per tweet)
6. Capitalize: App, AI, Apps, SaaS, MRR, ARR, Users
7. Be conversational and authentic
8. End with a hook, question, or call to action when appropriate
9. Match the style examples above - study their structure and voice

TWEET TYPES TO GENERATE:
- Personal wins and results
- Quick tips and insights
- Bold statements and hot takes
- Behind-the-scenes updates
- Engaging questions
- Lessons learned
- Progress updates

Generate exactly ${quantity} complete X/Twitter posts. Each should be engaging, authentic, and ready to post.

Return ONLY a valid JSON array of strings. No markdown, no explanation, just ["tweet 1", "tweet 2", ...].`;
    } else {
      // YouTube titles prompt
      prompt = `You are an expert content strategist creating ${contentType} for a successful entrepreneur.

ABOUT THE CREATOR:
${userContext.aboutYou || "An ambitious entrepreneur building and scaling digital products."}

STYLE GUIDELINES:
• Tone: ${userContext.tone || "Confident, transparent, results-driven"}
• Target Audience: ${userContext.targetAudience || "Aspiring entrepreneurs and app builders"}
• Content Pillars: ${userContext.contentPillars || "Building in public, growth strategies, monetization"}
• Topics to Avoid: ${userContext.topicsToAvoid || "None"}${detailedInstructionsText}${categoryInstruction}${styleExamplesText}

CRITICAL FORMATTING RULES:
1. Study the style examples above - they are PERFECT examples. Match their:
   - Use of numbers and specific metrics ($30K, 14 Days, etc.)
   - Capitalization patterns (capitalize: App, AI, MRR, SaaS, etc.)
   - Emotional hooks and urgency
   - Personal pronouns (I, My)
   - Parenthetical additions for context
2. Use BOLD claims and SPECIFIC numbers
3. Include timeframes when relevant (14 Days, 48 Hours, 90 Days)
4. Use "…" for dramatic pauses, not "..."
5. Capitalize key terms: App, AI, Apps, SaaS, MRR, ARR, Users
6. Be results-focused with dollar amounts when possible

Generate exactly ${quantity} YouTube video titles that are compelling, click-worthy, and match the style examples above EXACTLY.

Return ONLY a valid JSON array of strings. No markdown, no explanation, just ["title 1", "title 2", ...].`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content strategist who creates viral, results-driven content titles. You always match the exact style and formatting of provided examples. You return ONLY valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      console.error("No response from OpenAI");
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response - handle markdown code blocks
    let ideas: string[];
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText;
      if (responseText.includes("```")) {
        // Extract JSON from markdown code block
        const match = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (match) {
          cleanedText = match[1];
        } else {
          // Try to find any JSON array
          const arrayMatch = responseText.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            cleanedText = arrayMatch[0];
          }
        }
      }

      ideas = JSON.parse(cleanedText);
      
      if (!Array.isArray(ideas)) {
        console.error("Response is not an array:", cleanedText);
        throw new Error("Response is not an array");
      }

      // Validate that all items are strings
      ideas = ideas.filter(item => typeof item === "string" && item.trim().length > 0);
      
      if (ideas.length === 0) {
        console.error("No valid ideas in response:", cleanedText);
        throw new Error("No valid ideas generated");
      }

      console.log(`Successfully generated ${ideas.length} ideas`);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", responseText);
      console.error("Parse error:", parseError);
      throw new Error("Invalid response format from AI. Please try again.");
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

