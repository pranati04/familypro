import express from 'express';
import FamilyTree from '../models/FamilyTree.js';
import FamilyMember from '../models/FamilyMember.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all trees for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trees = await FamilyTree.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');

    res.json(trees);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching family trees' });
  }
});

// Create new family tree
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const tree = new FamilyTree({
      name,
      description,
      owner: req.user._id
    });
    
    await tree.save();
    await tree.populate('owner', 'name email');
    
    res.status(201).json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Error creating family tree' });
  }
});

// Get specific tree
router.get('/:treeId', authenticateToken, async (req, res) => {
  try {
    const tree = await FamilyTree.findOne({
      _id: req.params.treeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');

    if (!tree) {
      return res.status(404).json({ error: 'Family tree not found' });
    }

    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching family tree' });
  }
});

// Add collaborator to tree
router.post('/:treeId/collaborators', authenticateToken, async (req, res) => {
  try {
    const { email, permissions = 'read' } = req.body;
    
    const tree = await FamilyTree.findOne({
      _id: req.params.treeId,
      owner: req.user._id
    });

    if (!tree) {
      return res.status(404).json({ error: 'Family tree not found or insufficient permissions' });
    }

    const User = (await import('../models/User.js')).default;
    const collaborator = await User.findOne({ email });
    
    if (!collaborator) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    // Check if already a collaborator
    const isCollaborator = tree.collaborators.some(
      collab => collab.user.toString() === collaborator._id.toString()
    );

    if (isCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    tree.collaborators.push({
      user: collaborator._id,
      permissions
    });

    await tree.save();
    await tree.populate('collaborators.user', 'name email');
    
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Error adding collaborator' });
  }
});

// Merge trees
router.post('/:treeId/merge/:sourceTreeId', authenticateToken, async (req, res) => {
  try {
    const { treeId, sourceTreeId } = req.params;
    
    // Get both trees
    const targetTree = await FamilyTree.findOne({
      _id: treeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id, 'collaborators.permissions': { $in: ['write', 'admin'] } }
      ]
    });

    const sourceTree = await FamilyTree.findOne({
      _id: sourceTreeId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!targetTree || !sourceTree) {
      return res.status(404).json({ error: 'Trees not found or insufficient permissions' });
    }

    // Get all members from source tree
    const sourceMembers = await FamilyMember.find({ treeId: sourceTreeId });
    
    // Create mapping for old IDs to new IDs
    const idMapping = {};
    
    // Create new members in target tree
    for (const member of sourceMembers) {
      const newMember = new FamilyMember({
        ...member.toObject(),
        _id: undefined,
        treeId: treeId,
        father: null, // Will be updated after all members are created
        mother: null,
        spouse: []
      });
      
      await newMember.save();
      idMapping[member._id.toString()] = newMember._id;
    }

    // Update relationships with new IDs
    for (const member of sourceMembers) {
      const newMemberId = idMapping[member._id.toString()];
      const updateData = {};

      if (member.father && idMapping[member.father.toString()]) {
        updateData.father = idMapping[member.father.toString()];
      }
      if (member.mother && idMapping[member.mother.toString()]) {
        updateData.mother = idMapping[member.mother.toString()];
      }
      if (member.spouse && member.spouse.length > 0) {
        updateData.spouse = member.spouse
          .map(spouseId => idMapping[spouseId.toString()])
          .filter(Boolean);
      }

      if (Object.keys(updateData).length > 0) {
        await FamilyMember.findByIdAndUpdate(newMemberId, updateData);
      }
    }

    res.json({ message: 'Trees merged successfully', mergedMembersCount: sourceMembers.length });
  } catch (error) {
    res.status(500).json({ error: 'Error merging trees' });
  }
});

export default router;