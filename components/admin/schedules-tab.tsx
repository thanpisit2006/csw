"use client";

import React, { useState, useEffect } from "react";
import { useScheduleStore, FirestoreScheduleRecord } from "@/stores/use-schedule-store";
import { getAllStudents } from "@/lib/firebase/firestore-service";
import { ScheduleItem } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  BookOpen,
  X,
  Loader2,
  Save,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Users,
  Search,
  Lock,
  Eye,
  FileText,
  Upload,
  CheckSquare,
  Square,
} from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SchedulesTab() {
  const {
    schedulesList,
    activeScheduleId,
    setActiveScheduleId,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    publishSemester,
    duplicateSemester,
    initListener,
  } = useScheduleStore();

  useEffect(() => {
    const unsub = initListener();
    return () => unsub();
  }, [initListener]);

  const [editingSchedule, setEditingSchedule] = useState<FirestoreScheduleRecord | null>(null);
  const [permissionTargetSchedule, setPermissionTargetSchedule] = useState<FirestoreScheduleRecord | null>(null);
  const [pdfTargetSchedule, setPdfTargetSchedule] = useState<FirestoreScheduleRecord | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [coursesDraft, setCoursesDraft] = useState<ScheduleItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newSemester, setNewSemester] = useState("1");
  const [newYear, setNewYear] = useState("2026");
  const [isSaving, setIsSaving] = useState(false);

  // Permission Modal State
  const [visibility, setVisibility] = useState<"public" | "selected" | "restricted">("public");
  const [allowedIds, setAllowedIds] = useState<string[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [allStudents, setAllStudents] = useState<{ id: string; studentId: string; name: string }[]>([]);

  useEffect(() => {
    getAllStudents().then((res) => {
      setAllStudents(res.map((s) => ({ id: s.id, studentId: s.studentId, name: s.name })));
    });
  }, []);

  const handleOpenPermissions = (sched: FirestoreScheduleRecord) => {
    setPermissionTargetSchedule(sched);
    setVisibility(sched.visibility || "public");
    setAllowedIds(sched.allowedStudentIds || []);
    setBlockedIds(sched.blockedStudentIds || []);
  };

  const handleSavePermissions = async () => {
    if (!permissionTargetSchedule) return;
    setIsSaving(true);
    try {
      await updateSchedule(permissionTargetSchedule.id, {
        visibility,
        allowedStudentIds: allowedIds,
        blockedStudentIds: blockedIds,
      });
      toast.success("Updated schedule permissions & access control in Firestore!");
      setPermissionTargetSchedule(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update schedule access control.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditor = (sched: FirestoreScheduleRecord) => {
    setEditingSchedule(sched);
    setCoursesDraft(JSON.parse(JSON.stringify(sched.courses)));
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a schedule title.");
      return;
    }

    setIsSaving(true);
    try {
      await createSchedule({
        semester: newSemester,
        academicYear: newYear,
        title: newTitle,
        status: "published",
        visibility: "public",
        allowedStudentIds: [],
        blockedStudentIds: [],
        courses: [
          { day: "Mon", start: 9.0, end: 12.0, title: "CPE201 S1", room: "CPE1115", color: "#a9cfe0" },
          { day: "Wed", start: 13.5, end: 16.5, title: "CPE202 S1", room: "CPE1119", color: "#a9d9a9" },
        ],
      });

      setNewTitle("");
      toast.success("Created and published new semester schedule to Firestore!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  // Course Drawer Editor Helpers
  const handleAddCourse = () => {
    setCoursesDraft((prev) => [
      ...prev,
      { day: "Mon", start: 9.0, end: 10.5, title: "New Course", room: "CPE100", color: "#a9cfe0" },
    ]);
  };

  const handleUpdateCourse = (idx: number, key: keyof ScheduleItem, val: string | number) => {
    setCoursesDraft((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [key]: val } : c))
    );
  };

  const handleDeleteCourse = (idx: number) => {
    setCoursesDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDuplicateCourse = (idx: number) => {
    const target = coursesDraft[idx];
    if (!target) return;
    setCoursesDraft((prev) => [
      ...prev.slice(0, idx + 1),
      { ...JSON.parse(JSON.stringify(target)), title: `${target.title} (Copy)` },
      ...prev.slice(idx + 1),
    ]);
  };

  const handleMoveCourse = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= coursesDraft.length) return;
    const arr = [...coursesDraft];
    const temp = arr[idx];
    arr[idx] = arr[newIdx];
    arr[newIdx] = temp;
    setCoursesDraft(arr);
  };

  const handleSaveCourses = async () => {
    if (!editingSchedule) return;

    for (const c of coursesDraft) {
      if (!c.title.trim()) {
        toast.error("All courses must have a title.");
        return;
      }
      if (c.start >= c.end) {
        toast.error(`Invalid time range for course "${c.title}". Start time must be before end time.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateSchedule(editingSchedule.id, {
        courses: coursesDraft,
      });
      toast.success("Saved schedule courses to Firestore!");
      setEditingSchedule(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save schedule courses.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudentSuggestions = allStudents.filter((s) =>
    s.studentId.includes(studentSearch) || s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--accent)]" /> Realtime Firestore Semester Schedule & Access Permissions
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* Create Schedule Bar */}
        <div className="p-4 rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--card2)_60%,transparent)] grid gap-3">
          <div className="font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[var(--accent)]" /> Add New Semester Schedule
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              placeholder="e.g. iCPE 1/2026"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 h-9 text-xs"
            />
            <div className="flex gap-2">
              <select
                value={newSemester}
                onChange={(e) => setNewSemester(e.target.value)}
                aria-label="Semester"
                className="h-9 px-2.5 rounded-[12px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
              >
                <option value="1">Sem 1</option>
                <option value="2">Sem 2</option>
                <option value="3">Summer</option>
              </select>
              <Input
                placeholder="Year"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="h-9 text-xs w-20"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              disabled={isSaving}
              onClick={handleCreateNew}
              className="h-9 text-xs flex items-center gap-1"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Semester
            </Button>
          </div>
        </div>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedulesList.map((sched) => {
            const isActive = sched.id === activeScheduleId;
            return (
              <div
                key={sched.id}
                className={`p-4 rounded-2xl border transition-all grid gap-3 ${isActive
                  ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] shadow-md"
                  : "border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--card2)_60%,transparent)]"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-[var(--text)] tracking-tight">
                      {sched.title}
                    </h4>
                    <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                      <span>Sem {sched.semester}/{sched.academicYear} • {sched.courses.length} Course(s)</span>
                      <span className="font-bold text-[var(--accent)] capitalize">• Visibility: {sched.visibility || "public"}</span>
                    </div>
                  </div>

                  {sched.status === "published" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Draft
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs pt-2 border-t border-[color-mix(in_oklab,var(--border)_60%,transparent)]">
                  <Button
                    type="button"
                    variant={isActive ? "primary" : "default"}
                    onClick={() => setActiveScheduleId(sched.id)}
                    className="h-8 text-[11px] px-2.5"
                  >
                    {isActive ? "Active Schedule" : "Select Schedule"}
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleOpenEditor(sched)}
                    className="h-8 text-[11px] px-2.5 flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Courses
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleOpenPermissions(sched)}
                    className="h-8 text-[11px] px-2.5 flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3 text-[var(--accent)]" /> Access Rules
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setPdfTargetSchedule(sched)}
                    className="h-8 text-[11px] px-2.5 flex items-center gap-1 relative"
                  >
                    <FileText className="w-3 h-3 text-emerald-500" /> Schedule PDF
                    {sched.pdfEnabled && sched.pdfFileUrl && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={async () => {
                      await duplicateSemester(sched.id, String(Number(sched.semester) + 1), sched.academicYear);
                      toast.success("Duplicated semester schedule in Firestore!");
                    }}
                    className="h-8 text-[11px] px-2.5 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Duplicate
                  </Button>

                  {sched.status !== "published" && (
                    <Button
                      type="button"
                      variant="default"
                      onClick={async () => {
                        await publishSemester(sched.id);
                        toast.success("Published semester in Firestore!");
                      }}
                      className="h-8 text-[11px] px-2.5 text-emerald-500 hover:text-emerald-400"
                    >
                      Publish
                    </Button>
                  )}

                  {schedulesList.length > 1 && (
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteSchedule(sched.id);
                        toast.success("Deleted schedule from Firestore.");
                      }}
                      className="text-rose-500 hover:text-rose-400 p-1.5 ml-auto cursor-pointer"
                      aria-label="Delete schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Schedule Permissions Modal Dialog */}
      {permissionTargetSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[540px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-5 grid gap-4 relative max-h-[88vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setPermissionTargetSchedule(null)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[color-mix(in_oklab,var(--accent)_20%,transparent)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--text)]">Schedule Access Control Rules</h4>
                <p className="text-xs text-[var(--muted)] font-mono">{permissionTargetSchedule.title}</p>
              </div>
            </div>

            <div className="grid gap-4 text-xs">
              {/* Visibility Selector */}
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)]">Access Visibility Mode</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${visibility === "public"
                      ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)]"
                      : "border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)]"
                      }`}
                  >
                    <Eye className="w-3.5 h-3.5 mx-auto mb-1" /> Public (Everyone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("selected")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${visibility === "selected"
                      ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)]"
                      : "border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)]"
                      }`}
                  >
                    <Users className="w-3.5 h-3.5 mx-auto mb-1" /> Selected Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("restricted")}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${visibility === "restricted"
                      ? "border-rose-500 bg-rose-500/15 text-rose-500"
                      : "border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)]"
                      }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 mx-auto mb-1" /> Restricted (Private)
                  </button>
                </div>
              </div>

              {/* Autocomplete Search & Add Students */}
              <div className="grid gap-2">
                <label className="text-[11px] font-bold text-[var(--muted)]">Search & Multi-Select Students</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                  <Input
                    placeholder="Search Student ID to allow or block…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                {studentSearch && (
                  <div className="max-h-[140px] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card2)] p-2 grid gap-1">
                    {filteredStudentSuggestions.length === 0 ? (
                      <div className="text-[11px] text-[var(--muted)] italic p-2">No matching student IDs found.</div>
                    ) : (
                      filteredStudentSuggestions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--chip)] text-xs">
                          <div>
                            <span className="font-mono font-bold text-[var(--text)]">{s.studentId}</span>{" "}
                            <span className="text-[var(--muted)]">({s.name})</span>
                          </div>
                          <div className="flex gap-1">
                            {visibility === "selected" && !allowedIds.includes(s.studentId) && (
                              <button
                                type="button"
                                onClick={() => setAllowedIds([...allowedIds, s.studentId])}
                                className="px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[10px] font-bold"
                              >
                                + Allow
                              </button>
                            )}
                            {!blockedIds.includes(s.studentId) && (
                              <button
                                type="button"
                                onClick={() => setBlockedIds([...blockedIds, s.studentId])}
                                className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold"
                              >
                                + Block
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Allowed Students */}
              {visibility === "selected" && (
                <div>
                  <label className="text-[11px] font-bold text-[var(--muted)]">Allowed Student IDs ({allowedIds.length})</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--chip)] min-h-[44px]">
                    {allowedIds.length === 0 ? (
                      <span className="text-[11px] text-[var(--muted)] italic">No student IDs explicitly allowed yet.</span>
                    ) : (
                      allowedIds.map((id) => (
                        <span key={id} className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-[var(--accent)]/15 text-[var(--accent)] px-2 py-0.5 rounded-md border border-[var(--accent)]/30">
                          {id}
                          <button type="button" onClick={() => setAllowedIds(allowedIds.filter((item) => item !== id))}>
                            <X className="w-3 h-3 hover:text-white" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Blocked Specific Students */}
              <div>
                <label className="text-[11px] font-bold text-[var(--muted)]">Blocked Specific Students ({blockedIds.length})</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 min-h-[44px]">
                  {blockedIds.length === 0 ? (
                    <span className="text-[11px] text-rose-400 italic">No specific students blocked from this schedule.</span>
                  ) : (
                    blockedIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/40">
                        {id}
                        <button type="button" onClick={() => setBlockedIds(blockedIds.filter((item) => item !== id))}>
                          <X className="w-3 h-3 hover:text-white" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] flex items-center justify-between">
              <Button type="button" variant="default" onClick={() => setPermissionTargetSchedule(null)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSaving}
                onClick={handleSavePermissions}
                className="h-9 text-xs flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Permission Rules
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule PDF Management Modal */}
      {pdfTargetSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-5 grid gap-4 relative">
            <button
              type="button"
              onClick={() => setPdfTargetSchedule(null)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--text)]">Schedule Official PDF Management</h4>
                <p className="text-xs text-[var(--muted)] font-mono">{pdfTargetSchedule.title}</p>
              </div>
            </div>

            <div className="grid gap-4 text-xs">
              {/* Checkbox Toggle */}
              <button
                type="button"
                onClick={async () => {
                  const newToggle = !pdfTargetSchedule.pdfEnabled;
                  await updateSchedule(pdfTargetSchedule.id, { pdfEnabled: newToggle });
                  setPdfTargetSchedule({ ...pdfTargetSchedule, pdfEnabled: newToggle });
                  toast.success(`PDF download ${newToggle ? "ENABLED" : "DISABLED"} for students!`);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_40%,transparent)] text-left hover:bg-[color-mix(in_oklab,var(--chip)_70%,transparent)] transition-all cursor-pointer"
              >
                {pdfTargetSchedule.pdfEnabled ? (
                  <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--muted)] shrink-0" />
                )}
                <div>
                  <div className="font-extrabold text-xs text-[var(--text)]">Show PDF download for users</div>
                  <div className="text-[11px] text-[var(--muted)]">Display official PDF download banner on student page</div>
                </div>
              </button>

              {/* Existing PDF Info or Upload Box */}
              {pdfTargetSchedule.pdfFileUrl ? (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 grid gap-2.5">
                  <div className="flex items-center justify-between font-bold text-xs text-emerald-400">
                    <span className="truncate max-w-[240px]">{pdfTargetSchedule.pdfFileName || "Schedule.pdf"}</span>
                    <span className="font-mono text-[10px]">
                      {pdfTargetSchedule.pdfFileSize ? `${(pdfTargetSchedule.pdfFileSize / (1024 * 1024)).toFixed(2)} MB` : "PDF"}
                    </span>
                  </div>
                  {pdfTargetSchedule.pdfUploadedAt && (
                    <div className="text-[10px] text-[var(--muted)] font-mono">
                      Uploaded: {new Date(pdfTargetSchedule.pdfUploadedAt).toLocaleString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20">
                    <a
                      href={pdfTargetSchedule.pdfFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview PDF
                    </a>

                    <label className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white font-bold text-[11px] flex items-center gap-1.5 hover:brightness-110 transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Set PDF URL
                    </label>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const updates = {
                            pdfFileUrl: "",
                            pdfFileName: "",
                            pdfFileSize: 0,
                            pdfEnabled: false,
                          };
                          await updateSchedule(pdfTargetSchedule.id, updates);
                          setPdfTargetSchedule({ ...pdfTargetSchedule, ...updates });
                          toast.success("Removed Schedule PDF.");
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to delete PDF.");
                        }
                      }}
                      className="h-8 px-3 rounded-lg bg-rose-500/20 text-rose-400 font-bold text-[11px] flex items-center gap-1.5 hover:bg-rose-500/30 transition-all cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border-2 border-dashed border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-[color-mix(in_oklab,var(--chip)_30%,transparent)] text-center grid gap-3">
                  <FileText className="w-8 h-8 mx-auto text-[var(--muted)]" />
                  <div className="font-extrabold text-xs text-[var(--text)]">Attach Official Schedule PDF URL</div>
                  <Input
                    placeholder="https://example.com/schedule.pdf"
                    className="h-9 text-xs font-mono"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const targetUrl = (e.target as HTMLInputElement).value.trim();
                        if (!targetUrl) return;
                        setIsUploadingPdf(true);
                        try {
                          const updates = {
                            pdfEnabled: true,
                            pdfFileUrl: targetUrl,
                            pdfFileName: targetUrl.split("/").pop() || "Schedule.pdf",
                            pdfFileSize: 1024 * 1024,
                            pdfUploadedAt: new Date().toISOString(),
                            pdfUploadedBy: "admin",
                          };
                          await updateSchedule(pdfTargetSchedule.id, updates);
                          setPdfTargetSchedule({ ...pdfTargetSchedule, ...updates });
                          toast.success("Attached Schedule PDF URL!");
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to attach PDF URL.");
                        } finally {
                          setIsUploadingPdf(false);
                        }
                      }
                    }}
                  />
                  <div className="text-[10px] text-[var(--muted)]">Press Enter to save URL</div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] flex justify-end">
              <Button type="button" variant="default" onClick={() => setPdfTargetSchedule(null)} className="h-8 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Courses Drawer Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[620px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-5 grid gap-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingSchedule(null)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between gap-2 pr-6">
              <h4 className="font-extrabold text-sm text-[var(--text)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" /> Manage Courses: {editingSchedule.title}
              </h4>
              <Button
                type="button"
                variant="default"
                onClick={handleAddCourse}
                className="h-7 text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Course
              </Button>
            </div>

            <div className="space-y-3">
              {coursesDraft.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--muted)] italic">
                  No courses in this schedule yet. Click &quot;Add Course&quot; above.
                </div>
              ) : (
                coursesDraft.map((course, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] grid gap-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={course.title}
                        onChange={(e) => handleUpdateCourse(idx, "title", e.target.value)}
                        placeholder="Course Title"
                        className="h-8 font-bold text-xs flex-1"
                      />
                      <input
                        type="color"
                        value={course.color || "#a9cfe0"}
                        onChange={(e) => handleUpdateCourse(idx, "color", e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-white/30 p-0 bg-transparent"
                        aria-label="Course Color"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveCourse(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30"
                          aria-label="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCourse(idx, 1)}
                          disabled={idx === coursesDraft.length - 1}
                          className="p-1 text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30"
                          aria-label="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateCourse(idx)}
                          className="p-1 text-[var(--muted)] hover:text-[var(--accent)]"
                          aria-label="Duplicate Course"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(idx)}
                          className="p-1 text-rose-500 hover:text-rose-400"
                          aria-label="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-[var(--muted)]">Day</label>
                        <select
                          value={course.day}
                          onChange={(e) => handleUpdateCourse(idx, "day", e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
                        >
                          {DAYS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-[var(--muted)]">Start Time (hrs)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="8"
                          max="20"
                          value={course.start}
                          onChange={(e) => handleUpdateCourse(idx, "start", parseFloat(e.target.value) || 8)}
                          className="w-full h-8 px-2 rounded-lg border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[var(--muted)]">End Time (hrs)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="8.5"
                          max="21"
                          value={course.end}
                          onChange={(e) => handleUpdateCourse(idx, "end", parseFloat(e.target.value) || 9)}
                          className="w-full h-8 px-2 rounded-lg border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[var(--muted)]">Room</label>
                        <Input
                          value={course.room || ""}
                          onChange={(e) => handleUpdateCourse(idx, "room", e.target.value)}
                          placeholder="e.g. CPE1115"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] flex items-center justify-between">
              <Button
                type="button"
                variant="default"
                onClick={() => setEditingSchedule(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSaving}
                onClick={handleSaveCourses}
                className="h-9 text-xs flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save All Courses
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
