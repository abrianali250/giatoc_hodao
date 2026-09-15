import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Member } from '../types';
import { buildLayoutTree, LayoutNode } from '../utils/treeLayoutEngine';
import { getChildren, getMemberById, getMaxGeneration, getAncestorsChain } from '../utils/genealogyUtils';
import { MemberCard } from './MemberCard';
import {
  ZoomIn,
  ZoomOut,
  Focus,
  FoldHorizontal,
  UnfoldHorizontal,
  Info,
  Search,
  Users
} from 'lucide-react';

interface TreeViewProps {
  members: Member[];
  rootId?: string;
  highlightedMemberId?: string | null;
  selectedMemberId?: string | null;
  onSelectMember: (member: Member) => void;
  onViewDescendants?: (member: Member) => void;
  onResetRootToGlobal?: () => void;
  onEditMember?: (member: Member) => void;
  onDeleteMember?: (member: Member) => void;
  onConnectRelation?: any;
  fontSizeClass?: string;
  isLoggedIn?: boolean;
}

export const TreeView: React.FC<TreeViewProps> = ({
  members,
  rootId = 'dao_ba_nham',
  highlightedMemberId,
  selectedMemberId,
  onSelectMember,
  fontSizeClass = 'text-base'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.85);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [jumpMemberId, setJumpMemberId] = useState<string>('');

  // Refs for tracking pinch-to-zoom & touch pan on mobile
  const touchStateRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startX: number;
    startY: number;
    initialDistance: number;
    initialScale: number;
    initialPosition: { x: number; y: number };
    midpoint: { x: number; y: number };
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    initialDistance: 0,
    initialScale: 0.85,
    initialPosition: { x: 40, y: 30 },
    midpoint: { x: 0, y: 0 }
  });

  // Clan global root is always used to view the full genealogical tree
  const globalRootId = useMemo(() => {
    // Check if dao_ba_nham exists, otherwise pick first member with min generation
    if (members.some((m) => m.id === 'dao_ba_nham')) return 'dao_ba_nham';
    const sorted = [...members].sort((a, b) => a.generation - b.generation);
    return sorted[0]?.id || rootId;
  }, [members, rootId]);

  // Build layout tree based on active root and collapsed states
  const { root: layoutRoot, bounds, edges } = useMemo(() => {
    return buildLayoutTree(members, globalRootId, collapsedIds);
  }, [members, globalRootId, collapsedIds]);

  const maxGen = useMemo(() => getMaxGeneration(members), [members]);

  // Flatten layout nodes for fast rendering
  const allNodes = useMemo(() => {
    const list: LayoutNode[] = [];
    const seen = new Set<string>();
    function traverse(node: LayoutNode | null) {
      if (!node) return;
      if (seen.has(node.id)) return;
      seen.add(node.id);
      list.push(node);
      if (!node.isCollapsed && node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(layoutRoot);
    return list;
  }, [layoutRoot]);

  // Toggle collapse for a member node
  const handleToggleCollapse = (memberId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Expand all branches
  const handleExpandAll = () => {
    setCollapsedIds(new Set());
  };

  // Collapse generation 3 and below to simplify reading massive trees
  const handleCollapseSubBranches = () => {
    const idsToCollapse = new Set<string>();
    members.forEach((m) => {
      if (m.generation >= 3 && m.childrenIds && m.childrenIds.length > 0) {
        idsToCollapse.add(m.id);
      }
    });
    setCollapsedIds(idsToCollapse);
  };

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(s * 1.2, 2.2));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.2, 0.25));
  const handleResetZoom = () => {
    setScale(0.85);
    centerTree();
  };

  // Center tree in container view
  const centerTree = useCallback(() => {
    if (!containerRef.current || !layoutRoot) return;
    const containerWidth = containerRef.current.clientWidth;
    const rootCenterX = (layoutRoot.x + layoutRoot.width / 2) * scale;
    setPosition({
      x: Math.max(20, containerWidth / 2 - rootCenterX),
      y: 40
    });
  }, [layoutRoot, scale]);

  // Jump to specific member on the tree
  const handleJumpToMember = (targetId: string) => {
    setJumpMemberId(targetId);
    if (!targetId) return;

    // 1. Ensure all ancestors of this target are uncollapsed so the target is visible
    const ancestors = getAncestorsChain(members, targetId);
    if (ancestors.length > 0) {
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        ancestors.forEach((anc) => next.delete(anc.id));
        return next;
      });
    }

    // 2. Find coordinates of target node in layout
    setTimeout(() => {
      const targetNode = allNodes.find((n) => n.id === targetId);
      if (targetNode && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const targetX = targetNode.x * scale;
        const targetY = targetNode.y * scale;

        setPosition({
          x: containerWidth / 2 - targetX - (targetNode.width / 2) * scale,
          y: containerHeight / 2 - targetY - (targetNode.height / 2) * scale
        });
      }
    }, 50);
  };

  // Auto center on initial mount
  useEffect(() => {
    centerTree();
  }, [centerTree]);

  // Center on highlighted member when requested from outside (e.g. search view)
  useEffect(() => {
    if (highlightedMemberId) {
      handleJumpToMember(highlightedMemberId);
    }
  }, [highlightedMemberId]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStateRef.current = {
          mode: 'pan',
          startX: touch.clientX - position.x,
          startY: touch.clientY - position.y,
          initialDistance: 0,
          initialScale: scale,
          initialPosition: { ...position },
          midpoint: { x: touch.clientX, y: touch.clientY }
        };
        setIsDragging(true);
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = getDistance(t1, t2);
        touchStateRef.current = {
          mode: 'pinch',
          startX: 0,
          startY: 0,
          initialDistance: dist,
          initialScale: scale,
          initialPosition: { ...position },
          midpoint: {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
          }
        };
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStateRef.current.mode === 'none') return;

      if (e.touches.length === 1 && touchStateRef.current.mode === 'pan') {
        const touch = e.touches[0];
        setPosition({
          x: touch.clientX - touchStateRef.current.startX,
          y: touch.clientY - touchStateRef.current.startY
        });
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const newDist = getDistance(t1, t2);
        const ratio = newDist / touchStateRef.current.initialDistance;

        const newScale = Math.min(
          Math.max(touchStateRef.current.initialScale * ratio, 0.25),
          2.5
        );

        const containerRect = container.getBoundingClientRect();
        const midX = touchStateRef.current.midpoint.x - containerRect.left;
        const midY = touchStateRef.current.midpoint.y - containerRect.top;

        const scaleDiff = newScale / touchStateRef.current.initialScale;
        const newPosX = midX - (midX - touchStateRef.current.initialPosition.x) * scaleDiff;
        const newPosY = midY - (midY - touchStateRef.current.initialPosition.y) * scaleDiff;

        setScale(newScale);
        setPosition({ x: newPosX, y: newPosY });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchStateRef.current.mode = 'none';
        setIsDragging(false);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStateRef.current = {
          mode: 'pan',
          startX: touch.clientX - position.x,
          startY: touch.clientY - position.y,
          initialDistance: 0,
          initialScale: scale,
          initialPosition: { ...position },
          midpoint: { x: touch.clientX, y: touch.clientY }
        };
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [position, scale]);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((s) => Math.min(Math.max(s * zoomFactor, 0.25), 2.2));
  };

  // Sort members for quick jump select
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.generation !== b.generation) return a.generation - b.generation;
      return a.fullName.localeCompare(b.fullName, 'vi');
    });
  }, [members]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[600px] bg-[#FDFBF7] border border-[#E0D8CC] rounded-2xl overflow-hidden shadow-inner flex flex-col select-none">
      {/* Top Floating Clean Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Title Badge & Member Count */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="px-3.5 py-2 bg-white/95 backdrop-blur-sm border border-[#E0D8CC] rounded-xl shadow-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B2222]"></span>
            <span className="font-bold text-[#2C2C2C] text-xs sm:text-sm font-serif">
              CÂY GIA PHẢ TOÀN TỘC HỌ ĐÀO
            </span>
            <span className="text-[11px] font-extrabold text-[#8B2222] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {members.length} Người • {maxGen} Đời
            </span>
          </div>
        </div>

        {/* Quick Jump Search + Zoom & Expand/Collapse Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#E0D8CC] p-1.5 rounded-xl shadow-md">
          {/* Quick Jump Dropdown to find and center any member in huge tree */}
          <div className="flex items-center gap-1 pl-1 pr-2 border-r border-[#E0D8CC]">
            <Search className="w-3.5 h-3.5 text-[#5A5A40]" />
            <select
              id="tree-quick-jump-select"
              value={jumpMemberId}
              onChange={(e) => handleJumpToMember(e.target.value)}
              className="text-xs font-bold text-[#2C2C2C] bg-transparent focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
            >
              <option value="">🔍 Nhảy tới người...</option>
              {sortedMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  Đời {m.generation}: {m.fullName} {m.alias ? `(${m.alias})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-tree-zoom-in"
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F2ED] text-[#5A5A40] font-bold transition-colors"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            id="btn-tree-zoom-out"
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F2ED] text-[#5A5A40] font-bold transition-colors"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            id="btn-tree-center"
            onClick={centerTree}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F2ED] text-[#5A5A40] font-bold transition-colors flex items-center gap-1 text-xs"
            title="Đưa về vị trí trung tâm"
          >
            <Focus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Căn giữa</span>
          </button>

          <button
            id="btn-tree-reset"
            onClick={handleResetZoom}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F2ED] text-[#5A5A40] font-bold transition-colors text-xs"
            title="Khôi phục tỷ lệ xem"
          >
            {Math.round(scale * 100)}%
          </button>

          <div className="h-5 w-px bg-[#E0D8CC] mx-0.5"></div>

          <button
            id="btn-tree-expand-all"
            onClick={handleExpandAll}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F2ED] text-[#5A5A40] font-medium text-xs flex items-center gap-1"
            title="Mở rộng tất cả các nhánh"
          >
            <UnfoldHorizontal className="w-4 h-4" />
            <span className="hidden md:inline">Mở hết nhánh</span>
          </button>

          <button
            id="btn-tree-collapse-sub"
            onClick={handleCollapseSubBranches}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5F2ED] text-[#5A5A40] font-medium text-xs flex items-center gap-1"
            title="Thu gọn các nhánh từ đời 3 trở xuống để dễ nhìn tổng quát"
          >
            <FoldHorizontal className="w-4 h-4" />
            <span className="hidden md:inline">Gọn nhánh</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        id="tree-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full h-full cursor-grab touch-none ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={{
          backgroundImage: `radial-gradient(#E0D8CC 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }}
      >
        {/* Transform Container for pan & zoom */}
        <div
          id="tree-transform-container"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: bounds.maxX + 400,
            height: bounds.maxY + 300,
            transition: isDragging ? 'none' : 'transform 0.12s ease-out'
          }}
          className="absolute top-0 left-0"
        >
          {/* Connecting Lines Layer */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: bounds.maxX + 400,
              height: bounds.maxY + 300
            }}
          >
            {/* Standard tree edges: parent to child paths */}
            {edges.map((edge, idx) => {
              const midY = (edge.fromY + edge.toY) / 2;
              const pathD = `M ${edge.fromX} ${edge.fromY} L ${edge.fromX} ${midY} L ${edge.toX} ${midY} L ${edge.toX} ${edge.toY}`;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#8B2222"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                  <circle cx={edge.toX} cy={edge.toY} r="3.5" fill="#8B2222" />
                </g>
              );
            })}
          </svg>

          {/* Member Cards Layer */}
          {allNodes.map((node) => {
            const rawChildren = getChildren(members, node.member);
            const isHighlighted = (highlightedMemberId === node.id) || (jumpMemberId === node.id);
            const isSelected = selectedMemberId === node.id;

            return (
              <div
                key={`tree-node-${node.id}`}
                id={`tree-node-${node.id}`}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`
                }}
              >
                <MemberCard
                  member={node.member}
                  spouses={node.spouses}
                  isRoot={node.id === globalRootId}
                  isHighlighted={isHighlighted}
                  isSelected={isSelected}
                  hasChildren={node.hasChildren}
                  isCollapsed={node.isCollapsed}
                  childrenCount={rawChildren.length}
                  fontSizeClass={fontSizeClass}
                  onSelect={onSelectMember}
                  onToggleCollapse={handleToggleCollapse}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating High Density Quick Zoom FABs on bottom right */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-full shadow-lg border border-[#E0D8CC] flex items-center justify-center text-xl font-bold hover:bg-[#F5F2ED] text-[#5A5A40] transition-colors"
          title="Phóng to"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-full shadow-lg border border-[#E0D8CC] flex items-center justify-center text-xl font-bold hover:bg-[#F5F2ED] text-[#5A5A40] transition-colors"
          title="Thu nhỏ"
        >
          -
        </button>
        <button
          onClick={centerTree}
          className="w-10 h-10 bg-white rounded-full shadow-lg border border-[#E0D8CC] flex items-center justify-center text-base hover:bg-[#F5F2ED] text-[#5A5A40] transition-colors"
          title="Căn giữa"
        >
          🎯
        </button>
      </div>

      {/* Bottom Information Guide Bar */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-2 pointer-events-none text-xs text-[#5A5A40] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-[#E0D8CC] shadow-xs">
        <Info className="w-3.5 h-3.5 text-[#8B2222]" />
        <span>
          Bấm vào thẻ để xem chi tiết • Kéo chuột/ngón tay để di chuyển • Nút [Mở / Thu] trên thẻ để xem từng nhánh
        </span>
      </div>
    </div>
  );
};
