import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { TimetableClass, AttendanceEntry, DayOfWeek } from "./types";

const TIMETABLE_COLLECTION = "timetable";
const ATTENDANCE_COLLECTION = "attendance";

// Timetable Operations
export async function getTimetable(): Promise<TimetableClass[]> {
  try {
    const q = query(collection(db, TIMETABLE_COLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableClass));
  } catch (error) {
    console.warn("Firebase not initialized or configured properly yet.");
    return [];
  }
}

export async function addTimetableClass(data: Omit<TimetableClass, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, TIMETABLE_COLLECTION), data);
  return docRef.id;
}

export async function removeTimetableClass(id: string): Promise<void> {
  await deleteDoc(doc(db, TIMETABLE_COLLECTION, id));
}

// Attendance Operations
export async function getAttendanceByDate(date: string): Promise<AttendanceEntry[]> {
  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where("date", "==", date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceEntry));
  } catch (error) {
    console.warn("Firebase not initialized or configured properly yet.");
    return [];
  }
}

export async function getAllAttendance(): Promise<AttendanceEntry[]> {
  try {
    const q = query(collection(db, ATTENDANCE_COLLECTION), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceEntry));
  } catch (error) {
    console.warn("Firebase not initialized or configured properly yet.");
    return [];
  }
}

export async function markAttendance(data: Omit<AttendanceEntry, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), data);
  return docRef.id;
}

export async function updateAttendance(id: string, updates: Partial<AttendanceEntry>): Promise<void> {
  const docRef = doc(db, ATTENDANCE_COLLECTION, id);
  await updateDoc(docRef, updates);
}
