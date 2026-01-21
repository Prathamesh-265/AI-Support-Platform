import { useEffect, useMemo, useRef, useState } from "react";
import { deleteDoc, listDocs, uploadDoc } from "../services/docs.api.js";
import {
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  Shield,
  Info,
} from "lucide-react";

const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

export default function AdminDashboard() {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const selectedFileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || "file",
    };
  }, [file]);

  const loadDocs = async () => {
    try {
      setFetching(true);
      const res = await listDocs();
      setDocs(res || []);
    } catch {
      setError("Failed to load documents");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async () => {
    if (!file) return;
    setError("");

    try {
      setLoading(true);
      await uploadDoc(file);
      setFile(null);
      await loadDocs();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setError("");
    try {
      await deleteDoc(id);
      await loadDocs();
    } catch {
      setError("Failed to delete document");
    }
  };

  const onPickFile = (picked) => {
    const f = picked?.[0];
    if (!f) return;

    // optional guard
    const allowed = ["application/pdf", "text/plain"];
    if (f.type && !allowed.includes(f.type)) {
      setError("Only PDF or TXT files are supported.");
      return;
    }

    setError("");
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPickFile(e.dataTransfer.files);
  };

  return (
    <div className="app-bg min-h-[calc(100vh-72px)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.08] px-3 py-1 text-xs text-slate-300">
              <Shield size={14} className="text-emerald-300" />
              Admin Workspace
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
              Knowledge Base Manager
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] text-slate-400 leading-relaxed max-w-2xl">
              Upload FAQs, manuals and policy files used by the assistant to give
              grounded answers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 sm:gap-6">
          {/* LEFT: Documents */}
          <section className="surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Uploaded Documents
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Recently uploaded files are used for chat answers.
                </div>
              </div>

              <button
                onClick={loadDocs}
                className="rounded-xl px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.10] text-slate-200 hover:bg-white/[0.07] transition"
              >
                Refresh
              </button>
            </div>

            {/* Table header */}
            <div className="mt-5 hidden sm:grid grid-cols-[1fr_170px_120px] gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-400">
              <div>File</div>
              <div>Uploaded</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="mt-3 space-y-2">
              {fetching ? (
                <div className="surface-2 p-5 flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-slate-300" />
                  <div className="text-sm text-slate-300">
                    Loading documents...
                  </div>
                </div>
              ) : docs.length === 0 ? (
                <div className="surface-2 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                      <FileText className="text-sky-300" size={20} />
                    </div>

                    <div>
                      <div className="text-slate-100 font-semibold">
                        No documents uploaded yet
                      </div>
                      <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                        Upload at least one FAQ / policy PDF to show grounded AI
                        responses during placement demo.
                      </p>
                      <p className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                        <Info size={14} />
                        Recommended: Refund policy, Warranty, Onboarding FAQ.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                docs.map((d) => (
                  <div
                    key={d._id}
                    className="surface-2 px-4 py-4 sm:py-3 flex flex-col sm:grid sm:grid-cols-[1fr_170px_120px] gap-3 sm:items-center"
                  >
                    {/* file */}
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-emerald-300" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100 truncate">
                          {d.fileName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Stored in Knowledge Base
                        </div>
                      </div>
                    </div>

                    {/* uploaded date */}
                    <div className="text-xs text-slate-400">
                      {new Date(d.createdAt).toLocaleString()}
                    </div>

                    {/* actions */}
                    <div className="flex sm:justify-end">
                      <button
                        onClick={() => remove(d._id)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/15 transition"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* RIGHT: Upload */}
          <aside className="surface p-5 sm:p-6 h-fit">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Upload a Document
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Supported formats: PDF, TXT
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-2xl border border-dashed border-white/[0.16] bg-white/[0.03] hover:bg-white/[0.05] transition cursor-pointer p-5"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center shrink-0">
                  <UploadCloud size={18} className="text-sky-300" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100">
                    Drag & drop file here
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Or click to browse. Use clean company docs for better answers.
                  </div>
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                onChange={(e) => onPickFile(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Selected file preview */}
            {selectedFileMeta && (
              <div className="mt-4 surface-2 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-emerald-300" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm text-slate-100 font-medium truncate">
                      {selectedFileMeta.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selectedFileMeta.size}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-3 text-xs text-slate-300 hover:text-white underline underline-offset-4"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              disabled={!file || loading}
              onClick={upload}
              className="mt-5 w-full rounded-2xl px-4 py-3 bg-white text-slate-950 font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload to Knowledge Base"
              )}
            </button>

          </aside>
        </div>
      </div>
    </div>
  );
}
