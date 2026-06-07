"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [upcomingEvents,setUpcomingEvents] = useState([]);
  const [newsData, setNewsData] = useState([]);
  // loading 
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // headline 
  const [headline, setHeadline] = useState([]);
  const [expandedEventHead, setExpandedEventHead] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);  
  const [username, setUsername] = useState("")

  // username
  const [usernameNews, setUsernameNews] = useState("")
  const [usernameEvent, setUsernameEvent] = useState("")
  
  // Taruh di dalam komponen, sejajar dengan state lainnya:
  const sliderRef = useRef(null);
  const [curIdx, setCurIdx] = useState(0);
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    const updateVisible = () => {
      setVisible(window.innerWidth < 1024 ? 1 : 2);
    };

    updateVisible();
    window.addEventListener("resize", updateVisible);

    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const maxIdx = Math.max(0, headline.length - visible);


  const slideTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, maxIdx));
    setCurIdx(clamped);
    const firstItem = sliderRef.current?.children[0];
    if (!firstItem) return;
    const itemW = firstItem.getBoundingClientRect().width + 12;
    sliderRef.current.style.transform = `translateX(-${clamped * itemW}px)`;
  };

  function NewsSkeleton() {
    return (
      <div className="animate-pulse rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-56 bg-gray-200"></div>

        <div className="p-8 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>

          <div className="pt-6 border-t">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  function EventSkeleton() {
    return (
      <div className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 bg-gray-200"></div>

        <div className="flex-1 p-8 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="h-7 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const fetchNews = async () => {
    try {
      setLoadingNews(true);

      const res = await fetch("/api/user/news");
      const result = await res.json();

      setNewsData(result.data || []);
      setUsernameNews(result.username)
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchHeadline = async () => {
    try {
      // setLoadingNews(true);

      const res = await fetch("/api/user/headline");
      const result = await res.json();
      
      setHeadline(result.data || []);
      setUsername(result.username)
    } catch (err) {
      console.log(err);
    } finally {
      // setLoadingNews(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);

      const res = await fetch("/api/user/event");
      const result = await res.json();

      setUpcomingEvents(result.data || []);
      setUsernameEvent(result.username)
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchHeadline();
    fetchNews();
    fetchEvents();    
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Improved Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-multiply filter animate-blob"></div>
          <div className="absolute top-0 -right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center z-10">
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-800/50 border border-blue-500/30 text-blue-200 text-sm font-semibold tracking-wide backdrop-blur-sm">
              ✨ Portal Himpunan Mahasiswa
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Wadah Informasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">
                Himpunan Mahasiswa
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Temukan informasi terbaru, kegiatan, dan berita himpunan mahasiswa di sini.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/kegiatan"
                className="px-8 py-4 rounded-xl text-blue-900 bg-white hover:bg-gray-100 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Jelajahi Kegiatan
              </Link>
              <Link
                href="/berita"
                className="px-8 py-4 rounded-xl text-white bg-white/10 border border-white/20 hover:bg-white/20 font-bold text-lg backdrop-blur-md transition-all"
              >
                Baca Berita
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
            {/* Feature Image */}
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/hero-image.png"
                  alt="Kolaborasi Mahasiswa"
                  width={600}
                  height={600}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {headline.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            {/* Label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Headline</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Track */}
            <div className="overflow-hidden">
              <div
                ref={sliderRef}
                className="flex transition-transform duration-300 ease-in-out items-stretch"
                style={{ willChange: "transform" }}
              >
                {headline.map((item) => {
                  const img = item.type === "event"
                    ? `/uploads/event/${item.username ?? username}/${item.flayer}`
                    : `/uploads/news/${item.username ?? username}/${item.thumbnail}`;
                  const hasImage = !!(item.flayer || item.thumbnail);
                  const isLongDescription = (item.deskripsi || "").length > 180;

                  return (
                    <div
                      key={item.slug}
                      className="flex-none w-full lg:w-[calc(50%-6px)] mr-3 rounded-2xl overflow-hidden flex flex-col"
                    >
                      {/* Gambar atas */}
                      <div className="relative aspect-video flex-shrink-0 overflow-hidden">
                        {hasImage ? (
                          <Image src={img} alt={item.judul} fill className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <span className="text-gray-400 text-9xl">🖼️</span>
                          </div>
                        )}
                      </div>

                      {/* Body bawah */}
                      <div className="flex-1 p-4 flex flex-col gap-2 bg-white border border-t-0 border-gray-100 rounded-b-2xl">
                        <span className={`self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          item.type === "event" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                        }`}>
                          {item.type === "event" ? "Kegiatan" : "Berita"}
                        </span>

                        {item.type === "news" ? (
                          <>
                              <Link href={`/berita/${item.slug}`}>
                                <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 leading-snug">
                                  {item.judul}
                                </p>
                              </Link>
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                                  {item.deskripsi}
                                </p>
                          </>
                          
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                              {item.judul}
                            </p>
                            <p className={`text-xs text-gray-500 leading-relaxed ${expandedEventHead === item.slug ? "" : "line-clamp-4"}`}>
                              {item.deskripsi}
                            </p>
                            {isLongDescription &&(
                                  <button
                                    onClick={() => setExpandedEventHead(expandedEventHead === item.slug ? null : item.slug)}
                                    className="self-start text-xs font-semibold text-blue-600"
                                  >
                                    {expandedEventHead === item.slug ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                                  </button>
                            )}
                          </>
                          
                        )}

                        

                        <div className="mt-auto pt-2.5 border-t border-gray-50 flex flex-col gap-1 text-xs text-gray-400">
                          {item.type === "event" && (
                            <>
                              <span>📅 {new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                              <span>⏰ {item.waktu}</span>
                              <span>📍 {item.tempat}</span>
                              {item.link && (
                                <Link
                                  href={item.link}
                                  className="mt-1.5 self-start px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-colors"
                                >
                                  Daftar Sekarang
                                </Link>
                              )}
                            </>
                          )}
                          {item.type === "news" && (
                            <span>
                              {new Date(item.updated_at ?? item.created_at).toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", year: "numeric"
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigasi */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5 items-center">
                {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => slideTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      curIdx === i ? "w-5 bg-gray-800" : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => slideTo(curIdx - 1)}
                  disabled={curIdx === 0}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >‹</button>
                <button
                  onClick={() => slideTo(curIdx + 1)}
                  disabled={curIdx >= maxIdx}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >›</button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Featured News Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Berita Terkini
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Update terbaru dari himpunan.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {loadingNews
              ? Array.from({ length: 3 }).map((_, i) => (
                  <NewsSkeleton key={i} />
                )):
                newsData.slice(0, 3).map((item) => (
                  <div
                    key={item.slug}
                    className="group flex flex-col rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden relative bg-gray-100 flex items-center justify-center">
                      {item.username ?
                        <img
                          src={`/uploads/news/${item.username}/${item.thumbnail}`}
                          alt={item.judul}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        /> : 
                        <img
                          src={`/uploads/news/${usernameNews}/${item.thumbnail}`}
                          alt={item.judul}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />}
                      
                    </div>
                    <div className="flex-1 bg-white p-8 flex flex-col justify-between">
                      <div className="flex-1">
                        <Link href={`/berita/${item.slug}`} className="block mt-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.judul}
                          </h3>
                          <p className="mt-4 text-base text-gray-500 leading-relaxed line-clamp-3 ">
                            {item.deskripsi}
                          </p>
                        </Link>
                      </div>
                      <div className="mt-8 flex items-center border-t border-gray-100 pt-6">
                        <div className="ml-3">
                          {/* <p className="text-sm font-medium text-gray-900">
                            oleh {item.nama}
                          </p> */}
                          <div className="flex space-x-1 text-sm text-gray-500">
                            {
                              item.updated_at
                                ? `Updated : ${new Date(item.updated_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })}`
                                : new Date(item.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
          <div className="mt-12 text-center">
            <Link href={`/berita`} className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Selengkapnya
            </Link>
          </div>

        </div>
      </section>

      {/* Upcoming Activities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Kegiatan Mendatang
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Jangan lewatkan event-event seru yang akan datang.
            </p>
          </div>
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {loadingEvents
              ? Array.from({ length: 3 }).map((_, i) => (
                  <EventSkeleton key={i} />
                )):
                upcomingEvents.slice(0, 3).map((event) => {
                  const isLongDescription = (event.deskripsi || "").length > 180;
                  return(
                    <div key={event.slug} className="bg-white border border-gray-100  rounded-2xl border-gray-300 overflow-hidden flex flex-col lg:flex-row gap-0 hover:shadow-xl transition-all duration-300 group">
                            <div className="w-full lg:w-72 h-60 md:h-72 lg:h-auto relative overflow-hidden flex-shrink-0">
                                {event.flayer ? 
                                      event.username ? 
                                        <Image
                                          src={`/uploads/event/${event.username}/${event.flayer}`}
                                          alt={event.judul}
                                          fill
                                          className="object-contain group-hover:scale-105 transition-transform duration-500"                                    
                                        /> :
                                        <Image
                                          src={`/uploads/event/${usernameEvent}/${event.flayer}`}
                                          alt={event.judul}
                                          fill
                                          className="object-contain group-hover:scale-105 transition-transform duration-500"                                    
                                        />
                                    :
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <span className="text-gray-400 text-9xl">🖼️</span>
                                    </div>
                                }
                                
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1.5 rounded-xl text-center shadow-sm border border-blue-100/50">
                                    <span className="block text-xl font-bold leading-none">
                                        {new Date(event.tanggal).toLocaleDateString("id-ID", { day: "numeric" })}
                                    </span>

                                    <span className="text-sm capitalize">
                                        {new Date(event.tanggal).toLocaleDateString("id-ID", {
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex flex-col">
                                {event.kategori && 
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">{event.kategori}</span>
                                    </div>
                                }                                
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{event.judul}</h3>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-auto pt-6 border-t border-gray-50">
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">⏰</span>
                                        {event.waktu}
                                    </span>
                                    {event.tempat &&
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">📍</span>
                                            {event.tempat}
                                        </span>
                                    }
                                    {event.kouta && 
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">👥</span>
                                            <span className={"text-green-600 font-semibold"}>
                                                {event.kouta}
                                            </span>
                                            <span className="text-gray-400">Peserta</span>
                                        </span>
                                    }                                    
                                </div>
                                <p className={`text-gray-600 mb-6 leading-relaxed flex-grow ${expandedEvent === event.slug ? "" : "line-clamp-4"}`}>
                                    {event.deskripsi}
                                </p>
                                
                                {isLongDescription &&(
                                  <button
                                    onClick={() => setExpandedEventHead(expandedEvent === event.slug ? null : event.slug)}
                                    className="self-start text-xs font-semibold text-blue-600"
                                  >
                                    {expandedEvent === event.slug ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                                  </button>
                                )}
                            </div>
                            {event.link &&
                                <div className="p-8 flex items-center bg-gray-50/50 border-l border-gray-100 shrink-0">
                                    <Link
                                    href={`${event.link}`}
                                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                                    >
                                    Daftar
                                    </Link>
                                </div>
                            }       
                    </div>
                  )
                })
            }
            <Link href={`/kegiatan`} className="w-50 md:w-50 mx-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-700 hover:bg-blue-800 transition-colors">
              Selengkapnya</Link>
          </div>
        </div>
      </section>
    </div>
  );
}


{/* ================= HEADLINE ================= */}
      // {headline.length > 0 && (() => {
      //     const main = headline[0];
      //     const isLongDescription = (main.deskripsi || "").length > 180;
      //     const mainImg =
      //       main.type === "event"
      //         ? (main.username
      //             ? `/uploads/event/${main.username}/${main.flayer}`
      //             : `/uploads/event/${username}/${main.flayer}`)
      //         : (main.username
      //             ? `/uploads/news/${main.username}/${main.thumbnail}`
      //             : `/uploads/news/${username}/${main.thumbnail}`);

      //     return (
      //       <section className="py-16 bg-gray-50">
      //         <div className="max-w-4xl mx-auto px-4 sm:px-6">

      //           {/* Label */}
      //           <div className="flex items-center gap-3 mb-5">
      //             <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Headline</span>
      //             <div className="flex-1 h-px bg-gray-200" />
      //           </div>

      //           {/* Main Card */}
      //           <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden grid md:grid-cols-2 mb-5">
      //             {/* Image */}
      //             <div className="relative min-h-64 bg-gray-50 flex items-center justify-center">
      //               {(main.flayer || main.thumbnail) ? (
      //                 <Image
      //                   src={mainImg}
      //                   alt={main.judul}
      //                   fill
      //                   className="object-contain group-hover:scale-105 transition-transform duration-500"                                    
      //                 />                       
      //               ) : (
      //                 <span className="text-5xl">🖼️</span>
      //               )}
      //             </div>

      //             {/* Content */}
      //             <div className="p-8 flex flex-col justify-center gap-3">
      //               <span className={`self-start text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
      //                 main.type === "event"
      //                   ? "bg-blue-50 text-blue-700"
      //                   : "bg-red-50 text-red-700"
      //               }`}>
      //                 {main.type === "event" ? "Kegiatan" : "Berita"}
      //               </span>
      //               {main.type === "news" ? 
      //                   <Link href={`/berita/${main.slug}`} className="block mt-3">
      //                       <h2 className="text-xl font-bold text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2">
      //                         {main.judul}
      //                       </h2>

      //                       <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">
      //                         {main.deskripsi}
      //                       </p> 
      //                   </Link>
      //               :
      //               <div>
      //                   <h2 className="text-xl font-bold text-gray-900 leading-snug">
      //                     {main.judul}
      //                   </h2>

      //                   <p className={`text-sm text-gray-500 leading-relaxed ${expanded === main.slug ? "" : "line-clamp-4"}`}>
      //                     {main.deskripsi}
      //                   </p> 
      //               </div>
      //               }
                    
      //               {isLongDescription && main.type === "event" && (
      //                 <button
      //                   onClick={() => setExpanded(expanded === main.slug ? null : main.slug)}
      //                   className="self-start text-xs font-semibold text-blue-600"
      //                 >
      //                   {expanded === main.slug ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
      //                 </button>
      //               )}

      //               {main.type === "event" && (
      //                 <>
      //                   <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1">
      //                     <span>📅 {new Date(main.tanggal).toLocaleDateString("id-ID")}</span>
      //                     <span>⏰ {main.waktu}</span>
      //                     <span>📍 {main.tempat}</span>
      //                   </div>
      //                   {main.link && (
      //                     <Link
      //                       href={main.link}
      //                       className="self-start mt-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      //                     >
      //                       Daftar Sekarang
      //                     </Link>
      //                   )}
      //                 </>
      //               )}
      //             </div>
      //           </div>

      //           {/* Sub Cards */}
      //           {headline.length > 1 && (
      //             <div className="grid md:grid-cols-3 gap-4">
      //               {headline.map((item) => {
      //                 const itemImg = item.type === "event"
      //                   ? (item.username
      //                       ? `/uploads/event/${item.username}/${item.flayer}`
      //                       : `/uploads/event/${username}/${item.flayer}`)
      //                   : (item.username
      //                       ? `/uploads/news/${item.username}/${item.thumbnail}`
      //                       : `/uploads/news/${username}/${item.thumbnail}`);
                            
      //                   const isLongDescription = (item.deskripsi || "").length > 180;

      //                 return (
      //                   <div key={item.slug} className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col hover:border-gray-200 transition-colors">
      //                     <div className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden relative flex-shrink-0">
      //                       {(item.flayer || item.thumbnail) ? (
      //                         <Image
      //                                   src={itemImg}
      //                                   alt={item.judul}
      //                                   fill
      //                                   className="object-contain group-hover:scale-105 transition-transform duration-500"                                    
      //                               /> 
      //                       ) : (
      //                         <span className="text-3xl">🖼️</span>
      //                       )}
      //                     </div>

      //                     <div className="p-4 flex flex-col gap-2 flex-1">
      //                       <span className={`self-start text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
      //                         item.type === "event"
      //                           ? "bg-blue-50 text-blue-700"
      //                           : "bg-red-50 text-red-700"
      //                       }`}>
      //                         {item.type === "event" ? "Kegiatan" : "Berita"}
      //                       </span>
      //                       {item.type === "news" ?
      //                       <Link href={`/berita/${item.slug}`} className="block mt-3">
      //                         <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
      //                           {item.judul}
      //                         </p>

      //                         <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
      //                           {item.deskripsi}
      //                         </p>
      //                       </Link>
      //                       : <div>
      //                           <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
      //                             {item.judul}
      //                           </p>

      //                           <p className={`text-xs text-gray-500 leading-relaxed ${expandedSub === item.slug ? "" : "line-clamp-4"}`}>
      //                             {item.deskripsi}
      //                           </p>
      //                         </div>
      //                       }

      //                       {isLongDescription && item.type === "event" &&(
      //                         <button
      //                           onClick={() => setExpandedSub(expandedSub === item.slug ? null : item.slug)}
      //                           className="self-start text-xs font-semibold text-blue-600"
      //                         >
      //                           {expandedSub === item.slug ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
      //                         </button>
      //                       )}

      //                       <div className="mt-auto pt-3 border-t border-gray-50 text-xs text-gray-400">
      //                         {item.type === "event" &&
      //                             <>
      //                               <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1 mb-5">
      //                                 <span>📅 {new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
      //                                 <span>⏰ {item.waktu}</span>
      //                                 <span>📍 {item.tempat}</span>
      //                               </div>
      //                               {item.link && (
      //                                 <Link
      //                                   href={item.link}
      //                                   className="self-start mt-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      //                                 >
      //                                   Daftar Sekarang
      //                                 </Link>
      //                               )}
      //                             </>                             
      //                         }
      //                         {item.type === "news" && 
      //                             <>
      //                               <p className="text-sm text-gray-500">
      //                                   {
      //                                     item.updated_at
      //                                       ? `Updated : ${new Date(item.updated_at).toLocaleDateString("id-ID", {
      //                                         day: "numeric",
      //                                         month: "long",
      //                                         year: "numeric"
      //                                       })}`
      //                                       : new Date(item.created_at).toLocaleDateString("id-ID", {
      //                                         day: "numeric",
      //                                         month: "long",
      //                                         year: "numeric"
      //                                       })
      //                                   }
      //                               </p>                                  
      //                             </>
      //                         }
      //                       </div>
      //                     </div>
      //                   </div>
      //                 );
      //               })}
      //             </div>
      //           )}
      //         </div>
      //       </section>
      //     );
      //   })()
      // }