import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import TypingLoader from "./TypingLoader.jsx";

export default function ChatWindow({ messages, isTyping, error }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;

    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className="h-full min-h-0 lg:h-[64vh] overflow-y-auto space-y-6 pr-1"
    >
      {messages.length === 0 ? (
        <div className="surface p-6">
          <div className="text-slate-100 font-semibold">Start chatting</div>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Ask a question about refund policy, warranty, cancellation,
            onboarding, etc. If documents are uploaded in Admin, the assistant
            will answer from them.
          </p>

          {error && (
            <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((m, idx) => (
            <MessageBubble key={idx} sender={m.sender} text={m.text} />
          ))}

          {isTyping && (
            <div className="flex justify-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] border border-white/[0.10]" />
              <div className="max-w-[78%] surface-2 px-4 py-3">
                <TypingLoader />
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
