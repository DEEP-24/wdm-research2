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
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Updated with blue gradient */}
      <div className="hidden lg:flex lg:w-[35%] bg-gradient-to-b from-blue-600 to-blue-700">
        <div className="fixed h-screen w-[35%] p-12 flex flex-col">
          {/* Top Section - Updated colors */}
          <div>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-white" />
                <h1 className="text-2xl font-semibold text-white">Research Sphere</h1>
              </div>
              <p className="text-sm text-blue-50 leading-relaxed">
                A comprehensive platform designed for researchers to manage projects, secure
                funding, and collaborate with peers worldwide. From grant applications to access all
                the tools you need for successful research.
              </p>
            </div>

            {/* Features List - Updated colors */}
            <div className="mt-12">
              <div className="space-y-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group flex items-start gap-3 p-4 rounded-lg hover:bg-white/10 transition-all cursor-default"
                  >
                    <div className="text-blue-100 group-hover:text-white transition-colors mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white block">{feature.title}</span>
                      <span className="text-xs text-blue-100 block mt-0.5">
                        {feature.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section - Updated colors */}
          <div className="mt-auto pt-12">
            <div className="p-4 bg-white/10 rounded-lg">
              <p className="text-xs text-blue-50 leading-relaxed">
                Our platform empowers researchers with cutting-edge tools and seamless collaboration
                opportunities, fostering innovation and advancing scientific discovery through
                global cooperation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className={cn("w-full", isLoginPage ? "max-w-[400px]" : "max-w-[800px]")}>
          {/* Mobile Logo - Updated colors */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-0.5 bg-blue-600" />
              <h1 className="text-xl font-semibold">
                <span className="text-blue-600">R</span>
                <span className="text-blue-950">Sphere</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-2">Advanced tools for modern research</p>
          </div>

          {children}
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
