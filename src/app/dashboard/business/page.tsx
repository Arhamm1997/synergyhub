
"use client";

import * as React from "react";
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
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Upload,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import type { Business } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { BusinessDialog } from "@/components/business/business-dialog";
import { useMemberStore } from "@/store/member-store";

export default function BusinessPage() {
  const { toast } = useToast();
  const { members } = useMemberStore();
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [editingBusiness, setEditingBusiness] = React.useState<Business | null>(null);
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({
      title: "Importing...",
      description: "Reading data from the Excel file.",
    });

    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

        const newBusinesses: Business[] = json.map((row: any, index: number) => {
           // Find owner by name, or use a default structure if not found
          const owner = members.find(m => m.name === row.Owner);
          return ({
          id: `IMPORT-${Date.now()}-${index}`,
          name: row['Business Name'] || '',
          owner: owner || { name: row.Owner || '', avatarUrl: '', avatarHint: 'person' },
          phone: row['Phone Number'] || '',
          type: row['Business Type'] || '',
          status: ['Active', 'Inactive', 'Lead'].includes(row.Status) ? row.Status : 'Lead',
          notes: row.Notes || '',
        })});

        setBusinesses(prev => [...prev, ...newBusinesses]);
        toast({
          title: "Import Successful",
          description: `${newBusinesses.length} businesses have been added.`,
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Failed to import and parse Excel file", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not read data from the selected file. Please ensure it is a valid Excel file.",
      });
    }

    // Reset file input
    if(event.target) {
        event.target.value = '';
    }
  };


  const handleDeleteBusiness = (businessId: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    toast({
      title: "Business Deleted",
      description: "The business has been successfully deleted.",
    });
  };

  const handleBulkDelete = () => {
    const selectedBusinessIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    setBusinesses(prev => prev.filter(b => !selectedBusinessIds.includes(b.id)));
    table.resetRowSelection();
    toast({ title: `${selectedBusinessIds.length} Businesses Deleted`, description: "The selected businesses have been successfully deleted." });
  }

  const columns: ColumnDef<Business>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Business Name",
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
              <AvatarImage src={owner.avatarUrl} alt={owner.name} />
              <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{owner.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
    },
    {
      accessorKey: "type",
      header: "Business Type",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status: Business["status"] = row.getValue("status");
        const statusVariant: { [key in Business["status"]]: "default" | "secondary" | "outline" } = {
          "Active": "default",
          "Inactive": "secondary",
          "Lead": "outline",
        };
        return <Badge variant={statusVariant[status] || 'outline'}>{status}</Badge>;
      },
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
              <DropdownMenuItem onClick={() => handleOpenEditDialog(business)}>
                Edit Business
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
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
                    <AlertDialogAction onClick={() => handleDeleteBusiness(business.id)}>
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

  const table = useReactTable({
    data: businesses,
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
  
  const handleSaveBusiness = (businessData: Omit<Business, 'id'> | Business) => {
    if ('id' in businessData) {
      // Editing
      setBusinesses(prev => prev.map(b => b.id === businessData.id ? businessData : b));
      toast({ title: "Business Updated" });
    } else {
      // Creating
      const newBusiness: Business = {
        id: `BIZ-${Math.floor(Math.random() * 1000)}`,
        ...businessData,
      };
      setBusinesses(prev => [newBusiness, ...prev]);
      toast({ title: "Business Created" });
    }
    setIsBusinessDialogOpen(false);
    setEditingBusiness(null);
  };

  const handleOpenEditDialog = (business: Business) => {
    setEditingBusiness(business);
    setIsBusinessDialogOpen(true);
  };
  
  const handleOpenCreateDialog = () => {
    setEditingBusiness(null);
    setIsBusinessDialogOpen(true);
  }

  const onDialogClose = () => {
    setEditingBusiness(null);
    setIsBusinessDialogOpen(false);
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
              accept=".xlsx, .xls"
            />
            <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
            </Button>
            <Button onClick={handleOpenCreateDialog}>
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
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border flex-grow">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
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
      <BusinessDialog
          business={editingBusiness}
          onSave={handleSaveBusiness}
          isOpen={isBusinessDialogOpen}
          onOpenChange={onDialogClose}
      />
    </Card>
  );
}
