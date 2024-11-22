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
    linkedInURL: "",
    twitterURL: "",
    githubURL: "",
    papers: "",
    dob: "",
    imageURL: "",
    phone: "",
    street: "",
    aptNo: "",
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
        setIsEditing(false);
        router.refresh();
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">User Profile</h1>
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-blue-700">
            {isEditing ? "Edit Profile" : "Profile Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="imageURL">Profile Image URL</Label>
                <Input
                  id="imageURL"
                  name="imageURL"
                  value={profile.imageURL}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={profile.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  name="street"
                  value={profile.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="aptNo">Apt/Suite No</Label>
                <Input
                  id="aptNo"
                  name="aptNo"
                  value={profile.aptNo}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <Label htmlFor="zipcode">Zipcode</Label>
                <Input
                  id="zipcode"
                  name="zipcode"
                  value={profile.zipcode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              {profile.role === "USER" && (
                <>
                  <div className="md:col-span-2">
                    <Label htmlFor="researchInterests">Research Interests</Label>
                    <Textarea
                      id="researchInterests"
                      name="researchInterests"
                      value={profile.researchInterests}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="expertise">Expertise</Label>
                    <Textarea
                      id="expertise"
                      name="expertise"
                      value={profile.expertise}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="min-h-[100px]"
                    />
                  </div>
                </>
              )}

              {profile.role === "USER" && (
                <>
                  <div>
                    <Label htmlFor="linkedInURL">LinkedIn URL</Label>
                    <Input
                      id="linkedInURL"
                      name="linkedInURL"
                      value={profile.linkedInURL || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitterURL">Twitter URL</Label>
                    <Input
                      id="twitterURL"
                      name="twitterURL"
                      value={profile.twitterURL || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="githubURL">GitHub URL</Label>
                    <Input
                      id="githubURL"
                      name="githubURL"
                      value={profile.githubURL || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="papers">Papers</Label>
                    <Input
                      id="papers"
                      name="papers"
                      value={profile.papers || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}
            </div>

            {isEditing ? (
              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
