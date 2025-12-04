"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { SEO } from "@/components/SEO"
import { Footer } from "@/components/Footer"
import { 
  ShieldCheck, 
  Phone, 
  Video, 
  Clock, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  ChevronRight,
  FileText
} from "lucide-react"

const SEO_CONFIG = {
  siteName: "Lipink Parcel Cirebon",
  siteUrl: "https://www.parcelcirebon.com",
}

export const ReturnPolicy = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@type": "WebPage",
    "name": "Kebijakan Pengembalian - Lipink Parcel Cirebon",
    "description": "Kebijakan pengembalian dan refund untuk produk parcel dan hampers dari Lipink Parcel Cirebon.",
    "url": `${SEO_CONFIG.siteUrl}/return-policy`,
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Bagaimana cara mengajukan pengembalian produk?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hubungi WhatsApp kami di 081-222-085-80 dalam waktu 24 jam setelah penerimaan dengan menyertakan video unboxing sebagai bukti."
          }
        },
        {
          "@type": "Question",
          "name": "Berapa lama proses refund?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Proses refund akan dilakukan dalam 3-7 hari kerja setelah klaim disetujui."
          }
        }
      ]
    }
  }

  return (
    <>
      <SEO
        title="Kebijakan Pengembalian & Refund | Lipink Parcel Cirebon"
        description="Kebijakan pengembalian produk, syarat refund, dan prosedur klaim untuk parcel dan hampers di Lipink Parcel Cirebon. Hubungi WhatsApp 081-222-085-80."
        keywords="kebijakan pengembalian, return policy, refund parcel, garansi parcel, klaim kerusakan, lipink parcel"
        url="/return-policy"
        canonical={`${SEO_CONFIG.siteUrl}/return-policy`}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-pink-600">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Kebijakan Pengembalian</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-pink-100 mb-4">
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Return Policy</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
              Kebijakan Pengembalian
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Kami berkomitmen untuk kepuasan pelanggan. Berikut adalah kebijakan pengembalian dan refund kami.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Terakhir diperbarui: 4 Desember 2025
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* IMPORTANT: Video Requirement */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border-2 border-amber-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Video className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    WAJIB: Video Penerimaan
                  </h2>
                  <div className="space-y-3 text-amber-900">
                    <p className="font-semibold text-lg">
                      ⚠️ WAJIB ada video penerimaan barang untuk dapat mengajukan klaim pengembalian!
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span><strong>WAJIB</strong> merekam video saat membuka paket (unboxing)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span><strong>WAJIB</strong> video menunjukkan kondisi kemasan luar sebelum dibuka</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span><strong>WAJIB</strong> video tidak terputus dari awal hingga akhir pembukaan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span><strong>WAJIB</strong> simpan video sebagai bukti jika terjadi masalah</span>
                      </li>
                    </ul>
                    <p className="text-sm bg-amber-100 p-3 rounded-lg mt-4">
                      <strong>⚠️ Tanpa video penerimaan, klaim pengembalian/refund TIDAK dapat diproses.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact for Returns */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-3">
                    Hubungi Kami untuk Pengembalian
                  </h2>
                  <p className="text-green-700 mb-4">
                    Untuk mengajukan pengembalian atau klaim, silakan hubungi kami melalui WhatsApp:
                  </p>
                  <a 
                    href="https://wa.me/6281222085080?text=Halo%20Lipink%20Parcel,%20saya%20ingin%20mengajukan%20klaim%20pengembalian%20untuk%20pesanan%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-lg">081-222-085-80</span>
                  </a>
                  <p className="text-sm text-green-600 mt-3">
                    Jam operasional: Senin - Sabtu, 08:00 - 17:00 WIB
                  </p>
                </div>
              </div>
            </div>

            {/* Return Policy Details */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-pink-600" />
                Syarat & Ketentuan Pengembalian
              </h2>
              
              <div className="space-y-6">
                {/* Eligible for Return */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Produk yang Dapat Dikembalikan
                  </h3>
                  <ul className="space-y-2 text-gray-700 ml-7">
                    <li>• Produk rusak atau cacat saat diterima</li>
                    <li>• Produk tidak sesuai dengan pesanan</li>
                    <li>• Kemasan rusak parah yang menyebabkan kerusakan isi</li>
                    <li>• Produk kadaluarsa saat diterima</li>
                    <li>• Jumlah item tidak sesuai dengan pesanan</li>
                  </ul>
                </div>

                {/* Not Eligible for Return */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Produk yang Tidak Dapat Dikembalikan
                  </h3>
                  <ul className="space-y-2 text-gray-700 ml-7">
                    <li>• Produk sudah dibuka/digunakan tanpa video penerimaan</li>
                    <li>• Kerusakan akibat kelalaian pembeli setelah diterima</li>
                    <li>• Perubahan pikiran atau tidak suka dengan produk</li>
                    <li>• Klaim diajukan lebih dari 24 jam setelah penerimaan</li>
                    <li>• Produk custom/pesanan khusus</li>
                  </ul>
                </div>

                {/* Time Limit */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Batas Waktu Pengajuan Klaim
                  </h3>
                  <p className="text-blue-700">
                    Klaim pengembalian <strong>WAJIB</strong> diajukan dalam waktu <strong>maksimal 24 jam</strong> setelah barang diterima. 
                    Klaim yang diajukan setelah batas waktu tidak akan diproses.
                  </p>
                </div>
              </div>
            </div>

            {/* Return Process */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-pink-600" />
                Prosedur Pengembalian
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Rekam Video Unboxing</h4>
                    <p className="text-gray-600 text-sm">
                      <strong>WAJIB</strong> rekam video penerimaan dari kemasan tertutup hingga selesai dibuka. 
                      Pastikan video tidak terputus.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Hubungi WhatsApp</h4>
                    <p className="text-gray-600 text-sm">
                      Segera hubungi kami di <strong>081-222-085-80</strong> dalam waktu 24 jam 
                      setelah penerimaan barang.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Kirim Bukti</h4>
                    <p className="text-gray-600 text-sm">
                      Kirimkan video unboxing, foto produk yang bermasalah, dan nomor pesanan Anda.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Verifikasi</h4>
                    <p className="text-gray-600 text-sm">
                      Tim kami akan memverifikasi klaim Anda dalam 1-2 hari kerja.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Refund/Penggantian</h4>
                    <p className="text-gray-600 text-sm">
                      Jika klaim disetujui, refund akan diproses dalam 3-7 hari kerja 
                      atau produk pengganti akan dikirim.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Information */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Informasi Refund
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Metode Pembayaran</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Waktu Refund</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Transfer Bank</td>
                      <td className="py-3 px-4">3-5 hari kerja</td>
                      <td className="py-3 px-4">Ke rekening yang sama</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">E-Wallet (OVO, GoPay, dll)</td>
                      <td className="py-3 px-4">1-3 hari kerja</td>
                      <td className="py-3 px-4">Ke akun yang sama</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">COD (Bayar di Tempat)</td>
                      <td className="py-3 px-4">3-7 hari kerja</td>
                      <td className="py-3 px-4">Via transfer bank</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                * Waktu refund dihitung setelah klaim disetujui. Biaya transfer ditanggung oleh Lipink Parcel.
              </p>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 md:p-8 text-center text-white shadow-xl">
              <h2 className="text-xl md:text-2xl font-bold mb-3">Ada Pertanyaan?</h2>
              <p className="mb-6 text-pink-100">
                Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami.
              </p>
              <a 
                href="https://wa.me/6281222085080"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-pink-600 font-bold px-6 py-3 rounded-xl hover:bg-pink-50 transition-all shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Hubungi WhatsApp: 081-222-085-80
              </a>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
