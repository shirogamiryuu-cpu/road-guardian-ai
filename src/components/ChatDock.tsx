import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { Send, Square, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatDock() {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(true);
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  const quickAsks = [
    "Fine for no helmet in Tamil Nadu?",
    "What's the penalty for drunk driving?",
    "Who fixes a damaged National Highway?",
    "Emergency numbers I should call after a crash?",
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[1000] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 transition"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex h-[min(620px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/20 text-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 spark" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">Lann Pya Kyel</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">CO-PILOT · ONLINE</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">
          minimise
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask anything about Indian traffic law, road emergencies, or who's responsible for a broken road.
            </p>
            <div className="flex flex-wrap gap-2">
              {quickAsks.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage({ text: q })}
                  className="text-xs rounded-full border border-border bg-secondary/40 px-3 py-1.5 hover:bg-secondary text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const toolParts = m.parts.filter((p) => p.type.startsWith("tool-"));
            return (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                      : "max-w-[95%] text-sm"
                  }
                >
                  {m.role === "assistant" && toolParts.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {toolParts.map((p, i) => (
                        <div
                          key={i}
                          className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {p.type.replace("tool-", "tool · ")}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-strong:text-primary prose-ul:my-1">
                      <ReactMarkdown>{text || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    text
                  )}
                </div>
              </div>
            );
          })
        )}
        {busy && (
          <div className="text-xs text-muted-foreground font-mono animate-pulse">Lann Pya Kyel is thinking…</div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Lann Pya Kyel…"
          autoFocus
          className="flex-1 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {busy ? (
          <Button type="button" size="icon" variant="destructive" onClick={() => stop()}>
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
