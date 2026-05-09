export class CreateUserDto {
  name!: string;
  role!: 'admin' | 'manager' | 'cashier';
  pin!: string;
  shift?: string;
}

export class UpdateUserDto {
  status?: 'Active' | 'Inactive';
  role?: string;
  shift?: string;
}
