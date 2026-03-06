'use client';

export default function ResumeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fixed inset-0 bg-background">{children}</div>;
}
