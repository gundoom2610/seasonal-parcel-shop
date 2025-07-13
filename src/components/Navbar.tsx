import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, User, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif">
              Lipink Parcel
            </span>
          </Link>
          
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Beranda
            </Link>
            <Link to="/parcel/lebaran" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Parcel Lebaran
            </Link>
            <Link to="/parcel/christmas" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Parcel Natal
            </Link>
            <Link to="/parcel/lunar-new-year" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Parcel Imlek
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && isAdmin && (
              <>
                <Button variant="outline" asChild className="hidden sm:flex border-primary/30 text-primary hover:bg-primary/10">
                  <Link to="/admin">Admin Panel</Link>
                </Button>
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:bg-gray-100 rounded-lg p-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};