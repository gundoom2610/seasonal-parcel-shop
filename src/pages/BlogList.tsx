"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { SEO } from "@/components/SEO"
import { Footer } from "@/components/Footer"
import { blogPosts } from "@/data/blogs"
import { Calendar, Clock, User, ChevronRight, BookOpen } from "lucide-react"

const SEO_CONFIG = {
  siteName: "Lipink Parcel Cirebon",
  siteUrl: "https://www.parcelcirebon.com",
}

export const BlogList = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO
        title="Blog & Artikel Parcel Cirebon | Tips Hampers & Panduan | Lipink"
        description="Baca artikel dan tips seputar parcel, hampers, dan hadiah. Panduan memilih parcel lebaran, natal, imlek, dan pengiriman di Cirebon."
        keywords="blog parcel, artikel hampers, tips parcel lebaran, panduan parcel natal, parcel imlek, parcel cirebon"
        url="/blog"
        canonical={`${SEO_CONFIG.siteUrl}/blog`}
      />

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-pink-100 mb-4">
              <BookOpen className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Blog & Artikel</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
              Tips & Panduan Parcel
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan inspirasi, tips memilih parcel, dan panduan lengkap untuk berbagai momen spesial Anda.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {blogPosts.map((post, index) => (
              <article 
                key={post.slug}
                className="group bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden border border-pink-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  {/* Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to gradient with emoji if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 items-center justify-center hidden" style={{ display: 'none' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-500/20" />
                      <span className="text-6xl relative z-10">
                        {post.category === "Lebaran" && "🕌"}
                        {post.category === "Natal" && "🎄"}
                        {post.category === "Imlek" && "🧧"}
                        {post.category === "Panduan" && "📦"}
                      </span>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-pink-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">
                      {post.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-pink-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        Baca Selengkapnya
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* SEO Content */}
          <div className="mt-16 bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
            <h2 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Tentang Blog Lipink Parcel
            </h2>
            <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
              <p>
                Blog Lipink Parcel Cirebon menyajikan berbagai artikel informatif seputar parcel, hampers, dan hadiah untuk berbagai momen spesial. 
                Kami berbagi tips memilih parcel yang tepat, panduan pengiriman, serta inspirasi ide hadiah untuk Lebaran, Natal, Imlek, dan acara lainnya.
              </p>
              <p>
                Sebagai toko parcel terpercaya di Cirebon, kami berkomitmen untuk tidak hanya menyediakan produk berkualitas, 
                tetapi juga membantu Anda memahami tradisi dan etika pemberian hadiah di Indonesia.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
