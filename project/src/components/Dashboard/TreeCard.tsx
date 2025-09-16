import React from 'react';
import { TreePine, Users, Eye, Edit3 } from 'lucide-react';

interface TreeCardProps {
  tree: {
    id: string;
    name: string;
    description?: string;
    owner: { name: string; email: string };
    collaborators: Array<{ user: { name: string }; permissions: string }>;
    createdAt: string;
  };
  onView: (treeId: string) => void;
  onEdit: (treeId: string) => void;
}

export const TreeCard: React.FC<TreeCardProps> = ({ tree, onView, onEdit }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
              <TreePine className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                {tree.name}
              </h3>
              <p className="text-sm text-gray-500">by {tree.owner.name}</p>
            </div>
          </div>
        </div>

        {tree.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tree.description}</p>
        )}

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{tree.collaborators.length + 1} member{tree.collaborators.length !== 0 ? 's' : ''}</span>
          </div>
          <div>
            Created {formatDate(tree.createdAt)}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onView(tree.id)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Tree</span>
          </button>
          <button
            onClick={() => onEdit(tree.id)}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};