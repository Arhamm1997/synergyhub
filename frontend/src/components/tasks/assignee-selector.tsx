"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemberStore } from "@/store/member-store";

interface AssigneeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AssigneeSelector({ value, onChange }: AssigneeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const { members } = useMemberStore();

  const selectedMember = members.find(member => member.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
        >
          {selectedMember ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedMember.avatarUrl} alt={selectedMember.name} data-ai-hint={selectedMember.avatarHint} />
                <AvatarFallback>{selectedMember.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              {selectedMember.name}
            </div>
          ) : (
            "Select assignee..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandEmpty>No member found.</CommandEmpty>
          <CommandGroup>
            {members.map((member) => (
              <CommandItem
                key={member.id}
                value={member.name}
                onSelect={() => {
                  onChange(member.name);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.avatarHint} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {member.name}
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === member.name ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}