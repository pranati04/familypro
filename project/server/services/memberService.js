import { db } from '../db.js';
import { familyMembers, familyTrees, treeCollaborators, spouseRelationships } from '../../shared/schema.js';
import { eq, or, and } from 'drizzle-orm';

export async function createMember(memberData) {
  const [member] = await db.insert(familyMembers).values(memberData).returning();
  return member;
}

export async function getTreeMembers(treeId) {
  const members = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.treeId, treeId));

  if (members.length === 0) return [];

  // Get spouse relationships for these members
  const memberIds = members.map(m => m.id);
  const { inArray } = await import('drizzle-orm');
  const spouseRels = await db
    .select()
    .from(spouseRelationships)
    .where(
      or(
        inArray(spouseRelationships.member1Id, memberIds),
        inArray(spouseRelationships.member2Id, memberIds)
      )
    );

  // Enhance members with relationships
  return members.map(member => ({
    ...member,
    father: member.fatherId,
    mother: member.motherId,
    spouses: spouseRels
      .filter(rel => rel.member1Id === member.id || rel.member2Id === member.id)
      .map(rel => rel.member1Id === member.id ? rel.member2Id : rel.member1Id)
  }));
}

export async function getMemberById(memberId) {
  const [member] = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.id, memberId));
  return member;
}

export async function updateMember(memberId, memberData) {
  const [member] = await db
    .update(familyMembers)
    .set(memberData)
    .where(eq(familyMembers.id, memberId))
    .returning();
  return member;
}

export async function deleteMember(memberId) {
  await db.delete(familyMembers).where(eq(familyMembers.id, memberId));
  return true;
}

export async function hasTreeAccess(treeId, userId, requiredPermission = 'read') {
  // Check if user is owner
  const [tree] = await db
    .select()
    .from(familyTrees)
    .where(and(eq(familyTrees.id, treeId), eq(familyTrees.ownerId, userId)));

  if (tree) return true;

  // Check if user is collaborator with required permission
  if (requiredPermission === 'read') {
    const [collaboration] = await db
      .select()
      .from(treeCollaborators)
      .where(and(eq(treeCollaborators.treeId, treeId), eq(treeCollaborators.userId, userId)));
    return !!collaboration;
  }

  // For write/admin permissions, check specific permission level
  const [collaboration] = await db
    .select()
    .from(treeCollaborators)
    .where(
      and(
        eq(treeCollaborators.treeId, treeId),
        eq(treeCollaborators.userId, userId),
        or(
          eq(treeCollaborators.permission, 'write'),
          eq(treeCollaborators.permission, 'admin')
        )
      )
    );

  return !!collaboration;
}