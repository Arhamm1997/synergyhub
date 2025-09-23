
"use client";

import {
    Video,
    Phone,
    Search,
    Paperclip,
    Mic,
    Send,
    ArrowLeft,
    Users as UsersIcon,
    MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CardContent, CardHeader } from "@/components/ui/card";
import { useChatStore } from "@/store/chat-store";
import type { Contact } from "@/lib/types";

import { useMessagesStore } from "@/store/messages-store";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";


export function ChatPanelContent({ contact, onClose, isSheet = true }: { contact: Contact, onClose: () => void, isSheet?: boolean }) {
    const { messages, isLoading, error, fetchMessages, sendMessage } = useMessagesStore();
    const [messageText, setMessageText] = useState("");

    useEffect(() => {
        if (contact.id) {
            fetchMessages(contact.id);
        }
    }, [contact.id, fetchMessages]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !contact.id) return;

        await sendMessage(contact.id, messageText.trim());
        setMessageText("");
    };

    if (!contact) return null;

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    {isSheet && (
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar>
                        {contact.isGroup ? (
                            <AvatarFallback><UsersIcon /></AvatarFallback>
                        ) : (
                            <>
                                <AvatarImage
                                    src={contact.avatarUrl}
                                    alt={contact.name}
                                    data-ai-hint={contact.avatarHint}
                                />
                                <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                    <div>
                        <p className="font-semibold">{contact.name}</p>
                        {contact.status && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${contact.status === 'Online' ? 'bg-green-500' : contact.status === 'Away' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                                {contact.status}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <MessageCircle className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-destructive py-4">{error}</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">No messages yet</div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-end gap-2 ${message.isMe ? "justify-end" : ""
                                    }`}
                            >
                                {!message.isMe && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={message.avatarUrl} alt={message.sender} data-ai-hint={message.avatarHint} />
                                        <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`max-w-[70%] lg:max-w-md p-3 rounded-xl ${message.isMe
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <p
                                        className={`text-xs mt-1 text-right ${message.isMe
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
                        ))
                    )}
                </div>
            </CardContent>
            <div className="p-4 border-t">
                <div className="relative">
                    <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
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
                        <Button size="sm" className="ml-2" onClick={handleSendMessage}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}


export function ChatPanel() {
    const { isOpen, closeChat, contact } = useChatStore();

    return (
        <Sheet open={isOpen} onOpenChange={closeChat}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                {contact ? <ChatPanelContent contact={contact} onClose={closeChat} /> : <div>No contact selected</div>}
            </SheetContent>
        </Sheet>
    );
}
