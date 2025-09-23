
import type { Task } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

// Safely get avatar placeholder 
const getAvatarPlaceholder = (index: number) => {
    return placeholderImages?.avatars?.[index] || '';
};

export const initialTasks: Task[] = [
    {
        id: "TASK-8782",
        title: "Deploy V2 of the marketing website",
        description: "Deploy the new version of the marketing website to the production environment. Ensure all assets are optimized and the site is responsive.",
        assignee: { name: "Sarah Lee", avatarUrl: getAvatarPlaceholder(1), avatarHint: 'woman portrait' },
        priority: "High",
        status: "In Progress",
        dueDate: "2024-08-15",
    },
    {
        id: "TASK-7878",
        title: "Fix authentication bug on mobile",
        description: "Users are reporting issues logging in on mobile devices. The issue seems to be related to the new authentication flow.",
        assignee: { name: "David Chen", avatarUrl: getAvatarPlaceholder(2), avatarHint: 'man portrait professional' },
        priority: "High",
        status: "Todo",
        dueDate: "2024-08-10",
    },
    {
        id: "TASK-4567",
        title: "Design new client onboarding flow",
        description: "Create a new design for the client onboarding flow. The design should be intuitive and user-friendly.",
        assignee: { name: "Maria Rodriguez", avatarUrl: getAvatarPlaceholder(3), avatarHint: 'woman professional' },
        priority: "Medium",
        status: "In Progress",
        dueDate: "2024-08-25",
    },
    {
        id: "TASK-9876",
        title: "Write Q3 performance report",
        description: "Compile the Q3 performance report for the marketing team. The report should include key metrics and a summary of the quarter's performance.",
        assignee: { name: "Alex Moran", avatarUrl: getAvatarPlaceholder(0), avatarHint: 'man portrait' },
        priority: "Low",
        status: "Done",
        dueDate: "2024-07-30",
    },
    {
        id: "TASK-2345",
        title: "Update API documentation for v3",
        description: "Update the API documentation to reflect the changes in v3. The documentation should be clear and comprehensive.",
        assignee: { name: "David Chen", avatarUrl: getAvatarPlaceholder(2), avatarHint: 'man portrait professional' },
        priority: "Medium",
        status: "Todo",
        dueDate: "2024-09-01",
    },
    {
        id: "TASK-6789",
        title: "Research new email marketing platforms",
        description: "Research and compare new email marketing platforms. The goal is to find a platform that is more cost-effective and has better features.",
        assignee: { name: "Sarah Lee", avatarUrl: getAvatarPlaceholder(1), avatarHint: 'woman portrait' },
        priority: "Low",
        status: "Done",
        dueDate: "2024-08-20",
    },
    {
        id: "TASK-1122",
        title: "Create social media content calendar",
        description: "Create a content calendar for all social media channels for the next month. The calendar should include post ideas and a schedule.",
        assignee: { name: "Maria Rodriguez", avatarUrl: getAvatarPlaceholder(3), avatarHint: 'woman professional' },
        priority: "Medium",
        status: "Todo",
        dueDate: "2024-08-18",
    },
    {
        id: "TASK-3344",
        title: "A/B test new CTA buttons",
        description: "Run an A/B test on the new CTA buttons on the homepage. The goal is to see which button has a higher conversion rate.",
        assignee: { name: "Alex Moran", avatarUrl: getAvatarPlaceholder(0), avatarHint: 'man portrait' },
        priority: "High",
        status: "In Progress",
        dueDate: "2024-08-12",
    }
];
