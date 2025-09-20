"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, ArrowUpDown, Save, XCircle, MoreHorizontal } from "lucide-react";
import { useTableData } from "@/components/monday-table/hooks/use-table-data";
import { useSelection } from "@/components/monday-table/hooks/use-selection";
import { useContextMenu } from "@/components/monday-table/hooks/use-context-menu";
import type { Column, ColumnDef } from "@/components/monday-table/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "@/lib/types";
import { BusinessDialog } from "@/components/business/business-dialog";
import { BusinessTable } from "@/components/business/business-table";
import { useMemberStore } from "@/store/member-store";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Import missing components
import { FilterBar } from "@/components/monday-table/filter-bar";
import { TableHeader as MondayTableHeader } from "@/components/monday-table/table-header";
import { TableRow as MondayTableRow } from "@/components/monday-table/table-row";
import { AddRowButton } from "@/components/monday-table/add-row-button";
import { ContextMenu } from "@/components/monday-table/context-menu";
import * as XLSX from 'xlsx';

const defaultColumns: Column[] = [
  {
    id: 'select',
    type: 'checkbox',
    width: 40,
  },
  {
    id: 'name',
    title: 'Name',
    type: 'text',
    width: 200,
  },
  {
    id: 'owner',
    title: 'Owner',
    type: 'person',
    width: 150,
  },
  {
    id: 'status',
    title: 'Status',
    type: 'status',
    width: 130,
    options: [
      { id: 'not-started', label: 'Not Started', color: '#C4C4C4' },
      { id: 'working', label: 'Working on it', color: '#FDAB3D' },
      { id: 'stuck', label: 'Stuck', color: '#E2445C' },
      { id: 'done', label: 'Done', color: '#00C875' },
    ],
  },
  {
    id: 'date',
    title: 'Due Date',
    type: 'date',
    width: 130,
  },
  {
    id: 'notes',
    title: 'Notes',
    type: 'text',
    width: 300,
  },
];

export default function BusinessPage() {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Business>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { members } = useMemberStore();

  const {
    columns,
    rows,
    addColumn,
    updateColumn,
    deleteColumn,
    addRow,
    updateRow,
    deleteRow,
    duplicateRow,
    moveColumn,
    filteredRows,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    groupBy,
    setGroupBy,
  } = useTableData(defaultColumns);

  // Add fallback for columns to prevent undefined errors
  const safeColumns = columns || defaultColumns;

  const {
    selectedRows,
    selectedCells,
    toggleRowSelection,
    selectAllRows,
    isRowSelected,
    selectCell,
    unselectCell,
    isSelected,
  } = useSelection();

  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Initialize with sample data
  useEffect(() => {
    if (addRow) {
      const initialData = {
        id: `row-${Date.now()}`,
        name: 'Sample Business',
        owner: { name: 'John Doe', avatarUrl: '', avatarHint: 'JD' },
        status: 'active',
        priority: 'medium',
        phone: '+1234567890',
        rating: 4,
        notes: 'Initial business entry',
      };
      
      // Use setTimeout to ensure the hook is fully initialized
      setTimeout(() => {
        addRow(initialData);
      }, 0);
    }
  }, []);

  const handleAddBusiness = (business: Partial<Business>) => {
    const newBusiness: Business = {
      id: `BIZ-${Date.now()}`,
      name: business.name || "New Business",
      owner: business.owner || { name: "Current User", avatarUrl: "", avatarHint: "user" },
      phone: business.phone || "",
      type: business.type || "",
      status: business.status || "Lead",
      notes: business.notes || ""
    };
    setBusinesses(prev => [newBusiness, ...prev]);
    toast({
      title: "Business Added",
      description: "The new business has been created successfully."
    });
  };

  const handleUpdateBusiness = (id: string, changes: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => 
      b.id === id ? { ...b, ...changes } : b
    ));
    toast({
      title: "Business Updated",
      description: "The changes have been saved successfully."
    });
  };

  const handleDeleteBusiness = (id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Business Deleted",
      description: "The business has been deleted successfully."
    });
  };

  const handleEdit = (business: Business) => {
    setEditingRowId(business.id);
    setEditedData(business);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedData({});
  };
  
  const handleUpdate = (id: string, changes: Partial<Business>) => {
    setBusinesses(prev => prev.map(item => 
      item.id === id ? { ...item, ...changes } : item
    ));
    toast({
      title: "Business Updated",
      description: "Changes have been saved successfully."
    });
  };

  const handleCreateBusiness = (businessData: Omit<Business, 'id'>) => {
    const businessToAdd: Business = {
      id: `BIZ-${Math.floor(Math.random() * 10000)}`,
      ...businessData
    } as Business;
    setBusinesses(prev => [businessToAdd, ...prev]);
    toast({ 
      title: "Business Created", 
      description: "The new business has been added."
    });
  };

  const onDialogClose = () => {
    setIsBusinessDialogOpen(false);
  }

  const handleInputChange = (field: keyof Business, value: any) => {
    setEditedData(prev => ({...prev, [field]: value}));
  }

  const handleSaveEdit = () => {
    if (!editingRowId || !editedData) return;
    
    handleUpdate(editingRowId, editedData);
    setEditingRowId(null);
    setEditedData({});
  }

  const handleDelete = async (id: string) => {
    try {
      setBusinesses(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Business Deleted",
        description: "The business has been permanently deleted."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the business. Please try again."
      });
    }
  }

  // Renamed to avoid conflict with the columns from useTableData
  const businessTableColumns: ColumnDef<Business>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isEditing = editingRowId === row.original.id;
        return isEditing ? (
          <Input 
            value={editedData.name || ''} 
            onChange={e => handleInputChange('name', e.target.value)} 
            className="w-full" 
          />
        ) : (
          <div className="font-medium">{row.getValue("name")}</div>
        );
      }
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const owner = row.getValue("owner") as Business["owner"];
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{owner?.name ? owner.name.charAt(0).toUpperCase() : 'N'}</AvatarFallback>
            </Avatar>
            <span>{owner?.name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const isEditing = editingRowId === row.original.id;
        return isEditing ? (
          <Input 
            value={editedData.phone || ''} 
            onChange={e => handleInputChange('phone', e.target.value)} 
            className="w-full" 
          />
        ) : (
          row.getValue("phone")
        );
      }
    },
    {
      accessorKey: "type",
      header: "Business Type",
      cell: ({ row }) => {
        const isEditing = editingRowId === row.original.id;
        return isEditing ? (
          <Input 
            value={editedData.type || ''} 
            onChange={e => handleInputChange('type', e.target.value)} 
            className="w-full" 
          />
        ) : (
          row.getValue("type")
        );
      }
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isEditing = editingRowId === row.original.id;
        const status = row.getValue("status") as Business["status"];
        const variants = {
          "Active": "default",
          "Inactive": "outline",
          "Lead": "secondary",
        } as const;
        return isEditing ? (
          <Select onValueChange={value => handleInputChange('status', value)} defaultValue={editedData.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={variants[status]}>{status}</Badge>
        );
      }
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const isEditing = editingRowId === row.original.id;
        return isEditing ? (
          <Input 
            value={editedData.notes || ''} 
            onChange={e => handleInputChange('notes', e.target.value)} 
            className="w-full" 
          />
        ) : (
          <div className="truncate max-w-xs">{row.getValue("notes")}</div>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const business = row.original;
        const isEditing = editingRowId === business.id;
        
        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleSaveEdit}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEdit(business)}>
                Edit Business
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    Delete Business
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the business "{business.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(business.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast({
      title: "Importing...",
      description: "Reading data from the Excel file.",
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newBusinesses: Business[] = jsonData.map((row, index) => {
          const ownerName = row["Assigned To"] || "Not Assigned";
          const owner = members.find(m => m.name.toLowerCase() === ownerName.toLowerCase()) || 
                        members.find(m => m.name === "Not Assigned") || 
                        { name: ownerName, avatarUrl: '', avatarHint: 'person' };
          
          return {
            id: `IMPORT-${Date.now()}-${index}`,
            name: row["Business Name"] || '',
            owner: owner,
            phone: row["Phone Number"] || '',
            type: row["Business Type"] || '',
            status: row["Status"] || 'Lead',
            notes: row["Notes"] || '',
          };
        });
        
        setBusinesses(prev => [...prev, ...newBusinesses]);
        toast({
          title: "Import Successful",
          description: `${newBusinesses.length} businesses have been added.`,
        });
      } catch(error) {
        console.error("Failed to process Excel file", error);
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Could not process the selected file. Please ensure it has the correct columns (Business Name, Assigned To, Phone Number, Business Type, Status, Notes).",
        });
      } finally {
        setIsLoading(false);
        if (event.target) event.target.value = '';
      }
    };

    reader.onerror = (error) => {
      console.error("Failed to read file", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not read the selected file.",
      });
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Management</h1>
          <p className="text-gray-600">Monday.com style business management table with full features</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            columns={safeColumns}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            selectedCount={selectedRows.length}
            onBulkAction={(action) => {
              if (action === 'delete') {
                selectedRows.forEach(deleteRow);
              }
            }}
            onAddColumn={() => {
              addColumn({
                id: `col-${Date.now()}`,
                title: 'New Column',
                type: 'text',
                width: 150,
              });
            }}
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <MondayTableHeader
                columns={safeColumns}
                onColumnEdit={updateColumn}
                onColumnDelete={deleteColumn}
                onAddColumn={() => {
                  addColumn({
                    id: `col-${Date.now()}`,
                    title: 'New Column',
                    type: 'text',
                    width: 150,
                  });
                }}
                onMoveColumn={moveColumn}
                sortConfig={sortConfig}
                onSort={setSortConfig}
                selectedRows={selectedRows}
                totalRows={rows?.length ?? 0}
                onSelectAll={() => selectAllRows(rows?.map(row => row.id) ?? [])}
              />
              <tbody>
                {filteredRows?.map((row) => (
                  <MondayTableRow
                    key={row.id}
                    row={row}
                    columns={safeColumns}
                    onUpdateRow={updateRow}
                    onContextMenu={(e) => showContextMenu(e, 'row', { rowId: row.id })}
                    onCellContextMenu={(e, column) =>
                      showContextMenu(e, 'cell', { rowId: row.id, columnId: column.id })
                    }
                    isSelected={isRowSelected(row.id)}
                    onSelect={() => toggleRowSelection(row.id)}
                    selectedCells={selectedCells}
                    onCellSelect={(cellId) => selectCell(cellId)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <AddRowButton
            onAddRow={() => {
              addRow({
                id: `row-${Date.now()}`,
                name: 'New Business',
                owner: { name: 'Unassigned', avatarUrl: '', avatarHint: 'U' },
                status: 'inactive',
                priority: 'low',
                phone: '',
                rating: 0,
                notes: '',
              });
            }}
          />
        </div>

        {contextMenu.visible && (
          <ContextMenu
            {...contextMenu}
            onClose={hideContextMenu}
            onAction={(action) => {
              if (!contextMenu.data) return;
              
              switch (action) {
                case 'delete':
                  if (contextMenu.type === 'row') {
                    deleteRow(contextMenu.data.rowId);
                  }
                  break;
                case 'duplicate':
                  if (contextMenu.type === 'row') {
                    duplicateRow(contextMenu.data.rowId);
                  }
                  break;
              }
              hideContextMenu();
            }}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}