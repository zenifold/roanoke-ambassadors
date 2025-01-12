import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { addVolunteerFeedback, VolunteerRole } from '@/lib/firestore';

interface VolunteerFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  role: VolunteerRole;
}

export function VolunteerFeedbackDialog({ open, onOpenChange, eventId, role }: VolunteerFeedbackDialogProps) {
  const [saving, setSaving] = useState(false);
  const [roleEffectiveness, setRoleEffectiveness] = useState<string>('');
  const [wouldVolunteerAgain, setWouldVolunteerAgain] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');

  const handleSubmit = async () => {
    if (!roleEffectiveness || !wouldVolunteerAgain || !feedback) {
      toast('Please fill in all required fields', {
        description: 'Role effectiveness, willingness to volunteer again, and feedback are required.',
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      await addVolunteerFeedback(eventId, role.id, {
        roleEffectiveness: roleEffectiveness as any,
        wouldVolunteerAgain: wouldVolunteerAgain as any,
        feedback,
        suggestions,
        submittedAt: new Date(),
      });

      toast('Feedback submitted successfully', {
        description: 'Thank you for providing your feedback!',
        duration: 3000,
      });
      onOpenChange(false);
    } catch (error) {
      toast('Failed to submit feedback', {
        description: 'There was an error submitting your feedback. Please try again.',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Volunteer Feedback - {role.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">How effective was this volunteer role?*</label>
            <Select value={roleEffectiveness} onValueChange={setRoleEffectiveness}>
              <SelectTrigger>
                <SelectValue placeholder="Select effectiveness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_effective">Very Effective</SelectItem>
                <SelectItem value="effective">Effective</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                <SelectItem value="ineffective">Ineffective</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Would you volunteer for this role again?*</label>
            <Select value={wouldVolunteerAgain} onValueChange={setWouldVolunteerAgain}>
              <SelectTrigger>
                <SelectValue placeholder="Select your answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="definitely">Definitely</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">What went well? What could be improved?*</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Do you have any suggestions for future events?</label>
            <Textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Optional suggestions..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 