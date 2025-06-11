import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, Settings, Home, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'الرئيسية', href: '/' },
    { label: 'الخدمات', href: '/services' },
    { label: 'مزودي الخدمات', href: '/providers' },
    { label: 'من نحن', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 space-x-reverse">
          <Building2 className="h-6 w-6 text-primary-600" />
          <span className="font-bold text-xl">سوق الخدمات</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4 space-x-reverse">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-full bg-transparent hover:bg-accent/50 grid place-items-center"
                >
                  <User className="h-5 w-5 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(user?.type === 'provider' ? '/provider/dashboard' : '/dashboard')}>
                  <Settings className="ml-2 h-4 w-4" />
                  <span>لوحة التحكم</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
              <Button onClick={() => navigate('/register')}>
                إنشاء حساب
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-black" />
          ) : (
            <Menu className="h-6 w-6 text-black" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn('md:hidden', isMobileMenuOpen ? 'block' : 'hidden')}>
        <div className="container space-y-4 py-4">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  navigate(user?.type === 'provider' ? '/provider/dashboard' : '/dashboard');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Settings className="ml-2 h-4 w-4" />
                <span>لوحة التحكم</span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
              >
                تسجيل الدخول
              </Button>
              <Button
                onClick={() => {
                  navigate('/register');
                  setIsMobileMenuOpen(false);
                }}
              >
                إنشاء حساب
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
