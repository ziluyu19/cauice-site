'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  views?: number;
  createdAt?: any;
}

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 表单模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

  // 删除确认模态框状态
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 表单输入项
  const [formData, setFormData] = useState({
    title: '',
    category: '国专委要闻',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    content: '',
  });
  const [channelFilter, setChannelFilter] = useState('全部');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 吐司提示展示
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅 Firestore news 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    // 4秒安全熔断，防止由于网络波动导致一直转圈
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timer);
          const list: NewsItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<NewsItem, 'id'>;
            return {
              id: docSnap.id,
              ...data,
              views: typeof data.views === 'number' ? data.views : 0,
              category: (
                data.category === '专委会动态' ? '国专委动态' : (data.category || '国专委动态')
              ).replace(/专委会/g, '国专委'),
            };
          });
          setNewsList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('News ordered query error, fallback to unordered snapshot:', err);
          unsubscribe = onSnapshot(
            collection(db, 'news'),
            (snapshot) => {
              clearTimeout(timer);
              const list: NewsItem[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data() as Omit<NewsItem, 'id'>;
                return {
                  id: docSnap.id,
                  ...data,
                  views: typeof data.views === 'number' ? data.views : 0,
                  category: (
                    data.category === '专委会动态' ? '国专委动态' : (data.category || '国专委动态')
                  ).replace(/专委会/g, '国专委'),
                };
              });
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
    } catch (e) {
      console.error('Failed to setup news listener:', e);
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 统计各核心频道新闻数量
  const committeeCount = newsList.filter(
    (i) => i.category === '国专委要闻' || i.category === '国专委动态' || i.category === '会议纪要' || !i.category
  ).length;
  const memberCount = newsList.filter(
    (i) => i.category === '会员单位动态' || i.category === '行业热点' || i.category === '成果转化' || i.category === '国际合作'
  ).length;
  const mediaCount = newsList.filter(
    (i) => i.category === '媒体关注与报道' || i.category === '媒体关注' || i.category === '媒体报道'
  ).length;

  // 根据当前选中的频道筛选新闻列表
  const filteredNews = newsList.filter((item) => {
    if (channelFilter === '全部') return true;
    if (channelFilter === '国专委要闻') {
      return item.category === '国专委要闻' || item.category === '国专委动态' || item.category === '会议纪要' || !item.category;
    }
    if (channelFilter === '会员单位动态') {
      return item.category === '会员单位动态' || item.category === '行业热点' || item.category === '成果转化' || item.category === '国际合作';
    }
    if (channelFilter === '媒体关注与报道') {
      return item.category === '媒体关注与报道' || item.category === '媒体关注' || item.category === '媒体报道';
    }
    return item.category === channelFilter;
  });

  // 获取分类徽章样式
  const getCategoryBadge = (category: string) => {
    const cat = category === '专委会动态' ? '国专委动态' : (category || '国专委要闻');
    if (cat === '国专委要闻' || cat === '国专委动态' || cat === '会议纪要') {
      return {
        label: cat,
        className: 'bg-blue-100 text-blue-900 border-blue-200',
      };
    }
    if (cat === '会员单位动态' || cat === '行业热点' || cat === '成果转化' || cat === '国际合作') {
      return {
        label: cat,
        className: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      };
    }
    if (cat === '媒体关注与报道' || cat === '媒体关注' || cat === '媒体报道') {
      return {
        label: cat,
        className: 'bg-purple-100 text-purple-900 border-purple-200',
      };
    }
    return {
      label: cat,
      className: 'bg-slate-100 text-slate-800 border-slate-200',
    };
  };

  // 打开新建弹窗
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: channelFilter !== '全部' ? channelFilter : '国专委要闻',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category === '专委会动态' ? '国专委动态' : (item.category || '国专委要闻'),
      date: item.date || new Date().toISOString().split('T')[0],
      summary: item.summary || '',
      content: item.content || '',
    });
    setIsModalOpen(true);
  };

  // 提交表单（新建或更新）
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('请完整填写新闻标题与正文内容', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const autoSummary = formData.summary.trim() || formData.content.trim().slice(0, 100);

      if (editingItem) {
        // 更新现有文档
        const docRef = doc(db, 'news', editingItem.id);
        await updateDoc(docRef, {
          title: formData.title.trim(),
          category: formData.category,
          date: formData.date,
          summary: autoSummary,
          content: formData.content.trim(),
          updatedAt: serverTimestamp(),
        });
        showToast('新闻已成功更新！');
      } else {
        // 创建新文档
        await addDoc(collection(db, 'news'), {
          title: formData.title.trim(),
          category: formData.category,
          date: formData.date,
          summary: autoSummary,
          content: formData.content.trim(),
          views: 0,
          createdAt: serverTimestamp(),
        });
        showToast('新闻发布成功！已存入数据库。');
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Submit news error:', error);
      showToast(error?.message || '操作失败，请检查网络或安全规则', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 确认删除文档
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'news', deleteTarget.id));
      showToast(`已成功删除新闻《${deleteTarget.title}》`);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Delete news error:', error);
      showToast(error?.message || '删除失败，请稍后重试', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 吐司提示条 */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold text-white border transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 border-emerald-400'
              : 'bg-red-900 border-red-400'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 页面标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">新闻动态管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            实时对 Firestore 数据库中的 news 集合进行发布、更新与删除操作
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>+</span>
          <span>发布新闻</span>
        </button>
      </div>

      {/* 指标小卡片：展示三大核心频道及总数 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setChannelFilter('全部')}
          className={`p-4 rounded-xl bg-white border transition-all cursor-pointer shadow-xs ${
            channelFilter === '全部'
              ? 'border-blue-600 ring-2 ring-blue-600/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">全部新闻动态</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
            {newsList.length} <span className="text-xs font-normal text-slate-400">篇</span>
          </div>
        </div>
        <div
          onClick={() => setChannelFilter('国专委要闻')}
          className={`p-4 rounded-xl bg-white border transition-all cursor-pointer shadow-xs ${
            channelFilter === '国专委要闻'
              ? 'border-blue-600 ring-2 ring-blue-600/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-blue-700 font-medium flex items-center justify-between">
            <span>国专委要闻</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
          <div className="text-2xl font-bold text-blue-950 mt-1 font-serif">
            {committeeCount} <span className="text-xs font-normal text-slate-400">篇</span>
          </div>
        </div>
        <div
          onClick={() => setChannelFilter('会员单位动态')}
          className={`p-4 rounded-xl bg-white border transition-all cursor-pointer shadow-xs ${
            channelFilter === '会员单位动态'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-emerald-700 font-medium flex items-center justify-between">
            <span>会员单位动态</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-2xl font-bold text-emerald-950 mt-1 font-serif">
            {memberCount} <span className="text-xs font-normal text-slate-400">篇</span>
          </div>
        </div>
        <div
          onClick={() => setChannelFilter('媒体关注与报道')}
          className={`p-4 rounded-xl bg-white border transition-all cursor-pointer shadow-xs ${
            channelFilter === '媒体关注与报道'
              ? 'border-purple-600 ring-2 ring-purple-600/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs text-purple-700 font-medium flex items-center justify-between">
            <span>媒体关注与报道</span>
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          </div>
          <div className="text-2xl font-bold text-purple-950 mt-1 font-serif">
            {mediaCount} <span className="text-xs font-normal text-slate-400">篇</span>
          </div>
        </div>
      </div>

      {/* 数据列表卡片 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">新闻列表与操作</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              前台新闻中心的三个核心频道数据均在此统一管理与发布
            </p>
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {['全部', '国专委要闻', '会员单位动态', '媒体关注与报道'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setChannelFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  channelFilter === tab
                    ? 'bg-blue-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === '全部' && ` (${newsList.length})`}
                {tab === '国专委要闻' && ` (${committeeCount})`}
                {tab === '会员单位动态' && ` (${memberCount})`}
                {tab === '媒体关注与报道' && ` (${mediaCount})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>正在从 Firestore 同步新闻数据...</div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-xl text-xs">
            <p className="text-slate-600 font-medium">
              {channelFilter === '全部'
                ? '当前 news 集合中暂无任何新闻记录'
                : `当前【${channelFilter}】分类下暂无新闻数据`}
            </p>
            <p className="text-[11px] text-slate-400">点击右上角“+ 发布新闻”开始添加。</p>
          </div>
        ) : (
          <>
            {/* 移动端响应式卡片流 (md:hidden) */}
            <div className="md:hidden space-y-3">
              {filteredNews.map((item) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded font-semibold text-[11px] border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                        <span>{item.date}</span>
                        <span>· 阅读: {item.views ?? 0}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug text-sm">{item.title}</h4>
                      <p className="text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.summary || item.content?.slice(0, 80)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        ID: {item.id}
                      </span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 桌面端/平板表格视图 (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left min-w-[650px]">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">分类标签</th>
                    <th className="px-4 py-3 font-semibold min-w-[240px]">新闻标题</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">日期</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">阅读量</th>
                    <th className="px-4 py-3 font-semibold min-w-[220px]">摘要简介</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">管理操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNews.map((item, idx) => {
                    const badge = getCategoryBadge(item.category);
                    return (
                      <tr
                        key={item.id}
                        className={`align-top hover:bg-blue-50/40 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded font-semibold text-[11px] border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-mono whitespace-nowrap font-medium">
                          {item.views ?? 0}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 leading-relaxed line-clamp-2">
                          {item.summary || item.content?.slice(0, 80)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════
          新增/编辑 真实模态框 (Tailwind Modal)
      ══════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 弹窗头部 */}
            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingItem ? '编辑新闻动态' : '发布新闻'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                数据将直接存入 Firestore 数据库的 news 集合
              </p>
            </div>

            {/* 表单内容 */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">新闻标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="请输入新闻完整主标题"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">所属频道分类 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <optgroup label="新闻中心">
                      <option value="国专委要闻">国专委要闻</option>
                      <option value="会员单位动态">会员单位动态</option>
                      <option value="媒体关注与报道">媒体关注与报道</option>
                    </optgroup>
                    <optgroup label="细分/兼容分类标签">
                      <option value="国专委动态">国专委动态</option>
                      <option value="行业热点">行业热点</option>
                      <option value="会议纪要">会议纪要</option>
                      <option value="成果转化">成果转化</option>
                      <option value="国际合作">国际合作</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">发布日期 *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    摘要简介（选填，未填将自动截取正文首段）
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="一句话提炼核心亮点..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">新闻正文内容 *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="请输入完整新闻正文报道内容..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 leading-relaxed"
                ></textarea>
              </div>

              {/* 弹窗底部操作 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-2"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingItem ? '保存修改' : '确认发布'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          删除二次确认模态框 (Tailwind Modal，彻底消灭 window.confirm)
      ══════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认删除新闻？</h3>
                <p className="text-xs text-slate-500">此操作将从 Firestore 数据库永久移除该数据</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800 line-clamp-2">
                《{deleteTarget.title}》
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                发布日期：{deleteTarget.date} · 分类：{deleteTarget.category}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-1.5"
              >
                {isDeleting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
