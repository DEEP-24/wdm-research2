"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { disconnectSocket, getSocket, initializeSocket } from "@/lib/socket";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sentAt: string;
  sender: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

interface ChatComponentProps {
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientProfile: {
    firstName: string;
    lastName: string;
    expertise?: string;
    researchInterests?: string;
    imageURL?: string;
  };
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  isMobileView?: boolean;
}

export default function ChatComponent({
  recipientId,
  recipientName,
  recipientEmail,
  recipientProfile,
  currentUserId,
  isOpen,
  onClose,
  onBack,
  isMobileView,
}: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const socket = initializeSocket(currentUserId);

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    fetchMessages();

    return () => {
      disconnectSocket();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${recipientId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      console.log("Fetched messages:", data);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || isLoading) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          receiverId: recipientId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      console.log("Message sent successfully:", data);
      setMessages((prev) => [...prev, data]);

      const socket = getSocket();
      if (socket?.connected) {
        socket.emit("send-message", data);
      } else {
        console.warn("Socket not connected when trying to emit message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageContent); // Restore the message if sending failed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobileView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="md:hidden h-8 w-8 mr-2 hover:bg-primary/10"
              >
                <svg
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
            )}
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              {recipientProfile.imageURL ? (
                <AvatarImage src={recipientProfile.imageURL} alt={recipientName} />
              ) : (
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${recipientName}`}
                  alt={recipientName}
                />
              )}
              <AvatarFallback className="bg-primary/10">
                {recipientProfile.firstName[0]}
                {recipientProfile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{recipientName}</h2>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-muted-foreground">{recipientEmail}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full md:block hidden hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-3 shadow-sm ${
                  message.senderId === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 backdrop-blur-sm"
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                <span className="text-[10px] opacity-70 mt-1 block">
                  {new Date(message.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form
        onSubmit={sendMessage}
        className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-primary"
            disabled={!isConnected || isLoading}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected || isLoading}
            className="rounded-full px-6 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
