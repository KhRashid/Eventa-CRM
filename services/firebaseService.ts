// fix: Use Firebase v9 compat libraries to support v8 syntax.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import { db, storage, auth } from '../firebaseConfig';
import { Venue, UserProfile, Role, UserWithRoles } from '../types';
import { INITIAL_ROLES } from "../constants";

const venuesCollectionRef = db.collection('venues');
const usersCollectionRef = db.collection('users');
const rolesCollectionRef = db.collection('roles');


// Helper to convert Firestore doc to Venue type
const docToVenue = (docSnap: firebase.firestore.DocumentSnapshot): Venue => {
    const data = docSnap.data();
    if (!data) {
        throw new Error(`Document data not found for doc id: ${docSnap.id}`);
    }

    const mapDataToVenue = (data: firebase.firestore.DocumentData): Partial<Venue> => {
        const venueData: any = {};
        for (const key in data) {
            if (data[key] instanceof firebase.firestore.Timestamp) {
                venueData[key] = (data[key] as firebase.firestore.Timestamp).toDate().toISOString();
            } else {
                venueData[key] = data[key];
            }
        }
        return venueData;
    };

    return {
        id: docSnap.id,
        ...mapDataToVenue(data),
    } as Venue;
};


export const fetchData = async (): Promise<Venue[]> => {
  const q = venuesCollectionRef.orderBy('created_at', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(docToVenue);
};

export const updateData = async (venue: Venue): Promise<Venue> => {
  const { id, ...venueData } = venue;
  // Firestore does not allow updating the 'id' field within the document data.
  // @ts-ignore
  delete venueData.id;
  
  const venueDocRef = db.collection('venues').doc(id);

  await venueDocRef.update({
      ...venueData,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
  });
  
  const updatedDocSnapshot = await venueDocRef.get();
  if (updatedDocSnapshot.exists) {
      return docToVenue(updatedDocSnapshot);
  } else {
      throw new Error("Failed to fetch updated document");
  }
};

export const createData = async (): Promise<Venue> => {
    const newVenueData = {
        name: 'Новый ресторан',
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        address: '',
        base_rental_fee_azn: 0,
        capacity_max: 0,
        capacity_min: 0,
        contact: { email: '', person: '', phone: '' },
        cuisine: [],
        district: '',
        facilities: [],
        location_lat: 0,
        location_lng: 0,
        media: { photos: [], videos: [] },
        menu: [],
        policies: {
            alcohol_allowed: false,
            corkage_fee_azn: 0,
            outside_catering_allowed: false,
            price_per_person_azn_from: 0,
            price_per_person_azn_to: 0,
        },
        services: [],
        suitable_for: [],
        tags: [],
    };

    const docRef = await venuesCollectionRef.add(newVenueData);
    const newDocSnapshot = await docRef.get();
    if (newDocSnapshot.exists) {
      return docToVenue(newDocSnapshot);
    } else {
        // Fallback for optimistic update if getDoc fails immediately
        return {
            id: docRef.id,
            ...newVenueData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Venue
    }
};

export const deleteData = async (venueId: string): Promise<void> => {
  const venueDocRef = db.collection('venues').doc(venueId);
  await venueDocRef.delete();
};

export const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = storage.ref(`venues/${fileName}`);
    const uploadTask = await storageRef.put(file);
    const downloadURL = await uploadTask.ref.getDownloadURL();
    return downloadURL;
};

// --- User Profile Functions ---

export const getUserProfile = async (uid: string): Promise<UserProfile> => {
    const userDocRef = usersCollectionRef.doc(uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
        return docSnap.data() as UserProfile;
    } else {
        const user = auth.currentUser;
        if (!user) throw new Error("Пользователь не аутентифицирован");
        
        const defaultDisplayName = user.displayName || user.email?.split('@')[0] || 'Новый пользователь';

        const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: defaultDisplayName,
            phone: '',
            roleIds: [], // Default to no roles
        };
        await userDocRef.set(newUserProfile);
        return newUserProfile;
    }
};

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        if (profileData.displayName !== undefined && profileData.displayName !== user.displayName) {
            await user.updateProfile({ displayName: profileData.displayName });
        }
    } else {
        throw new Error("Пользователь не аутентифицирован для обновления профиля");
    }

    const userDocRef = usersCollectionRef.doc(uid);
    await userDocRef.update(profileData);
};

export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("Пользователь не аутентифицирован.");
    }

    // Re-authenticate user
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    
    try {
        await user.reauthenticateWithCredential(credential);
    } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
            throw new Error('Текущий пароль введен неверно.');
        }
        throw new Error('Ошибка повторной аутентификации.');
    }

    // If re-authentication is successful, update the password
    try {
        await user.updatePassword(newPassword);
    } catch (error: any) {
         if (error.code === 'auth/weak-password') {
            throw new Error('Новый пароль слишком слабый. Он должен содержать не менее 6 символов.');
        }
        throw new Error('Не удалось обновить пароль.');
    }
};


// --- Role Management Functions ---

export const getRoles = async (): Promise<Role[]> => {
    const snapshot = await rolesCollectionRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
};

export const createRole = async (roleData: Omit<Role, 'id'>): Promise<Role> => {
    const docRef = await rolesCollectionRef.add(roleData);
    return { id: docRef.id, ...roleData };
};

export const updateRole = async (role: Role): Promise<void> => {
    const { id, ...roleData } = role;
    await rolesCollectionRef.doc(id).update(roleData);
};

export const deleteRole = async (roleId: string): Promise<void> => {
    await rolesCollectionRef.doc(roleId).delete();
};

export const seedInitialRoles = async (): Promise<void> => {
    const batch = db.batch();
    INITIAL_ROLES.forEach(role => {
        const docRef = rolesCollectionRef.doc(); // Automatically generate unique ID
        batch.set(docRef, role);
    });
    await batch.commit();
};

// --- User and Role Assignment Functions ---

export const getUsersWithRoles = async (): Promise<UserWithRoles[]> => {
    const [usersSnapshot, rolesSnapshot] = await Promise.all([
        usersCollectionRef.get(),
        rolesCollectionRef.get()
    ]);

    const roles = rolesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
    const rolesMap = new Map(roles.map(role => [role.id, role]));

    const users = usersSnapshot.docs.map(doc => {
        const userProfile = doc.data() as UserProfile;
        const assignedRoles = (userProfile.roleIds || [])
            .map(roleId => rolesMap.get(roleId))
            .filter((role): role is Role => role !== undefined);
        
        return {
            ...userProfile,
            uid: doc.id,
            roles: assignedRoles
        };
    });

    return users;
};

export const updateUserRoles = async (uid: string, roleIds: string[]): Promise<void> => {
    await usersCollectionRef.doc(uid).update({ roleIds });
};