import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function comparePassword(candidatePassword, hashedPassword) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
}

export async function createUser(userData) {
  const hashedPassword = await hashPassword(userData.password);
  const [user] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  }).returning();
  return user;
}

export async function findUserByEmail(email) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function findUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}