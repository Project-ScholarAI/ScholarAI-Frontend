"use client"

import { usePathname } from "next/navigation"
import { MessageSquare, Upload, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPageTitle } from "@/lib/utils/navigation"

type Props = {
  onChatToggle: () => void
}

export function Topbar({ onChatToggle }: Props) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        {pathname.includes("/interface/library") && (
          <>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </>
        )}
        <Button variant="outline" size="icon" onClick={onChatToggle} aria-label="Toggle chat">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
