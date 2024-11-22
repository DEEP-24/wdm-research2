"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type RegisterFormData, registerSchema } from "@/lib/schema";

export default function RegisterPage() {
  const router = useRouter();
  const [_fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "organizer" | "investor">("user");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "user",
      imageURL: "/default-avatar.png",
    },
  });

  const handleRoleChange = (value: "user" | "organizer" | "investor") => {
    setSelectedRole(value);
    setValue("role", value);
    if (value !== "user") {
      setValue("expertise", "");
      setValue("researchInterests", "");
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.fieldErrors) {
          setFieldErrors(responseData.fieldErrors);
          return;
        }
        throw new Error(responseData.error || "Registration failed");
      }

      toast.success("Registration successful! Please login.");
      router.push(responseData.redirectTo || "/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="border border-zinc-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-zinc-900">Create account</CardTitle>
          <CardDescription className="text-zinc-500">
            Join our research collaboration platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information Section */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-zinc-700">
                    First Name
                  </Label>
                  <Input
                    {...register("firstName")}
                    className={cn(
                      "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                      errors.firstName && "border-red-500",
                    )}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-zinc-700">
                    Last Name
                  </Label>
                  <Input
                    {...register("lastName")}
                    className={cn(
                      "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                      errors.lastName && "border-red-500",
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                    Email
                  </Label>
                  <Input
                    type="email"
                    {...register("email")}
                    className={cn(
                      "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                      errors.email && "border-red-500",
                    )}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              {/* Account Information Section */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-zinc-700">
                    Role
                  </Label>
                  <Select onValueChange={handleRoleChange} defaultValue="user">
                    <SelectTrigger className="h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole)
                        .filter((role) => role !== "ADMIN")
                        .map((role) => (
                          <SelectItem
                            key={role}
                            value={role.toLowerCase() as "user" | "organizer" | "investor"}
                          >
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={cn(
                        "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all pr-10",
                        errors.password && "border-red-500",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={cn(
                        "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all pr-10",
                        errors.confirmPassword && "border-red-500",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-zinc-700">
                    Phone
                  </Label>
                  <Input
                    {...register("phone")}
                    className={cn(
                      "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                      errors.phone && "border-red-500",
                    )}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-medium text-zinc-700">
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    {...register("dob")}
                    max={new Date().toISOString().split("T")[0]}
                    className={cn(
                      "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                      errors.dob && "border-red-500",
                    )}
                  />
                  {errors.dob && <p className="text-sm text-red-500">{errors.dob.message}</p>}
                </div>
              </div>

              {/* Address Section */}
              <div className="lg:col-span-3 space-y-4">
                <Label className="text-sm font-medium text-zinc-700">Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      {...register("street")}
                      placeholder="Street address"
                      className="h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>
                  <div>
                    <Input
                      {...register("aptNo")}
                      placeholder="Apt/Suite (optional)"
                      className="h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>
                  <div>
                    <Input
                      {...register("city")}
                      placeholder="City"
                      className="h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>
                  <div>
                    <Input
                      {...register("state")}
                      placeholder="State"
                      className="h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>
                  <div>
                    <Input
                      {...register("zipcode")}
                      placeholder="ZIP code"
                      className="h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Research Fields (Only for USER role) */}
              {selectedRole === "user" && (
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expertise" className="text-sm font-medium text-zinc-700">
                      Expertise
                    </Label>
                    <Input
                      {...register("expertise")}
                      placeholder="Your field of expertise"
                      className={cn(
                        "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                        errors.expertise && "border-red-500",
                      )}
                    />
                    {errors.expertise && (
                      <p className="text-sm text-red-500">{errors.expertise.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="researchInterests"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Research Interests
                    </Label>
                    <Input
                      {...register("researchInterests")}
                      placeholder="e.g., AI, Climate Science, Neurobiology"
                      className={cn(
                        "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                        errors.researchInterests && "border-red-500",
                      )}
                    />
                    {errors.researchInterests && (
                      <p className="text-sm text-red-500">{errors.researchInterests.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-colors h-10"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-zinc-200 mt-2">
          <div className="text-sm text-center w-full text-zinc-600 mt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-900 hover:text-zinc-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
