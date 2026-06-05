'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, Eye } from 'lucide-react';

export default function AuditClient({ logs }: { logs: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const filtered = logs.filter(l => 
    (l.tableName || '').toLowerCase().includes(search.toLowerCase()) || 
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.changedByEmployee?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Table', 'Record ID', 'Action', 'Performed By', 'Timestamp'];
    const rows = filtered.map(l => [
      l.id, l.tableName, l.recordId, l.action, l.changedByEmployee?.name || 'System', new Date(l.changedAt).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search logs..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" /> Export Logs
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module (Table)</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-gray-600">
                  {new Date(log.changedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    log.action === 'INSERT' ? 'bg-emerald-100 text-emerald-700' :
                    log.action === 'UPDATE' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {log.tableName}
                  <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {log.recordId}</div>
                </TableCell>
                <TableCell>{log.changedByEmployee?.name || 'System Administrator'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No audit logs match your search.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div><span className="font-medium">Action:</span> {selectedLog.action}</div>
                <div><span className="font-medium">Table:</span> {selectedLog.tableName}</div>
                <div><span className="font-medium">Record ID:</span> {selectedLog.recordId}</div>
                <div><span className="font-medium">Timestamp:</span> {new Date(selectedLog.changedAt).toLocaleString()}</div>
                <div className="col-span-2"><span className="font-medium">Performed By:</span> {selectedLog.changedByEmployee?.name || 'System Admin'}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 h-64">
                <div className="border rounded-md overflow-hidden flex flex-col">
                  <div className="bg-red-50 text-red-700 text-xs font-bold px-3 py-2 border-b">PREVIOUS STATE</div>
                  <pre className="p-3 text-xs overflow-auto flex-1 bg-white whitespace-pre-wrap">
                    {selectedLog.oldData ? JSON.stringify(JSON.parse(selectedLog.oldData), null, 2) : 'N/A'}
                  </pre>
                </div>
                <div className="border rounded-md overflow-hidden flex flex-col">
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-2 border-b">NEW STATE</div>
                  <pre className="p-3 text-xs overflow-auto flex-1 bg-white whitespace-pre-wrap">
                    {selectedLog.newData ? JSON.stringify(JSON.parse(selectedLog.newData), null, 2) : 'N/A'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
