"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Forum {
  id: string;
  name: string;
  description: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  forumId: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const ForumsPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newForum, setNewForum] = useState({ name: "", description: "" });
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [forumToEdit, setForumToEdit] = useState<Forum | null>(null);
  const [forumToDelete, setForumToDelete] = useState<Forum | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const user = await response.json();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setCurrentUser(null);
    }
  };

  const fetchForums = async () => {
    try {
      const response = await fetch("/api/forums");
      if (!response.ok) {
        throw new Error("Failed to fetch forums");
      }
      const data = await response.json();
      setForums(data);
    } catch (error) {
      console.error("Error fetching forums:", error);
      toast.error("Failed to load forums");
    }
  };

  const fetchPosts = async (forumId: string) => {
    try {
      const response = await fetch(`/api/forums/${forumId}/posts`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    }
  };

  const fetchAllPosts = async () => {
    if (!isAdmin) {
      return;
    }

    try {
      const response = await fetch("/api/forums/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchForums();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAllPosts();
    } else if (selectedForum) {
      fetchPosts(selectedForum.id);
    }
  }, [isAdmin, selectedForum]);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newForum.name && newForum.description) {
      try {
        const response = await fetch("/api/forums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newForum),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create forum");
        }

        await fetchForums();
        setNewForum({ name: "", description: "" });
        setIsDialogOpen(false);
        toast.success("Forum created successfully");
      } catch (error) {
        console.error("Error creating forum:", error);
        toast.error("Failed to create forum");
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to create a post");
      return;
    }

    if (newPost.title && newPost.content && selectedForum) {
      try {
        const response = await fetch(`/api/forums/${selectedForum.id}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPost),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create post");
        }

        await fetchPosts(selectedForum.id);
        setNewPost({ title: "", content: "" });
        setIsNewPostDialogOpen(false);
        toast.success("Post created successfully");
      } catch (error) {
        console.error("Error creating post:", error);
        toast.error("Failed to create post");
      }
    }
  };

  const handleJoinForum = (forum: Forum) => {
    setSelectedForum(forum);
  };

  const handleLeaveForum = () => {
    setSelectedForum(null);
    setPosts([]);
  };

  const handleEditForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumToEdit || !newForum.name || !newForum.description) {
      return;
    }

    try {
      const response = await fetch(`/api/forums/${forumToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForum),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update forum");
      }

      await fetchForums();
      setNewForum({ name: "", description: "" });
      setForumToEdit(null);
      setIsEditDialogOpen(false);
      toast.success("Forum updated successfully");
    } catch (error) {
      console.error("Error updating forum:", error);
      toast.error("Failed to update forum");
    }
  };

  const handleDeleteForum = async () => {
    if (!forumToDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/forums/${forumToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete forum");
      }

      await fetchForums();
      setForumToDelete(null);
      setIsDeleteDialogOpen(false);
      toast.success("Forum deleted successfully");
    } catch (error) {
      console.error("Error deleting forum:", error);
      toast.error("Failed to delete forum");
    }
  };

  const openEditDialog = (forum: Forum) => {
    setForumToEdit(forum);
    setNewForum({ name: forum.name, description: forum.description });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (forum: Forum) => {
    setForumToDelete(forum);
    setIsDeleteDialogOpen(true);
  };

  const renderForumContent = () => {
    if (isAdmin) {
      return (
        <div className="grid grid-cols-1 gap-6">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-3">
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {forum.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">{forum.description}</p>
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      Created by {forum.createdBy.firstName} {forum.createdBy.lastName}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 sm:w-auto">
                  <Button
                    onClick={() => handleJoinForum(forum)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    View Posts
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(forum)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => openDeleteDialog(forum)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {forums.map((forum) => (
          <div
            key={forum.id}
            className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                  {forum.name}
                </h3>
                <p className="text-sm text-gray-500">{forum.description}</p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    Created by {forum.createdBy.firstName} {forum.createdBy.lastName}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleJoinForum(forum)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Join Forum
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {!selectedForum || (isAdmin && !selectedForum) ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">
              {isAdmin ? "Manage Forums" : "Available Forums"}
            </h1>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Create New Forum
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white p-0">
                  <div className="p-6 border-b border-gray-100">
                    <DialogTitle className="text-xl font-medium text-gray-800">
                      Create New Forum
                    </DialogTitle>
                  </div>
                  <form onSubmit={handleCreateForum} className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Forum Name
                      </Label>
                      <Input
                        id="name"
                        value={newForum.name}
                        onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                        className="mt-1.5 border-gray-200"
                        placeholder="Enter forum name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newForum.description}
                        onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                        className="mt-1.5 border-gray-200"
                        placeholder="Enter forum description"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                        Create Forum
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              {forums.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No forums available</p>
                  {isAdmin && (
                    <p className="text-sm text-gray-500">Create a new forum to get started!</p>
                  )}
                </div>
              ) : (
                renderForumContent()
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleLeaveForum}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">
                {selectedForum.name}
              </h1>
            </div>
            <Button
              onClick={handleLeaveForum}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
            >
              {isAdmin ? "Back to Forums" : "Leave Forum"}
            </Button>
          </div>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-medium text-gray-800">Forum Posts</h2>
                {!isAdmin && !!currentUser && (
                  <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
                      >
                        Create New Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white p-0">
                      <div className="p-6 border-b border-gray-100">
                        <DialogTitle className="text-xl font-medium text-gray-800">
                          Create New Post
                        </DialogTitle>
                      </div>
                      <form onSubmit={handleCreatePost} className="p-6 space-y-6">
                        <div>
                          <Label htmlFor="post-title" className="text-sm font-medium text-gray-700">
                            Title
                          </Label>
                          <Input
                            id="post-title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="mt-1.5 border-gray-200"
                            placeholder="Enter post title"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="post-content"
                            className="text-sm font-medium text-gray-700"
                          >
                            Content
                          </Label>
                          <Textarea
                            id="post-content"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="mt-1.5 border-gray-200"
                            placeholder="Enter post content"
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsNewPostDialogOpen(false)}
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            Create Post
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <ScrollArea className="h-[600px] rounded-md border border-gray-100">
                <div className="p-4 space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          Posted by {post.author.firstName} {post.author.lastName}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Forum Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-0">
          <div className="p-6 border-b border-gray-100">
            <DialogTitle className="text-xl font-medium text-gray-800">Edit Forum</DialogTitle>
          </div>
          <form onSubmit={handleEditForum} className="p-6 space-y-6">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                Forum Name
              </Label>
              <Input
                id="edit-name"
                value={newForum.name}
                onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                className="mt-1.5 border-gray-200"
                placeholder="Enter forum name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={newForum.description}
                onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                className="mt-1.5 border-gray-200"
                placeholder="Enter forum description"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setNewForum({ name: "", description: "" });
                  setForumToEdit(null);
                }}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                Update Forum
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Forum Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the forum and all its
              posts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setForumToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForum} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ForumsPage;
