'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Download, Plus, Pencil, Trash2, AlertTriangle, Users } from 'lucide-react';
import { createAISubscription, updateAISubscription, deleteAISubscription, assignAISubscription, unassignAISubscription } from '@/app/actions/ai-subscription';

export default function AISubscriptionClient({ initialSubscriptions, employees }: { initialSubscriptions: any[], employees: any[] }) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [search, setSearch] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  const [selectedSub, setSelectedSub] = useState<any>(null);
  
  const defaultForm = { planIdentifier: '', subscriptionName: '', subscriptionTier: '', url: '', renewalDate: '', procurementSource: 'COMPANY_CARD', costInr: '', costEur: '', remarks: '' };
  const [formData, setFormData] = useState(defaultForm);

  const [assignForm, setAssignForm] = useState({ employeeId: '', remarks: '' });

  const filtered = subscriptions.filter(s => 
    (s.subscriptionName || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.planIdentifier || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.subscriptionTier || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Plan ID', 'Tier', 'Renewal Date', 'Cost (INR)', 'Cost (EUR)', 'Active Assignments', 'Remarks'];
    const rows = filtered.map(s => [
      s.id, s.subscriptionName, s.planIdentifier, s.subscriptionTier, 
      s.renewalDate ? new Date(s.renewalDate).toLocaleDateString() : '', 
      s.costInr, s.costEur, s.assignments?.length || 0, `"${s.remarks || ''}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_subscriptions_register.csv';
    a.click();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAISubscription(formData);
    if (res.success) {
      setSubscriptions([{ ...res.data, assignments: [] }, ...subscriptions]);
      setIsAddOpen(false);
      setFormData(defaultForm);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAISubscription(selectedSub.id, formData);
    if (res.success) {
      setSubscriptions(subscriptions.map(s => s.id === selectedSub.id ? { ...res.data, assignments: selectedSub.assignments } : s));
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteAISubscription(selectedSub.id);
    if (res.success) {
      setSubscriptions(subscriptions.filter(s => s.id !== selectedSub.id));
      setIsDeleteOpen(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.employeeId) return;
    await assignAISubscription(selectedSub.id, assignForm.employeeId, assignForm.remarks);
    window.location.reload();
  };

  const handleUnassign = async (assignmentId: string) => {
    await unassignAISubscription(assignmentId);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search AI Tools..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Register AI Tool
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Tool / Name</TableHead>
              <TableHead>Plan & Tier</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium text-slate-700">
                  {sub.subscriptionName}
                  {sub.url && <a href={sub.url} target="_blank" className="block text-xs text-blue-500 hover:underline">{sub.url}</a>}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{sub.subscriptionTier || 'Standard'}</div>
                  <div className="text-xs text-gray-500">ID: {sub.planIdentifier || 'N/A'}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {sub.costInr ? `₹${sub.costInr}` : ''}
                  {sub.costInr && sub.costEur && ' | '}
                  {sub.costEur ? `€${sub.costEur}` : ''}
                  {!sub.costInr && !sub.costEur && '-'}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" className="h-7 text-xs rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100" onClick={() => {
                    setSelectedSub(sub);
                    setIsAssignOpen(true);
                  }}>
                    <Users className="w-3 h-3 mr-1" /> {sub.assignments?.length || 0} Assigned
                  </Button>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedSub(sub);
                    setFormData({ ...defaultForm, ...sub, renewalDate: sub.renewalDate ? new Date(sub.renewalDate).toISOString().split('T')[0] : '' });
                    setIsEditOpen(true);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                    setSelectedSub(sub);
                    setIsDeleteOpen(true);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No AI subscriptions found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register AI Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Subscription / Tool Name</label>
                <Input value={formData.subscriptionName} onChange={e => setFormData({...formData, subscriptionName: e.target.value})} required placeholder="e.g. ChatGPT, GitHub Copilot" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Subscription Tier</label>
                <Input value={formData.subscriptionTier} onChange={e => setFormData({...formData, subscriptionTier: e.target.value})} placeholder="e.g. Plus, Teams, Enterprise" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Plan Identifier / Order No.</label>
                <Input value={formData.planIdentifier} onChange={e => setFormData({...formData, planIdentifier: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Login / Access URL</label>
                <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (INR)</label>
                <Input type="number" step="0.01" value={formData.costInr} onChange={e => setFormData({...formData, costInr: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (EUR)</label>
                <Input type="number" step="0.01" value={formData.costEur} onChange={e => setFormData({...formData, costEur: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Next Renewal Date</label>
                <Input type="date" value={formData.renewalDate} onChange={e => setFormData({...formData, renewalDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Payment Source</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.procurementSource} onChange={e => setFormData({...formData, procurementSource: e.target.value})}>
                  <option value="COMPANY_CARD">Company Credit Card</option>
                  <option value="INVOICE">Direct Invoice</option>
                  <option value="EMPLOYEE_EXPENSE">Employee Reimbursed</option>
                </select>
              </div>
              <div className="col-span-2 grid gap-2">
                <label className="text-sm font-medium">Remarks</label>
                <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Save Subscription</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit AI Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Subscription / Tool Name</label>
                <Input value={formData.subscriptionName} onChange={e => setFormData({...formData, subscriptionName: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Subscription Tier</label>
                <Input value={formData.subscriptionTier} onChange={e => setFormData({...formData, subscriptionTier: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Plan Identifier / Order No.</label>
                <Input value={formData.planIdentifier} onChange={e => setFormData({...formData, planIdentifier: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Login / Access URL</label>
                <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (INR)</label>
                <Input type="number" step="0.01" value={formData.costInr} onChange={e => setFormData({...formData, costInr: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (EUR)</label>
                <Input type="number" step="0.01" value={formData.costEur} onChange={e => setFormData({...formData, costEur: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Next Renewal Date</label>
                <Input type="date" value={formData.renewalDate} onChange={e => setFormData({...formData, renewalDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Payment Source</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.procurementSource} onChange={e => setFormData({...formData, procurementSource: e.target.value})}>
                  <option value="COMPANY_CARD">Company Credit Card</option>
                  <option value="INVOICE">Direct Invoice</option>
                  <option value="EMPLOYEE_EXPENSE">Employee Reimbursed</option>
                </select>
              </div>
              <div className="col-span-2 grid gap-2">
                <label className="text-sm font-medium">Remarks</label>
                <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Warning Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Delete Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-600">
            Are you sure you want to delete <strong>{selectedSub?.subscriptionName}</strong>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Manage License Assignments: {selectedSub?.subscriptionName}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Currently Assigned To</h4>
            {selectedSub?.assignments?.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No employees assigned to this tool.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedSub?.assignments?.map((a: any) => (
                  <div key={a.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm border border-gray-100">
                    <div>
                      <span className="font-medium">{a.employee.name}</span> <span className="text-gray-500">({a.employee.email})</span>
                      {a.remarks && <div className="text-xs text-gray-400">Note: {a.remarks}</div>}
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 h-6 px-2 text-xs" onClick={() => handleUnassign(a.id)}>Revoke</Button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="pt-4 border-t mt-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Assign to New Employee</h4>
              <div className="grid gap-2">
                <select 
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                  value={assignForm.employeeId} 
                  onChange={e => setAssignForm({...assignForm, employeeId: e.target.value})}
                >
                  <option value="" disabled>-- Select Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Input value={assignForm.remarks} onChange={e => setAssignForm({...assignForm, remarks: e.target.value})} placeholder="Optional remarks..." />
              </div>
              <Button type="submit" className="w-full">Grant Access</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
