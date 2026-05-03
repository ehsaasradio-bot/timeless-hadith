import ReaderHeader from "./ReaderHeader";

export default function ReaderShell({
  children,
  showHeader = true,
}: {
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  return (
    <div className="reader-page">
      {showHeader && <ReaderHeader />}
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
