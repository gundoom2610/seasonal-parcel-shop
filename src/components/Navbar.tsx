import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles,
  Search,
  Phone,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { trackSearch } from '@/utils/analytics';

// --- 1. CACHE MANAGER (Performance Optimization) ---
const CACHE_CONFIG = {
  key: 'navbar_categories_cache',
  version: '1.0',
  ttl: 24 * 60 * 60 * 1000, // 24 Hours
  maxItems: 20
};

class CacheManager {
  static getCacheKey() { return `${CACHE_CONFIG.key}_v${CACHE_CONFIG.version}`; }
  static isExpired(timestamp: number) { return Date.now() - timestamp > CACHE_CONFIG.ttl; }
  
  static get() {
    try {
      const cached = localStorage.getItem(this.getCacheKey());
      if (!cached) return null;
      const { data, timestamp, version } = JSON.parse(cached);
      if (version !== CACHE_CONFIG.version || this.isExpired(timestamp)) {
        this.clear();
        return null;
      }
      return data;
    } catch (error) {
      this.clear();
      return null;
    }
  }

  static set(data: any) {
    try {
      const cacheData = {
        data: data.slice(0, CACHE_CONFIG.maxItems),
        timestamp: Date.now(),
        version: CACHE_CONFIG.version
      };
      localStorage.setItem(this.getCacheKey(), JSON.stringify(cacheData));
      return true;
    } catch (error) { return false; }
  }

  static clear() { try { localStorage.removeItem(this.getCacheKey()); } catch (error) {} }
}

// --- 2. DATA HOOK ---
const useCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchCategories = useCallback(async () => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      
      // Try Cache First
      const cachedData = CacheManager.get();
      if (cachedData && mountedRef.current) {
        setCategories(cachedData);
        setLoading(false);
        // Continue to fetch fresh data in background if needed, or just return
        // For now, we return to rely on cache for speed
        return;
      }

      // Fetch from DB
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true }) // Alphabetical order is usually better for UX
        .limit(CACHE_CONFIG.maxItems);

      if (fetchError) throw fetchError;

      if (mountedRef.current) {
        const cleanData = data || [];
        setCategories(cleanData);
        setLoading(false);
        CacheManager.set(cleanData);
      }
    } catch (err) {
      console.error("Navbar Error:", err);
      if (mountedRef.current) {
        setLoading(false);
        // Fallback to cache on error
        const cachedData = CacheManager.get();
        if (cachedData) setCategories(cachedData);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    return () => { mountedRef.current = false; };
  }, [fetchCategories]);

  return { categories, loading };
};

// --- 3. MAIN NAVBAR COMPONENT ---
export const Navbar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  
  // DATA FETCHING (Enabled)
  const { categories, loading } = useCategories();

  // UI STATES
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Handle Scroll Effect (Glassmorphism)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Click Outside Dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Split Categories for Desktop (5 visible, rest in dropdown)
  const { visibleCategories, hiddenCategories } = useMemo(() => {
    if (!categories?.length) return { visibleCategories: [], hiddenCategories: [] };
    return {
      visibleCategories: categories.slice(0, 5),
      hiddenCategories: categories.slice(5),
    };
  }, [categories]);

  // --- HANDLERS ---

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim());
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  // --- RENDER HELPERS ---

  const CategorySkeleton = () => (
    <div className="flex gap-4 animate-pulse">
      <div className="h-4 w-16 bg-slate-200 rounded" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
      <div className="h-4 w-14 bg-slate-200 rounded" />
    </div>
  );

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-lg border-pink-100 shadow-sm" 
            : "bg-white border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3 md:py-4 relative">
          
          {/* TOP ROW: Logo, Desktop Search, Mobile Toggle */}
          <div className="flex items-center justify-between gap-4 md:gap-8">
            
            {/* 1. LOGO */}
            <Link 
              to="/" 
              className="flex items-center gap-2 flex-shrink-0 group select-none" 
              onClick={() => {
                setSearchQuery(""); 
                setMobileMenuOpen(false);
              }}
            >
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 group-hover:shadow-md transition-all duration-300">
                  <ShoppingBag className="h-6 w-6 text-pink-600" />
                  <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                  Lipink<span className="text-pink-600">.</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                  Parcel & Hampers
                </span>
              </div>
            </Link>

            {/* 2. DESKTOP SEARCH BAR */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative group">
              <div className="relative w-full">
                <Input 
                  type="text"
                  placeholder="Cari parcel lebaran, imlek..." 
                  className="w-full pl-11 pr-4 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-50 rounded-2xl transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              </div>
            </form>

            {/* 3. DESKTOP CATEGORIES (Horizontal List) */}
            <div className="hidden md:flex items-center gap-1">
              {loading ? (
                <CategorySkeleton />
              ) : (
                <>
                  {visibleCategories.map((category: any) => (
                    <Link
                      key={category.id}
                      to={`/produk/${category.slug}`}
                      className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
                    >
                      {category.name}
                    </Link>
                  ))}

                  {/* Dropdown for extra categories */}
                  {hiddenCategories.length > 0 && (
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          dropdownOpen ? 'text-pink-600 bg-pink-50' : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                      >
                        Lainnya <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div 
                        className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 transform transition-all duration-200 origin-top-right ${
                          dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                      >
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {hiddenCategories.map((cat: any) => (
                            <Link 
                              key={cat.id} 
                              to={`/produk/${cat.slug}`} 
                              className="block px-4 py-2.5 text-sm text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Separator */}
                  <div className="h-6 w-px bg-slate-200 mx-2" />

                  {/* Blog Link - Differentiated */}
                  <Link
                    to="/blog"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 hover:from-purple-100 hover:to-pink-100 border border-purple-100 rounded-lg transition-all duration-200"
                  >
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </Link>
                </>
              )}
            </div>

            {/* 4. MOBILE HAMBURGER */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* MOBILE SEARCH BAR (Below Logo) */}
          <div className="mt-4 md:hidden">
             <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                   placeholder="Cari produk..." 
                   className="w-full pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-pink-300 rounded-xl"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </form>
          </div>
        </div>
      </nav>

      {/* --- MOBILE FULL SCREEN MENU --- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[120px] z-40 bg-white/95 backdrop-blur-sm border-t border-slate-100 overflow-y-auto animate-in slide-in-from-top-5 duration-200">
          <div className="p-4 pb-20 space-y-6">
            
            {/* 1. Categories Grid */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Kategori Produk</h3>
               
               {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                     {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
               ) : (
                 <div className="grid grid-cols-2 gap-3">
                    {categories.map((category: any) => (
                       <Link
                         key={category.id}
                         to={`/produk/${category.slug}`}
                         className="flex items-center justify-center px-4 py-3 bg-slate-50 hover:bg-pink-50 border border-slate-100 hover:border-pink-200 rounded-xl transition-all active:scale-95"
                         onClick={() => setMobileMenuOpen(false)}
                       >
                         <span className="text-sm font-medium text-slate-700 text-center line-clamp-1">
                           {category.name}
                         </span>
                       </Link>
                    ))}
                 </div>
               )}
            </div>

            {/* 2. Blog Link */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Artikel & Tips</h3>
               <Link
                 to="/blog"
                 className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-100 rounded-xl transition-all active:scale-95"
                 onClick={() => setMobileMenuOpen(false)}
               >
                 <div className="p-2 bg-white rounded-lg shadow-sm">
                   <BookOpen className="w-5 h-5 text-pink-600" />
                 </div>
                 <div>
                   <span className="text-sm font-semibold text-slate-800">Blog</span>
                   <p className="text-xs text-slate-500">Tips memilih parcel & inspirasi hadiah</p>
                 </div>
               </Link>
            </div>

            {/* 3. Help / Contact Section */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
                     <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-800 text-sm">Butuh Bantuan?</h4>
                     <p className="text-xs text-slate-500">Admin kami siap membantu</p>
                  </div>
               </div>
               <a 
                 href="https://wa.me/628122208580" 
                 target="_blank"
                 rel="noreferrer"
                 className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-600 hover:text-white transition-all mt-2"
               >
                 <Phone className="w-4 h-4" /> Hubungi Kami
               </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};