
"use client"

import * as React from "react";
import Link from "next/link";
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
import { PlusCircle, MoreVertical, Trash2, ArrowUpDown, ChevronDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Project, ProjectStatus } from "@/lib/types";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { initialProjects } from "@/lib/project-data";
import { useToast } from "@/hooks/use-toast";
import { useMemberStore } from "@/store/member-store";


export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = React.useState(false);
  const { members, fetchMembers } = useMemberStore();

  React.useEffect(() => {
    // TODO: Get the business ID from the user context or route
    const businessId = "current-business-id";
    fetchMembers(businessId).catch(error => {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive"
      });
    });
  }, [fetchMembers, toast]);
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({ title: "Project Deleted", description: "The project has been successfully deleted." });
  };
  
  const handleBulkDelete = () => {
    const selectedProjectIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    setProjects(prev => prev.filter(p => !selectedProjectIds.includes(p.id)));
    table.resetRowSelection();
    toast({ title: `${selectedProjectIds.length} Projects Deleted`, description: "The selected projects have been successfully deleted." });
  }

  const columns: ColumnDef<Project>[] = [
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
      header: "Project",
      cell: ({ row }) => (
        <div className="font-medium">
            <Link href={`/dashboard/projects/${row.original.id}`} className="hover:underline">
                {row.getValue("name")}
            </Link>
             <div className="text-sm text-muted-foreground md:hidden">{row.original.client}</div>
        </div>
      )
    },
    {
      accessorKey: "client",
      header: "Client",
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
        const status: ProjectStatus = row.getValue("status");
        const statusVariant: { [key in ProjectStatus]: "default" | "secondary" | "destructive" | "outline" } = {
          "Not Started": "outline",
          "In Progress": "default",
          "On Hold": "destructive",
          "Completed": "secondary",
          "Cancelled": "destructive"
        };
        return <Badge variant={statusVariant[status] || 'outline'}>{status}</Badge>;
      }
    },
    {
        accessorKey: "team",
        header: "Team",
        cell: ({row}) => (
            <div className="flex -space-x-2">
                {row.original.team.map((member, index) => (
                    <Avatar key={index} className="h-8 w-8 border-2 border-card">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                ))}
            </div>
        )
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Progress
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Progress value={row.getValue("progress")} className="w-24" />
            <span className="text-muted-foreground">{row.getValue("progress")}%</span>
        </div>
      )
    },
    {
        accessorKey: "deadline",
        header: "Deadline"
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenEditDialog(project)}>Edit Project</DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          Delete Project
                      </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the project "{project.name}".
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>Delete</AlertDialogAction>
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
    data: projects,
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

    const handleCreateProject = (newProject: Omit<Project, 'id' | 'progress' | 'tasks'>) => {
    const projectToAdd: Project = {
      id: `PROJ-${Math.floor(Math.random() * 1000)}`,
      progress: 0,
      tasks: [],
      ...newProject,
      team: newProject.team.map(teamMember => {
        const fullMember = members.find(m => m.name === teamMember.name);
        return {
          name: teamMember.name,
          avatarUrl: teamMember.avatarUrl || fullMember?.avatarUrl || '',
          avatarHint: teamMember.avatarHint || fullMember?.avatarHint || '',
        };
      })
    }
    setProjects(prev => [projectToAdd, ...prev]);
  };  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
  }

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    setIsProjectDialogOpen(true);
  }

  const onDialogClose = () => {
    setEditingProject(null);
    setIsProjectDialogOpen(false);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                    Manage all your projects and their progress.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <ProjectDialog 
                    onSave={handleCreateProject} 
                    isOpen={isProjectDialogOpen && !editingProject} 
                    onOpenChange={setIsProjectDialogOpen}
                >
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Project
                  </Button>
                </ProjectDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Filter projects by name..."
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
                            This action cannot be undone. This will permanently delete {table.getFilteredSelectedRowModel().rows.length} projects.
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
      {editingProject && (
        <ProjectDialog
            project={editingProject}
            onSave={(editedProject) => handleUpdateProject({ ...editingProject, ...(editedProject as Omit<Project, 'id' | 'tasks' | 'progress'>) })}
            isOpen={isProjectDialogOpen && !!editingProject}
            onOpenChange={onDialogClose}
        />
      )}
    </Card>
  );
}

    