"use client";

import React from "react";
import { useParams } from "next/navigation";
import { UserProfileView } from "@/components/profile/user-profile-view";

export default function PublicUserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id || "");
  return <UserProfileView profileId={id} />;
}
