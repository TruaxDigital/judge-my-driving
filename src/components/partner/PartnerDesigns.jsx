import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DESIGN_CATEGORIES, DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

function LightboxModal({ src, alt, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

export default function PartnerDesigns({ partner }) {
  const [lightbox, setLightbox] = useState(null); // { src, alt }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Sticker Designs</h1>
        <p className="text-muted-foreground mt-1">Preview all available designs. Click any design to view full size.</p>
      </div>

      {DESIGN_CATEGORIES.map(category => (
        <div key={category.label}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {category.label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.designs.map(design => {
              const url = DESIGN_URLS[design.id];
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => url && setLightbox({ src: url, alt: design.label })}
                  className="bg-card border border-border rounded-xl overflow-hidden text-left hover:border-primary/40 transition-all group"
                >
                  <div className="w-full bg-muted aspect-video flex items-center justify-center overflow-hidden">
                    {url ? (
                      <img
                        src={url}
                        alt={design.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">[Preview]</span>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-foreground leading-tight">{design.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {lightbox && (
        <LightboxModal src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}