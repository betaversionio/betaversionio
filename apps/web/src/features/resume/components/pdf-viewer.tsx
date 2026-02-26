'use client';

import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string | null;
  isCompiling?: boolean;
}

const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2];
const DEFAULT_ZOOM_INDEX = 4; // 1x

export function PdfViewer({ url, isCompiling }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoom = ZOOM_STEPS[zoomIndex]!;

  if (!url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
        {isCompiling ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm">Compiling...</p>
          </>
        ) : (
          <>
            <div className="rounded-xl border-2 border-dashed p-6">
              <FileText className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">No preview yet</p>
              <p className="mt-1 text-xs">
                Press{' '}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  Ctrl+Enter
                </kbd>{' '}
                to compile
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Zoom toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1">
        <span className="text-xs text-muted-foreground">
          {numPages > 0 && `${numPages} page${numPages > 1 ? 's' : ''}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            disabled={zoomIndex === 0}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center font-mono text-xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() =>
              setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
            }
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setZoomIndex(DEFAULT_ZOOM_INDEX)}
            disabled={zoomIndex === DEFAULT_ZOOM_INDEX}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* PDF pages */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-muted/20 p-4">
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
          error={
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-destructive">
              <p>Failed to load PDF</p>
              <p className="text-xs text-muted-foreground">
                Try compiling again
              </p>
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              scale={zoom}
              className="mx-auto mb-4 overflow-hidden rounded shadow-md"
              renderTextLayer={false}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
