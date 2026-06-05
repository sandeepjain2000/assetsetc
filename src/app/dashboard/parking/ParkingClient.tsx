'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Download, Plus, Pencil, ArchiveRestore, AlertTriangle } from 'lucide-react';
import { createParkingPermit, updateParkingPermit, archiveParkingPermit } from '@/app/actions/parking';

export default function ParkingClient({ initialPermits, employees }: { initialPermits: any[], employees: any[] }) {
  const [permits, setPermits] = useState(initialPermits);
  const [search, setSearch] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  
  const [selectedPermit, setSelectedPermit] = useState<any>(null);
  
  const defaultForm = { employeeId: '', permitNumber: '', vehicleType: 'Car', issueDate: new Date().toISOString().split('T')[0], endDate: '', remarks: '' };
  const [formData, setFormData] = useState(defaultForm);
  const [archiveRemarks, setArchiveRemarks] = useState('');

  const filtered = permits.filter(p => 
    (p.permitNumber || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.employee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.employee?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Employee Name', 'Email', 'Permit Number', 'Vehicle Type', 'Issue Date', 'End Date', 'Remarks'];
    const rows = filtered.map(p => [
      p.id, p.employee?.name, p.employee?.email, p.permitNumber, p.vehicleType,
      new Date(p.issueDate).toLocaleDateString(), 
      p.endDate ? new Date(p.endDate).toLocaleDateString() : '', 
      `"${p.remarks || ''}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parking_permits.csv';
    a.click();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createParkingPermit(formData);
    if (res.success) {
      setPermits([res.data, ...permits]);
      setIsAddOpen(false);
      setFormData(defaultForm);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateParkingPermit(selectedPermit.id, formData);
    if (res.success) {
      setPermits(permits.map(p => p.id === selectedPermit.id ? res.data : p));
      setIsEditOpen(false);
    }
  };

  const handleArchive = async () => {
    const res = await archiveParkingPermit(selectedPermit.id, archiveRemarks);
    if (res.success) {
      setPermits(permits.filter(p => p.id !== selectedPermit.id));
      setIsArchiveOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search permits or employees..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export Active
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Issue Permit
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Permit ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((permit) => (
              <TableRow key={permit.id}>
                <TableCell className="font-medium text-indigo-600">{permit.permitNumber}</TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{permit.employee?.name || permit.employee?.email}</div>
                  <div className="text-xs text-gray-500">{permit.employee?.name ? permit.employee.email : ''}</div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${permit.vehicleType === 'Car' ? 'bg-sky-100 text-sky-700' : permit.vehicleType === 'Bike' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                    {permit.vehicleType}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(permit.issueDate).toLocaleDateString()}
                  {permit.endDate && <div className="text-xs text-gray-400">Ends: {new Date(permit.endDate).toLocaleDateString()}</div>}
                </TableCell>
                <TableCell className="max-w-[150px] truncate text-sm" title={permit.remarks}>{permit.remarks || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedPermit(permit);
                    setFormData({
                      ...defaultForm,
                      employeeId: permit.employeeId,
                      permitNumber: permit.permitNumber,
                      vehicleType: permit.vehicleType,
                      issueDate: new Date(permit.issueDate).toISOString().split('T')[0],
                      endDate: permit.endDate ? new Date(permit.endDate).toISOString().split('T')[0] : '',
                      remarks: permit.remarks || ''
                    });
                    setIsEditOpen(true);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-700 hover:bg-amber-50" onClick={() => {
                    setSelectedPermit(permit);
                    setArchiveRemarks(permit.remarks || '');
                    setIsArchiveOpen(true);
                  }}>
                    <ArchiveRestore className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No active parking permits found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Parking Permit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Employee</label>
              <select 
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="" disabled>-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Permit Number</label>
                <Input required value={formData.permitNumber} onChange={e => setFormData({...formData, permitNumber: e.target.value})} placeholder="e.g. B1-042" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike / Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Issue Date</label>
                <Input type="date" required value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">End Date (Optional)</label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="e.g. Needs disabled parking access" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Issue Permit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parking Permit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Employee</label>
              <select 
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="" disabled>-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Permit Number</label>
                <Input required value={formData.permitNumber} onChange={e => setFormData({...formData, permitNumber: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike / Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Issue Date</label>
                <Input type="date" required value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">End Date (Optional)</label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Warning Dialog */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Archive Parking Permit
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-gray-600 space-y-4">
            <p>
              Are you sure you want to revoke and archive permit <strong>{selectedPermit?.permitNumber}</strong> for <strong>{selectedPermit?.employee?.name || selectedPermit?.employee?.email}</strong>?
            </p>
            <p>
              This will remove it from the active list and store it in the history archive.
            </p>
            <div className="grid gap-2 pt-2">
              <label className="font-medium text-gray-900">Archive Reason / Remarks</label>
              <Input value={archiveRemarks} onChange={e => setArchiveRemarks(e.target.value)} placeholder="e.g. Employee moved to a different building..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArchiveOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleArchive}>Confirm & Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
