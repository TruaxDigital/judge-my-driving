import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileBarChart, Loader2, Download } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

const PERIOD_OPTIONS = [
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last Quarter', value: 'quarter' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Last 12 Months', value: '12m' },
  { label: 'Custom Range', value: 'custom' },
];

function getPeriodDates(period) {
  const now = moment();
  switch (period) {
    case '30d':
      return { start: moment().subtract(30, 'days').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD'), label: `Last 30 Days (${moment().subtract(30, 'days').format('MMM D')} - ${now.format('MMM D, YYYY')})` };
    case 'quarter': {
      const qStart = moment().startOf('quarter');
      const prevQStart = moment().subtract(1, 'quarter').startOf('quarter');
      const prevQEnd = moment().subtract(1, 'quarter').endOf('quarter');
      return { start: prevQStart.format('YYYY-MM-DD'), end: prevQEnd.format('YYYY-MM-DD'), label: `Q${prevQStart.quarter()} ${prevQStart.year()} (${prevQStart.format('MMM D')} - ${prevQEnd.format('MMM D')})` };
    }
    case '6m':
      return { start: moment().subtract(6, 'months').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD'), label: `Last 6 Months (${moment().subtract(6, 'months').format('MMM D')} - ${now.format('MMM D, YYYY')})` };
    case '12m':
      return { start: moment().subtract(12, 'months').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD'), label: `Last 12 Months (${moment().subtract(12, 'months').format('MMM YYYY')} - ${now.format('MMM YYYY')})` };
    default:
      return null;
  }
}

export default function InsuranceReportGenerator() {
  const [period, setPeriod] = useState('quarter');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [includeDriverNames, setIncludeDriverNames] = useState(true);
  const [includeIncidentDetails, setIncludeIncidentDetails] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);

    let startDate, endDate, periodLabel;
    if (period === 'custom') {
      if (!customStart || !customEnd) {
        setError('Please select a start and end date.');
        setGenerating(false);
        return;
      }
      startDate = customStart;
      endDate = customEnd;
      periodLabel = `${moment(customStart).format('MMM D')} – ${moment(customEnd).format('MMM D, YYYY')}`;
    } else {
      const dates = getPeriodDates(period);
      startDate = dates.start;
      endDate = dates.end;
      periodLabel = dates.label;
    }

    try {
      // base44.functions.invoke returns axios response; for binary we use responseType arraybuffer
      const response = await base44.functions.invoke('generateFleetReport', {
        startDate: startDate + 'T00:00:00.000Z',
        endDate: endDate + 'T23:59:59.999Z',
        includeDriverNames,
        includeIncidentDetails,
        periodLabel,
      }, { responseType: 'arraybuffer' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JMD_Fleet_Safety_Report_${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Failed to generate PDF. Please try again.');
    }

    setGenerating(false);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Insurance Documentation Report</h3>
            <p className="text-xs text-muted-foreground">Generate a branded PDF for insurance renewals</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Report Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">End Date</Label>
              <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {[
            { label: 'Include Driver Names', sub: 'If off, drivers appear as "Driver 1", "Driver 2", etc.', key: 'names', val: includeDriverNames, set: setIncludeDriverNames },
            { label: 'Include Incident Details', sub: 'If off, shows only summary counts.', key: 'incidents', val: includeIncidentDetails, set: setIncludeIncidentDetails },
          ].map(({ label, sub, key, val, set }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 bg-muted/20">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <button
                type="button"
                onClick={() => set(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${val ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button className="w-full rounded-xl" onClick={handleGenerate} disabled={generating}>
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating PDF...</>
            : <><Download className="w-4 h-4 mr-2" /> Generate PDF Report</>}
        </Button>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-foreground">What's included in the report?</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• <strong>Page 1:</strong> Executive summary with KPIs and narrative</li>
          <li>• <strong>Page 2:</strong> Driver performance scorecard with rating distribution</li>
          <li>• <strong>Page 3:</strong> Safety incident log and corrective actions taken</li>
          <li>• <strong>Page 4:</strong> Fleet manager certification and methodology</li>
        </ul>
      </div>
    </div>
  );
}