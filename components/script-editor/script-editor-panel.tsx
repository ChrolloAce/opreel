"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Sparkles, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentItem, ContentStatus, ScriptSection } from "@/lib/content-data";
import { RichTextEditor } from "./rich-text-editor";
import { AIFloatingMenu } from "./ai-floating-menu";
import { AIAssistPanel } from "./ai-assist-panel";
import { cn } from "@/lib/utils";

interface ScriptEditorPanelProps {
  item: ContentItem;
  onClose: () => void;
  onUpdate: (updates: Partial<ContentItem>) => void;
}

const SECTION_TEMPLATES: { type: ScriptSection["type"]; label: string; placeholder: string }[] = [
  { type: "hook", label: "Hook", placeholder: "Write your attention-grabbing hook..." },
  { type: "intro", label: "Intro", placeholder: "Introduce the topic..." },
  { type: "main", label: "Main Content", placeholder: "Your main value and content..." },
  { type: "cta", label: "Call to Action", placeholder: "What should viewers do next?" },
  { type: "notes", label: "Notes", placeholder: "Any notes or reminders for yourself..." },
];

export function ScriptEditorPanel({ item, onClose, onUpdate }: ScriptEditorPanelProps) {
  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState<ContentStatus>(item.status);
  const [sections, setSections] = useState<ScriptSection[]>(
    item.script?.sections || SECTION_TEMPLATES.map((template, index) => ({
      id: `section-${index}`,
      type: template.type,
      content: "",
      order: index,
    }))
  );
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // AI floating menu state
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculate word count
  const wordCount = sections.reduce((count, section) => {
    const text = section.content.replace(/<[^>]*>/g, " ");
    return count + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  // Autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [sections, title, status]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await onUpdate({
        title,
        status,
        script: {
          sections,
          currentVersion: "current",
          versions: [],
          wordCount,
          lastEditedAt: new Date().toISOString(),
        },
      });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving script:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionUpdate = (index: number, content: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], content };
    setSections(newSections);
  };

  const handleSelectionChange = useCallback((text: string, range: { from: number; to: number } | null) => {
    setSelectedText(text);
    setSelectionRange(range);
    
    if (text && range) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX,
        });
      }
    } else {
      setMenuPosition(null);
    }
  }, []);

  const handleReplaceText = (newText: string) => {
    // Replace the selected text in the active section
    const section = sections[activeSection];
    const content = section.content;
    // For now, just append the new text (Tiptap integration would handle proper replacement)
    handleSectionUpdate(activeSection, content + "\n\n" + newText);
  };

  const handleInsertText = (newText: string) => {
    const section = sections[activeSection];
    handleSectionUpdate(activeSection, section.content + "\n\n" + newText);
  };

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return "";
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 5) return "Saved just now";
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `Saved ${minutes}m ago`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-5xl bg-background border-l border-border z-50 animate-in slide-in-from-right duration-300 flex">
        {/* Left Sidebar - Video Info */}
        <div className="w-80 border-r border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Video Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Thumbnail */}
          {item.thumbnailUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={item.thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ContentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="script">Script Draft</SelectItem>
                <SelectItem value="filming">Ready to Record</SelectItem>
                <SelectItem value="editing">Filmed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section Chips */}
          <div className="space-y-2">
            <Label>Jump to Section</Label>
            <div className="flex flex-wrap gap-2">
              {SECTION_TEMPLATES.map((template, index) => (
                <button
                  key={template.type}
                  onClick={() => setActiveSection(index)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                    activeSection === index
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border hover:bg-accent"
                  )}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Word Count</span>
              <Badge variant="secondary">{wordCount.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : getTimeSinceLastSave()}
            </div>
          </div>

          {/* AI Assist Button */}
          <Button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
            AI Assist
          </Button>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto py-8">
              {/* Section Header */}
              <div className="px-8 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="uppercase tracking-wide text-xs">
                    {SECTION_TEMPLATES[activeSection].label}
                  </Badge>
                  {activeSection > 0 && (
                    <button
                      onClick={() => setActiveSection(activeSection - 1)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      ← Previous
                    </button>
                  )}
                  {activeSection < sections.length - 1 && (
                    <button
                      onClick={() => setActiveSection(activeSection + 1)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Next →
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-semibold">
                  {SECTION_TEMPLATES[activeSection].label}
                </h2>
              </div>

              {/* Rich Text Editor */}
              <div className="bg-card rounded-2xl border border-border shadow-sm">
                <RichTextEditor
                  content={sections[activeSection].content}
                  onChange={(content) => handleSectionUpdate(activeSection, content)}
                  placeholder={SECTION_TEMPLATES[activeSection].placeholder}
                  onSelectionChange={handleSelectionChange}
                />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* AI Assist Side Panel */}
        {showAIPanel && (
          <AIAssistPanel
            item={item}
            onClose={() => setShowAIPanel(false)}
            onGenerate={(content, sectionType) => {
              const sectionIndex = sections.findIndex(s => s.type === sectionType);
              if (sectionIndex >= 0) {
                handleSectionUpdate(sectionIndex, content);
                setActiveSection(sectionIndex);
              }
            }}
          />
        )}
      </div>

      {/* AI Floating Menu */}
      <AIFloatingMenu
        selectedText={selectedText}
        position={menuPosition}
        onReplace={handleReplaceText}
        onInsert={handleInsertText}
        onClose={() => {
          setMenuPosition(null);
          setSelectedText("");
        }}
      />
    </>
  );
}

