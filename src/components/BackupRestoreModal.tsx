import React, { useState } from 'react';
import { Member } from '../types';
import {
  X,
  Database,
  Cloud,
  HardDrive,
  RotateCcw,
  Check,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Copy,
  ClipboardCheck,
  Server,
  Globe,
  Radio
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  members: Member[];
  onClose: () => void;
  onRestoreOriginal: () => void;
  onImportData: (importedMembers: Member[]) => void;
  onSyncToCloud: () => Promise<void>;
  onReloadFromCloud: () => Promise<void>;
  isCloudSyncing: boolean;
  lastCloudSyncTime: string | null;
  cloudStatus: 'connected' | 'syncing' | 'offline';
}

type ModalTab = 'cloud' | 'local' | 'reset';

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  members,
  onClose,
  onRestoreOriginal,
  onImportData,
  onSyncToCloud,
  onReloadFromCloud,
  isCloudSyncing,
  lastCloudSyncTime,
  cloudStatus
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('cloud');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Custom confirmation modal state for destructive operations
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    danger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');
  const [isPastingOpen, setIsPastingOpen] = useState(false);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleManualCloudPush = async () => {
    try {
      await onSyncToCloud();
      showStatus(`Đã tải toàn bộ ${members.length} thành viên lên máy chủ đám mây thành công!`, 'success');
    } catch {
      showStatus('Lỗi khi tải dữ liệu lên máy chủ đám mây.', 'error');
    }
  };

  const handleManualCloudPull = async () => {
    try {
      await onReloadFromCloud();
      showStatus('Đã tải lại dữ liệu mới nhất từ máy chủ đám mây thành công!', 'success');
    } catch {
      showStatus('Lỗi khi tải lại dữ liệu từ máy chủ đám mây.', 'error');
    }
  };

  // Local Export & Import
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GiaPha_HoDao_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showStatus('Đã tải tệp sao lưu JSON về máy tính!', 'success');
  };

  const handleCopyJson = async () => {
    try {
      const jsonText = JSON.stringify(members, null, 2);
      await navigator.clipboard.writeText(jsonText);
      setIsCopied(true);
      showStatus(`Đã sao chép dữ liệu (${members.length} thành viên) vào bộ nhớ tạm!`, 'success');
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      showStatus('Không thể sao chép tự động. Bạn hãy dùng nút Tải File JSON.', 'error');
    }
  };

  const handleImportPastedJson = () => {
    try {
      if (!pasteInputText.trim()) {
        showStatus('Vui lòng dán nội dung JSON vào ô trước khi nạp.', 'error');
        return;
      }
      const parsed = JSON.parse(pasteInputText);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].fullName) {
        setConfirmDialog({
          isOpen: true,
          title: 'Nạp Dữ Liệu Từ Văn Bản Đã Dán',
          description: `Dữ liệu chứa ${parsed.length} thành viên. Nạp dữ liệu này sẽ thay thế danh sách hiện tại trên cả máy tính và máy chủ đám mây. Bạn có muốn tiếp tục?`,
          confirmText: 'Xác Nhận Nạp & Đồng Bộ',
          danger: true,
          onConfirm: async () => {
            onImportData(parsed);
            showStatus(`Đã nạp thành công ${parsed.length} thành viên!`, 'success');
            setPasteInputText('');
            setIsPastingOpen(false);
            setConfirmDialog(null);
          }
        });
      } else {
        showStatus('Dữ liệu dán vào không đúng cấu trúc danh sách gia phả.', 'error');
      }
    } catch {
      showStatus('Văn bản dán vào không phải định dạng JSON hợp lệ.', 'error');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].fullName) {
            setConfirmDialog({
              isOpen: true,
              title: 'Nạp Dữ Liệu Từ Tệp Máy Tính',
              description: `Tệp chứa ${parsed.length} thành viên. Nạp tệp này sẽ thay thế danh sách gia phả hiện tại và lưu trực tiếp lên máy chủ đám mây. Bạn có chắc chắn muốn tiếp tục?`,
              confirmText: 'Đồng Ý Nạp',
              danger: true,
              onConfirm: () => {
                onImportData(parsed);
                showStatus(`Đã nạp thành công ${parsed.length} thành viên từ tệp!`, 'success');
                setConfirmDialog(null);
              }
            });
          } else {
            showStatus('Tập tin không đúng định dạng dữ liệu gia phả.', 'error');
          }
        } catch {
          showStatus('Lỗi đọc tập tin JSON. Vui lòng kiểm tra lại.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border-2 border-[#E0D8CC] rounded-2xl shadow-2xl overflow-hidden text-[#2C2C2C] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#8B2222] text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 font-serif font-bold text-base sm:text-lg">
            <Database className="w-5 h-5 text-amber-300" />
            <span>Cơ Sở Dữ Liệu Máy Chủ & Sao Lưu Gia Phả</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E0D8CC] bg-[#FDFBF7] px-4 pt-2 gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'cloud'
                ? 'bg-white text-[#8B2222] border-[#8B2222] shadow-2xs'
                : 'text-[#5A5A40] border-transparent hover:text-[#8B2222]'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Máy Chủ Đám Mây (Tự Động)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Trực tuyến" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'local'
                ? 'bg-white text-[#8B2222] border-[#8B2222] shadow-2xs'
                : 'text-[#5A5A40] border-transparent hover:text-[#8B2222]'
            }`}
          >
            <HardDrive className="w-4 h-4 text-[#8B2222]" />
            <span>Tệp JSON Máy Tính</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reset')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'reset'
                ? 'bg-white text-red-700 border-red-700 shadow-2xs'
                : 'text-[#5A5A40] border-transparent hover:text-red-700'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>Khôi Phục Bản Gốc</span>
          </button>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 flex-shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-b border-emerald-200 text-emerald-800'
                : statusMessage.type === 'error'
                ? 'bg-red-50 border-b border-red-200 text-red-800'
                : 'bg-blue-50 border-b border-blue-200 text-blue-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            ) : (
              <Cloud className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CLOUD SERVER DATABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Primary Status Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/30 border-2 border-emerald-200 rounded-2xl shadow-xs space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-black text-base sm:text-lg text-[#2C2C2C]">
                          Cơ Sở Dữ Liệu Máy Chủ Đám Mây
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                          <span>{cloudStatus === 'offline' ? 'Ngoại tuyến' : 'Trực tuyến (Real-time)'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#5A5A40] mt-0.5">
                        Dữ liệu được lưu trực tiếp trên Cloud Server của hệ thống AI Studio.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Published Link Assurance Box */}
                <div className="p-3 bg-white/90 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Đồng nhất 100% với liên kết đã xuất bản (Publish):</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono text-[#8B2222]">
                    <span className="truncate font-bold">https://giatoc-hodao.ai.studio/</span>
                    <a
                      href="https://giatoc-hodao.ai.studio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-sans font-bold text-[11px] flex-shrink-0"
                    >
                      <span>Mở link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-[#5A5A40] leading-relaxed">
                    ✨ <strong>Không cần Google Drive hay đăng nhập tài khoản:</strong> Mọi thành viên trong họ khi mở link trên điện thoại hoặc máy tính bất kỳ đều tự động nhìn thấy dữ liệu mới nhất được đồng bộ ngay lập tức!
                  </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase block">Tổng Thành Viên</span>
                    <span className="text-lg font-black text-emerald-800">{members.length} người</span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase block">Đồng Bộ Gần Nhất</span>
                    <span className="text-xs font-bold text-emerald-800">
                      {lastCloudSyncTime ? lastCloudSyncTime : 'Thời gian thực (Tự động)'}
                    </span>
                  </div>
                </div>

                {/* Cloud Action Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleManualCloudPush}
                    disabled={isCloudSyncing}
                    className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#8B2222] hover:bg-[#711616] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className={`w-4 h-4 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
                    <span>{isCloudSyncing ? 'Đang tải lên...' : 'Đẩy Toàn Bộ Dữ Liệu Lên Máy Chủ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleManualCloudPull}
                    disabled={isCloudSyncing}
                    className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-[#D5CBC0] text-[#2C2C2C] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-600 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                    <span>Tải Lại Từ Máy Chủ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCAL JSON FILE */}
          {activeTab === 'local' && (
            <div className="space-y-3">
              {/* Notice */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold flex items-center gap-1 text-amber-950 mb-0.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sao lưu dự phòng ngoại tuyến (Offline Backup):</span>
                </strong>
                <p>
                  Bạn có thể tải tệp JSON về máy tính cá nhân hoặc gửi file cho người quản trị khác làm bản lưu trữ an toàn khi không có mạng.
                </p>
              </div>

              {/* Export Section */}
              <div className="p-4 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl space-y-2">
                <h4 className="font-bold text-[#2C2C2C] text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#8B2222]" />
                  <span>1. Xuất Dữ Liệu Gia Phả Ra JSON</span>
                </h4>
                <p className="text-xs text-[#5A5A40]">
                  Lưu trữ danh sách {members.length} thành viên hiện tại ra tập tin hoặc sao chép nhanh vào bộ nhớ tạm.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 bg-[#8B2222] hover:bg-[#711616] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File Sao Lưu (.JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="px-3.5 py-2 bg-white hover:bg-[#F0EBE1] text-[#2C2C2C] border border-[#D5CBC0] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? (
                      <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#8B2222]" />
                    )}
                    <span>{isCopied ? 'Đã Sao Chép!' : 'Sao Chép Toàn Bộ JSON'}</span>
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div className="p-4 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl space-y-2.5">
                <h4 className="font-bold text-[#2C2C2C] text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span>2. Khôi Phục Dữ Liệu Từ File Hoặc Dán JSON</span>
                </h4>
                <p className="text-xs text-[#5A5A40]">
                  Nạp lại gia phả từ tệp .json máy tính hoặc dán trực tiếp mã JSON đã sao chép.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#B8962E] text-[#4A3700] font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Chọn Tệp JSON Từ Máy</span>
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsPastingOpen(!isPastingOpen)}
                    className="px-3.5 py-2 bg-white hover:bg-neutral-100 text-[#2C2C2C] border border-[#D5CBC0] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {isPastingOpen ? 'Ẩn Ô Dán JSON' : 'Dán Mã JSON Trực Tiếp...'}
                  </button>
                </div>

                {isPastingOpen && (
                  <div className="mt-3 p-3 bg-white border border-[#D5CBC0] rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-[#5A5A40] block">
                      Dán nội dung JSON gia phả vào khung bên dưới:
                    </label>
                    <textarea
                      value={pasteInputText}
                      onChange={(e) => setPasteInputText(e.target.value)}
                      placeholder='[ { "id": "dao_ba_nham", "fullName": "Đào Bá Nhẫm", ... } ]'
                      rows={4}
                      className="w-full text-xs font-mono p-2.5 border border-[#E0D8CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B2222] bg-[#FDFBF7]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPasteInputText('');
                          setIsPastingOpen(false);
                        }}
                        className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 font-semibold"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleImportPastedJson}
                        disabled={!pasteInputText.trim()}
                        className="px-3.5 py-1.5 bg-[#8B2222] hover:bg-[#711616] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                      >
                        Cập Nhật Ngay Vào Cây Gia Phả
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RESET TO ORIGINAL */}
          {activeTab === 'reset' && (
            <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Khôi Phục Bản Gốc Ban Đầu</h4>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Xóa toàn bộ các chỉnh sửa tạm thời và khôi phục danh sách hơn 140 thành viên chuẩn theo tư liệu
                    phả hệ Cụ Đào Bá Nhẫm, đồng thời cập nhật dữ liệu gốc này lên máy chủ đám mây.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'Khôi Phục Phả Hệ Gốc',
                      description:
                        'Bạn có chắc chắn muốn xóa toàn bộ thay đổi và đặt lại gia phả về bản gốc ban đầu của Cụ Đào Bá Nhẫm? Thao tác này sẽ đồng bộ lại lên máy chủ.',
                      confirmText: 'Xác Nhận Khôi Phục Bản Gốc',
                      danger: true,
                      onConfirm: () => {
                        onRestoreOriginal();
                        showStatus('Đã khôi phục thành công danh sách gia phả gốc ban đầu!', 'success');
                        setConfirmDialog(null);
                      }
                    });
                  }}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Xác Nhận Khôi Phục Về Dữ Liệu Gốc</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FDFBF7] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#E0D8CC] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#5A5A40]">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Máy chủ đám mây hoạt động 24/7 cho toàn gia tộc</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Overlay */}
      {confirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="w-full max-w-md bg-white border-2 border-[#E0D8CC] rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  confirmDialog.danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#2C2C2C]">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5A5A40] leading-relaxed">{confirmDialog.description}</p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-colors cursor-pointer ${
                  confirmDialog.danger ? 'bg-red-700 hover:bg-red-800' : 'bg-[#8B2222] hover:bg-[#711616]'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
