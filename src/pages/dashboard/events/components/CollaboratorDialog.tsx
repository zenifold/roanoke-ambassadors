import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserProfiles, UserProfile } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CollaboratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborators: string[];
  onSubmit: (collaborators: string[]) => void;
}

export function CollaboratorDialog({ open, onOpenChange, collaborators, onSubmit }: CollaboratorDialogProps) {
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    setSelectedCollaborators(collaborators);
  }, [collaborators]);

  useEffect(() => {
    const loadUserProfiles = async () => {
      const profiles = await getUserProfiles();
      setUserProfiles(profiles);
    };
    loadUserProfiles();
  }, []);

  const handleAddCollaborator = () => {
    if (selectedUser && !selectedCollaborators.includes(selectedUser)) {
      setSelectedCollaborators([...selectedCollaborators, selectedUser]);
      setSelectedUser('');
    }
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setSelectedCollaborators(selectedCollaborators.filter(id => id !== collaboratorId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedCollaborators);
    onOpenChange(false);
  };

  const getCollaboratorName = (id: string) => {
    const profile = userProfiles.find(p => p.uid === id);
    return profile?.displayName || profile?.email || id;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="collaborator" className="text-sm font-medium">Add Collaborator</label>
            <div className="flex space-x-2">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {userProfiles
                    .filter(profile => !selectedCollaborators.includes(profile.uid))
                    .map(profile => (
                      <SelectItem key={profile.uid} value={profile.uid}>
                        {profile.displayName || profile.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddCollaborator} disabled={!selectedUser}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Collaborators</label>
            <div className="flex flex-wrap gap-2">
              {selectedCollaborators.map(collaboratorId => (
                <Badge key={collaboratorId} variant="secondary" className="flex items-center gap-1">
                  {getCollaboratorName(collaboratorId)}
                  <button
                    type="button"
                    onClick={() => handleRemoveCollaborator(collaboratorId)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedCollaborators.length === 0 && (
                <p className="text-sm text-muted-foreground">No collaborators selected</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 