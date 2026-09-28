'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  issuer: string;
  date: string;
  status: string;
  summary: string;
  content: string;
  deadline?: string;
  createdAt?: any;
}

export default function NoticePage() {
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选与搜索状态
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  // 模态框详情阅读状态 (纯 Tailwind Modal，绝无 alert)
  const [readingNotice, setReadingNotice] = useState<NoticeItem | null>(null);

  // 分类选项
  const categoryOptions = [
    '全部',
    '对外发文',
    '项目申报',
    '活动报名',
    '信息公示',
    '政策法规',
    '申报指南',
  ];

  // 从 Firestore 实时订阅 notices 集合数据
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: NoticeItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<NoticeItem, 'id'>),
          }));
          setNoticesList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Notices query error, fallback to unordered snapshot:', err);
          unsubscribe = onSnapshot(collection(db, 'notices'), (snapshot) => {
            const list: NoticeItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<NoticeItem, 'id'>),
            }));
            list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            setNoticesList(list);
            setLoading(false);
          });
        }
      );
    } catch (error) {
      console.error('Failed to setup Firestore notices listener:', error);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 过滤后的通知列表
  const filteredNotices = noticesList.filter((item) => {
    const matchCategory =
      selectedCategory === '全部' || item.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.issuer && item.issuer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── 顶部 Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">通知公告</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              通知公告与政策频道
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              集中发布中国高校校办产业协会国际合作与交流专业委员会对外通告、信息公示、涉外成果转化政策与重大申报指南。
            </p>
          </div>

          {/* 实时统计指标卡 */}
          <div className="mt-6 pt-6 border-t border-blue-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">当前已公示条目</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">
                {noticesList.length} <span className="text-xs font-normal text-slate-400">条</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">申报期进行中</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">
                {noticesList.filter((n) => n.status === '进行中').length} <span className="text-xs font-normal text-slate-400">项</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">数据对接管道</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">Firestore 直连</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">公示更新机制</div>
              <div className="text-sm font-bold text-blue-200 mt-1">实时推送生效</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 吸顶筛选与搜索条 ─── */}
      <div className="sticky top-[108px] lg:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-3">
            {/* 分类筛选横滑列表 */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 搜索框 */}
            <div className="relative shrink-0 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题、发文部门或关键字..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 主体列表 ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-5 bg-blue-800 rounded-full" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              权威通告列表
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            共找到 {filteredNotices.length} 条记录
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">正在从 Firestore 数据库读取最新通知公告...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2 bg-white">
            <p className="text-sm font-medium text-slate-600">未检索到符合条件的通知公告</p>
            <p className="text-xs text-slate-400">请尝试切换分类或调整搜索关键字，或在管理后台发布新通知。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((item) => (
              <div
                key={item.id}
                onClick={() => setReadingNotice(item)}
                className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                      {item.category || '对外发文'}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        item.status === '进行中'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.status === '公示中'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                    {item.deadline && (
                      <span className="text-amber-700 font-semibold font-sans">
                        截止：{item.deadline}
                      </span>
                    )}
                    <span>发布日期：{item.date}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {item.summary || item.content?.slice(0, 120)}
                </p>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                  <span>发文署名：{item.issuer}</span>
                  <span className="font-semibold text-blue-800 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>阅读详细通告及附件说明</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══════════════════════════════════
          通知公告详情模态框 (纯 Tailwind Modal，绝无 alert)
      ══════════════════════════════════ */}
      {readingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setReadingNotice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 模态框头部 */}
            <div className="space-y-3 border-b border-slate-100 pb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                  {readingNotice.category}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                  状态：{readingNotice.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  发布日期：{readingNotice.date}
                </span>
                {readingNotice.deadline && (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    办理截止：{readingNotice.deadline}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {readingNotice.title}
              </h2>
              <div className="text-xs text-slate-500 font-medium">
                发文机构：{readingNotice.issuer}
              </div>
            </div>

            {/* 详细通知内容 */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap space-y-4">
              {readingNotice.content}
            </div>

            {/* 模态框尾部 */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
              <span>中国高校校办产业协会国际合作与交流专业委员会（国专委） 权威发布</span>
              <button
                type="button"
                onClick={() => setReadingNotice(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer self-end sm:self-auto"
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
