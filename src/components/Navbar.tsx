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
    <nav className="bg-gradient-primary backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white hover:text-white/90 transition-colors">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Lipink Parcel
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {user && isAdmin && (
            <>
              <Button variant="secondary" asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-lg px-4 py-2">
                <Link to="/admin">Admin Panel</Link>
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/80 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                <User className="h-4 w-4" />
                <span className="max-w-32 truncate">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-white/20 rounded-lg p-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};