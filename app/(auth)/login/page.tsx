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

type FieldErrors = {
  [key: string]: string[];
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {});

        if (response.ok) {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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
          const fieldErrors = responseData.fieldErrors as FieldErrors;
          setFieldErrors(fieldErrors);

          return;
        }
        throw new Error(responseData.error || "Login failed");
      }

      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="border border-zinc-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-zinc-900">Sign in</CardTitle>
          <CardDescription className="text-zinc-500">
            Welcome back to your research workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email
              </Label>
              <Input
                {...register("email")}
                type="email"
                className={cn(
                  "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all",
                  (errors.email || fieldErrors.email) && "border-red-500",
                )}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              {fieldErrors.email?.map((error) => (
                <p key={`email-${error}`} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "h-10 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 transition-all pr-10",
                    (errors.password || fieldErrors.password) && "border-red-500",
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
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              {fieldErrors.password?.map((error) => (
                <p key={`password-${error}`} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
            </div>

            <Button
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-zinc-200 mt-2">
          <div className="text-sm text-center w-full text-zinc-600 mt-4">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-900 hover:text-zinc-700 transition-colors"
            >
              Create account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
