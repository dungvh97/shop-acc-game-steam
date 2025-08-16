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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
            <p className="text-muted-foreground mt-1">
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
                          <p className="text-sm text-muted-foreground mt-1">
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
                          <p className="text-sm text-muted-foreground mt-1">
                            {safeDisplayName(decodedUser.username)}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {decodedUser.email}
                          </p>
                          {user.emailVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Đã xác thực
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Số điện thoại</label>
                        {isEditing ? (
                          <Input
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="mt-1"
                            placeholder="Nhập số điện thoại"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {decodedUser.phoneNumber || 'Chưa cập nhật'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Phương thức đăng nhập</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getOAuthProviderIcon(decodedUser.oauthProvider)}
                        <span className="text-sm text-muted-foreground">
                          {getOAuthProviderName(decodedUser.oauthProvider)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={profileLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Chi tiết tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ngày tham gia</p>
                      <p className="text-sm text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Vai trò</p>
                      <p className="text-sm text-muted-foreground">
                        {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Bảo mật tài khoản
                </CardTitle>
                <CardDescription>
                  Quản lý mật khẩu và cài đặt bảo mật
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Đổi mật khẩu</h3>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật mật khẩu tài khoản của bạn
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Thay đổi
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Xác thực hai yếu tố</h3>
                    <p className="text-sm text-muted-foreground">
                      Bảo vệ tài khoản bằng mã xác thực
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Bật
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Latest Purchase Credentials Panel */}
            {userOrders.length > 0 && userOrders.find(order => order.status === 'PAID' && order.accountUsername) && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Key className="w-5 h-5" />
                    Tài khoản mới nhất đã mua
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Thông tin đăng nhập cho tài khoản vừa được thanh toán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const latestPaidOrder = userOrders
                      .filter(order => order.status === 'PAID' && order.accountUsername)
                      .sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt))[0];
                    
                    if (!latestPaidOrder) return null;
                    
                    return (
                      <div className="space-y-4">
                        {/* Account Info Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-green-800 text-lg">{latestPaidOrder.accountName}</h3>
                            <p className="text-sm text-green-600">
                              Mã đơn hàng: {latestPaidOrder.orderId} • {latestPaidOrder.accountType}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                              ✓ Đã thanh toán
                            </span>
                            <p className="text-xs text-green-600 mt-1">
                              {formatDate(latestPaidOrder.paidAt || latestPaidOrder.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Credentials Display */}
                        <div className="bg-white rounded-lg border border-green-200 p-4 space-y-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Thông tin đăng nhập
                          </h4>
                          
                          {/* Username Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Tên đăng nhập
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={latestPaidOrder.accountUsername}
                                readOnly
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 font-mono"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(latestPaidOrder.accountUsername, `latest-username`)}
                                className="h-12 px-4"
                              >
                                {copiedField === `latest-username` ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Password Field */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Mật khẩu
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type={showPasswords[`latest-${latestPaidOrder.id}`] ? "text" : "password"}
                                value={latestPaidOrder.accountPassword}
                                readOnly
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base bg-gray-50 font-mono"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePasswordVisibility(`latest-${latestPaidOrder.id}`)}
                                className="h-12 px-4"
                              >
                                {showPasswords[`latest-${latestPaidOrder.id}`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(latestPaidOrder.accountPassword, `latest-password`)}
                                className="h-12 px-4"
                              >
                                {copiedField === `latest-password` ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Account Value */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Giá trị tài khoản:</span>
                            <span className="text-lg font-bold text-green-600">
                              {latestPaidOrder.amount?.toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium">Lưu ý bảo mật:</p>
                              <p>Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu và không chia sẻ thông tin này với người khác.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Lịch sử đơn hàng
                </CardTitle>
                <CardDescription>
                  Danh sách các đơn hàng Steam Account của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 space-y-3">
                        {/* Order Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{order.accountName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Mã đơn hàng: {order.orderId}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Loại tài khoản:</span>
                            <p>{order.accountType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Số tiền:</span>
                            <p>{order.amount?.toLocaleString('vi-VN')} VNĐ</p>
                          </div>
                        </div>

                        {/* Account Credentials - Only show for PAID orders */}
                        {order.status === 'PAID' && order.accountUsername && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                            <h4 className="font-medium text-green-800 text-sm">
                              Thông tin tài khoản
                            </h4>
                            
                            {/* Username */}
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">
                                Tên đăng nhập
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={order.accountUsername}
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
                                  value={order.accountPassword}
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
                          </div>
                        )}

                        {/* Payment Date for PAID orders */}
                        {order.status === 'PAID' && order.paidAt && (
                          <div className="text-xs text-muted-foreground">
                            Thanh toán lúc: {formatDate(order.paidAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
