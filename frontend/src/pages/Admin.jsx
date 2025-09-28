import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { createGame, uploadImage, getAllUserOrders, getSteamAccountsAdmin, getGames, markOrderAsDelivered, cancelOrder, getOrderByOrderId, getAllOrdersAdmin, getOrdersByStatusAdmin, getOrdersByClassificationAdmin, getOrderByIdAdmin, markOrderAsDeliveredAdmin, cancelOrderAdmin, getRevenueStats, getMonthlyRevenue, getSteamImportStatus, startSteamImport, getAccountInfosPage, deleteAccountInfo, deleteSteamAccount } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import SteamAccountManager from '../components/SteamAccountManager';
import MultiSteamAccountForm from '../components/MultiSteamAccountForm';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  const [activeTab, setActiveTab] = useState('revenue');
  
  // File upload state for game creation
  const [selectedGameFile, setSelectedGameFile] = useState(null);
  const [uploadingGameImage, setUploadingGameImage] = useState(false);

  // Revenue tab state
  const [revenueData, setRevenueData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10)
  });

  // Order management tab state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Inventory management tab state
  // inventoryGroups: [{ info: {...}, steamAccounts: [{...}, ...] }]
  const [inventoryGroups, setInventoryGroups] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryFilters, setInventoryFilters] = useState({
    title: '',
    gameName: '',
    status: 'all',
    sortBy: 'newest'
  });
  const [selectedAccountInfoId, setSelectedAccountInfoId] = useState(null);
  const [selectedAccountInfoData, setSelectedAccountInfoData] = useState(null); // { info, steamAccounts }
  const [steamDialog, setSteamDialog] = useState({ open: false, group: null });

  // Steam import state
  const [steamImportStatus, setSteamImportStatus] = useState({
    hasBeenImported: false,
    lastImportDate: null,
    importedGamesCount: 0
  });
  const [loadingSteamImport, setLoadingSteamImport] = useState(false);

  // Data fetching functions
  const fetchRevenueData = async () => {
    setLoadingRevenue(true);
    try {
      const [revenueStatsData, monthlyRevenueData] = await Promise.all([
        getRevenueStats(dateRange.start, dateRange.end),
        getMonthlyRevenue(dateRange.start, dateRange.end)
      ]);
      
      setRevenueStats({
        totalRevenue: revenueStatsData.totalRevenue || 0,
        totalOrders: revenueStatsData.totalOrders || 0,
        averageOrderValue: revenueStatsData.averageOrderValue || 0,
        monthlyGrowth: revenueStatsData.monthlyGrowth || 0
      });
      
      const revenueArray = monthlyRevenueData.map(item => ({
        month: item.month,
        total: item.total,
        count: item.count
      }));
      
      setRevenueData(revenueArray);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast({
        title: 'Lỗi tải dữ liệu doanh thu',
        description: error.message || 'Không thể tải dữ liệu doanh thu',
        variant: 'destructive'
      });
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      let allOrders;
      // Fetch only orders linked to steam accounts with account_info classification = ORDER
      allOrders = await getOrdersByClassificationAdmin('ORDER');
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Lỗi tải đơn hàng',
        description: error.message || 'Không thể tải danh sách đơn hàng',
        variant: 'destructive'
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchInventoryData = async () => {
    setLoadingInventory(true);
    try {
      const [steamAccountsResponse, gamesResponse, accountInfosPage] = await Promise.all([
        getSteamAccountsAdmin(0, 1000), // Get all steam accounts with large page size
        getGames({ page: 0, size: 1000 }), // Get all games with large page size
        getAccountInfosPage(0, 1000) // Get account info page for inventory
      ]);
      
      // Extract the actual array from paginated response
      const steamAccounts = steamAccountsResponse.content || steamAccountsResponse || [];
      const games = gamesResponse.content || gamesResponse || [];
      const accountInfos = accountInfosPage.content || accountInfosPage || [];
      
      // Ensure both are arrays
      const steamAccountsArray = Array.isArray(steamAccounts) ? steamAccounts : [];
      const gamesArray = Array.isArray(games) ? games : [];
      const accountInfosArray = Array.isArray(accountInfos) ? accountInfos : [];
      
      // Map helper for gameId -> name
      const gameNameById = (gid) => (Array.isArray(gamesArray) ? gamesArray.find(g => g.id === gid)?.name : undefined);

      // Build inventory data from steam accounts (flat list first)
      const steamInventory = steamAccountsArray.map(account => ({
        id: account.id,
        type: 'steam_account',
        accountInfoId: account.accountInfoId,
        itemCode: account.accountCode ? account.accountCode : `SA-${account.id}`,
        accountCode: account.accountCode || '',
        productName: `Steam: ${account.username ?? account.name ?? ''}`.trim(),
        username: account.username ?? '',
        password: account.password ?? '',
        steamGuard: account.steamGuard ?? '',
        salePrice: account.price ?? 0,
        inventoryDate: account.updatedAt || account.verifyDate || null,
        verifyDate: account.verifyDate || null,
        inventoryQuantity: 1,
        status: account.status,
        gameName: Array.isArray(account.gameIds) && account.gameIds.length > 0
          ? account.gameIds
              .map(gid => gameNameById(gid))
              .filter(Boolean)
              .join(', ')
          : 'N/A'
      }));

      // Build grouped inventory by account info
      const accountInfoInventory = accountInfosArray.map(info => {
        const groupSteam = steamInventory.filter(sa => sa.accountInfoId === info.id);
        const groupInfo = {
          id: info.id,
          type: 'account_info',
          itemCode: `AI-${info.id}`,
          productName: info.name || 'Gói sản phẩm',
          salePrice: info.price ?? 0,
          inventoryDate: info.updatedAt || null,
          inventoryQuantity: typeof info.availableStockCount === 'number' ? info.availableStockCount : (info.availableStockCount ?? 0),
          status: (info.availableStockCount ?? 0) > 0 ? 'STOCK' : 'ORDER',
          gameName: Array.isArray(info.gameIds) && info.gameIds.length > 0
            ? info.gameIds
                .map(gid => gameNameById(gid))
                .filter(Boolean)
                .join(', ')
            : 'N/A'
        };
        return { info: groupInfo, steamAccounts: groupSteam };
      });
      
      setInventoryGroups(accountInfoInventory);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast({
        title: 'Lỗi tải dữ liệu kho',
        description: error.message || 'Không thể tải dữ liệu kho sản phẩm',
        variant: 'destructive'
      });
    } finally {
      setLoadingInventory(false);
    }
  };

  // Steam import functions
  const fetchSteamImportStatus = async () => {
    try {
      const status = await getSteamImportStatus();
      setSteamImportStatus(status);
    } catch (error) {
      console.error('Error fetching Steam import status:', error);
    }
  };

  const handleSteamImport = async () => {
    if (!guard()) return;

    setLoadingSteamImport(true);
    try {
      if (steamImportStatus.hasBeenImported) {
        // Show message for subsequent clicks
        toast({
          title: 'Thông báo',
          description: `Đã nhập steam game vào ngày ${steamImportStatus.lastImportDate}, nếu bạn cần nhập thêm vui lòng nhập bằng tay theo bảng bên dưới`,
        });
      } else {
        // First time import
        const response = await startSteamImport();
        if (response.success) {
          toast({
            title: 'Thành công',
            description: response.message,
          });
          // Update status
          await fetchSteamImportStatus();
        } else {
          toast({
            title: 'Lỗi',
            description: response.message || 'Không thể bắt đầu nhập Steam games',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error starting Steam import:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể bắt đầu nhập Steam games',
        variant: 'destructive'
      });
    } finally {
      setLoadingSteamImport(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'revenue') {
      fetchRevenueData();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'inventory') {
      fetchInventoryData();
    } else if (activeTab === 'games') {
      fetchSteamImportStatus();
    }
  }, [activeTab]);

  // Refetch orders when filter changes while on orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [orderFilter]);

  const guard = () => {
    if (!isAdmin) {
      toast({ title: 'Không được phép', description: 'Yêu cầu quyền admin', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleGameFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Loại file không hợp lệ',
          description: 'Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, v.v.)',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File quá lớn',
          description: 'Vui lòng chọn hình ảnh nhỏ hơn 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedGameFile(file);
    }
  };

  const handleGameImageUpload = async () => {
    if (!selectedGameFile) {
      return null;
    }

    setUploadingGameImage(true);
    try {
      const uploadResponse = await uploadImage(selectedGameFile, 'games');
      toast({
        title: 'Tải lên hình ảnh thành công',
        description: 'Hình ảnh đã được tải lên và lưu',
      });
      return uploadResponse.url;
    } catch (error) {
      toast({
        title: 'Tải lên thất bại',
        description: error.message || 'Không thể tải lên hình ảnh',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingGameImage(false);
    }
  };

  const handleCreateGame = async (event) => {
    event.preventDefault();
    
    if (!guard()) return;

    if (!newProduct.name || !newProduct.description) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ các trường bắt buộc',
        variant: 'destructive'
      });
      return;
    }

    try {
      let imageUrl = newProduct.imageUrl;
      
      // Upload image if file is selected
      if (selectedGameFile) {
        imageUrl = await handleGameImageUpload();
        if (!imageUrl) return;
      }

      const gameData = {
        ...newProduct,
        imageUrl: imageUrl || ''
      };

      await createGame(gameData);
      
      toast({
        title: 'Tạo game thành công',
        description: 'Game mới đã được thêm vào hệ thống',
      });

      // Reset form
      setNewProduct({
        name: '',
        description: '',
        imageUrl: ''
      });
      setSelectedGameFile(null);
      
    } catch (error) {
      toast({
        title: 'Tạo game thất bại',
        description: error.message || 'Đã xảy ra lỗi khi tạo game',
        variant: 'destructive'
      });
    }
  };

  // Order processing functions
  const handleProcessOrder = async (orderId, action) => {
    setProcessingOrder(true);
    try {
      if (action === 'deliver') {
        await markOrderAsDeliveredAdmin(orderId);
        toast({
          title: 'Thành công',
          description: 'Đơn hàng đã được đánh dấu là đã giao',
        });
      } else if (action === 'cancel') {
        await cancelOrderAdmin(orderId);
        toast({
          title: 'Thành công',
          description: 'Đơn hàng đã được hủy',
        });
      }
      
      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: 'Lỗi xử lý đơn hàng',
        description: error.message || 'Không thể xử lý đơn hàng',
        variant: 'destructive'
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const orderDetails = await getOrderByIdAdmin(orderId);
      setSelectedOrder(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Lỗi tải chi tiết đơn hàng',
        description: error.message || 'Không thể tải chi tiết đơn hàng',
        variant: 'destructive'
      });
    }
  };

  // Excel export function
  const exportRevenueToExcel = () => {
    const csvContent = [
      ['Tháng', 'Tổng doanh thu', 'Số đơn hàng', 'Trung bình/đơn'],
      ...revenueData.map(item => [
        item.month,
        item.total.toLocaleString('vi-VN'),
        item.count,
        item.count > 0 ? (item.total / item.count).toLocaleString('vi-VN') : 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `doanh-thu-${dateRange.start}-to-${dateRange.end}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter inventory groups (filter by AccountInfo row data)
  const filteredInventoryGroups = useMemo(() => {
    let groups = Array.isArray(inventoryGroups) ? [...inventoryGroups] : [];

    const matches = (text, query) => (text || '').toString().toLowerCase().includes((query || '').toLowerCase());

    if (inventoryFilters.title) {
      groups = groups.filter(g => matches(g.info.productName, inventoryFilters.title));
    }

    if (inventoryFilters.gameName) {
      groups = groups.filter(g => matches(g.info.gameName, inventoryFilters.gameName));
    }

    if (inventoryFilters.status && inventoryFilters.status !== 'all') {
      groups = groups.filter(g => g.info.status === inventoryFilters.status);
    }

    // Sort by AccountInfo inventoryDate
    groups.sort((a, b) => {
      const da = new Date(a.info.inventoryDate || 0);
      const db = new Date(b.info.inventoryDate || 0);
      return inventoryFilters.sortBy === 'newest' ? (db - da) : (da - db);
    });

    return groups;
  }, [inventoryGroups, inventoryFilters]);

  const handleEditAccountInfo = (id) => {
    setSelectedAccountInfoId(id);
    const group = Array.isArray(inventoryGroups) ? inventoryGroups.find(g => g.info.id === id) : null;
    if (group) setSelectedAccountInfoData(group);
    setActiveTab('steam-accounts');
    toast({ title: 'Chỉnh sửa sản phẩm', description: `Đang chỉnh sửa AccountInfo #${id}` });
  };

  const handleDeleteAccountInfo = async (id) => {
    if (!guard()) return;
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa sản phẩm này? Hành động không thể hoàn tác.');
    if (!confirmDelete) return;
    try {
      await deleteAccountInfo(id);
      toast({ title: 'Đã xóa', description: `Đã xóa sản phẩm #${id}` });
      await fetchInventoryData();
    } catch (error) {
      toast({ title: 'Xóa thất bại', description: error.message || 'Không thể xóa sản phẩm', variant: 'destructive' });
    }
  };

  const handleViewSteamAccounts = (group) => {
    setSteamDialog({ open: true, group });
  };

  const closeSteamDialog = () => setSteamDialog({ open: false, group: null });

  const handleEditSteamAccount = (steamAccount) => {
    // Open edit tab with the group from dialog for full prefill
    const group = steamDialog.group;
    if (group) {
      setSelectedAccountInfoId(group.info.id);
      setSelectedAccountInfoData(group);
    }
    setActiveTab('steam-accounts');
    toast({ title: 'Chỉnh sửa sản phẩm', description: `Đang chỉnh sửa AccountInfo #${group?.info.id}` });
    closeSteamDialog();
  };

  const handleDeleteSteamAccount = async (steamAccount) => {
    if (!guard()) return;
    const confirmDelete = window.confirm(`Xóa tài khoản Steam ${steamAccount.username}?`);
    if (!confirmDelete) return;
    try {
      await deleteSteamAccount(steamAccount.id);
      toast({ title: 'Đã xóa tài khoản Steam' });
      // Refresh inventory and dialog list
      await fetchInventoryData();
      if (steamDialog.open && steamDialog.group) {
        const updatedGroup = {
          ...steamDialog.group,
          steamAccounts: (steamDialog.group.steamAccounts || []).filter(sa => sa.id !== steamAccount.id)
        };
        setSteamDialog({ open: true, group: updatedGroup });
      }
    } catch (error) {
      toast({ title: 'Xóa thất bại', description: error.message || 'Không thể xóa tài khoản', variant: 'destructive' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Truy cập bị từ chối</h1>
          <p className="text-gray-600">Bạn cần quyền admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển Admin</h1>
        <p className="text-gray-600">Quản lý game, tài khoản Steam và cài đặt hệ thống</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Doanh thu
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quản lý đơn hàng
        </button>
        <button
          onClick={() => setActiveTab('steam-accounts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'steam-accounts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Thêm tài khoản steam
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'games'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Thêm tài khoản game
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quản lý kho sản phẩm
        </button>
      </div>

      {/* Content based on active tab */}
      
      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Báo cáo doanh thu</h2>
            <div className="flex gap-2">
              <Button onClick={exportRevenueToExcel} className="bg-green-600 hover:bg-green-700">
                Xuất Excel
              </Button>
              <Button onClick={fetchRevenueData} className="bg-blue-600 hover:bg-blue-700">
                Làm mới
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bộ lọc thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={fetchRevenueData} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loadingRevenue}
                  >
                    {loadingRevenue ? 'Đang tải...' : 'Áp dụng'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {revenueStats.totalRevenue.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-900">{revenueStats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trung bình/đơn</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {revenueStats.averageOrderValue.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${revenueStats.monthlyGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-6 h-6 ${revenueStats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tăng trưởng tháng</p>
                    <p className={`text-2xl font-bold ${revenueStats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenueStats.monthlyGrowth >= 0 ? '+' : ''}{revenueStats.monthlyGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {loadingRevenue ? (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết doanh thu theo tháng</CardTitle>
                <CardDescription>
                  Dữ liệu từ {dateRange.start} đến {dateRange.end}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Tháng</th>
                        <th className="text-right py-3 px-4">Tổng doanh thu</th>
                        <th className="text-right py-3 px-4">Số đơn hàng</th>
                        <th className="text-right py-3 px-4">Trung bình/đơn</th>
                        <th className="text-right py-3 px-4">Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((item, index) => {
                        const percentage = revenueStats.totalRevenue > 0 ? 
                          (item.total / revenueStats.totalRevenue) * 100 : 0;
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.month}</td>
                            <td className="text-right py-3 px-4 font-medium">
                              {item.total.toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td className="text-right py-3 px-4">{item.count}</td>
                            <td className="text-right py-3 px-4">
                              {item.count > 0 ? (item.total / item.count).toLocaleString('vi-VN') : 0} VNĐ
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="flex items-center justify-end">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {revenueData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có dữ liệu doanh thu trong khoảng thời gian này
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Order Management Tab */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý đơn hàng</h2>
            <div className="flex gap-4 items-center">
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="ORDERING">Chờ xử lý</SelectItem>
                  <SelectItem value="DELIVERED">Đã hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã Huỷ</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchOrders} className="bg-blue-600 hover:bg-blue-700">
                Làm mới
              </Button>
            </div>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                    <p className="text-xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                    <p className="text-xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'ORDERING').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Đã đặt hàng</p>
                    <p className="text-xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'ORDERED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                    <p className="text-xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'DELIVERED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                    <p className="text-xl font-bold text-gray-900">
                      {orders.filter(o => o.status === 'CANCELLED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {loadingOrders ? (
            <div className="text-center py-8">Đang tải đơn hàng...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <CardDescription>
                  {orderFilter === 'ALL' ? 'Tất cả đơn hàng' : (
                      orderFilter === 'ORDERING' ? 'Đơn hàng Chờ xử lý' : (
                        orderFilter === 'DELIVERED' ? 'Đơn hàng Đã hoàn thành' : (
                          orderFilter === 'CANCELLED' ? 'Đơn hàng Đã huỷ' : `Đơn hàng ${orderFilter}`
                        )
                      )
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ID Đơn hàng</th>
                        <th className="text-left py-3 px-4">Khách hàng</th>
                        <th className="text-left py-3 px-4">Sản phẩm</th>
                        <th className="text-right py-3 px-4">Tổng tiền</th>
                        <th className="text-center py-3 px-4">Trạng thái</th>
                        <th className="text-left py-3 px-4">Ngày tạo</th>
                        <th className="text-center py-3 px-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{order.orderId}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.username || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{order.userEmail || ''}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.steamAccountUsername || 'N/A'}</p>
                              <p className="text-sm text-gray-500">
                                {order.gameNames?.join(', ') || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {order.totalAmount?.toLocaleString('vi-VN') || 0} VNĐ
                          </td>
                          <td className="text-center py-3 px-4">
                            {(() => {
                              const linkableStatuses = new Set(['ORDERING', 'DELIVERED', 'CANCELLED']);
                              const statusBadge = (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              order.status === 'PAID' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              order.status === 'ORDERED' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'ORDERING' ? 'bg-orange-100 text-orange-800' :
                              order.status === 'PRE_ORDER' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status === 'PENDING' ? 'Chờ thanh toán' :
                                   order.status === 'PAID' ? 'Chờ xử lý' :
                                   order.status === 'DELIVERED' ? 'Đã hoàn thành' :
                                   order.status === 'CANCELLED' ? 'Đã hủy' :
                                   order.status === 'ORDERED' ? 'Đã đặt hàng' :
                               order.status === 'ORDERING' ? 'Chờ xử lý' :
                                   order.status === 'PRE_ORDER' ? 'Chờ xử lý' :
                                   order.status}
                                </span>
                              );
                              return linkableStatuses.has(order.status)
                                ? (
                                  <Link to={`/steam-accounts#${order.status}`}>
                                    {statusBadge}
                                  </Link>
                                ) : statusBadge;
                            })()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex gap-1 justify-center">
                              {order.status === 'PAID' && (
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleProcessOrder(order.orderId, 'deliver')}
                                  disabled={processingOrder}
                                >
                                  Giao hàng
                                </Button>
                              )}
                              {(order.status === 'PENDING' || order.status === 'PAID') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleProcessOrder(order.orderId, 'cancel')}
                                  disabled={processingOrder}
                                >
                                  Hủy
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewOrderDetails(order.orderId)}
                              >
                                Chi tiết
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Không có đơn hàng nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Chi tiết đơn hàng #{selectedOrder.id}</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedOrder(null)}
                    >
                      Đóng
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Khách hàng</label>
                        <p className="text-lg">{selectedOrder.username || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{selectedOrder.userEmail || ''}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tổng tiền</label>
                        <p className="text-lg font-bold">{selectedOrder.totalAmount?.toLocaleString('vi-VN') || 0} VNĐ</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sản phẩm</label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{selectedOrder.steamAccountUsername || 'N/A'}</p>
                        <p className="text-sm text-gray-500">
                          {selectedOrder.gameNames?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                        <p className="text-lg">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            selectedOrder.status === 'PAID' ? 'bg-yellow-100 text-yellow-800' :
                            selectedOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            selectedOrder.status === 'ORDERED' ? 'bg-purple-100 text-purple-800' :
                            selectedOrder.status === 'PRE_ORDER' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedOrder.status === 'PENDING' ? 'Chờ thanh toán' :
                             selectedOrder.status === 'PAID' ? 'Chờ xử lý' :
                             selectedOrder.status === 'DELIVERED' ? 'Đã hoàn thành' :
                             selectedOrder.status === 'CANCELLED' ? 'Đã hủy' :
                             selectedOrder.status === 'ORDERED' ? 'Đã đặt hàng' :
                             selectedOrder.status === 'PRE_ORDER' ? 'Chờ xử lý' :
                             selectedOrder.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                        <p className="text-lg">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {selectedOrder.accountUsername && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tài khoản Steam</label>
                          <p className="text-lg font-mono">{selectedOrder.accountUsername}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Mật khẩu</label>
                          <p className="text-lg font-mono">{selectedOrder.accountPassword || 'Chưa có'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Steam Accounts Tab */}
      {activeTab === 'steam-accounts' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thêm tài khoản steam</h2>
          <MultiSteamAccountForm selectedAccountInfoId={selectedAccountInfoId} selectedAccountInfoData={selectedAccountInfoData} />
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thêm tài khoản game</h2>
          
          {/* Steam Import Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nhập Steam Game Tự Động</CardTitle>
              <CardDescription>
                Tự động nhập danh sách game phổ biến từ Steam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleSteamImport}
                  disabled={loadingSteamImport}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loadingSteamImport ? 'Đang xử lý...' : 'Nhập steam game tự động'}
                </Button>
                
                {steamImportStatus.hasBeenImported && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    <div>Đã nhập steam game tự động vào ngày {steamImportStatus.lastImportDate}</div>
                    <div className="font-medium mt-1">
                      Tổng số game đã nhập: {steamImportStatus.importedGamesCount}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Thông tin Game</CardTitle>
              <CardDescription>Thêm game mới vào hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Game *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Nhập tên game"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả *
                  </label>
                  <textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Nhập mô tả game"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Tải lên File Hình Ảnh *
                  </label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleGameFileSelect}
                    className="w-full"
                    required
                  />
                  {selectedGameFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Đã chọn: {selectedGameFile.name}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={uploadingGameImage}
                >
                  {uploadingGameImage ? 'Đang tạo...' : 'Tạo Game'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Management Tab */}
      {activeTab === 'inventory' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý kho sản phẩm</h2>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <Input
                    placeholder="Tìm theo tên sản phẩm"
                    value={inventoryFilters.title}
                    onChange={(e) => setInventoryFilters({...inventoryFilters, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Game</label>
                  <Input
                    placeholder="Tìm theo tên game"
                    value={inventoryFilters.gameName}
                    onChange={(e) => setInventoryFilters({...inventoryFilters, gameName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <Select value={inventoryFilters.status} onValueChange={(value) => setInventoryFilters({...inventoryFilters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="IN_STOCK">Có sẵn</SelectItem>
                      <SelectItem value="SOLD">Đã bán</SelectItem>
                      <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
                  <Select value={inventoryFilters.sortBy} onValueChange={(value) => setInventoryFilters({...inventoryFilters, sortBy: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingInventory ? (
            <div className="text-center py-8">Đang tải dữ liệu kho...</div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Mã sản phẩm</th>
                        <th className="text-left py-3 px-4">Tên sản phẩm</th>
                        <th className="text-left py-3 px-4">Tên Game</th>
                        <th className="text-right py-3 px-4">Giá bán</th>
                        <th className="text-left py-3 px-4">Ngày nhập kho</th>
                        <th className="text-right py-3 px-4">Số lượng</th>
                        <th className="text-center py-3 px-4">Trạng thái</th>
                        <th className="text-center py-3 px-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventoryGroups.map((group) => (
                        <tr
                          key={`ai-${group.info.id}`}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewSteamAccounts(group)}
                        >
                          <td className="py-3 px-4 font-mono text-sm">{group.info.itemCode}</td>
                          <td className="py-3 px-4 font-semibold">{group.info.productName}</td>
                          <td className="py-3 px-4">{group.info.gameName}</td>
                          <td className="text-right py-3 px-4 font-medium">
                            {group.info.salePrice > 0 ? `${group.info.salePrice.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {group.info.inventoryDate ? new Date(group.info.inventoryDate).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="text-right py-3 px-4">{group.info.inventoryQuantity}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              group.info.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                              group.info.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                              group.info.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {group.info.status === 'IN_STOCK' ? 'Có sẵn' :
                               group.info.status === 'SOLD' ? 'Đã bán' :
                               group.info.status === 'MAINTENANCE' ? 'Bảo trì' :
                               group.info.status}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={(e) => { e.stopPropagation(); handleEditAccountInfo(group.info.id); }}>
                                Sửa
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteAccountInfo(group.info.id); }}>
                                Xóa
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredInventoryGroups.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Không có sản phẩm nào phù hợp
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* Steam Accounts Dialog */}
      {steamDialog.open && steamDialog.group && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tài khoản Steam thuộc: {steamDialog.group.info.productName}</CardTitle>
                  <CardDescription>Mã sản phẩm: {steamDialog.group.info.itemCode} • Số lượng: {steamDialog.group.info.inventoryQuantity}</CardDescription>
                </div>
                <Button variant="outline" onClick={closeSteamDialog}>Đóng</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Mã TK</th>
                      <th className="text-left py-3 px-4">Username</th>
                      <th className="text-left py-3 px-4">Password</th>
                      <th className="text-left py-3 px-4">Steam Guard</th>
                      <th className="text-center py-3 px-4">Trạng thái</th>
                      <th className="text-left py-3 px-4">Ngày kiểm tra</th>
                      <th className="text-center py-3 px-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(steamDialog.group.steamAccounts) && steamDialog.group.steamAccounts.length > 0 ? (
                      steamDialog.group.steamAccounts.map((sa) => (
                        <tr key={`dlg-sa-${sa.id}`} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{sa.itemCode}</td>
                          <td className="py-3 px-4">{sa.username || sa.productName}</td>
                          <td className="py-3 px-4 font-mono text-sm">{sa.password || '—'}</td>
                          <td className="py-3 px-4 font-mono text-sm">{sa.steamGuard || '—'}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sa.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                              sa.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                              sa.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sa.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{sa.verifyDate ? new Date(sa.verifyDate).toLocaleDateString('vi-VN') : '—'}</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <Button size="sm" onClick={() => handleEditSteamAccount(sa)}>Sửa</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleDeleteSteamAccount(sa)}>Xóa</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-500">Không có tài khoản Steam nào liên kết</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;


