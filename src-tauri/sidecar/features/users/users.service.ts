import db from '../../db';
import type { CreateUserDto, User } from './users.schema';

export function getUsers(): User[] {
  return db.query<User, []>('SELECT * FROM users ORDER BY id DESC').all();
}

export function createUser(data: CreateUserDto): User {
  return db
    .query<User, { $name: string; $email: string }>(
      'INSERT INTO users (name, email) VALUES ($name, $email) RETURNING *',
    )
    .get({ $name: data.name, $email: data.email })!;
}
