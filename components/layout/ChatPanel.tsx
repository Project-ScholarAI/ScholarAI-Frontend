"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { X, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/chat/ChatMessage"
import { ChatComposer } from "@/components/chat/ChatComposer"
import { useChat } from "@/lib/hooks/useChat"
import { cn } from "@/lib/utils/cn"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function ChatPanel({ isOpen, onClose }: Props) {
  const { messages, sendMessage, isLoading, currentChat, startNewChat, chatHistory } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(350)
  const [isDragging, setIsDragging] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle mouse dragging for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      // Calculate new width based on mouse position
      // We're subtracting from window.innerWidth because the panel is on the right side
      const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX))
      setWidth(newWidth)

      // Update the main content margin
      if (panelRef.current) {
        document.body.style.cursor = "ew-resize"
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ""
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
    }
  }, [isDragging])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-background border-l dark:bg-zinc-900"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/20"
        onMouseDown={handleMouseDown}
      />

      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{currentChat.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={startNewChat} className="h-8 w-8 rounded-full" title="New chat">
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChatHistory(!showChatHistory)}
            className="h-8 w-8 rounded-full"
            title="Chat history"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full" title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showChatHistory ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="p-2 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => {
                // Switch to this chat
                setShowChatHistory(false)
              }}
            >
              <p className="font-medium">{chat.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(chat.lastUpdated).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "flex-1 overflow-y-auto p-4 space-y-4",
            "scrollbar scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent",
          )}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="border-t p-4">
        <ChatComposer onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
