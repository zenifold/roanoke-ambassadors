import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  getUserProfile, 
  updateUserProfile,
  updateUserPreferences,
  getUserProfiles,
  setUserRole,
  createUserProfile,
  updateAllUserAvatars,
  type UserProfile, 
  type UserRole,
  type UserPreferences
} from '../../../lib/firestore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    updatedAt: new Date(),
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            bio: userProfile.bio || '',
          });
          if (userProfile.preferences) {
            setPreferences(userProfile.preferences);
            // Apply dark mode on initial load if enabled
            if (userProfile.preferences.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        } else {
          // Create profile if it doesn't exist
          const newProfile = await createUserProfile(
            user.uid,
            user.email || '',
            'ambassador'
          );
          setProfile(newProfile);
          setFormData({
            firstName: newProfile.firstName || '',
            lastName: newProfile.lastName || '',
            bio: newProfile.bio || '',
          });
          setPreferences(newProfile.preferences);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadUsers = async () => {
      if (profile?.role !== 'program_manager') return;

      setUsersLoading(true);
      setUsersError('');

      try {
        // Update all avatars to the new style
        await updateAllUserAvatars();
        // Then load the updated users
        const allUsers = await getUserProfiles();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsersError('Failed to load users. Please try again.');
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First name and last name are required');
      }

      await updateUserProfile(user.uid, formData);
      const updatedProfile = await getUserProfile(user.uid);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = async (key: keyof Omit<UserPreferences, 'updatedAt'>, value: boolean) => {
    if (!user) return;

    try {
      const newPreferences = {
        ...preferences,
        [key]: value,
      };
      setPreferences(newPreferences);
      await updateUserPreferences(user.uid, {
        [key]: value,
      });
      toast.success('Preferences updated successfully');

      // Apply dark mode if changed
      if (key === 'darkMode') {
        document.documentElement.classList.toggle('dark', value);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === user?.uid) {
      toast.error("You cannot change your own role");
      return;
    }

    setChangingRole(userId);
    try {
      await setUserRole(userId, newRole);
      const updatedUsers = await getUserProfiles();
      setUsers(updatedUsers);
      toast.success(`User role updated to ${newRole.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role. Please try again.');
    } finally {
      setChangingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          {profile?.role === 'program_manager' && (
            <TabsTrigger value="admin">Admin</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="flex items-center space-x-6 mb-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName || 'User avatar'} />
                <AvatarFallback>
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {profile?.displayName || 'Update your profile'}
                </h2>
                <p className="text-sm text-gray-500">{profile?.email}</p>
                <p className="text-sm text-gray-500 capitalize">Role: {profile?.role}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1"
                    required
                    disabled={saving}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1"
                    required
                    disabled={saving}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-1"
                  rows={4}
                  disabled={saving}
                  placeholder="Tell us about yourself (optional)"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">App Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications about events and tasks
                    <span className="block text-xs text-yellow-600">(Coming soon)</span>
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('emailNotifications', checked)
                  }
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications on your device
                    <span className="block text-xs text-yellow-600">(Coming soon)</span>
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('pushNotifications', checked)
                  }
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('darkMode', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {profile?.role === 'program_manager' && (
          <TabsContent value="admin">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">User Management</h2>
                <p className="text-sm text-muted-foreground">
                  {users.length} user{users.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {usersError && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{usersError}</div>
                </div>
              )}

              {usersLoading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatarUrl} alt={user.displayName || 'User'} />
                                <AvatarFallback>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span>{user.displayName || 'Unnamed User'}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value: UserRole) => handleRoleChange(user.uid, value)}
                              disabled={changingRole === user.uid || user.uid === profile?.uid}
                            >
                              <SelectTrigger className="w-[140px]">
                                {changingRole === user.uid ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span>Updating...</span>
                                  </div>
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ambassador">Ambassador</SelectItem>
                                <SelectItem value="program_manager">Program Manager</SelectItem>
                              </SelectContent>
                            </Select>
                            {user.uid === profile?.uid && (
                              <p className="text-xs text-muted-foreground mt-1">Cannot change own role</p>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.updatedAt instanceof Date 
                              ? user.updatedAt.toLocaleDateString()
                              : new Date(user.updatedAt.seconds * 1000).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 