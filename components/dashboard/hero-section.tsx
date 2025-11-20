"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentItem } from "@/lib/content-data";

interface HeroSectionProps {
  items: ContentItem[];
  isLoading?: boolean;
}

export function HeroSection({ items, isLoading }: HeroSectionProps) {
  // Remove hero section for YouTube-style layout
  return null;
}

function HeroSkeleton() {
  return null;
}

