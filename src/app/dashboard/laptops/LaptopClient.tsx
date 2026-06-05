'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Download, Plus, Pencil, Trash2, AlertTriangle, FileUp } from 'lucide-react';
import { createAsset, updateAsset, deleteAsset } from '@/app/actions/asset';

export default function LaptopClient({ initialAssets }: { initialAssets: any[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const defaultForm = { assetTag: '', assetType: 'LAPTOP', model: '', serialNumber: '', specsRam: '', specsHdd: '', specsOs: '', procurementSource: 'COMPANY_PURCHASE', costInr: '', costEur: '', remarks: '' };
  const [formData, setFormData] = useState(defaultForm);

  const filtered = assets.filter(a => 
    (a.assetTag || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.model || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.serialNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['System ID', 'Asset ID', 'Model', 'Serial Number', 'RAM', 'Storage', 'OS', 'Procurement', 'Cost (INR)', 'Cost (EUR)', 'Remarks'];
    const rows = filtered.map(a => [a.id, a.assetTag || '', a.model, a.serialNumber, a.specsRam, a.specsHdd, a.specsOs, a.procurementSource, a.costInr, a.costEur, `"${a.remarks || ''}"`]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laptops_register.csv';
    a.click();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAsset(formData);
    if (res.success) {
      setAssets([res.data, ...assets]);
      setIsAddOpen(false);
      setFormData(defaultForm);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAsset(selectedAsset.id, formData);
    if (res.success) {
      setAssets(assets.map(a => a.id === selectedAsset.id ? res.data : a));
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteAsset(selectedAsset.id);
    if (res.success) {
      setAssets(assets.filter(a => a.id !== selectedAsset.id));
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search laptops (model, serial)..." 
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
            <Plus className="h-4 w-4 mr-2" /> Register Laptop
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Serial No</TableHead>
              <TableHead>Specs (RAM / Storage)</TableHead>
              <TableHead>Procurement</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-semibold text-indigo-600">{asset.assetTag || '-'}</TableCell>
                <TableCell className="font-medium">{asset.model || '-'}</TableCell>
                <TableCell>{asset.serialNumber || '-'}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {asset.specsRam || 'N/A'} / {asset.specsHdd || 'N/A'}
                  <div className="text-xs text-gray-400 mt-0.5">{asset.specsOs}</div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.procurementSource === 'BYOD' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {asset.procurementSource === 'BYOD' ? 'Bring Your Own Device' : asset.procurementSource}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {asset.costInr ? `₹${asset.costInr}` : ''}
                  {asset.costInr && asset.costEur && ' | '}
                  {asset.costEur ? `€${asset.costEur}` : ''}
                  {!asset.costInr && !asset.costEur && '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedAsset(asset);
                    setFormData({ ...defaultForm, ...asset });
                    setIsEditOpen(true);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                    setSelectedAsset(asset);
                    setIsDeleteOpen(true);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No laptops found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Laptop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <label className="text-sm font-medium">Asset ID / Tag</label>
                <Input value={formData.assetTag} onChange={e => setFormData({...formData, assetTag: e.target.value})} placeholder="e.g. AST-001" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Laptop Model</label>
                <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required placeholder="e.g. MacBook Pro M3" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">RAM</label>
                <Input value={formData.specsRam} onChange={e => setFormData({...formData, specsRam: e.target.value})} placeholder="e.g. 16GB" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Storage / HDD</label>
                <Input value={formData.specsHdd} onChange={e => setFormData({...formData, specsHdd: e.target.value})} placeholder="e.g. 512GB SSD" />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Operating System</label>
                <Input value={formData.specsOs} onChange={e => setFormData({...formData, specsOs: e.target.value})} placeholder="e.g. macOS 14" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Procurement Source</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.procurementSource} onChange={e => setFormData({...formData, procurementSource: e.target.value})}>
                  <option value="COMPANY_PURCHASE">Company Purchase</option>
                  <option value="BYOD">BYOD (Personal Device)</option>
                  <option value="RENTAL">Rental</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (INR)</label>
                <Input type="number" step="0.01" value={formData.costInr} onChange={e => setFormData({...formData, costInr: e.target.value})} placeholder="0.00" disabled={formData.procurementSource === 'BYOD'} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (EUR)</label>
                <Input type="number" step="0.01" value={formData.costEur} onChange={e => setFormData({...formData, costEur: e.target.value})} placeholder="0.00" disabled={formData.procurementSource === 'BYOD'} />
              </div>

              <div className="col-span-2 grid gap-2">
                <label className="text-sm font-medium">Remarks</label>
                <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Any additional notes..." />
              </div>

              {/* Mock Invoice Upload */}
              <div className="col-span-2 grid gap-2 p-4 border border-dashed rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <FileUp className="w-4 h-4 mr-2" /> Upload Purchase Invoice (Optional Mock)
                </label>
                <Input type="file" className="bg-white" disabled={formData.procurementSource === 'BYOD'} />
                <p className="text-xs text-gray-400">PDF or JPG formats. This is a mock UI element.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Register Asset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Laptop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <label className="text-sm font-medium">Asset ID / Tag</label>
                <Input value={formData.assetTag} onChange={e => setFormData({...formData, assetTag: e.target.value})} placeholder="e.g. AST-001" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Laptop Model</label>
                <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">RAM</label>
                <Input value={formData.specsRam} onChange={e => setFormData({...formData, specsRam: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Storage / HDD</label>
                <Input value={formData.specsHdd} onChange={e => setFormData({...formData, specsHdd: e.target.value})} />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Operating System</label>
                <Input value={formData.specsOs} onChange={e => setFormData({...formData, specsOs: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Procurement Source</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.procurementSource} onChange={e => setFormData({...formData, procurementSource: e.target.value})}>
                  <option value="COMPANY_PURCHASE">Company Purchase</option>
                  <option value="BYOD">BYOD (Personal Device)</option>
                  <option value="RENTAL">Rental</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (INR)</label>
                <Input type="number" step="0.01" value={formData.costInr} onChange={e => setFormData({...formData, costInr: e.target.value})} disabled={formData.procurementSource === 'BYOD'} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cost (EUR)</label>
                <Input type="number" step="0.01" value={formData.costEur} onChange={e => setFormData({...formData, costEur: e.target.value})} disabled={formData.procurementSource === 'BYOD'} />
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
              Delete Asset
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-600">
            Are you sure you want to delete <strong>{selectedAsset?.model}</strong> (Serial: {selectedAsset?.serialNumber})? This action cannot be undone and will permanently remove it from the register.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
