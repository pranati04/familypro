import { pgTable, serial, text, timestamp, boolean, integer, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const permissionEnum = pgEnum('permission', ['read', 'write', 'admin']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Family trees table
export const familyTrees = pgTable('family_trees', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tree collaborators junction table
export const treeCollaborators = pgTable('tree_collaborators', {
  id: serial('id').primaryKey(),
  treeId: integer('tree_id').notNull().references(() => familyTrees.id),
  userId: integer('user_id').notNull().references(() => users.id),
  permission: permissionEnum('permission').default('read'),
});

// Family members table
export const familyMembers = pgTable('family_members', {
  id: serial('id').primaryKey(),
  treeId: integer('tree_id').notNull().references(() => familyTrees.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  middleName: text('middle_name'),
  birthDate: timestamp('birth_date'),
  deathDate: timestamp('death_date'),
  gender: genderEnum('gender').notNull(),
  photo: text('photo'),
  biography: text('biography'),
  fatherId: integer('father_id').references(() => familyMembers.id),
  motherId: integer('mother_id').references(() => familyMembers.id),
  positionX: integer('position_x').default(0),
  positionY: integer('position_y').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Spouse relationships junction table (many-to-many)
export const spouseRelationships = pgTable('spouse_relationships', {
  id: serial('id').primaryKey(),
  member1Id: integer('member1_id').notNull().references(() => familyMembers.id),
  member2Id: integer('member2_id').notNull().references(() => familyMembers.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedTrees: many(familyTrees),
  collaborations: many(treeCollaborators),
}));

export const familyTreesRelations = relations(familyTrees, ({ one, many }) => ({
  owner: one(users, { fields: [familyTrees.ownerId], references: [users.id] }),
  collaborators: many(treeCollaborators),
  members: many(familyMembers),
}));

export const treeCollaboratorsRelations = relations(treeCollaborators, ({ one }) => ({
  tree: one(familyTrees, { fields: [treeCollaborators.treeId], references: [familyTrees.id] }),
  user: one(users, { fields: [treeCollaborators.userId], references: [users.id] }),
}));

export const familyMembersRelations = relations(familyMembers, ({ one, many }) => ({
  tree: one(familyTrees, { fields: [familyMembers.treeId], references: [familyTrees.id] }),
  father: one(familyMembers, { fields: [familyMembers.fatherId], references: [familyMembers.id] }),
  mother: one(familyMembers, { fields: [familyMembers.motherId], references: [familyMembers.id] }),
  children: many(familyMembers),
  spouseRelationships1: many(spouseRelationships, { relationName: 'member1' }),
  spouseRelationships2: many(spouseRelationships, { relationName: 'member2' }),
}));

export const spouseRelationshipsRelations = relations(spouseRelationships, ({ one }) => ({
  member1: one(familyMembers, { 
    fields: [spouseRelationships.member1Id], 
    references: [familyMembers.id],
    relationName: 'member1'
  }),
  member2: one(familyMembers, { 
    fields: [spouseRelationships.member2Id], 
    references: [familyMembers.id],
    relationName: 'member2'
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type FamilyTree = typeof familyTrees.$inferSelect;
export type InsertFamilyTree = typeof familyTrees.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;
export type TreeCollaborator = typeof treeCollaborators.$inferSelect;
export type InsertTreeCollaborator = typeof treeCollaborators.$inferInsert;