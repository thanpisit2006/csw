import { create } from "zustand";
import { ScheduleItem } from "@/lib/types";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  FirestoreScheduleRecord,
  saveScheduleRecord,
  deleteScheduleRecord,
  subscribeSchedules,
} from "@/lib/firebase/firestore-service";

export type { FirestoreScheduleRecord };

const DEFAULT_FALLBACK_COURSES: ScheduleItem[] = [
  { day: "Mon", start: 10.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9d7a5" },
  { day: "Tue", start: 11.5, end: 12.5, title: "PHY103 S31", room: "CB2506", color: "#d9a9d9" },
  { day: "Tue", start: 13.5, end: 16.5, title: "GEN121 S42", room: "ONLINE", color: "#d9a9d9" },
  { day: "Wed", start: 10.5, end: 12.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
  { day: "Wed", start: 13.5, end: 15.5, title: "CPE112 S31", room: "CPE1121", color: "#a9d9a9" },
  { day: "Thu", start: 8.5, end: 11.5, title: "MTH102 S32", room: "CB2507", color: "#d9bfa9" },
  { day: "Thu", start: 13.5, end: 15.5, title: "CPE121 S31", room: "CPE1115", color: "#d9bfa9" },
  { day: "Fri", start: 8.5, end: 10.5, title: "CPE121 S31", room: "CPE1119", color: "#a9cfe0" },
  { day: "Fri", start: 13.5, end: 16.5, title: "LNG222 S9", room: "CB1301", color: "#a9cfe0" },
];

const DEFAULT_SCHEDULE: FirestoreScheduleRecord = {
  id: "sched_2_2025_bank",
  semester: "2",
  academicYear: "2025",
  title: "iCPE 2/2025",
  status: "published",
  courses: DEFAULT_FALLBACK_COURSES,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

interface DynamicScheduleState {
  schedulesList: FirestoreScheduleRecord[];
  activeScheduleId: string;
  isSubscribed: boolean;
  initListener: () => () => void;
  setActiveScheduleId: (id: string) => void;
  getActiveScheduleRecord: () => FirestoreScheduleRecord;
  getActiveSchedule: () => ScheduleItem[];
  getActiveTitle: () => string;
  createSchedule: (sched: Omit<FirestoreScheduleRecord, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<FirestoreScheduleRecord>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  publishSemester: (id: string) => Promise<void>;
  duplicateSemester: (id: string, newSemester: string, newYear: string) => Promise<void>;
}

export const useScheduleStore = create<DynamicScheduleState>((set, get) => ({
  schedulesList: [DEFAULT_SCHEDULE],
  activeScheduleId: DEFAULT_SCHEDULE.id,
  isSubscribed: false,

  initListener: () => {
    const authUser = useAuthStore.getState().user;

    // First try fetching dedicated user schedule from users/{userId}/classSchedule/main
    if (authUser?.userId) {
      import("@/lib/firebase/firestore-service").then(({ getUserClassSchedule }) => {
        getUserClassSchedule(authUser.userId).then((userSched) => {
          if (userSched) {
            const dedicatedRecord: FirestoreScheduleRecord = {
              id: `user_dedicated_${authUser.userId}`,
              semester: userSched.semester,
              academicYear: userSched.academicYear,
              title: `Personal Schedule ${userSched.semester}/${userSched.academicYear}`,
              status: "published",
              visibility: "selected",
              courses: userSched.classes || [],
              pdfEnabled: !!userSched.pdfUrl,
              pdfFileUrl: userSched.pdfUrl,
              createdAt: userSched.updatedAt,
              updatedAt: userSched.updatedAt,
            };
            set((state) => ({
              schedulesList: [dedicatedRecord, ...state.schedulesList.filter((s) => s.id !== dedicatedRecord.id)],
              activeScheduleId: dedicatedRecord.id,
              isSubscribed: true,
            }));
          }
        }).catch(() => {});
      });
    }

    const unsub = subscribeSchedules((records) => {
      const currentUser = useAuthStore.getState().user;
      
      // Filter schedules accessible by current logged-in user
      const accessible = records.filter((r) => {
        // Admin sees all schedules (published, draft, archived)
        if (currentUser?.role === "admin") return true;

        // User must be published
        if (r.status !== "published") return false;

        // Check if studentId is explicitly blocked
        if (currentUser?.studentId && r.blockedStudentIds?.includes(currentUser.studentId)) {
          return false;
        }

        // Check visibility rules
        if (r.visibility === "restricted") {
          return false;
        }
        if (r.visibility === "selected") {
          return currentUser?.studentId ? r.allowedStudentIds?.includes(currentUser.studentId) : false;
        }

        // Public schedules
        return true;
      });

      set((state) => ({
        schedulesList: accessible.length > 0 ? accessible : state.schedulesList,
        activeScheduleId:
          state.activeScheduleId && accessible.some((r) => r.id === state.activeScheduleId)
            ? state.activeScheduleId
            : accessible[0]?.id || state.activeScheduleId,
        isSubscribed: true,
      }));
    });
    return unsub;
  },

  setActiveScheduleId: (id: string) => {
    set({ activeScheduleId: id });
  },

  getActiveScheduleRecord: () => {
    const { schedulesList, activeScheduleId } = get();
    const active = schedulesList.find((s) => s.id === activeScheduleId);
    if (active) return active;
    if (schedulesList.length > 0) return schedulesList[0];
    return DEFAULT_SCHEDULE;
  },

  getActiveSchedule: () => {
    return get().getActiveScheduleRecord().courses;
  },

  getActiveTitle: () => {
    return get().getActiveScheduleRecord().title;
  },

  createSchedule: async (sched) => {
    const targetId = `sched_${Date.now()}`;
    await saveScheduleRecord({
      id: targetId,
      semester: sched.semester,
      academicYear: sched.academicYear,
      title: sched.title,
      status: sched.status,
      courses: sched.courses,
    });
    set({ activeScheduleId: targetId });
  },

  updateSchedule: async (id, updates) => {
    const current = get().schedulesList.find((s) => s.id === id);
    if (!current) return;
    await saveScheduleRecord({
      ...current,
      ...updates,
      id,
    });
  },

  deleteSchedule: async (id) => {
    await deleteScheduleRecord(id);
  },

  publishSemester: async (id) => {
    const current = get().schedulesList.find((s) => s.id === id);
    if (!current) return;
    await saveScheduleRecord({
      ...current,
      id,
      status: "published",
    });
    set({ activeScheduleId: id });
  },

  duplicateSemester: async (id, newSemester, newYear) => {
    const target = get().schedulesList.find((s) => s.id === id);
    if (!target) return;

    const duplicatedId = `sched_${Date.now()}`;
    await saveScheduleRecord({
      id: duplicatedId,
      semester: newSemester,
      academicYear: newYear,
      title: `${target.title} (Copy)`,
      status: "draft",
      courses: JSON.parse(JSON.stringify(target.courses)),
    });
    set({ activeScheduleId: duplicatedId });
  },
}));
