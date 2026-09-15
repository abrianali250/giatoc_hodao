import { Member, FilterState, AncestorInfo, PedigreeResult, MotherInfo, GrandmotherInfo } from '../types';
import { INITIAL_MEMBERS } from '../data/initialGenealogy';

const STORAGE_KEY = 'HO_DAO_GENEALOGY_V1';

/**
 * Remove Vietnamese accents for accurate accent-insensitive search
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

/**
 * Load members from LocalStorage or fallback to INITIAL_MEMBERS
 */
export function loadGenealogyData(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveGenealogyData(INITIAL_MEMBERS);
      return INITIAL_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seenIds = new Set<string>();
      const uniqueList: Member[] = [];
      for (const m of parsed) {
        if (m && m.id && !seenIds.has(m.id)) {
          seenIds.add(m.id);
          uniqueList.push(m);
        }
      }
      return uniqueList.length > 0 ? uniqueList : INITIAL_MEMBERS;
    }
  } catch (err) {
    console.error('Error loading genealogy from storage:', err);
  }
  return INITIAL_MEMBERS;
}

/**
 * Save members to LocalStorage
 */
export function saveGenealogyData(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Error saving genealogy to storage:', err);
  }
}

/**
 * Reset data back to original transcribed photo data
 */
export function resetToOriginalData(): Member[] {
  saveGenealogyData(INITIAL_MEMBERS);
  return INITIAL_MEMBERS;
}

/**
 * Find member by ID
 */
export function getMemberById(members: Member[], id: string | null | undefined): Member | undefined {
  if (!id) return undefined;
  return members.find((m) => m.id === id);
}

/**
 * Get spouses of a member
 */
export function getSpouses(members: Member[], member: Member): Member[] {
  if (!member.spouseIds || member.spouseIds.length === 0) return [];
  return member.spouseIds
    .map((id) => getMemberById(members, id))
    .filter((m): m is Member => !!m);
}

/**
 * Get children of a member (combining childrenIds + fatherId/motherId links)
 */
export function getChildren(members: Member[], member: Member): Member[] {
  const directChildrenIds = new Set(member.childrenIds || []);
  
  // Also check if any member points back to this member as father or mother
  members.forEach((m) => {
    if (m.fatherId === member.id || m.motherId === member.id) {
      directChildrenIds.add(m.id);
    }
  });

  return Array.from(directChildrenIds)
    .map((id) => getMemberById(members, id))
    .filter((m): m is Member => !!m)
    .sort((a, b) => (a.generation === b.generation ? a.fullName.localeCompare(b.fullName, 'vi') : a.generation - b.generation));
}

/**
 * Get parents of a member
 */
export function getParents(members: Member[], member: Member): { father?: Member; mother?: Member } {
  let father = getMemberById(members, member.fatherId);
  let mother = getMemberById(members, member.motherId);

  // If father or mother is missing, check if any member lists this member in childrenIds
  if (!father || !mother) {
    for (const m of members) {
      if (m.childrenIds && m.childrenIds.includes(member.id)) {
        if (!father && m.gender === 'male') {
          father = m;
        } else if (!mother && m.gender === 'female') {
          mother = m;
        }
      }
    }
  }

  return { father, mother };
}

/**
 * Get siblings of a member
 */
export function getSiblings(members: Member[], member: Member): Member[] {
  if (!member.fatherId && !member.motherId) return [];
  
  const siblings = members.filter((m) => {
    if (m.id === member.id) return false;
    const sameFather = member.fatherId && m.fatherId === member.fatherId;
    const sameMother = member.motherId && m.motherId === member.motherId;
    return sameFather || sameMother;
  });

  return siblings;
}

/**
 * Get all descendants (subtree) of a root member ID
 */
export function getAllDescendants(members: Member[], rootId: string): Member[] {
  const result: Member[] = [];
  const visited = new Set<string>();

  function traverse(currentId: string) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const currentMember = getMemberById(members, currentId);
    if (!currentMember) return;

    if (currentId !== rootId) {
      result.push(currentMember);
    }

    const children = getChildren(members, currentMember);
    children.forEach((child) => traverse(child.id));
  }

  traverse(rootId);
  return result;
}

/**
 * Get path from root down to this member (lineage chain / ancestor breadcrumb)
 */
export function getAncestorsChain(members: Member[], memberId: string): Member[] {
  const chain: Member[] = [];
  let current = getMemberById(members, memberId);

  while (current) {
    chain.unshift(current);
    if (current.fatherId) {
      current = getMemberById(members, current.fatherId);
    } else if (current.motherId) {
      current = getMemberById(members, current.motherId);
    } else {
      break;
    }
  }

  return chain;
}

/**
 * Get comprehensive ancestry for a member:
 * - Parents (Bố, Mẹ)
 * - Grandparents (Ông nội, Bà nội, Ông ngoại, Bà ngoại)
 * - Complete generational chain from Generation 1 (Cụ Khởi Tổ) down to the member
 */
export function getMemberPedigree(members: Member[], memberOrId: Member | string): PedigreeResult {
  const member = typeof memberOrId === 'string' ? getMemberById(members, memberOrId) : memberOrId;
  if (!member) {
    const fallbackMember: Member = typeof memberOrId === 'string'
      ? { id: memberOrId, fullName: '', gender: 'male', generation: 1, spouseIds: [], childrenIds: [], sourceVerified: false }
      : memberOrId;
    return {
      member: fallbackMember,
      mothers: [],
      paternalGrandmothers: [],
      ancestorChain: [],
      generationSpan: 0
    };
  }

  // 1. Parents (Bố, Mẹ) via fatherId/motherId and getParents fallback
  const parents = getParents(members, member);
  const father = parents.father;

  // 2. Resolve ALL mothers (Bố có thể có nhiều vợ: Vợ cả, Vợ hai, Mẹ kế...)
  const motherMap = new Map<string, { member: Member; isBiological: boolean; orderIndex: number }>();

  // A. Check biological mother from member.motherId
  if (member.motherId) {
    const bioMom = getMemberById(members, member.motherId);
    if (bioMom) {
      motherMap.set(bioMom.id, { member: bioMom, isBiological: true, orderIndex: 0 });
    }
  }

  // B. Check female members who list this member in childrenIds
  members.forEach((m) => {
    if (m.gender === 'female' && m.childrenIds && m.childrenIds.includes(member.id)) {
      if (!motherMap.has(m.id)) {
        motherMap.set(m.id, { member: m, isBiological: true, orderIndex: 0 });
      } else {
        motherMap.get(m.id)!.isBiological = true;
      }
    }
  });

  // C. If father exists, inspect all female spouses (wives) of father
  if (father) {
    const spouseList = getSpouses(members, father).filter((s) => s.gender === 'female');
    spouseList.forEach((sp, idx) => {
      const isBio = (member.motherId === sp.id) || (sp.childrenIds && sp.childrenIds.includes(member.id));
      if (!motherMap.has(sp.id)) {
        motherMap.set(sp.id, {
          member: sp,
          isBiological: !!isBio,
          orderIndex: idx + 1
        });
      } else {
        if (isBio) {
          motherMap.get(sp.id)!.isBiological = true;
        }
        motherMap.get(sp.id)!.orderIndex = idx + 1;
      }
    });
  }

  // Fallback if empty and getParents returned a mother
  if (motherMap.size === 0 && parents.mother) {
    motherMap.set(parents.mother.id, { member: parents.mother, isBiological: true, orderIndex: 1 });
  }

  // Sort mothers: keep father's wife order (Bà cả, Bà hai...) or biological priority
  const rawMothers = Array.from(motherMap.values()).sort((a, b) => {
    if (a.orderIndex !== 0 && b.orderIndex !== 0) {
      return a.orderIndex - b.orderIndex;
    }
    if (a.isBiological && !b.isBiological) return -1;
    if (!a.isBiological && b.isBiological) return 1;
    return a.orderIndex - b.orderIndex;
  });

  const totalMothers = rawMothers.length;
  const mothers: MotherInfo[] = rawMothers.map((item, idx) => {
    let roleLabel = '';
    const wifeOrdinal = item.orderIndex > 0 ? item.orderIndex : idx + 1;
    let wifeTitle = '';
    if (totalMothers > 1) {
      if (wifeOrdinal === 1) wifeTitle = 'Bà cả';
      else if (wifeOrdinal === 2) wifeTitle = 'Bà hai';
      else if (wifeOrdinal === 3) wifeTitle = 'Bà ba';
      else wifeTitle = `Bà thứ ${wifeOrdinal}`;
    }

    if (totalMothers === 1) {
      roleLabel = 'Mẹ (Thân mẫu)';
    } else {
      if (item.isBiological) {
        roleLabel = wifeTitle ? `Mẹ (${wifeTitle} • Thân mẫu)` : 'Mẹ đẻ (Thân mẫu)';
      } else {
        roleLabel = wifeTitle ? `Mẹ (${wifeTitle})` : 'Mẹ kế (Vợ của bố)';
      }
    }

    return {
      member: item.member,
      isBiological: item.isBiological,
      roleLabel
    };
  });

  const primaryMother = mothers.find((m) => m.isBiological)?.member || mothers[0]?.member || parents.mother;

  // 3. Grandparents (Ông nội, các bà nội, Ông ngoại, Bà ngoại)
  const fatherParents = father ? getParents(members, father) : { father: undefined, mother: undefined };
  const motherParents = primaryMother ? getParents(members, primaryMother) : { father: undefined, mother: undefined };

  const paternalGrandfather = fatherParents.father;

  // Resolve all paternal grandmothers (Ông nội có thể có nhiều vợ)
  const paternalGrandmothersMap = new Map<string, { member: Member; isBiological: boolean; orderIndex: number }>();
  if (father?.motherId) {
    const bioGrandmother = getMemberById(members, father.motherId);
    if (bioGrandmother) {
      paternalGrandmothersMap.set(bioGrandmother.id, { member: bioGrandmother, isBiological: true, orderIndex: 0 });
    }
  }
  if (paternalGrandfather) {
    const gSpouses = getSpouses(members, paternalGrandfather).filter((s) => s.gender === 'female');
    gSpouses.forEach((sp, idx) => {
      const isBio = (father?.motherId === sp.id) || (sp.childrenIds && father && sp.childrenIds.includes(father.id));
      if (!paternalGrandmothersMap.has(sp.id)) {
        paternalGrandmothersMap.set(sp.id, { member: sp, isBiological: !!isBio, orderIndex: idx + 1 });
      } else {
        if (isBio) paternalGrandmothersMap.get(sp.id)!.isBiological = true;
        paternalGrandmothersMap.get(sp.id)!.orderIndex = idx + 1;
      }
    });
  }
  if (paternalGrandmothersMap.size === 0 && fatherParents.mother) {
    paternalGrandmothersMap.set(fatherParents.mother.id, { member: fatherParents.mother, isBiological: true, orderIndex: 1 });
  }

  const rawGrandmothers = Array.from(paternalGrandmothersMap.values()).sort((a, b) => {
    if (a.orderIndex !== 0 && b.orderIndex !== 0) return a.orderIndex - b.orderIndex;
    if (a.isBiological && !b.isBiological) return -1;
    if (!a.isBiological && b.isBiological) return 1;
    return a.orderIndex - b.orderIndex;
  });

  const totalGM = rawGrandmothers.length;
  const paternalGrandmothers: GrandmotherInfo[] = rawGrandmothers.map((item, idx) => {
    let roleLabel = '';
    const wifeOrdinal = item.orderIndex > 0 ? item.orderIndex : idx + 1;
    let wifeTitle = '';
    if (totalGM > 1) {
      if (wifeOrdinal === 1) wifeTitle = 'Bà cả';
      else if (wifeOrdinal === 2) wifeTitle = 'Bà hai';
      else if (wifeOrdinal === 3) wifeTitle = 'Bà ba';
      else wifeTitle = `Bà thứ ${wifeOrdinal}`;
    }

    if (totalGM === 1) {
      roleLabel = 'Bà nội';
    } else {
      if (item.isBiological) {
        roleLabel = wifeTitle ? `Bà nội (${wifeTitle} • Thân mẫu của bố)` : 'Bà nội (Thân mẫu của bố)';
      } else {
        roleLabel = wifeTitle ? `Bà nội (${wifeTitle})` : 'Bà nội (Vợ của ông)';
      }
    }

    return {
      member: item.member,
      isBiological: item.isBiological,
      roleLabel
    };
  });

  const primaryPaternalGrandmother = paternalGrandmothers.find((g) => g.isBiological)?.member || paternalGrandmothers[0]?.member || fatherParents.mother;
  const maternalGrandfather = motherParents.father;
  const maternalGrandmother = motherParents.mother;

  // Build full ancestor path back to Generation 1
  const rawList: Member[] = [];
  const visited = new Set<string>();
  let current: Member | undefined = member;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    rawList.push(current);

    // Prefer patrilineal line, fallback to maternal
    const curParents = getParents(members, current);
    if (curParents.father && !visited.has(curParents.father.id)) {
      current = curParents.father;
    } else if (curParents.mother && !visited.has(curParents.mother.id)) {
      current = curParents.mother;
    } else {
      current = undefined;
    }
  }

  // Reverse so Generation 1 (or oldest) is at the top [0]
  rawList.reverse();

  const ancestorChain: AncestorInfo[] = rawList.map((m) => {
    const isCurrent = m.id === member.id;
    let relationTitle = '';

    if (isCurrent) {
      relationTitle = 'Bản thân';
    } else if (m.generation === 1) {
      relationTitle = 'Cụ Khởi Tổ (Đời 1)';
    } else {
      const diff = member.generation - m.generation;
      const isMale = m.gender === 'male';

      if (diff === 1) {
        relationTitle = isMale ? 'Bố (Thân phụ)' : 'Mẹ (Thân mẫu)';
      } else if (diff === 2) {
        relationTitle = isMale ? 'Ông nội' : 'Bà nội';
      } else if (diff === 3) {
        relationTitle = isMale ? 'Cụ cố (Cụ ông)' : 'Cụ cố (Cụ bà)';
      } else if (diff === 4) {
        relationTitle = isMale ? 'Kỵ ông' : 'Kỵ bà';
      } else if (diff === 5) {
        relationTitle = isMale ? 'Sơ ông' : 'Sơ bà';
      } else {
        relationTitle = isMale ? `Tiên tổ đời ${m.generation}` : `Tiên tổ bà đời ${m.generation}`;
      }
    }

    return {
      member: m,
      generation: m.generation,
      relationTitle,
      isCurrent
    };
  });

  const rootAncestor = ancestorChain[0]?.member;
  const generationSpan = ancestorChain.length;

  return {
    member,
    father,
    mother: primaryMother,
    mothers,
    paternalGrandfather,
    paternalGrandmother: primaryPaternalGrandmother,
    paternalGrandmothers,
    maternalGrandfather,
    maternalGrandmother,
    ancestorChain,
    rootAncestor,
    generationSpan
  };
}

/**
 * Filter and search members
 */
export function searchMembers(members: Member[], filter: FilterState): Member[] {
  const normKeyword = removeVietnameseTones(filter.keyword);

  return members.filter((member) => {
    // Keyword search: Full name, alias, notes, deathDate, etc.
    if (normKeyword) {
      const normName = removeVietnameseTones(member.fullName);
      const normAlias = removeVietnameseTones(member.alias || '');
      const normNotes = removeVietnameseTones(member.notes || '');
      const normBranch = removeVietnameseTones(member.branchName || '');
      const normDeath = removeVietnameseTones(member.deathDate || '');

      const matches =
        normName.includes(normKeyword) ||
        normAlias.includes(normKeyword) ||
        normNotes.includes(normKeyword) ||
        normBranch.includes(normKeyword) ||
        normDeath.includes(normKeyword);

      if (!matches) return false;
    }

    // Generation filter
    if (filter.generation !== 'all' && member.generation !== filter.generation) {
      return false;
    }

    // Gender filter
    if (filter.gender !== 'all' && member.gender !== filter.gender) {
      return false;
    }

    // Branch filter
    if (filter.branch !== 'all' && member.branchName !== filter.branch) {
      return false;
    }

    return true;
  });
}

/**
 * Find members by full name or alias (accent-insensitive, case-insensitive)
 */
export function findMembersByName(members: Member[], nameQuery: string): Member[] {
  const clean = removeVietnameseTones(nameQuery).trim().toLowerCase();
  if (!clean) return [];
  return members.filter((m) => {
    const mName = removeVietnameseTones(m.fullName).toLowerCase();
    const mAlias = removeVietnameseTones(m.alias || '').toLowerCase();
    return mName.includes(clean) || mAlias.includes(clean);
  });
}

/**
 * Reconcile a parent's children relationships and relocate any misplaced children.
 * If a child already existed under a wrong parent or with a wrong generation/branch,
 * this properly reassigns them, adjusts generation & descendants, and cleans old parents.
 */
export function reconcileParentChildren(
  membersList: Member[],
  parentId: string,
  desiredChildrenIds: string[]
): Member[] {
  const parent = getMemberById(membersList, parentId);
  if (!parent) return membersList;

  const isMale = parent.gender === 'male';
  const expectedChildGen = parent.generation + 1;
  const newSet = new Set(desiredChildrenIds);
  const oldChildrenOfParent = new Set(
    membersList
      .filter((m) => (isMale ? m.fatherId === parentId : m.motherId === parentId) || (parent.childrenIds || []).includes(m.id))
      .map((m) => m.id)
  );

  let updatedList = [...membersList];

  // 1. Process each desired child
  for (const childId of desiredChildrenIds) {
    const child = getMemberById(updatedList, childId);
    if (!child) continue;

    const oldParentId = isMale ? child.fatherId : child.motherId;

    // Clean up from old parent's childrenIds if it was different
    if (oldParentId && oldParentId !== parentId) {
      updatedList = updatedList.map((m) => {
        if (m.id === oldParentId) {
          return {
            ...m,
            childrenIds: (m.childrenIds || []).filter((id) => id !== childId)
          };
        }
        return m;
      });
    }

    // Calculate generation shift for this child and its recursive subtree
    const genDelta = expectedChildGen - child.generation;

    // Update child record
    updatedList = updatedList.map((m) => {
      if (m.id === childId) {
        return {
          ...m,
          fatherId: isMale ? parentId : m.fatherId,
          motherId: !isMale ? parentId : m.motherId,
          generation: expectedChildGen,
          branchName: m.branchName || parent.branchName
        };
      }
      return m;
    });

    // Shift recursive descendants of this child if generation was altered
    if (genDelta !== 0) {
      updatedList = shiftDescendantsGeneration(updatedList, childId, genDelta);
    }
  }

  // 2. Unlink any children that were removed from this parent
  for (const oldChildId of oldChildrenOfParent) {
    if (!newSet.has(oldChildId)) {
      updatedList = updatedList.map((m) => {
        if (m.id === oldChildId) {
          return {
            ...m,
            fatherId: isMale ? null : m.fatherId,
            motherId: !isMale ? null : m.motherId
          };
        }
        return m;
      });
    }
  }

  // 3. Ensure parent's childrenIds exactly matches desired list
  updatedList = updatedList.map((m) => {
    if (m.id === parentId) {
      return {
        ...m,
        childrenIds: Array.from(newSet)
      };
    }
    return m;
  });

  return updatedList;
}

/**
 * Add a new member and sync relationships with father, mother, spouses, and children.
 * If newCreatedChildren are supplied, they are created and linked as well.
 */
export function addMemberWithRelations(
  members: Member[],
  newMember: Member,
  newCreatedChildren: Member[] = []
): Member[] {
  const cleanMember: Member = {
    ...newMember,
    id: newMember.id || `dao_ba_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    spouseIds: newMember.spouseIds || [],
    childrenIds: newMember.childrenIds || [],
    fatherId: newMember.fatherId || null,
    motherId: newMember.motherId || null
  };

  // Adjust generation based on father/mother if not explicitly valid
  const father = cleanMember.fatherId ? getMemberById(members, cleanMember.fatherId) : undefined;
  const mother = cleanMember.motherId ? getMemberById(members, cleanMember.motherId) : undefined;
  if (father) {
    cleanMember.generation = father.generation + 1;
    if (father.branchName && !cleanMember.branchName) {
      cleanMember.branchName = father.branchName;
    }
  } else if (mother) {
    cleanMember.generation = mother.generation + 1;
    if (mother.branchName && !cleanMember.branchName) {
      cleanMember.branchName = mother.branchName;
    }
  }

  // Combine initial members with newly created children if any
  let updatedList = [...members, ...newCreatedChildren, cleanMember];

  // Sync father's childrenIds
  if (cleanMember.fatherId) {
    updatedList = updatedList.map((m) => {
      if (m.id === cleanMember.fatherId) {
        const cIds = m.childrenIds || [];
        return { ...m, childrenIds: cIds.includes(cleanMember.id) ? cIds : [...cIds, cleanMember.id] };
      }
      return m;
    });
  }

  // Sync mother's childrenIds
  if (cleanMember.motherId) {
    updatedList = updatedList.map((m) => {
      if (m.id === cleanMember.motherId) {
        const cIds = m.childrenIds || [];
        return { ...m, childrenIds: cIds.includes(cleanMember.id) ? cIds : [...cIds, cleanMember.id] };
      }
      return m;
    });
  }

  // Sync spouseIds
  if (cleanMember.spouseIds && cleanMember.spouseIds.length > 0) {
    updatedList = updatedList.map((m) => {
      if (cleanMember.spouseIds.includes(m.id)) {
        const sIds = m.spouseIds || [];
        return { ...m, spouseIds: sIds.includes(cleanMember.id) ? sIds : [...sIds, cleanMember.id] };
      }
      return m;
    });
  }

  // Reconcile children & re-parent any existing or new children
  if (cleanMember.childrenIds && cleanMember.childrenIds.length > 0) {
    updatedList = reconcileParentChildren(updatedList, cleanMember.id, cleanMember.childrenIds);
  }

  saveGenealogyData(updatedList);
  return updatedList;
}

/**
 * Update an existing member and sync all changed relationships,
 * ensuring no stale childrenIds remain in former parents,
 * AND relocating any children added that were previously in the wrong place!
 */
export function updateMemberWithRelations(
  members: Member[],
  updatedMember: Member,
  oldMember: Member,
  newCreatedChildren: Member[] = []
): Member[] {
  const targetId = updatedMember.id || oldMember.id;
  const newFatherId = updatedMember.fatherId || null;
  const newMotherId = updatedMember.motherId || null;
  const oldFatherId = oldMember.fatherId || null;
  const oldMotherId = oldMember.motherId || null;

  // 1. Add any brand new children to the list first
  let updatedList = [...members];
  if (newCreatedChildren.length > 0) {
    for (const newChild of newCreatedChildren) {
      if (!updatedList.some((m) => m.id === newChild.id)) {
        updatedList.push(newChild);
      }
    }
  }

  // Compute generation delta for the parent
  let targetGeneration = updatedMember.generation;
  const father = newFatherId ? getMemberById(updatedList, newFatherId) : undefined;
  const mother = newMotherId ? getMemberById(updatedList, newMotherId) : undefined;

  // If father changed and user didn't explicitly customize generation away from expected
  if (newFatherId && newFatherId !== oldFatherId && father) {
    targetGeneration = father.generation + 1;
  } else if (!newFatherId && newMotherId && newMotherId !== oldMotherId && mother) {
    targetGeneration = mother.generation + 1;
  }

  const genDelta = targetGeneration - oldMember.generation;

  const cleanUpdated: Member = {
    ...updatedMember,
    id: targetId,
    generation: targetGeneration,
    spouseIds: updatedMember.spouseIds || [],
    childrenIds: updatedMember.childrenIds || oldMember.childrenIds || [],
    fatherId: newFatherId,
    motherId: newMotherId,
    branchName: updatedMember.branchName || father?.branchName || mother?.branchName || oldMember.branchName
  };

  // 2. Clean up targetId from ANY member who is NOT newFatherId and NOT newMotherId
  updatedList = updatedList.map((m) => {
    if (m.id === targetId) {
      return cleanUpdated;
    }

    let modified = { ...m };

    if (m.id !== newFatherId && m.id !== newMotherId && (m.childrenIds || []).includes(targetId)) {
      modified.childrenIds = (m.childrenIds || []).filter((cid) => cid !== targetId);
    }

    return modified;
  });

  // If old member wasn't in members (edge case), add it
  if (!updatedList.some((m) => m.id === targetId)) {
    updatedList.push(cleanUpdated);
  }

  // 3. Add to new father's childrenIds
  if (newFatherId) {
    updatedList = updatedList.map((m) => {
      if (m.id === newFatherId) {
        const cIds = m.childrenIds || [];
        return {
          ...m,
          childrenIds: cIds.includes(targetId) ? cIds : [...cIds, targetId]
        };
      }
      return m;
    });
  }

  // 4. Add to new mother's childrenIds
  if (newMotherId) {
    updatedList = updatedList.map((m) => {
      if (m.id === newMotherId) {
        const cIds = m.childrenIds || [];
        return {
          ...m,
          childrenIds: cIds.includes(targetId) ? cIds : [...cIds, targetId]
        };
      }
      return m;
    });
  }

  // 5. Spouse changes
  const oldSpouses = oldMember.spouseIds || [];
  const newSpouses = cleanUpdated.spouseIds || [];

  const removedSpouses = oldSpouses.filter((sid) => !newSpouses.includes(sid));
  removedSpouses.forEach((sid) => {
    updatedList = updatedList.map((m) =>
      m.id === sid ? { ...m, spouseIds: (m.spouseIds || []).filter((id) => id !== targetId) } : m
    );
  });

  const addedSpouses = newSpouses.filter((sid) => !oldSpouses.includes(sid));
  addedSpouses.forEach((sid) => {
    updatedList = updatedList.map((m) =>
      m.id === sid
        ? {
            ...m,
            spouseIds: (m.spouseIds || []).includes(targetId)
              ? m.spouseIds
              : [...(m.spouseIds || []), targetId]
          }
        : m
    );
  });

  // 6. Shift descendants generations if parent generation changed
  if (genDelta !== 0) {
    updatedList = shiftDescendantsGeneration(updatedList, targetId, genDelta);
  }

  // 7. CRITICAL: RECONCILE CHILDREN & UPDATE MISPLACED CHILDREN
  // If children were added (or removed), this relocates any children who were under the wrong parent,
  // assigns this parent as their father/mother, resets their generation & subtree depth, and cleans old parents.
  updatedList = reconcileParentChildren(updatedList, targetId, cleanUpdated.childrenIds);

  saveGenealogyData(updatedList);
  return updatedList;
}

/**
 * Dedicated utility to update a member's father and/or mother directly
 */
export function updateMemberParents(
  members: Member[],
  childId: string,
  newFatherId: string | null,
  newMotherId: string | null
): { success: boolean; updatedMembers: Member[]; message: string } {
  console.groupCollapsed(`%c[genealogyUtils] updateMemberParents: childId=${childId}`, 'color: #8B2222; font-weight: bold;');
  console.log('📌 Input Parameters:', {
    childId,
    newFatherId: newFatherId ?? '(none)',
    newMotherId: newMotherId ?? '(none)',
    totalExistingMembers: members.length
  });

  const child = getMemberById(members, childId);
  if (!child) {
    console.error(`❌ [updateMemberParents] Child member not found with ID: ${childId}`);
    console.groupEnd();
    return { success: false, updatedMembers: members, message: 'Không tìm thấy thành viên cần cập nhật' };
  }

  console.log('👤 Target Child Current State:', {
    id: child.id,
    fullName: child.fullName,
    currentFatherId: child.fatherId || '(none)',
    currentMotherId: child.motherId || '(none)',
    currentGeneration: child.generation,
    childrenCount: (child.childrenIds || []).length
  });

  // 1. Validate father
  if (newFatherId) {
    const checkFather = checkCanSetParent(members, childId, newFatherId);
    console.log(`🔍 Father Relationship Check (id=${newFatherId}):`, checkFather);
    if (!checkFather.allowed) {
      console.warn(`⚠️ [updateMemberParents] Father validation failed: ${checkFather.reason}`);
      console.groupEnd();
      return { success: false, updatedMembers: members, message: `Lỗi chọn Cha: ${checkFather.reason}` };
    }
  }

  // 2. Validate mother
  if (newMotherId) {
    const checkMother = checkCanSetParent(members, childId, newMotherId);
    console.log(`🔍 Mother Relationship Check (id=${newMotherId}):`, checkMother);
    if (!checkMother.allowed) {
      console.warn(`⚠️ [updateMemberParents] Mother validation failed: ${checkMother.reason}`);
      console.groupEnd();
      return { success: false, updatedMembers: members, message: `Lỗi chọn Mẹ: ${checkMother.reason}` };
    }
  }

  const father = newFatherId ? getMemberById(members, newFatherId) : undefined;
  const mother = newMotherId ? getMemberById(members, newMotherId) : undefined;

  console.log('👪 Resolved Parents Details:', {
    father: father ? { id: father.id, fullName: father.fullName, generation: father.generation, currentChildrenCount: (father.childrenIds || []).length } : 'None',
    mother: mother ? { id: mother.id, fullName: mother.fullName, generation: mother.generation, currentChildrenCount: (mother.childrenIds || []).length } : 'None'
  });

  let expectedGen = child.generation;
  if (father) {
    expectedGen = father.generation + 1;
  } else if (mother) {
    expectedGen = mother.generation + 1;
  }

  const genDelta = expectedGen - child.generation;
  console.log(`📊 Generation Calculation: oldGen=${child.generation} ➔ newGen=${expectedGen} (delta=${genDelta})`);

  const unlinkedParents: string[] = [];

  let updatedList = members.map((m) => {
    if (m.id === childId) {
      return {
        ...m,
        fatherId: newFatherId || null,
        motherId: newMotherId || null,
        generation: expectedGen,
        branchName: m.branchName || father?.branchName || mother?.branchName
      };
    }

    // Clean up child from former parents
    if (m.id !== newFatherId && m.id !== newMotherId && (m.childrenIds || []).includes(childId)) {
      unlinkedParents.push(`${m.fullName} (${m.id})`);
      return {
        ...m,
        childrenIds: (m.childrenIds || []).filter((id) => id !== childId)
      };
    }

    return m;
  });

  if (unlinkedParents.length > 0) {
    console.log(`🧹 Cleaned child "${child.fullName}" from previous parents' childrenIds:`, unlinkedParents);
  }

  // Add child to new father's childrenIds
  if (newFatherId) {
    updatedList = updatedList.map((m) => {
      if (m.id === newFatherId) {
        const cIds = m.childrenIds || [];
        const nextCIds = cIds.includes(childId) ? cIds : [...cIds, childId];
        console.log(`🔗 Linked to new Father "${m.fullName}": children count went from ${cIds.length} ➔ ${nextCIds.length}`);
        return {
          ...m,
          childrenIds: nextCIds
        };
      }
      return m;
    });
  }

  // Add child to new mother's childrenIds
  if (newMotherId) {
    updatedList = updatedList.map((m) => {
      if (m.id === newMotherId) {
        const cIds = m.childrenIds || [];
        const nextCIds = cIds.includes(childId) ? cIds : [...cIds, childId];
        console.log(`🔗 Linked to new Mother "${m.fullName}": children count went from ${cIds.length} ➔ ${nextCIds.length}`);
        return {
          ...m,
          childrenIds: nextCIds
        };
      }
      return m;
    });
  }

  // Shift descendants if generation changed
  if (genDelta !== 0) {
    const descendants = getAllDescendants(updatedList, childId);
    console.log(`⚡ Shifting generations for ${descendants.length} descendants of "${child.fullName}" by delta ${genDelta}`);
    updatedList = shiftDescendantsGeneration(updatedList, childId, genDelta);
  }

  saveGenealogyData(updatedList);
  console.log(`💾 Saved updated genealogy dataset (${updatedList.length} members) to localStorage successfully.`);
  console.groupEnd();

  const fatherName = father ? father.fullName : 'Không rõ';
  const motherName = mother ? mother.fullName : 'Không rõ';

  return {
    success: true,
    updatedMembers: updatedList,
    message: `Đã cập nhật thân sinh của ${child.fullName}: Cha [${fatherName}], Mẹ [${motherName}]`
  };
}

/**
 * Delete a member safely and clean up relationship pointers
 */
export function deleteMemberWithRelations(members: Member[], memberId: string): Member[] {
  const target = getMemberById(members, memberId);
  if (!target) return members;

  const updatedList = members
    .filter((m) => m.id !== memberId)
    .map((m) => {
      let mod = { ...m };
      if (mod.fatherId === memberId) mod.fatherId = null;
      if (mod.motherId === memberId) mod.motherId = null;
      if (mod.spouseIds.includes(memberId)) {
        mod.spouseIds = mod.spouseIds.filter((id) => id !== memberId);
      }
      if (mod.childrenIds.includes(memberId)) {
        mod.childrenIds = mod.childrenIds.filter((id) => id !== memberId);
      }
      return mod;
    });

  saveGenealogyData(updatedList);
  return updatedList;
}

/**
 * Get distinct branch names for filter selectors
 */
export function getBranchNames(members: Member[]): string[] {
  const set = new Set<string>();
  members.forEach((m) => {
    if (m.branchName) set.add(m.branchName);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
}

/**
 * Get max generation in the genealogy
 */
export function getMaxGeneration(members: Member[]): number {
  return members.reduce((max, m) => (m.generation > max ? m.generation : max), 1);
}

/**
 * Validate whether a parent-child relationship is physically valid (prevents cycles)
 */
export function checkCanSetParent(
  members: Member[],
  childId: string,
  parentId: string
): { allowed: boolean; reason?: string } {
  if (!childId || !parentId) {
    return { allowed: false, reason: 'Thiếu thông tin thành viên' };
  }
  if (childId === parentId) {
    return { allowed: false, reason: 'Không thể gán một người làm cha/mẹ của chính mình' };
  }

  // Check if parentId is already a descendant of childId
  const descendants = getAllDescendants(members, childId);
  if (descendants.some((d) => d.id === parentId)) {
    return {
      allowed: false,
      reason: 'Gây vòng lặp gia phả: Thành viên nhận đang là con cháu của thành viên được kéo'
    };
  }

  return { allowed: true };
}

/**
 * Adjust generation for a node and all of its recursive descendants
 */
export function shiftDescendantsGeneration(
  members: Member[],
  rootMemberId: string,
  delta: number
): Member[] {
  if (delta === 0) return members;
  const descendantIds = new Set(getAllDescendants(members, rootMemberId).map((d) => d.id));
  descendantIds.add(rootMemberId);

  return members.map((m) => {
    if (descendantIds.has(m.id)) {
      return {
        ...m,
        generation: Math.max(1, m.generation + delta)
      };
    }
    return m;
  });
}

export type ConnectionRelationType =
  | 'source_is_parent'
  | 'source_is_child'
  | 'source_is_spouse'
  | 'disconnect';

/**
 * Apply drag-and-connect relationship between two members
 */
export function applyRelationshipConnection(
  members: Member[],
  sourceId: string,
  targetId: string,
  relationType: ConnectionRelationType
): { success: boolean; updatedMembers: Member[]; message: string } {
  const source = getMemberById(members, sourceId);
  const target = getMemberById(members, targetId);

  if (!source || !target) {
    return { success: false, updatedMembers: members, message: 'Không tìm thấy thành viên' };
  }

  let updatedList = [...members];

  if (relationType === 'source_is_parent') {
    const check = checkCanSetParent(updatedList, target.id, source.id);
    if (!check.allowed) {
      return { success: false, updatedMembers: members, message: check.reason || 'Quan hệ không hợp lệ' };
    }

    const isMale = source.gender === 'male';
    const oldParentId = isMale ? target.fatherId : target.motherId;

    // 1. Remove target from old parent's childrenIds if changed
    if (oldParentId && oldParentId !== source.id) {
      updatedList = updatedList.map((m) =>
        m.id === oldParentId
          ? { ...m, childrenIds: (m.childrenIds || []).filter((id) => id !== target.id) }
          : m
      );
    }

    // 2. Add target to source's childrenIds
    updatedList = updatedList.map((m) => {
      if (m.id === source.id) {
        const currentChildren = m.childrenIds || [];
        return {
          ...m,
          childrenIds: currentChildren.includes(target.id) ? currentChildren : [...currentChildren, target.id]
        };
      }
      return m;
    });

    // 3. Update target's fatherId / motherId
    const expectedGeneration = source.generation + 1;
    const genDelta = expectedGeneration - target.generation;

    updatedList = updatedList.map((m) => {
      if (m.id === target.id) {
        return {
          ...m,
          fatherId: isMale ? source.id : m.fatherId,
          motherId: !isMale ? source.id : m.motherId,
          branchName: m.branchName || source.branchName
        };
      }
      return m;
    });

    // 4. Shift target and descendants generations
    if (genDelta !== 0) {
      updatedList = shiftDescendantsGeneration(updatedList, target.id, genDelta);
    }

    saveGenealogyData(updatedList);
    return {
      success: true,
      updatedMembers: updatedList,
      message: `Đã kết nối: ${source.fullName} là ${isMale ? 'Cha (Thân phụ)' : 'Mẹ (Thân mẫu)'} của ${target.fullName}`
    };
  }

  if (relationType === 'source_is_child') {
    const check = checkCanSetParent(updatedList, source.id, target.id);
    if (!check.allowed) {
      return { success: false, updatedMembers: members, message: check.reason || 'Quan hệ không hợp lệ' };
    }

    const isMale = target.gender === 'male';
    const oldParentId = isMale ? source.fatherId : source.motherId;

    // 1. Remove source from old parent's childrenIds if changed
    if (oldParentId && oldParentId !== target.id) {
      updatedList = updatedList.map((m) =>
        m.id === oldParentId
          ? { ...m, childrenIds: (m.childrenIds || []).filter((id) => id !== source.id) }
          : m
      );
    }

    // 2. Add source to target's childrenIds
    updatedList = updatedList.map((m) => {
      if (m.id === target.id) {
        const currentChildren = m.childrenIds || [];
        return {
          ...m,
          childrenIds: currentChildren.includes(source.id) ? currentChildren : [...currentChildren, source.id]
        };
      }
      return m;
    });

    // 3. Update source's fatherId / motherId
    const expectedGeneration = target.generation + 1;
    const genDelta = expectedGeneration - source.generation;

    updatedList = updatedList.map((m) => {
      if (m.id === source.id) {
        return {
          ...m,
          fatherId: isMale ? target.id : m.fatherId,
          motherId: !isMale ? target.id : m.motherId,
          branchName: m.branchName || target.branchName
        };
      }
      return m;
    });

    // 4. Shift source and descendants generations
    if (genDelta !== 0) {
      updatedList = shiftDescendantsGeneration(updatedList, source.id, genDelta);
    }

    saveGenealogyData(updatedList);
    return {
      success: true,
      updatedMembers: updatedList,
      message: `Đã kết nối: ${source.fullName} là Con của ${target.fullName}`
    };
  }

  if (relationType === 'source_is_spouse') {
    updatedList = updatedList.map((m) => {
      if (m.id === source.id) {
        const spouses = m.spouseIds || [];
        return { ...m, spouseIds: spouses.includes(target.id) ? spouses : [...spouses, target.id] };
      }
      if (m.id === target.id) {
        const spouses = m.spouseIds || [];
        return { ...m, spouseIds: spouses.includes(source.id) ? spouses : [...spouses, source.id] };
      }
      return m;
    });

    saveGenealogyData(updatedList);
    return {
      success: true,
      updatedMembers: updatedList,
      message: `Đã kết nối quan hệ Vợ / Chồng giữa ${source.fullName} và ${target.fullName}`
    };
  }

  if (relationType === 'disconnect') {
    // Remove all direct ties between source and target
    updatedList = updatedList.map((m) => {
      let mod = { ...m };
      if (mod.id === target.id) {
        if (mod.fatherId === source.id) mod.fatherId = null;
        if (mod.motherId === source.id) mod.motherId = null;
        mod.spouseIds = (mod.spouseIds || []).filter((id) => id !== source.id);
        mod.childrenIds = (mod.childrenIds || []).filter((id) => id !== source.id);
      }
      if (mod.id === source.id) {
        if (mod.fatherId === target.id) mod.fatherId = null;
        if (mod.motherId === target.id) mod.motherId = null;
        mod.spouseIds = (mod.spouseIds || []).filter((id) => id !== target.id);
        mod.childrenIds = (mod.childrenIds || []).filter((id) => id !== target.id);
      }
      return mod;
    });

    saveGenealogyData(updatedList);
    return {
      success: true,
      updatedMembers: updatedList,
      message: `Đã hủy liên kết quan hệ giữa ${source.fullName} và ${target.fullName}`
    };
  }

  return { success: false, updatedMembers: members, message: 'Loại quan hệ không xác định' };
}

