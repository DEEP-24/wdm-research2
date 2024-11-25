"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostMessage {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function PostPage({ params }: { params: { postId: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [messages, setMessages] = useState<PostMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/forums/posts/${params.postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/forums/posts/${params.postId}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchPost();
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [params.postId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/forums/posts/${params.postId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (!post) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-[#6B9B76] hover:text-[#5a8463] hover:bg-[#6B9B76]/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#6B9B76]">{post.title}</h1>
        </div>

        <Card className="border border-[#6B9B76]/20 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-600">{post.content}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                  Posted by {post.author.firstName} {post.author.lastName}
                </span>
                <span className="flex items-center gap-1.5 bg-[#6B9B76]/5 px-2 py-1 rounded-md border border-[#6B9B76]/10">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#6B9B76]/20 shadow-sm bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-medium text-[#6B9B76] mb-6">Discussion</h2>
            <ScrollArea className="h-[400px] rounded-md border border-[#6B9B76]/20 mb-6">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-lg border border-[#6B9B76]/20 bg-[#6B9B76]/5"
                  >
                    <p className="text-gray-600 mb-2">{message.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-[#6B9B76]/10">
                        {message.author.firstName} {message.author.lastName}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-[#6B9B76]/10">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border-[#6B9B76]/20 focus:border-[#6B9B76] focus:ring-[#6B9B76]"
              />
              <Button type="submit" className="bg-[#6B9B76] hover:bg-[#5a8463] text-white">
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
