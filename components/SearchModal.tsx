'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchFullSite, SearchResultItem } from '@/lib/searchService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onNavigate?: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

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

const HOT_TAGS = [
  '申报通知',
  '团体标准',
  '科技成果转化',
  '一带一路',
  '入会指引',
  '智库白皮书',
  '办事指南',
  '信用承诺',
];

export default function SearchModal({
  isOpen,
  onClose,
  initialQuery = '',
  onNavigate,
}: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 打开时自动聚焦输入框并同步初始搜索词
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialQuery]);

  // 监听 ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 防抖检索
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchFullSite(query, selectedCategory);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  if (!isOpen) return null;

  // 提交并跳转到全页面检索
  const handleFullSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}&cat=${encodeURIComponent(selectedCategory)}`);
  };

  // 点击单条结果跳转
  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(e, href);
    }
  };

  // 关键词高亮
  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${keyword.trim()})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={i} className="text-blue-600 bg-blue-50 font-semibold px-0.5 rounded">
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-6">
      {/* 遮罩背景点击关闭 */}
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>

      {/* 弹窗主体 */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* 顶部搜索输入框 */}
        <form onSubmit={handleFullSearchSubmit} className="relative border-b border-slate-200 px-4 py-3.5 flex items-center bg-slate-50/50">
          <svg className="w-5 h-5 text-slate-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索政策、通知公告、智库报告、会员单位、标准..."
            className="w-full pl-3 pr-10 py-1 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 p-1 mr-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 bg-slate-200/70 hover:bg-slate-200 rounded font-mono select-none"
          >
            ESC
          </button>
        </form>

        {/* 分类快捷标签 */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 结果列表展示区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 未输入状态：热门检索推荐 */}
          {!query.trim() && (
            <div className="py-6 px-2 space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                热门检索推荐
              </div>
              <div className="flex flex-wrap gap-2">
                {HOT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 transition-colors font-medium cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 leading-relaxed">
                💡 支持跨频道全网检索：输入高校名称、政策文件名、标准编号（如 T/CAUI）、技术领域或项目关键词即可一键直达对应板块。
              </div>
            </div>
          )}

          {/* 搜索中指示器 */}
          {query.trim() && isSearching && (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>正在全网深度检索中...</span>
            </div>
          )}

          {/* 搜索结果列表 */}
          {query.trim() && !isSearching && results.length > 0 && (
            <>
              <div className="text-xs font-semibold text-slate-400 pb-1 flex items-center justify-between">
                <span>找到 {results.length} 条检索结果</span>
                <span className="text-[11px] text-blue-700">点击卡片直达板块</span>
              </div>
              <div className="space-y-2.5">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={(e) => handleItemClick(e, item.url)}
                    className="block p-3.5 rounded-xl border border-slate-150 hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      </div>
                      {item.date && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.date}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                      {highlightMatch(item.title, query)}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {highlightMatch(item.summary, query)}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* 无匹配结果 */}
          {query.trim() && !isSearching && results.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-slate-700">未找到与 &quot;{query}&quot; 相关的结果</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                建议缩短关键词或切换分类筛选，亦可查看下方的热门搜索推荐：
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {HOT_TAGS.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQuery(t)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部功能栏 */}
        {query.trim() && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              按 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">Enter</kbd> 查看全景检索页
            </span>
            <button
              type="button"
              onClick={() => handleFullSearchSubmit()}
              className="text-blue-800 hover:text-blue-900 font-semibold inline-flex items-center space-x-1"
            >
              <span>进入全栈搜索大厅</span>
              <span>&rarr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
