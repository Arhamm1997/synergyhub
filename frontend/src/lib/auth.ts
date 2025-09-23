import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

export async function auth() {
    const session = await getServerSession(authOptions);
    return session;
}

export async function getCurrentUser() {
    const session = await auth();
    return session?.user;
}