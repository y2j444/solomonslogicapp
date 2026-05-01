"use client";

import { useEffect, useState } from "react";
import { AppShell, Surface, EmptyState } from "@/components/app-shell";
import { format } from "date-fns";

type CallLog = {
  id: string;
  callerPhone: string;
  direction: string;
  durationSeconds: number;
  aiSummary: string | null;
  calledAt: string;
  transcript: any; // Structured chat log
};

export default function AiReceptionistPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  useEffect(() => {
    fetch("/api/call-logs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <AppShell
      title="AI Receptionist"
      subtitle="Recent Conversations & Call Activity"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Call List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">
            Recent Activity
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedCall(log)}
                  className={`w-full text-left transition-all ${
                    selectedCall?.id === log.id
                      ? "ring-2 ring-[#355cc9]"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Surface className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-sm">{log.callerPhone}</div>
                      <div className="text-[10px] text-zinc-500">
                        {format(new Date(log.calledAt), "MMM d, h:mm a")}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-400 line-clamp-2">
                      {log.aiSummary || "No summary available"}
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        ⏱ {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                      </span>
                      <span>•</span>
                      <span className="capitalize">{log.direction.toLowerCase()}</span>
                    </div>
                  </Surface>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No calls yet"
              description="Calls handled by your AI receptionist will appear here."
            />
          )}
        </div>

        {/* Right Column: Transcript / Details */}
        <div className="lg:col-span-2">
          {selectedCall ? (
            <div className="space-y-4 sticky top-4">
              <Surface className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-bold">{selectedCall.callerPhone}</h3>
                    <p className="text-sm text-zinc-400">
                      {format(new Date(selectedCall.calledAt), "EEEE, MMMM do 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                    AI Handled
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">AI Summary</h4>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {selectedCall.aiSummary || "Summary is being generated..."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4">Conversation Dialog</h4>
                    {selectedCall.transcript ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {Array.isArray(selectedCall.transcript) ? (
                          selectedCall.transcript.map((msg: any, i: number) => (
                            <div
                              key={i}
                              className={`flex flex-col ${
                                msg.role === "assistant" ? "items-start" : "items-end"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                  msg.role === "assistant"
                                    ? "bg-white/5 text-zinc-200 rounded-bl-none"
                                    : "bg-[#355cc9] text-white rounded-br-none"
                                }`}
                              >
                                {msg.content || msg.text}
                              </div>
                              <span className="text-[10px] text-zinc-600 mt-1 px-1">
                                {msg.role === "assistant" ? "AI Receptionist" : "Caller"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-zinc-500 italic">
                            Transcript data is in an unexpected format.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                        <span className="text-2xl mb-2">📄</span>
                        <p className="text-sm text-zinc-500">No dialog recorded for this call.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Surface>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
              <div className="text-center">
                <div className="text-4xl mb-4">📞</div>
                <h3 className="text-lg font-medium text-zinc-400">Select a call to view dialog</h3>
                <p className="text-sm text-zinc-500 mt-1">Full transcripts and AI insights will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
