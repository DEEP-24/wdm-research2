export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 bg-[#F0F7F1] flex items-center justify-center p-6">{children}</main>
    </div>
  );
}
