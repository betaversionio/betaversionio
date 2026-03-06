import { Suspense } from 'react';
import { CollectionsContent } from './collections-content';
import { Loader2 } from 'lucide-react';

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
