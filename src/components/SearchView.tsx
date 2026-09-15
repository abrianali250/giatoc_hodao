import React, { useState, useMemo } from 'react';
import { Member, FilterState } from '../types';
import {
  searchMembers,
  getSpouses,
  getChildren,
  getBranchNames,
  getMaxGeneration,
  getMemberPedigree
} from '../utils/genealogyUtils';
import {
  Search as SearchIcon,
  User,
  Users,
  Filter,
  Eye,
  GitBranch,
  Search,
  X,
  Edit3,
  ChevronDown,
  ChevronUp,
  Award,
  ArrowUpRight,
  Heart,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SearchViewProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  onViewDescendants: (member: Member) => void;
  onFocusOnTree: (member: Member) => void;
  onEditMember?: (member: Member) => void;
  fontSizeClass?: string;
  isLoggedIn?: boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({
  members,
  onSelectMember,
  onViewDescendants,
  onFocusOnTree,
  onEditMember,
  fontSizeClass = 'text-base',
  isLoggedIn = false
}) => {
  const [filter, setFilter] = useState<FilterState>({
    keyword: '',
    generation: 'all',
    gender: 'all',
    branch: 'all'
  });

  const [expandedPedigreeId, setExpandedPedigreeId] = useState<string | null>(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const branchNames = useMemo(() => getBranchNames(members), [members]);
  const maxGen = useMemo(() => getMaxGeneration(members), [members]);

  const filteredMembers = useMemo(() => {
    const list = searchMembers(members, filter);
    const seen = new Set<string>();
    return list.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [members, filter]);

  const handleClearFilters = () => {
    setFilter({
      keyword: '',
      generation: 'all',
      gender: 'all',
      branch: 'all'
    });
  };

  const togglePedigree = (memberId: string) => {
    setExpandedPedigreeId((prev) => (prev === memberId ? null : memberId));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20 md:pb-8">
      {/* Mobile-First Header Search Banner */}
      <div className="bg-gradient-to-br from-[#8B2222] to-[#6e1515] rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-lg border border-[#A83232] relative overflow-hidden">
        {/* Subtle Decorative Background Pattern */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider border border-amber-400/30">
              <SearchIcon className="w-4 h-4 text-amber-300" />
              <span>TRA CỨU GIA PHẢ HỌ ĐÀO</span>
            </span>

            <span className="text-xs text-amber-200/90 font-medium">
              {members.length} thành viên • {maxGen} thế hệ
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-wide text-white leading-tight">
              Tìm Kiếm Thông Tin Con Cháu & Tổ Tiên
            </h2>
            <p className="text-amber-100 text-sm sm:text-base mt-1 font-normal leading-relaxed">
              Nhập tên để xem ngay thông tin cá nhân, <strong className="text-amber-300 font-bold">bố mẹ, ông bà</strong> và toàn bộ <strong className="text-amber-300 font-bold">dòng dõi trực hệ về tận Đời thứ 1 (Cụ Khởi Tổ)</strong>.
            </p>
          </div>

          {/* Large, High-Contrast Search Input for Elderly Accessibility */}
          <div className="relative pt-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon className="w-6 h-6 text-[#8B2222]" />
            </div>
            <input
              id="input-global-search"
              type="text"
              value={filter.keyword}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              placeholder="Nhập họ tên cần tìm (ví dụ: Cương, Nhẫm, Đời 3...)"
              className="w-full pl-13 pr-12 py-3.5 sm:py-4 bg-white text-[#1C1917] rounded-2xl text-base sm:text-xl font-semibold shadow-md border-2 border-amber-300/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 focus:outline-none placeholder:text-[#8C827A] placeholder:font-normal"
            />
            {filter.keyword && (
              <button
                type="button"
                onClick={() => setFilter({ ...filter, keyword: '' })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                title="Xóa chữ"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons for Mobile & Elderly: 1-Tap Filter */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-amber-200 text-xs uppercase tracking-wider mr-1">Lọc nhanh:</span>
            
            {/* All */}
            <button
              type="button"
              onClick={() => setFilter({ ...filter, gender: 'all', generation: 'all' })}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filter.gender === 'all' && filter.generation === 'all'
                  ? 'bg-amber-400 text-[#4A3700] border-amber-400 font-extrabold shadow-sm'
                  : 'bg-black/20 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              Tất cả ({members.length})
            </button>

            {/* Male */}
            <button
              type="button"
              onClick={() => setFilter({ ...filter, gender: filter.gender === 'male' ? 'all' : 'male' })}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                filter.gender === 'male'
                  ? 'bg-amber-400 text-[#4A3700] border-amber-400 font-extrabold shadow-sm'
                  : 'bg-black/20 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              <span>👨 Nam</span>
            </button>

            {/* Female */}
            <button
              type="button"
              onClick={() => setFilter({ ...filter, gender: filter.gender === 'female' ? 'all' : 'female' })}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                filter.gender === 'female'
                  ? 'bg-amber-400 text-[#4A3700] border-amber-400 font-extrabold shadow-sm'
                  : 'bg-black/20 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              <span>👩 Nữ</span>
            </button>

            {/* Generation 1 */}
            <button
              type="button"
              onClick={() => setFilter({ ...filter, generation: filter.generation === 1 ? 'all' : 1 })}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filter.generation === 1
                  ? 'bg-amber-400 text-[#4A3700] border-amber-400 font-extrabold shadow-sm'
                  : 'bg-black/20 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              👑 Đời 1 (Thủy Tổ)
            </button>

            {/* Generation 2 & 3 */}
            <button
              type="button"
              onClick={() => setFilter({ ...filter, generation: filter.generation === 2 ? 'all' : 2 })}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filter.generation === 2
                  ? 'bg-amber-400 text-[#4A3700] border-amber-400 font-extrabold shadow-sm'
                  : 'bg-black/20 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              Đời 2
            </button>

            <button
              type="button"
              onClick={() => setFilter({ ...filter, generation: filter.generation === 3 ? 'all' : 3 })}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filter.generation === 3
                  ? 'bg-amber-400 text-[#4A3700] border-amber-400 font-extrabold shadow-sm'
                  : 'bg-black/20 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              Đời 3
            </button>

            {/* Toggle Advanced Filters */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className="ml-auto px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 border border-white/20 flex items-center gap-1 transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showAdvancedFilter ? 'Ẩn bộ lọc' : 'Lọc thêm'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filters */}
      {showAdvancedFilter && (
        <div className="bg-white border-2 border-[#E0D8CC] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E0D8CC] pb-3">
            <div className="flex items-center gap-2 text-base font-bold text-[#5A5A40]">
              <Filter className="w-5 h-5 text-[#8B2222]" />
              <span>BỘ LỌC CHI TIẾT</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs sm:text-sm text-[#8B2222] hover:underline font-bold px-2 py-1"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Generation dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1.5">
                Chọn Đời Thứ
              </label>
              <select
                value={filter.generation}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    generation: e.target.value === 'all' ? 'all' : Number(e.target.value)
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] text-sm sm:text-base font-semibold focus:outline-none focus:border-[#8B2222] bg-[#FDFBF7]"
              >
                <option value="all">Tất cả các đời (1 - {maxGen})</option>
                {Array.from({ length: maxGen }, (_, i) => i + 1).map((gen) => (
                  <option key={gen} value={gen}>
                    Đời thứ {gen} {gen === 1 ? '(Thủy Tổ Đào Bá Nhẫm)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1.5">
                Giới Tính
              </label>
              <select
                value={filter.gender}
                onChange={(e) =>
                  setFilter({ ...filter, gender: e.target.value as 'all' | 'male' | 'female' })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] text-sm sm:text-base font-semibold focus:outline-none focus:border-[#8B2222] bg-[#FDFBF7]"
              >
                <option value="all">Tất cả (Nam & Nữ)</option>
                <option value="male">Nam giới</option>
                <option value="female">Nữ giới</option>
              </select>
            </div>

            {/* Branch dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#5A5A40] mb-1.5">
                Nhánh Gia Tộc
              </label>
              <select
                value={filter.branch}
                onChange={(e) => setFilter({ ...filter, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBC0] text-sm sm:text-base font-semibold focus:outline-none focus:border-[#8B2222] bg-[#FDFBF7]"
              >
                <option value="all">Tất cả các nhánh</option>
                {branchNames.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#8B2222]"></span>
          <h3 className="font-bold text-[#2C2C2C] text-base sm:text-lg font-serif">
            {filter.keyword
              ? `Kết quả tìm kiếm cho "${filter.keyword}"`
              : 'Danh Sách Con Cháu Họ Đào'}
          </h3>
          <span className="text-xs sm:text-sm font-bold bg-[#8B2222] text-white px-2.5 py-0.5 rounded-full">
            {filteredMembers.length} người
          </span>
        </div>

        {(filter.keyword || filter.generation !== 'all' || filter.gender !== 'all' || filter.branch !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="text-xs sm:text-sm text-[#8B2222] hover:underline font-bold"
          >
            Bỏ lọc
          </button>
        )}
      </div>

      {/* Results List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#E0D8CC] rounded-3xl p-8 sm:p-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F5F2ED] flex items-center justify-center mx-auto text-[#8B2222]">
            <User className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-[#5A5A40] font-serif">
            Không tìm thấy thành viên họ Đào nào phù hợp
          </h4>
          <p className="text-sm sm:text-base text-[#7A7A7A] max-w-md mx-auto leading-relaxed">
            Hãy thử tìm bằng tên riêng không dấu (ví dụ: &quot;Cuong&quot;, &quot;Nham&quot;, &quot;Ha&quot;...) hoặc bấm vào nút bên dưới để xem lại toàn bộ gia tộc.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-3 bg-[#8B2222] text-white font-bold rounded-xl text-sm hover:bg-[#711616] transition-colors shadow-sm"
          >
            Xem toàn bộ gia tộc họ Đào
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredMembers.map((m) => {
            const pedigree = getMemberPedigree(members, m);
            const spouses = getSpouses(members, m);
            const children = getChildren(members, m);
            const isMale = m.gender === 'male';
            const isExpanded = expandedPedigreeId === m.id;

            return (
              <div
                key={m.id}
                className="bg-white border-2 border-[#E0D8CC] hover:border-[#8B2222] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Top Member Identity Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ${
                        m.avatar
                          ? 'border-[#8B2222]'
                          : isMale
                          ? 'bg-[#FDFBF7] border-[#8B2222] text-[#8B2222]'
                          : 'bg-[#FDF2F8] border-pink-500 text-pink-600'
                      }`}
                    >
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl">
                          {m.generation === 1 ? '👑' : isMale ? '👨' : '👩'}
                        </span>
                      )}
                    </div>

                    {/* Names & Generation Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif font-black text-[#1C1917] text-xl sm:text-2xl tracking-wide leading-tight">
                          {m.fullName}
                        </h4>
                        {m.alias && (
                          <span className="text-xs sm:text-sm font-semibold text-[#5A5A40] bg-[#F5F2ED] px-2.5 py-0.5 rounded-lg border border-[#E0D8CC]">
                            Tự: {m.alias}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xs ${
                            m.generation === 1
                              ? 'bg-[#8B2222] text-white'
                              : 'bg-[#4A3700] text-[#FFD700]'
                          }`}
                        >
                          {m.generation === 1 ? '👑 Thủy Tổ (Đời 1)' : `Đời thứ ${m.generation}`}
                        </span>

                        <span
                          className={`text-xs sm:text-sm px-2.5 py-0.5 rounded-lg font-semibold ${
                            isMale ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'
                          }`}
                        >
                          {isMale ? 'Nam' : 'Nữ'}
                        </span>

                        {m.isAlive === false && (
                          <span className="text-xs sm:text-sm bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-lg font-medium">
                            🕯️ Đã mất {m.deathDate ? `(${m.deathDate})` : ''}
                          </span>
                        )}

                        {m.isAdopted && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-lg font-bold">
                            Con nuôi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary Profile View Button */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => onSelectMember(m)}
                      className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#F5F2ED] hover:bg-[#8B2222] hover:text-white text-[#2C2C2C] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border border-[#D5CBC0]"
                      title="Xem toàn bộ hồ sơ chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Xem Hồ Sơ</span>
                    </button>

                    {onEditMember && (
                      <button
                        type="button"
                        onClick={() => onEditMember(m)}
                        className="py-2.5 px-3.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#4A3700] hover:text-black text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border border-[#D4AF37]/40"
                        title="Chỉnh sửa thông tin thành viên"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden xs:inline">Sửa</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* HIGHLIGHTED SECTION: BỐ MẸ & ÔNG BÀ & TẬN ĐỜI THỨ 1 (AS USER REQUESTED) */}
                <div className="bg-[#FDFBF7] border-2 border-[#E7DFD5] rounded-2xl p-3.5 sm:p-5 space-y-4">
                  {/* Header of Ancestry Card */}
                  <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#8B2222]" />
                      <h5 className="font-serif font-bold text-[#1C1917] text-sm sm:text-base tracking-wide">
                        Cội Nguồn Tổ Tiên (Bố Mẹ • Ông Bà • Cụ Tổ Đời 1)
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePedigree(m.id)}
                      className="text-xs sm:text-sm font-bold text-[#8B2222] hover:text-[#711616] flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Xem toàn bộ chuỗi đời'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Immediate Parents & Grandparents Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {/* Father & Mother Block */}
                    <div className="bg-white p-3 rounded-xl border border-[#E0D8CC] shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-[#8B2222] flex items-center gap-1">
                          <span>👨‍👩‍👧 BẬC SINH THÀNH (BỐ MẸ)</span>
                        </span>
                        {pedigree.mothers && pedigree.mothers.length > 1 && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            {pedigree.mothers.length} mẹ (cụ ông nhiều vợ)
                          </span>
                        )}
                      </div>

                      {/* Father */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <span className="font-semibold text-neutral-600">Bố (Thân phụ):</span>
                        {pedigree.father ? (
                          <button
                            type="button"
                            onClick={() => onSelectMember(pedigree.father!)}
                            className="font-bold text-[#8B2222] hover:underline flex items-center gap-1 text-right cursor-pointer"
                          >
                            <span>{pedigree.father.fullName}</span>
                            <span className="text-xs text-neutral-500 font-normal">
                              (Đời {pedigree.father.generation})
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        ) : (
                          <span className="text-neutral-400 italic">
                            {m.generation === 1 ? '👑 Cụ Khởi Tổ (Đời 1)' : 'Chưa có ghi chép'}
                          </span>
                        )}
                      </div>

                      {/* Mothers List */}
                      {pedigree.mothers && pedigree.mothers.length > 0 ? (
                        pedigree.mothers.map((mInfo) => (
                          <div
                            key={mInfo.member.id}
                            className="flex items-center justify-between pt-1 border-t border-neutral-100"
                          >
                            <span className="font-semibold text-neutral-600">
                              {mInfo.roleLabel}:
                            </span>
                            <button
                              type="button"
                              onClick={() => onSelectMember(mInfo.member)}
                              className="font-bold text-pink-700 hover:underline flex items-center gap-1 text-right cursor-pointer"
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
                          <span className="font-semibold text-neutral-600">Mẹ (Thân mẫu):</span>
                          <span className="text-neutral-400 italic">Chưa có ghi chép</span>
                        </div>
                      )}
                    </div>

                    {/* Grandparents Block */}
                    <div className="bg-white p-3 rounded-xl border border-[#E0D8CC] shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-[#5A5A40] flex items-center gap-1">
                          <span>👴👵 ÔNG BÀ TRỰC HỆ (NỘI / NGOẠI)</span>
                        </span>
                        {pedigree.paternalGrandmothers && pedigree.paternalGrandmothers.length > 1 && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            {pedigree.paternalGrandmothers.length} bà nội
                          </span>
                        )}
                      </div>

                      {/* Paternal Grandfather */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                        <span className="font-semibold text-neutral-600">Ông nội:</span>
                        {pedigree.paternalGrandfather ? (
                          <button
                            type="button"
                            onClick={() => onSelectMember(pedigree.paternalGrandfather!)}
                            className="font-bold text-[#8B2222] hover:underline flex items-center gap-1 text-right cursor-pointer"
                          >
                            <span>{pedigree.paternalGrandfather.fullName}</span>
                            <span className="text-xs text-neutral-500 font-normal">
                              (Đời {pedigree.paternalGrandfather.generation})
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        ) : (
                          <span className="text-neutral-400 italic">
                            {m.generation <= 2 ? 'Không áp dụng' : 'Chưa có ghi chép'}
                          </span>
                        )}
                      </div>

                      {/* Paternal Grandmothers List */}
                      {pedigree.paternalGrandmothers && pedigree.paternalGrandmothers.length > 0 ? (
                        pedigree.paternalGrandmothers.map((gmInfo) => (
                          <div
                            key={gmInfo.member.id}
                            className="flex items-center justify-between pt-1 border-t border-neutral-100"
                          >
                            <span className="font-semibold text-neutral-600">
                              {gmInfo.roleLabel}:
                            </span>
                            <button
                              type="button"
                              onClick={() => onSelectMember(gmInfo.member)}
                              className="font-bold text-pink-700 hover:underline flex items-center gap-1 text-right cursor-pointer"
                            >
                              <span>{gmInfo.member.fullName}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                          <span className="font-semibold text-neutral-600">Bà nội:</span>
                          <span className="text-neutral-400 italic">
                            {m.generation <= 2 ? 'Không áp dụng' : 'Chưa có ghi chép'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VISUAL GENERATIONAL STEP LADDER BACK TO GENERATION 1 (TO TẬN ĐỜI THỨ 1) */}
                  <div className="pt-2 border-t border-[#E7DFD5]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-[#5A5A40] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Dòng Trực Hệ Ngược Về Đời 1 (Thủy Tổ):</span>
                      </span>

                      <span className="text-xs font-semibold text-neutral-500">
                        {pedigree.ancestorChain.length} thế hệ nối tiếp
                      </span>
                    </div>

                    {/* Always visible Summary Line of Ancestors */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {pedigree.ancestorChain.map((step, idx) => {
                        const isRoot = step.generation === 1;
                        const isSelf = step.isCurrent;

                        return (
                          <React.Fragment key={step.member.id}>
                            <button
                              type="button"
                              onClick={() => onSelectMember(step.member)}
                              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs border ${
                                isSelf
                                  ? 'bg-[#8B2222] text-white border-[#8B2222]'
                                  : isRoot
                                  ? 'bg-[#D4AF37] text-[#4A3700] border-[#B8962E] hover:bg-[#e0be48]'
                                  : 'bg-white text-[#2C2C2C] border-[#D5CBC0] hover:border-[#8B2222] hover:bg-[#FDFBF7]'
                              }`}
                              title={`Bấm để xem hồ sơ: ${step.member.fullName} (${step.relationTitle})`}
                            >
                              <span>
                                {isRoot ? '👑 Đời 1:' : `Đ${step.generation}:`}
                              </span>
                              <span className="underline decoration-dotted underline-offset-2">
                                {step.member.fullName}
                              </span>
                              {!isSelf && (
                                <span className="text-[10px] opacity-75 font-normal">
                                  ({step.relationTitle.split(' ')[0]})
                                </span>
                              )}
                            </button>

                            {idx < pedigree.ancestorChain.length - 1 && (
                              <span className="text-[#8B2222] font-black text-sm select-none">
                                →
                              </span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Detailed Expanded View of All Ancestors to Generation 1 */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-[#E7DFD5] space-y-2.5 animate-fade-in bg-white p-3.5 sm:p-4 rounded-xl border border-[#D5CBC0]">
                        <h6 className="text-xs font-bold uppercase text-[#8B2222] tracking-wider mb-2">
                          Chi Tiết Từng Vị Tiền Nhân Ngược Về Cụ Khởi Tổ Đời 1:
                        </h6>

                        <div className="space-y-2">
                          {pedigree.ancestorChain.map((step, idx) => (
                            <div
                              key={step.member.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm ${
                                step.isCurrent
                                  ? 'bg-[#F5F2ED] border-[#8B2222]'
                                  : step.generation === 1
                                  ? 'bg-amber-50/70 border-amber-300'
                                  : 'bg-[#FDFBF7] border-[#E0D8CC]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                    step.generation === 1
                                      ? 'bg-amber-400 text-amber-950 font-black'
                                      : 'bg-[#8B2222] text-white'
                                  }`}
                                >
                                  {step.generation}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-serif font-bold text-base text-[#1C1917]">
                                      {step.member.fullName}
                                    </span>
                                    {step.member.alias && (
                                      <span className="text-xs text-neutral-500">
                                        ({step.member.alias})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold text-[#8B2222]">
                                    {step.relationTitle}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {step.member.birthDate && (
                                  <span className="text-xs text-neutral-500">
                                    Sinh: {step.member.birthDate}
                                  </span>
                                )}
                                {step.member.deathDate && (
                                  <span className="text-xs text-neutral-500">
                                    Mất: {step.member.deathDate}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onSelectMember(step.member)}
                                  className="px-2.5 py-1 rounded-lg bg-[#8B2222] text-white text-xs font-bold hover:bg-[#711616]"
                                >
                                  Hồ sơ
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spouses & Children Brief Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  <div className="bg-[#F5F2ED] p-2.5 rounded-xl border border-[#E0D8CC] flex items-center justify-between">
                    <span className="text-neutral-600 font-medium">Vợ / Chồng:</span>
                    <span className="font-bold text-[#1C1917] text-right">
                      {spouses.length > 0
                        ? spouses.map((s) => s.fullName).join(', ')
                        : 'Chưa có ghi chép'}
                    </span>
                  </div>

                  <div className="bg-[#F5F2ED] p-2.5 rounded-xl border border-[#E0D8CC] flex items-center justify-between">
                    <span className="text-neutral-600 font-medium">Số con cái:</span>
                    <span className="font-bold text-[#8B2222]">
                      {children.length} người con
                    </span>
                  </div>
                </div>

                {/* Mobile-Friendly Action Buttons */}
                <div className="pt-2 border-t border-[#F0EAE1] flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectMember(m)}
                    className="flex-1 py-3 px-3 rounded-xl bg-[#8B2222] text-white hover:bg-[#711616] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem Chi Tiết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewDescendants(m)}
                    className="flex-1 py-3 px-3 rounded-xl bg-[#5A5A40] text-white hover:bg-[#43432f] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Xem Con Cháu ({children.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onFocusOnTree(m)}
                    className="py-3 px-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#4A3700] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    title="Định vị trên cây gia phả"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden xs:inline">Trên cây</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
