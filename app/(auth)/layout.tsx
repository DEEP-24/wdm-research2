import { BeakerIcon, LightbulbIcon, UsersIcon } from "lucide-react";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;charset=utf-8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><path d=%22M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v15.95A10 10 0 0 0 23.66 27l-3.46-2 8.2-2.2-2.9 5a12 12 0 0 1-21 0l-2.89-5 8.2 2.2-3.47 2A10 10 0 0 0 14 31.95V16zm40 40h-5v-2h5v-4.13a4 4 0 1 1 2 0V54h5v2h-5v15.95A10 10 0 0 0 63.66 67l-3.47-2 8.2-2.2-2.88 5a12 12 0 0 1-21.02 0l-2.88-5 8.2 2.2-3.47 2A10 10 0 0 0 54 71.95V56zm-39 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm40-40a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm40 40a2 2 0 1 0 0-4 2 2 0 0 0 0 4z%22 fill=%22%23white%22 fill-opacity=%22.1%22 fill-rule=%22evenodd%22/%3E</svg>')]" />
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center text-blue-100 drop-shadow-lg">
          Research Collaboration Platform
        </h1>
        <div className="flex space-x-4 sm:space-x-6 mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 rounded-xl shadow-lg">
          <BeakerIcon
            size={24}
            className="sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-blue-200 drop-shadow-glow"
          />
          <LightbulbIcon
            size={24}
            className="sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-yellow-200 drop-shadow-glow"
          />
          <UsersIcon
            size={24}
            className="sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-indigo-200 drop-shadow-glow"
          />
        </div>
        <p className="text-sm sm:text-base lg:text-xl text-center max-w-md bg-gradient-to-r from-blue-700 to-indigo-700 bg-opacity-50 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md backdrop-blur-sm">
          Connect, Collaborate, and Innovate with researchers worldwide
        </p>
      </div>
      <div className="w-full lg:w-3/5 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-2xl px-4">{children}</div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
