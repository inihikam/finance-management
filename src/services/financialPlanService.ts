import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { FinancialPlan } from "@/types/finance";

const COLLECTION_NAME = "financialPlans";

// Create default financial plan (70-20-10 rule)
export async function createDefaultFinancialPlan(
  userId: string
): Promise<string> {
  try {
    const now = Timestamp.now();

    const defaultPlan = {
      userId,
      needs: 70, // 70% for needs
      wants: 20, // 20% for wants
      savings: 10, // 10% for savings
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), defaultPlan);
    return docRef.id;
  } catch (error) {
    console.error("Error creating default financial plan:", error);
    throw error;
  }
}

// Create custom financial plan
export async function createFinancialPlan(
  plan: Omit<FinancialPlan, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const now = Timestamp.now();

    const newPlan = {
      ...plan,
      createdAt: now,
      updatedAt: now,
    };

    // Ensure percentages add up to 100
    const total = plan.needs + plan.wants + plan.savings;
    if (total !== 100) {
      throw new Error("Financial plan percentages must add up to 100");
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newPlan);
    return docRef.id;
  } catch (error) {
    console.error("Error creating financial plan:", error);
    throw error;
  }
}

// Update financial plan
export async function updateFinancialPlan(
  id: string,
  plan: Partial<
    Omit<FinancialPlan, "id" | "userId" | "createdAt" | "updatedAt">
  >
): Promise<void> {
  try {
    const planRef = doc(db, COLLECTION_NAME, id);

    // If updating percentages, ensure they still add up to 100
    if (
      plan.needs !== undefined ||
      plan.wants !== undefined ||
      plan.savings !== undefined
    ) {
      const currentPlan = await getDoc(planRef);
      if (!currentPlan.exists()) {
        throw new Error("Financial plan not found");
      }

      const currentData = currentPlan.data() as Omit<FinancialPlan, "id">;

      const newNeeds = plan.needs ?? currentData.needs;
      const newWants = plan.wants ?? currentData.wants;
      const newSavings = plan.savings ?? currentData.savings;

      const total = newNeeds + newWants + newSavings;
      if (total !== 100) {
        throw new Error("Financial plan percentages must add up to 100");
      }
    }

    await updateDoc(planRef, {
      ...plan,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating financial plan:", error);
    throw error;
  }
}

// Get user's latest financial plan
export async function getUserLatestFinancialPlan(
  userId: string
): Promise<FinancialPlan | null> {
  try {
    // First try to get plans using orderBy
    try {
      const plansQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(plansQuery);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate()
            : data.updatedAt,
      } as FinancialPlan;
    } catch (indexError) {
      // If the query fails due to missing index, fall back to a simpler query
      console.warn(
        "Index error when querying financial plans, falling back to simpler query",
        indexError
      );

      const simpleQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(simpleQuery);

      if (querySnapshot.empty) {
        return null;
      }

      // Sort in memory
      const plans = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : data.createdAt,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : data.updatedAt,
          } as FinancialPlan;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });

      return plans.length > 0 ? plans[0] : null;
    }
  } catch (error) {
    console.error("Error fetching user's latest financial plan:", error);
    throw error;
  }
}

// Get financial plan by ID
export async function getFinancialPlanById(
  id: string
): Promise<FinancialPlan | null> {
  try {
    const planRef = doc(db, COLLECTION_NAME, id);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return null;
    }

    const data = planSnap.data();

    return {
      id: planSnap.id,
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt,
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : data.updatedAt,
    } as FinancialPlan;
  } catch (error) {
    console.error("Error fetching financial plan by ID:", error);
    throw error;
  }
}
