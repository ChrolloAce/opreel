"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/auth/login-screen";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Youtube, Twitter, Upload, Loader2 } from "lucide-react";
import { Platform, ContentStatus } from "@/lib/content-data";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface UserSettings {
  youtubeHandle: string;
  youtubeAvatar: string;
  xHandle: string;
  xAvatar: string;
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AuthenticatedSettings user={user} onSignOut={signOut} />;
}

function AuthenticatedSettings({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const [settings, setSettings] = useState<UserSettings>({
    youtubeHandle: "",
    youtubeAvatar: "",
    xHandle: "",
    xAvatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingYT, setUploadingYT] = useState(false);
  const [uploadingX, setUploadingX] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  const ytFileInputRef = useRef<HTMLInputElement>(null);
  const xFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.uid) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserSettings;
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    platform: "youtube" | "x"
  ): Promise<string> => {
    if (!user?.uid) throw new Error("No user");

    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(
      storage,
      `users/${user.uid}/avatars/${platform}_${fileName}`
    );

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleYoutubeImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingYT(true);
    try {
      const url = await handleImageUpload(file, "youtube");
      setSettings((prev) => ({ ...prev, youtubeAvatar: url }));
    } catch (error) {
      console.error("Error uploading YouTube avatar:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingYT(false);
    }
  };

  const handleXImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingX(true);
    try {
      const url = await handleImageUpload(file, "x");
      setSettings((prev) => ({ ...prev, xAvatar: url }));
    } catch (error) {
      console.error("Error uploading X avatar:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingX(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, settings, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        onPlatformChange={setPlatformFilter}
        onStatusChange={setStatusFilter}
        onSignOut={onSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Customize your YouTube and X profiles
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">

            {/* YouTube Settings */}
            <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Youtube className="w-5 h-5 text-red-500" />
                YouTube Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {settings.youtubeAvatar ? (
                    <img
                      src={settings.youtubeAvatar}
                      alt="YouTube Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                      YT
                    </div>
                  )}
                  <input
                    ref={ytFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleYoutubeImageChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => ytFileInputRef.current?.click()}
                    disabled={uploadingYT}
                    className="gap-2"
                  >
                    {uploadingYT ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingYT ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
              </div>

              {/* Handle */}
              <div className="space-y-2">
                <Label htmlFor="youtube-handle">Channel Handle</Label>
                <Input
                  id="youtube-handle"
                  placeholder="@YourChannelName"
                  value={settings.youtubeHandle}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      youtubeHandle: e.target.value,
                    }))
                  }
                  className="bg-background"
                />
              </div>
            </CardContent>
            </Card>

            {/* X/Twitter Settings */}
            <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Twitter className="w-5 h-5 text-blue-400" />
                X / Twitter Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {settings.xAvatar ? (
                    <img
                      src={settings.xAvatar}
                      alt="X Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      X
                    </div>
                  )}
                  <input
                    ref={xFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleXImageChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => xFileInputRef.current?.click()}
                    disabled={uploadingX}
                    className="gap-2"
                  >
                    {uploadingX ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingX ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
              </div>

              {/* Handle */}
              <div className="space-y-2">
                <Label htmlFor="x-handle">X Handle</Label>
                <Input
                  id="x-handle"
                  placeholder="@yourhandle"
                  value={settings.xHandle}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      xHandle: e.target.value,
                    }))
                  }
                  className="bg-background"
                />
              </div>
            </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 text-base"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

