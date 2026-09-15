import React from 'react';
import { ViewMode } from '../types';
import {
  GitGraph,
  Search,
  Users,
  ListFilter,
  Plus,
  Database,
  Type,
  Printer,
  LogIn,
  LogOut,
  UserPlus,
  Server,
  Radio,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  totalMembers: number;
  maxGenerations: number;
  fontSizeScale: 'normal' | 'large' | 'huge';
  onChangeFontSize: (scale: 'normal' | 'large' | 'huge') => void;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  isCloudSyncing?: boolean;
  lastCloudSyncTime?: string | null;
  cloudStatus?: 'connected' | 'syncing' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenAddModal,
  onOpenBackupModal,
  totalMembers,
  maxGenerations,
  fontSizeScale,
  onChangeFontSize,
  isLoggedIn,
  onOpenLogin,
  onLogout,
  isCloudSyncing,
  lastCloudSyncTime,
  cloudStatus = 'connected'
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Primary Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-[#8B2222] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Clan Crest & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-[#8B2222] font-serif font-black text-xl sm:text-2xl border-2 border-[#D4AF37] shadow-sm flex-shrink-0">
              Đ
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-2xl font-serif font-black tracking-wide text-white truncate">
                  GIA PHẢ HỌ ĐÀO
                </h1>
                <span className="hidden lg:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D4AF37] text-[#4A3700]">
                  Gốc: Cụ Đào Bá Nhẫm
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/90 font-medium truncate">
                {totalMembers} thành viên • {maxGenerations} thế hệ
              </p>
            </div>
          </div>

          {/* Right Action Tools: Font Resizer & Modals */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Elderly Accessibility Font Resizer (PROMINENT ON MOBILE & DESKTOP) */}
            <div className="flex items-center bg-black/25 px-1.5 sm:px-2.5 py-1 rounded-xl border border-white/20 text-xs shadow-inner">
              <span className="hidden xs:flex text-[11px] font-bold text-amber-300 mr-1.5 items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>Chữ:</span>
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => onChangeFontSize('normal')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSizeScale === 'normal'
                      ? 'bg-[#D4AF37] text-[#4A3700] shadow-2xs'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  title="Cỡ chữ vừa"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('large')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSizeScale === 'large'
                      ? 'bg-[#D4AF37] text-[#4A3700] shadow-2xs'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  title="Cỡ chữ to (Dễ đọc)"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('huge')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSizeScale === 'huge'
                      ? 'bg-[#D4AF37] text-[#4A3700] shadow-2xs'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  title="Cỡ chữ rất to"
                >
                  A++
                </button>
              </div>
            </div>

            {/* Desktop Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#6b1919] hover:bg-[#591414] border border-[#a82d2d] rounded-xl text-white font-bold text-xs transition-colors"
              title="In hoặc Xuất PDF"
            >
              <Printer className="w-4 h-4" />
              <span>In PDF</span>
            </button>

            {/* Cloud Server Database Status & Backup Button */}
            <button
              type="button"
              id="btn-nav-cloud-database"
              onClick={onOpenBackupModal}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border shadow-2xs cursor-pointer ${
                cloudStatus === 'offline'
                  ? 'bg-amber-950/40 border-amber-400/50 text-amber-200 hover:bg-amber-900/60'
                  : 'bg-emerald-950/40 border-emerald-400/50 text-emerald-200 hover:bg-emerald-900/60'
              }`}
              title={
                cloudStatus === 'offline'
                  ? 'Máy chủ: Đang ngoại tuyến (sử dụng dữ liệu tạm trên máy)'
                  : `Máy Chủ Đám Mây: Đã Kết Nối${lastCloudSyncTime ? ` • Đồng bộ: ${lastCloudSyncTime}` : ''}`
              }
            >
              {isCloudSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
              ) : (
                <Server className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span className="hidden sm:inline">
                {isCloudSyncing
                  ? 'Đang lưu mây...'
                  : cloudStatus === 'offline'
                  ? 'Mây: Ngoại tuyến'
                  : 'Máy Chủ: Trực Tuyến'}
              </span>
              <span className={`w-2 h-2 rounded-full ${cloudStatus === 'offline' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            </button>

            {/* Add Member & Login */}
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={onOpenBackupModal}
                  className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl font-bold text-xs items-center gap-1.5 transition-colors border border-white/20"
                  title="Sao lưu hoặc nạp dữ liệu"
                >
                  <Database className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden lg:inline">Sao Lưu</span>
                </button>

                <button
                  type="button"
                  id="btn-nav-add-member"
                  onClick={onOpenAddModal}
                  className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#4A3700] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="hidden xs:inline">Thêm Người</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="bg-black/25 hover:bg-black/40 text-white p-1.5 sm:px-3 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1 border border-white/20"
                  title="Đăng xuất quản trị"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Thoát</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="bg-black/25 hover:bg-black/40 text-amber-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/20 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Quản trị</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Navigation Sub-Bar (Hidden on Mobile, replaced by Bottom Nav) */}
        <div className="hidden md:block bg-[#F5F2ED] border-b border-[#E0D8CC] px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* View Mode Tabs */}
            <div className="bg-white p-1 rounded-full shadow-xs border border-[#E0D8CC] flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                id="tab-view-search"
                onClick={() => onViewChange('search')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  currentView === 'search'
                    ? 'bg-[#8B2222] text-white shadow-xs'
                    : 'text-[#5A5A40] hover:text-[#8B2222]'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>🔍 TRA CỨU THEO TÊN (MẶC ĐỊNH)</span>
              </button>

              <span className="text-[#E0D8CC]">|</span>

              <button
                type="button"
                id="tab-view-tree"
                onClick={() => onViewChange('tree')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  currentView === 'tree'
                    ? 'bg-[#8B2222] text-white shadow-xs'
                    : 'text-[#5A5A40] hover:text-[#8B2222]'
                }`}
              >
                <GitGraph className="w-4 h-4" />
                <span>🌳 CÂY GIA PHẢ</span>
              </button>

              <span className="text-[#E0D8CC]">|</span>

              <button
                type="button"
                id="tab-view-lineage"
                onClick={() => onViewChange('lineage')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  currentView === 'lineage'
                    ? 'bg-[#8B2222] text-white shadow-xs'
                    : 'text-[#5A5A40] hover:text-[#8B2222]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>📜 DÒNG DÕI TỪNG ĐỜI</span>
              </button>

              <span className="text-[#E0D8CC]">|</span>

              <button
                type="button"
                id="tab-view-list"
                onClick={() => onViewChange('list')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  currentView === 'list'
                    ? 'bg-[#8B2222] text-white shadow-xs'
                    : 'text-[#5A5A40] hover:text-[#8B2222]'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>📋 DANH SÁCH BẢNG</span>
              </button>
            </div>

            {/* Slogan */}
            <span className="text-xs text-[#5A5A40] font-semibold italic">
              &quot;Uống nước nhớ nguồn • Khắc ghi tiên tổ&quot;
            </span>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-Friendly for Elderly on Mobile Phones) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#8B2222] border-t-2 border-[#D4AF37] shadow-2xl flex items-center justify-around h-16 px-1 safe-area-bottom"
        aria-label="Thanh điều hướng di động"
      >
        {/* Tab 1: Tra cứu (Default) */}
        <button
          type="button"
          onClick={() => onViewChange('search')}
          className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'search'
              ? 'text-amber-300 font-black'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              currentView === 'search' ? 'bg-black/30' : ''
            }`}
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] leading-tight font-bold tracking-tight mt-0.5">
            Tra Cứu
          </span>
        </button>

        {/* Tab 2: Cây Phả */}
        <button
          type="button"
          onClick={() => onViewChange('tree')}
          className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'tree'
              ? 'text-amber-300 font-black'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              currentView === 'tree' ? 'bg-black/30' : ''
            }`}
          >
            <GitGraph className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] leading-tight font-bold tracking-tight mt-0.5">
            Cây Phả
          </span>
        </button>

        {/* Tab 3: Dòng Tộc */}
        <button
          type="button"
          onClick={() => onViewChange('lineage')}
          className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'lineage'
              ? 'text-amber-300 font-black'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              currentView === 'lineage' ? 'bg-black/30' : ''
            }`}
          >
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] leading-tight font-bold tracking-tight mt-0.5">
            Dòng Tộc
          </span>
        </button>

        {/* Tab 4: Danh Sách */}
        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'list'
              ? 'text-amber-300 font-black'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              currentView === 'list' ? 'bg-black/30' : ''
            }`}
          >
            <ListFilter className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] leading-tight font-bold tracking-tight mt-0.5">
            Danh Sách
          </span>
        </button>
      </nav>
    </>
  );
};
