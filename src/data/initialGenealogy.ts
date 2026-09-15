import { Member } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  // ==========================================
  // ĐỜI 1: CAO CAO TẰNG TỔ KHẢO & TỔ TỈ
  // ==========================================
  {
    id: 'dao_ba_nham',
    fullName: 'Đào Bá Nhẫm',
    alias: 'Tự Phúc Huỳnh',
    gender: 'male',
    generation: 1,
    deathDate: 'Tạ thế 11.4',
    spouseIds: ['vu_thi_tan', 'nguyen_thi_vo'],
    childrenIds: [
      'dao_thi_di',
      'dao_thi_diem',
      'dao_ba_tu_1',
      'dao_ba_hue',
      'dao_ba_hien',
      'dao_ba_nguyen_1',
      'dao_ba_tu_2',
      'dao_ba_nam_1',
      'dao_ba_luyen'
    ],
    notes: 'Cao Cao Tằng Tổ Khảo họ Đào - Đời thứ 1',
    sourceVerified: true
  },
  {
    id: 'vu_thi_tan',
    fullName: 'Vũ Thị Tân',
    gender: 'female',
    generation: 1,
    deathDate: 'Tạ thế 25.11',
    spouseIds: ['dao_ba_nham'],
    childrenIds: [
      'dao_thi_di',
      'dao_thi_diem',
      'dao_ba_tu_1',
      'dao_ba_hue',
      'dao_ba_hien',
      'dao_ba_nguyen_1',
      'dao_ba_tu_2',
      'dao_ba_nam_1',
      'dao_ba_luyen'
    ],
    notes: 'Cao Cao Tằng Tổ Tỉ - Vợ Cụ Đào Bá Nhẫm',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_vo',
    fullName: 'Nguyễn Thị Vớ',
    gender: 'female',
    generation: 1,
    deathDate: 'Tạ thế 17.12',
    spouseIds: ['dao_ba_nham'],
    childrenIds: [],
    notes: 'Cao Cao Tằng Tổ Tỉ - Vợ Cụ Đào Bá Nhẫm',
    sourceVerified: true
  },

  // ==========================================
  // ĐỜI 2: CÁC CON CỦA CỤ ĐÀO BÁ NHẪM (9 NHÁNH)
  // ==========================================
  // Nhánh 1: Đào Thị Di
  {
    id: 'dao_thi_di',
    fullName: 'Đào Thị Di',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 14.01',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: [],
    childrenIds: [
      'dang_duc_diep',
      'dang_duc_luy',
      'dang_thi_nham',
      'dang_thi_muc',
      'dang_duc_thang'
    ],
    notes: 'Nhánh con gái Đời 2',
    branchName: 'Nhánh Cụ Đào Thị Di',
    sourceVerified: true
  },
  // Nhánh 2: Đào Thị Diễm
  {
    id: 'dao_thi_diem',
    fullName: 'Đào Thị Diễm',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 09.02',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: [],
    childrenIds: ['le_van_nhan', 'le_thi_cap'],
    notes: 'Nhánh con gái Đời 2',
    branchName: 'Nhánh Cụ Đào Thị Diễm',
    sourceVerified: true
  },
  // Nhánh 3: Đào Bá Từ
  {
    id: 'dao_ba_tu_1',
    fullName: 'Đào Bá Từ',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 25.5.1967',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['tran_thi_tra'],
    childrenIds: [
      'dao_ba_liem_1',
      'dao_ba_thuc',
      'dao_thi_diem_child',
      'dao_thi_be',
      'dao_thi_phan',
      'dao_ba_khoa'
    ],
    notes: 'Nhánh Cụ Đào Bá Từ',
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'tran_thi_tra',
    fullName: 'Trần Thị Trà',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 21.9.1961',
    spouseIds: ['dao_ba_tu_1'],
    childrenIds: [
      'dao_ba_liem_1',
      'dao_ba_thuc',
      'dao_thi_diem_child',
      'dao_thi_be',
      'dao_thi_phan',
      'dao_ba_khoa'
    ],
    notes: 'Vợ Cụ Đào Bá Từ',
    sourceVerified: true
  },
  // Nhánh 4: Đào Bá Huệ
  {
    id: 'dao_ba_hue',
    fullName: 'Đào Bá Huệ',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 04.4.1966',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['vu_thi_an', 'nguyen_thi_nghien'],
    childrenIds: [
      'dao_thi_ai',
      'dao_ba_tam',
      'dao_ba_chi',
      'dao_thi_que',
      'dao_thi_but',
      'dao_thi_thap',
      'dao_ba_ut'
    ],
    notes: 'Nhánh Cụ Đào Bá Huệ',
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'vu_thi_an',
    fullName: 'Vũ Thị Ân',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 19.8.1953',
    spouseIds: ['dao_ba_hue'],
    childrenIds: [
      'dao_thi_ai',
      'dao_ba_tam',
      'dao_ba_chi',
      'dao_thi_que',
      'dao_thi_but',
      'dao_thi_thap',
      'dao_ba_ut'
    ],
    notes: 'Vợ 1 Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_nghien',
    fullName: 'Nguyễn Thị Nghiễn',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 12.11.2001',
    spouseIds: ['dao_ba_hue'],
    childrenIds: [],
    notes: 'Vợ 2 Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  // Nhánh 5: Đào Bá Hiến
  {
    id: 'dao_ba_hien',
    fullName: 'Đào Bá Hiến',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 22.4',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['ninh_thi_le'],
    childrenIds: [
      'dao_ba_tuoc',
      'dao_ba_pham',
      'dao_ba_trieu',
      'dao_ba_phuc',
      'dao_thi_thai',
      'dao_thi_hien_gen3'
    ],
    notes: 'Nhánh Cụ Đào Bá Hiến',
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  {
    id: 'ninh_thi_le',
    fullName: 'Ninh Thị Lễ',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 14.9',
    spouseIds: ['dao_ba_hien'],
    childrenIds: [
      'dao_ba_tuoc',
      'dao_ba_pham',
      'dao_ba_trieu',
      'dao_ba_phuc',
      'dao_thi_thai',
      'dao_thi_hien_gen3'
    ],
    notes: 'Vợ Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  // Nhánh 6: Đào Bá Nguyện
  {
    id: 'dao_ba_nguyen_1',
    fullName: 'Đào Bá Nguyện',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 20.8.1977',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['dao_thi_ngu'],
    childrenIds: [
      'dao_ba_huyen',
      'dao_ba_duc',
      'dao_thi_quy',
      'dao_ba_chiem',
      'dao_thi_suu',
      'dao_ba_chinh'
    ],
    notes: 'Nhánh Cụ Đào Bá Nguyện',
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  {
    id: 'dao_thi_ngu',
    fullName: 'Đào Thị Ngữ',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 24 tháng Giêng',
    spouseIds: ['dao_ba_nguyen_1'],
    childrenIds: [
      'dao_ba_huyen',
      'dao_ba_duc',
      'dao_thi_quy',
      'dao_ba_chiem',
      'dao_thi_suu',
      'dao_ba_chinh'
    ],
    notes: 'Vợ Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  // Nhánh 7: Đào Bá Tự
  {
    id: 'dao_ba_tu_2',
    fullName: 'Đào Bá Tự',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 13.7',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['nguyen_thi_hiep', 'dang_thi_tu'],
    childrenIds: [
      'dao_ba_toan',
      'dao_ba_loi',
      'dao_thi_mui',
      'dao_ba_tai',
      'dao_thi_chan',
      'dao_thi_chien'
    ],
    notes: 'Nhánh Cụ Đào Bá Tự',
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_hiep',
    fullName: 'Nguyễn Thị Hiệp',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 10.4',
    spouseIds: ['dao_ba_tu_2'],
    childrenIds: [
      'dao_ba_toan',
      'dao_ba_loi',
      'dao_thi_mui',
      'dao_ba_tai',
      'dao_thi_chan',
      'dao_thi_chien'
    ],
    notes: 'Vợ 1 Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'dang_thi_tu',
    fullName: 'Đặng Thị Tụ',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 21.11',
    spouseIds: ['dao_ba_tu_2'],
    childrenIds: [],
    notes: 'Vợ 2 Cụ Đào Bá Tự',
    sourceVerified: true
  },
  // Nhánh 8: Đào Bá Năm
  {
    id: 'dao_ba_nam_1',
    fullName: 'Đào Bá Năm',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 06.4',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['dao_thi_tinh', 'dao_thi_huu'],
    childrenIds: [
      'dao_ba_liem_2',
      'dao_ba_kim',
      'dao_thi_thanh',
      'dao_ba_phuong',
      'dao_ba_cuong'
    ],
    notes: 'Nhánh Cụ Đào Bá Năm',
    branchName: 'Nhánh Cụ Đào Bá Năm',
    sourceVerified: true
  },
  {
    id: 'dao_thi_tinh',
    fullName: 'Đào Thị Tính',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 05.12',
    spouseIds: ['dao_ba_nam_1'],
    childrenIds: [
      'dao_ba_liem_2',
      'dao_ba_kim',
      'dao_thi_thanh',
      'dao_ba_phuong',
      'dao_ba_cuong'
    ],
    notes: 'Vợ 1 Cụ Đào Bá Năm',
    sourceVerified: true
  },
  {
    id: 'dao_thi_huu',
    fullName: 'Đào Thị Hữu',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 13.10',
    spouseIds: ['dao_ba_nam_1'],
    childrenIds: [],
    notes: 'Vợ 2 Cụ Đào Bá Năm',
    sourceVerified: true
  },
  // Nhánh 9: Đào Bá Luyến
  {
    id: 'dao_ba_luyen',
    fullName: 'Đào Bá Luyến',
    gender: 'male',
    generation: 2,
    deathDate: 'Tạ thế 28.3.1991',
    fatherId: 'dao_ba_nham',
    motherId: 'vu_thi_tan',
    spouseIds: ['mac_thi_thanh'],
    childrenIds: [
      'dao_ba_nguyen_2',
      'dao_ba_tuyen_1',
      'dao_ba_tuyen_2',
      'dao_thi_thao',
      'dao_thi_xuyen'
    ],
    notes: 'Nhánh Cụ Đào Bá Luyến',
    branchName: 'Nhánh Cụ Đào Bá Luyến',
    sourceVerified: true
  },
  {
    id: 'mac_thi_thanh',
    fullName: 'Mạc Thị Thành',
    gender: 'female',
    generation: 2,
    deathDate: 'Tạ thế 30 tháng Giêng 2006',
    spouseIds: ['dao_ba_luyen'],
    childrenIds: [
      'dao_ba_nguyen_2',
      'dao_ba_tuyen_1',
      'dao_ba_tuyen_2',
      'dao_thi_thao',
      'dao_thi_xuyen'
    ],
    notes: 'Vợ Cụ Đào Bá Luyến',
    sourceVerified: true
  },

  // ==========================================
  // ĐỜI 3: HẬU DUỆ ĐỜI 3
  // ==========================================
  // Con Cụ Đào Thị Di:
  {
    id: 'dang_duc_diep',
    fullName: 'Đặng Đức Diệp',
    gender: 'male',
    generation: 3,
    motherId: 'dao_thi_di',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Thị Di',
    sourceVerified: true
  },
  {
    id: 'dang_duc_luy',
    fullName: 'Đặng Đức Lũy',
    gender: 'male',
    generation: 3,
    motherId: 'dao_thi_di',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Thị Di',
    sourceVerified: true
  },
  {
    id: 'dang_thi_nham',
    fullName: 'Đặng Thị Nhâm',
    gender: 'female',
    generation: 3,
    motherId: 'dao_thi_di',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Thị Di',
    sourceVerified: true
  },
  {
    id: 'dang_thi_muc',
    fullName: 'Đặng Thị Mức',
    gender: 'female',
    generation: 3,
    motherId: 'dao_thi_di',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Thị Di',
    sourceVerified: true
  },
  {
    id: 'dang_duc_thang',
    fullName: 'Đặng Đức Thắng',
    gender: 'male',
    generation: 3,
    motherId: 'dao_thi_di',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Thị Di',
    sourceVerified: true
  },

  // Con Cụ Đào Thị Diễm:
  {
    id: 'le_van_nhan',
    fullName: 'Lê Văn Nhẫn',
    gender: 'male',
    generation: 3,
    motherId: 'dao_thi_diem',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Thị Diễm',
    sourceVerified: true
  },
  {
    id: 'le_thi_cap',
    fullName: 'Lê Thị Cấp',
    alias: 'Con nuôi',
    isAdopted: true,
    gender: 'female',
    generation: 3,
    motherId: 'dao_thi_diem',
    spouseIds: [],
    childrenIds: [],
    notes: 'Con nuôi cụ Đào Thị Diễm',
    branchName: 'Nhánh Cụ Đào Thị Diễm',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Từ & Trần Thị Trà:
  {
    id: 'dao_ba_liem_1',
    fullName: 'Đào Bá Liêm',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_tu_1',
    motherId: 'tran_thi_tra',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_thuc',
    fullName: 'Đào Bá Thức',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_tu_1',
    motherId: 'tran_thi_tra',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_thi_diem_child',
    fullName: 'Đào Thị Điểm',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_tu_1',
    motherId: 'tran_thi_tra',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_thi_be',
    fullName: 'Đào Thị Bé',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_tu_1',
    motherId: 'tran_thi_tra',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_thi_phan',
    fullName: 'Đào Thị Phấn',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_tu_1',
    motherId: 'tran_thi_tra',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_khoa',
    fullName: 'Đào Bá Khoa',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_tu_1',
    motherId: 'tran_thi_tra',
    spouseIds: [],
    childrenIds: [
      'dao_ba_hai',
      'dao_ba_dong',
      'dao_ba_son',
      'dao_ba_bac',
      'dao_thi_thuy_gen4',
      'dao_ba_viet'
    ],
    notes: 'Thân sinh các con đời 4 nhánh Cụ Từ',
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Huệ & Vũ Thị Ân:
  {
    id: 'dao_thi_ai',
    fullName: 'Đào Thị Ái',
    gender: 'female',
    generation: 3,
    deathDate: '10.7',
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_tam',
    fullName: 'Đào Bá Tâm',
    alias: 'Cương',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: ['dao_thi_au'],
    childrenIds: [
      'dao_van_chung',
      'dao_thi_thuy_tam',
      'dao_thi_huong',
      'dao_quang_thanh',
      'dao_ba_tuan'
    ],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_thi_au',
    fullName: 'Đào Thị Ậu',
    alias: 'Loan',
    gender: 'female',
    generation: 3,
    deathDate: 'Tạ thế 12.3.1991',
    spouseIds: ['dao_ba_tam'],
    childrenIds: [
      'dao_van_chung',
      'dao_thi_thuy_tam',
      'dao_thi_huong',
      'dao_quang_thanh',
      'dao_ba_tuan'
    ],
    notes: 'Vợ ông Đào Bá Tâm',
    sourceVerified: true
  },
  {
    id: 'dao_ba_chi',
    fullName: 'Đào Bá Chí',
    alias: 'Tức Bình',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: ['nguyen_thi_nguyet'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_nguyet',
    fullName: 'Nguyễn Thị Nguyệt',
    gender: 'female',
    generation: 3,
    spouseIds: ['dao_ba_chi'],
    childrenIds: [],
    notes: 'Vợ ông Đào Bá Chí (chữ trong ảnh có thể là Hà Nguyệt/Nguyệt)',
    sourceVerified: false,
    verificationNotes: 'Tên trong ảnh chữ hơi mờ (Nguyễn Thị Hà/Nguyệt), cần xác nhận lại'
  },
  {
    id: 'dao_thi_que',
    fullName: 'Đào Thị Quế',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: ['nguyen_xuan_mien'],
    childrenIds: ['nguyen_thi_chi', 'nguyen_xuan_hung', 'nguyen_thi_bich_lien'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_xuan_mien',
    fullName: 'Nguyễn Xuân Miền',
    gender: 'male',
    generation: 3,
    spouseIds: ['dao_thi_que'],
    childrenIds: ['nguyen_thi_chi', 'nguyen_xuan_hung', 'nguyen_thi_bich_lien'],
    notes: 'Chồng bà Đào Thị Quế',
    sourceVerified: true
  },
  {
    id: 'dao_thi_but',
    fullName: 'Đào Thị Bút',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: ['nguyen_xuan_liem'],
    childrenIds: ['nguyen_duc_thanh', 'nguyen_duc_thuan', 'nguyen_duc_hoa'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_xuan_liem',
    fullName: 'Nguyễn Xuân Liêm',
    gender: 'male',
    generation: 3,
    spouseIds: ['dao_thi_but'],
    childrenIds: ['nguyen_duc_thanh', 'nguyen_duc_thuan', 'nguyen_duc_hoa'],
    notes: 'Chồng bà Đào Thị Bút',
    sourceVerified: true
  },
  {
    id: 'dao_thi_thap',
    fullName: 'Đào Thị Thấp',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: ['vu_dinh_toan'],
    childrenIds: ['vu_thi_dung', 'vu_dinh_dung', 'vu_dinh_tu', 'vu_thi_phuong'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'vu_dinh_toan',
    fullName: 'Vũ Đình Toàn',
    gender: 'male',
    generation: 3,
    spouseIds: ['dao_thi_thap'],
    childrenIds: ['vu_thi_dung', 'vu_dinh_dung', 'vu_dinh_tu', 'vu_thi_phuong'],
    notes: 'Chồng bà Đào Thị Thấp',
    sourceVerified: true
  },
  {
    id: 'dao_ba_ut',
    fullName: 'Đào Bá Út',
    gender: 'male',
    generation: 3,
    deathDate: '1965',
    fatherId: 'dao_ba_hue',
    motherId: 'vu_thi_an',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Hiến & Ninh Thị Lễ:
  {
    id: 'dao_ba_tuoc',
    fullName: 'Đào Bá Tước',
    alias: 'Tuấn',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_hien',
    motherId: 'ninh_thi_le',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  {
    id: 'dao_ba_pham',
    fullName: 'Đào Bá Phẩm',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_hien',
    motherId: 'ninh_thi_le',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  {
    id: 'dao_ba_trieu',
    fullName: 'Đào Bá Triều',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_hien',
    motherId: 'ninh_thi_le',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  {
    id: 'dao_ba_phuc',
    fullName: 'Đào Bá Phục',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_hien',
    motherId: 'ninh_thi_le',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  {
    id: 'dao_thi_thai',
    fullName: 'Đào Thị Thái',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_hien',
    motherId: 'ninh_thi_le',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },
  {
    id: 'dao_thi_hien_gen3',
    fullName: 'Đào Thị Hiền',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_hien',
    motherId: 'ninh_thi_le',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Hiến',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Nguyện & Đào Thị Ngữ:
  {
    id: 'dao_ba_huyen',
    fullName: 'Đào Bá Huyền',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nguyen_1',
    motherId: 'dao_thi_ngu',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  {
    id: 'dao_ba_duc',
    fullName: 'Đào Bá Đức',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nguyen_1',
    motherId: 'dao_thi_ngu',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  {
    id: 'dao_thi_quy',
    fullName: 'Đào Thị Quý',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_nguyen_1',
    motherId: 'dao_thi_ngu',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  {
    id: 'dao_ba_chiem',
    fullName: 'Đào Bá Chiêm',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nguyen_1',
    motherId: 'dao_thi_ngu',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  {
    id: 'dao_thi_suu',
    fullName: 'Đào Thị Sửu',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_nguyen_1',
    motherId: 'dao_thi_ngu',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },
  {
    id: 'dao_ba_chinh',
    fullName: 'Đào Bá Chinh',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nguyen_1',
    motherId: 'dao_thi_ngu',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Nguyện',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Tự & Nguyễn Thị Hiệp:
  {
    id: 'dao_ba_toan',
    fullName: 'Đào Bá Toan',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_tu_2',
    motherId: 'nguyen_thi_hiep',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'dao_ba_loi',
    fullName: 'Đào Bá Lợi',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_tu_2',
    motherId: 'nguyen_thi_hiep',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'dao_thi_mui',
    fullName: 'Đào Thị Mùi',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_tu_2',
    motherId: 'nguyen_thi_hiep',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'dao_ba_tai',
    fullName: 'Đào Bá Tài',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_tu_2',
    motherId: 'nguyen_thi_hiep',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'dao_thi_chan',
    fullName: 'Đào Thị Chản',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_tu_2',
    motherId: 'nguyen_thi_hiep',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },
  {
    id: 'dao_thi_chien',
    fullName: 'Đào Thị Chiến',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_tu_2',
    motherId: 'nguyen_thi_hiep',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Tự',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Năm & Đào Thị Tính:
  {
    id: 'dao_ba_liem_2',
    fullName: 'Đào Bá Liêm',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nam_1',
    motherId: 'dao_thi_tinh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Năm',
    sourceVerified: true
  },
  {
    id: 'dao_ba_kim',
    fullName: 'Đào Bá Kim',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nam_1',
    motherId: 'dao_thi_tinh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Năm',
    sourceVerified: true
  },
  {
    id: 'dao_thi_thanh',
    fullName: 'Đào Thị Thanh',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_nam_1',
    motherId: 'dao_thi_tinh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Năm',
    sourceVerified: true
  },
  {
    id: 'dao_ba_phuong',
    fullName: 'Đào Bá Phương',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nam_1',
    motherId: 'dao_thi_tinh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Năm',
    sourceVerified: true
  },
  {
    id: 'dao_ba_cuong',
    fullName: 'Đào Bá Cường',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_nam_1',
    motherId: 'dao_thi_tinh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Năm',
    sourceVerified: true
  },

  // Con Cụ Đào Bá Luyến & Mạc Thị Thành:
  {
    id: 'dao_ba_nguyen_2',
    fullName: 'Đào Bá Nguyên',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_luyen',
    motherId: 'mac_thi_thanh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Luyến',
    sourceVerified: true
  },
  {
    id: 'dao_ba_tuyen_1',
    fullName: 'Đào Bá Tuyên',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_luyen',
    motherId: 'mac_thi_thanh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Luyến',
    sourceVerified: true
  },
  {
    id: 'dao_ba_tuyen_2',
    fullName: 'Đào Bá Tuyến',
    gender: 'male',
    generation: 3,
    fatherId: 'dao_ba_luyen',
    motherId: 'mac_thi_thanh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Luyến',
    sourceVerified: true
  },
  {
    id: 'dao_thi_thao',
    fullName: 'Đào Thị Thảo',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_luyen',
    motherId: 'mac_thi_thanh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Luyến',
    sourceVerified: true
  },
  {
    id: 'dao_thi_xuyen',
    fullName: 'Đào Thị Xuyến',
    gender: 'female',
    generation: 3,
    fatherId: 'dao_ba_luyen',
    motherId: 'mac_thi_thanh',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Luyến',
    sourceVerified: true
  },

  // ==========================================
  // ĐỜI 4: HẬU DUỆ ĐỜI 4
  // ==========================================
  // Con thuộc nhánh Cụ Đào Bá Từ:
  {
    id: 'dao_ba_hai',
    fullName: 'Đào Bá Hải',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_khoa',
    spouseIds: ['nguyen_thi_phuong_hai'],
    childrenIds: ['dao_ba_hung'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_phuong_hai',
    fullName: 'Nguyễn Thị Phương',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_ba_hai'],
    childrenIds: ['dao_ba_hung'],
    notes: 'Vợ ông Đào Bá Hải',
    sourceVerified: true
  },
  {
    id: 'dao_ba_dong',
    fullName: 'Đào Bá Đông',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_khoa',
    spouseIds: ['ngo_thi_hanh'],
    childrenIds: ['dao_ba_hoang'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'ngo_thi_hanh',
    fullName: 'Ngô Thị Hạnh',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_ba_dong'],
    childrenIds: ['dao_ba_hoang'],
    notes: 'Vợ ông Đào Bá Đông',
    sourceVerified: true
  },
  {
    id: 'dao_ba_son',
    fullName: 'Đào Bá Sơn',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_khoa',
    spouseIds: ['nguyen_thi_duyen'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_duyen',
    fullName: 'Nguyễn Thị Duyên',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_ba_son'],
    childrenIds: [],
    notes: 'Vợ ông Đào Bá Sơn',
    sourceVerified: true
  },
  {
    id: 'dao_ba_bac',
    fullName: 'Đào Bá Bắc',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_khoa',
    spouseIds: ['nguyen_thi_oanh'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_oanh',
    fullName: 'Nguyễn Thị Oanh',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_ba_bac'],
    childrenIds: [],
    notes: 'Vợ ông Đào Bá Bắc',
    sourceVerified: true
  },
  {
    id: 'dao_thi_thuy_gen4',
    fullName: 'Đào Thị Thúy',
    gender: 'female',
    generation: 4,
    fatherId: 'dao_ba_khoa',
    spouseIds: ['nguyen_van_hai'],
    childrenIds: ['dao_thi_ha', 'dao_thu_xuan'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_van_hai',
    fullName: 'Nguyễn Văn Hải',
    gender: 'male',
    generation: 4,
    spouseIds: ['dao_thi_thuy_gen4'],
    childrenIds: [],
    notes: 'Chồng bà Đào Thị Thúy',
    sourceVerified: true
  },
  {
    id: 'dao_ba_viet',
    fullName: 'Đào Bá Việt',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_khoa',
    spouseIds: ['nguyen_thi_hien_viet'],
    childrenIds: ['dao_ba_truong'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_hien_viet',
    fullName: 'Nguyễn Thị Hiền',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_ba_viet'],
    childrenIds: ['dao_ba_truong'],
    notes: 'Vợ ông Đào Bá Việt',
    sourceVerified: true
  },

  // Con ông Đào Bá Tâm & bà Đào Thị Ậu:
  {
    id: 'dao_van_chung',
    fullName: 'Đào Văn Chung',
    alias: 'Cương',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_tam',
    motherId: 'dao_thi_au',
    spouseIds: ['dao_thi_loi'],
    childrenIds: ['dao_ba_giang', 'dao_hai_yen'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_thi_loi',
    fullName: 'Đào Thị Lợi',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_van_chung'],
    childrenIds: ['dao_ba_giang', 'dao_hai_yen'],
    notes: 'Vợ ông Đào Văn Chung',
    sourceVerified: true
  },
  {
    id: 'dao_thi_thuy_tam',
    fullName: 'Đào Thị Thủy',
    gender: 'female',
    generation: 4,
    fatherId: 'dao_ba_tam',
    motherId: 'dao_thi_au',
    spouseIds: ['bui_duc_trong'],
    childrenIds: ['dao_thu_trang', 'dao_ba_nam_gen5', 'dao_ba_phuong_ninh'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'bui_duc_trong',
    fullName: 'Bùi Đức Trọng',
    gender: 'male',
    generation: 4,
    spouseIds: ['dao_thi_thuy_tam'],
    childrenIds: [],
    notes: 'Chồng bà Đào Thị Thủy',
    sourceVerified: true
  },
  {
    id: 'dao_thi_huong',
    fullName: 'Đào Thị Hương',
    gender: 'female',
    generation: 4,
    deathDate: '11.12',
    fatherId: 'dao_ba_tam',
    motherId: 'dao_thi_au',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_quang_thanh',
    fullName: 'Đào Quang Thành',
    gender: 'male',
    generation: 4,
    fatherId: 'dao_ba_tam',
    motherId: 'dao_thi_au',
    spouseIds: ['doan_thi_quyet'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'doan_thi_quyet',
    fullName: 'Đoàn Thị Quyết',
    gender: 'female',
    generation: 4,
    spouseIds: ['dao_quang_thanh'],
    childrenIds: [],
    notes: 'Vợ ông Đào Quang Thành',
    sourceVerified: true
  },
  {
    id: 'dao_ba_tuan',
    fullName: 'Đào Bá Tuấn',
    gender: 'male',
    generation: 4,
    deathDate: '09.4',
    fatherId: 'dao_ba_tam',
    motherId: 'dao_thi_au',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },

  // Con bà Đào Thị Quế & ông Nguyễn Xuân Miền:
  {
    id: 'nguyen_thi_chi',
    fullName: 'Nguyễn Thị Chi',
    gender: 'female',
    generation: 4,
    fatherId: 'nguyen_xuan_mien',
    motherId: 'dao_thi_que',
    spouseIds: ['vu_ba_thu'],
    childrenIds: ['nguyen_thi_nhung', 'nguyen_van_huy'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'vu_ba_thu',
    fullName: 'Vũ Bá Thụ',
    gender: 'male',
    generation: 4,
    spouseIds: ['nguyen_thi_chi'],
    childrenIds: ['nguyen_thi_nhung', 'nguyen_van_huy'],
    notes: 'Chồng bà Nguyễn Thị Chi',
    sourceVerified: true
  },
  {
    id: 'nguyen_xuan_hung',
    fullName: 'Nguyễn Xuân Hùng',
    gender: 'male',
    generation: 4,
    fatherId: 'nguyen_xuan_mien',
    motherId: 'dao_thi_que',
    spouseIds: ['nguyen_thi_thu_huong'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_thu_huong',
    fullName: 'Nguyễn Thị Thu Hương',
    gender: 'female',
    generation: 4,
    spouseIds: ['nguyen_xuan_hung'],
    childrenIds: [],
    notes: 'Vợ ông Nguyễn Xuân Hùng',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_bich_lien',
    fullName: 'Nguyễn Thị Bích Liên',
    gender: 'female',
    generation: 4,
    fatherId: 'nguyen_xuan_mien',
    motherId: 'dao_thi_que',
    spouseIds: ['duong_duc_huu'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'duong_duc_huu',
    fullName: 'Dương Đức Hữu',
    gender: 'male',
    generation: 4,
    spouseIds: ['nguyen_thi_bich_lien'],
    childrenIds: [],
    notes: 'Chồng bà Nguyễn Thị Bích Liên',
    sourceVerified: true
  },

  // Con bà Đào Thị Bút & ông Nguyễn Xuân Liêm:
  {
    id: 'nguyen_duc_thanh',
    fullName: 'Nguyễn Đức Thanh',
    gender: 'male',
    generation: 4,
    fatherId: 'nguyen_xuan_liem',
    motherId: 'dao_thi_but',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_duc_thuan',
    fullName: 'Nguyễn Đức Thuận',
    gender: 'male',
    generation: 4,
    fatherId: 'nguyen_xuan_liem',
    motherId: 'dao_thi_but',
    spouseIds: ['nguyen_thi_nga'],
    childrenIds: ['dao_ba_khanh', 'dao_ba_viet_anh'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_nga',
    fullName: 'Nguyễn Thị Nga',
    gender: 'female',
    generation: 4,
    spouseIds: ['nguyen_duc_thuan'],
    childrenIds: ['dao_ba_khanh', 'dao_ba_viet_anh'],
    notes: 'Vợ ông Nguyễn Đức Thuận',
    sourceVerified: true
  },
  {
    id: 'nguyen_duc_hoa',
    fullName: 'Nguyễn Đức Hoa',
    gender: 'male',
    generation: 4,
    fatherId: 'nguyen_xuan_liem',
    motherId: 'dao_thi_but',
    spouseIds: ['nguyen_thi_le_hoa'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_le_hoa',
    fullName: 'Nguyễn Thị Lệ',
    gender: 'female',
    generation: 4,
    spouseIds: ['nguyen_duc_hoa'],
    childrenIds: [],
    notes: 'Vợ ông Nguyễn Đức Hoa',
    sourceVerified: true
  },

  // Con bà Đào Thị Thấp & ông Vũ Đình Toàn:
  {
    id: 'vu_thi_dung',
    fullName: 'Vũ Thị Dung',
    gender: 'female',
    generation: 4,
    fatherId: 'vu_dinh_toan',
    motherId: 'dao_thi_thap',
    spouseIds: ['hoang_van_thang'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'hoang_van_thang',
    fullName: 'Hoàng Văn Thắng',
    gender: 'male',
    generation: 4,
    spouseIds: ['vu_thi_dung'],
    childrenIds: [],
    notes: 'Chồng bà Vũ Thị Dung',
    sourceVerified: true
  },
  {
    id: 'vu_dinh_dung',
    fullName: 'Vũ Đình Dũng',
    gender: 'male',
    generation: 4,
    fatherId: 'vu_dinh_toan',
    motherId: 'dao_thi_thap',
    spouseIds: ['trinh_thi_nhung'],
    childrenIds: ['dao_duc_dung', 'dao_viet_dung'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'trinh_thi_nhung',
    fullName: 'Trịnh Thị Nhung',
    gender: 'female',
    generation: 4,
    spouseIds: ['vu_dinh_dung'],
    childrenIds: ['dao_duc_dung', 'dao_viet_dung'],
    notes: 'Vợ ông Vũ Đình Dũng',
    sourceVerified: true
  },
  {
    id: 'vu_dinh_tu',
    fullName: 'Vũ Đình Tử',
    gender: 'male',
    generation: 4,
    fatherId: 'vu_dinh_toan',
    motherId: 'dao_thi_thap',
    spouseIds: ['dao_thi_quyen'],
    childrenIds: ['dao_quang_huy'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_thi_quyen',
    fullName: 'Đào Thị Quyên',
    gender: 'female',
    generation: 4,
    spouseIds: ['vu_dinh_tu'],
    childrenIds: ['dao_quang_huy'],
    notes: 'Vợ ông Vũ Đình Tử',
    sourceVerified: true
  },
  {
    id: 'vu_thi_phuong',
    fullName: 'Vũ Thị Phương',
    gender: 'female',
    generation: 4,
    fatherId: 'vu_dinh_toan',
    motherId: 'dao_thi_thap',
    spouseIds: ['nguyen_viet_hien'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_viet_hien',
    fullName: 'Nguyễn Viết Hiến',
    gender: 'male',
    generation: 4,
    spouseIds: ['vu_thi_phuong'],
    childrenIds: [],
    notes: 'Chồng bà Vũ Thị Phương',
    sourceVerified: true
  },

  // ==========================================
  // ĐỜI 5: HẬU DUỆ ĐỜI 5
  // ==========================================
  {
    id: 'dao_ba_hung',
    fullName: 'Đào Bá Hưng',
    gender: 'male',
    generation: 5,
    fatherId: 'dao_ba_hai',
    motherId: 'nguyen_thi_phuong_hai',
    spouseIds: ['nguyen_thi_hanh_hung'],
    childrenIds: ['dao_ngoc_han', 'dao_ba_hien_gen6'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_hanh_hung',
    fullName: 'Nguyễn Thị Hạnh',
    gender: 'female',
    generation: 5,
    spouseIds: ['dao_ba_hung'],
    childrenIds: ['dao_ngoc_han', 'dao_ba_hien_gen6'],
    notes: 'Vợ ông Đào Bá Hưng',
    sourceVerified: true
  },
  {
    id: 'dao_ba_hoang',
    fullName: 'Đào Bá Hoàng',
    alias: 'Hoàn',
    gender: 'male',
    generation: 5,
    fatherId: 'dao_ba_dong',
    motherId: 'ngo_thi_hanh',
    spouseIds: ['ngo_sinh_phuong'],
    childrenIds: ['dao_ha_my', 'dao_ba_tung_anh'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'ngo_sinh_phuong',
    fullName: 'Ngô Sinh Phương',
    alias: 'Ngân',
    gender: 'female',
    generation: 5,
    spouseIds: ['dao_ba_hoang'],
    childrenIds: ['dao_ha_my', 'dao_ba_tung_anh'],
    notes: 'Vợ ông Đào Bá Hoàng',
    sourceVerified: true
  },
  {
    id: 'dao_thi_ha',
    fullName: 'Đào Thị Hà',
    gender: 'female',
    generation: 5,
    motherId: 'dao_thi_thuy_gen4',
    fatherId: 'nguyen_van_hai',
    spouseIds: ['nguyen_van_dung'],
    childrenIds: ['nguyen_chi_thanh', 'nguyen_thi_xuan_my'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_van_dung',
    fullName: 'Nguyễn Văn Dũng',
    gender: 'male',
    generation: 5,
    spouseIds: ['dao_thi_ha'],
    childrenIds: [],
    notes: 'Chồng bà Đào Thị Hà',
    sourceVerified: true
  },
  {
    id: 'dao_thu_xuan',
    fullName: 'Đào Thu Xuân',
    gender: 'female',
    generation: 5,
    motherId: 'dao_thi_thuy_gen4',
    fatherId: 'nguyen_van_hai',
    spouseIds: ['nguyen_van_nhuan'],
    childrenIds: ['nguyen_quang_trung', 'nguyen_thi_my_uyen'],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_van_nhuan',
    fullName: 'Nguyễn Văn Nhuận',
    gender: 'male',
    generation: 5,
    spouseIds: ['dao_thu_xuan'],
    childrenIds: [],
    notes: 'Chồng bà Đào Thu Xuân',
    sourceVerified: true
  },
  {
    id: 'dao_ba_truong',
    fullName: 'Đào Bá Trường',
    gender: 'male',
    generation: 5,
    fatherId: 'dao_ba_viet',
    motherId: 'nguyen_thi_hien_viet',
    spouseIds: ['tu_thi_nga'],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'tu_thi_nga',
    fullName: 'Từ Thị Nga',
    gender: 'female',
    generation: 5,
    spouseIds: ['dao_ba_truong'],
    childrenIds: [],
    notes: 'Vợ ông Đào Bá Trường',
    sourceVerified: true
  },
  {
    id: 'dao_ba_giang',
    fullName: 'Đào Bá Giang',
    gender: 'male',
    generation: 5,
    fatherId: 'dao_van_chung',
    motherId: 'dao_thi_loi',
    spouseIds: ['le_thi_huyen'],
    childrenIds: ['dao_ba_quang', 'dao_ha_vy'],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'le_thi_huyen',
    fullName: 'Lê Thị Huyền',
    gender: 'female',
    generation: 5,
    spouseIds: ['dao_ba_giang'],
    childrenIds: ['dao_ba_quang', 'dao_ha_vy'],
    notes: 'Vợ ông Đào Bá Giang',
    sourceVerified: true
  },
  {
    id: 'dao_hai_yen',
    fullName: 'Đào Hải Yến',
    gender: 'female',
    generation: 5,
    fatherId: 'dao_van_chung',
    motherId: 'dao_thi_loi',
    spouseIds: ['tran_ngoc_binh'],
    childrenIds: [
      'dao_nhat_minh',
      'dao_ba_thai',
      'tran_dinh_lam',
      'tran_dinh_phong'
    ],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'tran_ngoc_binh',
    fullName: 'Trần Ngọc Bình',
    gender: 'male',
    generation: 5,
    spouseIds: ['dao_hai_yen'],
    childrenIds: [
      'dao_nhat_minh',
      'dao_ba_thai',
      'tran_dinh_lam',
      'tran_dinh_phong'
    ],
    notes: 'Chồng bà Đào Hải Yến',
    sourceVerified: true
  },
  {
    id: 'dao_thu_trang',
    fullName: 'Đào Thu Trang',
    gender: 'female',
    generation: 5,
    fatherId: 'bui_duc_trong',
    motherId: 'dao_thi_thuy_tam',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_nam_gen5',
    fullName: 'Đào Bá Nam',
    gender: 'male',
    generation: 5,
    deathDate: '8 tháng Giêng 1999',
    fatherId: 'bui_duc_trong',
    motherId: 'dao_thi_thuy_tam',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_phuong_ninh',
    fullName: 'Đào Bá Phương Ninh',
    gender: 'male',
    generation: 5,
    fatherId: 'bui_duc_trong',
    motherId: 'dao_thi_thuy_tam',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_nhung',
    fullName: 'Nguyễn Thị Nhung',
    gender: 'female',
    generation: 5,
    fatherId: 'vu_ba_thu',
    motherId: 'nguyen_thi_chi',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'nguyen_van_huy',
    fullName: 'Nguyễn Văn Huy',
    gender: 'male',
    generation: 5,
    fatherId: 'vu_ba_thu',
    motherId: 'nguyen_thi_chi',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_khanh',
    fullName: 'Đào Bá Khánh',
    gender: 'male',
    generation: 5,
    fatherId: 'nguyen_duc_thuan',
    motherId: 'nguyen_thi_nga',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_viet_anh',
    fullName: 'Đào Bá Việt Anh',
    gender: 'male',
    generation: 5,
    fatherId: 'nguyen_duc_thuan',
    motherId: 'nguyen_thi_nga',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_duc_dung',
    fullName: 'Đào Đức Dũng',
    gender: 'male',
    generation: 5,
    fatherId: 'vu_dinh_dung',
    motherId: 'trinh_thi_nhung',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_viet_dung',
    fullName: 'Đào Việt Dũng',
    gender: 'male',
    generation: 5,
    fatherId: 'vu_dinh_dung',
    motherId: 'trinh_thi_nhung',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_quang_huy',
    fullName: 'Đào Quang Huy',
    gender: 'male',
    generation: 5,
    fatherId: 'vu_dinh_tu',
    motherId: 'dao_thi_quyen',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },

  // ==========================================
  // ĐỜI 6: HẬU DUỆ ĐỜI 6 (DÒNG DƯỚI CÙNG)
  // ==========================================
  {
    id: 'dao_ngoc_han',
    fullName: 'Đào Ngọc Hân',
    gender: 'female',
    generation: 6,
    fatherId: 'dao_ba_hung',
    motherId: 'nguyen_thi_hanh_hung',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_hien_gen6',
    fullName: 'Đào Bá Hiển',
    gender: 'male',
    generation: 6,
    fatherId: 'dao_ba_hung',
    motherId: 'nguyen_thi_hanh_hung',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_ha_my',
    fullName: 'Đào Hà My',
    gender: 'female',
    generation: 6,
    fatherId: 'dao_ba_hoang',
    motherId: 'ngo_sinh_phuong',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_tung_anh',
    fullName: 'Đào Bá Tùng Anh',
    gender: 'male',
    generation: 6,
    fatherId: 'dao_ba_hoang',
    motherId: 'ngo_sinh_phuong',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_chi_thanh',
    fullName: 'Nguyễn Chí Thành',
    gender: 'male',
    generation: 6,
    fatherId: 'nguyen_van_dung',
    motherId: 'dao_thi_ha',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_xuan_my',
    fullName: 'Nguyễn Thị Xuân Mỹ',
    gender: 'female',
    generation: 6,
    fatherId: 'nguyen_van_dung',
    motherId: 'dao_thi_ha',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_quang_trung',
    fullName: 'Nguyễn Quang Trung',
    gender: 'male',
    generation: 6,
    fatherId: 'nguyen_van_nhuan',
    motherId: 'dao_thu_xuan',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'nguyen_thi_my_uyen',
    fullName: 'Nguyễn Thị Mỹ Uyên',
    gender: 'female',
    generation: 6,
    fatherId: 'nguyen_van_nhuan',
    motherId: 'dao_thu_xuan',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Từ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_quang',
    fullName: 'Đào Bá Quang',
    gender: 'male',
    generation: 6,
    fatherId: 'dao_ba_giang',
    motherId: 'le_thi_huyen',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ha_vy',
    fullName: 'Đào Hà Vy',
    gender: 'female',
    generation: 6,
    fatherId: 'dao_ba_giang',
    motherId: 'le_thi_huyen',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_nhat_minh',
    fullName: 'Đào Nhật Minh',
    gender: 'male',
    generation: 6,
    fatherId: 'tran_ngoc_binh',
    motherId: 'dao_hai_yen',
    spouseIds: [],
    childrenIds: [],
    notes: 'Trong ảnh ghi Đào Nhật Minh',
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'dao_ba_thai',
    fullName: 'Đào Bá Thái',
    gender: 'male',
    generation: 6,
    fatherId: 'tran_ngoc_binh',
    motherId: 'dao_hai_yen',
    spouseIds: [],
    childrenIds: [],
    notes: 'Trong ảnh ghi Đào Bá Thái',
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'tran_dinh_lam',
    fullName: 'Trần Đình Lâm',
    gender: 'male',
    generation: 6,
    fatherId: 'tran_ngoc_binh',
    motherId: 'dao_hai_yen',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  },
  {
    id: 'tran_dinh_phong',
    fullName: 'Trần Đình Phong',
    gender: 'male',
    generation: 6,
    fatherId: 'tran_ngoc_binh',
    motherId: 'dao_hai_yen',
    spouseIds: [],
    childrenIds: [],
    branchName: 'Nhánh Cụ Đào Bá Huệ',
    sourceVerified: true
  }
];

export const GENEALOGY_METADATA = {
  title: 'Gia Phả Gia Tộc Họ Đào',
  ancestorTitle: 'Cao Cao Tằng Tổ Khảo, Cao Cao Tằng Tổ Tỉ',
  chartDate: 'Tháng 5 năm 2022',
  description: 'Dữ liệu được số hoá trực tiếp từ bản Gia Phả Gia Tộc Họ Đào lập tháng 5/2022.',
  rootAncestorId: 'dao_ba_nham'
};
