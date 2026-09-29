'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  createdAt?: any;
}

// ─── 子导航 ───
const subNavItems = [
  { id: 'committee-news', label: '国专委要闻' },
  { id: 'member-news', label: '会员单位动态' },
  { id: 'media-focus', label: '媒体关注与报道' },
];

export default function NewsPage() {
  const [activeAnchor, setActiveAnchor] = useState('committee-news');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 全文阅读模态框状态 (绝无 alert)
  const [readingNews, setReadingNews] = useState<NewsItem | null>(null);

  // 监听并平滑滚动到指定锚点
  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // 滚动监听，自动高亮当前阅读的子栏目
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveAnchor(subNavItems[subNavItems.length - 1].id);
        return;
      }
      const scrollPosition = window.scrollY + 240;
      for (let i = subNavItems.length - 1; i >= 0; i--) {
        const item = subNavItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveAnchor(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 从 Firestore 实时读取真实 news 数据
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    // 4秒安全熔断，防止网络波动导致长时间处于加载状态
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    try {
      const q = query(collection(db, 'news'), orderBy('date', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timer);
          const list: NewsItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<NewsItem, 'id'>;
            return {
              id: docSnap.id,
              ...data,
              category: (
                data.category === '专委会动态' ? '国专委动态' : (data.category || '国专委动态')
              ).replace(/专委会/g, '国专委'),
            };
          });
          setNewsList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('News query error, fallback to basic onSnapshot:', err);
          unsubscribe = onSnapshot(
            collection(db, 'news'),
            (snapshot) => {
              clearTimeout(timer);
              const list: NewsItem[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data() as Omit<NewsItem, 'id'>;
                return {
                  id: docSnap.id,
                  ...data,
                  category: (
                    data.category === '专委会动态' ? '国专委动态' : (data.category || '国专委动态')
                  ).replace(/专委会/g, '国专委'),
                };
              });
              // 前端内存按 date 降序排列
              list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
              setNewsList(list);
              setLoading(false);
            },
            (fallbackErr) => {
              console.warn('News fallback error:', fallbackErr);
              clearTimeout(timer);
              setLoading(false);
            }
          );
        }
      );
    } catch (error) {
      console.error('Failed to setup Firestore news query:', error);
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 1. 国专委要闻（包含‘国专委要闻’、‘国专委动态’、‘专委会动态’、‘会议纪要’或默认未归类）
  const committeeNews = newsList.filter(
    (item) =>
      item.category === '国专委要闻' ||
      item.category === '国专委动态' ||
      item.category === '专委会动态' ||
      item.category === '会议纪要' ||
      (!item.category && item.category !== '会员单位动态' && item.category !== '媒体关注与报道')
  );
  // 2. 会员单位动态（包含‘会员单位动态’、‘行业热点’、‘成果转化’、‘国际合作’）
  const memberNews = newsList.filter(
    (item) =>
      item.category === '会员单位动态' ||
      item.category === '行业热点' ||
      item.category === '成果转化' ||
      item.category === '国际合作'
  );
  // 3. 媒体关注与报道（包含‘媒体关注与报道’、‘媒体关注’、‘媒体报道’）
  const mediaFocusNews = newsList.filter(
    (item) =>
      item.category === '媒体关注与报道' ||
      item.category === '媒体关注' ||
      item.category === '媒体报道'
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── 顶部 Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">新闻中心</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              新闻中心
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              直连官方数据库，实时发布国专委要闻、会员单位动态与重要产学研合作进展。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 子导航 ─── */}
      <div className="sticky top-[108px] lg:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-2.5">
            {subNavItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToAnchor(e, item.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                  activeAnchor === item.id
                    ? 'bg-blue-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* ════════════════════════════════
            1. 国专委要闻 (id: committee-news)
        ════════════════════════════════ */}
        <section
          id="committee-news"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国专委要闻</h2>
            </div>
            <span className="text-xs text-slate-500">
              实时数据源：Firestore · 共 {committeeNews.length} 篇
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">正在从数据库加载最新要闻...</p>
            </div>
          ) : committeeNews.length === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
              <p className="text-sm font-medium text-slate-600">暂无国专委要闻数据</p>
              <p className="text-xs text-slate-400">可在管理后台发布新闻并归类至【国专委要闻】。</p>
            </div>
          ) : (
            <div className="space-y-6">
              {committeeNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setReadingNews(item)}
                  className="flex flex-col md:flex-row gap-5 p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
                >
                  {/* 左侧权威发布标识 */}
                  <div className="md:w-48 md:shrink-0">
                    <div className="w-full h-28 md:h-full min-h-[90px] rounded-lg bg-gradient-to-br from-blue-900 via-blue-950 to-slate-800 flex flex-col items-center justify-center text-white text-center p-3 space-y-1">
                      <span className="text-2xl">📋</span>
                      <span className="text-[10px] leading-tight opacity-80">权威发布</span>
                    </div>
                  </div>
                  {/* 右侧文字内容 */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                        {item.category === '专委会动态' ? '国专委动态' : (item.category || '国专委要闻')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {item.summary || item.content?.slice(0, 120)}
                    </p>
                    <div className="pt-2 text-xs font-semibold text-blue-800 flex items-center space-x-1">
                      <span>查阅新闻全文</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════════════════════════════
            2. 会员单位动态 (id: member-news)
        ════════════════════════════════ */}
        <section
          id="member-news"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位动态</h2>
            </div>
            <span className="text-xs text-slate-500">
              展示会员单位在科技成果转化与跨国合作中的进展（{memberNews.length} 篇）
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">正在加载动态...</div>
          ) : memberNews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-1 text-xs">
              <p className="text-slate-500 font-medium">暂无分类为“会员单位动态”的新闻数据</p>
              <p className="text-[11px] text-slate-400">可在管理后台发布新闻时将所属频道选为【会员单位动态】。</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {memberNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setReadingNews(item)}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-3 group hover:bg-emerald-50/30 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="sm:w-36 shrink-0 space-y-1">
                    <div className="text-xs text-slate-400 font-mono">{item.date}</div>
                    <span className="inline-block text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.category || '会员单位动态'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.summary || item.content?.slice(0, 100)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════════════════════════════
            3. 媒体关注与报道 (id: media-focus)
        ════════════════════════════════ */}
        <section
          id="media-focus"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-purple-700 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">媒体关注与报道</h2>
            </div>
            <span className="text-xs text-slate-500">
              主流权威媒体对国专委及高校成果的专题报道（{mediaFocusNews.length} 篇）
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">正在加载媒体报道...</div>
          ) : mediaFocusNews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-1 text-xs">
              <p className="text-slate-500 font-medium">暂无分类为“媒体关注与报道”的新闻数据</p>
              <p className="text-[11px] text-slate-400">可在管理后台发布新闻时将所属频道选为【媒体关注与报道】。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaFocusNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setReadingNews(item)}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-purple-100 text-purple-900 border border-purple-200">
                        {item.category || '媒体关注与报道'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-900 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {item.summary || item.content?.slice(0, 100)}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-800">
                    <span>查阅媒体报道全文</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 媒体联络通道说明框 */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-2 text-slate-600 leading-relaxed">
            <p>
              国专委长期受到《科技日报》、《中国教育报》、新华网及光明日报等国家主流媒体的深度跟踪报道。新闻通稿发布及媒体采访预约，请通过秘书处对外宣传联络通道办理。
            </p>
            <div className="text-purple-900 font-semibold pt-0.5">
              媒体联络邮箱：media@cauiice.org.cn
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════
          新闻详情阅读模态框 (纯 Tailwind Modal，绝无 alert)
      ══════════════════════════════════ */}
      {readingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setReadingNews(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 模态框头部 */}
            <div className="space-y-2 border-b border-slate-100 pb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                  {readingNews.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">发布日期：{readingNews.date}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {readingNews.title}
              </h2>
            </div>

            {/* 正文内容 */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap space-y-4">
              {readingNews.content}
            </div>

            {/* 模态框尾部 */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>中国高校校办产业协会国际合作与交流专业委员会（国专委） 发布</span>
              <button
                type="button"
                onClick={() => setReadingNews(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                关闭阅读
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
