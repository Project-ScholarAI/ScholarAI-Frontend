import { MainLayout } from "@/components/layout/MainLayout"

export default function Home() {
  return (
    <MainLayout>
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-md space-y-4 p-6 text-center">
          <h1 className="text-3xl font-bold">Welcome to ScholarAI</h1>
          <p className="text-muted-foreground">Your intelligent document analysis and research assistant</p>
        </div>
      </div>
    </MainLayout>
  )
}
