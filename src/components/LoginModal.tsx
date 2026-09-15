import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (u: string, p: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
    // Reset after submit attempt
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#FDFBF7] w-full max-w-sm rounded-2xl shadow-xl border border-[#E0D8CC] overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E0D8CC] bg-white">
          <h3 className="font-serif font-bold text-lg text-[#8B2222] flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Đăng nhập quản trị
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#8B2222] hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#5A5A40] mb-1">
                Tài khoản
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-[#E0D8CC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B2222]/20 focus:border-[#8B2222] bg-white text-[#2C2C2C]"
                placeholder="Nhập tên tài khoản"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5A5A40] mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-[#E0D8CC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B2222]/20 focus:border-[#8B2222] bg-white text-[#2C2C2C]"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full mt-6 flex items-center justify-center gap-2 bg-[#8B2222] hover:bg-[#7A1D1D] text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
