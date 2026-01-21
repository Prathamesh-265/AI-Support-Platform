import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import { clearHistory, getHistory, sendChatMessage } from "../services/chat.api.js";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const sendingRef = useRef(false);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // ✅ Mobile: show/hide sessions panel
  const [showSessions, setShowSessions] = useState(false);

  const buildSessions = (msgs) => {
    if (!msgs || msgs.length === 0) return [];

    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < msgs.length; i += chunkSize) {
      chunks.push(msgs.slice(i, i + chunkSize));
    }

    return chunks.map((chunk, index) => {
      const title =
        chunk.find((m) => m.sender === "user")?.text?.slice(0, 30) || "New chat";

      return {
        id: `session-${index}`,
        title: title.length >= 30 ? title + "..." : title,
        messages: chunk,
      };
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const history = await getHistory();
        const msgs = history?.messages || [];
        setMessages(msgs);

        const ses = buildSessions(msgs);
        setSessions(ses);

        if (ses.length > 0) {
          setActiveSessionId(ses[ses.length - 1].id);
        }
      } catch {
        setError("Failed to load chat history");
      }
    };
    load();
  }, []);

  const activeMessages = useMemo(() => {
    if (!activeSessionId) return messages;
    const found = sessions.find((s) => s.id === activeSessionId);
    return found?.messages || messages;
  }, [activeSessionId, sessions, messages]);

  const startNewChat = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: "New chat",
      messages: [],
    };

    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setError("");

    // ✅ mobile UX: close panel after action
    setShowSessions(false);
  };

  const clear = async () => {
    try {
      await clearHistory();
      setMessages([]);
      setSessions([]);
      setActiveSessionId(null);
      setShowSessions(false);
    } catch {
      setError("Failed to clear chat");
    }
  };

  const send = async (text) => {
    if (!text?.trim()) return;
    if (sendingRef.current || typing) return;

    sendingRef.current = true;
    setError("");
    setTyping(true);

    const newUserMsg = { sender: "user", text };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: s.title === "New chat" ? text.slice(0, 30) : s.title,
              messages: [...s.messages, newUserMsg],
            }
          : s
      )
    );

    try {
      const res = await sendChatMessage(text);

      if (res?.reply) {
        const newAiMsg = { sender: "ai", text: res.reply };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, newAiMsg] }
              : s
          )
        );
      } else {
        setError("No reply received from server");
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to send message"
      );
    } finally {
      setTyping(false);
      sendingRef.current = false;
    }
  };

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* ✅ Mobile Sessions Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowSessions((p) => !p)}
            className="w-full surface-2 px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 text-left">
              <div className="text-sm font-semibold text-slate-100 truncate">
                {activeSession?.title || "Chat Sessions"}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {activeSession
                  ? `${activeSession.messages.length} messages`
                  : "No sessions selected"}
              </div>
            </div>

            <span className="text-xs text-slate-300">
              {showSessions ? "Hide" : "Show"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* ✅ LEFT PANEL */}
          <aside
            className={[
              "glass rounded-3xl border border-white/10 shadow-soft overflow-hidden flex flex-col",
              // ✅ desktop keeps same height
              "lg:h-[82vh]",
              // ✅ mobile becomes auto height
              showSessions ? "h-[60vh]" : "hidden",
              "lg:flex",
            ].join(" ")}
          >
            <div className="p-4 border-b border-white/10">
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 bg-white text-slate-950 font-semibold hover:bg-white/90 transition"
              >
                <Plus size={18} />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessions.length === 0 ? (
                <div className="text-sm text-slate-400 px-2 py-3">
                  No previous chats yet.
                </div>
              ) : (
                sessions
                  .slice()
                  .reverse()
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setShowSessions(false); // ✅ close on mobile
                      }}
                      className={[
                        "w-full text-left rounded-2xl px-3 py-3 border transition flex items-start gap-3",
                        activeSessionId === s.id
                          ? "bg-white/10 border-white/15"
                          : "bg-white/5 border-white/10 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <div className="mt-0.5 h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                        <MessageSquare size={16} className="text-sky-300" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm text-slate-100 truncate">
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          {s.messages.length} messages
                        </div>
                      </div>
                    </button>
                  ))
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <button
                onClick={clear}
                disabled={sessions.length === 0}
                className="w-full rounded-2xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                Clear All Chats
              </button>
            </div>
          </aside>

          {/* ✅ MAIN CHAT */}
          <main
            className={[
              "min-w-0 flex flex-col",
              // desktop same
              "lg:h-[82vh]",
              // mobile fill available viewport height
              "h-[calc(100vh-72px-24px-64px)]",
            ].join(" ")}
          >
            <div className="flex-1 overflow-hidden">
              <ChatWindow messages={activeMessages} isTyping={typing} />
            </div>

            <div className="mt-4 glass rounded-3xl border border-white/10 p-4 shadow-soft">
              <ChatInput onSend={send} disabled={typing} />
              {error && (
                <div className="text-sm text-red-400 mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
