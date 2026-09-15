import React, { useState, useEffect, useMemo } from 'react';
import { Member } from '../types';
import {
  getMaxGeneration,
  getAllDescendants,
  getMemberById,
  findMembersByName
} from '../utils/genealogyUtils';
import {
  X,
  User,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Heart,
  Calendar,
  Sparkles,
  Users,
  CornerDownRight,
  ArrowRight
} from 'lucide-react';

interface FormChildEntry {
  id: string;
  fullName: string;
  gender: 'male' | 'female';
  generation: number;
  birthDate?: string;
  isNew?: boolean;
  isRelocated?: boolean;
  oldParentInfo?: string;
}

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Member, newChildren?: Member[]) => void;
  initialMember?: Member | null;
  editingMember?: Member | null;
  prefilledData?: Partial<Member>;
  members: Member[];
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
  editingMember,
  prefilledData,
  members
}) => {
  const currentMember = editingMember || initialMember || null;
  const isEditing = !!currentMember;
  const maxGen = getMaxGeneration(members);

  const [fullName, setFullName] = useState('');
  const [alias, setAlias] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [generation, setGeneration] = useState<number>(2);
  const [orderInFamily, setOrderInFamily] = useState<number | ''>('');
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  const [spouseIds, setSpouseIds] = useState<string[]>([]);
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [isAdopted, setIsAdopted] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [notes, setNotes] = useState('');
  const [branchName, setBranchName] = useState('');
  const [sourceVerified, setSourceVerified] = useState(false);

  // State for children management and re-parenting misplaced children
  const [formChildren, setFormChildren] = useState<FormChildEntry[]>([]);
  const [childSearchInput, setChildSearchInput] = useState('');
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('male');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');

  // Initialize or reset form values
  useEffect(() => {
    if (currentMember) {
      setFullName(currentMember.fullName || '');
      setAlias(currentMember.alias || '');
      setGender(currentMember.gender || 'male');
      setGeneration(currentMember.generation || 2);
      setOrderInFamily(currentMember.orderInFamily !== undefined ? currentMember.orderInFamily : '');
      setFatherId(currentMember.fatherId || '');
      setMotherId(currentMember.motherId || '');
      setSpouseIds(currentMember.spouseIds || []);
      setBirthDate(currentMember.birthDate || '');
      setDeathDate(currentMember.deathDate || '');
      setIsAlive(currentMember.isAlive !== undefined ? currentMember.isAlive : true);
      setIsAdopted(currentMember.isAdopted || false);
      setAvatar(currentMember.avatar || '');
      setNotes(currentMember.notes || '');
      setBranchName(currentMember.branchName || '');
      setSourceVerified(currentMember.sourceVerified || false);

      // Populate current children
      const isMale = currentMember.gender === 'male';
      const existingChildren = members.filter(
        (m) =>
          (isMale ? m.fatherId === currentMember.id : m.motherId === currentMember.id) ||
          (currentMember.childrenIds || []).includes(m.id)
      );

      setFormChildren(
        existingChildren.map((c) => ({
          id: c.id,
          fullName: c.fullName,
          gender: c.gender === 'female' ? 'female' : 'male',
          generation: c.generation,
          birthDate: c.birthDate,
          isNew: false,
          isRelocated: false
        }))
      );
    } else {
      setFullName(prefilledData?.fullName || '');
      setAlias(prefilledData?.alias || '');
      setGender(prefilledData?.gender || 'male');
      setGeneration(prefilledData?.generation || 2);
      setOrderInFamily(prefilledData?.orderInFamily !== undefined ? prefilledData.orderInFamily : '');
      setFatherId(prefilledData?.fatherId || 'dao_ba_nham');
      setMotherId(prefilledData?.motherId || '');
      setSpouseIds(prefilledData?.spouseIds || []);
      setBirthDate(prefilledData?.birthDate || '');
      setDeathDate(prefilledData?.deathDate || '');
      setIsAlive(prefilledData?.isAlive !== undefined ? prefilledData.isAlive : true);
      setIsAdopted(prefilledData?.isAdopted || false);
      setAvatar(prefilledData?.avatar || '');
      setNotes(prefilledData?.notes || '');
      setBranchName(prefilledData?.branchName || '');
      setSourceVerified(prefilledData?.sourceVerified || false);
      setFormChildren([]);
    }

    setChildSearchInput('');
    setNewChildBirthDate('');
  }, [currentMember, isOpen, prefilledData, members]);

  // Compute invalid IDs (self and descendants) to prevent cyclic hierarchy
  const invalidAncestorIds = useMemo(() => {
    if (!currentMember) return new Set<string>();
    const descendants = getAllDescendants(members, currentMember.id);
    const set = new Set<string>(descendants.map((d) => d.id));
    set.add(currentMember.id);
    return set;
  }, [members, currentMember]);

  // Potential parents (exclude self and descendants)
  const potentialFathers = useMemo(() => {
    return members
      .filter((m) => !invalidAncestorIds.has(m.id))
      .sort((a, b) => {
        if (a.gender === 'male' && b.gender !== 'male') return -1;
        if (a.gender !== 'male' && b.gender === 'male') return 1;
        return a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi');
      });
  }, [members, invalidAncestorIds]);

  const potentialMothers = useMemo(() => {
    const fatherSpouses = fatherId ? (getMemberById(members, fatherId)?.spouseIds || []) : [];
    return members
      .filter((m) => !invalidAncestorIds.has(m.id))
      .sort((a, b) => {
        const aIsFatherWife = fatherSpouses.includes(a.id);
        const bIsFatherWife = fatherSpouses.includes(b.id);
        if (aIsFatherWife && !bIsFatherWife) return -1;
        if (!aIsFatherWife && bIsFatherWife) return 1;
        if (a.gender === 'female' && b.gender !== 'female') return -1;
        if (a.gender !== 'female' && b.gender === 'female') return 1;
        return a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi');
      });
  }, [members, invalidAncestorIds, fatherId]);

  const potentialSpouses = useMemo(() => {
    return members
      .filter((m) => !invalidAncestorIds.has(m.id) && !spouseIds.includes(m.id))
      .sort((a, b) => a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi'));
  }, [members, invalidAncestorIds, spouseIds]);

  // Real-time matching members in genealogy when typing child name to relocate misplaced children
  const matchedExistingMembers = useMemo(() => {
    const trimmed = childSearchInput.trim();
    if (!trimmed || trimmed.length < 2) return [];

    const found = findMembersByName(members, trimmed);
    const existingChildIds = new Set(formChildren.map((c) => c.id));
    if (currentMember) existingChildIds.add(currentMember.id);

    return found.filter((m) => !existingChildIds.has(m.id) && !invalidAncestorIds.has(m.id));
  }, [childSearchInput, members, formChildren, currentMember, invalidAncestorIds]);

  // Members eligible to be selected directly from dropdown as children
  const availableClanMembersForChildren = useMemo(() => {
    const existingChildIds = new Set(formChildren.map((c) => c.id));
    if (currentMember) existingChildIds.add(currentMember.id);

    return members
      .filter((m) => !existingChildIds.has(m.id) && !invalidAncestorIds.has(m.id))
      .sort((a, b) => a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi'));
  }, [members, formChildren, currentMember, invalidAncestorIds]);

  if (!isOpen) return null;

  // Handle father selection change
  const handleFatherChange = (newFatherId: string) => {
    setFatherId(newFatherId);
    if (newFatherId) {
      const chosenFather = getMemberById(members, newFatherId);
      if (chosenFather) {
        setGeneration(chosenFather.generation + 1);
        if (chosenFather.branchName && !branchName) {
          setBranchName(chosenFather.branchName);
        }
      }
    }
  };

  // Handle mother selection change
  const handleMotherChange = (newMotherId: string) => {
    setMotherId(newMotherId);
    if (newMotherId && !fatherId) {
      const chosenMother = getMemberById(members, newMotherId);
      if (chosenMother) {
        setGeneration(chosenMother.generation + 1);
      }
    }
  };

  const handleAddSpouse = (sId: string) => {
    if (!spouseIds.includes(sId)) {
      setSpouseIds([...spouseIds, sId]);
    }
  };

  const handleRemoveSpouse = (sId: string) => {
    setSpouseIds(spouseIds.filter((id) => id !== sId));
  };

  // Add existing member from clan as child (Relocating misplaced child)
  const handleRelocateMemberAsChild = (targetMember: Member) => {
    const f = targetMember.fatherId ? getMemberById(members, targetMember.fatherId) : null;
    const m = targetMember.motherId ? getMemberById(members, targetMember.motherId) : null;

    const oldParentInfo = f
      ? `Bố cũ: ${f.fullName} (Đời ${f.generation})`
      : m
      ? `Mẹ cũ: ${m.fullName} (Đời ${m.generation})`
      : 'Chưa gán bố mẹ';

    setFormChildren((prev) => [
      ...prev,
      {
        id: targetMember.id,
        fullName: targetMember.fullName,
        gender: targetMember.gender === 'female' ? 'female' : 'male',
        generation: Number(generation) + 1,
        birthDate: targetMember.birthDate,
        isNew: false,
        isRelocated: true,
        oldParentInfo
      }
    ]);
    setChildSearchInput('');
  };

  // Add a brand-new child
  const handleAddNewChild = () => {
    if (!childSearchInput.trim()) return;

    const tempId = `dao_child_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setFormChildren((prev) => [
      ...prev,
      {
        id: tempId,
        fullName: childSearchInput.trim(),
        gender: newChildGender,
        generation: Number(generation) + 1,
        birthDate: newChildBirthDate.trim() || undefined,
        isNew: true,
        isRelocated: false
      }
    ]);
    setChildSearchInput('');
    setNewChildBirthDate('');
  };

  // Remove child from parent list
  const handleRemoveChild = (childId: string) => {
    setFormChildren((prev) => prev.filter((c) => c.id !== childId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('Vui lòng nhập Họ và Tên thành viên');
      return;
    }

    const assignedParentId = currentMember?.id || `dao_ba_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create Member objects for any brand new children
    const newMembersToCreate: Member[] = formChildren
      .filter((c) => c.isNew)
      .map((c) => ({
        id: c.id,
        fullName: c.fullName.trim(),
        gender: c.gender,
        generation: Number(generation) + 1,
        birthDate: c.birthDate,
        fatherId: gender === 'male' ? assignedParentId : (spouseIds[0] || null),
        motherId: gender === 'female' ? assignedParentId : (spouseIds[0] || null),
        spouseIds: [],
        childrenIds: [],
        branchName: branchName || undefined,
        sourceVerified: true,
        isAlive: true
      }));

    // 2. All final child IDs
    const finalChildrenIds = formChildren.map((c) => c.id);

    const memberData: Member = {
      id: assignedParentId,
      fullName: fullName.trim(),
      alias: alias.trim() || undefined,
      gender,
      generation: Number(generation),
      orderInFamily: orderInFamily !== '' ? Number(orderInFamily) : undefined,
      fatherId: fatherId || null,
      motherId: motherId || null,
      spouseIds,
      childrenIds: finalChildrenIds,
      birthDate: birthDate.trim() || undefined,
      deathDate: isAlive ? undefined : (deathDate.trim() || undefined),
      isAlive,
      isAdopted,
      avatar: avatar || null,
      notes: notes.trim() || undefined,
      branchName: branchName.trim() || undefined,
      sourceVerified
    };

    onSave(memberData, newMembersToCreate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-2 border-[#E0D8CC] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        {/* Header with High Contrast Crimson Theme */}
        <div className="bg-[#8B2222] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400/40 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white text-[#8B2222] font-black text-xl flex items-center justify-center border-2 border-[#D4AF37] shadow-sm flex-shrink-0">
              {isEditing ? '✏️' : '➕'}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-white leading-tight">
                {isEditing ? `Sửa: ${currentMember?.fullName}` : 'Thêm Thành Viên Mới'}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200 font-medium">
                Gia phả họ Đào • Quản lý thông tin và sắp xếp con cái
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/20 transition-colors text-white"
            title="Đóng cửa sổ"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="member-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-[#2C2C2C]"
        >
          {/* 1. Full Name & Gender & Alive Status */}
          <div className="bg-[#FDFBF7] p-3.5 sm:p-4 rounded-xl border border-[#E0D8CC] space-y-3">
            <div>
              <label className="block text-sm sm:text-base font-black text-[#2C2C2C] mb-1">
                Họ và Tên Thành Viên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Đào Bá Tiêu..."
                className="w-full px-4 py-3 bg-white border-2 border-[#8B2222]/50 focus:border-[#8B2222] rounded-xl text-base sm:text-lg font-serif font-bold text-[#2C2C2C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Tên Thường Gọi / Tên Tự / Tức (Nếu có)
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ví dụ: Tiêu Cường, Cụ Ba..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm sm:text-base focus:border-[#8B2222] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Giới Tính
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base border-2 transition-all flex items-center justify-center gap-2 ${
                      gender === 'male'
                        ? 'bg-[#8B2222] text-white border-[#8B2222] shadow-sm'
                        : 'bg-white text-neutral-700 border-[#D5CBC0]'
                    }`}
                  >
                    <span>👨 Nam</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base border-2 transition-all flex items-center justify-center gap-2 ${
                      gender === 'female'
                        ? 'bg-pink-700 text-white border-pink-700 shadow-sm'
                        : 'bg-white text-neutral-700 border-[#D5CBC0]'
                    }`}
                  >
                    <span>👩 Nữ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Alive status */}
            <div className="pt-2 border-t border-[#E0D8CC] flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#5A5A40]">
                Tình Trạng Sinh/Tử:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAlive(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    isAlive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white border border-[#D5CBC0] text-[#5A5A40]'
                  }`}
                >
                  🟢 Còn sống
                </button>
                <button
                  type="button"
                  onClick={() => setIsAlive(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    !isAlive
                      ? 'bg-[#8B2222] text-white shadow-xs'
                      : 'bg-white border border-[#D5CBC0] text-[#5A5A40]'
                  }`}
                >
                  ⚪ Đã mất (Hưởng thọ)
                </button>
              </div>
            </div>
          </div>

          {/* 2. Birth & Death Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E0D8CC]">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Năm Sinh (hoặc Ngày Tháng)</span>
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="Ví dụ: 1954 hoặc 15/08/1954..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm sm:text-base focus:border-[#8B2222] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#8B2222]" />
                <span>Năm Mất / Ngày Giỗ (Nếu đã mất)</span>
              </label>
              <input
                type="text"
                disabled={isAlive}
                value={isAlive ? '' : deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                placeholder={isAlive ? 'Đang còn sống' : 'Ví dụ: 2012, hoặc 15/3 AL...'}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm sm:text-base border focus:outline-none ${
                  isAlive
                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    : 'bg-white text-[#8B2222] border-[#D5CBC0] focus:border-[#8B2222]'
                }`}
              />
            </div>
          </div>

          {/* 3. Generation & Branch & Parents (Father & Mother) */}
          <div className="bg-[#FDFBF7] p-3.5 sm:p-4 rounded-xl border border-[#E0D8CC] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Đời Thứ (Thế Hệ)
                </label>
                <select
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm sm:text-base font-bold text-[#8B2222] focus:border-[#8B2222] focus:outline-none"
                >
                  {Array.from({ length: Math.max(maxGen + 2, 10) }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      Đời {g} {g === 1 ? '(Thủy Tổ)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Thứ Tự Sinh Trong Gia Đình
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={orderInFamily}
                  onChange={(e) => setOrderInFamily(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1 (Trưởng), 2, 3..."
                  className="w-full px-3 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm sm:text-base focus:border-[#8B2222] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Tên Chi / Nhánh Họ
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Ví dụ: Chi 1, Nhánh Trưởng..."
                  className="w-full px-3 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm sm:text-base focus:border-[#8B2222] focus:outline-none"
                />
              </div>
            </div>

            {/* Father & Mother selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E0D8CC]">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Cha (Thân Phụ)
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => handleFatherChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-xs sm:text-sm font-semibold text-[#2C2C2C] focus:border-[#8B2222] focus:outline-none"
                >
                  <option value="">-- Không chọn / Chưa rõ cha --</option>
                  {potentialFathers.map((f) => (
                    <option key={f.id} value={f.id}>
                      Đời {f.generation}: {f.fullName} {f.alias ? `(${f.alias})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1">
                  Mẹ (Thân Mẫu)
                </label>
                <select
                  value={motherId}
                  onChange={(e) => handleMotherChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-xs sm:text-sm font-semibold text-[#2C2C2C] focus:border-[#8B2222] focus:outline-none"
                >
                  <option value="">-- Không chọn / Chưa rõ mẹ --</option>
                  {potentialMothers.map((m) => {
                    const fatherObj = fatherId ? getMemberById(members, fatherId) : null;
                    const fatherSpouses = fatherObj?.spouseIds || [];
                    const isWifeOfFather = fatherSpouses.includes(m.id);
                    const wifeIdx = isWifeOfFather ? fatherSpouses.indexOf(m.id) + 1 : 0;
                    let wifeBadge = '';
                    if (isWifeOfFather) {
                      wifeBadge = wifeIdx === 1 ? ' [Vợ cả của Bố]' : wifeIdx === 2 ? ' [Vợ hai của Bố]' : ` [Vợ ${wifeIdx} của Bố]`;
                    }
                    return (
                      <option key={m.id} value={m.id}>
                        Đời {m.generation}: {m.fullName}{wifeBadge} {m.alias ? `(${m.alias})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Spouses */}
          <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-[#E0D8CC] space-y-2.5">
            <span className="text-xs sm:text-sm font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#8B2222]" />
              <span>Hôn Phối (Vợ / Chồng)</span>
            </span>

            {spouseIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {spouseIds.map((sid) => {
                  const spouseObj = getMemberById(members, sid);
                  return (
                    <div
                      key={sid}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#8B2222] rounded-xl text-xs sm:text-sm font-bold text-[#8B2222] shadow-2xs"
                    >
                      <span>{spouseObj ? spouseObj.fullName : sid}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpouse(sid)}
                        className="hover:text-red-700 p-0.5 rounded-full"
                        title="Bỏ người này"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-1">
              <select
                id="select-add-spouse"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSpouse(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-xs sm:text-sm font-semibold focus:border-[#8B2222] focus:outline-none"
              >
                <option value="">+ Chọn thêm Vợ/Chồng từ danh sách dòng tộc...</option>
                {potentialSpouses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.gender === 'female' ? 'Nữ' : 'Nam'}, Đời {s.generation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. CRITICAL: CHILDREN MANAGEMENT & RE-PARENTING MISPLACED CHILDREN */}
          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-xl border-2 border-[#8B2222]/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0D8CC]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#8B2222] text-white flex items-center justify-center font-bold text-sm">
                  🌱
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#2C2C2C] font-serif">
                    Danh Sách Con Cái ({formChildren.length} người)
                  </h4>
                  <p className="text-xs text-[#5A5A40]">
                    Thêm con mới hoặc chọn người đã có trong gia phả đang bị sai bố mẹ để chuyển về đây
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#8B2222] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Đời con: Đời {Number(generation) + 1}
              </span>
            </div>

            {/* List of current & added children */}
            {formChildren.length > 0 ? (
              <div className="space-y-2">
                {formChildren.map((child) => (
                  <div
                    key={child.id}
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      child.isRelocated
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/40'
                        : child.isNew
                        ? 'bg-emerald-50/90 border-emerald-400'
                        : 'bg-white border-[#E0D8CC]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg flex-shrink-0">
                        {child.gender === 'female' ? '👩' : '👨'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-[#2C2C2C] font-serif truncate">
                            {child.fullName}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#D5CBC0] font-semibold text-[#5A5A40]">
                            {child.gender === 'female' ? 'Nữ' : 'Nam'}
                          </span>
                          {child.birthDate && (
                            <span className="text-xs text-neutral-500">
                              (Sinh: {child.birthDate})
                            </span>
                          )}
                        </div>

                        {/* Status notification */}
                        {child.isRelocated ? (
                          <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                            <span>🔄 Chuyển từ {child.oldParentInfo || 'vị trí cũ'} về làm con của {fullName || 'người này'}</span>
                            <span className="text-amber-900 font-extrabold">• Sẽ cập nhật Đời {Number(generation) + 1} khi Lưu!</span>
                          </p>
                        ) : child.isNew ? (
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <span>✨ Con mới sẽ tạo và lưu vào gia phả (Đời {Number(generation) + 1})</span>
                          </p>
                        ) : (
                          <p className="text-xs text-[#5A5A40] mt-0.5">
                            Đời {child.generation} • Đang là con của người này
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveChild(child.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-white transition-colors flex-shrink-0"
                      title="Bỏ người này khỏi danh sách con"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-neutral-500 italic py-1">
                Chưa có con nào trong danh sách. Hãy nhập tên bên dưới để thêm con mới hoặc chuyển người đang nằm sai chỗ về đây.
              </p>
            )}

            {/* Input to check name or add new child */}
            <div className="pt-2 border-t border-[#E0D8CC] space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-[#2C2C2C]">
                Nhập Họ Tên Con (để kiểm tra xem đã có trong gia phả hay chưa):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={childSearchInput}
                  onChange={(e) => setChildSearchInput(e.target.value)}
                  placeholder="Ví dụ: Đào Thị Loan, Đào Bá Cương..."
                  className="flex-1 px-3.5 py-2 bg-white border border-[#D5CBC0] rounded-xl text-sm font-semibold focus:border-[#8B2222] focus:outline-none"
                />
              </div>

              {/* Matched existing members alert box (when child already exists elsewhere in clan) */}
              {matchedExistingMembers.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>ĐÃ TÌM THẤY TRONG GIA PHẢ ({matchedExistingMembers.length} người mang tên này):</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedExistingMembers.slice(0, 4).map((hit) => {
                      const f = hit.fatherId ? getMemberById(members, hit.fatherId) : null;
                      const m = hit.motherId ? getMemberById(members, hit.motherId) : null;
                      const curParent = f
                        ? `Bố: ${f.fullName}`
                        : m
                        ? `Mẹ: ${m.fullName}`
                        : 'Chưa rõ bố mẹ';

                      return (
                        <div
                          key={hit.id}
                          className="bg-white p-2.5 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-sm text-[#2C2C2C]">
                              {hit.fullName}
                            </span>{' '}
                            <span className="text-xs text-neutral-500">
                              ({hit.gender === 'female' ? 'Nữ' : 'Nam'}, Đời {hit.generation})
                            </span>
                            <p className="text-xs text-amber-800 font-medium">
                              Vị trí hiện tại: <span className="font-bold">{curParent}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRelocateMemberAsChild(hit)}
                            className="px-3 py-1.5 bg-[#8B2222] hover:bg-[#711616] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 flex-shrink-0 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Chuyển về làm con của {fullName || 'người này'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form to add as a brand-new child when name is not in genealogy */}
              {childSearchInput.trim().length >= 2 && matchedExistingMembers.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-300 p-2.5 sm:p-3 rounded-xl space-y-2 animate-fade-in">
                  <span className="text-xs font-bold text-emerald-900 block">
                    ✨ Tên "{childSearchInput.trim()}" chưa có trong gia phả. Thêm làm con mới:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-emerald-200">
                      <button
                        type="button"
                        onClick={() => setNewChildGender('male')}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          newChildGender === 'male'
                            ? 'bg-[#8B2222] text-white'
                            : 'text-neutral-600'
                        }`}
                      >
                        👨 Con trai
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewChildGender('female')}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          newChildGender === 'female'
                            ? 'bg-pink-700 text-white'
                            : 'text-neutral-600'
                        }`}
                      >
                        👩 Con gái
                      </button>
                    </div>

                    <input
                      type="text"
                      value={newChildBirthDate}
                      onChange={(e) => setNewChildBirthDate(e.target.value)}
                      placeholder="Năm sinh (tùy chọn)"
                      className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium w-36"
                    />

                    <button
                      type="button"
                      onClick={handleAddNewChild}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Con Mới</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick select dropdown from clan members */}
              <div className="pt-1">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedMember = getMemberById(members, e.target.value);
                      if (selectedMember) {
                        handleRelocateMemberAsChild(selectedMember);
                      }
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#D5CBC0] rounded-xl text-xs font-semibold text-[#5A5A40] focus:border-[#8B2222] focus:outline-none"
                >
                  <option value="">
                    Hoặc bấm vào đây để chọn người có sẵn trong gia phả đang bị sai chỗ...
                  </option>
                  {availableClanMembersForChildren.map((m) => {
                    const f = m.fatherId ? getMemberById(members, m.fatherId) : null;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.gender === 'female' ? 'Nữ' : 'Nam'}, Đời {m.generation})
                        {f ? ` - Bố hiện tại: ${f.fullName}` : ' - Chưa có bố mẹ'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* 6. Adopted & Notes */}
          <div className="flex items-center gap-4 bg-[#FDFBF7] p-3 rounded-xl border border-[#E0D8CC]">
            <label className="flex items-center gap-2 text-sm font-bold text-[#2C2C2C] cursor-pointer">
              <input
                type="checkbox"
                checked={isAdopted}
                onChange={(e) => setIsAdopted(e.target.checked)}
                className="w-5 h-5 text-[#8B2222] rounded focus:ring-[#8B2222]"
              />
              <span>Con Nuôi</span>
            </label>

            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sourceVerified}
                onChange={(e) => setSourceVerified(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Đã đối chiếu khớp dữ liệu ảnh gia phả gốc</span>
            </label>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1.5">
              Ghi Chú Gia Phả (Nơi an táng, chức sắc, tiểu sử...)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập thông tin nơi an táng, nơi định cư hoặc công đức với dòng họ..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#D5CBC0] rounded-xl text-sm sm:text-base focus:border-[#8B2222] focus:outline-none resize-none"
            />
          </div>
        </form>

        {/* STICKY FOOTER ACTIONS - GIANT TOUCH BUTTONS FOR ELDERLY */}
        <div className="bg-[#F5F2ED] p-3 sm:p-4 border-t-2 border-[#E0D8CC] flex flex-col sm:flex-row items-center justify-end gap-2.5 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-sm sm:text-base font-bold transition-all"
          >
            Hủy Bỏ
          </button>

          <button
            type="submit"
            form="member-form"
            id="btn-save-member-submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#8B2222] hover:bg-[#711616] text-white text-base sm:text-lg font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#6b1919] active:scale-98"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{isEditing ? 'LƯU CẬP NHẬT' : 'LƯU THÀNH VIÊN MỚI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
