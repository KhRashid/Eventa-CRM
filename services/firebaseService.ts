// fix: Use Firebase v9 compat libraries to support v8 syntax.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { db, storage } from '../firebaseConfig';
import { Venue } from '../types';

const venuesCollectionRef = db.collection('venues');

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