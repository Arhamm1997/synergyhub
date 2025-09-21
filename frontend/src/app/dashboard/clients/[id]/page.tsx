
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from 'next/navigation';
import { Mail, Briefcase, User, Pen, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import placeholderImages from "@/lib/placeholder-images.json";
import { ClientDialog } from "@/components/clients/client-dialog";
import type { Client, ClientStatus, Assignee } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/store/chat-store";

const initialClients: Client[] = [
  {
    id: "1",
    name: "Innovate Corp",
    logoUrl: "https://picsum.photos/seed/logo1/60/60",
    logoHint: "abstract logo",
    project: "Mobile App Redesign",
    status: "Active",
    progress: 75,
    assignees: [
      { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: 'woman portrait' },
      { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: 'man portrait professional' },
    ],
    services: ["Mobile App Development", "UX/UI Design"],
  },
  {
    id: "2",
    name: "QuantumLeap",
    logoUrl: "https://picsum.photos/seed/logo2/60/60",
    logoHint: "geometric logo",
    project: "AI Integration",
    status: "Completed",
    progress: 100,
    assignees: [
      { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: 'woman professional' },
    ],
    services: ["AI Integration", "Data Analytics"],
  },
  {
    id: "3",
    name: "Stellar Solutions",
    logoUrl: "https://picsum.photos/seed/logo3/60/60",
    logoHint: "star logo",
    project: "E-commerce Platform",
    status: "On Hold",
    progress: 30,
    assignees: [
      { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: 'man portrait' },
      { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: 'woman portrait' },
    ],
    services: ["E-Commerce Website", "Web Design & Development"],
  },
  {
    id: "4",
    name: "Apex Enterprises",
    logoUrl: "https://picsum.photos/seed/logo4/60/60",
    logoHint: "mountain logo",
    project: "Data Analytics Dashboard",
    status: "Active",
    progress: 50,
    assignees: [
      { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: 'man portrait professional' },
      { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: 'woman professional' },
    ],
    services: ["Data Analytics Dashboard", "Business Intelligence"],
  },
];


const statusVariant: { [key in ClientStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  "Active": "default",
  "Completed": "secondary",
  "On Hold": "destructive",
  "Lead": "outline",
  "Cancelled": "destructive",
};

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const { openChat, setContact } = useChatStore();

    const [clients, setClients] = useState<Client[]>(initialClients);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

    const client = useMemo(() => clients.find(c => c.id === params.id), [clients, params.id]);

    if (!client) {
        notFound();
    }
    
    const handleSaveClient = (clientData: Client) => {
        setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
        toast({ title: "Client Updated", description: "The client details have been updated."});
        setIsClientDialogOpen(false);
    };

    const handleOpenChat = (assignee: Assignee) => {
        setContact({ ...assignee, status: "Online" });
        openChat();
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <Image
                        src={client.logoUrl}
                        alt={`${client.name} logo`}
                        data-ai-hint={client.logoHint}
                        width={80}
                        height={80}
                        className="rounded-lg"
                    />
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight">{client.name}</h1>
                        <p className="text-lg text-muted-foreground">Lead client for <Link href={`/dashboard/projects/PROJ-001`} className="text-primary hover:underline">{client.project}</Link></p>
                         <Badge variant={statusVariant[client.status]}>{client.status}</Badge>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setIsClientDialogOpen(true)}><Pen className="mr-2 h-4 w-4" /> Edit Client</Button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase /> Services</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                           {client.services?.map(service => (
                               <Badge key={service} variant="secondary">{service}</Badge>
                           ))}
                           {(!client.services || client.services.length === 0) && (
                               <p className="text-sm text-muted-foreground">No services specified for this client.</p>
                           )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User /> Assigned To</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {client.assignees.map(member => (
                                <div key={member.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.avatarHint} />
                                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="icon" onClick={() => handleOpenChat(member)}>
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Communication History</CardTitle>
                            <CardDescription>A log of all interactions with {client.name}.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground py-12">
                            <Mail className="mx-auto h-12 w-12" />
                            <p className="mt-4">No communication history found.</p>
                            <Button className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Log Interaction</Button>
                        </CardContent>
                     </Card>
                </div>
            </div>

            <ClientDialog
                client={client}
                onSave={(editedClient) => handleSaveClient(editedClient as Client)}
                isOpen={isClientDialogOpen}
                onOpenChange={setIsClientDialogOpen}
            />

        </div>
    )
}
