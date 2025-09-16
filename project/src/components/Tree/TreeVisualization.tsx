import React from 'react';
import { MemberNode } from './MemberNode';

interface FamilyMember {
  id: string;
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

interface TreeVisualizationProps {
  members: FamilyMember[];
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  members,
  onEditMember,
  onDeleteMember
}) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L12 4L3 7V9H5V21H8V14H16V21H19V9H21Z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Family Members Yet</h3>
        <p className="text-gray-600">Start building your family tree by adding the first family member</p>
      </div>
    );
  }

  // Simple grid layout for now - in a real app, you'd implement a proper tree layout algorithm
  const organizeMembers = () => {
    const generations: { [key: number]: FamilyMember[] } = {};
    
    members.forEach(member => {
      const generation = calculateGeneration(member);
      if (!generations[generation]) {
        generations[generation] = [];
      }
      generations[generation].push(member);
    });

    return generations;
  };

  const calculateGeneration = (member: FamilyMember): number => {
    if (!member.father && !member.mother) {
      return 0; // Root generation
    }
    
    const fatherGen = member.father ? calculateGeneration(member.father) : -1;
    const motherGen = member.mother ? calculateGeneration(member.mother) : -1;
    
    return Math.max(fatherGen, motherGen) + 1;
  };

  const generations = organizeMembers();
  const generationKeys = Object.keys(generations).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-12">
        {generationKeys.map(genKey => (
          <div key={genKey} className="space-y-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {genKey === 0 ? 'Root Generation' : `Generation ${genKey + 1}`}
              </h4>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {generations[genKey].map(member => (
                <MemberNode
                  key={member.id}
                  member={member}
                  onEdit={onEditMember}
                  onDelete={onDeleteMember}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};