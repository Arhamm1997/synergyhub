
"use client";

import React, { useState, useRef } from 'react';
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
import { PlusCircle, MoreHorizontal, Trash2, ArrowUpDown, ChevronDown, Upload } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Business = {
  id: string;
  name: string;
  owner: {
    name: string;
    avatarUrl?: string;
    avatarHint?: string;
  };
  phone?: string;
  type: string;
  status: "Active" | "Inactive" | "Lead" | "In Progress";
  notes: string;
};

const mockMembers = [
  { name: "Arham", avatarUrl: "", avatarHint: "person" },
  { name: "Shan", avatarUrl: "", avatarHint: "person" },
  { name: "Usman", avatarUrl: "", avatarHint: "person" },
  { name: "Hamza", avatarUrl: "", avatarHint: "person" },
];

export default function BusinessPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Business[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const owner = row.getValue("owner") as Business["owner"];
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{owner.name ? owner.name.charAt(0).toUpperCase() : 'N'}</AvatarFallback>
            </Avatar>
            <span>{owner.name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
        accessorKey: "type",
        header: "Business Type",
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
        const status = row.getValue("status") as Business["status"];
        const variants = {
          "Active": "default",
          "Inactive": "outline",
          "Lead": "secondary",
          "In Progress": "default"
        } as const;
        return <Badge variant={variants[status]}>{status}</Badge>;
      }
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("notes")}</div>
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const business = row.original;
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
              <DropdownMenuItem>Edit Business</DropdownMenuItem>
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast({
      title: "Importing...",
      description: "Reading data from the Excel file.",
    });

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          
          const newBusinesses: Business[] = [];
          
          if (rawData.length > 5) {
            for (let i = 5; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row[0]) continue;
                
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
                  phone: "",
                  type: businessType,
                  status: status,
                  notes: notesParts.join('. ') + '.',
                });
            }
          }

          setData(prev => [...prev, ...newBusinesses]);
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
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Business
                </Button>
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
                      No businesses found. Import an Excel file to get started.
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

    