import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { createGame, uploadImage } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import SteamAccountManager from '../components/SteamAccountManager';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  const [activeTab, setActiveTab] = useState('steam-accounts');
  
  // File upload state for game creation
  const [selectedGameFile, setSelectedGameFile] = useState(null);
  const [uploadingGameImage, setUploadingGameImage] = useState(false);

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
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('steam-accounts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'steam-accounts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tài Khoản Steam
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'games'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Game
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'steam-accounts' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quản lý Tài Khoản Steam</h2>
          <SteamAccountManager />
        </div>
      )}

      {activeTab === 'games' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tạo Game Mới</h2>
          
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
    </div>
  );
};

export default Admin;


