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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forums.map((forum) => (
            <div key={forum.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-blue-600">{forum.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
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
              <p className="text-blue-800 mb-4">{forum.description}</p>
              <Button onClick={() => handleJoinForum(forum)}>View Posts</Button>
            </div>
          ))}
        </div>
      );
    }

    // Regular user view - show forums with join button
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forums.map((forum) => (
          <div key={forum.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">{forum.name}</h3>
            <p className="text-blue-800 mb-4">{forum.description}</p>
            <Button onClick={() => handleJoinForum(forum)}>Join Forum</Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-blue-50 min-h-screen">
      {!selectedForum || (isAdmin && !selectedForum) ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 sm:mb-0">
              {isAdmin ? "Manage Forums" : "Available Forums"}
            </h2>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">Create New Forum</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Forum</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateForum} className="space-y-4">
                    <Input
                      type="text"
                      value={newForum.name}
                      onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                      placeholder="Forum Name"
                    />
                    <Textarea
                      value={newForum.description}
                      onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                      placeholder="Forum Description"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Forum</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {forums.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-blue-700 mb-4">No forums available</p>
              {isAdmin && <p className="text-blue-600">Create a new forum to get started!</p>}
            </div>
          ) : (
            renderForumContent()
          )}
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center w-full sm:w-2/3 mb-4 sm:mb-0">
              <Button
                onClick={handleLeaveForum}
                variant="ghost"
                className="mr-2 p-2"
                aria-label="Back to forums"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h2 className="text-2xl font-semibold text-blue-700 break-words">
                {selectedForum.name}
              </h2>
            </div>
            <Button onClick={handleLeaveForum} className="w-full sm:w-auto">
              {isAdmin ? "Back to Forums" : "Leave Forum"}
            </Button>
          </div>
          <p className="text-blue-800 mb-6">{selectedForum.description}</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-4 sm:mb-0">Forum Posts</h3>
            {!isAdmin && !!currentUser && (
              <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">Create New Post</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <Input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Post Title"
                    />
                    <Textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Post Content"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNewPostDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Post</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <ScrollArea className="h-[400px] sm:h-[600px] pr-4">
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-blue-100 rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-2 text-blue-700">{post.title}</h4>
                  <p className="mb-2 text-blue-800">{post.content}</p>
                  <p className="text-sm text-blue-600">
                    Posted by {post.author.firstName} {post.author.lastName} on{" "}
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Edit Forum Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Forum</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditForum} className="space-y-4">
            <Input
              type="text"
              value={newForum.name}
              onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
              placeholder="Forum Name"
            />
            <Textarea
              value={newForum.description}
              onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
              placeholder="Forum Description"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setNewForum({ name: "", description: "" });
                  setForumToEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Forum</Button>
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
