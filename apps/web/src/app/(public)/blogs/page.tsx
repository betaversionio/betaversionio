import { Suspense } from 'react';
import { BlogsContent } from './blogs-content';
import { Loader2 } from 'lucide-react';

export default function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BlogsContent />
    </Suspense>
  );
}
