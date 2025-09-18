
"use client"

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, MoreVertical, FolderKanban } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import placeholderImages from "@/lib/placeholder-images.json";
import type { Project } from "@/lib/types";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { initialTasks } from "@/components/tasks/task-data";

const initialProjects: Project[] = [
  {
    id: "PROJ-001",
    name: "Mobile App Redesign",
    client: "Innovate Corp",
    status: "In Progress",
    progress: 75,
    deadline: "2024-09-30",
    team: [
      { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl! , avatarHint: 'woman portrait'},
      { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: 'man portrait professional' },
      { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: 'man portrait' },
    ],
    tasks: initialTasks.slice(0, 4),
    description: "A complete redesign of the flagship mobile application to improve user experience and modernize the interface. The project includes a new design system, updated navigation, and performance optimizations."
  },
  {
    id: "PROJ-002",
    name: "AI Integration",
    client: "QuantumLeap",
    status: "Completed",
    progress: 100,
    deadline: "2024-07-15",
    team: [
      { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: 'woman professional'},
    ],
    tasks: initialTasks.slice(4, 6),
    description: "Integrate a new AI-powered chatbot into the customer support platform. The project involves API integration, training the AI model, and ensuring seamless handoff to human agents."
  },
  {
    id: "PROJ-003",
    name: "E-commerce Platform",
    client: "Stellar Solutions",
    status: "On Hold",
    progress: 30,
    deadline: "2024-10-15",
    team: [
      { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: 'man portrait' },
      { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: 'woman portrait' },
    ],
    tasks: [],
    description: "Develop a new e-commerce platform from scratch. The project is currently on hold pending budget approval. Initial discovery and design phases are complete."
  },
  {
    id: "PROJ-004",
    name: "Data Analytics Dashboard",
    client: "Apex Enterprises",
    status: "In Progress",
    progress: 50,
    deadline: "2024-08-30",
    team: [
      { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: 'man portrait professional' },
      { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: 'woman professional' },
    ],
    tasks: initialTasks.slice(6, 8),
    description: "Build a custom data analytics dashboard to provide real-time insights into sales and marketing performance. The dashboard will feature customizable widgets and data visualizations."
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "In Progress": "default",
  "Completed": "secondary",
  "On Hold": "destructive",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const handleCreateProject = (newProject: Omit<Project, 'id' | 'progress' | 'tasks'>) => {
    const projectToAdd: Project = {
      id: `PROJ-${Math.floor(Math.random() * 1000)}`,
      progress: 0,
      tasks: [],
      ...newProject
    }
    setProjects(prev => [projectToAdd, ...prev]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
  }

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    setIsProjectDialogOpen(true);
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }
  
  const onDialogClose = () => {
    setEditingProject(null);
    setIsProjectDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage all your projects and their progress.</p>
         </div>
        <ProjectDialog 
            onSave={handleCreateProject} 
            isOpen={isProjectDialogOpen && !editingProject} 
            onOpenChange={setIsProjectDialogOpen}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </ProjectDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-md bg-muted">
                    <FolderKanban className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>Client: {project.client}</CardDescription>
                </div>
              </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(project)}>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>Archive Project</DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteProject(project.id)}
                        >
                            Delete Project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                 <div className="flex -space-x-2">
                    {project.team.map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-card">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                    ))}
                 </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Deadline: {project.deadline}</span>
               <Button variant="outline" asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {editingProject && (
        <ProjectDialog
            project={editingProject}
            onSave={(editedProject) => handleUpdateProject({ ...editingProject, ...(editedProject as Omit<Project, 'id' | 'tasks'>) })}
            isOpen={isProjectDialogOpen && !!editingProject}
            onOpenChange={onDialogClose}
        />
      )}
    </div>
  );
}
