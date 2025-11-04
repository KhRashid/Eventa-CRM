// fix: Use namespace import for firestore to maintain consistency with firebaseConfig.ts and avoid potential module resolution issues.
import * as firestore from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Venue } from '../types';

const venuesCollectionRef = firestore.collection(db, 'venues');

// Helper to convert Firestore doc to Venue type
const docToVenue = (docSnap: firestore.DocumentSnapshot<firestore.DocumentData>): Venue => {
    const data = docSnap.data();
    if (!data) {
        throw new Error(`Document data not found for doc id: ${docSnap.id}`);
    }

    const mapDataToVenue = (data: firestore.DocumentData): Partial<Venue> => {
        const venueData: any = {};
        for (const key in data) {
            if (data[key] instanceof firestore.Timestamp) {
                venueData[key] = (data[key] as firestore.Timestamp).toDate().toISOString();
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
  const q = firestore.query(venuesCollectionRef, firestore.orderBy('created_at', 'desc'));
  const querySnapshot = await firestore.getDocs(q);
  return querySnapshot.docs.map(docToVenue);
};

export const updateData = async (venue: Venue): Promise<Venue> => {
  const { id, ...venueData } = venue;
  // Firestore does not allow updating the 'id' field within the document data.
  // @ts-ignore
  delete venueData.id;
  
  const venueDocRef = firestore.doc(db, 'venues', id);

  await firestore.updateDoc(venueDocRef, {
      ...venueData,
      updated_at: firestore.serverTimestamp(),
  });
  
  const updatedDocSnapshot = await firestore.getDoc(venueDocRef);
  if (updatedDocSnapshot.exists()) {
      return docToVenue(updatedDocSnapshot);
  } else {
      throw new Error("Failed to fetch updated document");
  }
};

export const createData = async (): Promise<Venue> => {
    const newVenueData = {
        name: 'Новый ресторан',
        created_at: firestore.serverTimestamp(),
        updated_at: firestore.serverTimestamp(),
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

    const docRef = await firestore.addDoc(venuesCollectionRef, newVenueData);
    const newDocSnapshot = await firestore.getDoc(docRef);
    if (newDocSnapshot.exists()) {
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
  const venueDocRef = firestore.doc(db, 'venues', venueId);
  await firestore.deleteDoc(venueDocRef);
};
