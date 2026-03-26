import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DESIGN_CATEGORIES, DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

export default function DesignCatalogModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Sticker Designs</DialogTitle>
          <DialogDescription>
            Choose from 15+ designs across categories. You'll pick your design after subscribing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {DESIGN_CATEGORIES.map((category) => (
            <div key={category.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                {category.label}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {category.designs.map((design) => (
                  <div key={design.id} className="rounded-xl border border-border overflow-hidden">
                    <img
                      src={DESIGN_URLS[design.id]}
                      alt={design.label}
                      className="w-full h-16 object-cover bg-muted"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="px-2 py-1.5 bg-card">
                      <p className="text-xs font-medium text-foreground leading-tight">{design.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Custom sticker branding available for Professional Fleet and above.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}