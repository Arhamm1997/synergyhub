"use client"

import Image from "next/image";
import { PlusCircle, MoreVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import placeholderImages from "@/lib/placeholder-images.json";

const clients = [
  {
    name: "Innovate Corp",
    logoUrl: "https://picsum.photos/seed/logo1/40/40",
    logoHint: "abstract logo",
    project: "Mobile App Redesign",
    status: "In Progress",
    progress: 75,
    team: [
      { name: "SL", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl! },
      { name: "DC", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl! },
    ],
  },
  {
    name: "QuantumLeap",
    logoUrl: "https://picsum.photos/seed/logo2/40/40",
    logoHint: "geometric logo",
    project: "AI Integration",
    status: "Completed",
    progress: 100,
    team: [
      { name: "MR", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl! },
    ],
  },
  {
    name: "Stellar Solutions",
    logoUrl: "https://picsum.photos/seed/logo3/40/40",
    logoHint: "star logo",
    project: "E-commerce Platform",
    status: "On Hold",
    progress: 30,
    team: [
      { name: "AM", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl! },
      { name: "SL", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl! },
    ],
  },
    {
    name: "Apex Enterprises",
    logoUrl: "https://picsum.photos/seed/logo4/40/40",
    logoHint: "mountain logo",
    project: "Data Analytics Dashboard",
    status: "In Progress",
    progress: 50,
    team: [
        { name: "DC", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl! },
        { name: "MR", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl! },
    ],
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "In Progress": "default",
  "Completed": "secondary",
  "On Hold": "destructive",
};

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage all your client relationships and projects.</p>
         </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Client
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.name}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={client.logoUrl}
                  alt={`${client.name} logo`}
                  data-ai-hint={client.logoHint}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>{client.project}</CardDescription>
                </div>
              </div>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <Badge variant={statusVariant[client.status]}>{client.status}</Badge>
                 <div className="flex -space-x-2">
                    {client.team.map((member, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-card">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name}</AvatarFallback>
                        </Avatar>
                    ))}
                 </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{client.progress}%</span>
                </div>
                <Progress value={client.progress} />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Project</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
