"use client"

import { cn } from "@/lib/utils/cn"
import type { Message } from "@/types/chat"
import { useDocument } from "@/lib/hooks/useDocument"
import { AtSign } from "lucide-react"

type Props = {
  message: Message
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user"
  const { documents } = useDocument()

  // Get document information for context
  const contextDocs = message.context?.map((docId) => {
    const doc = documents.find((d) => d.id === docId)
    return doc
  }).filter(Boolean)

  return (
    <div className={cn(
      "group relative flex flex-col gap-1.5 py-4",
      isUser ? "items-end" : "items-start"
    )}>
      {/* Context tags for user messages */}
      {isUser && contextDocs && contextDocs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {contextDocs.map((doc) => doc && (
            <div
              key={doc.id}
              className="inline-flex items-center gap-1 bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded text-xs"
            >
              <AtSign className="h-3 w-3" />
              <span>{doc.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Message content */}
      <div
        className={cn(
          "relative max-w-[85%] rounded-lg px-3 py-2",
          isUser 
            ? "bg-primary/10 text-foreground" 
            : "bg-transparent text-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
      </div>

      {/* Assistant label */}
      {!isUser && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>Assistant</span>
        </div>
      )}
    </div>
  )
}