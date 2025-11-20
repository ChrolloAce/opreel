import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  Timestamp,
  getDocsFromServer,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { ContentItem, AISettings } from "./content-data";

export async function fetchUserContent(userId: string): Promise<ContentItem[]> {
  const contentRef = collection(db, "users", userId, "content");
  const q = query(contentRef, orderBy("createdAt", "desc"));
  
  // Force fetch from server, bypass cache
  const snapshot = await getDocsFromServer(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      scheduledFor: data.scheduledFor
        ? data.scheduledFor instanceof Timestamp
          ? data.scheduledFor.toDate().toISOString()
          : data.scheduledFor
        : undefined,
    } as ContentItem;
  });
}

export async function addContentItem(
  userId: string,
  item: Omit<ContentItem, "id">
): Promise<string> {
  const contentRef = collection(db, "users", userId, "content");
  const docRef = await addDoc(contentRef, {
    ...item,
    createdAt: Timestamp.fromDate(new Date(item.createdAt)),
    scheduledFor: item.scheduledFor
      ? Timestamp.fromDate(new Date(item.scheduledFor))
      : null,
  });
  return docRef.id;
}

export async function updateContentItem(
  userId: string,
  itemId: string,
  updates: Partial<ContentItem>
): Promise<void> {
  const docRef = doc(db, "users", userId, "content", itemId);
  const updateData: any = { ...updates };

  // Convert dates to Timestamps if present
  if (updateData.createdAt) {
    updateData.createdAt = Timestamp.fromDate(new Date(updateData.createdAt));
  }
  if (updateData.scheduledFor) {
    updateData.scheduledFor = Timestamp.fromDate(
      new Date(updateData.scheduledFor)
    );
  }

  await updateDoc(docRef, updateData);
}

export async function deleteContentItem(
  userId: string,
  itemId: string
): Promise<void> {
  if (!userId || !itemId) {
    throw new Error("Missing userId or itemId for deletion");
  }

  try {
    const docRef = doc(db, "users", userId, "content", itemId);
    
    // Verify document exists before deleting
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn(`Document ${itemId} does not exist, may have already been deleted`);
      return; // Don't throw error if already deleted
    }
    
    // Delete the document
    await deleteDoc(docRef);
    console.log(`Successfully deleted content item: ${itemId} from Firebase`);
    
    // Wait a moment to ensure Firebase processes the deletion
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (error: any) {
    console.error(`Error deleting content item ${itemId}:`, error);
    throw new Error(`Failed to delete from Firebase: ${error.message}`);
  }
}

export async function uploadThumbnail(
  userId: string,
  file: File
): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `users/${userId}/thumbnails/${fileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// AI Settings functions
export async function saveAISettings(
  userId: string,
  settings: AISettings
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "aiSettings", "config");
    await setDoc(docRef, settings);
    console.log("AI settings saved successfully");
  } catch (error) {
    console.error("Error saving AI settings:", error);
    throw error;
  }
}

export async function getAISettings(userId: string): Promise<AISettings | null> {
  try {
    const docRef = doc(db, "users", userId, "aiSettings", "config");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as AISettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    throw error;
  }
}

export async function getSelectedContentForAI(
  userId: string,
  contentIds: string[]
): Promise<ContentItem[]> {
  try {
    if (contentIds.length === 0) return [];
    
    const contentRef = collection(db, "users", userId, "content");
    const snapshot = await getDocs(contentRef);
    
    return snapshot.docs
      .filter((doc) => contentIds.includes(doc.id))
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
          scheduledFor: data.scheduledFor
            ? data.scheduledFor instanceof Timestamp
              ? data.scheduledFor.toDate().toISOString()
              : data.scheduledFor
            : undefined,
        } as ContentItem;
      });
  } catch (error) {
    console.error("Error fetching selected content:", error);
    throw error;
  }
}

