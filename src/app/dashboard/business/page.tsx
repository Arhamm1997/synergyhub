
"use client";

import React, { useState, useRef } from 'react';

// Business type definition matching the Excel file format
type Business = {
  id: string;
  name: string;
  owner: {
    name: string;
    avatarUrl: string;
    avatarHint: string;
  };
  phone?: string;
  type: string;
  status: "Active" | "Inactive" | "Lead" | "In Progress";
  reportingDate?: string;
  assignedInfo?: string;
  keywordResearch?: string;
  webStatus?: string;
  webContent?: string;
  notes: string;
};

// Mock members store for demo purposes
const mockMembers = [
  { name: "Arham", avatarUrl: "", avatarHint: "person" },
  { name: "Shan", avatarUrl: "", avatarHint: "person" },
  { name: "Usman", avatarUrl: "", avatarHint: "person" },
  { name: "Hamza", avatarUrl: "", avatarHint: "person" },
];

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Business>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [columnsVisible, setColumnsVisible] = useState({
    name: true,
    owner: true,
    phone: true,
    type: true,
    status: true,
    notes: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple toast function
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    const message = `${title}${description ? '\n' + description : ''}`;
    if (variant === 'destructive') {
      alert('❌ ' + message);
    } else {
      alert('✅ ' + message);
    }
  };

  const filteredBusinesses = businesses
    .filter(business => 
      (business.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.owner?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const aStr = typeof aVal === 'object' ? aVal?.name || '' : String(aVal || '');
      const bStr = typeof bVal === 'object' ? bVal?.name || '' : String(bVal || '');
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast({
      title: "Importing...",
      description: "Reading data from the Excel file.",
    });

    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = (e) => {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            cellNF: true 
          });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          
          const newBusinesses: Business[] = [];
          
          // Assuming the data starts from row 6 (index 5)
          // and has a structure similar to the provided monday.com screenshot
          if (rawData.length > 5) {
            for (let i = 5; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row[0]) continue; // Skip if no business name
                
                const businessName = row[0] || '';
                const assignedInfo = row[1] || '';
                const reportingDate = row[4] ? new Date(row[4]).toLocaleDateString() : "";
                
                let ownerName = "Not Assigned";
                if (assignedInfo.toString().toLowerCase().includes("arham")) ownerName = "Arham";
                else if (assignedInfo.toString().toLowerCase().includes("shan")) ownerName = "Shan";
                else if (assignedInfo.toString().toLowerCase().includes("usman")) ownerName = "Usman";
                else if (assignedInfo.toString().toLowerCase().includes("hamza")) ownerName = "Hamza";
                
                const owner = mockMembers.find(m => m.name === ownerName) || 
                             { name: ownerName, avatarUrl: '', avatarHint: 'person' };
                
                let status: Business["status"] = "Lead";
                if (reportingDate) status = "Active";
                if (assignedInfo && assignedInfo.toString().toLowerCase().includes("done")) status = "In Progress";
                
                let businessType = "Service";
                const lowerName = businessName.toLowerCase();
                if (lowerName.includes("clean")) businessType = "Cleaning Services";
                else if (lowerName.includes("heating") || lowerName.includes("cooling")) businessType = "HVAC";
                else if (lowerName.includes("tech") || lowerName.includes("IT")) businessType = "Technology";
                else if (lowerName.includes("construction") || lowerName.includes("remodel")) businessType = "Construction";
                else if (lowerName.includes("transport") || lowerName.includes("towing")) businessType = "Transportation";
                else if (lowerName.includes("inspection")) businessType = "Home Services";
                else if (lowerName.includes("restoration")) businessType = "Restoration Services";

                const notesParts = [];
                if (reportingDate) notesParts.push(`Reporting: ${reportingDate}`);
                if (assignedInfo) notesParts.push(`Assignment: ${assignedInfo}`);
                if (row[5]) notesParts.push(`KW Research: ${row[5]}`);
                if (row[6]) notesParts.push(`Web: ${row[6]}`);
                if (row[7]) notesParts.push(`Content: ${row[7]}`);
                
                newBusinesses.push({
                  id: `IMPORT-${Date.now()}-${i}`,
                  name: businessName,
                  owner: owner,
                  phone: "", // Not in the provided format
                  type: businessType,
                  status: status,
                  notes: notesParts.join('. ') + '.',
                  reportingDate: reportingDate,
                  assignedInfo: assignedInfo.toString(),
                  keywordResearch: row[5] || "",
                  webStatus: row[6] || "",
                  webContent: row[7] || ""
                });
            }
          }

          setBusinesses(prev => [...prev, ...newBusinesses]);
          toast({
            title: "Import Successful",
            description: `${newBusinesses.length} businesses have been added.`,
          });
      };

      reader.onerror = (error) => {
        console.error("Failed to read file", error);
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Could not read the selected file.",
        });
      };

      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error("Failed to import Excel file", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not process the selected file. Please ensure it is a valid Excel file.",
      });
    } finally {
      setIsLoading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleSort = (field: keyof Business) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectBusiness = (businessId: string) => {
    const newSelected = new Set(selectedBusinesses);
    if (newSelected.has(businessId)) {
      newSelected.delete(businessId);
    } else {
      newSelected.add(businessId);
    }
    setSelectedBusinesses(newSelected);
  };

  const handleSelectAllVisible = () => {
    if (selectedBusinesses.size === paginatedBusinesses.length) {
      setSelectedBusinesses(new Set());
    } else {
      setSelectedBusinesses(new Set(paginatedBusinesses.map(b => b.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedBusinesses.size} selected businesses?`)) {
      setBusinesses(prev => prev.filter(b => !selectedBusinesses.has(b.id)));
      setSelectedBusinesses(new Set());
      toast({ title: `${selectedBusinesses.size} Businesses Deleted` });
    }
  };

  const handleDeleteBusiness = (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
      toast({ title: "Business Deleted" });
    }
  };

  const getStatusBadge = (status: Business["status"]) => {
    const variants = {
      "Active": "bg-green-100 text-green-800 border-green-300",
      "Inactive": "bg-gray-100 text-gray-800 border-gray-300", 
      "Lead": "bg-blue-100 text-blue-800 border-blue-300",
      "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Businesses</h2>
            <p className="text-sm text-gray-600 mt-1">Manage all of your business listings.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx,.xls"
            />
            <button
              onClick={handleImportClick}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              📤
              {isLoading ? "Importing..." : "Import from Excel"}
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">
              ➕
              Add Business
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Controls */}
        <div className="flex items-center gap-2 py-4">
          <input
            type="text"
            placeholder="Filter by business name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {selectedBusinesses.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="ml-auto flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              🗑️
              Delete ({selectedBusinesses.size})
            </button>
          )}
          
          <div className="relative ml-auto">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Columns
              <span className="transform transition-transform" style={{ transform: showColumnMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                🔽
              </span>
            </button>
            
            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {Object.entries(columnsVisible).map(([key, visible]) => (
                    <label key={key} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => setColumnsVisible(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBusinesses.size === paginatedBusinesses.length && paginatedBusinesses.length > 0}
                    onChange={handleSelectAllVisible}
                    className="rounded border-gray-300"
                  />
                </th>
                {columnsVisible.name && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Business Name
                      {sortField === 'name' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                )}
                {columnsVisible.owner && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                )}
                {columnsVisible.phone && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                )}
                {columnsVisible.type && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</th>
                )}
                {columnsVisible.status && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Status
                      {sortField === 'status' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                )}
                {columnsVisible.notes && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBusinesses.length ? (
                paginatedBusinesses.map((business) => (
                  <tr key={business.id} className={selectedBusinesses.has(business.id) ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBusinesses.has(business.id)}
                        onChange={() => handleSelectBusiness(business.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    {columnsVisible.name && (
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{business.name}</td>
                    )}
                    {columnsVisible.owner && (
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                            {business.owner.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{business.owner.name}</span>
                        </div>
                      </td>
                    )}
                    {columnsVisible.phone && (
                      <td className="px-4 py-4 text-sm text-gray-900">{business.phone || '-'}</td>
                    )}
                    {columnsVisible.type && (
                      <td className="px-4 py-4 text-sm text-gray-900">{business.type}</td>
                    )}
                    {columnsVisible.status && (
                      <td className="px-4 py-4">{getStatusBadge(business.status)}</td>
                    )}
                    {columnsVisible.notes && (
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{business.notes}</td>
                    )}
                    <td className="px-4 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === business.id ? null : business.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          ⋯
                        </button>
                        
                        {showActionMenu === business.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <div className="px-4 py-2 text-xs text-gray-500 font-medium">Actions</div>
                              <button
                                onClick={() => {
                                  setShowActionMenu(null);
                                  // Edit functionality would go here
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                              >
                                Edit Business
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                onClick={() => {
                                  setShowActionMenu(null);
                                  handleDeleteBusiness(business.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                Delete Business
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No businesses found. Import an Excel file to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {selectedBusinesses.size} of {filteredBusinesses.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Click outside handler for menus */}
      {(showColumnMenu || showActionMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowColumnMenu(false);
            setShowActionMenu(null);
          }}
        />
      )}
    </div>
  );
}
