
"use client";

import {
  MessageCircle,
  Video,
  Phone,
  Search,
  Users as UsersIcon,
  ArrowLeft
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import placeholderImages from "@/lib/placeholder-images.json";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import type { Contact } from "@/lib/types";
import { ChatPanelContent } from "@/components/messages/chat-panel";
import { useChatStore } from "@/store/chat-store";


const contacts: Contact[] = [
   {
    name: "Alex Moran",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint!,
    lastMessage: "Sure, Sarah. On it now.",
    time: "10:31 AM",
    unread: 0,
    status: "Online",
  },
  {
    name: "Sarah Lee",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint!,
    lastMessage: "Sounds good, I'll review the new designs.",
    time: "10:42 AM",
    unread: 2,
    status: "Online",
  },
  {
    name: "David Chen",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint!,
    lastMessage: "Can you check the latest PR?",
    time: "9:30 AM",
    unread: 0,
    status: "Away",
  },
  {
    name: "Maria Rodriguez",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint!,
    lastMessage: "The client approved the mockups!",
    time: "Yesterday",
    unread: 0,
    status: "Offline",
  },
  {
    name: "Project Phoenix Team",
    isGroup: true,
    lastMessage: "Alex: Let's sync at 3 PM today.",
    time: "Yesterday",
    unread: 5,
  },
];


export default function MessagesPage() {
  const searchParams = useSearchParams();
  const contactName = searchParams.get("contact");
  const { openChat } = useChatStore();

  const [activeContact, setActiveContact] = useState(() => {
    const initialContact = contacts.find(c => c.name === contactName);
    return initialContact || null;
  });
  const [showChat, setShowChat] = useState(!!activeContact);

  useEffect(() => {
    const contactFromUrl = contacts.find(c => c.name === contactName);
    if (contactFromUrl) {
      setActiveContact(contactFromUrl);
      setShowChat(true); 
    }
  }, [contactName]);


  const handleContactClick = (contact: Contact) => {
    setActiveContact(contact);
    setShowChat(true);
    // On larger screens, this will just highlight. On mobile, it shows the chat.
    // For consistency, we can also use the global chat store here if needed.
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] h-[calc(100vh-100px)] gap-4">
      {/* Contacts List */}
      <Card className={cn("flex-col", showChat ? "hidden md:flex" : "flex")}>
        <CardHeader className="p-4">
          <CardTitle>Chats</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8 w-full" />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {contacts.map((contact, index) => (
              <div
                key={index}
                onClick={() => handleContactClick(contact)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  activeContact && contact.name === activeContact.name
                    ? "bg-muted"
                    : "hover:bg-muted"
                }`}
              >
                <Avatar className="h-10 w-10">
                  {contact.isGroup ? (
                    <AvatarFallback>
                      <UsersIcon className="h-5 w-5" />
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint={contact.avatarHint} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.lastMessage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{contact.time}</p>
                  {contact.unread > 0 && (
                    <Badge className="mt-1">{contact.unread}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <div className={cn("h-full", showChat ? "flex" : "hidden md:flex")}>
        {activeContact ? (
          <Card className="flex-col h-full w-full">
            <ChatPanelContent 
              contact={activeContact} 
              onClose={() => setShowChat(false)}
              isSheet={false} 
            />
          </Card>
        ) : (
          <Card className="hidden md:flex flex-col items-center justify-center h-full w-full text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground" />
            <CardHeader>
              <CardTitle>Select a chat</CardTitle>
              <CardDescription>
                Choose a conversation from the left to start messaging.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
