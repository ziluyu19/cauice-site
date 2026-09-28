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

export default function AdminNoticesPage() {
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 表单模态框
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);

  // 删除二次确认模态框
  const [deleteTarget, setDeleteTarget] = useState<NoticeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    category: '对外发文',
    issuer: '中国高校校办产业协会国际合作与交流专业委员会秘书处',
    date: new Date().toISOString().split('T')[0],
    status: '进行中',
    summary: '',
    content: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅 notices 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
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
          console.warn('Notices ordered query fallback to basic snapshot:', err);
          unsubscribe = onSnapshot(collection(db, 'notices'), (snapshot) => {
            const list: NoticeItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<NoticeItem, 'id'>),
            }));
            setNoticesList(list);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      console.error('Failed to setup notices listener:', e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 打开创建模态框
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: '对外发文',
      issuer: '中国高校校办产业协会国际合作与交流专业委员会秘书处',
      date: new Date().toISOString().split('T')[0],
      status: '进行中',
      summary: '',
      content: '',
      deadline: '',
    });
    setIsModalOpen(true);
  };

  // 打开编辑模态框
  const handleOpenEdit = (item: NoticeItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || '对外发文',
      issuer: item.issuer || '国专委秘书处',
      date: item.date || new Date().toISOString().split('T')[0],
      status: item.status || '进行中',
      summary: item.summary || '',
      content: item.content || '',
      deadline: item.deadline || '',
    });
    setIsModalOpen(true);
  };

  // 提交通知表单
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('请填写通知标题和详细通知正文', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const autoSummary = formData.summary.trim() || formData.content.trim().slice(0, 100);

      if (editingItem) {
        // 更新现有通知
        const docRef = doc(db, 'notices', editingItem.id);
        await updateDoc(docRef, {
          title: formData.title.trim(),
          category: formData.category,
          issuer: formData.issuer.trim(),
          date: formData.date,
          status: formData.status,
          summary: autoSummary,
          content: formData.content.trim(),
          deadline: formData.deadline.trim(),
          updatedAt: serverTimestamp(),
        });
        showToast('通知公告已成功更新！');
      } else {
        // 新增通知
        await addDoc(collection(db, 'notices'), {
          title: formData.title.trim(),
          category: formData.category,
          issuer: formData.issuer.trim(),
          date: formData.date,
          status: formData.status,
          summary: autoSummary,
          content: formData.content.trim(),
          deadline: formData.deadline.trim(),
          createdAt: serverTimestamp(),
        });
        showToast('通知公告发布成功！已存入数据库。');
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Submit notice error:', error);
      showToast(error?.message || '操作失败，请检查网络或权限', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 确认删除通知
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'notices', deleteTarget.id));
      showToast(`已成功删除通知《${deleteTarget.title}》`);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Delete notice error:', error);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">通知公告管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            实时对 Firestore 数据库中的 notices 集合进行发布、更新与归档管理
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>+</span>
          <span>发布新通知公告</span>
        </button>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">当前通知条目</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
            {noticesList.length} <span className="text-xs font-normal text-slate-400">条</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">数据存储集合</div>
          <div className="text-base font-bold text-blue-900 mt-2 font-mono">notices (Firestore)</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">进行中事项</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-serif">
            {noticesList.filter((n) => n.status === '进行中' || n.status === '公示中').length} 项
          </div>
        </div>
      </div>

      {/* 列表表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">通知公告列表与操作</h3>
          <span className="text-xs text-slate-400">共 {noticesList.length} 项</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>正在从 Firestore 同步通知数据...</div>
          </div>
        ) : noticesList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-xl text-xs">
            <p className="text-slate-600 font-medium">当前 notices 集合中暂无通知公告数据</p>
            <p className="text-[11px] text-slate-400">请点击右上角“+ 发布新通知公告”开始录入。</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">类别</th>
                  <th className="px-4 py-3 font-semibold min-w-[260px]">通知标题</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">发文部门</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">发布日期</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">当前状态</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {noticesList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`align-top hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                        {item.category || '对外发文'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{item.issuer}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono whitespace-nowrap">{item.date}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status === '进行中'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === '公示中'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          新增/编辑 模态框 (Tailwind Modal)
      ══════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingItem ? '编辑通知公告' : '发布新通知公告'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                数据将写入 Firestore 数据库的 notices 集合
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">通知标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="请输入通知或公告完整标题"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">通知类别 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="对外发文">对外发文</option>
                    <option value="项目申报">项目申报</option>
                    <option value="活动报名">活动报名</option>
                    <option value="信息公示">信息公示</option>
                    <option value="政策法规">政策法规</option>
                    <option value="申报指南">申报指南</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">发文日期 *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">办理状态 *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="进行中">进行中</option>
                    <option value="公示中">公示中</option>
                    <option value="已结束">已结束</option>
                    <option value="长期有效">长期有效</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">截止时间（选填）</label>
                  <input
                    type="text"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="如：2026-10-31 17:00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">发文署名机关 *</label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  通知摘要（选填，未填将自动截取正文首段）
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="简要概括该通知核心主旨与要点..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">详细通知内容 *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="请输入通知详细发文条目、申报条件及办理要求..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 leading-relaxed"
                ></textarea>
              </div>

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
          删除二次确认模态框
      ══════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认删除通知公告？</h3>
                <p className="text-xs text-slate-500">此操作将从 Firestore 数据库永久移除该通知</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800 line-clamp-2">
                《{deleteTarget.title}》
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                发布日期：{deleteTarget.date} · 发文部门：{deleteTarget.issuer}
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
