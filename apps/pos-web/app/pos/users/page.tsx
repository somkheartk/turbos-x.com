import { getUsers } from '../_lib';
import { UsersClient } from './_components/users-client';

export const dynamic = 'force-dynamic';

export default async function PosUsersPage() {
  const data = await getUsers().catch(() => ({ users: [] as Awaited<ReturnType<typeof getUsers>>['users'] }));
  return <UsersClient users={data.users} />;
}
