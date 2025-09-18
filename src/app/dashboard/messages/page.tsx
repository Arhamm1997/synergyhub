"use client";

import {
  MessageCircle,
  Video,
  Phone,
  Search,
  Paperclip,
  Mic,
  Send,
} from "lucide-react";
import Image from "next/image";
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

const contacts = [
  {
    name: "Sarah Lee",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint!,
    lastMessage: "Sounds good, I'll review the new designs.",
    time: "10:42 AM",
    unread: 2,
  },
  {
    name: "David Chen",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint!,
    lastMessage: "Can you check the latest PR?",
    time: "9:30 AM",
    unread: 0,
  },
  {
    name: "Maria Rodriguez",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint!,
    lastMessage: "The client approved the mockups!",
    time: "Yesterday",
    unread: 0,
  },
  {
    name: "Project Phoenix Team",
    isGroup: true,
    lastMessage: "Alex: Let's sync at 3 PM today.",
    time: "Yesterday",
    unread: 5,
  },
];

const messages = [
  {
    sender: "Sarah Lee",
    text: "Hey Alex, I've pushed the latest designs for the marketing website. Can you take a look?",
    time: "10:30 AM",
    isMe: false,
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint!
  },
  {
    sender: "Alex Moran",
    text: "Sure, Sarah. On it now. I'll give you feedback in a bit.",
    time: "10:31 AM",
    isMe: true,
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint!
  },
  {
    sender: "Sarah Lee",
    text: "Sounds good, I'll review the new designs.",
    time: "10:42 AM",
    isMe: false,
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint!
  },
];

export default function MessagesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] h-[calc(100vh-100px)] gap-4">
      {/* Contacts List */}
      <Card className="flex flex-col">
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
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  contact.name === "Sarah Lee"
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
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl}
                alt="Sarah Lee"
                data-ai-hint={placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint}
              />
              <AvatarFallback>SL</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Sarah Lee</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.isMe ? "justify-end" : ""
                }`}
              >
                {!message.isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatarUrl} alt={message.sender} data-ai-hint={message.avatarHint} />
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-xl ${
                    message.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isMe
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
                 {message.isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatarUrl} alt={message.sender} data-ai-hint={message.avatarHint} />
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Input
              placeholder="Type a message..."
              className="pr-28"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
               <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
              <Button size="sm" className="ml-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
