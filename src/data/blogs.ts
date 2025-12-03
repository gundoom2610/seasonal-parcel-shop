// Blog metadata and content
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readTime: string;
  keywords: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "tips-memilih-parcel-lebaran",
    title: "Tips Memilih Parcel Lebaran yang Berkesan untuk Keluarga",
    description: "Panduan lengkap memilih parcel lebaran yang tepat untuk keluarga dan kerabat. Tips budget, kualitas, dan kemasan yang berkesan.",
    date: "2025-03-01",
    author: "Tim Lipink Parcel",
    category: "Lebaran",
    image: "/parcel-lebaran.png",
    readTime: "5 menit",
    keywords: "parcel lebaran, hampers lebaran, tips parcel, parcel keluarga, parcel cirebon"
  },
  {
    slug: "parcel-natal-untuk-kerabat",
    title: "Ide Parcel Natal Unik untuk Kerabat dan Sahabat",
    description: "Kumpulan ide parcel natal kreatif untuk keluarga, sahabat, dan rekan kerja. Temukan inspirasi hadiah natal terbaik.",
    date: "2025-12-01",
    author: "Tim Lipink Parcel",
    category: "Natal",
    image: "/natal.png",
    readTime: "6 menit",
    keywords: "parcel natal, hampers natal, hadiah natal, ide parcel, christmas gift"
  },
  {
    slug: "tradisi-parcel-imlek",
    title: "Tradisi Parcel Imlek dan Maknanya dalam Budaya Tionghoa",
    description: "Pelajari tradisi bertukar parcel saat Imlek, makna warna dan isi parcel, serta etika pemberian hadiah dalam budaya Tionghoa.",
    date: "2025-01-15",
    author: "Tim Lipink Parcel",
    category: "Imlek",
    image: "/parcel-imlek.png",
    readTime: "7 menit",
    keywords: "parcel imlek, hampers imlek, tradisi imlek, tahun baru cina, chinese new year"
  },
  {
    slug: "panduan-kirim-parcel-cirebon",
    title: "Panduan Lengkap Kirim Parcel di Cirebon dan Sekitarnya",
    description: "Informasi lengkap pengiriman parcel ke Cirebon, Majalengka, Indramayu. Tips kemasan, estimasi biaya, dan waktu pengiriman.",
    date: "2025-02-15",
    author: "Tim Lipink Parcel",
    category: "Panduan",
    image: "/parcel-delivery.png",
    readTime: "8 menit",
    keywords: "kirim parcel cirebon, pengiriman parcel, ongkir parcel, parcel majalengka, parcel indramayu"
  },
  {
    slug: "parcel-terbaik-cirebon",
    title: "Parcel Terbaik Cirebon - Pilihan Hadiah untuk Setiap Momen",
    description: "Lipink Parcel Cirebon menyediakan parcel terbaik untuk Natal, Imlek, dan Lebaran. Pengalaman lebih dari 6 tahun melayani Cirebon dan sekitarnya.",
    date: "2025-12-03",
    author: "Tim Lipink Parcel",
    category: "Tentang Kami",
    image: "/og-image.png",
    readTime: "4 menit",
    keywords: "parcel terbaik cirebon, toko parcel cirebon, hampers cirebon, parcel natal cirebon, parcel imlek cirebon, parcel lebaran cirebon"
  }
];

export const getBlogBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit: number = 3): BlogPost[] => {
  return blogPosts.filter(post => post.slug !== currentSlug).slice(0, limit);
};
