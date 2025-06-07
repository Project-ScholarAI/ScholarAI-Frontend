import { ProjectWorkspace } from "@/components/interface/ProjectWorkspace"

interface ProjectPageProps {
    params: {
        id: string
    }
}

export default function ProjectPage({ params }: ProjectPageProps) {
    return (
        <div className="h-full">
            <ProjectWorkspace projectId={params.id} />
        </div>
    )
} 