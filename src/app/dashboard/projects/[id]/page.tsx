
import { ProjectTaskView } from "@/components/tasks/task-views";
import { initialTasks } from "@/components/tasks/task-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import placeholderImages from "@/lib/placeholder-images.json";
import type { Project } from "@/lib/types";
import { notFound } from "next/navigation";


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
