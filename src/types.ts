export type Gender = 'male' | 'female' | 'other';

export interface Member {
  id: string;
  fullName: string;
  gender: Gender;
  generation: number;
  birthDate?: string;
  deathDate?: string;
  avatar?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouseIds: string[];
  childrenIds: string[];
  notes?: string;
  alias?: string; // Tự, Tức, Tên thường gọi
  branchName?: string; // Tên nhánh / ngành
  sourceVerified: boolean; // Đã xác minh từ ảnh gốc hay cần kiểm tra
  verificationNotes?: string;
  isAdopted?: boolean; // Con nuôi
  isAlive?: boolean; // Còn sống hay đã mất
  orderInFamily?: number; // Thứ tự sinh trong gia đình (1, 2, 3...)
}

export type ViewMode = 'tree' | 'lineage' | 'search' | 'list';

export interface FilterState {
  keyword: string;
  generation: number | 'all';
  gender: 'all' | Gender;
  branch: string | 'all';
}

export interface TreeCoordinate {
  id: string;
  x: number;
  y: number;
  member: Member;
  children: TreeCoordinate[];
  isCollapsed?: boolean;
}

export interface AncestorInfo {
  member: Member;
  generation: number;
  relationTitle: string;
  isCurrent: boolean;
}

export interface MotherInfo {
  member: Member;
  isBiological: boolean;
  roleLabel: string;
}

export interface GrandmotherInfo {
  member: Member;
  isBiological: boolean;
  roleLabel: string;
}

export interface PedigreeResult {
  member: Member;
  father?: Member;
  mother?: Member;
  mothers: MotherInfo[];
  paternalGrandfather?: Member;
  paternalGrandmother?: Member;
  paternalGrandmothers: GrandmotherInfo[];
  maternalGrandfather?: Member;
  maternalGrandmother?: Member;
  ancestorChain: AncestorInfo[];
  rootAncestor?: Member;
  generationSpan: number;
}
