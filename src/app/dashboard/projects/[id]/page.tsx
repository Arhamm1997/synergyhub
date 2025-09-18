
import { ProjectTaskView } from "@/components/tasks/task-views";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/types";
import { notFound } from "next/navigation";
import { initialProjects } from "@/lib/project-data";


const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "In Progress": "default",
  "Completed": "secondary",
  "On Hold": "destructive",
};

function getProject(id: string): Project | undefined {
    return initialProjects.find(p => p.id === id);
}

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const project = getProject(params.id);

    if (!project) {
        notFound();
    }
    
    return (
        <div className="flex flex-col gap-8">
            <header className="space-y-2">
                <p className="text-muted-foreground">Project / {project.client}</p>
                <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl">{project.description}</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Client</span>
                                <span>{project.client}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Deadline</span>
                                <span>{project.deadline}</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.team.map(member => (
                                <div key={member.name} className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.avatarHint} />
                                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">Developer</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <ProjectTaskView initialTasks={project.tasks} title="Project Tasks" />
                </div>
            </div>

        </div>
    )
}
