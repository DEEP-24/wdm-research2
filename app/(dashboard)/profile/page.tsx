"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    researchInterests: "",
    expertise: "",
    linkedInUrl: "",
    twitterUrl: "",
    githubUrl: "",
    papers: "",
    dob: "",
    imageUrl: "",
    phone: "",
    street: "",
    apt: "",
    city: "",
    state: "",
    zipcode: "",
    role: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      const formattedDob = data.dob ? new Date(data.dob).toISOString().split("T")[0] : "";
      setProfile({
        ...data,
        dob: formattedDob,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Profile Updated", {
          description: "Your profile has been successfully updated.",
        });
        router.refresh();
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          User Profile
        </h1>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="bg-white shadow-xl rounded-xl border-0">
        <CardHeader className="border-b bg-gray-50/50 rounded-t-xl">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {isEditing ? "Edit Profile" : "Profile Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
                <div className="w-full">
                  <Label htmlFor="imageURL" className="text-gray-700">
                    Profile Image URL
                  </Label>
                  <Input
                    id="imageURL"
                    name="imageUrl"
                    value={profile.imageUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled
                      required
                      className="mt-1 bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dob" className="text-gray-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={profile.dob}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="street" className="text-gray-700">
                      Street
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      value={profile.street}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="aptNo" className="text-gray-700">
                      Apt/Suite No
                    </Label>
                    <Input
                      id="aptNo"
                      name="apt"
                      value={profile.apt}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-gray-700">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-gray-700">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={profile.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zipcode" className="text-gray-700">
                      Zipcode
                    </Label>
                    <Input
                      id="zipcode"
                      name="zipcode"
                      value={profile.zipcode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Research Information Section - Only for USER role */}
              {profile.role === "USER" && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Research Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="researchInterests" className="text-gray-700">
                        Research Interests
                      </Label>
                      <Textarea
                        id="researchInterests"
                        name="researchInterests"
                        value={profile.researchInterests}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="expertise" className="text-gray-700">
                        Expertise
                      </Label>
                      <Textarea
                        id="expertise"
                        name="expertise"
                        value={profile.expertise}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links Section - Only for USER role */}
              {profile.role === "USER" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="linkedInURL" className="text-gray-700">
                        LinkedIn URL
                      </Label>
                      <Input
                        id="linkedInURL"
                        name="linkedInUrl"
                        value={profile.linkedInUrl || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitterURL" className="text-gray-700">
                        Twitter URL
                      </Label>
                      <Input
                        id="twitterURL"
                        name="twitterUrl"
                        value={profile.twitterUrl || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="githubURL" className="text-gray-700">
                        GitHub URL
                      </Label>
                      <Input
                        id="githubURL"
                        name="githubUrl"
                        value={profile.githubUrl || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="papers" className="text-gray-700">
                        Papers
                      </Label>
                      <Input
                        id="papers"
                        name="papers"
                        value={profile.papers || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
