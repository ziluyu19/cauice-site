'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchFullSite, SearchResultItem } from '@/lib/searchService';

const CATEGORIES = [
  '全部',
  '通知公告',
  '新闻中心',
  '成果与智库',
  '国际合作',
  '会员单位与服务',
  '信息公开',
  '国专委概况',
];

const HOT_RECOMMENDATIONS = [
  '卓越成果征集',
  '团体标准',
  '一带一路',
  '入会申请',
  '大学科技园',
  '专家库',
  '深化科技体制改革',
  '技术经纪人',
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('cat') || '全部';

  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 同步 URL 参数
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('cat') || '全部';
    setInputVal(q);
    setActiveQuery(q);
    setActiveCategory(cat);
  }, [searchParams]);

  // 执行搜索
  useEffect(() => {
    if (!activeQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchFullSite(activeQuery, activeCategory)
      .then((res) => {
        setResults(res);
      })
      .catch((err) => {
        console.error('Search page error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeQuery, activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setActiveQuery(inputVal.trim());
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&cat=${encodeURIComponent(activeCategory)}`);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    router.push(`/search?q=${encodeURIComponent(activeQuery)}&cat=${encodeURIComponent(cat)}`);
  };

  // 关键词高亮
  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${keyword.trim()})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={i} className="text-blue-700 bg-amber-100/70 font-semibold px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 顶部搜索横幅 */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white py-12 px-4 sm:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 面包屑 */}
          <div className="flex items-center space-x-2 text-xs text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>/</span>
            <span className="text-white font-medium">全栈全网搜索</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              国专委全栈智能检索大厅
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-2xl">
              深度检索涵盖全网8大频道：通知公告、要闻动态、成果转化、智库报告、团体标准、国际合作与会员名录。
            </p>
          </div>

          {/* 搜索大输入框 */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
            <div className="flex items-center bg-white rounded-full shadow-lg p-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-600">
              <svg className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="请输入政策文件、公告通知、智库报告、标准号或高校名称..."
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="text-slate-400 hover:text-slate-600 p-1.5 mr-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-blue-800 hover:bg-blue-900 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                搜索全站
              </button>
            </div>
          </form>

          {/* 推荐热词 */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200">
            <span className="text-blue-300 font-medium">推荐热搜：</span>
            {HOT_RECOMMENDATIONS.map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => {
                  setInputVal(rec);
                  setActiveQuery(rec);
                  router.push(`/search?q=${encodeURIComponent(rec)}&cat=${encodeURIComponent(activeCategory)}`);
                }}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {rec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 主体结果区 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 w-full flex-1">
        {/* 频道类别筛选 Tab */}
        <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs mb-6 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 检索状态与结果数量统计 */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            {activeQuery.trim() ? (
              <span>
                关于 &ldquo;<strong className="text-slate-800 font-semibold">{activeQuery}</strong>&rdquo;
                在【{activeCategory}】分类下共找到 <strong className="text-blue-800 font-bold">{results.length}</strong> 条匹配结果
              </span>
            ) : (
              <span>请输入关键词开启全网检索</span>
            )}
          </div>
          {results.length > 0 && (
            <span className="hidden sm:inline text-slate-400">按相关度综合排序</span>
          )}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-500">正在全网知识库中检索匹配内容...</div>
          </div>
        )}

        {/* 结果列表 */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                  {item.date && (
                    <span className="text-xs text-slate-400 font-mono">
                      {item.date}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                  <Link href={item.url} className="hover:underline">
                    {highlightMatch(item.title, activeQuery)}
                  </Link>
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {highlightMatch(item.summary, activeQuery)}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    来源：国专委官方门户 · {item.category}
                  </span>
                  <Link
                    href={item.url}
                    className="font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center space-x-1"
                  >
                    <span>直达相关内容板块</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空结果展示 */}
        {!loading && activeQuery.trim() && results.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                抱歉，未找到与 &ldquo;{activeQuery}&rdquo; 相关的内容
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                可能该词暂无对应收录，建议检查是否有错别字，或尝试以下更通用的搜索建议：
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {HOT_RECOMMENDATIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setInputVal(tag);
                    setActiveQuery(tag);
                    router.push(`/search?q=${encodeURIComponent(tag)}&cat=全部`);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 未输入任何词的初始提示 */}
        {!loading && !activeQuery.trim() && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">开始探索中国高校校办产业全网资源</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              在上方搜索栏输入任意关心的主题，如“科技成果转化”、“立项公示”、“国际合作”、“团体标准”等。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
          正在加载检索大厅...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
