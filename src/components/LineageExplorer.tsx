import React, { useState } from 'react';
import { Member } from '../types';
import { getChildren, getSpouses, getMemberById } from '../utils/genealogyUtils';
import {
  GitFork,
  User,
  Users,
  ChevronRight,
  Search,
  Eye,
  GitBranch,
  ArrowDown
} from 'lucide-react';

interface LineageExplorerProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  onViewDescendants: (member: Member) => void;
  onFocusOnTree: (member: Member) => void;
  fontSizeClass?: string;
}

export const LineageExplorer: React.FC<LineageExplorerProps> = ({
  members,
  onSelectMember,
  onViewDescendants,
  onFocusOnTree,
  fontSizeClass = 'text-base'
}) => {
  const rootAncestor = members.find((m) => m.generation === 1 && m.gender === 'male') || members[0];
  const [selectedPath, setSelectedPath] = useState<string[]>([rootAncestor?.id || '']);

  const levels = React.useMemo(() => {
    const result: { level: number; members: Member[]; activeId: string | null }[] = [];

    const gen1Members = members.filter((m) => m.generation === 1);
    const activeGen1Id = selectedPath[0] || (gen1Members[0]?.id ?? null);
    result.push({ level: 1, members: gen1Members, activeId: activeGen1Id });

    for (let i = 0; i < selectedPath.length; i++) {
      const currentParentId = selectedPath[i];
      if (!currentParentId) break;

      const parent = getMemberById(members, currentParentId);
      if (!parent) break;

      const children = getChildren(members, parent);
      if (children.length > 0) {
        const nextActiveId = selectedPath[i + 1] || null;
        result.push({
          level: i + 2,
          members: children,
          activeId: nextActiveId
        });
      } else {
        break;
      }
    }

    return result;
  }, [members, selectedPath]);

  const handleSelectAtLevel = (levelIndex: number, memberId: string) => {
    const newPath = selectedPath.slice(0, levelIndex);
    newPath.push(memberId);
    setSelectedPath(newPath);
  };

  const currentSelectedMember = selectedPath.length > 0
    ? getMemberById(members, selectedPath[selectedPath.length - 1])
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="bg-[#8B2222] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
            <GitFork className="w-4 h-4 text-amber-300" />
            <span>Tra Cứu Theo Dòng Gia Phả</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
            Theo Dõi Dòng Tộc Từng Thế Hệ
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Chọn thành viên từ Đời 1 để theo dõi từng thế hệ con cháu nối tiếp từ trên xuống dưới một cách trực quan.
          </p>
        </div>

        {currentSelectedMember && (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-amber-200 block font-semibold">Đang chọn:</span>
              <span className="font-bold text-white text-base">
                {currentSelectedMember.fullName} (Đời {currentSelectedMember.generation})
              </span>
            </div>
            <button
              id="btn-lineage-view-descendants"
              onClick={() => onViewDescendants(currentSelectedMember)}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#B8962E] text-[#4A3700] font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <GitBranch className="w-4 h-4" />
              <span>Xem Con Cháu</span>
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb Path Banner */}
      <div className="bg-white border border-[#E0D8CC] rounded-xl p-4 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] block mb-2">
          Dòng Dõi Đang Chọn:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-[#2C2C2C]">
          {selectedPath.map((id, idx) => {
            const m = getMemberById(members, id);
            if (!m) return null;
            return (
              <React.Fragment key={id}>
                <button
                  onClick={() => setSelectedPath(selectedPath.slice(0, idx + 1))}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    idx === selectedPath.length - 1
                      ? 'bg-[#8B2222] text-white border-[#8B2222] shadow-xs'
                      : 'bg-[#FDFBF7] hover:bg-[#F5F2ED] text-[#2C2C2C] border-[#E0D8CC]'
                  }`}
                >
                  {m.fullName} <span className="text-xs opacity-80">(Đời {m.generation})</span>
                </button>
                {idx < selectedPath.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-[#7A7A7A] font-bold" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Generational Levels */}
      <div className="space-y-6">
        {levels.map((lvl, lvlIdx) => (
          <div
            key={`level-${lvl.level}`}
            className="bg-[#FDFBF7] border-2 border-[#E0D8CC] rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
          >
            {/* Level Label */}
            <div className="flex items-center justify-between border-b border-[#E0D8CC] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#8B2222] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {lvl.level}
                </span>
                <h3 className="text-lg font-bold text-[#2C2C2C] font-serif">
                  Đời Thứ {lvl.level}{' '}
                  <span className="text-xs font-normal text-[#5A5A40]">
                    ({lvl.members.length} thành viên ở nhánh này)
                  </span>
                </h3>
              </div>

              <span className="text-xs font-semibold text-[#5A5A40]">
                Nhấn vào thành viên để mở thế hệ tiếp theo ↓
              </span>
            </div>

            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
              {lvl.members.map((m) => {
                const isActive = lvl.activeId === m.id;
                const children = getChildren(members, m);
                const spouses = getSpouses(members, m);
                const isMale = m.gender === 'male';

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectAtLevel(lvlIdx, m.id)}
                    className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all shadow-sm flex flex-col justify-between ${
                      isActive
                        ? 'border-[#8B2222] bg-white ring-4 ring-[#8B2222]/20 shadow-md scale-[1.02]'
                        : 'border-[#E0D8CC] bg-white hover:border-[#8B2222] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between text-xs pb-1.5 mb-1.5 border-b border-[#E0D8CC]">
                        <span className="font-bold text-[#5A5A40]">
                          {isMale ? 'Nam' : 'Nữ'} {m.alias ? `• ${m.alias}` : ''}
                        </span>
                        {children.length > 0 ? (
                          <span className="bg-[#D4AF37]/20 text-[#4A3700] font-bold px-2 py-0.5 rounded-full text-[11px] border border-[#D4AF37]/30">
                            {children.length} con
                          </span>
                        ) : (
                          <span className="text-[#7A7A7A] text-[11px]">Chưa có con</span>
                        )}
                      </div>

                      {/* Name & Avatar */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                            m.avatar
                              ? 'border-[#E0D8CC]'
                              : isMale
                              ? 'bg-[#F5F2ED] text-[#8B2222] border-[#8B2222]'
                              : 'bg-[#FDF2F8] text-pink-700 border-pink-300'
                          }`}
                        >
                          {m.avatar ? (
                            <img
                              src={m.avatar}
                              alt={m.fullName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span>{m.generation === 1 ? '👴' : isMale ? '👨' : '👩'}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif font-bold text-[#2C2C2C] text-base truncate">
                            {m.fullName}
                          </h4>
                          {m.deathDate && (
                            <p className="text-xs text-[#8B2222] font-medium truncate">
                              {m.deathDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Spouses if any */}
                      {spouses.length > 0 && (
                        <div className="text-xs text-[#5A5A40] bg-[#FDFBF7] p-1.5 rounded border border-[#E0D8CC] mb-2 truncate">
                          <span className="font-bold">Vợ/Chồng:</span>{' '}
                          {spouses.map((s) => s.fullName).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-[#E0D8CC] flex items-center justify-between text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMember(m);
                        }}
                        className="text-[#5A5A40] hover:text-[#8B2222] font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Hồ sơ</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusOnTree(m);
                        }}
                        className="text-[#8B2222] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Trên cây</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
