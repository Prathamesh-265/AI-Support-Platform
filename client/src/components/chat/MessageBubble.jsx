import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const normalizeNewLines = (text = "") => text.replace(/\r\n/g, "\n");


const prettifyAIText = (text = "") => {
  let t = normalizeNewLines(text).trim();

  
  t = t.replace(/(Steps:|Answer:|Summary:|Conclusion:|Note:)/g, "\n\n$1");
  t = t.replace(/([^\n])(\n?- )/g, "$1\n$2");
  t = t.replace(/([^\n])(\n?\d+\.)/g, "$1\n$2");
  t = t.replace(/\. ([A-Z])/g, ".\n$1");

  return t;
};

export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";

  const raw = text || "";
  const finalText = isUser ? normalizeNewLines(raw) : prettifyAIText(raw);

  
  const mdComponents = {
    p: ({ children }) => (
      <p className="mb-2 last:mb-0 leading-6 text-sm text-slate-100">
        {children}
      </p>
    ),
    li: ({ children }) => (
      <li className="ml-5 list-disc mb-1 text-sm leading-6 text-slate-100">
        {children}
      </li>
    ),
    ol: ({ children }) => (
      <ol className="ml-5 list-decimal space-y-1 mb-2 last:mb-0">{children}</ol>
    ),
    ul: ({ children }) => (
      <ul className="ml-2 space-y-1 mb-2 last:mb-0">{children}</ul>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-slate-50">{children}</strong>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded-md bg-black/30 border border-white/10 text-[12px] leading-5">
            {children}
          </code>
        );
      }
      return (
        <pre className="mt-2 mb-2 overflow-x-auto rounded-xl bg-black/40 border border-white/10 p-3 text-[12px] leading-5">
          <code>{children}</code>
        </pre>
      );
    },
  };

 
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl px-4 py-3 bg-white text-slate-950 shadow-soft break-words whitespace-pre-wrap text-sm leading-6">
          {finalText}
        </div>
      </div>
    );
  }

  
  return (
    <div className="flex justify-start gap-3">
      {/* AI avatar */}
      <div className="mt-1 h-9 w-9 shrink-0 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center">
        <Bot size={18} className="text-sky-300" />
      </div>

      <div className="max-w-[78%]">
        <div className="text-[11px] text-slate-400 mb-1">Assistant</div>

        <div className="rounded-2xl px-4 py-3 bg-white/[0.05] border border-white/[0.08] text-slate-100 break-words leading-6 text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {finalText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
