import express from 'express';
import FamilyMember from '../models/FamilyMember.js';
import FamilyTree from '../models/FamilyTree.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all members for a specific tree
router.get('/tree/:treeId', authenticateToken, async (req, res) => {
  try {
    // Check if user has access to this tree
    const tree = await FamilyTree.findOne({
      _id: req.params.treeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!tree) {
      return res.status(404).json({ error: 'Family tree not found or access denied' });
    }

    const members = await FamilyMember.find({ treeId: req.params.treeId })
      .populate('father', 'firstName lastName')
      .populate('mother', 'firstName lastName')
      .populate('spouse', 'firstName lastName');

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching family members' });
  }
});

// Create new family member
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { treeId, ...memberData } = req.body;

    // Check if user has write access to this tree
    const tree = await FamilyTree.findOne({
      _id: treeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id, 'collaborators.permissions': { $in: ['write', 'admin'] } }
      ]
    });

    if (!tree) {
      return res.status(404).json({ error: 'Family tree not found or insufficient permissions' });
    }

    const member = new FamilyMember({
      treeId,
      ...memberData
    });

    await member.save();
    await member.populate(['father', 'mother', 'spouse']);

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Error creating family member' });
  }
});

// Update family member
router.put('/:memberId', authenticateToken, async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    // Check if user has write access to this tree
    const tree = await FamilyTree.findOne({
      _id: member.treeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id, 'collaborators.permissions': { $in: ['write', 'admin'] } }
      ]
    });

    if (!tree) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updatedMember = await FamilyMember.findByIdAndUpdate(
      req.params.memberId,
      req.body,
      { new: true }
    ).populate(['father', 'mother', 'spouse']);

    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: 'Error updating family member' });
  }
});

// Delete family member
router.delete('/:memberId', authenticateToken, async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    // Check if user has write access to this tree
    const tree = await FamilyTree.findOne({
      _id: member.treeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id, 'collaborators.permissions': { $in: ['write', 'admin'] } }
      ]
    });

    if (!tree) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Remove relationships
    await FamilyMember.updateMany(
      { $or: [{ father: member._id }, { mother: member._id }] },
      { $unset: { father: member._id, mother: member._id } }
    );

    await FamilyMember.updateMany(
      { spouse: member._id },
      { $pull: { spouse: member._id } }
    );

    await FamilyMember.findByIdAndDelete(req.params.memberId);

    res.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting family member' });
  }
});

export default router;