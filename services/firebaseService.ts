import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import { db, storage, auth } from '../firebaseConfig';
import { Venue, UserProfile, Role, UserWithRoles, Lookup, MenuItem, MenuPackage, Singer, PricingPackage, RepertoireSong } from '../types';
import { INITIAL_ROLES } from "../constants";

const venuesCollectionRef = db.collection('venues');
const usersCollectionRef = db.collection('users');
const rolesCollectionRef = db.collection('roles');
const lookupsCollectionRef = db.collection('lookups');
const menuItemsCollectionRef = db.collection('menu_items');
const menuPackagesCollectionRef = db.collection('menu_packages');
const singersCollectionRef = db.collection('singers');


// Helper to convert Firestore doc to Venue type with backward compatibility
const docToVenue = (docSnap: firebase.firestore.DocumentSnapshot): Venue => {
    const data = docSnap.data();
    if (!data) {
        throw new Error(`Document data not found for doc id: ${docSnap.id}`);
    }

    const mapDataToVenue = (data: firebase.firestore.DocumentData): Partial<Venue> => {
        const venueData: any = {
            customFields: data.customFields || {},
        };
        
        // Backward compatibility: merge legacy fields into customFields if they exist
        ['cuisine', 'facilities', 'services', 'suitable_for'].forEach(key => {
            if (data[key] && !venueData.customFields[key]) {
                venueData.customFields[key] = data[key];
            }
        });

        for (const key in data) {
            if (data[key] instanceof firebase.firestore.Timestamp) {
                venueData[key] = (data[key] as firebase.firestore.Timestamp).toDate().toISOString();
            } else if (key !== 'customFields') { // Avoid re-copying
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
    const venueDocRef = db.collection('venues').doc(id);

    // Prepare data for update
    const dataToUpdate: any = {
        ...venueData,
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Remove legacy fields to avoid writing them back
    delete dataToUpdate.cuisine;
    delete dataToUpdate.facilities;
    delete dataToUpdate.services;
    delete dataToUpdate.suitable_for;
    delete dataToUpdate.menu;

    await venueDocRef.update(dataToUpdate);
    
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
        district: '',
        location_lat: 0,
        location_lng: 0,
        media: { photos: [], videos: [] },
        policies: {
            alcohol_allowed: false,
            corkage_fee_azn: 0,
            outside_catering_allowed: false,
            price_per_person_azn_from: 0,
            price_per_person_azn_to: 0,
        },
        tags: [],
        customFields: {},
        assignedPackageIds: [],
    };

    const docRef = await venuesCollectionRef.add(newVenueData);
    const newDocSnapshot = await docRef.get();
    if (newDocSnapshot.exists) {
      return docToVenue(newDocSnapshot);
    } else {
      throw new Error("Could not create new venue");
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
export const createUserDocument = async (user: firebase.User, additionalData: { displayName: string, phone: string }): Promise<void> => {
    const userDocRef = usersCollectionRef.doc(user.uid);
    const docSnap = await userDocRef.get();
    if (!docSnap.exists) {
        const { email, uid } = user;
        const { displayName, phone } = additionalData;
        const newUserProfile: UserProfile = { uid, email: email || '', displayName, phone, roleIds: [] };
        await userDocRef.set(newUserProfile);
    }
};
export const getUserProfile = async (uid: string): Promise<UserProfile> => {
    const userDocRef = usersCollectionRef.doc(uid);
    const docSnap = await userDocRef.get();
    if (docSnap.exists) return docSnap.data() as UserProfile;
    const user = auth.currentUser;
    if (!user) throw new Error("Пользователь не аутентифицирован");
    const defaultDisplayName = user.displayName || user.email?.split('@')[0] || 'Новый пользователь';
    const newUserProfile: UserProfile = { uid: user.uid, email: user.email || '', displayName: defaultDisplayName, phone: '', roleIds: [] };
    await userDocRef.set(newUserProfile);
    return newUserProfile;
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
    if (!user || !user.email) throw new Error("Пользователь не аутентифицирован.");
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    try {
        await user.reauthenticateWithCredential(credential);
    } catch (error: any) {
        if (error.code === 'auth/wrong-password') throw new Error('Текущий пароль введен неверно.');
        throw new Error('Ошибка повторной аутентификации.');
    }
    try {
        await user.updatePassword(newPassword);
    } catch (error: any) {
         if (error.code === 'auth/weak-password') throw new Error('Новый пароль должен содержать не менее 6 символов.');
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
        const docRef = rolesCollectionRef.doc();
        batch.set(docRef, role);
    });
    await batch.commit();
};

// --- User and Role Assignment Functions ---
export const getUsersWithRoles = async (): Promise<UserWithRoles[]> => {
    const [usersSnapshot, rolesSnapshot] = await Promise.all([ usersCollectionRef.get(), rolesCollectionRef.get() ]);
    const roles = rolesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role));
    const rolesMap = new Map(roles.map(role => [role.id, role]));
    return usersSnapshot.docs.map(doc => {
        const userProfile = doc.data() as UserProfile;
        const assignedRoles = (userProfile.roleIds || []).map(roleId => rolesMap.get(roleId)).filter((role): role is Role => role !== undefined);
        return { ...userProfile, uid: doc.id, roles: assignedRoles };
    });
};
export const updateUserRoles = async (uid: string, roleIds: string[]): Promise<void> => {
    await usersCollectionRef.doc(uid).update({ roleIds });
};

// --- Lookups (Dictionaries) Functions ---
export const getLookups = async (): Promise<Lookup[]> => {
    const snapshot = await lookupsCollectionRef.orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lookup));
};
export const updateLookupValues = async (docId: string, values: string[]): Promise<void> => {
    await lookupsCollectionRef.doc(docId).update({ values });
};
export const createLookup = async (name: string, key: string): Promise<Lookup> => {
    const querySnapshot = await lookupsCollectionRef.where('key', '==', key).get();
    if (!querySnapshot.empty) {
        throw new Error(`Категория с техническим ID "${key}" уже существует.`);
    }
    const newLookupData = { name, key, values: [] };
    const docRef = await lookupsCollectionRef.add(newLookupData);
    return { id: docRef.id, ...newLookupData };
};
export const updateLookupName = async (docId: string, name: string): Promise<void> => {
    await lookupsCollectionRef.doc(docId).update({ name });
};
export const deleteLookup = async (docId: string): Promise<void> => {
    // Note: This does not remove the data from venues, only the lookup definition.
    await lookupsCollectionRef.doc(docId).delete();
};


// --- Menu Builder Functions ---
export const getMenuItems = async (): Promise<MenuItem[]> => {
    const snapshot = await menuItemsCollectionRef.orderBy('category').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
};
export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const docRef = await menuItemsCollectionRef.add(item);
    return { id: docRef.id, ...item };
};
export const updateMenuItem = async (item: MenuItem): Promise<void> => {
    const { id, ...itemData } = item;
    await menuItemsCollectionRef.doc(id).update(itemData);
};
export const deleteMenuItem = async (itemId: string): Promise<void> => {
    await menuItemsCollectionRef.doc(itemId).delete();
    // Also remove this item from any packages that contain it
    const packagesSnapshot = await menuPackagesCollectionRef.where('itemIds', 'array-contains', itemId).get();
    const batch = db.batch();
    packagesSnapshot.forEach(doc => {
        const packageRef = menuPackagesCollectionRef.doc(doc.id);
        batch.update(packageRef, { itemIds: firebase.firestore.FieldValue.arrayRemove(itemId) });
    });
    await batch.commit();
};

export const getMenuPackages = async (): Promise<MenuPackage[]> => {
    const snapshot = await menuPackagesCollectionRef.orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuPackage));
};
export const createMenuPackage = async (pkg: Omit<MenuPackage, 'id'>): Promise<MenuPackage> => {
    const docRef = await menuPackagesCollectionRef.add(pkg);
    return { id: docRef.id, ...pkg };
};
export const updateMenuPackage = async (pkg: MenuPackage): Promise<void> => {
    const { id, ...pkgData } = pkg;
    await menuPackagesCollectionRef.doc(id).update(pkgData);
};
export const deleteMenuPackage = async (packageId: string): Promise<void> => {
    await menuPackagesCollectionRef.doc(packageId).delete();
};

// --- Singers Functions ---
const docToSinger = (docSnap: firebase.firestore.DocumentSnapshot): Singer => {
    const data = docSnap.data();
    if (!data) {
        throw new Error(`Document data not found for doc id: ${docSnap.id}`);
    }

    const singerData: any = {};
    for (const key in data) {
        if (data[key] instanceof firebase.firestore.Timestamp) {
            singerData[key] = (data[key] as firebase.firestore.Timestamp).toDate().toISOString();
        } else {
            singerData[key] = data[key];
        }
    }

    return {
        id: docSnap.id,
        ...singerData,
    } as Singer;
};

export const getSingers = async (): Promise<Singer[]> => {
  const q = singersCollectionRef.orderBy('created_at', 'desc');
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(docToSinger);
};

export const createSinger = async (): Promise<Singer> => {
    const newSingerData = {
        name: 'Новый артист',
        slug: `new_artist_${Date.now()}`,
        aliases: [],
        gender: 'male',
        phones: [],
        genres: [],
        tags: [],
        languages: [],
        city: '',
        regions_covered: [],
        contact_public: {},
        status: 'draft',
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        media: { photos: [], videos: [] },
    };

    const docRef = await singersCollectionRef.add(newSingerData);
    const newDocSnapshot = await docRef.get();
    if (newDocSnapshot.exists) {
      return docToSinger(newDocSnapshot);
    } else {
      throw new Error("Could not create new singer");
    }
};

export const updateSinger = async (singer: Singer): Promise<Singer> => {
    const { id, pricing_packages, repertoire, ...singerData } = singer; // Exclude subcollection data
    const singerDocRef = singersCollectionRef.doc(id);

    const dataToUpdate: any = {
        ...singerData,
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await singerDocRef.update(dataToUpdate);
    
    const updatedDocSnapshot = await singerDocRef.get();
    if (updatedDocSnapshot.exists) {
        return docToSinger(updatedDocSnapshot);
    } else {
        throw new Error("Failed to fetch updated singer document");
    }
};

export const deleteSinger = async (singerId: string): Promise<void> => {
  await singersCollectionRef.doc(singerId).delete();
};

export const uploadSingerFileToStorage = async (file: File, singerId: string): Promise<string> => {
    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = storage.ref(`singers/${singerId}/${fileName}`);
    const uploadTask = await storageRef.put(file);
    const downloadURL = await uploadTask.ref.getDownloadURL();
    return downloadURL;
};


// Singer Subcollections
const docToSubcollection = <T>(docSnap: firebase.firestore.DocumentSnapshot): T => {
    const data = docSnap.data();
    if (!data) throw new Error("Document data not found");

    const convertedData: any = {};
    for (const key in data) {
        if (data[key] instanceof firebase.firestore.Timestamp) {
            convertedData[key] = (data[key] as firebase.firestore.Timestamp).toDate().toISOString();
        } else {
            convertedData[key] = data[key];
        }
    }
    return { id: docSnap.id, ...convertedData } as T;
}

// Pricing Packages
export const getSingerPricingPackages = async (singerId: string): Promise<PricingPackage[]> => {
    const snapshot = await singersCollectionRef.doc(singerId).collection('pricing_packages').orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => docToSubcollection<PricingPackage>(doc));
};

export const createPricingPackage = async (singerId: string, pkgData: Omit<PricingPackage, 'id'>): Promise<PricingPackage> => {
    const dataWithTimestamp = {
        ...pkgData,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await singersCollectionRef.doc(singerId).collection('pricing_packages').add(dataWithTimestamp);
    const newDoc = await docRef.get();
    return docToSubcollection<PricingPackage>(newDoc);
};

export const updatePricingPackage = async (singerId: string, pkg: PricingPackage): Promise<void> => {
    const { id, ...pkgData } = pkg;
    const dataWithTimestamp = {
        ...pkgData,
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await singersCollectionRef.doc(singerId).collection('pricing_packages').doc(id).update(dataWithTimestamp);
};

export const deletePricingPackage = async (singerId: string, packageId: string): Promise<void> => {
    await singersCollectionRef.doc(singerId).collection('pricing_packages').doc(packageId).delete();
};

// Repertoire
export const getSingerRepertoire = async (singerId: string): Promise<RepertoireSong[]> => {
    const snapshot = await singersCollectionRef.doc(singerId).collection('repertoire').orderBy('title').get();
    return snapshot.docs.map(doc => docToSubcollection<RepertoireSong>(doc));
};

export const createRepertoireSong = async (singerId: string, songData: Omit<RepertoireSong, 'id'>): Promise<RepertoireSong> => {
    const dataWithTimestamp = {
        ...songData,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await singersCollectionRef.doc(singerId).collection('repertoire').add(dataWithTimestamp);
    const newDoc = await docRef.get();
    return docToSubcollection<RepertoireSong>(newDoc);
};

export const updateRepertoireSong = async (singerId: string, song: RepertoireSong): Promise<void> => {
    const { id, ...songData } = song;
    const dataWithTimestamp = {
        ...songData,
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await singersCollectionRef.doc(singerId).collection('repertoire').doc(id).update(dataWithTimestamp);
};

export const deleteRepertoireSong = async (singerId: string, songId: string): Promise<void> => {
    await singersCollectionRef.doc(singerId).collection('repertoire').doc(songId).delete();
};