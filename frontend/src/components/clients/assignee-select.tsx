
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Assignee {
    name: string;
    avatarUrl: string;
    avatarHint: string;
}

interface AssigneeSelectProps {
    assignees: Assignee[];
    selectedAssignees: string[];
    onSelectionChange: (selected: string[]) => void;
}

export function AssigneeSelect({ assignees, selectedAssignees, onSelectionChange }: AssigneeSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (currentValue: string) => {
    const newSelection = selectedAssignees.includes(currentValue)
        ? selectedAssignees.filter(name => name !== currentValue)
        : [...selectedAssignees, currentValue];
    onSelectionChange(newSelection);
  }

  const getAvatar = (name: string) => {
    return assignees.find(a => a.name.toLowerCase() === name.toLowerCase())
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selectedAssignees.length > 0 ? selectedAssignees.join(", ") : "Select team members..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {assignees.map((assignee) => (
                <CommandItem
                  key={assignee.name}
                  value={assignee.name}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAssignees.includes(assignee.name) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint={assignee.avatarHint} />
                    <AvatarFallback>{assignee.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {assignee.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
