
import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    where,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import type { Worker, AttendanceRecord } from './types';

// Type helper to convert Firestore Timestamps to Dates
const fromFirestore = <T extends { timestamp?: Timestamp }>(docData: T): Omit<T, 'timestamp'> & { timestamp: Date } => {
    const data = { ...docData };
    if (data.timestamp) {
        return { ...data, timestamp: data.timestamp.toDate() };
    }
    return data as Omit<T, 'timestamp'> & { timestamp: Date };
};


// Worker Functions
export const addWorker = async (worker: Omit<Worker, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'workers'), worker);
    return docRef.id;
};

// This flag ensures we only clear data once per session.
let hasClearedData = false;

const clearAllData = async () => {
    try {
        console.log("Clearing all data from Firestore...");
        const workersSnapshot = await getDocs(collection(db, 'workers'));
        const attendanceSnapshot = await getDocs(collection(db, 'attendanceRecords'));

        const batch = writeBatch(db);

        workersSnapshot.forEach(doc => batch.delete(doc.ref));
        attendanceSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        console.log("All data cleared successfully.");
    } catch (error) {
        console.error("Error clearing data:", error);
    }
};


export const getWorkers = async (): Promise<Worker[]> => {
    // Clear old data on first load to ensure a clean slate.
    if (!hasClearedData) {
        await clearAllData();
        hasClearedData = true;
    }
    const q = query(collection(db, 'workers'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
};

export const updateWorker = async (id: string, worker: Partial<Omit<Worker, 'id'>>): Promise<void> => {
    const workerRef = doc(db, 'workers', id);
    await updateDoc(workerRef, worker);
};

export const deleteWorker = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'workers', id));
};

export const getWorkerByPin = async (pin: string): Promise<Worker | null> => {
    const q = query(collection(db, "workers"), where("pin", "==", pin));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const workerDoc = querySnapshot.docs[0];
    return { id: workerDoc.id, ...workerDoc.data() } as Worker;
};

// Attendance Record Functions
export const addAttendanceRecord = async (record: Omit<AttendanceRecord, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'attendanceRecords'), {
        ...record,
        timestamp: Timestamp.fromDate(record.timestamp),
    });
    return docRef.id;
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
    const q = query(collection(db, 'attendanceRecords'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
         const data = doc.data();
         const record = {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate()
         }
         return record as AttendanceRecord;
    });
};


export const updateAttendanceStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
    const recordRef = doc(db, 'attendanceRecords', id);
    await updateDoc(recordRef, { status });
};
