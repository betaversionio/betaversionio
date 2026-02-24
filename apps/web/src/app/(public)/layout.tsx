import { Header } from '@/components/shared/header';
import { Footer } from '@/components/layout/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto [scrollbar-gutter:stable]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
