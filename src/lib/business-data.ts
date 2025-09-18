
import type { Business } from "@/lib/types";
import { initialMembers } from "@/lib/member-data";

export const initialBusinesses: Business[] = [
    {
        id: "BIZ-001",
        name: "Sunrise Cafe",
        owner: initialMembers[0],
        phone: "123-456-7890",
        type: "Restaurant",
        status: "Active",
        notes: "Popular breakfast spot. Considering a new loyalty program.",
    },
    {
        id: "BIZ-002",
        name: "Innovate Web",
        owner: initialMembers[1],
        phone: "098-765-4321",
        type: "Web Development",
        status: "Active",
        notes: "Specializes in React and Next.js applications.",
    },
    {
        id: "BIZ-003",
        name: "The Book Nook",
        owner: initialMembers[2],
        phone: "555-123-4567",
        type: "Retail",
        status: "Lead",
        notes: "Independent bookstore looking to build an online presence.",
    },
    {
        id: "BIZ-004",
        name: "GreenLeaf Landscaping",
        owner: initialMembers[3],
        phone: "555-987-6543",
        type: "Service",
        status: "Inactive",
        notes: "Seasonal business, currently in off-season.",
    }
];
