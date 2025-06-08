import { ProjectWorkspace } from "@/components/interface/ProjectWorkspace"

interface ProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params

    return (
        <div className="h-full">
            <ProjectWorkspace projectId={id} />
        </div>
    )
} 