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
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <ShoppingBag className="h-6 w-6" />
          Seasonal Parcels
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="outline" asChild>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};