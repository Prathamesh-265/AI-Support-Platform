import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 160); // ~5 lines max
    el.style.height = next + "px";
  };

  useEffect(() => {
    resize();
  }, [text]);

  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;

    const msg = text.trim();
    if (!msg) return;

    onSend(msg);
    setText("");

    // reset height
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.style.height = "48px";
    });
  };

  const onKeyDown = (e) => {
    // Enter sends, Shift+Enter newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask your support question..."
        disabled={disabled}
        className="w-full resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-white/25 text-sm leading-6 min-h-[48px]"
      />

      <button
        type="submit"
        disabled={disabled}
        aria-label="Send message"
        className="rounded-2xl px-4 py-3 bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
      >
        <Send size={16} />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
}
