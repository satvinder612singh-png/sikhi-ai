"use client";

import React, { Suspense } from "react";
import { SubstackPublishingStudio } from "@/components/articles/substack-studio";

export default function WritePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SubstackPublishingStudio />
    </Suspense>
  );
}
