import React from 'react';
import { Member } from '../types';
import { getChildren, getSpouses } from '../utils/genealogyUtils';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  member: Member | null;
  members: Member[];
  onClose: () => void;
  onConfirmDelete: (memberId: string) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  member,
  members,
  onClose,
  onConfirmDelete
}) => {
  if (!member) return null;

  const children = getChildren(members, member);
  const spouses = getSpouses(members, member);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-2 border-[#E0D8CC] rounded-2xl shadow-2xl overflow-hidden text-[#2C2C2C]">
        {/* Header */}
        <div className="bg-[#8B2222] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold font-serif text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            <span>Xác Nhận Xóa Thành Viên</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm sm:text-base text-[#2C2C2C] leading-relaxed">
            Bạn có chắc chắn muốn xóa thành viên{' '}
            <strong className="text-[#8B2222] font-extrabold">{member.fullName}</strong> (Đời thứ{' '}
            {member.generation}) khỏi hệ thống gia phả?
          </p>

          {(children.length > 0 || spouses.length > 0) && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <strong className="block font-bold">Lưu ý mối quan hệ liên quan:</strong>
              {children.length > 0 && (
                <p>• Thành viên này có {children.length} người con. Sau khi xóa, liên kết cha/mẹ của các con sẽ được giải phóng.</p>
              )}
              {spouses.length > 0 && (
                <p>• Liên kết với {spouses.length} người vợ/chồng sẽ được cập nhật tự động.</p>
              )}
            </div>
          )}

          <p className="text-xs text-[#7A7A7A] italic">
            * Dữ liệu có thể được khôi phục về bản gốc bất kỳ lúc nào tại mục &quot;Sao lưu & Khôi phục&quot;.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-[#F5F2ED] px-6 py-3.5 flex items-center justify-end gap-2.5 border-t border-[#E0D8CC]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FDFBF7] text-[#2C2C2C] border border-[#E0D8CC] text-xs font-bold transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            id="btn-confirm-delete-action"
            onClick={() => {
              onConfirmDelete(member.id);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#8B2222] hover:bg-[#711616] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Vĩnh Viễn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
