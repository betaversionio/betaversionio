import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
