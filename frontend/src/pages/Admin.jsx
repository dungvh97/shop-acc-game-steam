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
  const categories = useMemo(() => [
    'GAME_KEY',
    'STEAM_ACCOUNT_ONLINE',
    'STEAM_ACCOUNT_OFFLINE',
    'ENTERTAINMENT_SOFTWARE',
    'UTILITY_SOFTWARE'
  ], []);
  const types = useMemo(() => [
    'STEAM_KEY','EPIC_KEY','ORIGIN_KEY','UPLAY_KEY','GOG_KEY','OTHER_KEY'
  ], []);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'GAME_KEY',
    type: 'STEAM_KEY',
    imageUrl: '',
    featured: false,
    active: true
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
          title: 'Invalid file type',
          description: 'Please select an image file (JPEG, PNG, GIF, etc.)',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
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
        title: 'Image uploaded successfully',
        description: 'Image has been uploaded and saved',
      });
      return uploadResponse.url;
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingGameImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển Admin</h1>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Truy cập bị hạn chế</CardTitle>
            <CardDescription>Đăng nhập với tư cách admin để sử dụng các công cụ này.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isAdmin && (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'steam-accounts' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => setActiveTab('steam-accounts')}
            >
              Steam Accounts
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'dashboard' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              Import Game
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'steam-accounts' && (
            <SteamAccountManager />
          )}

          {activeTab === 'dashboard' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Thêm Game</CardTitle>
                  <CardDescription>Tạo game thủ công</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm">Tên Game</label>
                        <Input value={newProduct.name} onChange={e => setNewProduct(p => ({...p, name: e.target.value}))} />
                      </div>
                      <div>
                        <label className="text-sm">Mô tả</label>
                        <Input value={newProduct.description} onChange={e => setNewProduct(p => ({...p, description: e.target.value}))} />
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        <p>Note: Price and stock quantity are now managed through Steam Account relationships.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm">Danh mục</label>
                          <select className="w-full border rounded h-10 px-3" value={newProduct.category} onChange={e => setNewProduct(p => ({...p, category: e.target.value}))}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm">Loại</label>
                          <select className="w-full border rounded h-10 px-3" value={newProduct.type} onChange={e => setNewProduct(p => ({...p, type: e.target.value}))}>
                            {types.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm">Game Image</label>
                        <div className="space-y-2">
                          {/* File Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleGameFileSelect}
                              className="hidden"
                              id="game-image-upload"
                            />
                            <label
                              htmlFor="game-image-upload"
                              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                            >
                              {uploadingGameImage ? 'Uploading...' : 'Choose Image'}
                            </label>
                            {selectedGameFile && (
                              <span className="text-sm text-gray-600">
                                {selectedGameFile.name}
                              </span>
                            )}
                          </div>
                          
                          {/* Manual URL input as fallback */}
                          <div>
                            <label className="text-sm text-gray-600">Or enter image URL:</label>
                            <Input 
                              placeholder="https://..." 
                              value={newProduct.imageUrl} 
                              onChange={e => setNewProduct(p => ({...p, imageUrl: e.target.value}))} 
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!guard()) return;
                          try {
                            // Upload image if a file is selected
                            let imageUrl = newProduct.imageUrl;
                            if (selectedGameFile) {
                              imageUrl = await handleGameImageUpload();
                              if (!imageUrl) {
                                // Upload failed, don't proceed with game creation
                                return;
                              }
                            }

                            const payload = {
                              ...newProduct,
                              imageUrl: imageUrl
                            };
                            const created = await createGame(payload);
                            toast({ title: 'Đã tạo game', description: created?.name || 'Thành công' });
                            
                            // Reset form after successful creation
                            setNewProduct({
                              name: '',
                              description: '',
                              category: 'GAME_KEY',
                              type: 'STEAM_KEY',
                              imageUrl: '',
                              featured: false,
                              active: true
                            });
                            setSelectedGameFile(null);
                          } catch (e) {
                            toast({ title: 'Không thể tạo game', description: e.message, variant: 'destructive' });
                          }
                        }}
                        disabled={!isAdmin || uploadingGameImage}
                      >
                        {uploadingGameImage ? 'Uploading...' : 'Lưu'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Xem trước</label>
                      <div className="border rounded p-4 h-[220px] flex items-center justify-center text-muted-foreground">
                        {selectedGameFile ? (
                          // Show selected file preview
                          <img 
                            src={URL.createObjectURL(selectedGameFile)} 
                            alt="preview" 
                            className="max-h-[200px] object-contain" 
                          />
                        ) : newProduct.imageUrl ? (
                          // Show URL image
                          <img 
                            src={newProduct.imageUrl} 
                            alt="preview" 
                            className="max-h-[200px] object-contain" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        {(!selectedGameFile && !newProduct.imageUrl) && (
                          <span>Chọn hình ảnh hoặc nhập URL</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;


