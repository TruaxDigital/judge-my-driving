import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const ACTION_TYPES = [
  'Coaching Session',
  'Written Warning',
  'Manager Ride-Along',
  'Defensive Driving Refresher',
  'Training Assignment',
  'Suspension',
  'Escalation',
  'Other',
];

const statusColors = {
  Open: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function CorrectiveActionPanel({ incident, fleetId, userId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    action_type: '',
    action_date: moment().format('YYYY-MM-DD'),
    description: '',
    follow_up_date: '',
  });
  const [notes, setNotes] = useState('');

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['corrective-action', incident.id],
    queryFn: () => base44.entities.CorrectiveAction.filter({ incident_id: incident.id }),
  });

  const existing = actions[0] || null;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CorrectiveAction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-action', incident.id] });
      queryClient.invalidateQueries({ queryKey: ['all-corrective-actions'] });
      setShowForm(false);
      setEditing(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CorrectiveAction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrective-action', incident.id] });
      queryClient.invalidateQueries({ queryKey: ['all-corrective-actions'] });
      setEditing(false);
    },
  });

  const handleSave = () => {
    if (editing && existing) {
      updateMutation.mutate({ id: existing.id, data: { ...form, notes } });
    } else {
      createMutation.mutate({
        incident_id: incident.id,
        driver_id: incident._stickerId,
        fleet_id: fleetId,
        assigned_by: userId,
        status: 'Open',
        ...form,
      });
    }
  };

  const handleEdit = () => {
    setForm({
      action_type: existing.action_type,
      action_date: existing.action_date,
      description: existing.description,
      follow_up_date: existing.follow_up_date || '',
    });
    setNotes(existing.notes || '');
    setEditing(true);
    setShowForm(true);
  };

  const handleResolve = () => {
    updateMutation.mutate({
      id: existing.id,
      data: { status: 'Resolved', resolution_date: moment().format('YYYY-MM-DD') },
    });
  };

  if (isLoading) return <div className="py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Corrective Action</p>

      {!existing && !showForm && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-yellow-700">This safety incident has not been addressed. Document your response.</p>
          </div>
          <Button size="sm" className="rounded-lg h-7 text-xs shrink-0" onClick={() => setShowForm(true)}>
            Log Action
          </Button>
        </div>
      )}

      {existing && !showForm && (
        <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{existing.action_type}</p>
              <p className="text-xs text-muted-foreground">{existing.action_date}</p>
            </div>
            <Badge variant="outline" className={cn('border text-xs', statusColors[existing.status])}>
              {existing.status}
            </Badge>
          </div>
          <p className="text-xs text-foreground">{existing.description}</p>
          {existing.notes && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{existing.notes}</p>
          )}
          {existing.follow_up_date && (
            <p className="text-xs text-muted-foreground">Follow-up: {existing.follow_up_date}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={handleEdit}>
              <Pencil className="w-3 h-3 mr-1" /> Edit
            </Button>
            {existing.status !== 'Resolved' && (
              <Button size="sm" className="h-7 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white" onClick={handleResolve} disabled={updateMutation.isPending}>
                <CheckCircle className="w-3 h-3 mr-1" /> Mark Resolved
              </Button>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-muted/20 border border-border rounded-xl p-3 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Action Type</Label>
            <Select value={form.action_type} onValueChange={v => setForm(p => ({ ...p, action_type: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date of Action</Label>
            <Input type="date" value={form.action_date} onChange={e => setForm(p => ({ ...p, action_date: e.target.value }))} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              placeholder="Describe the corrective action taken..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="text-xs min-h-[60px]"
            />
          </div>
          {editing && (
            <div className="space-y-1">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea placeholder="Follow-up observations..." value={notes} onChange={e => setNotes(e.target.value)} className="text-xs min-h-[40px]" />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Follow-Up Date (optional)</Label>
            <Input type="date" value={form.follow_up_date} onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))} className="h-8 text-xs" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { setShowForm(false); setEditing(false); }}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs rounded-lg" onClick={handleSave} disabled={!form.action_type || !form.description || createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}