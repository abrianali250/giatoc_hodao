import React, { useState, useEffect } from 'react';
import { Member, ViewMode } from './types';
import {
  loadGenealogyData,
  saveGenealogyData,
  resetToOriginalData,
  addMemberWithRelations,
  updateMemberWithRelations,
  updateMemberParents,
  deleteMemberWithRelations,
  applyRelationshipConnection,
  ConnectionRelationType,
  getMaxGeneration,
  getMemberById
} from './utils/genealogyUtils';
import { Navbar } from './components/Navbar';
import { TreeView } from './components/TreeView';
import { LineageExplorer } from './components/LineageExplorer';
import { SearchView } from './components/SearchView';
import { ListView } from './components/ListView';
import { MemberModal } from './components/MemberModal';
import { MemberFormModal } from './components/MemberFormModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { LoginModal } from './components/LoginModal';
import {
  testFirestoreConnection,
  subscribeToFirestore,
  bulkUploadMembersToFirestore,
  loadMembersFromFirestore,
  deleteMemberAndSyncToFirestore,
  syncFullTreeToFirestore
} from './utils/firestoreService';
import { Server, RefreshCw, ExternalLink, Database } from 'lucide-react';

export default function App() {
  // State
  const [members, setMembers] = useState<Member[]>(() => loadGenealogyData());
  const [currentView, setCurrentView] = useState<ViewMode>('tree');
  const [rootMemberId, setRootMemberId] = useState<string>('dao_ba_nham');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [prefilledData, setPrefilledData] = useState<Partial<Member> | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'huge'>('normal');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Cloud Database Integration State
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('HO_DAO_LAST_CLOUD_SYNC');
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Real-time Firestore Cloud Database listener on mount
  useEffect(() => {
    let isMounted = true;

    // Validate server connection
    testFirestoreConnection().catch((err) => console.warn('Firestore test connection:', err));

    // Listen to real-time changes
    const unsubscribe = subscribeToFirestore(
      (remoteMembers) => {
        if (!isMounted) return;
        setMembers(remoteMembers);
        saveGenealogyData(remoteMembers);
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setLastCloudSyncTime(timeStr);
        localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
        setCloudStatus('connected');
      },
      (err) => {
        console.warn('Lỗi kết nối máy chủ Firestore:', err);
        setCloudStatus('offline');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Always keep local storage updated
  useEffect(() => {
    saveGenealogyData(members);
  }, [members]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Push full state to Cloud Server Database
  const handleManualCloudPush = async () => {
    setIsCloudSyncing(true);
    try {
      await syncFullTreeToFirestore(members);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastCloudSyncTime(timeStr);
      localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
      setCloudStatus('connected');
      showToast(`Đã đồng bộ ${members.length} thành viên lên máy chủ đám mây!`, 'success');
    } catch (err: any) {
      console.error('Lỗi đẩy dữ liệu lên máy chủ:', err);
      showToast('Lỗi khi tải dữ liệu lên máy chủ đám mây.', 'error');
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Pull latest state from Cloud Server Database
  const handleManualCloudPull = async () => {
    setIsCloudSyncing(true);
    try {
      const cloudMembers = await loadMembersFromFirestore();
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
        saveGenealogyData(cloudMembers);
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setLastCloudSyncTime(timeStr);
        localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
        setCloudStatus('connected');
        showToast(`Đã nạp ${cloudMembers.length} thành viên từ máy chủ đám mây!`, 'success');
      } else {
        showToast('Máy chủ chưa có dữ liệu hoặc danh sách trống.', 'info');
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu máy chủ:', err);
      showToast('Lỗi khi tải dữ liệu từ máy chủ.', 'error');
      throw err;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Derive selected member dynamically
  const selectedMember = React.useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Font size class mapping for elderly readability
  const fontSizeClass =
    fontSizeScale === 'huge'
      ? 'text-lg sm:text-xl'
      : fontSizeScale === 'large'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const maxGenerations = React.useMemo(() => getMaxGeneration(members), [members]);

  const handleUpdateParents = async (childId: string, newFatherId: string | null, newMotherId: string | null) => {
    const result = updateMemberParents(members, childId, newFatherId, newMotherId);
    if (result.success) {
      const updatedList = [...result.updatedMembers];
      setMembers(updatedList);
      saveGenealogyData(updatedList);
      showToast(result.message, 'success');

      // Sync to cloud database
      setIsCloudSyncing(true);
      try {
        await bulkUploadMembersToFirestore(updatedList);
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setLastCloudSyncTime(timeStr);
      } catch (err) {
        console.error('Lỗi đồng bộ mây khi đổi cha mẹ:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMemberId(member.id);
  };

  const handleViewDescendants = (member: Member) => {
    setRootMemberId(member.id);
    setHighlightedMemberId(member.id);
    setCurrentView('tree');
  };

  const handleFocusOnTree = (member: Member) => {
    setRootMemberId('dao_ba_nham');
    setHighlightedMemberId(member.id);
    setCurrentView('tree');
  };

  const handleResetRootToGlobal = () => {
    setRootMemberId('dao_ba_nham');
    setHighlightedMemberId(null);
  };

  const handleSaveMember = async (memberData: Member, newChildren: Member[] = []) => {
    setIsCloudSyncing(true);
    try {
      if (editingMember) {
        const updated = updateMemberWithRelations(members, memberData, editingMember, newChildren);
        setMembers([...updated]);
        saveGenealogyData(updated);
        setEditingMember(null);
        showToast(`Đã cập nhật: ${memberData.fullName}`);
        await bulkUploadMembersToFirestore(updated);
      } else {
        const updated = addMemberWithRelations(members, memberData, newChildren);
        setMembers([...updated]);
        saveGenealogyData(updated);
        setIsAddModalOpen(false);
        showToast(`Đã thêm thành viên mới: ${memberData.fullName}`);
        await bulkUploadMembersToFirestore(updated);
      }
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastCloudSyncTime(timeStr);
      localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
    } catch (err) {
      console.error('Lỗi đồng bộ máy chủ khi lưu:', err);
      showToast('Đã lưu trên máy nhưng có lỗi khi tải lên máy chủ', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const target = getMemberById(members, memberId);
    const updated = deleteMemberWithRelations(members, memberId);
    setMembers([...updated]);
    saveGenealogyData(updated);
    if (selectedMemberId === memberId) {
      setSelectedMemberId(null);
    }
    if (rootMemberId === memberId) {
      setRootMemberId('dao_ba_nham');
    }
    setDeletingMember(null);
    showToast(`Đã xóa thành viên: ${target?.fullName || memberId}`, 'info');

    setIsCloudSyncing(true);
    try {
      await deleteMemberAndSyncToFirestore(memberId, updated);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastCloudSyncTime(timeStr);
      localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
      setCloudStatus('connected');
    } catch (err) {
      console.error('Lỗi đồng bộ mây khi xóa:', err);
      showToast('Đã xóa trong bộ nhớ tạm nhưng có lỗi đồng bộ máy chủ đám mây', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleConnectRelation = async (
    sourceId: string,
    targetId: string,
    relationType: ConnectionRelationType
  ) => {
    const result = applyRelationshipConnection(members, sourceId, targetId, relationType);
    if (result.success) {
      const updated = [...result.updatedMembers];
      setMembers(updated);
      saveGenealogyData(updated);
      showToast(result.message, 'success');

      setIsCloudSyncing(true);
      try {
        await bulkUploadMembersToFirestore(updated);
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setLastCloudSyncTime(timeStr);
      } catch (err) {
        console.error('Lỗi đồng bộ mây khi ghép nối quan hệ:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleRestoreOriginal = async () => {
    const resetList = resetToOriginalData();
    setMembers([...resetList]);
    saveGenealogyData(resetList);
    setRootMemberId('dao_ba_nham');
    setHighlightedMemberId(null);
    setSelectedMemberId(null);
    setIsBackupModalOpen(false);
    showToast('Đã khôi phục toàn bộ dữ liệu gốc gia phả họ Đào', 'info');

    setIsCloudSyncing(true);
    try {
      await syncFullTreeToFirestore(resetList);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastCloudSyncTime(timeStr);
      localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
      showToast('Đã đồng bộ lại dữ liệu gốc lên máy chủ đám mây!', 'success');
    } catch (err) {
      console.error('Lỗi đồng bộ mây khi khôi phục gốc:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleImportData = async (imported: Member[]) => {
    saveGenealogyData(imported);
    setMembers([...imported]);
    setRootMemberId(imported[0]?.id || 'dao_ba_nham');
    setSelectedMemberId(null);
    setIsBackupModalOpen(false);
    showToast(`Đã nhập thành công ${imported.length} thành viên vào gia phả`, 'success');

    setIsCloudSyncing(true);
    try {
      await syncFullTreeToFirestore(imported);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastCloudSyncTime(timeStr);
      localStorage.setItem('HO_DAO_LAST_CLOUD_SYNC', timeStr);
      showToast(`Đã lưu ${imported.length} thành viên lên máy chủ đám mây!`, 'success');
    } catch (err) {
      console.error('Lỗi đồng bộ mây khi nạp dữ liệu:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleEditRequest = (m: Member) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      showToast('Vui lòng đăng nhập quyền quản trị (admin / 123456) để chỉnh sửa', 'info');
    } else {
      setEditingMember(m);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F5F2ED] text-[#2C2C2C] flex flex-col font-sans selection:bg-[#8B2222] selection:text-white ${
        fontSizeScale === 'huge' ? 'text-lg' : fontSizeScale === 'large' ? 'text-base' : 'text-sm'
      }`}
    >
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAddModal={() => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            showToast('Vui lòng đăng nhập để thêm thành viên mới', 'info');
          } else {
            setPrefilledData(undefined);
            setIsAddModalOpen(true);
          }
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        totalMembers={members.length}
        maxGenerations={maxGenerations}
        fontSizeScale={fontSizeScale}
        onChangeFontSize={setFontSizeScale}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setIsLoggedIn(false);
          showToast('Đã đăng xuất', 'info');
        }}
        isCloudSyncing={isCloudSyncing}
        lastCloudSyncTime={lastCloudSyncTime}
        cloudStatus={cloudStatus}
      />

      {/* Cloud Server Database Real-Time Sync Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-b border-emerald-200 px-3.5 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2.5 text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Server className="w-4 h-4 text-emerald-700" />
            <span
              className={`w-2 h-2 rounded-full ${
                cloudStatus === 'offline' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
              }`}
            />
          </div>
          <div className="text-xs truncate">
            <strong className="text-emerald-900">Máy Chủ Đám Mây:</strong>{' '}
            <span className="text-emerald-800">
              {cloudStatus === 'offline' ? 'Ngoại tuyến' : 'Đang kết nối thời gian thực'} • Tự động đồng nhất mọi thiết bị
            </span>
            {lastCloudSyncTime && (
              <span className="hidden sm:inline text-emerald-700 font-medium ml-1.5">
                (Đồng bộ: {lastCloudSyncTime})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://giatoc-hodao.ai.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-semibold bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs transition-colors"
            title="Xem trang web đã xuất bản cho toàn gia tộc"
          >
            <span>Trang Publish: giatoc-hodao.ai.studio</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
          </a>

          <button
            type="button"
            onClick={handleManualCloudPull}
            disabled={isCloudSyncing}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Tải lại dữ liệu mới nhất từ máy chủ đám mây"
          >
            <RefreshCw className={`w-3 h-3 ${isCloudSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isCloudSyncing ? 'Đang tải...' : 'Tải Lại Mây'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Mở bảng quản lý cơ sở dữ liệu máy chủ & sao lưu"
          >
            <Database className="w-3 h-3 text-amber-200" />
            <span>Quản Lý CSDL</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 p-2.5 sm:p-5 pb-20 md:pb-5">
        {currentView === 'tree' && (
          <TreeView
            members={members}
            rootId={rootMemberId}
            highlightedMemberId={highlightedMemberId}
            selectedMemberId={selectedMember?.id}
            onSelectMember={handleSelectMember}
            fontSizeClass={fontSizeClass}
          />
        )}

        {currentView === 'lineage' && (
          <LineageExplorer
            members={members}
            onSelectMember={handleSelectMember}
            onViewDescendants={handleViewDescendants}
            onFocusOnTree={handleFocusOnTree}
            fontSizeClass={fontSizeClass}
          />
        )}

        {currentView === 'search' && (
          <SearchView
            members={members}
            onSelectMember={handleSelectMember}
            fontSizeClass={fontSizeClass}
          />
        )}

        {currentView === 'list' && (
          <ListView
            members={members}
            onSelectMember={handleSelectMember}
            onEditMember={handleEditRequest}
            onDeleteMember={(m) => {
              if (!isLoggedIn) {
                setIsLoginModalOpen(true);
                showToast('Vui lòng đăng nhập để xóa thành viên', 'info');
              } else {
                setDeletingMember(m);
              }
            }}
            fontSizeClass={fontSizeClass}
            isLoggedIn={isLoggedIn}
          />
        )}
      </main>

      {/* Scoped Subtree Active Indicator Banner */}
      {rootMemberId !== 'dao_ba_nham' && (
        <div className="fixed bottom-14 md:bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#8B2222] text-white px-4 py-2 rounded-full shadow-lg border border-[#D4AF37] flex items-center gap-3 text-xs sm:text-sm">
          <span>
            Đang xem nhánh con cháu của:{' '}
            <strong>{members.find((m) => m.id === rootMemberId)?.fullName}</strong>
          </span>
          <button
            type="button"
            onClick={handleResetRootToGlobal}
            className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#4A3700] px-2.5 py-0.5 rounded-full font-bold text-xs transition-colors cursor-pointer"
          >
            Xem toàn bộ dòng họ
          </button>
        </div>
      )}

      {/* Toast Notification Notification */}
      {toast && (
        <div
          className={`fixed bottom-16 md:bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl text-white font-medium text-xs sm:text-sm flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-red-700'
              : toast.type === 'info'
              ? 'bg-neutral-800'
              : 'bg-emerald-700'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <MemberModal
        member={selectedMember}
        members={members}
        onClose={() => setSelectedMemberId(null)}
        onSelectMember={handleSelectMember}
        onViewDescendants={handleViewDescendants}
        onFocusOnTree={handleFocusOnTree}
        onEdit={(m) => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            showToast('Vui lòng đăng nhập quyền quản trị (admin / 123456) để chỉnh sửa', 'info');
          } else {
            setEditingMember(m);
          }
        }}
        onDelete={(m) => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            showToast('Vui lòng đăng nhập để xóa thành viên', 'info');
          } else {
            setDeletingMember(m);
          }
        }}
        onConnectRelation={(sourceId, targetId, relType) => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            showToast('Vui lòng đăng nhập để ghép nối quan hệ', 'info');
          } else {
            handleConnectRelation(sourceId, targetId, relType);
          }
        }}
        onAddChild={(parent) => {
          if (!isLoggedIn) {
            setIsLoginModalOpen(true);
            showToast('Vui lòng đăng nhập để thêm con cái', 'info');
          } else {
            setPrefilledData({
              fatherId: parent.gender === 'male' ? parent.id : '',
              motherId: parent.gender === 'female' ? parent.id : '',
              generation: parent.generation + 1
            });
            setIsAddModalOpen(true);
          }
        }}
        onUpdateParents={handleUpdateParents}
        fontSizeClass={fontSizeClass}
        isLoggedIn={isLoggedIn}
      />

      <MemberFormModal
        isOpen={isAddModalOpen || !!editingMember}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMember(null);
          setPrefilledData(undefined);
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
        prefilledData={prefilledData}
        members={members}
      />

      <ConfirmDeleteModal
        member={deletingMember}
        members={members}
        onClose={() => setDeletingMember(null)}
        onConfirmDelete={handleDeleteMember}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        members={members}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreOriginal={handleRestoreOriginal}
        onImportData={handleImportData}
        onSyncToCloud={handleManualCloudPush}
        onReloadFromCloud={handleManualCloudPull}
        isCloudSyncing={isCloudSyncing}
        lastCloudSyncTime={lastCloudSyncTime}
        cloudStatus={cloudStatus}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(username, password) => {
          if (username === 'admin' && password === '123456') {
            setIsLoggedIn(true);
            setIsLoginModalOpen(false);
            showToast('Đăng nhập thành công, bạn đã có quyền sửa', 'success');
          } else {
            showToast('Sai tài khoản hoặc mật khẩu', 'error');
          }
        }}
      />
    </div>
  );
}
