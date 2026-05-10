import { getPosUsers } from '../_lib/pos-api';
import { UsersClient } from './_components/users-client';

export const dynamic = 'force-dynamic';

export default async function PosUsersPage() {
  const data = await getPosUsers();
  return <UsersClient users={data.users} />;
}
