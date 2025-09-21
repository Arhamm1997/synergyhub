
import type { Member } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

export const initialMembers: Member[] = [
  {
    id: "1",
    name: "Alex Moran",
    role: "Team Lead",
    department: "Engineering",
    email: "alex.moran@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint!,
    details: "Manages the frontend and backend development teams. Expert in React and Node.js.",
  },
  {
    id: "2",
    name: "Sarah Lee",
    role: "UX/UI Designer",
    department: "Design",
    email: "sarah.lee@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint!,
    details: "Leads the design team and is responsible for the overall user experience.",
  },
  {
    id: "3",
    name: "David Chen",
    role: "Frontend Developer",
    department: "Engineering",
    email: "david.chen@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint!,
  },
  {
    id: "4",
    name: "Maria Rodriguez",
    role: "Marketing Manager",
    department: "Marketing",
    email: "maria.r@example.com",
    avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!,
    avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint!,
  },
];
