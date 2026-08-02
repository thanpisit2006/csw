export type UserStatus = "active" | "expired" | "suspended" | "banned";

export type ExpirationMode = "never" | "custom" | "manual";

export interface UserProfileSubdoc {
  fullName: string;
  email?: string;
  studentId: string;
  faculty?: string;
  department?: string;
  year?: string;
  section?: string;
  createdAt: string;
}

export interface UserClassScheduleSubdoc {
  semester: string;
  academicYear: string;
  classes: import("@/lib/types").ScheduleItem[];
  pdfUrl?: string;
  wallpaperUrl?: string;
  updatedAt: string;
  createdByAdmin: boolean;
}

export interface UserSettingsSubdoc {
  theme: "dark" | "light" | "system";
  notifications: boolean;
  language: string;
}

export interface UserDownloadsSubdoc {
  totalDownloads: number;
  lastDownload?: string;
}

export interface UserRecord {
  id: string;
  studentId: string;
  verificationCode: string;
  name: string;
  email?: string;
  faculty?: string;
  department?: string;
  year?: string;
  section?: string;
  profile?: UserProfileSubdoc;
  classSchedule?: UserClassScheduleSubdoc;
  settings?: UserSettingsSubdoc;
  downloads?: UserDownloadsSubdoc;
  loginCount: number;
  lastLogin: string;
  lastActivity?: string;
  createdAt: string;
  updatedAt?: string;
  expirationMode?: ExpirationMode;
  expirationDate?: string;
  status: UserStatus;
  banReason?: string;
  suspensionReason?: string;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
  notes?: string;
  allowedScheduleIds?: string[];
  allowedFeatures?: string[];
  deviceIds?: string[];
  lastIp?: string;
  browser?: string;
  os?: string;
  device?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  blocked?: boolean;
}

export interface AdminRecord {
  uid: string;
  email: string;
  name: string;
  role: "admin";
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  studentId: string;
  role: "student" | "admin";
  token: string;
  browser: string;
  os: string;
  screenSize: string;
  ip: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  studentId: string;
  action:
    | "LOGIN"
    | "LOGOUT"
    | "DOWNLOAD_WALLPAPER"
    | "OPEN_PAGE"
    | "SEARCH"
    | "FAILED_LOGIN";
  resource: string;
  metadata: Record<string, unknown>;
  browser: string;
  os: string;
  screenSize: string;
  language: string;
  timezone: string;
  ip: string;
  timestamp: string;
}

export interface DownloadRecord {
  id: string;
  fileId: string;
  fileName: string;
  category: string;
  user: string;
  studentId: string;
  downloadCount: number;
  timestamp: string;
}

// Initialized collections for real Firestore operations
export const MOCK_STUDENTS: UserRecord[] = [];
export const MOCK_ADMINS: AdminRecord[] = [];
export const MOCK_SESSIONS: SessionRecord[] = [];
export const MOCK_AUDIT_LOGS: AuditLogRecord[] = [];
export const MOCK_DOWNLOADS: DownloadRecord[] = [];
