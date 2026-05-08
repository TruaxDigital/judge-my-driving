import React, { useState } from 'react';
import { DESIGN_URLS } from '@/components/stickers/StickerDesignPicker';

const GALLERY_DESIGNS = [
  { id: 'tell_my_boss', label: 'Tell My Boss' },
  { id: 'new_driver', label: 'New Driver' },
  { id: 'on_the_clock', label: 'On the Clock' },
  { id: 'rate_this_driver', label: 'Rate This Driver' },
  { id: 'keeping_roads_safe', label: 'Rate This Driver' },
  { id: 'decades_behind_wheel', label: 'Decades Behind the Wheel' },
  { id: 'experienced_driver', label: 'Experienced Driver' },
  { id: 'company_vehicle', label: 'Company Vehicle' },
  { id: 'student_driver', label: 'Student Driver' },
  { id: 'go_easy_new', label: "Go Easy, I'm New" },
  { id: 'tell_my_dad', label: 'Tell My Dad' },
  { id: 'tell_my_mom', label: 'Tell My Mom' },
  { id: 'tell_my_kids', label: 'Tell My Kids' },
  { id: 'our_driver_feedback', label: 'Our Driver - Feedback Matters' },
  { id: 'still_got_it', label: 'Still Got It' },
];

export default function GSDesignGallery() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="designs" style={{ backgroundColor: '#1A1A1A', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            Choose from 15+ designs
          </h2>
          <p style={{ color: '#B8B8B8', fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
            Pick the personality that fits your driver. Switch designs anytime from your dashboard for $19.
          </p>
        </div>

        {/* Desktop grid / mobile horizontal scroll */}
        <div className="gs-gallery-container">
          {GALLERY_DESIGNS.map(({ id, label }) => (
            <DesignTile key={id} id={id} label={label} onClick={() => setLightbox({ id, label })} />
          ))}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.12)',
                overflow: 'hidden',
                maxWidth: 560,
                width: '100%',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              }}
            >
              <img
                src={DESIGN_URLS[lightbox.id]}
                alt={lightbox.label}
                style={{ width: '100%', display: 'block' }}
              />
              <div style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{lightbox.label}</p>
                <button
                  onClick={() => setLightbox(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
                    color: '#B8B8B8', fontSize: 13, fontWeight: 600, padding: '6px 14px', cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


      </div>

      <style>{`
        .gs-gallery-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .gs-gallery-container { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 768px) {
          .gs-gallery-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 12px;
            padding-bottom: 12px;
            -webkit-overflow-scrolling: touch;
          }
          .gs-gallery-container::-webkit-scrollbar { height: 4px; }
          .gs-gallery-container::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.4); border-radius: 2px; }
          .gs-design-tile {
            min-width: 160px !important;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </section>
  );
}

function DesignTile({ id, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="gs-design-tile"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: hovered ? '1.5px solid #D4A017' : '1.5px solid rgba(255,255,255,0.08)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        cursor: 'pointer',
        backgroundColor: '#222',
      }}
    >
      <div style={{ aspectRatio: '3/2', overflow: 'hidden' }}>
        <img
          src={DESIGN_URLS[id]}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ padding: '8px 10px', backgroundColor: '#1A1A1A' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>{label}</p>
      </div>
    </div>
  );
}