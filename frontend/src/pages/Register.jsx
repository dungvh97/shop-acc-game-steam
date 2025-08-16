import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { decodeName } from '../utils/encoding';

const Register = () => {
  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const { register, oauthLogin, sendVerificationCode, verifyEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      toast({
        title: "Email không được để trống",
        description: "Vui lòng nhập email trước khi gửi mã xác thực.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập địa chỉ email hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    setSendingCode(true);
    const result = await sendVerificationCode(formData.email);
    
    if (result.success) {
      toast({
        title: "Mã xác thực đã được gửi",
        description: "Vui lòng kiểm tra email của bạn và nhập mã xác thực.",
      });
    } else {
      toast({
        title: "Gửi mã xác thực thất bại",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setSendingCode(false);
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      toast({
        title: "Mã xác thực không được để trống",
        description: "Vui lòng nhập mã xác thực.",
        variant: "destructive",
      });
      return;
    }

    setVerifyingCode(true);
    const result = await verifyEmail(formData.email, verificationCode);
    
    if (result.success) {
      setIsEmailVerified(true);
      toast({
        title: "Xác thực email thành công",
        description: "Email của bạn đã được xác thực.",
      });
    } else {
      toast({
        title: "Xác thực email thất bại",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setVerifyingCode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      toast({
        title: "Email chưa được xác thực",
        description: "Vui lòng xác thực email trước khi đăng ký.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Vui lòng đảm bảo mật khẩu của bạn khớp nhau.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    const result = await register(userData);
    
    if (result.success) {
      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công!",
      });
      navigate('/login');
    } else {
      toast({
        title: "Đăng ký thất bại",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      

      
      const firstName = decodeName(decoded.given_name);
      const lastName = decodeName(decoded.family_name);
      
      const oauthData = {
        provider: 'GOOGLE',
        token: credentialResponse.credential,
        email: decoded.email,
        firstName: firstName,
        lastName: lastName,
        profilePicture: decoded.picture,
        oauthId: decoded.sub
      };

      const result = await oauthLogin(oauthData);
      
      if (result.success) {
        toast({
          title: "Đăng ký thành công",
          description: "Tài khoản của bạn đã được tạo thành công!",
        });
        
        // Redirect based on user role
        if (result.user && result.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "Đăng ký thất bại",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Đăng ký thất bại",
        description: "Có lỗi xảy ra khi đăng ký bằng Google",
        variant: "destructive",
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Đăng ký thất bại",
      description: "Có lỗi xảy ra khi đăng ký bằng Google",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Tạo tài khoản</h2>
          <p className="text-muted-foreground mt-2">
            Tham gia cùng chúng tôi để bắt đầu mua sắm game accounts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng ký</CardTitle>
            <CardDescription>
              Tạo tài khoản để bắt đầu mua sắm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    Tên
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Tên"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    Họ
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Họ"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Tên đăng nhập
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Chọn tên đăng nhập"
                />
              </div>

                             <div>
                                   <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                 <div className="flex gap-2">
                   <Input
                     id="email"
                     name="email"
                     type="email"
                     required
                     value={formData.email}
                     onChange={handleChange}
                                           placeholder="Nhập địa chỉ email"
                     className="flex-1"
                   />
                   <Button
                     type="button"
                     variant="outline"
                     onClick={handleSendVerificationCode}
                                           disabled={sendingCode || !formData.email || !emailRegex.test(formData.email)}
                     className="whitespace-nowrap"
                   >
                     {sendingCode ? 'Đang gửi...' : 'Gửi mã'}
                   </Button>
                 </div>
                                   {formData.email && !emailRegex.test(formData.email) && (
                    <p className="text-sm text-red-500 mt-1">Vui lòng nhập địa chỉ email hợp lệ</p>
                  )}
               </div>

                               {formData.email && emailRegex.test(formData.email) && (
                 <div>
                   <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
                     Mã xác thực
                   </label>
                   <div className="flex gap-2">
                     <Input
                       id="verificationCode"
                       type="text"
                       value={verificationCode}
                       onChange={(e) => setVerificationCode(e.target.value)}
                       placeholder="Nhập mã 6 số"
                       maxLength={6}
                       className="flex-1"
                     />
                     <Button
                       type="button"
                       variant="outline"
                       onClick={handleVerifyEmail}
                       disabled={verifyingCode || !verificationCode || verificationCode.length !== 6}
                       className="whitespace-nowrap"
                     >
                       {verifyingCode ? 'Đang xác thực...' : 'Xác thực'}
                     </Button>
                   </div>
                   {isEmailVerified && (
                     <p className="text-sm text-green-600 mt-1">✓ Email đã được xác thực</p>
                   )}
                 </div>
               )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tạo mật khẩu"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Xác nhận mật khẩu
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Xác nhận mật khẩu"
                />
              </div>

                             <Button 
                 type="submit" 
                 className="w-full" 
                 disabled={loading || !isEmailVerified}
               >
                 {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
               </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc đăng ký với
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>
                
                
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
