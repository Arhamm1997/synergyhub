
"use client";

import { useState } from "react";
import { ProjectTaskView } from "@/components/tasks/task-views";
import { initialProjects } from "@/lib/project-data";
import type { Task } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allTasks = initialProjects.flatMap(p => p.tasks);

export default function TasksPage() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const handleProjectChange = (projectId: string) => {
        if (projectId === "all") {
            setSelectedProject(null);
        } else {
            setSelectedProject(projectId);
        }
    };

    const getTasks = () => {
        if (selectedProject) {
            return initialProjects.find(p => p.id === selectedProject)?.tasks || [];
        }
        return allTasks;
    };

    const getTitle = () => {
        if (selectedProject) {
            return `${initialProjects.find(p => p.id === selectedProject)?.name} Tasks`;
        }
        return "All Tasks";
    }

    return (
        <div className="flex flex-col gap-4 h-full">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <div className="w-full max-w-xs">
                    <Select onValueChange={handleProjectChange} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by project..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {initialProjects.map(project => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <ProjectTaskView initialTasks={getTasks()} title={getTitle()} />
        </div>
    )
}
