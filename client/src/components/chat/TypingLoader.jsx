export default function TypingLoader() {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">Assistant is typing...</span>

      <div className="flex items-center gap-1.5">
        <span className="typing-dot [animation-delay:0ms]" />
        <span className="typing-dot [animation-delay:160ms]" />
        <span className="typing-dot [animation-delay:320ms]" />
      </div>
    </div>
  );
}
