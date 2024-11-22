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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type LoginFormData, loginSchema } from "@/lib/schema";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/login", {
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
        throw new Error(responseData.error || "Login failed");
      }

      router.push(responseData.redirectTo || "/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-200 max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-blue-700">
            Sign in to your account to continue your research journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-blue-800">
                Email
              </Label>
              <Input
                {...register("email")}
                type="email"
                className={cn(
                  "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all",
                  (errors.email || fieldErrors.email) && "border-red-500",
                )}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              {fieldErrors.email?.map((error) => (
                <p key={`email-${error}`} className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-blue-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "bg-white/70 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition-all pr-10",
                    (errors.password || fieldErrors.password) && "border-red-500",
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
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
              {fieldErrors.password?.map((error) => (
                <p key={`password-${error}`} className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              ))}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md transition-all shadow-md hover:shadow-lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-blue-700">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-indigo-600 font-semibold transition-colors"
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
