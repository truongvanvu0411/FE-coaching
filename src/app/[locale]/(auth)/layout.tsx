export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Same gradient as the app shell, so signing in and using the app feel like
    // one product rather than two. Replaces a near-black panel with two orbs.
    <div
      className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-12"
      style={{ backgroundImage: "linear-gradient(150deg, var(--surface-page-from) 0%, var(--surface-page-to) 55%)" }}
    >
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
