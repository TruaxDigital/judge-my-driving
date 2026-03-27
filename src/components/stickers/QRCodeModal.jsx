import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Printer, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function QRCodeModal({ sticker, open, onClose }) {
  const qrRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState({
    name: '', address1: '', address2: '', city: '', state_code: '', zip: '', country_code: 'US',
  });
  const [error, setError] = useState('');

  if (!sticker) return null;

  const qrUrl = `https://app.judgemydriving.com/scan/${sticker.unique_code}`;

  React.useEffect(() => {
    // Auto-open shipping form if sticker is unclaimed (yellow "Claim" button)
    if (sticker && !sticker.printful_order_id) {
      setShowAddress(true);
    }
  }, [sticker]);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jmd-qr-${sticker.unique_code}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToPrintful = async () => {
    setError('');
    if (!address.name || !address.address1 || !address.city || !address.state_code || !address.zip) {
      setError('Please fill in all required address fields.');
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke('sendToPrintful', {
      sticker_id: sticker.id,
      shipping_address: address,
    });
    setSending(false);
    if (res.data?.success) {
      setSent(true);
    } else {
      setError(res.data?.error || 'Failed to send to Printful. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — {sticker.driver_label || sticker.unique_code}</DialogTitle>
          <DialogDescription>
            Scan this QR code to open the feedback form for this vehicle.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div ref={qrRef} className="bg-white p-4 rounded-xl border border-border">
            <QRCodeSVG
              value={qrUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono text-center break-all">{qrUrl}</p>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download SVG
            </Button>
            <Button
              className="flex-1 rounded-xl"
              variant="outline"
              onClick={() => setShowAddress(!showAddress)}
            >
              <Printer className="w-4 h-4 mr-2" /> Order Sticker
            </Button>
          </div>

          {showAddress && !sent && (
            <div className="w-full space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Ship sticker to:</p>
              {[
                { key: 'name', label: 'Full Name *', placeholder: 'John Smith' },
                { key: 'address1', label: 'Address Line 1 *', placeholder: '123 Main St' },
                { key: 'address2', label: 'Address Line 2', placeholder: 'Apt 4B' },
                { key: 'city', label: 'City *', placeholder: 'New York' },
                { key: 'state_code', label: 'State Code *', placeholder: 'NY' },
                { key: 'zip', label: 'ZIP Code *', placeholder: '10001' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    placeholder={placeholder}
                    value={address[key]}
                    onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                className="w-full rounded-xl"
                onClick={handleSendToPrintful}
                disabled={sending}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
                {sending ? 'Sending to Printful...' : 'Confirm & Send to Print'}
              </Button>
            </div>
          )}

          {sent && (
            <div className="w-full flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Order sent to Printful! Your sticker will be printed and shipped.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}