"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { type LoginFormData, loginSchema } from "@/lib/schema";
import Image from "next/image";

type FieldErrors = {
  [key: string]: string[];
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="w-full max-w-md mx-auto mt-8 px-4">
      <div className="mb-8">
        <Image
          src="https://www.loginradius.com/blog/static/25f482319c5c4fcb1749a8c424a007b0/d3746/login-authentication.jpg"
          alt="Login"
          width={400}
          height={250}
          className="rounded-lg mx-auto"
        />
      </div>

      <h1 className="text-2xl font-semibold mb-2">Login</h1>
      <p className="text-gray-600 mb-6">
        Please enter your email and password to log in to your account. If you don't have an
        account, you can sign up below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Email</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className={`w-full p-2 border rounded ${
              errors.email || fieldErrors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          {fieldErrors.email?.map((error) => (
            <p key={`email-${error}`} className="text-sm text-red-500 mt-1">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label className="block text-sm mb-2">Password</label>
          <Input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className={`w-full p-2 border rounded ${
              errors.password || fieldErrors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
          {fieldErrors.password?.map((error) => (
            <p key={`password-${error}`} className="text-sm text-red-500 mt-1">
              {error}
            </p>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Logging in...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>

        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-gray-600">
            If you don't have an account, please{" "}
            <a href="/register" className="text-green-600 hover:underline">
              sign up
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
