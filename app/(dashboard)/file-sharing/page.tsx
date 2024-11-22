"use client";

import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon, Trash2Icon, X, PencilIcon } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";

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
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== id));
      }
    } catch (error) {
      console.error("Error deleting file:", error);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="mb-6">
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <UploadIcon className="mr-2 h-4 w-4" />
            Share File
          </Button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-900">
                  {isEditMode ? "Edit File" : "Share File"}
                </h2>
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  size="icon"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Custom Name
                  </label>
                  <input
                    type="text"
                    value={formData.customName}
                    onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                    className="w-full border border-blue-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter custom name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">File URL</label>
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full border border-blue-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Enter file URL"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                    {isEditMode ? "Save Changes" : "Share"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Shared Files</h2>
          {files.length === 0 ? (
            <p className="text-blue-600 text-center">No files shared yet. Start sharing!</p>
          ) : (
            <ul className="space-y-4">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition duration-300"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center">
                      <FileIcon className="text-blue-600 mr-2" />
                      <div>
                        <strong className="text-blue-700">{file.customName}</strong>
                        <p className="text-sm text-blue-600">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {file.fileUrl}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <p className="text-sm text-blue-500">
                          Shared by {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                        </p>
                        <p className="text-xs text-blue-400">
                          {new Date(file.uploadDate).toLocaleString()}
                        </p>
                      </div>
                      {currentUserId === file.uploadedBy.id && (
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleEdit(file)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            size="icon"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            size="icon"
                          >
                            <Trash2Icon className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSharingPage;
