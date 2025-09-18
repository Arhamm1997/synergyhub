
"use client"

import { useState } from "react";
import { PlusCircle, MoreVertical, Mail, Phone } from "lucide-react";
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
import placeholderImages from "@/lib/placeholder-images.json";
import type { Member } from "@/lib/types";
import { MemberDialog } from "@/components/members/member-dialog";

const initialMembers: Member[] = [
  {
    id: "1",
    name: "Alex Moran",
    role: "Team Lead",
    department: "Engineering",
    email: "alex.moran@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint!,
    details: "Manages the frontend and backend development teams. Expert in React and Node.js.",
  },
  {
    id: "2",
    name: "Sarah Lee",
    role: "UX/UI Designer",
    department: "Design",
    email: "sarah.lee@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint!,
    details: "Leads the design team and is responsible for the overall user experience.",
  },
  {
    id: "3",
    name: "David Chen",
    role: "Frontend Developer",
    department: "Engineering",
    email: "david.chen@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint!,
  },
  {
    id: "4",
    name: "Maria Rodriguez",
    role: "Marketing Manager",
    department: "Marketing",
    email: "maria.r@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint!,
  },
];

const departmentVariant: { [key in Member['department']]: "default" | "secondary" | "destructive" | "outline" } = {
    "Engineering": "default",
    "Design": "secondary",
    "Marketing": "outline",
    "Sales": "destructive",
    "Support": "default",
    "HR": "secondary",
    "Operations": "default",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleCreateMember = (newMember: Omit<Member, 'id'>) => {
    const memberToAdd: Member = {
      id: `MEMBER-${Math.floor(Math.random() * 10000)}`,
      ...newMember
    }
    setMembers(prev => [memberToAdd, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">Manage your team and their roles.</p>
         </div>
         <MemberDialog onCreateMember={handleCreateMember}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
            </Button>
         </MemberDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="flex flex-col items-center text-center p-6">
                <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.avatarHint} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
                <Badge variant={departmentVariant[member.department] || 'default'} className="mt-2">{member.department}</Badge>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground space-y-1">
              <p>{member.email}</p>
              {member.details && <p className="text-xs">{member.details}</p>}
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
              <Button variant="outline" size="icon"><Mail className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
              <Button variant="outline">View Profile</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
