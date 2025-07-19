import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Cache configuration
const CACHE_CONFIG = {
  key: 'navbar_categories_cache',
  version: '1.0',
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxItems: 20
};

// Advanced cache manager with versioning and TTL
class CacheManager {
  static getCacheKey() {
    return `${CACHE_CONFIG.key}_v${CACHE_CONFIG.version}`;
  }

  static isExpired(timestamp) {
    return Date.now() - timestamp > CACHE_CONFIG.ttl;
  }

  static get() {
    try {
      const cached = localStorage.getItem(this.getCacheKey());
      if (!cached) return null;

      const { data, timestamp, version } = JSON.parse(cached);
      
      // Check version compatibility and expiration
      if (version !== CACHE_CONFIG.version || this.isExpired(timestamp)) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Cache read error:', error);
      this.clear();
      return null;
    }
  }

  static set(data) {
    try {
      const cacheData = {
        data: data.slice(0, CACHE_CONFIG.maxItems), // Limit cache size
        timestamp: Date.now(),
        version: CACHE_CONFIG.version
      };
      
      localStorage.setItem(this.getCacheKey(), JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.warn('Cache write error:', error);
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.clear();
      }
      return false;
    }
  }

  static clear() {
    try {
      localStorage.removeItem(this.getCacheKey());
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  static invalidate() {
    this.clear();
  }
}

// Advanced categories hook with intelligent caching
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Smart cache-first data fetching
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current && !forceRefresh) return;
    
    try {
      fetchingRef.current = true;

      // Try cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = CacheManager.get();
        if (cachedData && mountedRef.current) {
          setCategories(cachedData);
          setLoading(false);
          setLastFetch(Date.now());
          
          // Background refresh if cache is getting old (> 6 hours)
          const cached = localStorage.getItem(CacheManager.getCacheKey());
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            const isStale = Date.now() - timestamp > 6 * 60 * 60 * 1000; // 6 hours
            
            if (isStale) {
              // Fetch fresh data in background
              setTimeout(() => fetchCategories(true), 100);
            }
          }
          return;
        }
      }

      // Fetch from database with optimized query
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, slug, updated_at')
        .order('created_at')
        .limit(CACHE_CONFIG.maxItems);

      if (fetchError) throw fetchError;

      if (mountedRef.current) {
        const cleanData = data || [];
        setCategories(cleanData);
        setError(null);
        setLoading(false);
        setLastFetch(Date.now());
        
        // Cache the fresh data
        CacheManager.set(cleanData);
      }

    } catch (err) {
      console.error('Error fetching categories:', err);
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
        
        // Fallback to cache if fetch fails
        const cachedData = CacheManager.get();
        if (cachedData) {
          setCategories(cachedData);
        }
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Optimistic updates for real-time changes
  const handleRealtimeUpdate = useCallback((payload) => {
    if (!mountedRef.current) return;

    setCategories(prev => {
      let updated = [...prev];
      
      switch (payload.eventType) {
        case 'INSERT': {
          const exists = updated.find(cat => cat.id === payload.new.id);
          if (!exists && updated.length < CACHE_CONFIG.maxItems) {
            updated.push(payload.new);
            updated = updated.slice(0, CACHE_CONFIG.maxItems);
          }
          break;
        }
          
        case 'UPDATE': {
          const updateIndex = updated.findIndex(cat => cat.id === payload.new.id);
          if (updateIndex !== -1) {
            updated[updateIndex] = { ...updated[updateIndex], ...payload.new };
          }
          break;
        }
          
        case 'DELETE': {
          updated = updated.filter(cat => cat.id !== payload.old.id);
          break;
        }
      }
      
      // Update cache with new data
      CacheManager.set(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchCategories();

    // Set up optimized real-time subscription
    const channel = supabase
      .channel('navbar-categories-optimized', {
        config: {
          broadcast: { self: false }, // Don't receive own changes
          presence: { key: 'navbar' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    // Periodic cache validation (every 30 minutes when tab is active)
    const validateCache = () => {
      if (document.hidden) return; // Skip if tab is hidden
      
      const timeSinceLastFetch = Date.now() - (lastFetch || 0);
      if (timeSinceLastFetch > 30 * 60 * 1000) { // 30 minutes
        fetchCategories(true);
      }
    };

    const intervalId = setInterval(validateCache, 30 * 60 * 1000);

    // Listen for visibility change to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden && lastFetch) {
        const timeSinceLastFetch = Date.now() - lastFetch;
        if (timeSinceLastFetch > 60 * 60 * 1000) { // 1 hour
          fetchCategories(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Network status listener for smart refetching
    const handleOnline = () => {
      if (error || categories.length === 0) {
        fetchCategories(true);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchCategories, handleRealtimeUpdate, lastFetch, error, categories.length]);

  // Force refresh function
  const refreshCategories = useCallback(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  return { 
    categories, 
    loading, 
    error, 
    refresh: refreshCategories,
    lastFetch 
  };
};

export const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Memoized category splits with error fallback
  const { displayCategories, dropdownCategories, hasCategories } = useMemo(() => {
    if (!categories?.length) {
      return { 
        displayCategories: [], 
        dropdownCategories: [], 
        hasCategories: false 
      };
    }
    
    return {
      displayCategories: categories.slice(0, 5),
      dropdownCategories: categories.slice(5, 15),
      hasCategories: true
    };
  }, [categories]);

  // Optimized outside click handler
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current?.contains(event.target)) return;
      setDropdownOpen(false);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Memoized handlers
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [navigate]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Enhanced loading skeleton
  const CategorySkeleton = () => (
    <div className="flex space-x-8">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ 
            width: `${60 + Math.random() * 40}px`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );

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
            <span className="font-serif">Lipink Parcel</span>
          </Link>
          
          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Beranda
            </Link>
            
            {loading ? (
              <CategorySkeleton />
            ) : error ? (
              <span className="text-gray-400 text-sm">Kategori tidak tersedia</span>
            ) : (
              <>
                {displayCategories.map((category) => (
                  <Link 
                    key={category.id}
                    to={`/produk/${category.slug}`} 
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    {category.name}
                  </Link>
                ))}

                {dropdownCategories.length > 0 && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors font-medium"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      Produk Lainnya
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200/50 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
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
              </>
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
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
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
              
              {loading ? (
                <div className="px-2 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + i * 20}%` }} />
                  ))}
                </div>
              ) : error ? (
                <span className="text-gray-400 text-sm px-2">Kategori tidak tersedia</span>
              ) : (
                <>
                  {displayCategories.map((category) => (
                    <Link 
                      key={category.id}
                      to={`/produk/${category.slug}`} 
                      className="text-gray-700 hover:text-primary transition-colors font-medium px-2 py-1"
                      onClick={closeMobileMenu}
                    >
                      {category.name}
                    </Link>
                  ))}

                  {dropdownCategories.length > 0 && (
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
                </>
              )}
              
              {user && isAdmin && (
                <div className="border-t border-gray-200/50 pt-4 mt-4">
                  <Button variant="outline" asChild className="w-full border-primary/30 text-primary hover:bg-primary/10 mb-3">
                    <Link to="/admin" onClick={closeMobileMenu}>Admin Panel</Link>
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};