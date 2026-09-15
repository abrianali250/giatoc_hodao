import { Member } from '../types';
import { getChildren, getSpouses, getMemberById, getAllDescendants } from './genealogyUtils';

export type TreeOrientation = 'vertical' | 'horizontal';

export interface LayoutNode {
  id: string;
  member: Member;
  spouses: Member[];
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
  hasChildren: boolean;
  isCollapsed: boolean;
  generation: number;
  directChildrenCount: number;
  totalDescendantsCount: number;
}

export interface TreeEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromId: string;
  toId: string;
  path: string;
}

const VERTICAL_CARD_WIDTH = 260;
const VERTICAL_SPOUSE_EXTRA_WIDTH = 110;
const VERTICAL_CARD_HEIGHT = 150;
const VERTICAL_GAP_X = 40; // Gap between sibling branches horizontally
const VERTICAL_GAP_Y = 90; // Gap between generations vertically

const HORIZONTAL_CARD_WIDTH = 260;
const HORIZONTAL_SPOUSE_EXTRA_WIDTH = 110;
const HORIZONTAL_CARD_HEIGHT = 145;
const HORIZONTAL_GAP_X = 90; // Gap between generations horizontally
const HORIZONTAL_GAP_Y = 24; // Gap between sibling cards vertically

/**
 * Calculates dynamic layout tree for family hierarchy supporting vertical (top-to-bottom)
 * and horizontal (left-to-right) orientations.
 */
export function buildLayoutTree(
  members: Member[],
  rootId: string,
  collapsedIds: Set<string>,
  orientation: TreeOrientation = 'vertical'
): {
  root: LayoutNode | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  edges: TreeEdge[];
  generationBounds: { generation: number; minCoord: number; maxCoord: number }[];
} {
  const rootMember = getMemberById(members, rootId);
  if (!rootMember) {
    return {
      root: null,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      edges: [],
      generationBounds: []
    };
  }

  // 1. Build recursive node structure with descendant metrics
  const visitedNodeIds = new Set<string>();

  function createNode(member: Member, level: number): LayoutNode {
    visitedNodeIds.add(member.id);
    const isCollapsed = collapsedIds.has(member.id);
    const spouses = getSpouses(members, member);
    const rawChildren = getChildren(members, member);
    const allDesc = getAllDescendants(members, member.id);

    // Recursively build children only if not collapsed and not already placed in tree
    const childrenList = isCollapsed
      ? []
      : rawChildren
          .filter((c) => !visitedNodeIds.has(c.id))
          .map((c) => createNode(c, level + 1));

    const cardWidth =
      orientation === 'vertical'
        ? spouses.length > 0
          ? VERTICAL_CARD_WIDTH + VERTICAL_SPOUSE_EXTRA_WIDTH
          : VERTICAL_CARD_WIDTH
        : spouses.length > 0
        ? HORIZONTAL_CARD_WIDTH + HORIZONTAL_SPOUSE_EXTRA_WIDTH
        : HORIZONTAL_CARD_WIDTH;

    const cardHeight = orientation === 'vertical' ? VERTICAL_CARD_HEIGHT : HORIZONTAL_CARD_HEIGHT;

    return {
      id: member.id,
      member,
      spouses,
      x: 0,
      y: 0,
      width: cardWidth,
      height: cardHeight,
      children: childrenList,
      hasChildren: rawChildren.length > 0,
      isCollapsed,
      generation: member.generation,
      directChildrenCount: rawChildren.length,
      totalDescendantsCount: allDesc.length
    };
  }

  const rootNode = createNode(rootMember, 1);

  if (orientation === 'vertical') {
    // ----------------------------------------------------
    // VERTICAL LAYOUT (Top-to-Bottom)
    // ----------------------------------------------------
    // Assign fixed Y by generation level relative to root
    const rootGen = rootMember.generation;
    function assignY(node: LayoutNode) {
      const genOffset = node.generation - rootGen;
      node.y = genOffset * (VERTICAL_CARD_HEIGHT + VERTICAL_GAP_Y) + 60;
      node.children.forEach(assignY);
    }
    assignY(rootNode);

    // Post-order traversal to calculate required subtree widths
    function getSubtreeWidth(node: LayoutNode): number {
      if (node.children.length === 0) {
        return node.width + VERTICAL_GAP_X;
      }
      const childrenWidth = node.children.reduce((acc, c) => acc + getSubtreeWidth(c), 0);
      return Math.max(node.width + VERTICAL_GAP_X, childrenWidth);
    }

    // Assign absolute X coordinates
    function assignAbsoluteX(node: LayoutNode, startX: number) {
      if (node.children.length === 0) {
        node.x = startX;
        return;
      }

      let currentX = startX;
      node.children.forEach((child) => {
        assignAbsoluteX(child, currentX);
        currentX += getSubtreeWidth(child);
      });

      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      const childrenCenter = (firstChild.x + firstChild.width / 2 + lastChild.x + lastChild.width / 2) / 2;
      node.x = childrenCenter - node.width / 2;
    }

    assignAbsoluteX(rootNode, 80);
  } else {
    // ----------------------------------------------------
    // HORIZONTAL LAYOUT (Left-to-Right)
    // ----------------------------------------------------
    // Assign fixed X by generation level relative to root
    const rootGen = rootMember.generation;
    function assignX(node: LayoutNode) {
      const genOffset = node.generation - rootGen;
      node.x = genOffset * (HORIZONTAL_CARD_WIDTH + HORIZONTAL_GAP_X) + 60;
      node.children.forEach(assignX);
    }
    assignX(rootNode);

    // Post-order traversal to calculate required subtree heights
    function getSubtreeHeight(node: LayoutNode): number {
      if (node.children.length === 0) {
        return node.height + HORIZONTAL_GAP_Y;
      }
      const childrenHeight = node.children.reduce((acc, c) => acc + getSubtreeHeight(c), 0);
      return Math.max(node.height + HORIZONTAL_GAP_Y, childrenHeight);
    }

    // Assign absolute Y coordinates
    function assignAbsoluteY(node: LayoutNode, startY: number) {
      if (node.children.length === 0) {
        node.y = startY;
        return;
      }

      let currentY = startY;
      node.children.forEach((child) => {
        assignAbsoluteY(child, currentY);
        currentY += getSubtreeHeight(child);
      });

      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      const childrenCenter = (firstChild.y + firstChild.height / 2 + lastChild.y + lastChild.height / 2) / 2;
      node.y = childrenCenter - node.height / 2;
    }

    assignAbsoluteY(rootNode, 80);
  }

  // Calculate bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  function calculateBounds(node: LayoutNode) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y + node.height);

    node.children.forEach(calculateBounds);
  }

  calculateBounds(rootNode);

  // Shift if coordinates are too close to edge or negative
  const targetMinX = 80;
  const targetMinY = 60;
  const shiftX = minX < targetMinX ? targetMinX - minX : 0;
  const shiftY = minY < targetMinY ? targetMinY - minY : 0;

  function shiftTree(node: LayoutNode) {
    node.x += shiftX;
    node.y += shiftY;
    node.children.forEach(shiftTree);
  }

  if (shiftX !== 0 || shiftY !== 0) {
    shiftTree(rootNode);
    minX += shiftX;
    maxX += shiftX;
    minY += shiftY;
    maxY += shiftY;
  }

  // Generate connecting edges
  const edges: TreeEdge[] = [];

  function generateEdges(node: LayoutNode) {
    if (node.children.length === 0) return;

    if (orientation === 'vertical') {
      const parentCenterX = node.x + node.width / 2;
      const parentBottomY = node.y + node.height;
      const midY = parentBottomY + VERTICAL_GAP_Y / 2;

      node.children.forEach((child) => {
        const childCenterX = child.x + child.width / 2;
        const childTopY = child.y;

        // Orthogonal connector path: Down -> Across -> Down
        const path = `M ${parentCenterX} ${parentBottomY} L ${parentCenterX} ${midY} L ${childCenterX} ${midY} L ${childCenterX} ${childTopY}`;

        edges.push({
          fromId: node.id,
          toId: child.id,
          fromX: parentCenterX,
          fromY: parentBottomY,
          toX: childCenterX,
          toY: childTopY,
          path
        });

        generateEdges(child);
      });
    } else {
      // Horizontal connector
      const parentRightX = node.x + node.width;
      const parentCenterY = node.y + node.height / 2;
      const midX = parentRightX + HORIZONTAL_GAP_X / 2;

      node.children.forEach((child) => {
        const childLeftX = child.x;
        const childCenterY = child.y + child.height / 2;

        // Smooth cubic bezier or orthogonal path for horizontal tree
        // Bezier creates very organic genealogy branch feel
        const path = `M ${parentRightX} ${parentCenterY} C ${midX} ${parentCenterY}, ${midX} ${childCenterY}, ${childLeftX} ${childCenterY}`;

        edges.push({
          fromId: node.id,
          toId: child.id,
          fromX: parentRightX,
          fromY: parentCenterY,
          toX: childLeftX,
          toY: childCenterY,
          path
        });

        generateEdges(child);
      });
    }
  }

  generateEdges(rootNode);

  // Group generations for visual level ruler
  const genMap = new Map<number, { minCoord: number; maxCoord: number }>();
  function trackGen(node: LayoutNode) {
    const coord = orientation === 'vertical' ? node.y : node.x;
    const size = orientation === 'vertical' ? node.height : node.width;
    const existing = genMap.get(node.generation);
    if (!existing) {
      genMap.set(node.generation, { minCoord: coord, maxCoord: coord + size });
    } else {
      existing.minCoord = Math.min(existing.minCoord, coord);
      existing.maxCoord = Math.max(existing.maxCoord, coord + size);
    }
    node.children.forEach(trackGen);
  }
  trackGen(rootNode);

  const generationBounds = Array.from(genMap.entries())
    .map(([generation, b]) => ({ generation, minCoord: b.minCoord, maxCoord: b.maxCoord }))
    .sort((a, b) => a.generation - b.generation);

  return {
    root: rootNode,
    bounds: {
      minX: Math.min(0, minX - 120),
      maxX: maxX + 160,
      minY: Math.min(0, minY - 100),
      maxY: maxY + 160
    },
    edges,
    generationBounds
  };
}

