import {
  BookOpenCheckIcon,
  BrainCircuitIcon,
  FileTextIcon,
  MessageCircleIcon,
  BadgeDollarSignIcon,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <FileTextIcon className="w-5 h-5" />,
    title: "Grant Applications",
    description: "Access and manage research funding opportunities",
  },
  {
    icon: <BookOpenCheckIcon className="w-5 h-5" />,
    title: "Project Management",
    description: "Organize and track research projects efficiently",
  },
  {
    icon: <MessageCircleIcon className="w-5 h-5" />,
    title: "Research Forums",
    description: "Engage in topic-based discussions",
  },
  {
    icon: <BadgeDollarSignIcon className="w-5 h-5" />,
    title: "Funding Opportunities",
    description: "Explore various funding options for research",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current pathname to determine which page we're on
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Minimal Branding */}
      <div className="hidden lg:flex lg:w-[35%] bg-zinc-50 border-r border-zinc-200">
        <div className="fixed h-screen w-[35%] p-12 flex flex-col">
          {/* Top Section */}
          <div>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-zinc-900" />
                <h1 className="text-2xl font-semibold text-zinc-900">Research Platform</h1>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                A comprehensive platform designed for researchers to manage projects, secure
                funding, and collaborate with peers worldwide. From grant applications to access all
                the tools you need for successful research.
              </p>
            </div>

            {/* Features List */}
            <div className="mt-12">
              <div className="space-y-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-3 p-4 rounded-lg hover:bg-zinc-100 transition-all cursor-default"
                  >
                    <div className="text-zinc-400 group-hover:text-zinc-600 transition-colors mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-zinc-900 block">
                        {feature.title}
                      </span>
                      <span className="text-xs text-zinc-500 block mt-0.5">
                        {feature.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section - Mission Statement */}
          <div className="mt-auto pt-12">
            <div className="p-4 bg-zinc-100 rounded-lg">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Our platform empowers researchers with cutting-edge tools and seamless collaboration
                opportunities, fostering innovation and advancing scientific discovery through
                global cooperation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 min-h-screen bg-white flex items-center justify-center p-6">
        <div className={cn("w-full", isLoginPage ? "max-w-[400px]" : "max-w-[800px]")}>
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-0.5 bg-zinc-900" />
              <h1 className="text-xl font-semibold text-zinc-900">Research Platform</h1>
            </div>
            <p className="text-sm text-zinc-500 mt-2">Advanced tools for modern research</p>
          </div>

          {children}
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
