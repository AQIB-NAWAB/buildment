export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Build<span className="text-indigo-600">Mint</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Learn systems engineering by building, not memorizing.
        </p>
      </div>
      {children}
    </div>
  );
}
