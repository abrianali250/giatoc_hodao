import React, { useState } from 'react';
import { Member } from '../types';
import { getParents, getSpouses, getChildren, getMaxGeneration } from '../utils/genealogyUtils';
import {
  ListFilter,
  Eye,
  GitBranch,
  Search,
  Edit3,
  Trash2,
  ArrowUpDown,
  Download
} from 'lucide-react';

interface ListViewProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  onViewDescendants: (member: Member) => void;
  onFocusOnTree: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
  fontSizeClass?: string;
  isLoggedIn: boolean;
}

export const ListView: React.FC<ListViewProps> = ({
  members,
  onSelectMember,
  onViewDescendants,
  onFocusOnTree,
  onEditMember,
  onDeleteMember,
  fontSizeClass = 'text-base',
  isLoggedIn
}) => {
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'generation' | 'fullName'>('generation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const maxGen = React.useMemo(() => getMaxGeneration(members), [members]);

  const filtered = React.useMemo(() => {
    const seen = new Set<string>();
    const list = members.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      const matchesGen = selectedGen === 'all' || m.generation === selectedGen;
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.alias && m.alias.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesGen && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortField === 'generation') {
        return sortDirection === 'asc' ? a.generation - b.generation : b.generation - a.generation;
      } else {
        return sortDirection === 'asc'
          ? a.fullName.localeCompare(b.fullName, 'vi')
          : b.fullName.localeCompare(a.fullName, 'vi');
      }
    });
  }, [members, selectedGen, searchTerm, sortField, sortDirection]);

  const handleToggleSort = (field: 'generation' | 'fullName') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#8B2222] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
            <ListFilter className="w-4 h-4 text-amber-300" />
            <span>Danh Sách Đầy Đủ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">
            Toàn Thể Thành Viên Gia Tộc Họ Đào
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Tổng hợp dữ liệu {members.length} thành viên qua {maxGen} thế hệ theo dạng bảng chi tiết.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E0D8CC] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lọc nhanh theo họ tên..."
            className="w-full px-4 py-2 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#8B2222]"
          />
        </div>

        {/* Generation selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5A5A40] whitespace-nowrap">Đời thứ:</span>
          <select
            value={selectedGen}
            onChange={(e) =>
              setSelectedGen(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#8B2222]"
          >
            <option value="all">Tất cả ({members.length})</option>
            {Array.from({ length: maxGen }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Đời {g} ({members.filter((m) => m.generation === g).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E0D8CC] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2C2C2C]">
            <thead className="bg-[#FDFBF7] text-xs uppercase text-[#5A5A40] border-b border-[#E0D8CC] font-bold">
              <tr>
                <th
                  onClick={() => handleToggleSort('generation')}
                  className="px-4 py-3 cursor-pointer hover:bg-[#F5F2ED]"
                >
                  <div className="flex items-center gap-1">
                    <span>Đời</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('fullName')}
                  className="px-4 py-3 cursor-pointer hover:bg-[#F5F2ED]"
                >
                  <div className="flex items-center gap-1">
                    <span>Họ và Tên</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-4 py-3">Giới tính</th>
                <th className="px-4 py-3">Cha / Mẹ</th>
                <th className="px-4 py-3">Vợ / Chồng</th>
                <th className="px-4 py-3">Số con</th>
                <th className="px-4 py-3">Năm Mất / Giỗ</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D8CC]">
              {filtered.map((m) => {
                const { father, mother } = getParents(members, m);
                const spouses = getSpouses(members, m);
                const children = getChildren(members, m);
                const isMale = m.gender === 'male';

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-[#FDFBF7] transition-colors cursor-pointer"
                    onClick={() => onSelectMember(m)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          m.generation === 1
                            ? 'bg-[#8B2222] text-white'
                            : 'bg-[#5A5A40] text-white'
                        }`}
                      >
                        Đời {m.generation}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-bold font-serif text-[#2C2C2C]">
                      <div className="flex items-center gap-2">
                        <span>{m.fullName}</span>
                        {m.alias && (
                          <span className="text-xs font-normal text-[#5A5A40]">({m.alias})</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          isMale ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'
                        }`}
                      >
                        {isMale ? 'Nam' : 'Nữ'}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs text-[#5A5A40]">
                      {father ? father.fullName : mother ? mother.fullName : '—'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs text-[#5A5A40]">
                      {spouses.length > 0 ? spouses.map((s) => s.fullName).join(', ') : '—'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-[#8B2222]">
                      {children.length > 0 ? `${children.length} người` : '—'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs text-[#8B2222] font-medium">
                      {m.deathDate || '—'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectMember(m)}
                          className="p-1.5 rounded-lg text-[#5A5A40] hover:text-[#2C2C2C] hover:bg-[#F5F2ED]"
                          title="Hồ sơ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewDescendants(m)}
                          className="p-1.5 rounded-lg text-[#8B2222] hover:bg-[#F5F2ED]"
                          title="Cây con cháu"
                        >
                          <GitBranch className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onFocusOnTree(m)}
                          className="p-1.5 rounded-lg text-[#D4AF37] hover:bg-[#F5F2ED]"
                          title="Định vị trên cây"
                        >
                          <Search className="w-4 h-4" />
                        </button>

                        {isLoggedIn && (
                          <>
                            <button
                              onClick={() => onEditMember(m)}
                              className="p-1.5 rounded-lg text-[#5A5A40] hover:text-[#D4AF37] hover:bg-[#F5F2ED]"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onDeleteMember(m)}
                              className="p-1.5 rounded-lg text-[#5A5A40] hover:text-[#8B2222] hover:bg-[#F5F2ED]"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
