"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChatComponent from "../_components/chat";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sentAt: string;
  read: boolean;
}

interface ChatUser {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    expertise: string;
    researchInterests: string;
  };
  imageURL?: string;
  isFollowing: boolean;
  lastMessage?: Message | null;
}

export default function ChatPage() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (userId && chatUsers.length > 0) {
      const user = chatUsers.find((u) => u.id === userId);
      if (user) {
        handleUserSelect(user);
      } else {
        // If the user isn't in the chat list (new chat), fetch their details
        fetchUserDetails(userId);
      }
    }
  }, [userId, chatUsers]);

  const fetchUserDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/researchers/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const userData = await response.json();

      const formattedUser: ChatUser = {
        id: userData.id,
        email: userData.email,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          expertise: userData.expertise,
          researchInterests: userData.researchInterests,
        },
        imageURL: userData.imageURL,
        isFollowing: userData.followedBy.length > 0,
        lastMessage: null,
      };

      setSelectedUser(formattedUser);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/user");
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data);
        await fetchFollowedUsers();
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedUsers = async () => {
    try {
      const [followedResponse, messagesResponse] = await Promise.all([
        fetch("/api/messages/users"),
        fetch("/api/messages/all-chats"),
      ]);

      if (!followedResponse.ok || !messagesResponse.ok) {
        throw new Error(
          `HTTP error! status: ${followedResponse.status || messagesResponse.status}`,
        );
      }

      const [followedData, messagesData] = await Promise.all([
        followedResponse.json(),
        messagesResponse.json(),
      ]);

      // Combine followed users and users who have messaged, removing duplicates
      const combinedUsers = [...followedData];

      messagesData.forEach((messageUser: ChatUser) => {
        if (!combinedUsers.some((user) => user.id === messageUser.id)) {
          combinedUsers.push(messageUser);
        }
      });

      // Sort users by last message time
      const sortedUsers = combinedUsers.sort((a: ChatUser, b: ChatUser) => {
        const aTime = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt).getTime() : 0;
        const bTime = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt).getTime() : 0;
        return bTime - aTime;
      });

      setChatUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load chat users");
      setChatUsers([]);
    }
  };

  const handleUserSelect = async (user: ChatUser) => {
    setSelectedUser(user);
    setShowChatList(false);

    if (
      user.lastMessage &&
      !user.lastMessage.read &&
      user.lastMessage.receiverId === currentUser?.id
    ) {
      try {
        await fetch(`/api/messages/${user.lastMessage.id}/read`, {
          method: "PUT",
        });

        setChatUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === user.id && u.lastMessage) {
              return {
                ...u,
                lastMessage: {
                  ...u.lastMessage,
                  read: true,
                },
              };
            }
            return u;
          }),
        );
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-primary">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-b from-background to-background/95 backdrop-blur">
        <div className="md:block">
          <CardHeader className="md:block hidden border-b bg-muted/30">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Messages
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-[380px,1fr] h-[calc(100vh-220px)]">
              {/* Users List */}
              <div
                className={`${
                  showChatList || !selectedUser ? "block" : "hidden"
                } md:block border-r bg-background/50`}
              >
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="p-4 space-y-2">
                    {chatUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                        <p>No conversations yet</p>
                      </div>
                    ) : (
                      chatUsers.map((user) => (
                        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                        <div
                          key={user.id}
                          className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedUser?.id === user.id
                              ? "bg-primary/10 shadow-md"
                              : "hover:bg-muted/80 hover:shadow-sm"
                          }`}
                          onClick={() => handleUserSelect(user)}
                          role="button"
                          tabIndex={0}
                        >
                          <Avatar className="h-12 w-12 ring-2 ring-background">
                            {user.imageURL ? (
                              <AvatarImage
                                src={user.imageURL}
                                alt={`${user.profile.firstName} ${user.profile.lastName}`}
                              />
                            ) : (
                              <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.profile.firstName} ${user.profile.lastName}`}
                                alt={`${user.profile.firstName} ${user.profile.lastName}`}
                              />
                            )}
                            <AvatarFallback className="bg-primary/10">
                              {user.profile.firstName[0]}
                              {user.profile.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold truncate">
                                {user.profile.firstName} {user.profile.lastName}
                              </p>
                              {user.isFollowing && (
                                <Badge variant="secondary" className="text-[10px] h-5">
                                  Following
                                </Badge>
                              )}
                            </div>
                            {user.lastMessage ? (
                              <div className="space-y-1">
                                <p
                                  className={`text-sm truncate ${
                                    !user.lastMessage.read &&
                                    user.lastMessage.receiverId === currentUser?.id
                                      ? "text-primary font-medium"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {user.lastMessage.content}
                                </p>
                                <p className="text-[10px] text-muted-foreground/80">
                                  {formatDistanceToNow(new Date(user.lastMessage.sentAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground/70 italic">
                                Start a conversation
                              </p>
                            )}
                          </div>
                          {user.lastMessage &&
                            !user.lastMessage.read &&
                            user.lastMessage.receiverId === currentUser?.id && (
                              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div
                className={`${
                  !showChatList || selectedUser ? "block" : "hidden"
                } md:block h-full bg-dot-pattern`}
              >
                {selectedUser ? (
                  <div className="h-full">
                    <ChatComponent
                      key={selectedUser.id}
                      recipientId={selectedUser.id}
                      recipientName={`${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`}
                      recipientEmail={selectedUser.email}
                      recipientProfile={{
                        firstName: selectedUser.profile.firstName,
                        lastName: selectedUser.profile.lastName,
                        expertise: selectedUser.profile.expertise,
                        researchInterests: selectedUser.profile.researchInterests,
                        imageURL: selectedUser.imageURL,
                      }}
                      currentUserId={currentUser?.id}
                      isOpen={true}
                      onClose={() => {
                        setSelectedUser(null);
                        setShowChatList(true);
                      }}
                      onBack={() => setShowChatList(true)}
                      isMobileView={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <MessageCircle className="w-16 h-16 opacity-20" />
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
