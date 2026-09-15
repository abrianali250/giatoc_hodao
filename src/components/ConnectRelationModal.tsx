import React from 'react';
import { Member } from '../types';
import { ConnectionRelationType, checkCanSetParent, getMemberById } from '../utils/genealogyUtils';
import { X, ArrowRight, Heart, Users, Link2, Unlink, ShieldAlert, Check } from 'lucide-react';

interface ConnectRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceMember: Member | null;
  targetMember: Member | null;
  members: Member[];
  onConfirm: (relationType: ConnectionRelationType) => void;
}

export const ConnectRelationModal: React.FC<ConnectRelationModalProps> = ({
  isOpen,
  onClose,
  sourceMember,
  targetMember,
  members,
  onConfirm
}) => {
  if (!isOpen || !sourceMember || !targetMember) return null;

  const isSourceParentAllowed = checkCanSetParent(members, targetMember.id, sourceMember.id);
  const isSourceChildAllowed = checkCanSetParent(members, sourceMember.id, targetMember.id);

  // Check current relationships
  const isSourceCurrentlyParent =
    targetMember.fatherId === sourceMember.id || targetMember.motherId === sourceMember.id;
  const isSourceCurrentlyChild =
    sourceMember.fatherId === targetMember.id || sourceMember.motherId === targetMember.id;
  const isCurrentlySpouse =
    (sourceMember.spouseIds || []).includes(targetMember.id) ||
    (targetMember.spouseIds || []).includes(sourceMember.id);

  const hasAnyCurrentRelation = isSourceCurrentlyParent || isSourceCurrentlyChild || isCurrentlySpouse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border-2 border-[#E0D8CC] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#8B2222] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                Nối & Sửa Quan Hệ Gia Phả
              </h3>
              <p className="text-xs text-amber-100">
                Kéo nối giữa 2 thành viên trong gia tộc Họ Đào
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pair Comparison */}
        <div className="p-4 bg-[#FDFBF7] border-b border-[#E0D8CC] flex items-center justify-between gap-2">
          {/* Source Box */}
          <div className="flex-1 bg-white p-3 rounded-xl border border-[#E0D8CC] shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#F5F2ED] border border-[#E0D8CC] flex items-center justify-center overflow-hidden flex-shrink-0">
              {sourceMember.avatar ? (
                <img src={sourceMember.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{sourceMember.gender === 'male' ? '👨' : '👩'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-[#8B2222] bg-red-50 px-1.5 py-0.5 rounded">
                Người kéo
              </span>
              <h4 className="font-serif font-bold text-sm text-[#2C2C2C] truncate mt-0.5">
                {sourceMember.fullName}
              </h4>
              <p className="text-[11px] text-[#5A5A40]">Đời {sourceMember.generation}</p>
            </div>
          </div>

          {/* Center Connector Icon */}
          <div className="w-8 h-8 rounded-full bg-[#8B2222] text-white flex items-center justify-center shadow-md flex-shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Target Box */}
          <div className="flex-1 bg-white p-3 rounded-xl border border-[#E0D8CC] shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#F5F2ED] border border-[#E0D8CC] flex items-center justify-center overflow-hidden flex-shrink-0">
              {targetMember.avatar ? (
                <img src={targetMember.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{targetMember.gender === 'male' ? '👨' : '👩'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-[#5A5A40] bg-stone-100 px-1.5 py-0.5 rounded">
                Người nhận
              </span>
              <h4 className="font-serif font-bold text-sm text-[#2C2C2C] truncate mt-0.5">
                {targetMember.fullName}
              </h4>
              <p className="text-[11px] text-[#5A5A40]">Đời {targetMember.generation}</p>
            </div>
          </div>
        </div>

        {/* Action Selection Options */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
            Chọn mối quan hệ bạn muốn thiết lập:
          </p>

          {/* Option 1: Source is PARENT of Target */}
          <button
            disabled={!isSourceParentAllowed.allowed}
            onClick={() => onConfirm('source_is_parent')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              isSourceCurrentlyParent
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400/40'
                : isSourceParentAllowed.allowed
                ? 'bg-white hover:bg-[#FDFBF7] border-[#E0D8CC] hover:border-[#8B2222] shadow-2xs'
                : 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2C2C2C]">
                  {sourceMember.fullName} là {sourceMember.gender === 'male' ? 'Cha' : 'Mẹ'} của{' '}
                  {targetMember.fullName}
                </span>
                {isSourceCurrentlyParent && (
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded-full">
                    Đang là quan hệ này
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A5A40] mt-1">
                {targetMember.fullName} (và các con cháu) sẽ tự động được xếp vào Đời{' '}
                {sourceMember.generation + 1}
              </p>
              {!isSourceParentAllowed.allowed && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {isSourceParentAllowed.reason}
                </p>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#8B2222] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </button>

          {/* Option 2: Source is CHILD of Target */}
          <button
            disabled={!isSourceChildAllowed.allowed}
            onClick={() => onConfirm('source_is_child')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              isSourceCurrentlyChild
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400/40'
                : isSourceChildAllowed.allowed
                ? 'bg-white hover:bg-[#FDFBF7] border-[#E0D8CC] hover:border-[#8B2222] shadow-2xs'
                : 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2C2C2C]">
                  {sourceMember.fullName} là Con của {targetMember.fullName}
                </span>
                {isSourceCurrentlyChild && (
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-bold rounded-full">
                    Đang là quan hệ này
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A5A40] mt-1">
                {sourceMember.fullName} (và các con cháu) sẽ tự động được xếp vào Đời{' '}
                {targetMember.generation + 1}
              </p>
              {!isSourceChildAllowed.allowed && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {isSourceChildAllowed.reason}
                </p>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#8B2222] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </button>

          {/* Option 3: SPOUSE */}
          <button
            onClick={() => onConfirm('source_is_spouse')}
            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              isCurrentlySpouse
                ? 'bg-pink-50/80 border-pink-400 ring-2 ring-pink-300/50'
                : 'bg-white hover:bg-[#FDFBF7] border-[#E0D8CC] hover:border-pink-500 shadow-2xs'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2C2C2C]">
                  Hai người là Vợ / Chồng (Hôn Phối)
                </span>
                {isCurrentlySpouse && (
                  <span className="px-2 py-0.5 text-[10px] bg-pink-600 text-white font-bold rounded-full">
                    Đang là Vợ/Chồng
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A5A40] mt-1">
                Tạo liên kết phu thê hai chiều hiển thị cạnh nhau trên cây phả hệ
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4" />
            </div>
          </button>

          {/* Option 4: Disconnect (if relation exists) */}
          {hasAnyCurrentRelation && (
            <button
              onClick={() => onConfirm('disconnect')}
              className="w-full text-left p-3.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/70 transition-all flex items-center justify-between text-red-700"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm">
                  Hủy bỏ liên kết quan hệ trực tiếp giữa 2 người
                </span>
                <p className="text-[11px] text-red-600/80 mt-0.5">
                  Xóa mối quan hệ cha mẹ / con cái hoặc hôn phối hiện có giữa hai người này
                </p>
              </div>
              <Unlink className="w-4 h-4 flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F2ED] p-3.5 border-t border-[#E0D8CC] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#5A5A40] border border-[#E0D8CC] text-xs font-bold transition-colors"
          >
            Hủy Bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
