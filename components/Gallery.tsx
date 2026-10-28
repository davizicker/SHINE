'use client';
import { useState } from 'react';
import { Placeholder } from './ProductCard';

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <Placeholder className="aspect-square w-full rounded-2xl" />;
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button key={src} type="button" onClick={() => setI(idx)} aria-label={`Foto ${idx + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${idx === i ? 'border-gold' : 'border-transparent'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
