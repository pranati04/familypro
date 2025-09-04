import React, { useState, useEffect } from 'react';
import { TreeVisualization } from './TreeVisualization';
import { MemberForm } from './MemberForm';
import { TreeManagement } from './TreeManagement';
import { memberAPI, treeAPI } from '../../services/api';
import { Plus, Settings, ArrowLeft, Users } from 'lucide-react';

interface FamilyMember {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  biography?: string;
  father?: FamilyMember;
  mother?: FamilyMember;
  spouse: FamilyMember[];
  position: { x: number; y: number };
}

interface TreeViewProps {
  treeId: string;
  onBack: () => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ treeId, onBack }) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTreeData();
  }, [treeId]);

  const loadTreeData = async () => {
    try {
      const [treeData, membersData] = await Promise.all([
        treeAPI.getTree(treeId),
        memberAPI.getTreeMembers(treeId)
      ]);
      
      setTree(treeData);
      setMembers(membersData);
    } catch (err) {
      setError('Failed to load tree data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData: any) => {
    try {
      await memberAPI.createMember({ ...memberData, treeId });
      setShowMemberForm(false);
      setSelectedMember(null);
      loadTreeData();
    } catch (err) {
      setError('Failed to add family member');
    }
  };

  const handleUpdateMember = async (memberData: any) => {
    try {
      if (selectedMember) {
        await memberAPI.updateMember(selectedMember._id, memberData);
        setShowMemberForm(false);
        setSelectedMember(null);
        loadTreeData();
      }
    } catch (err) {
      setError('Failed to update family member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await memberAPI.deleteMember(memberId);
      loadTreeData();
    } catch (err) {
      setError('Failed to delete family member');
    }
  };

  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowMemberForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Users className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading family tree...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{tree?.name}</h1>
                <p className="text-sm text-gray-600">{tree?.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMemberForm(true)}
                className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
              <button
                onClick={() => setShowManagement(true)}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Tree Visualization */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TreeVisualization
          members={members}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
        />
      </main>

      {/* Member Form Modal */}
      {showMemberForm && (
        <MemberForm
          member={selectedMember}
          members={members}
          onClose={() => {
            setShowMemberForm(false);
            setSelectedMember(null);
          }}
          onSave={selectedMember ? handleUpdateMember : handleAddMember}
        />
      )}

      {/* Tree Management Modal */}
      {showManagement && tree && (
        <TreeManagement
          tree={tree}
          onClose={() => setShowManagement(false)}
          onUpdate={loadTreeData}
        />
      )}
    </div>
  );
};