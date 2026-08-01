/**
 * Firestore Service Layer
 * Single source of truth for all Firestore read/write operations.
 * Firebase is the only database. No mock data is used.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
  onSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { UserRecord, SessionRecord, AuditLogRecord, DownloadRecord } from "@/lib/db/mock-data";

// ─────────────────────────────────────────────────────────────────────────────
// Collection References
// ─────────────────────────────────────────────────────────────────────────────
const COLLECTIONS = {
  STUDENTS: "students",
  SESSIONS: "sessions",
  AUDIT_LOGS: "audit_logs",
  DOWNLOADS: "downloads",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Convert Firestore Timestamp → ISO string
// ─────────────────────────────────────────────────────────────────────────────
function tsToISO(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getStudentById(studentId: string): Promise<UserRecord | null> {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    where("studentId", "==", studentId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  const data = docSnap.data();

  // Automatic custom date expiration check
  let status: UserRecord["status"] = (data.status as UserRecord["status"]) || (data.blocked ? "suspended" : "active");
  if (data.expirationMode === "custom" && data.expirationDate && new Date(data.expirationDate) <= new Date() && status === "active") {
    status = "expired";
  }

  return {
    id: docSnap.id,
    studentId: data.studentId,
    verificationCode: data.verificationCode || "",
    name: data.name || `Student ${studentId}`,
    email: data.email || "",
    consentStatus: data.consentStatus || "pending",
    loginCount: data.loginCount || 0,
    lastLogin: tsToISO(data.lastLogin),
    lastActivity: tsToISO(data.lastActivity || data.lastLogin),
    createdAt: tsToISO(data.createdAt),
    updatedAt: data.updatedAt ? tsToISO(data.updatedAt) : undefined,
    expirationMode: data.expirationMode || "never",
    expirationDate: data.expirationDate || "",
    status,
    banReason: data.banReason || data.blockedReason || "",
    suspensionReason: data.suspensionReason || data.blockedReason || "",
    statusUpdatedAt: data.statusUpdatedAt ? tsToISO(data.statusUpdatedAt) : undefined,
    statusUpdatedBy: data.statusUpdatedBy || "admin",
    notes: data.notes || "",
    allowedScheduleIds: data.allowedScheduleIds || [],
    allowedFeatures: data.allowedFeatures || [],
    deviceIds: data.deviceIds || [],
    lastIp: data.lastIp || "127.0.0.1",
    browser: data.browser || "Unknown",
    os: data.os || "Unknown",
    device: data.device || "Desktop",
    language: data.language || "en-US",
    timezone: data.timezone || "UTC",
    screenResolution: data.screenResolution || "0x0",
    blocked: status === "suspended" || status === "banned",
  };
}

/**
 * Check whether a Student ID or Device ID is currently blocked or inactive in Firestore.
 */
export async function checkStudentAccess(
  studentId: string,
  deviceId?: string
): Promise<{ allowed: boolean; status: UserRecord["status"]; reason?: string }> {
  // 1. Direct Student ID check
  const student = await getStudentById(studentId);
  if (student) {
    if (student.status === "banned") {
      return {
        allowed: false,
        status: "banned",
        reason: student.banReason || "Violation of system policy",
      };
    }
    if (student.status === "suspended" || student.blocked) {
      return {
        allowed: false,
        status: "suspended",
        reason: student.suspensionReason || student.banReason || "Account suspended by administrator.",
      };
    }
    if (student.status === "expired") {
      return {
        allowed: false,
        status: "expired",
        reason: "Your access has expired. Please contact the administrator to renew your membership.",
      };
    }
    return { allowed: true, status: student.status };
  }

  // 2. Device Fingerprint Protection check
  if (deviceId) {
    const deviceQuery = query(
      collection(db, COLLECTIONS.STUDENTS),
      where("deviceIds", "array-contains", deviceId)
    );
    const deviceSnap = await getDocs(deviceQuery);
    if (!deviceSnap.empty) {
      const blockedDoc = deviceSnap.docs[0].data();
      if (blockedDoc.status === "banned" || blockedDoc.status === "suspended" || blockedDoc.blocked) {
        return {
          allowed: false,
          status: (blockedDoc.status as UserRecord["status"]) || "suspended",
          reason: blockedDoc.banReason || blockedDoc.suspensionReason || "This device is associated with a suspended account.",
        };
      }
    }
  }

  return { allowed: true, status: "active" };
}

/** Create a new student account (Admin) */
export async function createStudentAccount(params: {
  studentId: string;
  name: string;
  email?: string;
  status: UserRecord["status"];
  expirationMode: UserRecord["expirationMode"];
  expirationDate?: string;
  notes?: string;
}): Promise<string> {
  const newRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
    studentId: params.studentId,
    name: params.name,
    email: params.email || "",
    status: params.status,
    expirationMode: params.expirationMode || "never",
    expirationDate: params.expirationDate || "",
    notes: params.notes || "",
    consentStatus: "pending",
    loginCount: 0,
    lastLogin: serverTimestamp(),
    lastActivity: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deviceIds: [],
    allowedScheduleIds: [],
    allowedFeatures: [],
  });
  return newRef.id;
}

/** Update student account (Admin) */
export async function updateStudentAccount(
  studentDocId: string,
  updates: Partial<Omit<UserRecord, "id">>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentDocId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/** Delete student account (Admin) */
export async function deleteStudentAccount(studentDocId: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentDocId));
}


/**
 * Upsert student on login with real client IP, browser, os, device, language, timezone, screenResolution.
 */
export async function upsertStudentOnLogin(
  studentId: string,
  deviceId?: string,
  ip: string = "127.0.0.1",
  specs?: { browser: string; os: string; screenSize: string; language: string; timezone: string; device: string }
): Promise<UserRecord> {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    where("studentId", "==", studentId),
    limit(1)
  );
  const snap = await getDocs(q);

  const deviceIds = deviceId ? [deviceId] : [];

  if (!snap.empty) {
    const docRef = snap.docs[0].ref;
    const existing = snap.docs[0].data();
    const currentDevices: string[] = existing.deviceIds || [];
    const updatedDevices = deviceId && !currentDevices.includes(deviceId)
      ? [...currentDevices, deviceId]
      : currentDevices;

    await updateDoc(docRef, {
      loginCount: increment(1),
      lastLogin: serverTimestamp(),
      lastActivity: serverTimestamp(),
      deviceIds: updatedDevices,
      lastIp: ip,
      browser: specs?.browser || existing.browser || "Unknown",
      os: specs?.os || existing.os || "Unknown",
      device: specs?.device || existing.device || "Desktop",
      language: specs?.language || existing.language || "en-US",
      timezone: specs?.timezone || existing.timezone || "UTC",
      screenResolution: specs?.screenSize || existing.screenResolution || "0x0",
    });
    const updated = await getDoc(docRef);
    const data = updated.data()!;
    return {
      id: updated.id,
      studentId: data.studentId,
      verificationCode: data.verificationCode || "",
      name: data.name || `Student ${studentId}`,
      consentStatus: data.consentStatus || "pending",
      loginCount: data.loginCount || 1,
      lastLogin: tsToISO(data.lastLogin),
      lastActivity: tsToISO(data.lastActivity || data.lastLogin),
      createdAt: tsToISO(data.createdAt),
      status: (data.status as UserRecord["status"]) || "active",
      banReason: data.banReason || "",
      suspensionReason: data.suspensionReason || "",
      deviceIds: data.deviceIds || [],
      lastIp: data.lastIp || ip,
      browser: data.browser,
      os: data.os,
      device: data.device,
      language: data.language,
      timezone: data.timezone,
      screenResolution: data.screenResolution,
      blocked: data.status === "suspended" || data.status === "banned",
    };
  } else {
    // New student — create record with active status
    const newRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
      studentId,
      name: `Student ${studentId}`,
      consentStatus: "pending",
      loginCount: 1,
      lastLogin: serverTimestamp(),
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp(),
      status: "active",
      deviceIds,
      lastIp: ip,
      browser: specs?.browser || "Unknown",
      os: specs?.os || "Unknown",
      device: specs?.device || "Desktop",
      language: specs?.language || "en-US",
      timezone: specs?.timezone || "UTC",
      screenResolution: specs?.screenSize || "0x0",
    });
    return {
      id: newRef.id,
      studentId,
      verificationCode: "",
      name: `Student ${studentId}`,
      consentStatus: "pending",
      loginCount: 1,
      lastLogin: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
      deviceIds,
      lastIp: ip,
      browser: specs?.browser,
      os: specs?.os,
      device: specs?.device,
      language: specs?.language,
      timezone: specs?.timezone,
      screenResolution: specs?.screenSize,
      blocked: false,
    };
  }
}

/** Admin: Change User Status (active, expired, suspended, banned) */
export async function updateUserStatus(
  studentDocId: string,
  status: UserRecord["status"],
  reason?: string,
  updatedBy: string = "admin"
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentDocId);
  const isBlocked = status === "suspended" || status === "banned";
  await updateDoc(docRef, {
    status,
    blocked: isBlocked,
    ...(status === "banned" ? { banReason: reason || "Violation of system policy" } : {}),
    ...(status === "suspended" ? { suspensionReason: reason || "Suspended by system administrator." } : {}),
    statusUpdatedAt: serverTimestamp(),
    statusUpdatedBy: updatedBy,
  });
}


/** Admin: Block a student account */
export async function blockUser(
  studentDocId: string,
  reason: string,
  blockedUntil?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentDocId);
  await updateDoc(docRef, {
    blocked: true,
    blockedReason: reason || "Account suspended by administrator.",
    blockedAt: serverTimestamp(),
    blockedUntil: blockedUntil ? Timestamp.fromDate(new Date(blockedUntil)) : null,
  });
}

/** Admin: Unblock a student account */
export async function unblockUser(studentDocId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentDocId);
  await updateDoc(docRef, {
    blocked: false,
    blockedReason: "",
    blockedAt: null,
    blockedUntil: null,
  });
}


export async function updateStudentConsentStatus(
  studentDocId: string,
  status: "accepted" | "declined"
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentDocId);
  await updateDoc(docRef, { consentStatus: status });
}

export async function getAllStudents(): Promise<UserRecord[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.STUDENTS), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      studentId: data.studentId,
      verificationCode: data.verificationCode || "",
      name: data.name || `Student ${data.studentId}`,
      consentStatus: data.consentStatus || "pending",
      loginCount: data.loginCount || 0,
      lastLogin: tsToISO(data.lastLogin),
      lastActivity: tsToISO(data.lastActivity || data.lastLogin),
      createdAt: tsToISO(data.createdAt),
      status: (data.status as UserRecord["status"]) || (data.blocked ? "suspended" : "active"),
      banReason: data.banReason || data.blockedReason || "",
      suspensionReason: data.suspensionReason || data.blockedReason || "",
      statusUpdatedAt: data.statusUpdatedAt ? tsToISO(data.statusUpdatedAt) : undefined,
      statusUpdatedBy: data.statusUpdatedBy || "admin",
      deviceIds: data.deviceIds || [],
      lastIp: data.lastIp || "127.0.0.1",
      browser: data.browser || "Unknown",
      os: data.os || "Unknown",
      device: data.device || "Desktop",
      language: data.language || "en-US",
      timezone: data.timezone || "UTC",
      screenResolution: data.screenResolution || "0x0",
      blocked: data.blocked ?? (data.status === "suspended" || data.status === "banned"),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateSessionParams {
  userId: string;
  studentId: string;
  role: "student" | "admin";
  token: string;
  browser: string;
  os: string;
  screenSize: string;
  ip: string;
}

export async function createSession(params: CreateSessionParams): Promise<SessionRecord> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), {
    ...params,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...params,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export async function getActiveSessions(): Promise<SessionRecord[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.SESSIONS),
      orderBy("createdAt", "desc"),
      limit(100)
    )
  );
  const now = new Date();
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        studentId: data.studentId,
        role: data.role,
        token: data.token,
        browser: data.browser,
        os: data.os,
        screenSize: data.screenSize,
        ip: data.ip,
        expiresAt: tsToISO(data.expiresAt),
        createdAt: tsToISO(data.createdAt),
      };
    })
    .filter((s) => new Date(s.expiresAt) > now);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export interface WriteAuditLogParams {
  userId: string;
  studentId: string;
  action: AuditLogRecord["action"];
  resource: string;
  metadata?: Record<string, unknown>;
  browser: string;
  os: string;
  screenSize: string;
  language: string;
  timezone: string;
  ip: string;
}

export async function writeAuditLog(params: WriteAuditLogParams): Promise<AuditLogRecord> {
  const docRef = await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), {
    ...params,
    metadata: params.metadata || {},
    timestamp: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...params,
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
  };
}

export async function getAuditLogs(limitCount = 200): Promise<AuditLogRecord[]> {
  const constraints: QueryConstraint[] = [
    orderBy("timestamp", "desc"),
    limit(limitCount),
  ];
  const snap = await getDocs(query(collection(db, COLLECTIONS.AUDIT_LOGS), ...constraints));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      studentId: data.studentId,
      action: data.action,
      resource: data.resource,
      metadata: data.metadata || {},
      browser: data.browser,
      os: data.os,
      screenSize: data.screenSize,
      language: data.language,
      timezone: data.timezone,
      ip: data.ip,
      timestamp: tsToISO(data.timestamp),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface WriteDownloadParams {
  fileId: string;
  fileName: string;
  category: string;
  user: string;
  studentId: string;
}

export async function writeDownload(params: WriteDownloadParams): Promise<DownloadRecord> {
  const docRef = await addDoc(collection(db, COLLECTIONS.DOWNLOADS), {
    ...params,
    downloadCount: 1,
    timestamp: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...params,
    downloadCount: 1,
    timestamp: new Date().toISOString(),
  };
}

export async function getDownloads(limitCount = 200): Promise<DownloadRecord[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.DOWNLOADS), orderBy("timestamp", "desc"), limit(limitCount))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      fileId: data.fileId,
      fileName: data.fileName,
      category: data.category,
      user: data.user,
      studentId: data.studentId,
      downloadCount: data.downloadCount || 1,
      timestamp: tsToISO(data.timestamp),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────────────────────────────────────────
export interface AnnouncementRecord {
  id: string;
  message: string;
  type: "info" | "warning" | "holiday";
  active: boolean;
  createdAt: string;
  createdBy: string;
}

/** Get all active announcements (for students) */
export async function getActiveAnnouncements(): Promise<AnnouncementRecord[]> {
  try {
    const q = query(collection(db, "announcements"), where("active", "==", true));
    const snap = await getDocs(q);
    const records = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        message: data.message || "",
        type: (data.type as AnnouncementRecord["type"]) || "info",
        active: data.active ?? true,
        createdAt: tsToISO(data.createdAt),
        createdBy: data.createdBy || "admin",
      };
    });
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Firestore index warning/building in getActiveAnnouncements:", err);
    }
    return [];
  }
}

/** Get all announcements (for admin) */
export async function getAllAnnouncements(): Promise<AnnouncementRecord[]> {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      message: data.message || "",
      type: (data.type as AnnouncementRecord["type"]) || "info",
      active: data.active ?? true,
      createdAt: tsToISO(data.createdAt),
      createdBy: data.createdBy || "admin",
    };
  });
}

/** Create a new announcement */
export async function createAnnouncement(
  message: string,
  type: AnnouncementRecord["type"],
  createdBy: string
): Promise<string> {
  const docRef = await addDoc(collection(db, "announcements"), {
    message,
    type,
    active: true,
    createdAt: serverTimestamp(),
    createdBy,
  });
  return docRef.id;
}

/** Toggle announcement active state */
export async function toggleAnnouncement(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, "announcements", id), { active });
}

/** Delete an announcement */
export async function deleteAnnouncement(id: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "announcements", id));
}

// ─────────────────────────────────────────────────────────────────────────────
// SEMESTER SCHEDULES (Firestore collection "schedules")
// ─────────────────────────────────────────────────────────────────────────────

export interface FirestoreScheduleRecord {
  id: string;
  semester: string;
  academicYear: string;
  title: string;
  status: "published" | "draft" | "archived";
  visibility?: "public" | "selected" | "restricted";
  allowedStudentIds?: string[];
  blockedStudentIds?: string[];
  courses: import("@/lib/types").ScheduleItem[];
  pdfEnabled?: boolean;
  pdfFileUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfUploadedAt?: string;
  pdfUploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fetch all semester schedules from Firestore */
export async function getAllSchedules(): Promise<FirestoreScheduleRecord[]> {
  const q = query(collection(db, "schedules"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      semester: data.semester || "1",
      academicYear: data.academicYear || "2026",
      title: data.title || "Schedule",
      status: data.status || "published",
      visibility: data.visibility || "public",
      allowedStudentIds: data.allowedStudentIds || [],
      blockedStudentIds: data.blockedStudentIds || [],
      courses: data.courses || [],
      pdfEnabled: data.pdfEnabled ?? false,
      pdfFileUrl: data.pdfFileUrl || "",
      pdfFileName: data.pdfFileName || "",
      pdfFileSize: data.pdfFileSize || 0,
      pdfUploadedAt: data.pdfUploadedAt ? tsToISO(data.pdfUploadedAt) : undefined,
      pdfUploadedBy: data.pdfUploadedBy || "",
      createdAt: tsToISO(data.createdAt),
      updatedAt: tsToISO(data.updatedAt),
    };
  });
}

/** Real-time listener for published/all schedules */
export function subscribeSchedules(
  callback: (schedules: FirestoreScheduleRecord[]) => void
): () => void {
  const q = query(collection(db, "schedules"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const records = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        semester: data.semester || "1",
        academicYear: data.academicYear || "2026",
        title: data.title || "Schedule",
        status: data.status || "published",
        visibility: data.visibility || "public",
        allowedStudentIds: data.allowedStudentIds || [],
        blockedStudentIds: data.blockedStudentIds || [],
        courses: data.courses || [],
        pdfEnabled: data.pdfEnabled ?? false,
        pdfFileUrl: data.pdfFileUrl || "",
        pdfFileName: data.pdfFileName || "",
        pdfFileSize: data.pdfFileSize || 0,
        pdfUploadedAt: data.pdfUploadedAt ? tsToISO(data.pdfUploadedAt) : undefined,
        pdfUploadedBy: data.pdfUploadedBy || "",
        createdAt: tsToISO(data.createdAt),
        updatedAt: tsToISO(data.updatedAt),
      };
    });
    callback(records);
  });
}

/** Upsert a schedule record into Firestore */
export async function saveScheduleRecord(
  sched: Omit<FirestoreScheduleRecord, "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> {
  const targetId = sched.id || `sched_${Date.now()}`;
  const docRef = doc(db, "schedules", targetId);
  await setDoc(
    docRef,
    {
      semester: sched.semester,
      academicYear: sched.academicYear,
      title: sched.title,
      status: sched.status,
      visibility: sched.visibility || "public",
      allowedStudentIds: sched.allowedStudentIds || [],
      blockedStudentIds: sched.blockedStudentIds || [],
      courses: sched.courses,
      pdfEnabled: sched.pdfEnabled ?? false,
      pdfFileUrl: sched.pdfFileUrl || "",
      pdfFileName: sched.pdfFileName || "",
      pdfFileSize: sched.pdfFileSize || 0,
      pdfUploadedAt: sched.pdfUploadedAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  return targetId;
}

/** Delete a schedule record from Firestore */
export async function deleteScheduleRecord(id: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "schedules", id));
}



