"use client"

import { useParams, Link, useNavigate } from "react-router-dom"
import { SEO } from "@/components/SEO"
import { Footer } from "@/components/Footer"
import { blogPosts, getBlogBySlug, getRelatedPosts } from "@/data/blogs"
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Share2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

// Blog content - in production, this could come from a CMS or markdown files
const blogContent: Record<string, string> = {
  "tips-memilih-parcel-lebaran": `
## 1. Kenali Penerima Parcel

Sebelum memilih parcel, pertimbangkan siapa yang akan menerimanya:
- **Orang tua**: Pilih parcel dengan makanan sehat, kurma premium, atau perlengkapan ibadah
- **Rekan kerja**: Parcel dengan kue kering dan sirup lebaran cocok untuk suasana profesional
- **Kerabat jauh**: Pilih parcel yang tahan lama dan aman untuk pengiriman

## 2. Perhatikan Kualitas Isi Parcel

Kualitas isi parcel sangat penting untuk memberikan kesan yang baik:
- Pastikan produk dalam kemasan asli dan tersegel
- Cek tanggal kadaluarsa semua item
- Pilih merk yang sudah terpercaya

## 3. Sesuaikan dengan Budget

Parcel lebaran tersedia dalam berbagai rentang harga:
- **Rp 100.000 - Rp 300.000**: Parcel sederhana dengan kue kering dan sirup
- **Rp 300.000 - Rp 500.000**: Parcel lengkap dengan kurma dan aneka makanan
- **Rp 500.000 ke atas**: Parcel premium dengan keramik atau perlengkapan mewah

## 4. Pilih Kemasan yang Menarik

Kemasan parcel yang cantik akan memberikan kesan pertama yang baik:
- Warna hijau dan emas identik dengan nuansa Lebaran
- Keranjang rotan memberikan kesan tradisional
- Box eksklusif cocok untuk parcel premium

## 5. Pesan dari Toko Terpercaya

Pastikan membeli parcel dari toko yang:
- Memiliki review positif dari pembeli
- Menyediakan foto real product
- Memberikan garansi kualitas

## Kesimpulan

Memilih parcel lebaran yang tepat membutuhkan pertimbangan matang. Dengan mengikuti tips di atas, Anda bisa memberikan parcel yang berkesan untuk orang-orang tersayang.
  `,
  "parcel-natal-untuk-kerabat": `
## Parcel Natal untuk Keluarga

### 1. Parcel Makanan Natal
Isi dengan:
- Cookies jahe khas natal
- Cokelat premium import
- Kue fruit cake
- Wine atau sirup anggur

### 2. Parcel Dekorasi Rumah
Kombinasikan:
- Lilin aromaterapi
- Ornamen pohon natal
- Taplak meja bermotif natal
- Vas bunga cantik

## Parcel Natal untuk Sahabat

### 1. Parcel Self-Care
Cocok untuk sahabat yang butuh relaksasi:
- Set skincare
- Bath bomb
- Essential oil
- Masker wajah premium

### 2. Parcel Snack Premium
Untuk sahabat pecinta kuliner:
- Aneka keripik premium
- Cokelat artisan
- Kopi specialty
- Teh herbal

## Parcel Natal untuk Rekan Kerja

### 1. Parcel Profesional
Pilihan aman untuk hubungan profesional:
- Kopi dan teh premium
- Cookies dalam kemasan elegan
- Madu atau selai import

## Tips Memilih Kemasan Natal

1. **Warna**: Gunakan merah, hijau, emas, atau putih
2. **Aksesoris**: Tambahkan pita, holly, atau ornamen mini
3. **Kartu ucapan**: Jangan lupa sertakan kartu dengan pesan personal

## Waktu Terbaik Memesan Parcel Natal

- **Awal Desember**: Pilihan paling lengkap, harga normal
- **Pertengahan Desember**: Masih banyak stok, mulai ramai
- **Minggu terakhir**: Stok terbatas, perlu pesan jauh hari
  `,
  "tradisi-parcel-imlek": `
## Sejarah Tradisi Bertukar Parcel Imlek

Tradisi memberikan hadiah saat Imlek sudah berlangsung ribuan tahun. Dalam kepercayaan Tionghoa, memberikan hadiah adalah cara untuk:
- Menghormati orang tua dan leluhur
- Mempererat tali silaturahmi
- Berbagi keberuntungan dan rezeki

## Makna Warna dalam Parcel Imlek

### Merah (红 - Hóng)
Warna merah melambangkan keberuntungan, kebahagiaan, dan kemakmuran. Hampir semua parcel Imlek menggunakan warna merah sebagai warna dominan.

### Emas (金 - Jīn)
Warna emas melambangkan kekayaan dan kejayaan. Kombinasi merah-emas adalah pilihan paling populer untuk parcel Imlek.

## Isi Parcel Imlek yang Bermakna

### 1. Jeruk Mandarin (橘子 - Júzi)
Melambangkan keberuntungan karena pengucapannya mirip dengan kata "keberuntungan" dalam bahasa Mandarin.

### 2. Kue Keranjang (年糕 - Niángāo)
Simbol kemajuan dan peningkatan dalam hidup. Wajib ada dalam setiap parcel Imlek.

### 3. Manisan dan Permen
Melambangkan harapan untuk kehidupan yang manis sepanjang tahun.

## Etika Memberikan Parcel Imlek

1. **Gunakan kedua tangan** saat memberikan parcel
2. **Hindari angka 4** dalam jumlah item (dianggap kurang beruntung)
3. **Pilih angka 8** jika memungkinkan (simbol kemakmuran)
4. **Jangan bungkus dengan warna putih atau hitam**

## Tips Memilih Parcel Imlek

1. Perhatikan kualitas kemasan - harus terlihat mewah dan festif
2. Pilih isi yang bermakna simbolis
3. Sesuaikan dengan status dan usia penerima
4. Pesan lebih awal untuk mendapat pilihan terbaik
  `,
  "panduan-kirim-parcel-cirebon": `
## Wilayah Pengiriman Parcel di Cirebon

### Cirebon Kota
Pengiriman same-day tersedia untuk area:
- Kesambi
- Pekalipan
- Kejaksan
- Lemahwungkuk
- Harjamukti

### Kabupaten Cirebon
Pengiriman 1 hari kerja untuk:
- Sumber
- Plered
- Weru
- Palimanan
- Arjawinangun

### Majalengka
Pengiriman 1-2 hari kerja meliputi:
- Majalengka Kota
- Kadipaten
- Jatiwangi
- Leuwimunding

### Indramayu
Pengiriman 1-2 hari kerja ke:
- Indramayu Kota
- Haurgeulis
- Jatibarang
- Losarang

## Tips Pengiriman Parcel yang Aman

### 1. Kemasan yang Kuat
- Gunakan box kardus tebal untuk parcel besar
- Lapisi dengan bubble wrap untuk barang pecah belah
- Pastikan tidak ada ruang kosong dalam box

### 2. Label yang Jelas
Pastikan label pengiriman mencantumkan:
- Nama lengkap penerima
- Alamat lengkap dengan kode pos
- Nomor telepon aktif
- Catatan khusus jika diperlukan

## Estimasi Biaya Pengiriman

| Tujuan | Berat hingga 5kg | Berat 5-10kg |
|--------|------------------|--------------|
| Cirebon Kota | Rp 15.000 | Rp 25.000 |
| Kab. Cirebon | Rp 20.000 | Rp 35.000 |
| Majalengka | Rp 25.000 | Rp 40.000 |
| Indramayu | Rp 25.000 | Rp 40.000 |

## Pertanyaan yang Sering Diajukan

**Q: Apakah bisa kirim parcel hari yang sama?**
A: Ya, untuk area Cirebon Kota dengan pemesanan sebelum jam 12.00 siang.

**Q: Bagaimana jika parcel rusak saat pengiriman?**
A: Kami memberikan garansi penggantian untuk kerusakan akibat pengiriman.
  `,
  "parcel-terbaik-cirebon": `
## Parcel Cirebon Terbaik untuk Setiap Momen Spesial

Selamat datang di **Lipink Parcel Cirebon** - toko parcel dan hampers terpercaya yang telah melayani masyarakat Cirebon dan sekitarnya selama lebih dari **6 tahun**. Kami berkomitmen untuk menyediakan parcel berkualitas terbaik dengan harga yang terjangkau.

## Mengapa Memilih Lipink Parcel?

### Pengalaman Lebih dari 6 Tahun
Dengan pengalaman lebih dari 6 tahun di industri parcel dan hampers, kami memahami betul apa yang dibutuhkan pelanggan:
- Kualitas produk yang terjamin
- Kemasan yang menarik dan elegan
- Harga yang bersaing
- Pelayanan yang ramah dan profesional

### Lokasi Strategis
Kunjungi toko kami di:

**Jl. Garuda No. 2, Cirebon**

Lokasi kami yang strategis memudahkan Anda untuk melihat langsung koleksi parcel kami dan berkonsultasi dengan tim kami.

## Parcel untuk Setiap Perayaan

### 🎄 Parcel Natal
Rayakan Natal dengan parcel istimewa dari kami:
- Parcel cookies dan cokelat premium
- Hampers dengan dekorasi natal
- Paket hadiah keluarga
- Parcel eksklusif dengan wine dan keju

### 🧧 Parcel Imlek
Sambut Tahun Baru Imlek dengan keberuntungan:
- Parcel dengan kemasan merah dan emas
- Hampers kue keranjang dan jeruk mandarin
- Paket premium dengan barang-barang simbolis
- Parcel custom sesuai keinginan

### 🕌 Parcel Lebaran
Berbagi kebahagiaan di Hari Raya:
- Parcel kurma premium
- Hampers kue kering lebaran
- Paket sirup dan makanan ringan
- Parcel dengan perlengkapan ibadah

## Keunggulan Produk Kami

1. **Bahan Berkualitas**: Semua produk dalam parcel kami dipilih dari brand terpercaya
2. **Kemasan Premium**: Desain kemasan yang cantik dan elegan
3. **Harga Bersaing**: Kualitas terbaik dengan harga yang terjangkau
4. **Pengiriman Aman**: Garansi parcel sampai dengan selamat

## Layanan Kami

- **Custom Parcel**: Sesuaikan isi parcel dengan keinginan Anda
- **Pengiriman Lokal**: Same-day delivery untuk area Cirebon Kota
- **Konsultasi Gratis**: Tim kami siap membantu memilih parcel yang tepat
- **Pemesanan Mudah**: Pesan via WhatsApp atau kunjungi langsung toko kami

## Hubungi Kami

Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut atau pemesanan:

**Alamat**: Jl. Garuda No. 2, Cirebon

Kami siap melayani Anda dengan sepenuh hati. Terima kasih telah mempercayakan momen spesial Anda kepada Lipink Parcel Cirebon!
  `
};

const SEO_CONFIG = {
  siteName: "Lipink Parcel Cirebon",
  siteUrl: "https://www.parcelcirebon.com",
}

// Simple markdown-like renderer
const renderContent = (content: string) => {
  const lines = content.trim().split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag key={key++} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-6 mb-4 space-y-2 text-gray-700`}>
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-4">
          {trimmed.replace('## ', '')}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-3">
          {trimmed.replace('### ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(trimmed.substring(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed.startsWith('|')) {
      flushList();
      // Skip table for now, render as text
    } else if (trimmed.startsWith('**Q:')) {
      flushList();
      elements.push(
        <div key={key++} className="bg-pink-50 p-4 rounded-xl mb-3 border-l-4 border-pink-400">
          <p className="font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      );
    } else if (trimmed.startsWith('A:')) {
      elements.push(
        <p key={key++} className="text-gray-700 mb-4 pl-4">
          {trimmed.substring(3)}
        </p>
      );
    } else if (trimmed) {
      flushList();
      elements.push(
        <p key={key++} className="text-gray-700 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    }
  });

  flushList();
  return elements;
};

export const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 2) : [];
  const content = slug ? blogContent[slug] : undefined;

  if (!post || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BookOpen className="w-12 h-12 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">Artikel yang Anda cari tidak tersedia atau telah dipindahkan.</p>
          <Button onClick={() => navigate('/blog')} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            Kembali ke Blog
          </Button>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": `${SEO_CONFIG.siteUrl}${post.image}`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${SEO_CONFIG.siteUrl}/og-image.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SEO_CONFIG.siteUrl}/blog/${post.slug}`
    }
  };

  return (
    <>
      <SEO
        title={`${post.title} | Blog Lipink Parcel Cirebon`}
        description={post.description}
        keywords={post.keywords}
        url={`/blog/${post.slug}`}
        canonical={`${SEO_CONFIG.siteUrl}/blog/${post.slug}`}
        type="article"
        publishedTime={post.date}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-pink-600">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-pink-600">Blog</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-8">
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden border border-pink-100">
                {/* Header Image */}
                <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 items-center justify-center hidden" style={{ display: 'none' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-500/20" />
                    <span className="text-8xl relative z-10">
                      {post.category === "Lebaran" && "🕌"}
                      {post.category === "Natal" && "🎄"}
                      {post.category === "Imlek" && "🧧"}
                      {post.category === "Panduan" && "📦"}
                    </span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-pink-600 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 lg:p-10">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} baca</span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-lg max-w-none">
                    {renderContent(content)}
                  </div>

                  {/* CTA */}
                  <div className="mt-10 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
                    <p className="text-gray-700 mb-4">
                      <strong>Lipink Parcel Cirebon</strong> menyediakan berbagai pilihan parcel berkualitas dengan harga terjangkau. 
                      Hubungi kami untuk konsultasi gratis!
                    </p>
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all"
                    >
                      Lihat Koleksi Parcel
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Share */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Bagikan:</span>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: post.title, url: window.location.href });
                          }
                        }}
                        className="p-2 bg-gray-100 hover:bg-pink-100 rounded-full transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Related Posts */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Artikel Lainnya</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <Link 
                        key={related.slug}
                        to={`/blog/${related.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">
                              {related.category === "Lebaran" && "🕌"}
                              {related.category === "Natal" && "🎄"}
                              {related.category === "Imlek" && "🧧"}
                              {related.category === "Panduan" && "📦"}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                              {related.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{related.readTime}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    to="/blog" 
                    className="block text-center text-pink-600 font-semibold text-sm mt-4 pt-4 border-t border-gray-100 hover:text-pink-700"
                  >
                    Lihat Semua Artikel
                  </Link>
                </div>

                {/* CTA Sidebar */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Butuh Parcel?</h3>
                  <p className="text-pink-100 text-sm mb-4">
                    Konsultasi gratis untuk pilihan parcel terbaik sesuai budget Anda.
                  </p>
                  <Link 
                    to="/"
                    className="block text-center bg-white text-pink-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-pink-50 transition-colors"
                  >
                    Lihat Produk
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
