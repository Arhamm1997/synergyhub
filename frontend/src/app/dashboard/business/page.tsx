
"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, MoreHorizontal, Trash2, ArrowUpDown, ChevronDown, Upload, Save, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "@/lib/types";
import { useMemberStore } from "@/store/member-store";
import { BusinessDialog } from "@/components/business/business-dialog";

export default function BusinessPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Business[]>([]);
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false);
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { members } = useMemberStore();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Business>>({});

  const handleEdit = (business: Business) => {
    setEditingRowId(business.id);
    setEditedData(business);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedData({});
  };
  
  const handleSaveEdit = () => {
    if (!editingRowId) return;
    setData(prev => prev.map(b => b.id === editingRowId ? { ...b, ...editedData } : b));
    setEditingRowId(null);
    setEditedData({});
    toast({ title: "Business Updated" });
  };
  
  const handleDelete = (businessId: string) => {
    setData(prev => prev.filter(b => b.id !== businessId));
    toast({ title: "Business Deleted" });
  };
  
  const handleBulkDelete = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    setData(prev => prev.filter(b => !selectedIds.includes(b.id)));
    table.resetRowSelection();
    toast({ title: `${selectedIds.length} Businesses Deleted` });
  };

  const handleCreateBusiness = (businessData: Omit<Business, 'id'>) => {
      const businessToAdd: Business = {
        id: `BIZ-${Math.floor(Math.random() * 10000)}`,
        ...businessData
      } as Business;
      setData(prev => [businessToAdd, ...prev]);
      toast({ title: "Business Created", description: "The new business has been added."});
      setIsBusinessDialogOpen(false);
  };

  const onDialogClose = () => {
    setIsBusinessDialogOpen(false);
  }

  const handleInputChange = (field: keyof Business, value: any) => {
    setEditedData(prev => ({...prev, [field]: value}));
  }

  const columns: ColumnDef<Business>[] = [
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
            <Input value={editedData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="w-full" />
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
            <Input value={editedData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} className="w-full" />
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
            <Input value={editedData.type || ''} onChange={e => handleInputChange('type', e.target.value)} className="w-full" />
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
                <Input value={editedData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} className="w-full" />
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
                    <Button variant="outline" size="icon" onClick={handleSaveEdit}><Save className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit}><XCircle className="h-4 w-4" /></Button>
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
              <DropdownMenuItem onClick={() => handleEdit(business)}>Edit Business</DropdownMenuItem>
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
                    <AlertDialogAction onClick={() => handleDelete(business.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

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
        
        setData(prev => [...prev, ...newBusinesses]);
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>My Businesses</CardTitle>
                <CardDescription>
                    Manage all of your business listings.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx,.xls"
                />
                <Button variant="outline" onClick={handleImportClick} disabled={isLoading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isLoading ? "Importing..." : "Import from Excel"}
                </Button>
                <BusinessDialog onSave={handleCreateBusiness} isOpen={isBusinessDialogOpen} onOpenChange={onDialogClose}>
                    <Button onClick={() => setIsBusinessDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Business
                    </Button>
                </BusinessDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Filter by business name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="ml-auto">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete ({table.getFilteredSelectedRowModel().rows.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {table.getFilteredSelectedRowModel().rows.length} businesses.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border flex-grow">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No businesses found. Import an Excel file or add a new business to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
    

    