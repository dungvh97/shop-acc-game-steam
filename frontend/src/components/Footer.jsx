import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import { SiTiktok } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[40%_40%_20%] gap-8">
          
          {/* Column 1: Introduction */}
          <div className="space-y-3">
            <h3 className="font-bold text-black text-lg">Giới thiệu</h3>
            <p className="text-black text-sm leading-relaxed">
              Chúng tôi là những "thợ săn" thực thụ, lùng sục khắp nơi để mang về cho bạn những tài khoản Steam chất lượng với mức giá siêu tiết kiệm.
            </p>
          </div>

          {/* Column 2: Instructions & FAQ */}
          <div className="space-y-3">
            <h3 className="font-bold text-black text-lg">Hướng dẫn & Câu hỏi thường gặp</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-black">
                <Link to="/deposit-guide" className="hover:text-red-600 transition-colors">
                  Hướng dẫn nộp tiền
                </Link>
              </li>
              <li className="text-black">
                <Link to="/payment-guide" className="hover:text-red-600 transition-colors">
                  Hướng dẫn thanh toán
                </Link>
              </li>
              <li className="text-black">
                <Link to="/change-info-guide" className="hover:text-red-600 transition-colors">
                  Hướng dẫn đổi thông tin khi mua sản phẩm
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h3 className="font-bold text-black text-lg">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-black">
                <a 
                  href="https://www.facebook.com/GurroShop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-red-600 transition-colors group"
                >
                  <Facebook className="h-5 w-5 text-blue-600 group-hover:text-red-600 transition-colors" />
                  <span>Fanpage</span>
                </a>
              </li>
              <li className="text-black">
                <a 
                  href="https://www.instagram.com/gurroshopvn/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-red-600 transition-colors group"
                >
                  <Instagram className="h-5 w-5 text-pink-600 group-hover:text-red-600 transition-colors" />
                  <span>Instagram</span>
                </a>
              </li>
              <li className="text-black">
                <a 
                  href="https://www.tiktok.com/@gurro.shop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 hover:text-red-600 transition-colors group"
                >
                  <SiTiktok className="h-5 w-5 text-black group-hover:text-red-600 transition-colors" />
                  <span>Tiktok</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line with Copyright and Policy */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-gray-500">
              © 2024 Gurro Shop. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 text-xs">
              <Link to="/terms" className="text-gray-500 hover:text-red-600 transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-red-600 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/warranty" className="text-gray-500 hover:text-red-600 transition-colors">
                Chính sách bảo hành
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
