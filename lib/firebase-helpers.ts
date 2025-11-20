import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { ContentItem } from "./content-data";

export async function fetchUserContent(userId: string): Promise<ContentItem[]> {
  const contentRef = collection(db, "users", userId, "content");
  const q = query(contentRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

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
  try {
    const docRef = doc(db, "users", userId, "content", itemId);
    await deleteDoc(docRef);
    console.log(`Successfully deleted content item: ${itemId}`);
  } catch (error) {
    console.error(`Error deleting content item ${itemId}:`, error);
    throw error;
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

