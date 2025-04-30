import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { Transaction, TransactionType } from "@/types/finance";

const COLLECTION_NAME = "transactions";

export async function addTransaction(
  transaction: Omit<Transaction, "id" | "createdAt">
): Promise<string> {
  const newTransaction = {
    ...transaction,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newTransaction);
  return docRef.id;
}

export async function updateTransaction(
  id: string,
  transaction: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>
): Promise<void> {
  const transactionRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(transactionRef, transaction);
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactionRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(transactionRef);
}

export async function getTransactionsByUser(
  userId: string
): Promise<Transaction[]> {
  try {
    // Simplified query without orderBy to avoid requiring composite index
    const transactionsQuery = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(transactionsQuery);

    const transactions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : data.createdAt,
      } as Transaction;
    });

    // Sort in memory instead of using Firestore's orderBy
    return transactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

export async function getTransactionsByType(
  userId: string,
  type: TransactionType
): Promise<Transaction[]> {
  try {
    const transactionsQuery = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("type", "==", type)
    );

    const querySnapshot = await getDocs(transactionsQuery);

    const transactions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : data.createdAt,
      } as Transaction;
    });

    // Sort in memory
    return transactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order
    });
  } catch (error) {
    console.error("Error fetching transactions by type:", error);
    throw error;
  }
}

export async function getTransactionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const transactionsQuery = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp)
    );

    const querySnapshot = await getDocs(transactionsQuery);

    const transactions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : data.createdAt,
      } as Transaction;
    });

    // Sort in memory
    return transactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order
    });
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    throw error;
  }
}
