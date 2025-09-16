import React from 'react';
import { Edit3, Trash2, User } from 'lucide-react';

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
}

interface MemberNodeProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
}

export const MemberNode: React.FC<MemberNodeProps> = ({ member, onEdit, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 border-blue-200';
      case 'female': return 'bg-pink-100 border-pink-200';
      default: return 'bg-purple-100 border-purple-200';
    }
  };

  const getGenderIconColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'text-blue-600';
      case 'female': return 'text-pink-600';
      default: return 'text-purple-600';
    }
  };

  return (
    <div className={`relative bg-white rounded-xl border-2 ${getGenderColor(member.gender)} p-4 hover:shadow-lg transition-all duration-300 group w-64`}>
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
        <button
          onClick={() => onEdit(member)}
          className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Profile Image or Icon */}
      <div className="text-center mb-3">
        {member.photo ? (
          <img
            src={member.photo}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-16 h-16 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className={`w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center`}>
            <User className={`w-8 h-8 ${getGenderIconColor(member.gender)}`} />
          </div>
        )}
      </div>

      {/* Member Info */}
      <div className="text-center space-y-1">
        <h3 className="font-semibold text-gray-800">
          {member.firstName} {member.middleName && `${member.middleName} `}{member.lastName}
        </h3>
        
        <div className="text-xs text-gray-600">
          {member.birthDate && (
            <span>
              {formatDate(member.birthDate)}
              {member.deathDate && ` - ${formatDate(member.deathDate)}`}
            </span>
          )}
        </div>

        {/* Relationships */}
        <div className="text-xs text-gray-500 space-y-1 mt-2">
          {member.father && (
            <div>Father: {member.father.firstName} {member.father.lastName}</div>
          )}
          {member.mother && (
            <div>Mother: {member.mother.firstName} {member.mother.lastName}</div>
          )}
          {member.spouse.length > 0 && (
            <div>
              Spouse: {member.spouse.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
            </div>
          )}
        </div>

        {/* Biography Preview */}
        {member.biography && (
          <div className="text-xs text-gray-600 mt-2 line-clamp-2">
            {member.biography}
          </div>
        )}
      </div>
    </div>
  );
};