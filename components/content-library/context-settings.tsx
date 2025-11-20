"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { AISettings } from "@/lib/content-data";
import { cn } from "@/lib/utils";

interface ContextSettingsProps {
  settings: AISettings;
  onSave: (settings: AISettings) => Promise<void>;
}

export function ContextSettings({ settings, onSave }: ContextSettingsProps) {
  const [formData, setFormData] = useState<AISettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof AISettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const aboutYouCount = formData.aboutYou.length;
  const maxChars = 1000;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Context Settings</CardTitle>
        <CardDescription>
          Tell the AI about you and your content style. This context helps generate ideas that match your voice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* About You */}
        <div className="space-y-2">
          <Label htmlFor="aboutYou">About You</Label>
          <Textarea
            id="aboutYou"
            placeholder="Tell us about yourself, your journey, your goals... The more specific, the better."
            className="min-h-[180px] resize-none"
            value={formData.aboutYou}
            onChange={(e) => handleChange("aboutYou", e.target.value)}
            maxLength={maxChars}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>This is the foundation of your AI-generated content</span>
            <span className={cn(
              aboutYouCount > maxChars * 0.9 && "text-yellow-500",
              aboutYouCount === maxChars && "text-red-500"
            )}>
              {aboutYouCount}/{maxChars}
            </span>
          </div>
        </div>

        {/* Detailed Instructions */}
        <div className="space-y-2">
          <Label htmlFor="detailedInstructions">Detailed Generation Instructions</Label>
          <Textarea
            id="detailedInstructions"
            placeholder="Add specific instructions for AI generation... e.g., 'Always capitalize specific words like AI, App, MRR. Use numbers and timeframes. Be bold and results-focused.'"
            className="min-h-[200px] resize-y"
            value={formData.detailedInstructions}
            onChange={(e) => handleChange("detailedInstructions", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Specific formatting rules, style preferences, and generation guidelines (no character limit)
          </p>
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone">Tone & Voice</Label>
          <Input
            id="tone"
            placeholder="e.g., confident, urgent, transparent, inspiring"
            value={formData.tone}
            onChange={(e) => handleChange("tone", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            How should your content sound? (comma-separated adjectives)
          </p>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="e.g., aspiring entrepreneurs, app builders, indie hackers"
            value={formData.targetAudience}
            onChange={(e) => handleChange("targetAudience", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Who are you creating content for?
          </p>
        </div>

        {/* Content Pillars */}
        <div className="space-y-2">
          <Label htmlFor="contentPillars">Content Pillars</Label>
          <Textarea
            id="contentPillars"
            placeholder="e.g., Building in public, Growth strategies, App monetization, Startup exits"
            className="min-h-[100px] resize-none"
            value={formData.contentPillars}
            onChange={(e) => handleChange("contentPillars", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Main themes and topics you cover (comma-separated)
          </p>
        </div>

        {/* Topics to Avoid */}
        <div className="space-y-2">
          <Label htmlFor="topicsToAvoid">Topics to Avoid</Label>
          <Textarea
            id="topicsToAvoid"
            placeholder="e.g., Politics, Controversial topics, Personal drama"
            className="min-h-[80px] resize-none"
            value={formData.topicsToAvoid}
            onChange={(e) => handleChange("topicsToAvoid", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Topics the AI should never suggest (optional)
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

