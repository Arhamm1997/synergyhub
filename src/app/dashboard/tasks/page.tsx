
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
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskCalendarView } from "@/components/tasks/task-calendar-view";
import type { Task, TaskStatus } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

const initialTasks: Task[] = [
    {
        id: "TASK-8782",
        title: "Deploy V2 of the marketing website",
        assignee: { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint! },
        priority: "High",
        status: "In Progress",
        dueDate: "2024-08-15",
    },
    {
        id: "TASK-7878",
        title: "Fix authentication bug on mobile",
        assignee: { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint! },
        priority: "High",
        status: "Todo",
        dueDate: "2024-08-10",
    },
    {
        id: "TASK-4567",
        title: "Design new client onboarding flow",
        assignee: { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint! },
        priority: "Medium",
        status: "In Progress",
        dueDate: "2024-08-25",
    },
    {
        id: "TASK-9876",
        title: "Write Q3 performance report",
        assignee: { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint! },
        priority: "Low",
        status: "Done",
        dueDate: "2024-07-30",
    },
    {
        id: "TASK-2345",
        title: "Update API documentation for v3",
        assignee: { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint! },
        priority: "Medium",
        status: "Todo",
        dueDate: "2024-09-01",
    },
    {
        id: "TASK-6789",
        title: "Research new email marketing platforms",
        assignee: { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint! },
        priority: "Low",
        status: "Done",
        dueDate: "2024-08-20",
    },
    {
      id: "TASK-1122",
      title: "Create social media content calendar",
      assignee: { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint! },
      priority: "Medium",
      status: "Todo",
      dueDate: "2024-08-18",
    },
    {
      id: "TASK-3344",
      title: "A/B test new CTA buttons",
      assignee: { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint! },
      priority: "High",
      status: "In Progress",
      dueDate: "2024-08-12",
    }
];

const priorityVariant: { [key in Task["priority"]]: "destructive" | "secondary" | "default" } = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

const statusVariant: { [key in Task["status"]]: "outline" | "default" | "secondary" | "destructive" } = {
  "Todo": "outline",
  "In Progress": "default",
  "Done": "secondary",
  "Cancelled": "destructive",
}

export const columns: ColumnDef<Task>[] = [
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
    accessorKey: "id",
    header: "ID",
     cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => {
      const assignee = row.getValue("assignee") as Task["assignee"];
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint={assignee.avatarHint} />
            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{assignee.name}</span>
        </div>
      );
    },
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
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue("status") as Task["status"]]} className="capitalize">{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant={priorityVariant[row.getValue("priority") as Task["priority"]]} className="capitalize">{row.getValue("priority")}</Badge>
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("dueDate")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
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
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const KanbanCard = ({ task, index }: { task: Task; index: number }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-2 rounded-lg shadow-sm bg-card ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <Badge variant={priorityVariant[task.priority]} className="capitalize h-fit">{task.priority}</Badge>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} data-ai-hint={task.assignee.avatarHint} />
                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{task.dueDate}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};


export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    
    // If dropped in the same place, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
    }

    setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        const taskToMove = newTasks.find(t => t.id === draggableId);
        
        if (!taskToMove) return prevTasks;

        // Update status based on destination column
        taskToMove.status = destination.droppableId as TaskStatus;

        // Reorder tasks
        const reorderedTasks = newTasks.filter(t => t.id !== draggableId);
        
        const destinationTasks = reorderedTasks.filter(t => t.status === destination.droppableId);
        const otherTasks = reorderedTasks.filter(t => t.status !== destination.droppableId);
        
        destinationTasks.splice(destination.index, 0, taskToMove);

        return [...otherTasks, ...destinationTasks];
    });
};


  const table = useReactTable({
    data: tasks,
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

  const kanbanColumns: { title: TaskStatus; tasks: Task[] }[] = [
    { title: "Todo", tasks: tasks.filter((t) => t.status === "Todo") },
    { title: "In Progress", tasks: tasks.filter((t) => t.status === "In Progress") },
    { title: "Done", tasks: tasks.filter((t) => t.status === "Done") },
    { title: "Cancelled", tasks: tasks.filter((t) => t.status === "Cancelled") },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          Organize, assign, and track all your team's tasks from here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="grid" className="h-full flex flex-col">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2"><List /> List</TabsTrigger>
              <TabsTrigger value="board" className="gap-2"><LayoutGrid /> Board</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><CalendarIcon /> Calendar</TabsTrigger>
            </TabsList>
             <div className="flex items-center gap-2">
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
              <CreateTaskDialog onCreate={ (newTask) => setTasks(prev => [newTask, ...prev]) } />
            </div>
          </div>
          <TabsContent value="grid" className="flex-grow">
            <div className="py-4">
              <Input
                placeholder="Filter tasks by title..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
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
          </TabsContent>
          <TabsContent value="board" className="flex-grow">
             <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4 h-full">
                {kanbanColumns.map((column) => (
                  <Droppable key={column.title} droppableId={column.title}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-lg p-2 flex flex-col ${snapshot.isDraggingOver ? "bg-muted" : "bg-muted/50"}`}
                      >
                        <h3 className="font-semibold p-2">{column.title} ({column.tasks.length})</h3>
                        <div className="overflow-y-auto flex-grow min-h-[200px]">
                            {column.tasks.map((task, index) => (
                                <KanbanCard key={task.id} task={task} index={index} />
                            ))}
                            {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </TabsContent>
           <TabsContent value="calendar" className="flex-grow">
            <TaskCalendarView tasks={tasks} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

    