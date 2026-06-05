'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Download, Plus, Pencil, Trash2, AlertTriangle, FileUp } from 'lucide-react';
import { createAsset, updateAsset, deleteAsset } from '@/app/actions/asset';

export default function OtherAssetClient({ initialAssets }: { initialAssets: any[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const defaultForm = { assetType: 'MOBILE', model: '', serialNumber: '', description: '', procurementSource: 'COMPANY_PURCHASE', costInr: '', costEur: '', remarks: '' };
  const [formData, setFormData] = useState(defaultForm);

  const filtered = assets.filter(a => 
    (a.model || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.assetType || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Asset Type', 'Model/Name', 'Serial/Number', 'Description', 'Procurement', 'Cost (INR)', 'Cost (EUR)', 'Remarks'];
    const rows = filtered.map(a => [a.id, a.assetType, a.model, a.serialNumber, `"${a.description || ''}"`, a.procurementSource, a.costInr, a.costEur, `"${a.remarks || ''}"`]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'other_assets_register.csv';
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MOBILE': return 'Test Mobile';
      case 'SIM': return 'SIM Card';
      case 'MONITOR': return 'Monitor';
      case 'ACCESSORY': return 'Accessory';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search assets..." 
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
            <Plus className="h-4 w-4 mr-2" /> Register Asset
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Model / Name</TableHead>
              <TableHead>Serial / SIM No</TableHead>
              <TableHead>Procurement</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium text-slate-700">{getTypeLabel(asset.assetType)}</TableCell>
                <TableCell>{asset.model || '-'}</TableCell>
                <TableCell>{asset.serialNumber || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.procurementSource === 'BYOD' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {asset.procurementSource === 'BYOD' ? 'BYOD' : asset.procurementSource}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {asset.costInr ? `₹${asset.costInr}` : ''}
                  {asset.costInr && asset.costEur && ' | '}
                  {asset.costEur ? `€${asset.costEur}` : ''}
                  {!asset.costInr && !asset.costEur && '-'}
                </TableCell>
                <TableCell className="max-w-[150px] truncate" title={asset.remarks}>{asset.remarks || '-'}</TableCell>
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
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No assets found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              
              <div className="grid gap-2 col-span-2">
                <label className="text-sm font-medium">Asset Type</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.assetType} onChange={e => setFormData({...formData, assetType: e.target.value})}>
                  <option value="MOBILE">Test Mobile</option>
                  <option value="SIM">SIM Card</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="ACCESSORY">Hardware Accessory</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Model / Name</label>
                <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required placeholder="e.g. iPhone 15 Pro, Jio 5G SIM" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Serial / SIM Number / IMEI</label>
                <Input value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              </div>
              
              <div className="grid gap-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Used for QA testing" />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Procurement Source</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.procurementSource} onChange={e => setFormData({...formData, procurementSource: e.target.value})}>
                  <option value="COMPANY_PURCHASE">Company Purchase</option>
                  <option value="BYOD">BYOD (Personal Device)</option>
                  <option value="RENTAL">Rental</option>
                </select>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Cost (INR)</label>
                  <Input type="number" step="0.01" value={formData.costInr} onChange={e => setFormData({...formData, costInr: e.target.value})} disabled={formData.procurementSource === 'BYOD'} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Cost (EUR)</label>
                  <Input type="number" step="0.01" value={formData.costEur} onChange={e => setFormData({...formData, costEur: e.target.value})} disabled={formData.procurementSource === 'BYOD'} />
                </div>
              </div>

              <div className="col-span-2 grid gap-2">
                <label className="text-sm font-medium">Remarks</label>
                <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>

              {/* Mock Invoice Upload */}
              <div className="col-span-2 grid gap-2 p-4 border border-dashed rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-600 flex items-center">
                  <FileUp className="w-4 h-4 mr-2" /> Upload Purchase Invoice (Optional Mock)
                </label>
                <Input type="file" className="bg-white" disabled={formData.procurementSource === 'BYOD'} />
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
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              
              <div className="grid gap-2 col-span-2">
                <label className="text-sm font-medium">Asset Type</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.assetType} onChange={e => setFormData({...formData, assetType: e.target.value})}>
                  <option value="MOBILE">Test Mobile</option>
                  <option value="SIM">SIM Card</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="ACCESSORY">Hardware Accessory</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Model / Name</label>
                <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Serial / SIM Number / IMEI</label>
                <Input value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} required />
              </div>
              
              <div className="grid gap-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Procurement Source</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.procurementSource} onChange={e => setFormData({...formData, procurementSource: e.target.value})}>
                  <option value="COMPANY_PURCHASE">Company Purchase</option>
                  <option value="BYOD">BYOD (Personal Device)</option>
                  <option value="RENTAL">Rental</option>
                </select>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Cost (INR)</label>
                  <Input type="number" step="0.01" value={formData.costInr} onChange={e => setFormData({...formData, costInr: e.target.value})} disabled={formData.procurementSource === 'BYOD'} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Cost (EUR)</label>
                  <Input type="number" step="0.01" value={formData.costEur} onChange={e => setFormData({...formData, costEur: e.target.value})} disabled={formData.procurementSource === 'BYOD'} />
                </div>
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
            Are you sure you want to delete <strong>{selectedAsset?.model}</strong>? This action cannot be undone and will permanently remove it from the register.
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
