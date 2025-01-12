import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  addBudgetItem,
  addFundingSource,
  updateBudgetItem,
  updateFundingSource,
  deleteBudgetItem,
  deleteFundingSource,
  type BudgetItem,
  type FundingSource,
} from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BudgetPanelProps {
  eventId: string;
  budgetItems: BudgetItem[];
  fundingSources: FundingSource[];
  onBudgetUpdated: (newBudget: BudgetItem[], newFunding: FundingSource[]) => void;
}

export function BudgetPanel({ eventId, budgetItems, fundingSources, onBudgetUpdated }: BudgetPanelProps) {
  const { user } = useAuth();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [error, setError] = useState('');
  const [newBudgetItem, setNewBudgetItem] = useState({
    description: '',
    amount: 0,
    category: 'other' as BudgetItem['category'],
    status: 'planned' as BudgetItem['status'],
    eventId: eventId,
  });
  const [newFundingSource, setNewFundingSource] = useState({
    name: '',
    type: 'sponsor' as FundingSource['type'],
    amount: 0,
    status: 'potential' as FundingSource['status'],
    notes: '',
    eventId: eventId,
  });

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addBudgetItem(eventId, {
        ...newBudgetItem,
        createdBy: user.uid,
      });
      
      // Reset form
      setNewBudgetItem({
        description: '',
        amount: 0,
        category: 'other',
        status: 'planned',
        eventId: eventId,
      });
      setIsAddingItem(false);
      
      // Notify parent of update
      onBudgetUpdated([...budgetItems, { 
        ...newBudgetItem, 
        id: 'temp', 
        createdBy: user.uid, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        eventId: eventId
      }], fundingSources);
      toast.success('Budget item added successfully');
    } catch (error) {
      console.error('Error adding budget item:', error);
      setError('Failed to add budget item');
      toast.error('Failed to add budget item');
    }
  };

  const handleAddFundingSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addFundingSource(eventId, {
        ...newFundingSource,
        createdBy: user.uid,
      });
      
      // Reset form
      setNewFundingSource({
        name: '',
        type: 'sponsor',
        amount: 0,
        status: 'potential',
        notes: '',
        eventId: eventId,
      });
      setIsAddingSource(false);
      
      // Notify parent of update
      onBudgetUpdated(budgetItems, [...fundingSources, { 
        ...newFundingSource, 
        id: 'temp', 
        createdBy: user.uid, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        eventId: eventId
      }]);
      toast.success('Funding source added successfully');
    } catch (error) {
      console.error('Error adding funding source:', error);
      setError('Failed to add funding source');
      toast.error('Failed to add funding source');
    }
  };

  const handleUpdateBudgetItem = async (itemId: string, data: Partial<BudgetItem>) => {
    try {
      await updateBudgetItem(itemId, eventId, data);
      const updatedItems = budgetItems.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      );
      onBudgetUpdated(updatedItems, fundingSources);
      toast.success('Budget item updated successfully');
    } catch (error) {
      console.error('Error updating budget item:', error);
      setError('Failed to update budget item');
      toast.error('Failed to update budget item');
    }
  };

  const handleUpdateFundingSource = async (sourceId: string, data: Partial<FundingSource>) => {
    try {
      await updateFundingSource(sourceId, eventId, data);
      const updatedSources = fundingSources.map(source =>
        source.id === sourceId ? { ...source, ...data } : source
      );
      onBudgetUpdated(budgetItems, updatedSources);
      toast.success('Funding source updated successfully');
    } catch (error) {
      console.error('Error updating funding source:', error);
      setError('Failed to update funding source');
      toast.error('Failed to update funding source');
    }
  };

  const handleDeleteBudgetItem = async (itemId: string) => {
    try {
      await deleteBudgetItem(itemId, eventId);
      const updatedItems = budgetItems.filter(item => item.id !== itemId);
      onBudgetUpdated(updatedItems, fundingSources);
      toast.success('Budget item deleted successfully');
    } catch (error) {
      console.error('Error deleting budget item:', error);
      setError('Failed to delete budget item');
      toast.error('Failed to delete budget item');
    }
  };

  const handleDeleteFundingSource = async (sourceId: string) => {
    try {
      await deleteFundingSource(sourceId, eventId);
      const updatedSources = fundingSources.filter(source => source.id !== sourceId);
      onBudgetUpdated(budgetItems, updatedSources);
      toast.success('Funding source deleted successfully');
    } catch (error) {
      console.error('Error deleting funding source:', error);
      setError('Failed to delete funding source');
      toast.error('Failed to delete funding source');
    }
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  const totalFunding = fundingSources.reduce((sum, source) => sum + source.amount, 0);
  const remainingBudget = totalFunding - totalBudget;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Budget Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Total Budget</h4>
          <p className="mt-2 text-2xl font-semibold">
            ${totalBudget.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Total Funding</h4>
          <p className="mt-2 text-2xl font-semibold">
            ${totalFunding.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Remaining Budget</h4>
          <p className={`mt-2 text-2xl font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${remainingBudget.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Budget Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Budget Items</h3>
          <Button onClick={() => setIsAddingItem(true)}>
            Add Item
          </Button>
        </div>

        {isAddingItem && (
          <Card className="p-4 mb-4">
            <form onSubmit={handleAddBudgetItem} className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={newBudgetItem.description}
                  onChange={(e) => setNewBudgetItem(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      type="number"
                      value={newBudgetItem.amount}
                      onChange={(e) => setNewBudgetItem(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      required
                      min="0"
                      step="0.01"
                      className="pl-6"
                    />
                  </div>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={newBudgetItem.category}
                    onValueChange={(value: BudgetItem['category']) => 
                      setNewBudgetItem(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venue">Venue</SelectItem>
                      <SelectItem value="catering">Catering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={newBudgetItem.status}
                    onValueChange={(value: BudgetItem['status']) => 
                      setNewBudgetItem(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="spent">Spent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Item
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="divide-y">
            {budgetItems.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-gray-500">
                    Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={
                      item.status === 'planned' ? 'secondary' :
                      item.status === 'approved' ? 'default' :
                      'outline'
                    }
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                  <span className="font-medium">${item.amount.toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateBudgetItem(item.id, {
                        status: item.status === 'planned' ? 'approved' :
                                item.status === 'approved' ? 'spent' :
                                'planned'
                      })}
                    >
                      ↻
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudgetItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {budgetItems.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No budget items yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Funding Sources */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Funding Sources</h3>
          <Button onClick={() => setIsAddingSource(true)}>
            Add Source
          </Button>
        </div>

        {isAddingSource && (
          <Card className="p-4 mb-4">
            <form onSubmit={handleAddFundingSource} className="space-y-4">
              <div>
                <Label>Source Name</Label>
                <Input
                  value={newFundingSource.name}
                  onChange={(e) => setNewFundingSource(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      type="number"
                      value={newFundingSource.amount}
                      onChange={(e) => setNewFundingSource(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      required
                      min="0"
                      step="0.01"
                      className="pl-6"
                    />
                  </div>
                </div>

                <div>
                  <Label>Type</Label>
                  <Select
                    value={newFundingSource.type}
                    onValueChange={(value: FundingSource['type']) => 
                      setNewFundingSource(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="ticket_sales">Ticket Sales</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={newFundingSource.status}
                    onValueChange={(value: FundingSource['status']) => 
                      setNewFundingSource(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="potential">Potential</SelectItem>
                      <SelectItem value="committed">Committed</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newFundingSource.notes}
                  onChange={(e) => setNewFundingSource(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingSource(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Source
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="divide-y">
            {fundingSources.map((source) => (
              <div key={source.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-sm text-gray-500">
                    Type: {source.type.replace('_', ' ').charAt(0).toUpperCase() + source.type.slice(1).replace('_', ' ')}
                  </p>
                  {source.notes && (
                    <p className="text-sm text-gray-500 mt-1">{source.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={
                      source.status === 'potential' ? 'secondary' :
                      source.status === 'committed' ? 'default' :
                      'outline'
                    }
                  >
                    {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                  </Badge>
                  <span className="font-medium">${source.amount.toLocaleString()}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateFundingSource(source.id, {
                        status: source.status === 'potential' ? 'committed' :
                                source.status === 'committed' ? 'received' :
                                'potential'
                      })}
                    >
                      ↻
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFundingSource(source.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {fundingSources.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No funding sources yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 