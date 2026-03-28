import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2, Package } from 'lucide-react';
import StickerDesignPicker from './StickerDesignPicker';
import { base44 } from '@/api/base44Client';

const STEPS = ['Name', 'Design', 'Shipping', 'Confirm'];

const emptyAddress = {
  name: '', address1: '', address2: '', city: '', state_code: '', zip: '', country_code: 'US',
};

export default function ClaimStickerWizard({ stickers, open, onClose, onComplete }) {
  const [currentStickerIndex, setCurrentStickerIndex] = useState(0);
  const [step, setStep] = useState(0); // 0=Name, 1=Design, 2=Shipping, 3=Confirm
  const [labels, setLabels] = useState({});
  const [designs, setDesigns] = useState({});
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedStickers, setCompletedStickers] = useState([]);
  const [allDone, setAllDone] = useState(false);

  if (!stickers || stickers.length === 0) return null;

  const sticker = stickers[currentStickerIndex];
  const totalStickers = stickers.length;
  const currentDesign = designs[sticker?.id] || 'default';
  const currentAddress = addresses[sticker?.id] || { ...emptyAddress };

  const currentLabel = labels[sticker?.id] || '';
  const setLabel = (val) => setLabels(prev => ({ ...prev, [sticker.id]: val }));
  const setDesign = (val) => setDesigns(prev => ({ ...prev, [sticker.id]: val }));
  const setAddress = (field, val) => setAddresses(prev => ({
    ...prev,
    [sticker.id]: { ...(prev[sticker.id] || emptyAddress), [field]: val },
  }));

  const addressValid = () => {
    const a = currentAddress;
    return a.name && a.address1 && a.city && a.state_code && a.zip;
  };

  const handleOrderSticker = async () => {
    setLoading(true);
    setError('');
    try {
      // Save label, design to sticker and activate it
      await base44.entities.Sticker.update(sticker.id, {
        driver_label: currentLabel || undefined,
        design_id: currentDesign,
        status: 'active',
      });
      // Send to Printful
      const res = await base44.functions.invoke('sendToPrintful', {
        sticker_id: sticker.id,
        shipping_address: currentAddress,
      });
      if (!res.data?.success) throw new Error(res.data?.error || 'Failed to place order.');
      setCompletedStickers(prev => [...prev, sticker.id]);

      // Move to next sticker or finish
      if (currentStickerIndex < totalStickers - 1) {
        setCurrentStickerIndex(i => i + 1);
        setStep(0);
      } else {
        setAllDone(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onComplete && onComplete();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-2xl">
        {allDone ? (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">You're all set!</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your sticker{totalStickers > 1 ? 's are' : ' is'} on the way! We'll print and ship {totalStickers > 1 ? 'them' : 'it'} to the address{totalStickers > 1 ? 'es' : ''} you provided.
            </p>
            <Button onClick={handleClose} className="mt-2 rounded-xl">
              Go to My Stickers
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {totalStickers > 1 && (
                  <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                    Sticker {currentStickerIndex + 1} of {totalStickers}
                  </span>
                )}
                <span>{STEPS.map((s, i) => (
                  <span key={s} className={i === step ? 'font-semibold text-foreground' : ''}>
                    {i > 0 && ' → '}{s}
                  </span>
                ))}</span>
              </div>
              <DialogTitle>
                {step === 0 && 'Name This Vehicle'}
                {step === 1 && 'Choose Your Sticker Design'}
                {step === 2 && 'Where Should We Ship It?'}
                {step === 3 && 'Confirm Your Order'}
              </DialogTitle>
              <DialogDescription>
                {step === 0 && 'Give this sticker a nickname so you can easily identify which vehicle it belongs to.'}
                {step === 1 && `Pick a design for sticker ${sticker?.unique_code}. This will be printed and shipped to you.`}
                {step === 2 && 'Enter the shipping address for this sticker.'}
                {step === 3 && 'Review your selection before we send it to print.'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {step === 0 && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-sm">Vehicle Nickname *</Label>
                    <Input
                      autoFocus
                      placeholder="e.g. Mom's Car, My Truck, Teen Driver"
                      value={currentLabel}
                      onChange={e => setLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && currentLabel.trim()) setStep(1); }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">This name identifies your vehicle and will be shown publicly if you opt in to the leaderboard.</p>
                </div>
              )}

              {step === 1 && (
                <div className="max-h-[55vh] overflow-y-auto pr-1">
                  <StickerDesignPicker value={currentDesign} onChange={setDesign} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {[
                    { key: 'name', label: 'Full Name *', placeholder: 'John Smith' },
                    { key: 'address1', label: 'Address Line 1 *', placeholder: '123 Main St' },
                    { key: 'address2', label: 'Address Line 2', placeholder: 'Apt 4B (optional)' },
                    { key: 'city', label: 'City *', placeholder: 'New York' },
                    { key: 'state_code', label: 'State Code *', placeholder: 'NY' },
                    { key: 'zip', label: 'ZIP Code *', placeholder: '10001' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-sm">{label}</Label>
                      <Input
                        placeholder={placeholder}
                        value={currentAddress[key] || ''}
                        onChange={e => setAddress(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">Vehicle Name</p>
                    <p className="text-muted-foreground">{currentLabel || '(unnamed)'}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">Design</p>
                    <p className="text-muted-foreground capitalize">{currentDesign.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 space-y-1 text-sm">
                    <p className="font-semibold text-foreground mb-1">Shipping To</p>
                    <p className="text-muted-foreground">{currentAddress.name}</p>
                    <p className="text-muted-foreground">{currentAddress.address1}{currentAddress.address2 ? `, ${currentAddress.address2}` : ''}</p>
                    <p className="text-muted-foreground">{currentAddress.city}, {currentAddress.state_code} {currentAddress.zip}</p>
                    <p className="text-muted-foreground">{currentAddress.country_code}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 rounded-xl p-3">
                    <Package className="w-4 h-4 text-primary shrink-0" />
                    Shipping is included at no extra charge.
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              )}
            </div>

            <DialogFooter>
              {step > 0 && (
                <Button variant="outline" onClick={() => { setStep(s => s - 1); setError(''); }} disabled={loading}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < 3 && (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={(step === 0 && !currentLabel.trim()) || (step === 2 && !addressValid())}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === 3 && (
                <Button onClick={handleOrderSticker} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {currentStickerIndex < totalStickers - 1 ? 'Order & Next Sticker' : 'Place Order'}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}