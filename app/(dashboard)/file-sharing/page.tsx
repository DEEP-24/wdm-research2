"use client";

import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon, Trash2Icon, X, PencilIcon } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface SharedFile {
  id: string;
  customName: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  uploadDate: string;
  fileUrl: string;
}

const FileSharingPage: React.FC = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    id: "",
    customName: "",
    fileUrl: "",
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchFiles();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        const user = await response.json();
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      return;
    }

    try {
      const url = isEditMode ? `/api/files/${formData.id}` : "/api/files";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newFile = await response.json();
        if (isEditMode) {
          setFiles((prev) => prev.map((f) => (f.id === newFile.id ? newFile : f)));
        } else {
          setFiles((prev) => [newFile, ...prev]);
        }
        closeModal();
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleEdit = (file: SharedFile) => {
    setFormData({
      id: file.id,
      customName: file.customName,
      fileUrl: file.fileUrl,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      setFiles((prev) => prev.filter((file) => file.id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormData({
      id: "",
      customName: "",
      fileUrl: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">Shared Files</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          Share File
        </Button>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          {files.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No files shared yet</p>
              <p className="text-sm text-gray-500">Start sharing files with your team!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group p-5 rounded-lg border border-gray-100 hover:border-gray-200 bg-white transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-3">
                        <FileIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                            {file.customName}
                          </h3>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700 hover:underline break-all"
                          >
                            {file.fileUrl}
                          </a>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          Shared by {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {currentUserId === file.uploadedBy.id && (
                      <div className="flex sm:flex-col items-center gap-2 sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(file)}
                          className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2Icon className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal remains the same but with updated styling */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-[425px] bg-white p-0">
            <div className="p-6 border-b border-gray-100">
              <DialogTitle className="text-xl font-medium text-gray-800">
                {isEditMode ? "Edit File" : "Share File"}
              </DialogTitle>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <Label htmlFor="customName" className="text-sm font-medium text-gray-700">
                  Custom Name
                </Label>
                <Input
                  id="customName"
                  value={formData.customName}
                  onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                  className="mt-1.5 border-gray-200"
                  placeholder="Enter custom name"
                />
              </div>

              <div>
                <Label htmlFor="fileUrl" className="text-sm font-medium text-gray-700">
                  File URL
                </Label>
                <Input
                  id="fileUrl"
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="mt-1.5 border-gray-200"
                  placeholder="Enter file URL"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                  {isEditMode ? "Save Changes" : "Share File"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FileSharingPage;
