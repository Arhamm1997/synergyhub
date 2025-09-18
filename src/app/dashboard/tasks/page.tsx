
import { ProjectTaskView } from "@/components/tasks/task-views";
import { initialTasks } from "@/components/tasks/task-data";

export default function TasksPage() {
    return <ProjectTaskView initialTasks={initialTasks} title="All Tasks" />
}
