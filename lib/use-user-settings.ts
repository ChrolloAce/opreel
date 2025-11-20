import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserSettings {
  youtubeHandle: string;
  youtubeAvatar: string;
  xHandle: string;
  xAvatar: string;
}

export function useUserSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings>({
    youtubeHandle: "@YourChannel",
    youtubeAvatar: "",
    xHandle: "@yourhandle",
    xAvatar: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const docRef = doc(db, "users", userId);
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

    loadSettings();
  }, [userId]);

  return { settings, loading };
}

