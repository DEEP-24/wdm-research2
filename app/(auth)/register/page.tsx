"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { UserRole } from "@prisma/client";
import { type RegisterFormData, registerSchema } from "@/lib/schema";
import Image from "next/image";

type FieldErrors = {
  [key: string]: string[];
};

export default function RegisterPage() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
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
    setFieldErrors({});

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
          setFieldErrors(responseData.fieldErrors as FieldErrors);
          return;
        }
        throw new Error(responseData.error || "Registration failed");
      }

      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 px-4">
      <div className="mb-8">
        <Image
          src="https://www.loginradius.com/blog/static/25f482319c5c4fcb1749a8c424a007b0/d3746/login-authentication.jpg"
          alt="Register"
          width={400}
          height={250}
          className="rounded-lg mx-auto"
        />
      </div>

      <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
      <p className="text-gray-600 mb-6">
        Please fill in your information to create a new account. If you already have an account, you
        can log in instead.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Phone Number</label>
          <Input
            {...register("phone")}
            type="tel"
            placeholder="Enter your phone number"
            className={`w-full p-2 border rounded ${
              errors.phone || fieldErrors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
          {fieldErrors.phone?.map((error) => (
            <p key={`phone-${error}`} className="text-sm text-red-500 mt-1">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label className="block text-sm mb-2">Street Address</label>
          <Input
            {...register("street")}
            placeholder="Enter your street address"
            className={`w-full p-2 border rounded ${
              errors.street || fieldErrors.street ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>}
          {fieldErrors.street?.map((error) => (
            <p key={`street-${error}`} className="text-sm text-red-500 mt-1">
              {error}
            </p>
          ))}
        </div>

        <div>
          <label className="block text-sm mb-2">Apartment/Suite (Optional)</label>
          <Input
            {...register("aptNo")}
            placeholder="Apartment or suite number"
            className={`w-full p-2 border rounded ${
              errors.aptNo || fieldErrors.aptNo ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.aptNo && <p className="text-sm text-red-500 mt-1">{errors.aptNo.message}</p>}
          {fieldErrors.aptNo?.map((error) => (
            <p key={`aptNo-${error}`} className="text-sm text-red-500 mt-1">
              {error}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">City</label>
            <Input
              {...register("city")}
              placeholder="Enter your city"
              className={`w-full p-2 border rounded ${
                errors.city || fieldErrors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
            {fieldErrors.city?.map((error) => (
              <p key={`city-${error}`} className="text-sm text-red-500 mt-1">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label className="block text-sm mb-2">State</label>
            <Input
              {...register("state")}
              placeholder="Enter your state"
              className={`w-full p-2 border rounded ${
                errors.state || fieldErrors.state ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>}
            {fieldErrors.state?.map((error) => (
              <p key={`state-${error}`} className="text-sm text-red-500 mt-1">
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Zip Code</label>
            <Input
              {...register("zipcode")}
              placeholder="Enter zip code"
              className={`w-full p-2 border rounded ${
                errors.zipcode || fieldErrors.zipcode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.zipcode && (
              <p className="text-sm text-red-500 mt-1">{errors.zipcode.message}</p>
            )}
            {fieldErrors.zipcode?.map((error) => (
              <p key={`zipcode-${error}`} className="text-sm text-red-500 mt-1">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label className="block text-sm mb-2">Date of Birth</label>
            <Input
              {...register("dob")}
              type="date"
              className={`w-full p-2 border rounded ${
                errors.dob || fieldErrors.dob ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.dob.message}</p>}
            {fieldErrors.dob?.map((error) => (
              <p key={`dob-${error}`} className="text-sm text-red-500 mt-1">
                {error}
              </p>
            ))}
          </div>
        </div>

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
          <label className="block text-sm mb-2">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value as "user" | "organizer" | "investor")}
            className="w-full p-2 border rounded border-gray-300"
          >
            {Object.values(UserRole)
              .filter((role) => role !== "ADMIN")
              .map((role) => (
                <option key={role} value={role.toLowerCase()}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))}
          </select>
        </div>

        {selectedRole === "user" && (
          <>
            <div>
              <label className="block text-sm mb-2">Expertise</label>
              <Input
                {...register("expertise")}
                placeholder="Your field of expertise"
                className={`w-full p-2 border rounded ${
                  errors.expertise || fieldErrors.expertise ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.expertise && (
                <p className="text-sm text-red-500 mt-1">{errors.expertise.message}</p>
              )}
              {fieldErrors.expertise?.map((error) => (
                <p key={`expertise-${error}`} className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              ))}
            </div>

            <div>
              <label className="block text-sm mb-2">Research Interests</label>
              <Input
                {...register("researchInterests")}
                placeholder="e.g., AI, Climate Science"
                className={`w-full p-2 border rounded ${
                  errors.researchInterests || fieldErrors.researchInterests
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.researchInterests && (
                <p className="text-sm text-red-500 mt-1">{errors.researchInterests.message}</p>
              )}
              {fieldErrors.researchInterests?.map((error) => (
                <p key={`researchInterests-${error}`} className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              ))}
            </div>
          </>
        )}

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

        <div>
          <label className="block text-sm mb-2">Confirm Password</label>
          <Input
            {...register("confirmPassword")}
            type="password"
            placeholder="Confirm your password"
            className={`w-full p-2 border rounded ${
              errors.confirmPassword || fieldErrors.confirmPassword
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
          {fieldErrors.confirmPassword?.map((error) => (
            <p key={`confirmPassword-${error}`} className="text-sm text-red-500 mt-1">
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
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 hover:underline">
              Log in
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
