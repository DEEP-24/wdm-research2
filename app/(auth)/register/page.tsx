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
    <div className="flex items-center justify-center">
      <Card className="w-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center text-blue-700">
            Start your journey in collaborative research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium text-blue-800">
                  First Name
                </Label>
                <Input
                  {...register("firstName")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.firstName && "border-red-500",
                  )}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium text-blue-800">
                  Last Name
                </Label>
                <Input
                  {...register("lastName")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.lastName && "border-red-500",
                  )}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-blue-800">
                  Email
                </Label>
                <Input
                  type="email"
                  {...register("email")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.email && "border-red-500",
                  )}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-blue-800">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={cn(
                      "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm pr-10",
                      errors.password && "border-red-500",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs sm:text-sm font-medium text-blue-800"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={cn(
                      "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm pr-10",
                      errors.confirmPassword && "border-red-500",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs sm:text-sm font-medium text-blue-800">
                  Role
                </Label>
                <Select onValueChange={handleRoleChange} defaultValue="user">
                  <SelectTrigger className="bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm">
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
                {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageURL" className="text-xs sm:text-sm font-medium text-blue-800">
                  Profile Image URL
                </Label>
                <Input
                  {...register("imageURL")}
                  className="bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                  placeholder="https://example.com/your-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-blue-800">
                  Phone
                </Label>
                <Input
                  {...register("phone")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.phone && "border-red-500",
                  )}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-xs sm:text-sm font-medium text-blue-800">
                  Street Address
                </Label>
                <Input
                  {...register("street")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.street && "border-red-500",
                  )}
                />
                {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aptNo" className="text-xs sm:text-sm font-medium text-blue-800">
                  Apt/Suite No.
                </Label>
                <Input
                  {...register("aptNo")}
                  className="bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs sm:text-sm font-medium text-blue-800">
                  City
                </Label>
                <Input
                  {...register("city")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.city && "border-red-500",
                  )}
                />
                {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs sm:text-sm font-medium text-blue-800">
                  State
                </Label>
                <Input
                  {...register("state")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.state && "border-red-500",
                  )}
                />
                {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipcode" className="text-xs sm:text-sm font-medium text-blue-800">
                  Zipcode
                </Label>
                <Input
                  {...register("zipcode")}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.zipcode && "border-red-500",
                  )}
                />
                {errors.zipcode && <p className="text-xs text-red-500">{errors.zipcode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-xs sm:text-sm font-medium text-blue-800">
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  {...register("dob")}
                  max={new Date().toISOString().split("T")[0]}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                    errors.dob && "border-red-500",
                  )}
                />
                {errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}
              </div>

              {selectedRole === "user" && (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="expertise"
                      className="text-xs sm:text-sm font-medium text-blue-800"
                    >
                      Expertise
                    </Label>
                    <Input
                      {...register("expertise")}
                      className={cn(
                        "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                        errors.expertise && "border-red-500",
                      )}
                    />
                    {errors.expertise && (
                      <p className="text-xs text-red-500">{errors.expertise.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label
                      htmlFor="researchInterests"
                      className="text-xs sm:text-sm font-medium text-blue-800"
                    >
                      Research Interests
                    </Label>
                    <Input
                      {...register("researchInterests")}
                      placeholder="e.g., AI, Climate Science, Neurobiology"
                      className={cn(
                        "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all text-sm",
                        errors.researchInterests && "border-red-500",
                      )}
                    />
                    {errors.researchInterests && (
                      <p className="text-xs text-red-500">{errors.researchInterests.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md transition-all shadow-md hover:shadow-lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-blue-700">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-indigo-600 font-semibold transition-colors"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
