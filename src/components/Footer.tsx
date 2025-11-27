import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  Store, 
  CreditCard,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Data Configuration
  const CONTACT_INFO = {
    address: "Jl. Garuda No.4, Pekiringan, Kec. Kesambi, Kota Cirebon, Jawa Barat 45131 (Area Jakarta Intl Denso Cirebon)",
    phone: "+62 812-220-8580",
  };

  const SOCIALS = [
    { 
      name: "Instagram", 
      url: "https://www.instagram.com/lipink2003/", 
      icon: Instagram,
      style: "bg-white text-pink-600 border-slate-200 hover:border-pink-200 hover:bg-pink-50"
    },
    { 
      name: "Facebook", 
      url: "https://m.facebook.com/happybeargiftland/", 
      icon: Facebook,
      style: "bg-white text-blue-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50"
    },
    { 
      name: "WhatsApp", 
      url: "https://api.whatsapp.com/send?phone=628122208580", 
      icon: MessageCircle,
      style: "bg-white text-green-600 border-slate-200 hover:border-green-200 hover:bg-green-50"
    },
  ];

  const MARKETPLACES = [
    { 
      name: "Shopee", 
      url: "https://shopee.co.id/lipink2003", 
      icon: ShoppingBag,
      style: "bg-[#EE4D2D] hover:bg-[#d03e1f] text-white border-0"
    },
    { 
      name: "Tokopedia", 
      url: "https://www.tokopedia.com/giftland", 
      icon: Store,
      style: "bg-[#03AC0E] hover:bg-[#02910b] text-white border-0"
    },
  ];

  return (
    // ADDED: shadow-[0_-10px_60px_rgba(0,0,0,0.05)] for a nice upward shadow
    <footer className="bg-white border-t border-slate-100 pt-12 pb-8 font-sans w-full shadow-[0_-10px_60px_rgba(0,0,0,0.05)] relative z-10">
      
      <div className="container mx-auto px-6">
        
        {/* === TOP GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
          
          {/* COL 1: BRANDING (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 select-none">
              <div className="relative p-2 rounded-xl bg-pink-50 border border-pink-100">
                 <ShoppingBag className="h-6 w-6 text-pink-600" />
                 <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                  Lipink<span className="text-pink-600">.</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                  Parcel & Hampers
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Menyediakan parcel Lebaran, Natal, Imlek, dan Kado Spesial dengan sentuhan personal dan kualitas premium di Cirebon.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 leading-snug">{CONTACT_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-600 shrink-0" />
                <span className="text-sm font-bold text-slate-800">{CONTACT_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* COL 2: SOCIALS & MARKETPLACE (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Socials */}
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-4">Ikuti Kami</h4>
              <div className="flex gap-3">
                {SOCIALS.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm transition-all duration-200 hover:-translate-y-1 ${social.style}`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Marketplaces */}
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-4">Official Store</h4>
              <div className="flex flex-col gap-3">
                {MARKETPLACES.map((market) => (
                  <a 
                    key={market.name} 
                    href={market.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block group"
                  >
                    <div className={`flex items-center justify-between px-4 h-12 rounded-xl shadow-sm transition-transform hover:scale-[1.01] ${market.style}`}>
                      <div className="flex items-center gap-3">
                        <market.icon className="w-5 h-5" />
                        <span className="font-semibold text-sm">Beli di {market.name}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* COL 3: MAP (4 Cols) */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-slate-900 text-base mb-4">Lokasi Toko</h4>
            <div className="rounded-xl overflow-hidden border border-slate-200 h-[220px] relative group bg-slate-50 shadow-inner">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63397.36884661832!2d108.49960287908674!3d-6.728850976340273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ee332a98bcd4d%3A0xa312180f026abea6!2sParcel%20Cirebon%20%26%20Set%20Bekal%20Anak%20-%20HappyBear%20Giftland!5e0!3m2!1sen!2sid!4v1764092131318!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
              ></iframe>
              
              <div className="absolute bottom-3 left-3 right-3">
                 <a href="https://share.google/USTQ0jAyd2IIoHRVJ" target="_blank" rel="noreferrer">
                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white transition-colors shadow-lg border border-slate-200/50">
                       <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-pink-600" />
                          <span className="text-xs font-bold text-slate-700">Buka di Google Maps</span>
                       </div>
                       <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                 </a>
              </div>
            </div>
          </div>

        </div>

        <Separator className="bg-slate-100 mb-8" />

        {/* === BOTTOM SECTION === */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-xs text-center md:text-left">
            © {currentYear} <strong>Lipink Parcel Cirebon</strong>. All Rights Reserved.
          </div>
          
          <div className="flex items-center gap-4 opacity-60">
             <div className="flex items-center gap-1 text-slate-400">
                <CreditCard className="w-4 h-4" />
             </div>
             <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-4 h-4" />
             </div>
             <div className="flex items-center gap-1 text-slate-400">
                <Truck className="w-4 h-4" />
             </div>
          </div>
        </div>

      </div>
    </footer>
  );
};