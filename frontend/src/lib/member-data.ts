import type { Member } from '@/lib/types';

export const initialMembers: Member[] = [
    {
        id: 'MEMBER-1001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'Admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&q=70&crop=face&fit=crop',
        joinedAt: new Date('2024-01-15'),
        lastActive: new Date(),
        department: 'Management',
        phone: '+1-555-0123',
        businessId: 'default-business'
    },
    {
        id: 'MEMBER-1002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        role: 'Member',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9c72706?w=32&h=32&q=70&crop=face&fit=crop',
        joinedAt: new Date('2024-02-10'),
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        department: 'Development',
        phone: '+1-555-0124',
        businessId: 'default-business'
    },
    {
        id: 'MEMBER-1003',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        role: 'Member',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&q=70&crop=face&fit=crop',
        joinedAt: new Date('2024-01-20'),
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        department: 'Design',
        phone: '+1-555-0125',
        businessId: 'default-business'
    },
    {
        id: 'MEMBER-1004',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        role: 'Client',
        status: 'inactive',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&q=70&crop=face&fit=crop',
        joinedAt: new Date('2024-03-01'),
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        department: 'Client Services',
        phone: '+1-555-0126',
        businessId: 'default-business'
    },
    {
        id: 'MEMBER-1005',
        name: 'David Brown',
        email: 'david.brown@company.com',
        role: 'Member',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&q=70&crop=face&fit=crop',
        joinedAt: new Date('2024-02-15'),
        lastActive: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        department: 'Marketing',
        phone: '+1-555-0127',
        businessId: 'default-business'
    },
    {
        id: 'MEMBER-1006',
        name: 'Lisa Chen',
        email: 'lisa.chen@company.com',
        role: 'Member',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&q=70&crop=face&fit=crop',
        joinedAt: new Date('2024-03-05'),
        lastActive: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        department: 'Operations',
        phone: '+1-555-0128',
        businessId: 'default-business'
    }
];