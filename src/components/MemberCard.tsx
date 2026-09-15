import React from 'react';
import { Member } from '../types';
import {
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';

export interface MemberCardProps {
  member: Member;
  spouses?: Member[];
  isRoot?: boolean;
  isHighlighted?: boolean;
  isSelected?: boolean;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  childrenCount?: number;
  fontSizeClass?: string;
  onSelect: (member: Member) => void;
  onToggleCollapse?: (memberId: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  spouses = [],
  isRoot = false,
  isHighlighted = false,
  isSelected = false,
  hasChildren = false,
  isCollapsed = false,
  childrenCount = 0,
  fontSizeClass = 'text-base',
  onSelect,
  onToggleCollapse
}) => {
  const isMale = member.gender === 'male';

  return (
    <div
      id={`member-card-${member.id}`}
      data-member-id={member.id}
      onClick={() => onSelect(member)}
      title="Bấm để xem hồ sơ và thông tin chi tiết"
      className={`group relative rounded-xl transition-all duration-200 shadow-md hover:shadow-xl bg-white select-none cursor-pointer flex flex-col justify-between ${
        isHighlighted
          ? 'border-4 border-[#8B2222] ring-4 ring-[#D4AF37]/60 bg-[#FFFDF9] scale-105 z-20'
          : isSelected
          ? 'border-4 border-[#8B2222] bg-[#FDFBF7] shadow-lg'
          : isRoot
          ? 'border-4 border-[#8B2222] bg-white'
          : 'border-2 border-[#E0D8CC] hover:border-[#8B2222]'
      } p-3.5`}
      style={{
        width: spouses.length > 0 ? 380 : 260,
        minHeight: 135
      }}
    >
      {/* Header: Generation Badge & Verification & Branch Collapse Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E0D8CC] gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
              isRoot || member.generation === 1
                ? 'bg-[#8B2222] text-white'
                : 'bg-[#5A5A40] text-white'
            }`}
          >
            {isRoot || member.generation === 1 ? 'Thủy Tổ - Đời 1' : `Đời ${member.generation}`}
          </span>

          {member.isAdopted && (
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200">
              Con nuôi
            </span>
          )}
        </div>

        {/* Clean Branch Collapse/Expand Toggle if member has children */}
        {hasChildren && onToggleCollapse && (
          <button
            type="button"
            id={`btn-toggle-branch-${member.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(member.id);
            }}
            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              isCollapsed
                ? 'bg-[#8B2222] text-white shadow-xs hover:bg-[#711616]'
                : 'bg-[#F5F2ED] text-[#5A5A40] hover:bg-[#E0D8CC]'
            }`}
            title={isCollapsed ? 'Mở rộng nhánh con cái' : 'Thu gọn nhánh con cái'}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Mở ({childrenCount})</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Thu gọn</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Content Area (Avatar + Member Details + Spouses) */}
      <div className="flex items-start gap-3 py-2 flex-1">
        {/* Main Member Avatar & Info */}
        <div className="flex-1 flex items-start gap-2.5 min-w-0">
          {/* Avatar Container */}
          <div
            className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 overflow-hidden ${
              member.avatar
                ? 'border-[#E0D8CC]'
                : isMale
                ? 'bg-[#F5F2ED] border-[#8B2222] text-[#8B2222]'
                : 'bg-[#FDF2F8] border-pink-500 text-pink-600'
            }`}
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl">
                {isRoot ? '👴' : isMale ? '👨' : '👩'}
              </span>
            )}
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <h4
              className={`font-serif font-bold text-[#2C2C2C] tracking-tight leading-snug group-hover:text-[#8B2222] transition-colors truncate ${fontSizeClass}`}
              title={member.fullName}
            >
              {member.fullName}
            </h4>

            {member.alias && (
              <p className="text-xs text-[#5A5A40] font-semibold truncate">
                ({member.alias})
              </p>
            )}

            {member.deathDate ? (
              <p className="text-xs text-[#8B2222] font-semibold mt-0.5 truncate">
                Mất: {member.deathDate}
              </p>
            ) : member.isAlive === false ? (
              <p className="text-xs text-[#8B2222] font-semibold mt-0.5 truncate">
                Đã mất
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-semibold mt-0.5 truncate">
                Còn sống
              </p>
            )}

            {member.birthDate && (
              <p className="text-[11px] text-[#7A7A7A] truncate">
                Sinh: {member.birthDate}
              </p>
            )}
          </div>
        </div>

        {/* Spouse Side Column if present */}
        {spouses.length > 0 && (
          <div className="w-[125px] pl-2.5 border-l border-dashed border-[#E0D8CC] flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
              <span>{spouses.length > 1 ? 'Các Hôn Phối' : 'Hôn Phối'}</span>
            </span>
            <div className="space-y-1">
              {spouses.map((sp) => (
                <div
                  key={sp.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(sp);
                  }}
                  className="text-xs text-[#2C2C2C] hover:text-[#8B2222] cursor-pointer py-0.5 truncate flex items-center gap-1"
                  title={`Xem hồ sơ: ${sp.fullName} ${sp.deathDate ? `(${sp.deathDate})` : ''}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600 inline-block flex-shrink-0"></span>
                  <span className="font-semibold truncate">{sp.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom Instruction Hint on Hover */}
      <div className="pt-1.5 border-t border-[#E0D8CC]/60 flex items-center justify-between text-[11px] text-[#5A5A40]">
        <span className="truncate">
          {member.branchName ? member.branchName : 'Dòng họ Đào'}
        </span>
        <span className="text-[#8B2222] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          Xem chi tiết →
        </span>
      </div>
    </div>
  );
};
