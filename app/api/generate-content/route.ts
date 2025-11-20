import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, quantity, customPrompt, userContext, styleExamples } = body;

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

    // Build the prompt hierarchy (custom prompt has HIGHEST priority)
    const hasCustomPrompt = customPrompt && customPrompt.trim();
    
    const customPromptSection = hasCustomPrompt
      ? `\n\n🎯 PRIMARY DIRECTIVE - CUSTOM INSTRUCTIONS (THIS OVERRIDES EVERYTHING ELSE):\n${customPrompt.trim()}\n\n⚠️ CRITICAL: These custom instructions are THE MOST IMPORTANT. Follow them above all else. They define what topics and angles to focus on.`
      : '';

    const styleExamplesText = styleExamples && styleExamples.length > 0
      ? `\n\n📝 WRITING STYLE REFERENCE (Study the WRITING STYLE ONLY - not the topics):\n${styleExamples.map((ex: string, i: number) => `${i + 1}. ${ex}`).join('\n')}\n\n⚠️ IMPORTANT: These examples show you HOW to write (tone, structure, punctuation, capitalization). DO NOT copy the topics/concepts - only the writing style, rhythm, and formatting.`
      : '';

    const detailedInstructionsText = userContext.detailedInstructions
      ? `\n\n📋 DETAILED RULES (Follow these STRICTLY):\n${userContext.detailedInstructions}`
      : '';

    let prompt = "";
    
    if (platform === "x") {
      // X/Twitter specific prompt for full tweets
      prompt = `You are an expert X/Twitter content creator. Your job is to write viral tweets that match a specific writing style while following custom instructions.

ABOUT THE CREATOR:
${userContext.aboutYou || "An ambitious entrepreneur building and scaling digital products."}

BASE STYLE GUIDELINES:
• Tone: ${userContext.tone || "Confident, transparent, results-driven"}
• Target Audience: ${userContext.targetAudience || "Aspiring entrepreneurs and app builders"}
• Content Pillars: ${userContext.contentPillars || "Building in public, growth strategies, monetization"}
• Topics to Avoid: ${userContext.topicsToAvoid || "None"}${detailedInstructionsText}${customPromptSection}${styleExamplesText}

MANDATORY WRITING RULES (NON-NEGOTIABLE):
1. Write COMPLETE, STANDALONE tweets (not just titles or hooks)
2. Each tweet should be 100-280 characters (full tweet length)
3. Use line breaks for readability (2-3 line tweets work great)
4. Include numbers, metrics, and results when relevant
5. Use emojis sparingly (max 1-2 per tweet, and only when natural)
6. ALWAYS capitalize: App, AI, Apps, SaaS, MRR, ARR, Users
7. Be conversational and authentic
8. Match the WRITING STYLE from the examples (tone, structure, punctuation)
9. Vary tweet types: stats, lessons, hot takes, questions, updates, stories

${hasCustomPrompt ? '⚠️ REMEMBER: Follow the custom instructions above for WHAT to write about. Use the style examples for HOW to write.' : ''}

Generate exactly ${quantity} complete X/Twitter posts. Each should be engaging, authentic, and ready to post.

Return ONLY a valid JSON array of strings. No markdown, no explanation, just ["tweet 1", "tweet 2", ...].`;
    } else {
      // YouTube titles prompt
      prompt = `You are an expert YouTube title creator. Your job is to create titles that match a specific writing style while following custom topic instructions.

ABOUT THE CREATOR:
${userContext.aboutYou || "An ambitious entrepreneur building and scaling digital products."}

BASE CREATOR GUIDELINES:
• Tone: ${userContext.tone || "Confident, transparent, results-driven"}
• Target Audience: ${userContext.targetAudience || "Aspiring entrepreneurs and app builders"}
• Content Pillars: ${userContext.contentPillars || "Building in public, growth strategies, monetization"}
• Topics to Avoid: ${userContext.topicsToAvoid || "None"}${detailedInstructionsText}${customPromptSection}${styleExamplesText}

MANDATORY WRITING STYLE RULES (MUST FOLLOW ALL - NON-NEGOTIABLE):

1. WRITING STYLE FROM EXAMPLES (Copy HOW they write, NOT WHAT they write about):
   - Study the STRUCTURE and RHYTHM - how sentences flow
   - Study the PUNCTUATION - "…" vs "..." vs parentheses
   - Study the TONE - confident, personal, results-driven
   - Study the FORMATTING - where numbers go, how context is added
   - DO NOT copy the topics/concepts - only the writing style

2. CAPITALIZATION (ABSOLUTELY CRITICAL - NO EXCEPTIONS):
   - App → ALWAYS capitalize (never "app")
   - AI → ALWAYS capitalize (never "ai" or "Ai")
   - MRR → ALWAYS capitalize (never "mrr" or "Mrr")
   - SaaS → ALWAYS capitalize (never "saas" or "Saas")
   - Apps → ALWAYS capitalize (never "apps")
   - Check EVERY title before finalizing

3. PUNCTUATION (STRICT RULES):
   - Use "…" (ellipsis character) NOT "..." (three periods)
   - Use parentheses for context: (NO CODE), (Here's How), (Steal This Strategy)
   - Never use question marks - use statements instead

4. NUMBERS & METRICS (REQUIRED IN EVERY TITLE):
   - MUST include specific dollar amounts: $10K, $30K, $52,000, $100K, $300K
   - MUST include timeframes: 14 Days, 48 Hours, 21 Days, 67 Minutes, 90 Days
   - Use exact formats: "$30K/Month" NOT "$30k per month" or "$30,000/mo"
   - Numbers should be bold and aspirational

5. STRUCTURE PATTERNS (Use these as templates):
   - "I [Action] [Thing]… Now [Result]" → "I Built This App in 14 Days… Now It Makes $30K/Month"
   - "Steal This [Thing] Strategy" → "Steal This $100K/Mo Slideshow App Strategy"
   - "How I [Action] to [Result]" → "How I Went From Broke To Retiring My Mom at 21"
   - "The [Thing] I Used To [Action]" → "The Tech Stack I Used To Build 10 AI Apps and Hit $52,000 MRR"
   - "[Action] [Thing] ([Context])" → "How I Build Profitable Apps FAST (No Code)"

6. FORBIDDEN PATTERNS (NEVER EVER USE THESE):
   - Three dots "..." → ONLY use "…"
   - Lowercase tech terms → ALWAYS capitalize App, AI, MRR, SaaS, Apps
   - Vague numbers → be SPECIFIC ($30K not "a lot of money")
   - Questions → use statements
   - Generic phrases like "From Broke to" without specifics
   - "Want $X?" format → this is weak, use statements

7. CONTENT VARIETY (Generate diverse topics):
   ${hasCustomPrompt 
     ? '- Follow the custom instructions for WHAT topics to cover\n   - Explore different angles within those topics\n   - Vary time periods: 10 Minutes, 48 Hours, 14 Days, 21 Days, 90 Days, 6 Months\n   - Vary results: $1K/Day, $10K/Month, $50K MRR, $100K/Year, $300K, 1M Users'
     : '- Explore different aspects: building, launching, scaling, monetizing, cloning, stealing strategies\n   - Case studies of other Apps: "Steal This $100K/Mo Slideshow App Strategy"\n   - Vary time periods: 10 Minutes, 48 Hours, 14 Days, 21 Days, 90 Days, 6 Months\n   - Vary results: $1K/Day, $10K/Month, $50K MRR, $100K/Year, $300K, 1M Users\n   - Include unexpected angles: "Vibe-Coded", "With ONE Prompt", "While I Sleep"\n   - Mix types: personal wins, case studies, tutorials, lessons, comparisons, strategies to steal'
   }

8. EXAMPLE TITLE PATTERNS (Different angles to explore):
   - Personal case study: "I Built This App in 14 Days… Now It Makes $30K/Month"
   - Steal/copy strategy: "Steal This $100K/Mo Slideshow App Strategy" 
   - Cloning: "I Cloned a $300M/Year App in 67 Minutes"
   - Unexpected hook: "I Vibe-Coded an App That Makes $1,000/Day While I Sleep"
   - Tech stack reveal: "The Tech Stack I Used To Build 10 AI Apps and Hit $52,000 MRR"
   - Life change: "How Building Apps With AI Got Me This Penthouse"
   - Fast execution: "I Built & Launched an Entire App With ONE Prompt"
   - Lesson/tutorial: "The Easiest Way To Build Your App in 20 Minutes"
   - Collection: "100 Micro-App Ideas You Can Build in 48 Hours To Print Cash"

${hasCustomPrompt ? `
⚠️⚠️⚠️ CRITICAL REMINDER - CUSTOM INSTRUCTIONS OVERRIDE:
The custom instructions at the top tell you WHAT topics to focus on.
The style examples show you HOW to write (structure, tone, punctuation).
DO NOT ignore the custom instructions - they are the PRIMARY directive.
Follow them FIRST, then apply the writing style rules.
⚠️⚠️⚠️
` : ''}

Generate exactly ${quantity} titles. Each title MUST:
✅ ${hasCustomPrompt ? 'Follow the CUSTOM INSTRUCTIONS for topic/angle' : 'Explore diverse topics and angles'}
✅ Match the WRITING STYLE from examples (structure, tone, punctuation)
✅ Include specific numbers (time AND money when possible)
✅ CAPITALIZE: App, AI, MRR, SaaS, Apps (NO EXCEPTIONS)
✅ Use "…" NOT "..."
✅ Be unexpected, interesting, and make people curious
✅ Sound like the same person who wrote the style examples

${hasCustomPrompt ? '🎯 START WITH: What does the custom prompt want me to write about?\n🎨 THEN APPLY: How do the style examples want me to write it?' : ''}

Return ONLY a valid JSON array of strings. No markdown, no explanation, just ["title 1", "title 2", ...].`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a master content creator with two key abilities:
1. FOLLOWING INSTRUCTIONS: When given custom instructions, you follow them PRECISELY. They tell you WHAT to write about.
2. STYLE REPLICATION: You analyze writing samples and match their style EXACTLY. They tell you HOW to write.

You NEVER mix these up. Custom instructions = topic/angle. Style examples = tone/structure/formatting.

You follow ALL rules with 100% precision, especially:
- Capitalization (App, AI, MRR, SaaS, Apps - NEVER lowercase)
- Punctuation ("…" not "...")
- Custom instructions (highest priority for content direction)
- Style matching (for writing structure and tone)

You return ONLY valid JSON arrays of strings. No markdown, no explanations.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
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

