import React, { useState, useMemo, useEffect } from 'react';
import { Member } from '../types';
import {
  getParents,
  getSpouses,
  getChildren,
  getAllDescendants,
  getSiblings,
  getMemberPedigree
} from '../utils/genealogyUtils';
import {
  X,
  User,
  Users,
  GitBranch,
  Calendar,
  Heart,
  Edit3,
  Trash2,
  Search,
  BookOpen,
  Check,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Lock
} from 'lucide-react';

interface MemberModalProps {
  member: Member | null;
  members: Member[];
  onClose: () => void;
  onSelectMember: (member: Member) => void;
  onViewDescendants: (member: Member) => void;
  onFocusOnTree: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onAddChild?: (parent: Member) => void;
  onUpdateParents?: (childId: string, fatherId: string | null, motherId: string | null) => void;
  fontSizeClass?: string;
  isLoggedIn: boolean;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  member,
  members,
  onClose,
  onSelectMember,
  onViewDescendants,
  onFocusOnTree,
  onEdit,
  onDelete,
  onAddChild,
  onUpdateParents,
  fontSizeClass = 'text-base',
  isLoggedIn
}) => {
  const [isEditingParents, setIsEditingParents] = useState(false);
  const [selectedFatherId, setSelectedFatherId] = useState<string>('');
  const [selectedMotherId, setSelectedMotherId] = useState<string>('');

  useEffect(() => {
    if (member) {
      setSelectedFatherId(member.fatherId || '');
      setSelectedMotherId(member.motherId || '');
      setIsEditingParents(false);
    }
  }, [member?.id, member?.fatherId, member?.motherId]);

  // Compute pedigree (ancestry up to Generation 1)
  const pedigree = useMemo(() => {
    if (!member) return null;
    return getMemberPedigree(members, member);
  }, [members, member]);

  // Compute potential parents
  const invalidAncestorIds = useMemo(() => {
    if (!member) return new Set<string>();
    const descendants = getAllDescendants(members, member.id);
    const set = new Set<string>(descendants.map((d) => d.id));
    set.add(member.id);
    return set;
  }, [members, member?.id]);

  const potentialFathers = useMemo(() => {
    if (!member) return [];
    return members
      .filter((m) => !invalidAncestorIds.has(m.id) && m.gender === 'male')
      .sort((a, b) => a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi'));
  }, [members, invalidAncestorIds, member]);

  const potentialMothers = useMemo(() => {
    if (!member) return [];
    return members
      .filter((m) => !invalidAncestorIds.has(m.id) && m.gender === 'female')
      .sort((a, b) => a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi'));
  }, [members, invalidAncestorIds, member]);

  if (!member) return null;

  const { father, mother } = getParents(members, member);
  const spouses = getSpouses(members, member);
  const children = getChildren(members, member);
  const siblings = getSiblings(members, member);
  const allDescendants = getAllDescendants(members, member.id);
  const isMale = member.gender === 'male';

  const handleSaveParentsQuick = () => {
    if (onUpdateParents && member) {
      onUpdateParents(
        member.id,
        selectedFatherId ? selectedFatherId : null,
        selectedMotherId ? selectedMotherId : null
      );
      setIsEditingParents(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-2 border-[#E0D8CC] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        {/* Header with High Contrast Crimson Theme */}
        <div className="bg-[#8B2222] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400/40 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 border-[#D4AF37] overflow-hidden bg-white shadow-md flex-shrink-0 ${
                isMale ? 'text-[#8B2222]' : 'text-pink-600'
              }`}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl">
                  {member.generation === 1 ? '👴' : isMale ? '👨' : '👩'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide leading-tight">
                  {member.fullName}
                </h3>
                {member.alias && (
                  <span className="text-xs bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-bold border border-amber-300/30">
                    {member.alias}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                {member.generation === 1
                  ? 'Thủy Tổ Khởi Đầu (Đời 1)'
                  : `Đời thứ ${member.generation} trong dòng tộc`}{' '}
                • {isMale ? 'Nam' : 'Nữ'}
                {member.isAlive === false ? ' • 🕯️ Đã quy tiên' : ' • 🌿 Còn sống'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={`p-4 sm:p-6 overflow-y-auto space-y-5 text-[#2C2C2C] flex-1 ${fontSizeClass}`}>
          {/* Quick Edit Action Banner for Elderly Users */}
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-300">
            <span className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-[#8B2222]" />
              <span>Chỉnh sửa thông tin thành viên này?</span>
            </span>
            <button
              type="button"
              onClick={() => onEdit(member)}
              className="px-4 py-1.5 bg-[#8B2222] hover:bg-[#711616] text-white text-xs sm:text-sm font-black rounded-lg transition-all shadow-xs flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>SỬA NGAY</span>
            </button>
          </div>

          {/* 1. PEDIGREE SECTION: PARENTS, GRANDPARENTS & ANCESTOR CHAIN TO GEN 1 */}
          {member.generation === 1 ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border-2 border-amber-300 shadow-xs flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <h4 className="font-serif font-black text-[#8B2222] text-base sm:text-lg">
                  Cụ Thủy Tổ Khởi Đầu (Đời 1)
                </h4>
                <p className="text-xs sm:text-sm text-amber-900 font-medium">
                  Là bậc tiền hiền khởi lập của dòng họ Đào. Toàn bộ các chi phái và thế hệ con cháu đời sau đều bắt nguồn từ cụ.
                </p>
              </div>
            </div>
          ) : pedigree ? (
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#FBF8F1] p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs sm:text-sm font-extrabold text-[#8B2222] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>Cội Nguồn Dòng Tộc (Bố Mẹ • Ông Bà • Cụ Tổ Đời 1)</span>
                </span>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  {pedigree.ancestorChain.length} thế hệ nối tiếp
                </span>
              </div>

              {/* Parents & Grandparents Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bố Mẹ */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1">
                      <span>👨‍👩‍👧 BỐ MẸ (THÂN SINH):</span>
                    </span>
                    {pedigree.mothers && pedigree.mothers.length > 1 && (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        {pedigree.mothers.length} mẹ (cụ ông có nhiều vợ)
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm font-bold">
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                      <span className="text-neutral-600 font-normal">Bố (Thân phụ):</span>
                      {pedigree.father ? (
                        <button
                          type="button"
                          onClick={() => onSelectMember(pedigree.father!)}
                          className="text-[#8B2222] hover:underline font-bold flex items-center gap-1 text-right cursor-pointer"
                        >
                          <span>{pedigree.father.fullName}</span>
                          <span className="text-xs text-neutral-500 font-normal">
                            (Đời {pedigree.father.generation})
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      ) : (
                        <span className="text-neutral-400 font-normal italic">
                          {member.generation === 1 ? '👑 Cụ Khởi Tổ' : 'Chưa rõ'}
                        </span>
                      )}
                    </div>
                    {pedigree.mothers && pedigree.mothers.length > 0 ? (
                      pedigree.mothers.map((mInfo) => (
                        <div
                          key={mInfo.member.id}
                          className="flex items-center justify-between pt-1 border-t border-neutral-100"
                        >
                          <span className="text-neutral-600 font-normal">
                            {mInfo.roleLabel}:
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectMember(mInfo.member)}
                            className="text-pink-700 hover:underline font-bold flex items-center gap-1 text-right cursor-pointer"
                          >
                            <span>{mInfo.member.fullName}</span>
                            <span className="text-xs text-neutral-500 font-normal">
                              (Đời {mInfo.member.generation})
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <span className="text-neutral-600 font-normal">Mẹ (Thân mẫu):</span>
                        <span className="text-neutral-400 font-normal italic">Chưa rõ</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ông Bà */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1">
                      <span>👴👵 ÔNG BÀ (NỘI TỘC):</span>
                    </span>
                    {pedigree.paternalGrandmothers && pedigree.paternalGrandmothers.length > 1 && (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        {pedigree.paternalGrandmothers.length} bà nội
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm font-bold">
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                      <span className="text-neutral-600 font-normal">Ông nội:</span>
                      {pedigree.paternalGrandfather ? (
                        <button
                          type="button"
                          onClick={() => onSelectMember(pedigree.paternalGrandfather!)}
                          className="text-[#8B2222] hover:underline font-bold flex items-center gap-1 text-right cursor-pointer"
                        >
                          <span>{pedigree.paternalGrandfather.fullName}</span>
                          <span className="text-xs text-neutral-500 font-normal">
                            (Đời {pedigree.paternalGrandfather.generation})
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      ) : (
                        <span className="text-neutral-400 font-normal italic">
                          {member.generation <= 2 ? 'Khởi tổ Đời 1 là cội nguồn' : 'Chưa rõ'}
                        </span>
                      )}
                    </div>
                    {pedigree.paternalGrandmothers && pedigree.paternalGrandmothers.length > 0 ? (
                      pedigree.paternalGrandmothers.map((gmInfo) => (
                        <div
                          key={gmInfo.member.id}
                          className="flex items-center justify-between pt-1 border-t border-neutral-100"
                        >
                          <span className="text-neutral-600 font-normal">
                            {gmInfo.roleLabel}:
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectMember(gmInfo.member)}
                            className="text-pink-700 hover:underline font-bold flex items-center gap-1 text-right cursor-pointer"
                          >
                            <span>{gmInfo.member.fullName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <span className="text-neutral-600 font-normal">Bà nội:</span>
                        <span className="text-neutral-400 font-normal italic">
                          {member.generation <= 2 ? 'Không áp dụng' : 'Chưa rõ'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step-ladder Ancestor Chain back to Generation 1 */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-neutral-600 uppercase block">
                  Trực Hệ Tổ Tiên Theo Từng Đời:
                </span>
                <div className="flex flex-col gap-1.5">
                  {pedigree.ancestorChain.map((item) => (
                    <div
                      key={item.member.id}
                      onClick={() => onSelectMember(item.member)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors shadow-2xs cursor-pointer ${
                        item.isCurrent
                          ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-300/50'
                          : 'bg-white hover:bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-[#8B2222] font-black text-xs flex items-center justify-center border border-amber-300">
                          {item.generation}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm sm:text-base text-[#1C1917]">
                              {item.member.fullName}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#8B2222]/10 text-[#8B2222]">
                              {item.relationTitle}
                            </span>
                            {item.isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold">
                                Đang xem
                              </span>
                            )}
                          </div>
                          {item.member.birthDate && (
                            <span className="text-[11px] text-neutral-500">
                              Sinh: {item.member.birthDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* 2. Core Dates & Branch Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E0D8CC] space-y-1">
              <span className="text-xs font-bold uppercase text-[#5A5A40] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#8B2222]" />
                Năm Sinh / Ngày Mất / Giỗ
              </span>
              <p className="font-bold text-base text-[#2C2C2C]">
                {member.birthDate ? `Năm sinh: ${member.birthDate}` : 'Chưa rõ năm sinh'}
              </p>
              {member.deathDate && (
                <p className="text-sm font-bold text-[#8B2222]">
                  Ngày mất / Giỗ: {member.deathDate}
                </p>
              )}
            </div>

            <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E0D8CC] space-y-1">
              <span className="text-xs font-bold uppercase text-[#5A5A40] flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-[#8B2222]" />
                Nhánh & Thứ Bậc
              </span>
              <p className="font-bold text-base text-[#2C2C2C]">
                Đời thứ {member.generation}{' '}
                {member.orderInFamily ? `(Con thứ ${member.orderInFamily})` : ''}
              </p>
              <p className="text-xs text-[#5A5A40]">
                {member.branchName || 'Dòng dõi họ Đào'}
              </p>
            </div>
          </div>

          {/* 3. Spouses */}
          <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E0D8CC] space-y-2">
            <span className="font-bold uppercase text-xs text-[#5A5A40] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#8B2222]" />
              <span>Hôn Phối (Vợ / Chồng)</span>
            </span>
            {spouses.length > 0 ? (
              <div className="space-y-1.5">
                {spouses.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectMember(s)}
                    className="w-full text-left p-2 rounded-lg bg-white border border-[#E0D8CC] font-bold text-[#8B2222] hover:bg-amber-50 flex items-center justify-between text-sm"
                  >
                    <span>
                      {s.fullName} {s.deathDate ? `(${s.deathDate})` : ''}
                    </span>
                    <span className="text-xs text-neutral-500 font-normal">Đời {s.generation}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-xs italic">Chưa có thông tin hôn phối</p>
            )}
          </div>

          {/* 4. Children List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-[#2C2C2C] flex items-center gap-1.5">
                <span>🌱</span>
                <span>Danh Sách Con Cái ({children.length} người)</span>
              </h4>
              {onAddChild && (
                <button
                  type="button"
                  onClick={() => onAddChild(member)}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm con cái</span>
                </button>
              )}
            </div>

            {children.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {children.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-[#E0D8CC] bg-[#FDFBF7] flex flex-col justify-between group transition-colors hover:border-[#8B2222]"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => onSelectMember(c)}
                    >
                      <div>
                        <span className="font-bold text-base text-[#2C2C2C] group-hover:text-[#8B2222] hover:underline">
                          {c.fullName}
                        </span>
                        {c.deathDate && (
                          <span className="text-xs text-[#8B2222] block font-medium">
                            {c.deathDate}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#5A5A40] bg-white px-2 py-0.5 rounded border border-[#E0D8CC]">
                        Đời {c.generation}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E0D8CC]/50">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(c);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-[#5A5A40] hover:text-[#8B2222] hover:bg-stone-100 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic bg-[#FDFBF7] p-3 rounded-xl border border-[#E0D8CC]">
                Không có dữ liệu con cái trong bản gia phả gốc.
              </p>
            )}
          </div>

          {/* 5. Siblings */}
          {siblings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-base text-[#2C2C2C] flex items-center gap-1.5">
                <span>👥</span>
                <span>Anh Chị Em Ruột Cùng Cha ({siblings.length} người)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {siblings.map((sib) => (
                  <button
                    key={sib.id}
                    type="button"
                    onClick={() => onSelectMember(sib)}
                    className="px-3 py-2 rounded-xl border border-[#E0D8CC] bg-[#FDFBF7] hover:bg-[#F5F2ED] text-xs sm:text-sm font-bold text-[#2C2C2C] hover:text-[#8B2222]"
                  >
                    {sib.fullName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Notes */}
          {member.notes && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-amber-700" />
                Ghi Chú Trong Gia Phả
              </span>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-wrap">
                {member.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions - Large Touch Targets */}
        <div className="bg-[#F5F2ED] p-3 sm:p-4 border-t-2 border-[#E0D8CC] flex flex-wrap items-center justify-between gap-2.5 sticky bottom-0 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="modal-btn-edit"
              onClick={() => onEdit(member)}
              className="px-4 py-2.5 bg-white hover:bg-[#F5F2ED] text-[#2C2C2C] border-2 border-[#D4AF37] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-[#8B2222]" />
              <span>SỬA THÔNG TIN</span>
            </button>

            <button
              type="button"
              id="modal-btn-delete"
              onClick={() => onDelete(member)}
              className="px-3 py-2.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Xóa</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="modal-btn-focus-tree"
              onClick={() => onFocusOnTree(member)}
              className="px-3.5 py-2.5 bg-[#D4AF37] hover:bg-[#B8962E] text-[#4A3700] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Xem Trên Cây</span>
            </button>

            <button
              type="button"
              id="modal-btn-view-descendants"
              onClick={() => onViewDescendants(member)}
              className="px-4 py-2.5 bg-[#8B2222] hover:bg-[#711616] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <GitBranch className="w-4 h-4" />
              <span>Con Cháu ({allDescendants.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
