import { Instagram, MessageCircle, Facebook, ShoppingBag, Store } from "lucide-react"

// Social media constants - easy to change
const SOCIAL_LINKS = {
  instagram: {
    url: "https://instagram.com/yourstore",
    label: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-600",
  },
  shopee: {
    url: "https://shopee.co.id/yourstore",
    label: "Shopee",
    icon: ShoppingBag,
    color: "from-orange-500 to-red-500",
  },
  whatsapp: {
    url: "https://wa.me/6281234567890",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "from-green-500 to-emerald-600",
  },
  tokopedia: {
    url: "https://tokopedia.com/yourstore",
    label: "Tokopedia",
    icon: Store,
    color: "from-green-600 to-teal-600",
  },
  facebook: {
    url: "https://facebook.com/yourstore",
    label: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-indigo-600",
  },
}

const COMPANY_INFO = {
  name: "Toko Hampers Premium",
  tagline: "Hadiah Istimewa untuk Momen Berharga",
  description: "Menyediakan hampers dan hadiah berkualitas premium untuk setiap momen spesial Anda.",
  email: "hello@tokohampers.com",
  phone: "+62 812-3456-7890",
  address: "Jakarta, Indonesia",
}

const QUICK_LINKS = [
  { name: "Tentang Kami", href: "/about" },
  { name: "Katalog Produk", href: "/produk" },
  { name: "Cara Pemesanan", href: "/cara-pesan" },
  { name: "Kebijakan Privasi", href: "/privacy" },
  { name: "Syarat & Ketentuan", href: "/terms" },
  { name: "Kontak", href: "/contact" },
]

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-t border-pink-100">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {COMPANY_INFO.name}
              </h3>
              <p className="text-pink-600 font-medium text-lg mb-4">{COMPANY_INFO.tagline}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{COMPANY_INFO.description}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex-shrink-0"></div>
                <span>{COMPANY_INFO.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex-shrink-0"></div>
                <span>{COMPANY_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex-shrink-0"></div>
                <span>{COMPANY_INFO.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Tautan Cepat</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-pink-600 transition-colors duration-300 hover:translate-x-1 transform inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Ikuti Kami</h4>
            <div className="space-y-4">
              {Object.entries(SOCIAL_LINKS).map(([key, social]) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group hover:translate-x-2 transition-all duration-300"
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${social.color} rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors duration-300">
                      {social.label}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-12 shadow-xl border border-pink-100">
          <div className="text-center max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Dapatkan Penawaran Spesial
            </h4>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Berlangganan newsletter kami untuk mendapatkan info produk terbaru, promo eksklusif, dan tips hadiah
              menarik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-6 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Berlangganan
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-pink-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-600">
                © {currentYear} {COMPANY_INFO.name}. Semua hak dilindungi.
              </p>
              <p className="text-sm text-gray-500 mt-1">Dibuat dengan ❤️ untuk momen istimewa Anda</p>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-4">
              {Object.entries(SOCIAL_LINKS).map(([key, social]) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    title={social.label}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
