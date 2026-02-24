'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi],
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on('select', onSelect);
    mainApi.on('reInit', onSelect);
    return () => {
      mainApi.off('select', onSelect);
      mainApi.off('reInit', onSelect);
    };
  }, [mainApi, onSelect]);

  return (
    <div className="flex w-full flex-col gap-3">
      <Carousel setApi={setMainApi} className="w-full">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <Image
                  src={src}
                  alt={`${title} screenshot ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {images.length > 1 && (
        <Carousel
          setApi={setThumbApi}
          opts={{ containScroll: 'keepSnaps', dragFree: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 flex-row">
            {images.map((src, index) => (
              <CarouselItem
                key={index}
                className="basis-1/5 cursor-pointer pl-2 sm:basis-1/6"
                onClick={() => onThumbClick(index)}
              >
                <div
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
                    index === selectedIndex
                      ? 'border-primary opacity-100'
                      : 'border-transparent opacity-40 hover:opacity-70',
                  )}
                >
                  <Image
                    src={src}
                    alt={`${title} thumb ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
