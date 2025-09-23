
"use client";

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
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";
import { useProjectStore } from "@/store/project-store";


const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    "Not Started": "outline",
    "In Progress": "default",
    "Completed": "secondary",
    "On Hold": "destructive",
    "Cancelled": "destructive",
};

type Props = {
    params: { id: string }
};

export default function ProjectDetailsPage({ params }: Props) {
    const { getProject } = useProjectStore();
    const project = getProject(params.id);

    if (!project) {
        notFound();
    }

    // Assuming the first person in the team array is the lead for this example
    const teamLead = project.team[0];

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-start justify-between">
                <div className="space-y-2">
                    <Badge variant="outline">{project.client}</Badge>
                    <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl">{project.description}</p>
                </div>
                <Button variant="outline"><Pen className="mr-2 h-4 w-4" /> Edit Project</Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
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
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Team Lead</span>
                                <span>{teamLead?.name || 'N/A'}</span>
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
                                        <p className="text-sm text-muted-foreground">
                                            {member.name === teamLead.name ? 'Team Lead' : 'Developer'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <ProjectTaskView
                        initialTasks={project.tasks}
                        title="Project Tasks"
                        projectId={project.id}
                    />
                </div>
            </div>

        </div>
    )
}
