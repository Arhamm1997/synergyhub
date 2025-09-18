
"use client";

import * as React from "react";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member } from "@/lib/types";

interface NewMessageDialogProps {
  children: React.ReactNode;
  members: Member[];
  onSelect: (member: Member) => void;
}

export function NewMessageDialog({ children, members, onSelect }: NewMessageDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const handleSelect = (member: Member) => {
    onSelect(member);
    setOpen(false);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Select a team member to start a conversation.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <div className="relative">
             <CommandInput
              placeholder="Search for a team member..."
              value={search}
              onValueChange={setSearch}
            />
          </div>
          <CommandList className="mt-2">
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {filteredMembers.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.name}
                  onSelect={() => handleSelect(member)}
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">{member.role}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
