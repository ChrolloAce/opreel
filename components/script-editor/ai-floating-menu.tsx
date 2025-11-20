"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AIFloatingMenuProps {
  selectedText: string;
  position: { top: number; left: number } | null;
  onReplace: (newText: string) => void;
  onInsert: (newText: string) => void;
  onClose: () => void;
}

type AIAction = "punch-up" | "shorten" | "curious" | "brutal" | "bullets" | "casual";

const AI_ACTIONS: { value: AIAction; label: string }[] = [
  { value: "punch-up", label: "Punch Up" },
  { value: "shorten", label: "Shorten" },
  { value: "curious", label: "Curious Hook" },
  { value: "brutal", label: "More Brutal" },
  { value: "bullets", label: "→ Bullets" },
  { value: "casual", label: "More Casual" },
];

export function AIFloatingMenu({
  selectedText,
  position,
  onReplace,
  onInsert,
  onClose,
}: AIFloatingMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);

  if (!position || !selectedText) return null;

  const handleAction = async (action: AIAction) => {
    setActiveAction(action);
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          action,
        }),
      });

      if (!response.ok) throw new Error("Failed to enhance text");
      
      const data = await response.json();
      setSuggestion(data.enhanced);
    } catch (error) {
      console.error("Error enhancing text:", error);
      alert("Failed to enhance text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplace = () => {
    if (suggestion) {
      onReplace(suggestion);
      handleClose();
    }
  };

  const handleInsert = () => {
    if (suggestion) {
      onInsert(suggestion);
      handleClose();
    }
  };

  const handleClose = () => {
    setSuggestion(null);
    setActiveAction(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleClose}
      />

      {/* Floating Menu */}
      <div
        className="fixed z-50 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translate(-50%, 8px)",
        }}
      >
        {!suggestion ? (
          // Action Pills
          <div className="flex items-center gap-1 rounded-full border border-border bg-background/95 backdrop-blur-xl px-2 py-1.5 shadow-lg">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 mr-1" />
            {AI_ACTIONS.map((action) => (
              <button
                key={action.value}
                onClick={() => handleAction(action.value)}
                disabled={isProcessing}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  activeAction === action.value && "bg-accent text-accent-foreground",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
              >
                {isProcessing && activeAction === action.value ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        ) : (
          // Suggestion Preview Card
          <Card className="w-[420px] max-w-[90vw] p-4 shadow-2xl">
            <div className="space-y-3">
              {/* Original Text */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Original
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedText}
                </p>
              </div>

              {/* Suggested Text */}
              <div>
                <p className="text-xs font-medium text-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                  AI Suggestion
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {suggestion}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleReplace}
                  className="flex-1"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleInsert}
                  className="flex-1"
                >
                  Insert Below
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

