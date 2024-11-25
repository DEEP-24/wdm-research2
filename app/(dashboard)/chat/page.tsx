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
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="overflow-hidden border-none shadow-xl bg-green-50/95 dark:bg-green-950/30">
        <CardHeader className="md:block hidden border-b border-green-100 dark:border-green-900/30 bg-white dark:bg-green-950/50">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Messages
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-[350px,1fr] h-[calc(100vh-180px)]">
            {/* Users List */}
            <div
              className={`${
                showChatList || !selectedUser ? "block" : "hidden"
              } md:block border-r border-green-100 dark:border-green-900/30 bg-white dark:bg-green-950/50`}
            >
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="p-3 space-y-1">
                  {chatUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    chatUsers.map((user) => (
                      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[0.99] ${
                          selectedUser?.id === user.id
                            ? "bg-green-100 dark:bg-green-900/50 shadow-sm"
                            : "hover:bg-green-50 dark:hover:bg-green-900/30"
                        }`}
                        onClick={() => handleUserSelect(user)}
                        role="button"
                        tabIndex={0}
                      >
                        <Avatar className="h-10 w-10 border-2 border-green-100 dark:border-green-900 shadow-sm">
                          {user.imageURL ? (
                            <AvatarImage src={user.imageURL} alt={`${user.profile.firstName}`} />
                          ) : (
                            <AvatarImage
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.profile.firstName}`}
                              alt={user.profile.firstName}
                            />
                          )}
                          <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            {user.profile.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate text-sm">
                              {user.profile.firstName} {user.profile.lastName}
                            </p>
                            {user.isFollowing && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              >
                                Following
                              </Badge>
                            )}
                          </div>
                          {user.lastMessage ? (
                            <div className="space-y-0.5">
                              <p
                                className={`text-xs truncate ${
                                  !user.lastMessage.read &&
                                  user.lastMessage.receiverId === currentUser?.id
                                    ? "text-green-700 dark:text-green-400 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {user.lastMessage.content}
                              </p>
                              <p className="text-[10px] text-muted-foreground/70">
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
                            <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full shadow-sm" />
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
              } md:block h-full bg-green-50/50 dark:bg-green-950/20 relative overflow-hidden`}
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
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                  <MessageCircle className="w-16 h-16 text-green-600/20 dark:text-green-400/20" />
                  <p className="text-lg">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
