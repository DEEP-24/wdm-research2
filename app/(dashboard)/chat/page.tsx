"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChatComponent from "../_components/chat";

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
        <p className="text-center">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="md:block">
          <CardHeader className="md:block hidden">
            <CardTitle className="text-2xl font-bold">Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-[350px,1fr] h-[calc(100vh-250px)]">
              {/* Users List */}
              <div
                className={`${
                  showChatList || !selectedUser ? "block" : "hidden"
                } md:block border-r`}
              >
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <div className="p-4 space-y-2">
                    {chatUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No users available</p>
                    ) : (
                      chatUsers.map((user) => (
                        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                        <div
                          key={user.id}
                          className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?.id === user.id ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                          onClick={() => handleUserSelect(user)}
                          role="button"
                          tabIndex={0}
                        >
                          <Avatar>
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
                            <AvatarFallback>
                              {user.profile.firstName[0]}
                              {user.profile.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {user.profile.firstName} {user.profile.lastName}
                              </p>
                              {user.isFollowing && (
                                <span className="text-xs text-primary">Following</span>
                              )}
                            </div>
                            {user.lastMessage ? (
                              <>
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
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(user.lastMessage.sentAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                No messages yet
                              </p>
                            )}
                          </div>
                          {user.lastMessage &&
                            !user.lastMessage.read &&
                            user.lastMessage.receiverId === currentUser?.id && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
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
                } md:block h-full bg-muted/30`}
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
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a user to start messaging
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
