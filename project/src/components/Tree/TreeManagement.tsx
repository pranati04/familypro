import React, { useState } from 'react';
import { X, Users, Plus, Merge, Mail } from 'lucide-react';
import { treeAPI } from '../../services/api';

interface TreeManagementProps {
  tree: any;
  onClose: () => void;
  onUpdate: () => void;
}

export const TreeManagement: React.FC<TreeManagementProps> = ({
  tree,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'merge'>('collaborators');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<'read' | 'write' | 'admin'>('read');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await treeAPI.addCollaborator(tree.id, { email, permissions });
      setEmail('');
      setPermissions('read');
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Manage Tree</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'collaborators'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab('merge')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'merge'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Merge className="w-4 h-4 inline-block mr-2" />
            Merge Trees
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              {/* Add Collaborator Form */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Add Collaborator</h4>
                <form onSubmit={handleAddCollaborator} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter collaborator's email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permission Level
                    </label>
                    <select
                      value={permissions}
                      onChange={(e) => setPermissions(e.target.value as 'read' | 'write' | 'admin')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loading ? 'Adding...' : 'Add Collaborator'}</span>
                  </button>
                </form>
              </div>

              {/* Current Collaborators */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Current Access</h4>
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{tree.owner.name}</p>
                      <p className="text-sm text-gray-600">{tree.owner.email}</p>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Owner
                    </span>
                  </div>

                  {/* Collaborators */}
                  {tree.collaborators.map((collab: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{collab.user.name}</p>
                        <p className="text-sm text-gray-600">{collab.user.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        collab.permissions === 'admin' ? 'bg-purple-100 text-purple-600' :
                        collab.permissions === 'write' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {collab.permissions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'merge' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">Merge Trees</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    Tree merging allows you to combine family members from another tree into this one. 
                    This action will copy all members and their relationships while preserving the original tree.
                  </p>
                </div>
                
                <div className="text-center py-8">
                  <Merge className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Tree merging feature will be available in the next update
                  </p>
                  <p className="text-sm text-gray-500">
                    You'll be able to select another tree to merge with this one
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};