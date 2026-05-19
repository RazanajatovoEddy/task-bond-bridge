import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Msg = {
  id: string;
  content: string;
  sender_user_id: string;
  created_at: string;
};

export function MessageThread({
  requestId,
  currentUserId,
}: {
  requestId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("messages")
      .select("id, content, sender_user_id, created_at")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (mounted && data) setMessages(data);
      });

    const channel = supabase
      .channel(`messages:${requestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${requestId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 4000) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      request_id: requestId,
      sender_user_id: currentUserId,
      content: trimmed,
    });
    setSending(false);
    if (error) {
      toast.error("Impossible d'envoyer le message");
      return;
    }
    setText("");
  };

  return (
    <div className="flex h-[500px] flex-col rounded-md border border-border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_user_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(m.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border p-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Votre message…"
          maxLength={4000}
          rows={2}
          className="resize-none"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={send} disabled={sending || !text.trim()} size="sm">
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}
