import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createTree, getUserTrees, getTreeById, addCollaborator, mergeTrees } from '../services/treeService.js';
import { findUserByEmail } from '../services/userService.js';

const router = express.Router();

// Get all trees for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trees = await getUserTrees(req.user.id);
    res.json(trees);
  } catch (error) {
    console.error('Error fetching family trees:', error);
    res.status(500).json({ error: 'Error fetching family trees' });
  }
});

// Create new family tree
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const tree = await createTree({ name, description }, req.user.id);
    
    res.status(201).json(tree);
  } catch (error) {
    console.error('Error creating family tree:', error);
    res.status(500).json({ error: 'Error creating family tree' });
  }
});

// Get specific tree
router.get('/:treeId', authenticateToken, async (req, res) => {
  try {
    const treeId = parseInt(req.params.treeId);
    if (isNaN(treeId)) {
      return res.status(400).json({ error: 'Invalid tree ID' });
    }

    const tree = await getTreeById(treeId, req.user.id);
    if (!tree) {
      return res.status(404).json({ error: 'Family tree not found' });
    }

    res.json(tree);
  } catch (error) {
    console.error('Error fetching family tree:', error);
    res.status(500).json({ error: 'Error fetching family tree' });
  }
});

// Add collaborator to tree
router.post('/:treeId/collaborators', authenticateToken, async (req, res) => {
  try {
    const treeId = parseInt(req.params.treeId);
    const { email, permissions = 'read' } = req.body;
    
    if (isNaN(treeId)) {
      return res.status(400).json({ error: 'Invalid tree ID' });
    }

    // Check if user owns this tree
    const tree = await getTreeById(treeId, req.user.id);
    if (!tree || !tree.isOwner) {
      return res.status(404).json({ error: 'Family tree not found or insufficient permissions' });
    }

    const collaborator = await findUserByEmail(email);
    if (!collaborator) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    // Add collaborator
    const collaboration = await addCollaborator(treeId, collaborator.id, permissions);
    
    res.json({ message: 'Collaborator added successfully', collaboration });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: 'Error adding collaborator' });
  }
});

// Merge trees implementation
router.post('/:treeId/merge/:sourceTreeId', authenticateToken, async (req, res) => {
  try {
    const treeId = parseInt(req.params.treeId);
    const sourceTreeId = parseInt(req.params.sourceTreeId);
    
    if (isNaN(treeId) || isNaN(sourceTreeId)) {
      return res.status(400).json({ error: 'Invalid tree IDs' });
    }

    if (treeId === sourceTreeId) {
      return res.status(400).json({ error: 'Cannot merge a tree with itself' });
    }

    const result = await mergeTrees(treeId, sourceTreeId, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error merging trees:', error);
    res.status(500).json({ error: error.message || 'Error merging trees' });
  }
});

export default router;