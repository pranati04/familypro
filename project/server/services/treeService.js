import { db } from '../db.js';
import { familyTrees, treeCollaborators, users } from '../../shared/schema.js';
import { eq, or, and } from 'drizzle-orm';

export async function createTree(treeData, ownerId) {
  const [tree] = await db.insert(familyTrees).values({
    ...treeData,
    ownerId,
  }).returning();
  return tree;
}

export async function getUserTrees(userId) {
  // Get trees owned by user or where user is a collaborator
  const ownedTrees = await db
    .select()
    .from(familyTrees)
    .leftJoin(users, eq(familyTrees.ownerId, users.id))
    .where(eq(familyTrees.ownerId, userId));

  const collaboratedTrees = await db
    .select({
      tree: familyTrees,
      owner: users,
      collaboration: treeCollaborators
    })
    .from(treeCollaborators)
    .leftJoin(familyTrees, eq(treeCollaborators.treeId, familyTrees.id))
    .leftJoin(users, eq(familyTrees.ownerId, users.id))
    .where(eq(treeCollaborators.userId, userId));

  // Combine and format results
  const allTrees = [
    ...ownedTrees.map(result => ({
      ...result.family_trees,
      owner: result.users,
      isOwner: true
    })),
    ...collaboratedTrees.map(result => ({
      ...result.tree,
      owner: result.owner,
      isOwner: false,
      permission: result.collaboration.permission
    }))
  ];

  return allTrees;
}

export async function getTreeById(treeId, userId) {
  // First check if user is owner
  const [ownedTree] = await db
    .select()
    .from(familyTrees)
    .leftJoin(users, eq(familyTrees.ownerId, users.id))
    .where(
      and(
        eq(familyTrees.id, treeId),
        eq(familyTrees.ownerId, userId)
      )
    );

  if (ownedTree) {
    return {
      ...ownedTree.family_trees,
      owner: ownedTree.users,
      isOwner: true
    };
  }

  // Check if user is collaborator
  const [collaboratedTree] = await db
    .select()
    .from(familyTrees)
    .leftJoin(users, eq(familyTrees.ownerId, users.id))
    .leftJoin(treeCollaborators, eq(treeCollaborators.treeId, familyTrees.id))
    .where(
      and(
        eq(familyTrees.id, treeId),
        eq(treeCollaborators.userId, userId)
      )
    );

  if (collaboratedTree) {
    return {
      ...collaboratedTree.family_trees,
      owner: collaboratedTree.users,
      isOwner: false,
      permission: collaboratedTree.tree_collaborators?.permission
    };
  }

  return null;
}

export async function addCollaborator(treeId, userId, permission = 'read') {
  const [collaboration] = await db.insert(treeCollaborators).values({
    treeId,
    userId,
    permission
  }).returning();
  return collaboration;
}