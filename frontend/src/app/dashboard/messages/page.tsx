"use client";

import React from 'react';
import {
  MessageCircle,
  Video,
  Phone,
  Search,
  Users as UsersIcon,
  ArrowLeft,
  MessageSquarePlus,
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
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import type { Contact, Member } from "@/lib/types";
import { ChatPanelContent } from "@/components/messages/chat-panel";
import { useChatStore } from "@/store/chat-store";
import { NewMessageDialog } from "@/components/messages/new-message-dialog";

import { useContactsStore } from "@/store/contacts-store";

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const contactName = searchParams.get("contact");
  const { openChat } = useChatStore();
  const { contacts, isLoading, error, fetchContacts } = useContactsStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const [activeContact, setActiveContact] = useState(() => {
    const initialContact = contacts.find((c) => c.name === contactName);
    return initialContact || null;
  });
  const [showChat, setShowChat] = useState(!!activeContact);

  useEffect(() => {
    const contactFromUrl = contacts.find((c) => c.name === contactName);
    if (contactFromUrl) {
      setActiveContact(contactFromUrl);
      setShowChat(true);
    }
  }, [contactName, contacts]);

  const handleContactClick = (contact: Contact) => {
    setActiveContact(contact);
    setShowChat(true);
  };

  const handleNewMessageSelect = (member: Member) => {
    const existingContact = contacts.find((c) => c.id === member.id);
    if (existingContact) {
      setActiveContact(existingContact);
    } else {
      // Create a new contact object from the member
      const newContact: Contact = {
        id: member.id,
        name: member.name,
        avatarUrl: member.avatarUrl,
        avatarHint: member.avatarHint,
        status: "Online", // Assuming online status for new chat
        lastMessage: "Started a new chat",
        time: "Just now",
        unread: 0,
      };
      // For this demo, we'll just set it as active.
      // In a real app, you'd add it to the contacts list.
      setActiveContact(newContact);
    }
    setShowChat(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] h-[calc(100vh-100px)] gap-4">
      {/* Contacts List */}
      <Card className={cn("flex-col", showChat ? "hidden md:flex" : "flex")}>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle>Chats</CardTitle>
            <NewMessageDialog onSelect={handleNewMessageSelect}>
              <Button variant="ghost" size="icon">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </NewMessageDialog>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8 w-full" />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-destructive py-4">{error}</div>
            ) : contacts.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No contacts found
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeContact && contact.name === activeContact.name
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
                        <AvatarImage
                          src={contact.avatarUrl}
                          alt={contact.name}
                          data-ai-hint={contact.avatarHint}
                        />
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
                    <p className="text-xs text-muted-foreground">
                      {contact.time}
                    </p>
                    {contact.unread > 0 && (
                      <Badge className="mt-1">{contact.unread}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
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
                Choose a conversation from the left or start a new one.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesPageInner />
    </Suspense>
  );
}
