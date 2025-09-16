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

export async function mergeTrees(targetTreeId, sourceTreeId, userId) {
  // Begin transaction to ensure data integrity
  return await db.transaction(async (tx) => {
    // 1. Verify user has admin access to target tree
    const targetTree = await getTreeById(targetTreeId, userId);
    if (!targetTree || (!targetTree.isOwner && targetTree.permission !== 'admin')) {
      throw new Error('Insufficient permissions to merge into target tree');
    }

    // 2. Verify user has read access to source tree
    const sourceTree = await getTreeById(sourceTreeId, userId);
    if (!sourceTree) {
      throw new Error('Source tree not found or access denied');
    }

    // 3. Get all members from source tree
    const { familyMembers, spouseRelationships } = await import('../../shared/schema.js');
    const sourceMembers = await tx
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.treeId, sourceTreeId));

    if (sourceMembers.length === 0) {
      return { message: 'Source tree has no members to merge', mergedCount: 0 };
    }

    // 4. Get spouse relationships from source tree
    const { inArray } = await import('drizzle-orm');
    const sourceMemberIds = sourceMembers.map(m => m.id);
    const sourceSpouseRelationships = await tx
      .select()
      .from(spouseRelationships)
      .where(
        or(
          inArray(spouseRelationships.member1Id, sourceMemberIds),
          inArray(spouseRelationships.member2Id, sourceMemberIds)
        )
      );

    // 5. Create ID mapping for relationship updates
    const idMapping = new Map();

    // 6. Insert members into target tree and build ID mapping
    for (const member of sourceMembers) {
      const memberData = {
        ...member,
        treeId: targetTreeId,
        // Don't copy relationships yet - we'll update them after all members are created
        fatherId: null,
        motherId: null
      };
      delete memberData.id; // Let database generate new ID

      const [newMember] = await tx
        .insert(familyMembers)
        .values(memberData)
        .returning();

      idMapping.set(member.id, newMember.id);
    }

    // 7. Update family relationships with new IDs
    for (const member of sourceMembers) {
      const newMemberId = idMapping.get(member.id);
      const updateData = {};

      if (member.fatherId && idMapping.has(member.fatherId)) {
        updateData.fatherId = idMapping.get(member.fatherId);
      }
      if (member.motherId && idMapping.has(member.motherId)) {
        updateData.motherId = idMapping.get(member.motherId);
      }

      if (Object.keys(updateData).length > 0) {
        await tx
          .update(familyMembers)
          .set(updateData)
          .where(eq(familyMembers.id, newMemberId));
      }
    }

    // 8. Create spouse relationships with new IDs
    for (const spouseRel of sourceSpouseRelationships) {
      const newMember1Id = idMapping.get(spouseRel.member1Id);
      const newMember2Id = idMapping.get(spouseRel.member2Id);

      if (newMember1Id && newMember2Id) {
        await tx.insert(spouseRelationships).values({
          member1Id: newMember1Id,
          member2Id: newMember2Id
        });
      }
    }

    return {
      message: 'Trees merged successfully',
      mergedCount: sourceMembers.length,
      sourceTree: sourceTree.name,
      targetTree: targetTree.name
    };
  });
}