"use client";

import React, { useState } from "react";
import { X, Sparkles, Loader2, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentItem, ScriptSection } from "@/lib/content-data";
import { cn } from "@/lib/utils";

interface AIAssistPanelProps {
  item: ContentItem;
  onClose: () => void;
  onGenerate: (content: string, sectionType: ScriptSection["type"]) => void;
}

type AITemplate =
  | "hook-from-title"
  | "full-script"
  | "youtube-description"
  | "x-thread"
  | "expand-section";

const AI_TEMPLATES: { value: AITemplate; label: string; description: string; icon: any }[] = [
  {
    value: "hook-from-title",
    label: "Generate Hook",
    description: "Create an attention-grabbing hook from your video title",
    icon: Zap,
  },
  {
    value: "full-script",
    label: "Write Full Script",
    description: "Generate a complete video script based on your title and notes",
    icon: FileText,
  },
  {
    value: "youtube-description",
    label: "YouTube Description",
    description: "Create a YouTube description from your script",
    icon: FileText,
  },
  {
    value: "x-thread",
    label: "Convert to X Thread",
    description: "Turn your script into a Twitter/X thread",
    icon: FileText,
  },
];

export function AIAssistPanel({ item, onClose, onGenerate }: AIAssistPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<AITemplate | null>(null);

  const handleGenerate = async (template: AITemplate) => {
    setActiveTemplate(template);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          title: item.title,
          platform: item.platform,
          existingScript: item.script,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate content");

      const data = await response.json();
      
      // Determine which section to update based on template
      let sectionType: ScriptSection["type"] = "main";
      if (template === "hook-from-title") sectionType = "hook";
      else if (template === "full-script") sectionType = "main";
      
      onGenerate(data.content, sectionType);
      onClose();
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
      setActiveTemplate(null);
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card animate-in slide-in-from-right duration-200">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold">AI Assist</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-4 space-y-3">
          {AI_TEMPLATES.map((template) => {
            const Icon = template.icon;
            const isActive = activeTemplate === template.value;
            const isDisabled = isGenerating;

            return (
              <button
                key={template.value}
                onClick={() => handleGenerate(template.value)}
                disabled={isDisabled}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  "hover:bg-accent hover:border-primary",
                  isActive && "bg-accent border-primary",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {isActive && isGenerating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{template.label}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Context Info */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">AI will use:</strong>
              <br />
              • Your video title
              <br />
              • Platform context ({item.platform})
              <br />
              • Your AI settings from Content Library
              <br />• Any existing script sections
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

