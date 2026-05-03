import ReaderHeader from "./ReaderHeader";
import ReaderFooter from "./ReaderFooter";

export default function ReaderShell({
  children,
  showHeader = true,
  showFooter = true,
}: {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}) {
  return (
    <div className="reader-page flex flex-col min-h-dvh">
      {showHeader && <ReaderHeader />}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-6xl mx-auto w-full">
        {children}
      </main>
      {showFooter && <ReaderFooter />}
    </div>
  );
}
