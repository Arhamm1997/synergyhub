
import type { Project } from "@/lib/types";
import { initialTasks } from "@/components/tasks/task-data";
import placeholderImages from "@/lib/placeholder-images.json";

export const initialProjects: Project[] = [
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
