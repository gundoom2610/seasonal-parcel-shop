import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('created_at');
        
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for categories
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          console.log('Category change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setCategories(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => prev.map(cat => 
              cat.id === payload.new.id ? payload.new : cat
            ));
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(cat => cat.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Split categories: first 5 for direct display, rest for dropdown
  const displayCategories = categories.slice(0, 5);
  const dropdownCategories = categories.slice(5);

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-bold text-primary hover:text-primary/90 transition-colors"
            onClick={closeMobileMenu}
          >
            <div className="p-2 bg-gradient-primary rounded-xl shadow-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif">
              Lipink Parcel
            </span>
          </Link>
          
          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Beranda
            </Link>
            
            {!loading && displayCategories.map((category) => (
              <Link 
                key={category.id}
                to={`/produk/${category.slug}`} 
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                {category.name}
              </Link>
            ))}

            {/* Dropdown for additional categories */}
            {!loading && dropdownCategories.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Produk Lainnya
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200/50 py-2 z-50">
                    {dropdownCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/produk/${category.slug}`}
                        className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                        onClick={closeDropdown}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user && isAdmin && (
              <>
                <Button variant="outline" asChild className="border-primary/30 text-primary hover:bg-primary/10">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && isAdmin && (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:bg-gray-100 rounded-lg p-2">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:bg-gray-100 rounded-lg p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200/50">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary transition-colors font-medium px-2 py-1"
                onClick={closeMobileMenu}
              >
                Beranda
              </Link>
              
              {!loading && displayCategories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/produk/${category.slug}`} 
                  className="text-gray-700 hover:text-primary transition-colors font-medium px-2 py-1"
                  onClick={closeMobileMenu}
                >
                  {category.name}
                </Link>
              ))}

              {/* Mobile dropdown categories */}
              {!loading && dropdownCategories.length > 0 && (
                <>
                  <div className="text-gray-500 font-medium px-2 py-1 text-sm border-t border-gray-200/50 pt-4 mt-2">
                    Produk Lainnya
                  </div>
                  {dropdownCategories.map((category) => (
                    <Link 
                      key={category.id}
                      to={`/produk/${category.slug}`} 
                      className="text-gray-700 hover:text-primary transition-colors font-medium px-4 py-1 text-sm"
                      onClick={closeMobileMenu}
                    >
                      {category.name}
                    </Link>
                  ))}
                </>
              )}
              
              {user && isAdmin && (
                <>
                  <div className="border-t border-gray-200/50 pt-4 mt-4">
                    <Button variant="outline" asChild className="w-full border-primary/30 text-primary hover:bg-primary/10 mb-3">
                      <Link to="/admin" onClick={closeMobileMenu}>Admin Panel</Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                      <User className="h-4 w-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};