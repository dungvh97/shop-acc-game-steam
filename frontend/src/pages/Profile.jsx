import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { decodeUserNames, safeDisplayName } from '../utils/encoding';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  LogOut,
  Key,
  Globe,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  FileText
} from 'lucide-react';
import { getAllUserOrders, getMyWalletDeposits, getUserBalance } from '../lib/api.js';
import DepositDialog from '../components/DepositDialog.jsx';

const Profile = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [depositAmount, setDepositAmount] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [walletDeposits, setWalletDeposits] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [orderPayments, setOrderPayments] = useState([]);
  const [orderPaymentsLoading, setOrderPaymentsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  
  // Decode user names to handle encoding issues
  const decodedUser = decodeUserNames(user);
  
  const [formData, setFormData] = useState({
    firstName: decodedUser?.firstName || '',
    lastName: decodedUser?.lastName || '',
    email: decodedUser?.email || '',
    phoneNumber: decodedUser?.phoneNumber || '',
    username: decodedUser?.username || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setProfileLoading(true);
    try {
      // Profile update functionality placeholder
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin hồ sơ đã được cập nhật",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Cập nhật thất bại",
        description: "Có lỗi xảy ra khi cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: decodedUser?.firstName || '',
      lastName: decodedUser?.lastName || '',
      email: decodedUser?.email || '',
      phoneNumber: decodedUser?.phoneNumber || '',
      username: decodedUser?.username || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi tài khoản",
    });
  };

  const getOAuthProviderName = (provider) => {
    switch (provider) {
      case 'GOOGLE':
        return 'Google';
      
      case 'LOCAL':
        return 'Email';
      default:
        return 'Không xác định';
    }
  };

  const getOAuthProviderIcon = (provider) => {
    switch (provider) {
      case 'GOOGLE':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  // Calculate wallet balance from paid deposits (fallback method)
  const calculateWalletBalance = (deposits) => {
    return deposits
      .filter(deposit => deposit.status === 'PAID')
      .reduce((total, deposit) => total + Number(deposit.amount || 0), 0);
  };

  // Refresh user balance from backend
  const refreshUserBalance = async () => {
    if (!user) return;
    setBalanceLoading(true);
    try {
      const balanceData = await getUserBalance();
      setWalletBalance(Number(balanceData.balance || 0));
    } catch (error) {
      console.error('Error fetching user balance:', error);
      // Fallback to calculating from deposits
      const balance = calculateWalletBalance(walletDeposits);
      setWalletBalance(balance);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast({
        title: "Phiên đăng nhập hết hạn",
        description: "Vui lòng đăng nhập lại để tiếp tục",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate, toast]);

  // Check for payment success redirect
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment');
    const orderId = searchParams.get('orderId');
    
    if (paymentSuccess === 'success' && orderId && isAuthenticated) {
      toast({
        title: "Thanh toán thành công!",
        description: `Đơn hàng ${orderId} đã được thanh toán. Thông tin tài khoản đã có sẵn bên dưới.`,
        variant: "default",
      });
      
      // Clear the URL parameters after showing the toast
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast, isAuthenticated]);

  // Fetch user orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      
      setOrdersLoading(true);
      try {
        const orders = await getAllUserOrders();
        setUserOrders(orders || []); // Ensure we always have an array
        
        // Extract paid orders for transaction history
        const paidOrders = (orders || []).filter(order => order.status === 'PAID');
        setOrderPayments(paidOrders);
      } catch (error) {
        console.error('Error fetching user orders:', error);
        // Don't show error toast for users with no orders
        // Just set empty array and let the UI show "no orders" message
        setUserOrders([]);
        setOrderPayments([]);
        
        // Parse error to get status code
        let errorStatus = null;
        try {
          if (error.message) {
            const errorData = JSON.parse(error.message);
            errorStatus = errorData.status;
          }
        } catch (e) {
          // Error parsing, use default handling
        }
        
        // Only show error for actual server errors, not 400 for no orders
        if (errorStatus && errorStatus !== 400) {
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách đơn hàng",
            variant: "destructive",
          });
        }
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [user, toast]);

  // Fetch wallet deposits
  useEffect(() => {
    const fetchWalletDeposits = async () => {
      if (!user) return;
      setWalletLoading(true);
      try {
        const deposits = await getMyWalletDeposits();
        const depositsArray = Array.isArray(deposits) ? deposits : [];
        setWalletDeposits(depositsArray);
      } catch (error) {
        setWalletDeposits([]);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletDeposits();
  }, [user]);

  // Set initial balance from user object and refresh when user changes
  useEffect(() => {
    if (user && user.balance !== undefined) {
      setWalletBalance(Number(user.balance || 0));
    } else if (user) {
      // If balance is not available in user object, fetch it
      refreshUserBalance();
    }
  }, [user]);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Đã sao chép",
        description: `${field === 'username' ? 'Tên đăng nhập' : 'Mật khẩu'} đã được sao chép vào clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép vào clipboard",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (orderId) => {
    setShowPasswords(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleOrderClick = (order) => {
    if (order.status === 'PAID' || order.status === 'DELIVERED') {
      setSelectedOrder(order);
      setOrderDetailOpen(true);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ thanh toán', variant: 'secondary' },
      'PAID': { label: 'Chờ xử lý', variant: 'default' },
      'DELIVERED': { label: 'Đã hoàn thành', variant: 'default' },
      'EXPIRED': { label: 'Hết hạn', variant: 'destructive' },
      'CANCELLED': { label: 'Đã hủy', variant: 'destructive' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div>
      
      {/* Main Content Area - Fixed container width to match other pages */}
      <div className="w-full max-w-8xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
              <p className="text-gray-600 mt-1">
                Quản lý thông tin tài khoản và cài đặt bảo mật
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>

          <div className="flex gap-6">
            {/* Left Sidebar */}
            <div className="w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quản lý tài khoản</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setSearchParams({ tab: 'profile' })}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        (searchParams.get('tab') || 'profile') === 'profile'
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Tài khoản của tôi
                    </button>
                    <button
                      onClick={() => setSearchParams({ tab: 'security' })}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        searchParams.get('tab') === 'security'
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Mật khẩu và bảo mật
                    </button>
                    <button
                      onClick={() => setSearchParams({ tab: 'activity' })}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        searchParams.get('tab') === 'activity'
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Lịch sử đơn hàng
                    </button>
                    <button
                      onClick={() => setSearchParams({ tab: 'transactions' })}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        searchParams.get('tab') === 'transactions'
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Lịch sử giao dịch
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs value={searchParams.get('tab') || "profile"} className="space-y-6">

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Thông tin cơ bản
                  </CardTitle>
                  <CardDescription>
                    Thông tin cá nhân và tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={decodedUser.profilePicture} alt={safeDisplayName(decodedUser.firstName)} />
                      <AvatarFallback>
                        {safeDisplayName(decodedUser.firstName)?.charAt(0)}{safeDisplayName(decodedUser.lastName)?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Họ và tên</label>
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Tên"
                              />
                              <Input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Họ"
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              {safeDisplayName(decodedUser.firstName)} {safeDisplayName(decodedUser.lastName)}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Tên đăng nhập</label>
                          {isEditing ? (
                            <Input
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              {safeDisplayName(decodedUser.username)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          {isEditing ? (
                            <Input
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              {decodedUser.email}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Số điện thoại</label>
                          {isEditing ? (
                            <Input
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className="mt-1"
                            />
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              {decodedUser.phoneNumber || 'Chưa cập nhật'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Edit Actions */}
                      {isEditing ? (
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleSave} disabled={profileLoading}>
                            {profileLoading ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" />Lưu thay đổi</>}
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />Hủy
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />Chỉnh sửa
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Thông tin tài khoản
                  </CardTitle>
                  <CardDescription>
                    Chi tiết về tài khoản và phương thức đăng nhập
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Loại tài khoản</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getOAuthProviderIcon(decodedUser.oAuthProvider)}
                        <span className="text-sm text-gray-500">
                          {getOAuthProviderName(decodedUser.oAuthProvider)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Ngày tạo</label>
                      <p className="text-sm text-gray-500 mt-1">
                        {decodedUser.createdAt ? new Date(decodedUser.createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Cài đặt bảo mật
                  </CardTitle>
                  <CardDescription>
                    Quản lý mật khẩu và các tùy chọn bảo mật
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Tính năng đang phát triển</h3>
                    <p className="text-gray-500">
                      Cài đặt bảo mật sẽ có sẵn trong phiên bản tiếp theo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Order History */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Lịch sử đơn hàng</h2>
                <p className="text-gray-600 mb-6">
                  Hiển thị thông tin các sản phẩm bạn đã mua tại Gurro Shop
                </p>
                
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải...</p>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Bạn chưa có đơn hàng nào
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              MÃ ĐƠN HÀNG
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              TÊN SẢN PHẨM
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              NGÀY MUA
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              GIÁ TÀI KHOẢN
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              GIẢM GIÁ
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              TỔNG TIỀN
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              HOÀN TIỀN
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              TRẠNG THÁI
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userOrders.map((order) => (
                            <tr 
                              key={order.id} 
                              className={`hover:bg-gray-50 ${order.status === 'PAID' || order.status === 'DELIVERED' ? 'cursor-pointer' : ''}`}
                              onClick={() => handleOrderClick(order)}
                            >
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.orderId}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.accountName}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.amount?.toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                -
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.amount?.toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.status === 'CANCELLED' ? `${order.amount?.toLocaleString('vi-VN')} VNĐ` : '-'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {getStatusBadge(order.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Account Credentials Section - Only show for PAID orders */}
                {userOrders.some(order => order.status === 'PAID' && order.accountUsername) && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin tài khoản đã mua</h3>
                    <div className="space-y-4">
                      {userOrders
                        .filter(order => order.status === 'PAID' && order.accountUsername)
                        .map((order) => (
                        <div key={order.id} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-green-800">
                              {order.accountName} - {order.orderId}
                            </h4>
                            <span className="text-sm text-green-600">
                              Đã thanh toán: {formatDate(order.paidAt || order.createdAt)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Username */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Tên đăng nhập
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={order.accountUsername || 'Đang đặt hàng'}
                                  readOnly
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(order.accountUsername, `username-${order.id}`)}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedField === `username-${order.id}` ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Password */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Mật khẩu
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type={showPasswords[order.id] ? "text" : "password"}
                                  value={order.accountPassword || 'Đang đặt hàng'}
                                  readOnly
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(order.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {showPasswords[order.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(order.accountPassword, `password-${order.id}`)}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedField === `password-${order.id}` ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Steam Guard */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Steam Guard
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={order.steamGuard || 'Không có'}
                                  readOnly
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                                />
                                {order.steamGuard && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(order.steamGuard, `steamguard-${order.id}`)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {copiedField === `steamguard-${order.id}` ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Lịch sử giao dịch
                  </CardTitle>
                  <CardDescription>
                    Nạp tiền vào tài khoản và xem lịch sử giao dịch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Balance Display */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Số dư</h3>
                        <p className="text-sm text-gray-600">Số dư hiện tại trong tài khoản</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {balanceLoading ? (
                            <div className="animate-pulse">Đang tải...</div>
                          ) : (
                            `${walletBalance.toLocaleString('vi-VN')} VNĐ`
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {walletDeposits.filter(d => d.status === 'PAID').length + orderPayments.length} giao dịch thành công
                        </div>
                        <button
                          onClick={refreshUserBalance}
                          disabled={balanceLoading}
                          className="text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                        >
                          {balanceLoading ? 'Đang tải...' : 'Làm mới'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 w-full">
                      <label className="text-sm font-medium">Số tiền muốn nạp (VNĐ)</label>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="mt-1"
                        min={1000}
                      />
                    </div>
                    <Button onClick={() => setDepositOpen(true)} className="w-full sm:w-auto">
                      Nạp tiền
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  {walletLoading || orderPaymentsLoading ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">Đang tải...</div>
                  ) : walletDeposits.length === 0 && orderPayments.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">Chưa có giao dịch nào</div>
                  ) : (
                    <div className="space-y-3">
                      {/* Combine and sort all transactions by date */}
                      {[...walletDeposits.map(d => ({ ...d, type: 'deposit' })), ...orderPayments.map(o => ({ ...o, type: 'order' }))]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((transaction) => (
                        <div key={transaction.type === 'deposit' ? transaction.depositId : transaction.orderId} className="border rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Mã giao dịch</div>
                            <div className="font-medium">{transaction.type === 'deposit' ? transaction.depositId : transaction.orderId}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{Number(transaction.amount || 0).toLocaleString('vi-VN')} VNĐ</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                            </div>
                            <div className="text-xs mt-1">
                              {transaction.type === 'deposit' ? (
                                transaction.status === 'PAID' ? (
                                  <span className="text-green-600">Đã thanh toán{transaction.paidAt ? ` (${new Date(transaction.paidAt).toLocaleString('vi-VN')})` : ''}</span>
                                ) : transaction.status === 'PENDING' ? (
                                  <span className="text-yellow-600">Chờ thanh toán</span>
                                ) : transaction.status === 'EXPIRED' ? (
                                  <span className="text-gray-500">Hết hạn</span>
                                ) : (
                                  <span className="text-red-600">Đã hủy</span>
                                )
                              ) : (
                                <span className="text-green-600">Đã thanh toán{transaction.paidAt ? ` (${new Date(transaction.paidAt).toLocaleString('vi-VN')})` : ''}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <DepositDialog
                isOpen={depositOpen}
                amount={Number(depositAmount || 0)}
                onClose={() => setDepositOpen(false)}
              />
            </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {orderDetailOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedOrder.accountName}</h2>
                  <p className="text-gray-600">
                    {formatDate(selectedOrder.createdAt)} - {selectedOrder.orderId}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedOrder.amount?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOrderDetailOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Steam Login Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chi tiết đăng nhập Steam:
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên người dùng:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedOrder.accountUsername || 'Đang đặt hàng'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedOrder.accountUsername, `modal-username-${selectedOrder.id}`)}
                        >
                          {copiedField === `modal-username-${selectedOrder.id}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type={showPasswords[`modal-${selectedOrder.id}`] ? "text" : "password"}
                          value={selectedOrder.accountPassword || 'Đang đặt hàng'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePasswordVisibility(`modal-${selectedOrder.id}`)}
                        >
                          {showPasswords[`modal-${selectedOrder.id}`] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedOrder.accountPassword, `modal-password-${selectedOrder.id}`)}
                        >
                          {copiedField === `modal-password-${selectedOrder.id}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Steam Guard */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Steam Guard:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedOrder.steamGuard || 'Không có'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        {selectedOrder.steamGuard && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(selectedOrder.steamGuard, `modal-steamguard-${selectedOrder.id}`)}
                          >
                            {copiedField === `modal-steamguard-${selectedOrder.id}` ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open('https://help.steampowered.com/en/wizard/HelpWithLoginInfo?accountsearch=1', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Đổi thông tin
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <a
                      href="/guide_update_steam_account.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Hướng dẫn đổi thông tin tại đây!
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
