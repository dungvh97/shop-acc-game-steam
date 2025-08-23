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
  EyeOff
} from 'lucide-react';
import { getAllUserOrders } from '../lib/api.js';

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
      } catch (error) {
        console.error('Error fetching user orders:', error);
        // Don't show error toast for users with no orders
        // Just set empty array and let the UI show "no orders" message
        setUserOrders([]);
        
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ thanh toán', variant: 'secondary' },
      'PAID': { label: 'Đã thanh toán', variant: 'default' },
      'DELIVERED': { label: 'Đã giao', variant: 'default' },
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
      
      {/* Main Content Area - Fixed container width to match header/footer */}
      <div className="container mx-auto px-4 py-6">
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

          <Tabs defaultValue={searchParams.get('tab') || "profile"} className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="security">Bảo mật</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            </TabsList>

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
              {/* Activity History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Lịch sử hoạt động
                  </CardTitle>
                  <CardDescription>
                    Theo dõi các hoạt động và giao dịch của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Đang tải...</p>
                    </div>
                  ) : userOrders.length > 0 ? (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div key={order.orderId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Đơn hàng #{order.orderId}</h4>
                            <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                              {order.status === 'COMPLETED' ? 'Hoàn thành' : order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {order.accountName} - {order.accountType}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có hoạt động nào</h3>
                      <p className="text-gray-500">
                        Bạn chưa có đơn hàng nào. Hãy mua sắm để bắt đầu!
                      </p>
                      <Link to="/steam-accounts" className="inline-block mt-4">
                        <Button>Xem Steam Accounts</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
