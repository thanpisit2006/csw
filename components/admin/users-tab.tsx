"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllStudents,
  updateUserStatus,
  createStudentAccount,
  updateStudentAccount,
  deleteStudentAccount,
} from "@/lib/firebase/firestore-service";
import type { UserRecord, UserStatus, ExpirationMode } from "@/lib/db/mock-data";
import { logActivity } from "@/lib/logger";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PulseLoader } from "@/components/ui/pulse-loader";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Ban,
  X,
  RefreshCw,
  Globe,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  Mail,
  FileText,
} from "lucide-react";

export function UsersTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"studentId" | "name" | "lastLogin">("lastLogin");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection / Modal States
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  // Form Fields State
  const [formStudentId, setFormStudentId] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<UserStatus>("active");
  const [formExpMode, setFormExpMode] = useState<ExpirationMode>("never");
  const [formExpDate, setFormExpDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Status Action Modal State
  const [statusTarget, setStatusTarget] = useState<{ user: UserRecord; action: UserStatus } | null>(null);
  const [statusReason, setStatusReason] = useState("");

  const { data: students = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: getAllStudents,
    staleTime: 15_000,
  });

  // Create Student Mutation
  const createMutation = useMutation({
    mutationFn: createStudentAccount,
    onSuccess: (newId, variables) => {
      toast.success("Created new student account!");
      logActivity({
        userId: "admin",
        studentId: variables.studentId,
        action: "UPDATE_CONSENT",
        resource: `Student: ${variables.studentId}`,
        metadata: { adminAction: "CREATE_USER", studentId: variables.studentId, status: variables.status },
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create student account.");
    },
  });

  // Update Student Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<UserRecord, "id">> }) =>
      updateStudentAccount(id, updates),
    onSuccess: (_, variables) => {
      toast.success("Updated student account details!");
      logActivity({
        userId: "admin",
        studentId: "ADMIN",
        action: "UPDATE_CONSENT",
        resource: `Student Doc: ${variables.id}`,
        metadata: { adminAction: "EDIT_USER", updates: variables.updates },
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setEditingUser(null);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update student account.");
    },
  });

  // Delete Student Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStudentAccount,
    onSuccess: (_, studentId) => {
      toast.success("Deleted student account.");
      logActivity({
        userId: "admin",
        studentId: "ADMIN",
        action: "UPDATE_CONSENT",
        resource: `Student Doc: ${studentId}`,
        metadata: { adminAction: "DELETE_USER", targetDocId: studentId },
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setDeletingUser(null);
    },
    onError: () => {
      toast.error("Failed to delete student account.");
    },
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: UserStatus; reason?: string }) => {
      await updateUserStatus(id, status, reason, "admin");
    },
    onSuccess: (_, variables) => {
      toast.success(`User status updated to "${variables.status.toUpperCase()}".`);
      logActivity({
        userId: "admin",
        studentId: "ADMIN",
        action: "UPDATE_CONSENT",
        resource: `Student Doc: ${variables.id}`,
        metadata: { adminAction: "CHANGE_STATUS", newStatus: variables.status, reason: variables.reason },
      }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setStatusTarget(null);
      setStatusReason("");
    },
    onError: () => {
      toast.error("Failed to update user status.");
    },
  });

  const resetForm = () => {
    setFormStudentId("");
    setFormName("");
    setFormEmail("");
    setFormStatus("active");
    setFormExpMode("never");
    setFormExpDate("");
    setFormNotes("");
  };

  const handleOpenEdit = (student: UserRecord) => {
    setEditingUser(student);
    setFormStudentId(student.studentId);
    setFormName(student.name);
    setFormEmail(student.email || "");
    setFormStatus(student.status);
    setFormExpMode(student.expirationMode || "never");
    setFormExpDate(student.expirationDate || "");
    setFormNotes(student.notes || "");
  };

  // Filter & Sort Logic
  const filteredStudents = students
    .filter((s) => {
      const matchesSearch =
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.lastIp && s.lastIp.includes(searchTerm));
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortField === "studentId") comp = a.studentId.localeCompare(b.studentId);
      else if (sortField === "name") comp = a.name.localeCompare(b.name);
      else if (sortField === "lastLogin") comp = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      return sortOrder === "asc" ? comp : -comp;
    });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            <Clock className="w-3 h-3" /> Expired
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
            <ShieldAlert className="w-3 h-3" /> Suspended
          </span>
        );
      case "banned":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            <Ban className="w-3 h-3" /> Banned
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="w-5 h-5 text-[var(--accent)]" /> Complete Student User Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                resetForm();
                setCreateModalOpen(true);
              }}
              className="h-9 text-xs flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4" /> Create Student
            </Button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1.5 transition-colors cursor-pointer"
              aria-label="Refresh student records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-pulse" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {/* Search, Filter & Sort Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--muted)]" />
            <Input
              placeholder="Search Student ID, Name, Email, or IP…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--muted)] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Status Filter"
              className="h-10 px-3 rounded-[12px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Green)</option>
              <option value="expired">Expired (Yellow)</option>
              <option value="suspended">Suspended (Orange)</option>
              <option value="banned">Banned (Red)</option>
            </select>

            <span className="text-xs text-[var(--muted)] font-medium ml-2">Sort:</span>
            <button
              type="button"
              onClick={() => {
                if (sortField === "lastLogin") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else {
                  setSortField("lastLogin");
                  setSortOrder("desc");
                }
              }}
              className="h-10 px-3 rounded-[12px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] font-medium flex items-center gap-1 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--accent)]" />
              {sortField === "lastLogin" ? `Last Login (${sortOrder.toUpperCase()})` : "Sort Login"}
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && <PulseLoader text="Loading student accounts from Firestore…" />}

        {error && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold">
            Failed to load student data. Check Firestore rules & connection.
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <>
            <div className="overflow-x-auto rounded-xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[color-mix(in_oklab,var(--card2)_80%,transparent)] border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)] text-[var(--muted)] font-bold sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Name & Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Expiration Mode</th>
                    <th className="p-3">Real Client IP</th>
                    <th className="p-3">Last Activity</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color-mix(in_oklab,var(--border)_50%,transparent)]">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-[var(--muted)] italic">
                        No student access records match your search & filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[color-mix(in_oklab,var(--chip)_40%,transparent)] transition-colors">
                        <td className="p-3 font-mono font-bold text-[var(--text)]">
                          {student.studentId}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-[var(--text)]">{student.name}</div>
                          <div className="text-[11px] text-[var(--muted)]">{student.email || "—"}</div>
                        </td>
                        <td className="p-3">
                          {renderStatusBadge(student.status)}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[var(--muted)] capitalize">
                          {student.expirationMode === "custom" && student.expirationDate
                            ? `Custom: ${new Date(student.expirationDate).toLocaleDateString()}`
                            : student.expirationMode || "Never"}
                        </td>
                        <td className="p-3 font-mono text-[var(--text)] font-bold text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
                            {student.lastIp || "127.0.0.1"}
                          </span>
                        </td>
                        <td className="p-3 text-[var(--muted)] font-mono">
                          {new Date(student.lastActivity || student.lastLogin).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(student)}
                            className="text-[var(--accent)] hover:underline font-bold text-xs cursor-pointer px-1"
                          >
                            Profile
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(student)}
                            className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                            aria-label="Edit Student"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(student)}
                            className="p-1 text-rose-500 hover:text-rose-400 cursor-pointer"
                            aria-label="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between gap-3 text-xs pt-2">
              <div className="text-[var(--muted)] font-mono">
                Showing {paginatedStudents.length} of {filteredStudents.length} records (Page {currentPage} of {totalPages})
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="default"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="default"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Create / Edit Student Modal */}
      {(createModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-5 grid gap-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-extrabold text-sm text-[var(--text)] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
              {editingUser ? `Edit Student: ${editingUser.studentId}` : "Create New Student Account"}
            </h4>

            <div className="grid gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[var(--muted)] font-medium">Student ID *</label>
                  <Input
                    value={formStudentId}
                    disabled={!!editingUser}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    placeholder="e.g. 68070501234"
                    className="mt-1 h-9 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--muted)] font-medium">Full Name *</label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Thanpisit R."
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[var(--muted)] font-medium">Email Address (Optional)</label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="student@kmutt.ac.th"
                  className="mt-1 h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[var(--muted)] font-medium">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    aria-label="Status"
                    className="w-full mt-1 h-9 px-2.5 rounded-[12px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
                  >
                    <option value="active">Active (Green)</option>
                    <option value="expired">Expired (Yellow)</option>
                    <option value="suspended">Suspended (Orange)</option>
                    <option value="banned">Banned (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[var(--muted)] font-medium">Expiration Mode</label>
                  <select
                    value={formExpMode}
                    onChange={(e) => setFormExpMode(e.target.value as ExpirationMode)}
                    aria-label="Expiration Mode"
                    className="w-full mt-1 h-9 px-2.5 rounded-[12px] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] bg-[color-mix(in_oklab,var(--card2)_70%,transparent)] text-xs text-[var(--text)] outline-none"
                  >
                    <option value="never">Never Expires</option>
                    <option value="custom">Custom Date & Time</option>
                    <option value="manual">Manual Admin Expiration</option>
                  </select>
                </div>
              </div>

              {formExpMode === "custom" && (
                <div>
                  <label className="text-[11px] text-[var(--muted)] font-medium">Custom Expiration Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={formExpDate}
                    onChange={(e) => setFormExpDate(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-[var(--muted)] font-medium">Admin Notes</label>
                <Input
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Internal notes regarding student access…"
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditingUser(null);
                }}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  if (!formStudentId.trim() || !formName.trim()) {
                    toast.error("Please fill in required fields.");
                    return;
                  }
                  if (editingUser) {
                    updateMutation.mutate({
                      id: editingUser.id,
                      updates: {
                        name: formName,
                        email: formEmail,
                        status: formStatus,
                        expirationMode: formExpMode,
                        expirationDate: formExpDate,
                        notes: formNotes,
                      },
                    });
                  } else {
                    createMutation.mutate({
                      studentId: formStudentId,
                      name: formName,
                      email: formEmail,
                      status: formStatus,
                      expirationMode: formExpMode,
                      expirationDate: formExpDate,
                      notes: formNotes,
                    });
                  }
                }}
                className="h-8 text-xs font-bold"
              >
                Save Student Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] rounded-[24px] border border-rose-500/30 bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-5 grid gap-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--text)]">Delete Student Account</h4>
                <p className="text-xs text-[var(--muted)] font-mono">{deletingUser.studentId}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Are you sure you want to permanently delete this student record from Firestore? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[color-mix(in_oklab,var(--border)_70%,transparent)]">
              <Button type="button" variant="default" onClick={() => setDeletingUser(null)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingUser.id)}
                className="h-8 text-xs font-bold"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full User Details Profile Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[540px] rounded-[24px] border border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--card2)] shadow-2xl p-6 grid gap-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_20%,transparent)] text-[var(--accent)] flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-[var(--text)]">{selectedUser.name}</h4>
                <p className="text-xs text-[var(--muted)] font-mono">Student ID: {selectedUser.studentId} • {selectedUser.email || "No Email"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--chip)_40%,transparent)]">
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Account Status</span>
                <span className="mt-0.5 inline-block">{renderStatusBadge(selectedUser.status)}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Expiration Mode</span>
                <span className="font-mono text-[var(--text)] capitalize">{selectedUser.expirationMode || "Never"}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Created Date</span>
                <span className="font-mono text-[var(--text)]">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Last Activity</span>
                <span className="font-mono text-[var(--text)]">{new Date(selectedUser.lastActivity || selectedUser.lastLogin).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Login Count</span>
                <span className="font-mono font-bold text-[var(--text)]">{selectedUser.loginCount} times</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Real Client IP</span>
                <span className="font-mono font-bold text-[var(--accent)]">{selectedUser.lastIp || "127.0.0.1"}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Preferred Device</span>
                <span className="font-mono text-[var(--text)]">{selectedUser.device || "Desktop"}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">OS / Browser</span>
                <span className="font-mono text-[var(--text)]">{selectedUser.os} • {selectedUser.browser}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Language / Timezone</span>
                <span className="font-mono text-[var(--text)]">{selectedUser.language} • {selectedUser.timezone}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">Screen Resolution</span>
                <span className="font-mono text-[var(--text)]">{selectedUser.screenResolution}</span>
              </div>
            </div>

            {selectedUser.notes && (
              <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs">
                <span className="text-[var(--muted)] font-bold block mb-0.5">Admin Notes:</span>
                <p className="text-[var(--text)]">{selectedUser.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
