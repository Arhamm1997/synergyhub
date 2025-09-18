
"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, MoreVertical, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import placeholderImages from "@/lib/placeholder-images.json";
import { ClientDialog } from "@/components/clients/client-dialog";
import type { Client, ClientStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const initialClients: Client[] = [
  {
    id: "1",
    name: "Innovate Corp",
    logoUrl: "https://picsum.photos/seed/logo1/40/40",
    logoHint: "abstract logo",
    project: "Mobile App Redesign",
    status: "Active",
    progress: 75,
    assignees: [
      { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: 'woman portrait' },
      { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: 'man portrait professional' },
    ],
  },
  {
    id: "2",
    name: "QuantumLeap",
    logoUrl: "https://picsum.photos/seed/logo2/40/40",
    logoHint: "geometric logo",
    project: "AI Integration",
    status: "Completed",
    progress: 100,
    assignees: [
      { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: 'woman professional' },
    ],
  },
  {
    id: "3",
    name: "Stellar Solutions",
    logoUrl: "https://picsum.photos/seed/logo3/40/40",
    logoHint: "star logo",
    project: "E-commerce Platform",
    status: "On Hold",
    progress: 30,
    assignees: [
      { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: 'man portrait' },
      { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: 'woman portrait' },
    ],
  },
    {
    id: "4",
    name: "Apex Enterprises",
    logoUrl: "https://picsum.photos/seed/logo4/40/40",
    logoHint: "mountain logo",
    project: "Data Analytics Dashboard",
    status: "Active",
    progress: 50,
    assignees: [
        { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: 'man portrait professional' },
        { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: 'woman professional' },
    ],
  },
];

const statusVariant: { [key in ClientStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  "Active": "default",
  "Completed": "secondary",
  "On Hold": "destructive",
  "Lead": "outline",
  "Cancelled": "destructive",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'project' | 'progress' | 'assignees'> | Client) => {
    if ('id' in clientData) {
      // Editing existing client
      setClients(prev => prev.map(c => c.id === clientData.id ? { ...c, ...clientData } as Client : c));
      toast({ title: "Client Updated", description: "The client details have been saved."});
    } else {
      // Creating new client
      const clientToAdd: Client = {
        id: `CLIENT-${Math.floor(Math.random() * 10000)}`,
        project: "New Project",
        progress: 0,
        assignees: [],
        ...clientData
      }
      setClients(prev => [clientToAdd, ...prev]);
      toast({ title: "Client Created", description: "The new client has been added."});
    }
  };

  const handleOpenEditDialog = (client: Client) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    toast({ title: "Client Deleted", description: "The client has been successfully deleted." });
  }

  const onDialogClose = () => {
    setEditingClient(null);
    setIsClientDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage all your client relationships and projects.</p>
         </div>
        <ClientDialog 
          onSave={handleSaveClient}
          isOpen={isClientDialogOpen && !editingClient}
          onOpenChange={setIsClientDialogOpen}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </ClientDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleOpenEditDialog(client)}>
                    Edit Client
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Client
                          </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the client "{client.name}".
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <Badge variant={statusVariant[client.status] || 'outline'}>{client.status}</Badge>
                 <div className="flex -space-x-2">
                    {client.assignees.map((member, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-card">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                    ))}
                 </div>
              </div>
              {client.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{client.progress}%</span>
                  </div>
                  <Progress value={client.progress} />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/clients/${client.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

       {editingClient && (
        <ClientDialog
            client={editingClient}
            onSave={(editedClient) => handleSaveClient({ ...editingClient, ...editedClient })}
            isOpen={isClientDialogOpen && !!editingClient}
            onOpenChange={onDialogClose}
        />
      )}
    </div>
  );
}
