import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { UserProfile } from "./content-data";

/**
 * Get user profile including team members
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Initialize user profile if it doesn't exist
 */
export async function initializeUserProfile(
  userId: string,
  email: string,
  displayName?: string,
  photoURL?: string
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: userId,
        email,
        displayName: displayName || "",
        photoURL: photoURL || "",
        teamMembers: [],
      });
    }
  } catch (error) {
    console.error("Error initializing user profile:", error);
    throw error;
  }
}

/**
 * Add a team member by email (gives them access to your content)
 */
export async function addTeamMember(
  ownerUserId: string,
  memberEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", memberEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        success: false,
        error: "No user found with that email. They need to sign up first.",
      };
    }
    
    const memberUserId = querySnapshot.docs[0].id;
    
    // Don't allow adding yourself
    if (memberUserId === ownerUserId) {
      return {
        success: false,
        error: "You cannot add yourself as a team member.",
      };
    }
    
    // Add member to owner's team list
    const ownerRef = doc(db, "users", ownerUserId);
    await updateDoc(ownerRef, {
      teamMembers: arrayUnion(memberUserId),
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error adding team member:", error);
    return {
      success: false,
      error: error.message || "Failed to add team member",
    };
  }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(
  ownerUserId: string,
  memberUserId: string
): Promise<void> {
  try {
    const ownerRef = doc(db, "users", ownerUserId);
    await updateDoc(ownerRef, {
      teamMembers: arrayRemove(memberUserId),
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    throw error;
  }
}

/**
 * Get list of users who have given you access to their content
 */
export async function getAccessibleWorkspaces(userId: string): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("teamMembers", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    
    const workspaces: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      workspaces.push(doc.data() as UserProfile);
    });
    
    return workspaces;
  } catch (error) {
    console.error("Error fetching accessible workspaces:", error);
    throw error;
  }
}

/**
 * Get details of team members
 */
export async function getTeamMemberDetails(memberIds: string[]): Promise<UserProfile[]> {
  try {
    const members: UserProfile[] = [];
    
    for (const memberId of memberIds) {
      const docRef = doc(db, "users", memberId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        members.push(docSnap.data() as UserProfile);
      }
    }
    
    return members;
  } catch (error) {
    console.error("Error fetching team member details:", error);
    throw error;
  }
}

