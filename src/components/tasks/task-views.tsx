
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
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  PlusCircle,
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
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { TaskCalendarView } from "@/components/tasks/task-calendar-view";
import type { Task, TaskStatus } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatStore } from "@/store/chat-store";
import { initialTasks } from "./task-data";

export const priorityVariant: { [key in Task["priority"]]: "destructive" | "secondary" | "default" | "outline" } = {
  Urgent: "destructive",
  High: "destructive",
  Medium: "secondary",
  Low: "default",
  None: "outline",
};

export const statusVariant: { [key in Task["status"]]: "outline" | "default" | "secondary" | "destructive" } = {
  "Backlog": "outline",
  "Todo": "outline",
  "In Progress": "default",
  "In Review": "secondary",
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
    cell: ({ row }) => {
       const assignee = row.original.assignee;
       return (
        <div>
            <div className="font-medium">{row.getValue("title")}</div>
            <div className="text-sm text-muted-foreground md:hidden">{assignee.name}</div>
        </div>
       )
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row, table }) => {
      const assignee = row.getValue("assignee") as Task["assignee"];
      const meta = table.options.meta as any;
      
      const handleAssigneeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        meta.handleAssigneeClick(assignee);
      }

      return (
        <button className="flex items-center gap-2 text-left" onClick={handleAssigneeClick}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint={assignee.avatarHint} />
            <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{assignee.name}</span>
        </button>
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
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
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
            <DropdownMenuItem onClick={() => meta.handleTaskClick(row.original)}>View/Edit Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const KanbanCard = ({ task, index, onCardClick }: { task: Task; index: number; onCardClick: (task: Task) => void }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onCardClick(task)}
          className={`p-4 mb-2 rounded-lg shadow-sm bg-card cursor-pointer ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
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


export function ProjectTaskView({ initialTasks: projectTasks, title }: { initialTasks: Task[], title: string }) {
  const [tasks, setTasks] = React.useState<Task[]>(projectTasks);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({ id: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeTab, setActiveTab] = React.useState("grid");
  const isMobile = useIsMobile();
  const { openChat, setContact } = useChatStore();

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) {
        setColumnVisibility({ id: false, assignee: false, priority: false, dueDate: false, actions: false });
    } else {
        setColumnVisibility({ id: false });
    }
  }, [isMobile]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    
    setTasks(prevTasks => {
        const newTasks = Array.from(prevTasks);
        const taskToMove = newTasks.find(t => t.id === draggableId);
        
        if (!taskToMove) return prevTasks;
        
        if (source.droppableId === destination.droppableId) {
             const items = newTasks.filter(t => t.status === source.droppableId);
             const [reorderedItem] = items.splice(source.index, 1);
             items.splice(destination.index, 0, reorderedItem);
             
             const otherItems = newTasks.filter(t => t.status !== source.droppableId);
             return [...otherItems, ...items].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        }

        taskToMove.status = destination.droppableId as TaskStatus;
        const sourceItems = newTasks.filter(t => t.status === source.droppableId && t.id !== draggableId);
        const destItems = newTasks.filter(t => t.status === destination.droppableId);
        destItems.splice(destination.index, 0, taskToMove);

        const otherItems = newTasks.filter(t => t.status !== source.droppableId && t.status !== destination.droppableId);
        
        return [...otherItems, ...sourceItems, ...destItems].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    });
};

 const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailViewOpen(true);
  };

  const handleAssigneeClick = (assignee: Task["assignee"]) => {
    setContact({ name: assignee.name, avatarUrl: assignee.avatarUrl, avatarHint: assignee.avatarHint, status: "Online" });
    openChat();
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
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
     meta: {
      handleTaskClick,
      handleAssigneeClick,
    },
  });

  const kanbanColumns: { title: TaskStatus; tasks: Task[] }[] = [
    { title: "Backlog", tasks: tasks.filter((t) => t.status === "Backlog") },
    { title: "Todo", tasks: tasks.filter((t) => t.status === "Todo") },
    { title: "In Progress", tasks: tasks.filter((t) => t.status === "In Progress") },
    { title: "In Review", tasks: tasks.filter((t) => t.status === "In Review") },
    { title: "Done", tasks: tasks.filter((t) => t.status === "Done") },
    { title: "Cancelled", tasks: tasks.filter((t) => t.status === "Cancelled") },
  ];


  return (
    <>
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                Organize, assign, and track all your project's tasks.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 {activeTab === 'grid' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto hidden sm:flex">
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
                 )}
              <CreateTaskDialog onCreate={ (newTask) => setTasks(prev => [newTask, ...prev]) } />
            </div>
        </div>

      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Tabs defaultValue="grid" className="h-full flex flex-col" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="mb-4">
              <TabsTrigger value="grid" className="gap-2"><List /> <span className="hidden sm:inline">List</span></TabsTrigger>
              <TabsTrigger value="board" className="gap-2"><LayoutGrid /> <span className="hidden sm:inline">Board</span></TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><CalendarIcon /> <span className="hidden sm:inline">Calendar</span></TabsTrigger>
            </TabsList>
             {activeTab === 'grid' && (
              <Input
                placeholder="Filter tasks by title..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-xs"
              />
            )}
          </div>
          
          <TabsContent value="grid" className="flex-grow">
            <div className="rounded-md border relative">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} style={{width: header.getSize() !== 150 ? header.getSize() : undefined}}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                       <TableHead className="w-[40px]">
                           <CreateTaskDialog onCreate={ (newTask) => setTasks(prev => [newTask, ...prev]) }>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                           </CreateTaskDialog>
                       </TableHead>
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => handleTaskClick(row.original)}
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} onClick={cell.column.id === 'assignee' ? (e) => e.stopPropagation() : undefined}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                         <TableCell />
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + 1}
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
          <TabsContent value="board" className="flex-grow overflow-hidden">
             <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 py-4 h-full overflow-x-auto">
                {kanbanColumns.map((column) => (
                  <Droppable key={column.title} droppableId={column.title}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-lg p-2 flex flex-col min-w-[300px] ${snapshot.isDraggingOver ? "bg-muted" : "bg-muted/50"}`}
                      >
                        <h3 className="font-semibold p-2">{column.title} ({column.tasks.length})</h3>
                        <div className="overflow-y-auto flex-grow min-h-[200px]">
                            {column.tasks.map((task, index) => (
                                <KanbanCard key={task.id} task={task} index={index} onCardClick={handleTaskClick} />
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
            <TaskCalendarView tasks={tasks} onEventClick={handleTaskClick} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
     {selectedTask && (
        <TaskDetailDialog
          open={isDetailViewOpen}
          onOpenChange={setIsDetailViewOpen}
          task={selectedTask}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </>
  );
}
