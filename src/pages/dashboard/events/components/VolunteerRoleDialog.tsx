import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserProfiles, VolunteerRole, UserProfile } from '@/lib/firestore';

interface VolunteerRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: VolunteerRole | null;
  eventId: string;
  onSubmit: (role: Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function VolunteerRoleDialog({ open, onOpenChange, role, eventId, onSubmit }: VolunteerRoleDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
  });
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (role) {
      setFormData({
        title: role.title,
        description: role.description,
        assignedTo: role.assignedTo || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
      });
    }
  }, [role]);

  useEffect(() => {
    const loadUserProfiles = async () => {
      const profiles = await getUserProfiles();
      setUserProfiles(profiles);
    };
    loadUserProfiles();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo || null,
      eventId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Add Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="assignedTo" className="text-sm font-medium">Assigned To</label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {userProfiles.map((profile) => (
                  <SelectItem key={profile.uid} value={profile.uid}>
                    {profile.displayName || profile.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {role ? 'Save Changes' : 'Add Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 