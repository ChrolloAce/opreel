import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

type AITemplate = "hook-from-title" | "full-script" | "youtube-description" | "x-thread";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, title, platform, existingScript } = body;

    if (!template || !title) {
      return NextResponse.json(
        { error: "Missing required fields: template, title" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_APIKEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    let prompt = "";
    let systemPrompt = "You are an expert content writer helping to create engaging video scripts and social media content. Write in a clear, engaging, and professional style.";

    switch (template) {
      case "hook-from-title":
        prompt = `Create a powerful, attention-grabbing hook for a ${platform} video with this title:

"${title}"

The hook should:
- Be 2-3 sentences maximum
- Create curiosity or urgency
- Make viewers want to keep watching
- Match the energy of the title
- Be direct and impactful

Return ONLY the hook text, no explanations.`;
        break;

      case "full-script":
        prompt = `Write a complete video script for this ${platform} video:

Title: "${title}"

The script should include:
1. Hook (2-3 sentences to grab attention)
2. Intro (introduce yourself and the topic)
3. Main Content (deliver the core value, insights, or story)
4. Call to Action (what viewers should do next)

Style:
- Conversational and engaging
- Clear and easy to follow
- Include natural transitions
- Match the energy and promise of the title
- For YouTube: aim for 5-7 minutes of content
- Use "I" and "you" to make it personal

Return the full script with clear section headings.`;
        break;

      case "youtube-description":
        const scriptText = existingScript?.sections
          ?.map((s: any) => s.content.replace(/<[^>]*>/g, " "))
          .join("\n\n");
        
        prompt = `Create a YouTube video description based on this:

Title: "${title}"

${scriptText ? `Script:\n${scriptText.substring(0, 1000)}...` : ""}

The description should include:
- Compelling opening line (hook)
- Brief summary of what viewers will learn
- Timestamps (if multiple sections)
- Call to action
- Relevant hashtags
- Links section placeholder

Format it professionally for YouTube.`;
        break;

      case "x-thread":
        const scriptForThread = existingScript?.sections
          ?.map((s: any) => s.content.replace(/<[^>]*>/g, " "))
          .join("\n\n");

        prompt = `Convert this video content into an engaging X/Twitter thread:

Title: "${title}"

${scriptForThread ? `Content:\n${scriptForThread.substring(0, 1500)}...` : ""}

Create a thread that:
- Starts with a hook tweet (attention-grabbing)
- Breaks down the key points into 5-8 tweets
- Each tweet should be 200-280 characters
- Uses line breaks for readability
- Includes emojis sparingly (1-2 per tweet max)
- Ends with a CTA
- Capitalizes: App, AI, MRR, SaaS, Apps

Return each tweet separated by "---" on its own line.`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid template type" },
          { status: 400 }
        );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No response from AI");
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error generating script:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}

