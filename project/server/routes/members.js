import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getTreeMembers, createMember, updateMember, deleteMember, hasTreeAccess, getMemberById } from '../services/memberService.js';

const router = express.Router();

// Get all members for a specific tree
router.get('/tree/:treeId', authenticateToken, async (req, res) => {
  try {
    const treeId = parseInt(req.params.treeId);
    
    // Check if user has access to this tree
    const hasAccess = await hasTreeAccess(treeId, req.user.id);
    if (!hasAccess) {
      return res.status(404).json({ error: 'Family tree not found or access denied' });
    }

    const members = await getTreeMembers(treeId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: 'Error fetching family members' });
  }
});

// Create new family member
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { treeId, ...memberData } = req.body;
    const treeIdNum = parseInt(treeId);

    if (isNaN(treeIdNum)) {
      return res.status(400).json({ error: 'Invalid tree ID' });
    }

    // Check if user has write access to this tree
    const hasAccess = await hasTreeAccess(treeIdNum, req.user.id, 'write');
    if (!hasAccess) {
      return res.status(404).json({ error: 'Family tree not found or insufficient permissions' });
    }

    const member = await createMember({
      treeId: treeIdNum,
      ...memberData
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Error creating family member' });
  }
});

// Update family member
router.put('/:memberId', authenticateToken, async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    if (isNaN(memberId)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }

    const member = await getMemberById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    // Check if user has write access to this tree
    const hasAccess = await hasTreeAccess(member.treeId, req.user.id, 'write');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updatedMember = await updateMember(memberId, req.body);
    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ error: 'Error updating family member' });
  }
});

// Delete family member
router.delete('/:memberId', authenticateToken, async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId);
    if (isNaN(memberId)) {
      return res.status(400).json({ error: 'Invalid member ID' });
    }

    const member = await getMemberById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    // Check if user has write access to this tree
    const hasAccess = await hasTreeAccess(member.treeId, req.user.id, 'write');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete the member (relationships will be handled by foreign key constraints)
    await deleteMember(memberId);

    res.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ error: 'Error deleting family member' });
  }
});

export default router;