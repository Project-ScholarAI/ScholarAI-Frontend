"use client"

import type React from "react"

import { formatDate } from "@/lib/utils/date"

type Props = {
  documents: Array<{
    id: string
    title: string
    type: string
    updatedAt: string
  }>
  getIcon: (type: string) => React.ReactNode
}

export function DocumentList({ documents, getIcon }: Props) {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-12 gap-4 border-b bg-muted px-4 py-2 text-sm font-medium">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-4">Last Modified</div>
      </div>

      <div className="divide-y">
        {documents.map((doc) => (
          <div key={doc.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50">
            <div className="col-span-6 flex items-center gap-2">
              {getIcon(doc.type)}
              <span className="truncate">{doc.title}</span>
            </div>
            <div className="col-span-2 flex items-center text-sm text-muted-foreground">{doc.type.toUpperCase()}</div>
            <div className="col-span-4 flex items-center text-sm text-muted-foreground">
              {formatDate(doc.updatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
