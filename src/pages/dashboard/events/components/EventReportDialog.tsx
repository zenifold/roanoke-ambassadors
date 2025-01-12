import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  type Event,
  type EventReport,
  type EventMetricValue,
  type EventMetricDefinition,
  AVAILABLE_METRICS,
  createEventReport,
  getEventReportByEventId,
  updateEventReport,
} from '@/lib/firestore';
import { toast } from 'sonner';

interface EventReportDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdated?: () => void;
}

export function EventReportDialog({ event, open, onOpenChange, onReportUpdated }: EventReportDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingReport, setExistingReport] = useState<EventReport | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<EventMetricValue[]>([]);
  const [feedback, setFeedback] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadExistingReport = async () => {
      try {
        const report = await getEventReportByEventId(event.id);
        if (report) {
          setExistingReport(report);
          setMetrics(report.metrics);
          setSelectedMetrics(report.metrics.map(m => m.definitionId));
          setFeedback(report.feedback);
          setNotes(report.notes);
        } else {
          // Initialize with empty metrics
          setMetrics([]);
          setSelectedMetrics([]);
        }
      } catch (error) {
        console.error('Error loading event report:', error);
        toast('Failed to load event report', {
          description: 'There was an error loading the event report data.',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadExistingReport();
    }
  }, [event.id, open]);

  const handleMetricSelection = (metricId: string, checked: boolean) => {
    if (checked) {
      setSelectedMetrics(prev => [...prev, metricId]);
      setMetrics(prev => [
        ...prev,
        { definitionId: metricId, value: '' }
      ]);
    } else {
      setSelectedMetrics(prev => prev.filter(id => id !== metricId));
      setMetrics(prev => prev.filter(metric => metric.definitionId !== metricId));
    }
  };

  const handleMetricChange = (definitionId: string, value: string) => {
    setMetrics(prevMetrics => 
      prevMetrics.map(metric => 
        metric.definitionId === definitionId
          ? { ...metric, value }
          : metric
      )
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const reportData = {
        eventId: event.id,
        metrics,
        feedback,
        notes,
        submittedBy: user.uid,
      };

      if (existingReport) {
        await updateEventReport(existingReport.id, reportData);
        toast('Event report updated', {
          description: 'The event report has been successfully updated.',
          duration: 3000,
        });
      } else {
        await createEventReport(event.id, reportData);
        toast('Event report submitted', {
          description: 'The event report has been successfully submitted.',
          duration: 3000,
        });
      }
      onReportUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving event report:', error);
      toast('Failed to save event report', {
        description: 'There was an error saving the event report data.',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const renderMetricInput = (definition: EventMetricDefinition, value: string) => {
    switch (definition.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleMetricChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.label.toLowerCase()}`}
          />
        );
      case 'currency':
        return (
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => handleMetricChange(definition.id, e.target.value)}
            placeholder="Enter amount"
            className="pl-6"
            style={{ backgroundImage: 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><text x="0" y="14" fill="gray">$</text></svg>)', backgroundPosition: '4px center', backgroundRepeat: 'no-repeat' }}
          />
        );
      case 'rating':
        return (
          <Select
            value={value}
            onValueChange={(value) => handleMetricChange(definition.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} Star{rating !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleMetricChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.label.toLowerCase()}`}
          />
        );
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post-Event Report</DialogTitle>
          <DialogDescription>
            Submit metrics and feedback for {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metric Selection Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Select Metrics to Track</h4>
            <p className="text-sm text-gray-500">Choose which metrics you want to include in your report.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_METRICS.map((metric) => (
                <div key={metric.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`metric-${metric.id}`}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={(checked) => handleMetricSelection(metric.id, checked === true)}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor={`metric-${metric.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {metric.label}
                    </label>
                    {metric.description && (
                      <p className="text-xs text-gray-500">{metric.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Metrics Input Section */}
          {selectedMetrics.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Enter Metric Values</h4>
              {selectedMetrics.map((metricId) => {
                const definition = AVAILABLE_METRICS.find(m => m.id === metricId);
                const metric = metrics.find(m => m.definitionId === metricId);
                if (!definition) return null;
                return (
                  <div key={definition.id} className="space-y-2">
                    <Label>{definition.label}</Label>
                    {renderMetricInput(definition, metric?.value?.toString() || '')}
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback Section */}
          <div className="space-y-2">
            <Label>General Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share general feedback about the event"
              rows={3}
            />
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or observations"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : existingReport ? 'Update Report' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 