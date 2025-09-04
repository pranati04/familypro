import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TreeCard } from './TreeCard';
import { CreateTreeModal } from './CreateTreeModal';
import { treeAPI } from '../../services/api';
import { Plus, TreePine, LogOut } from 'lucide-react';

interface Tree {
  _id: string;
  name: string;
  description?: string;
  owner: { name: string; email: string };
  collaborators: Array<{ user: { name: string }; permissions: string }>;
  createdAt: string;
}

interface DashboardProps {
  onSelectTree: (treeId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTree }) => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    loadTrees();
  }, []);

  const loadTrees = async () => {
    try {
      const treesData = await treeAPI.getAllTrees();
      setTrees(treesData);
    } catch (err) {
      setError('Failed to load family trees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = async (treeData: { name: string; description?: string }) => {
    try {
      await treeAPI.createTree(treeData);
      setShowCreateModal(false);
      loadTrees();
    } catch (err) {
      setError('Failed to create family tree');
    }
  };

  const handleViewTree = (treeId: string) => {
    onSelectTree(treeId);
  };

  const handleEditTree = (treeId: string) => {
    // Navigate to tree management/editing view
    onSelectTree(treeId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <TreePine className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading your family trees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Family Tree</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Family Trees</h2>
            <p className="text-gray-600">Manage and explore your family history</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Tree</span>
          </button>
        </div>

        {trees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TreePine className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Family Trees Yet</h3>
            <p className="text-gray-600 mb-6">Create your first family tree to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Create Your First Tree
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map((tree) => (
              <TreeCard
                key={tree._id}
                tree={tree}
                onView={handleViewTree}
                onEdit={handleEditTree}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Tree Modal */}
      {showCreateModal && (
        <CreateTreeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTree}
        />
      )}
    </div>
  );
};