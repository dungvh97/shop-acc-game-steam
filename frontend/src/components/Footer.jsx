import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin, Shield, Truck, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Gurro Shop" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-foreground">Gurro Shop</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Chuyên cung cấp game keys, tài khoản Steam và các sản phẩm gaming chất lượng cao với giá tốt nhất.
            </p>

          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-muted-foreground hover:text-primary transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/steam-accounts" className="text-muted-foreground hover:text-primary transition-colors">
                  Tài khoản Steam
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Bảo hành uy tín</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Giao hàng nhanh chóng</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Thanh toán an toàn</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Liên hệ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@gurroshop.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Việt Nam</span>
              </div>
              <a 
                href="https://www.facebook.com/GurroShop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook GurroShop</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Gurro Shop. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                Chính sách hoàn tiền
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
