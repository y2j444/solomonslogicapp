"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";

export default function AgencyChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Welcome to the Solomon's Logic Agency Command Center. I'm your Project Manager. How can I help you grow today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agency/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        const errorMsg = data.error || "I encountered an error processing that request.";
        setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection failed. Is the server running?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell 
      title="Agency Command Center" 
      subtitle="Manage your automated sales and marketing team"
    >
      <div className="flex flex-col h-[calc(100vh-180px)] bg-[#0a0a0a]/50 rounded-2xl border border-white/5 overflow-hidden">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-blue-600/20 border border-blue-500/30 text-blue-50" 
                  : "bg-white/5 border border-white/10 text-gray-200"
              } shadow-xl backdrop-blur-sm`}>
                <div className="text-xs uppercase tracking-widest opacity-40 mb-1 font-bold">
                  {msg.role === "assistant" ? "Project Manager" : "You"}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl animate-pulse flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest opacity-40 font-bold">Agent Working</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Give a task to your team... (e.g., 'Find 3 law firms in Nashville')"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-100 placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </AppShell>
  );
}
