export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#11152e] px-4 py-12">
      <div className="absolute -left-20 top-10 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 size-[28rem] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
