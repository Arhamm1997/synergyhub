
"use client"

import { useState, useEffect } from "react";
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

import { useClientsStore } from "@/store/clients-store";

const statusVariant: { [key in ClientStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  "Active": "default",
  "Completed": "secondary",
  "On Hold": "destructive",
  "Lead": "outline",
  "Cancelled": "destructive",
};

export default function ClientsPage() {
  const { clients, isLoading, error, fetchClients, createClient, updateClient, deleteClient } = useClientsStore();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveClient = async (clientData: any) => {
    try {
      if ('id' in clientData) {
        // Editing existing client
        await updateClient(clientData.id, clientData);
        toast({ title: "Client Updated", description: "The client details have been saved." });
      } else {
        // Creating new client
        await createClient(clientData);
        toast({ title: "Client Created", description: "The new client has been added." });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleOpenEditDialog = (client: Client) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      toast({ title: "Client Deleted", description: "The client has been successfully deleted." });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
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
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-32 bg-muted rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 w-16 bg-muted rounded"></div>
                <div className="h-2 w-full bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 w-full bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))
        ) : error ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : clients.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Clients</CardTitle>
              <CardDescription>Get started by adding your first client.</CardDescription>
            </CardHeader>
            <CardFooter>
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
            </CardFooter>
          </Card>
        ) : (
          clients.map((client) =>
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
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
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
