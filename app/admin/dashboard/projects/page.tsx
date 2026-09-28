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

interface ProjectItem {
  id: string;
  name: string;
  country: string;
  field: string;
  chineseParty: string;
  foreignParty: string;
  period: string;
  status: string;
  desc?: string;
  createdAt?: any;
}

export default function AdminProjectsPage() {
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 表单模态框
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);

  // 删除确认模态框
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    country: '德国',
    field: '智能制造',
    chineseParty: '',
    foreignParty: '',
    period: '2025.01 - 2027.12',
    status: '进行中',
    desc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅 projects 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ProjectItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProjectItem, 'id'>),
          }));
          setProjectsList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Projects ordered query fallback to basic snapshot:', err);
          unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const list: ProjectItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<ProjectItem, 'id'>),
            }));
            setProjectsList(list);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      console.error('Failed to setup projects listener:', e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 打开录入弹窗
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      country: '德国',
      field: '智能制造',
      chineseParty: '',
      foreignParty: '',
      period: '2025.01 - 2027.12',
      status: '进行中',
      desc: '',
    });
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (item: ProjectItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      country: item.country || '德国',
      field: item.field || '智能制造',
      chineseParty: item.chineseParty || '',
      foreignParty: item.foreignParty || '',
      period: item.period || '2025.01 - 2027.12',
      status: item.status || '进行中',
      desc: item.desc || '',
    });
    setIsModalOpen(true);
  };

  // 提交项目表单
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.chineseParty.trim() || !formData.foreignParty.trim()) {
      showToast('请完整填写项目名称、中方合作主体与外方合作主体', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // 更新项目
        const docRef = doc(db, 'projects', editingItem.id);
        await updateDoc(docRef, {
          name: formData.name.trim(),
          country: formData.country,
          field: formData.field,
          chineseParty: formData.chineseParty.trim(),
          foreignParty: formData.foreignParty.trim(),
          period: formData.period.trim(),
          status: formData.status,
          desc: formData.desc.trim(),
          updatedAt: serverTimestamp(),
        });
        showToast('国际合作项目已成功更新！');
      } else {
        // 新建项目
        await addDoc(collection(db, 'projects'), {
          name: formData.name.trim(),
          country: formData.country,
          field: formData.field,
          chineseParty: formData.chineseParty.trim(),
          foreignParty: formData.foreignParty.trim(),
          period: formData.period.trim(),
          status: formData.status,
          desc: formData.desc.trim(),
          createdAt: serverTimestamp(),
        });
        showToast('新合作项目录入成功！已存入数据库。');
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Submit project error:', error);
      showToast(error?.message || '操作失败，请检查网络或权限', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 确认删除项目
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'projects', deleteTarget.id));
      showToast(`已成功删除项目《${deleteTarget.name}》`);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Delete project error:', error);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">国际合作项目库管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            实时对 Firestore 数据库中的 projects 集合进行录入、更新与归档管理
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>+</span>
          <span>录入新合作项目</span>
        </button>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">重点合作项目</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
            {projectsList.length} <span className="text-xs font-normal text-slate-400">项</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">数据存储集合</div>
          <div className="text-base font-bold text-blue-900 mt-2 font-mono">projects (Firestore)</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">进行中项目</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-serif">
            {projectsList.filter((p) => p.status === '进行中').length} 项
          </div>
        </div>
      </div>

      {/* 列表表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">涉外合作项目列表</h3>
          <span className="text-xs text-slate-400">共 {projectsList.length} 项</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>正在从 Firestore 同步合作项目数据...</div>
          </div>
        ) : projectsList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-xl text-xs">
            <p className="text-slate-600 font-medium">当前 projects 集合中暂无项目数据</p>
            <p className="text-[11px] text-slate-400">请点击右上角“+ 录入新合作项目”开始录入。</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">国别 / 领域</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">项目全称</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">中方主体</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">外方主体</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">合作周期</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">进展状态</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectsList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`align-top hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                        {item.country} · {item.field}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 leading-snug">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{item.chineseParty}</td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{item.foreignParty}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono whitespace-nowrap">{item.period}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status === '进行中'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === '筹备中'
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
                {editingItem ? '编辑国际合作项目' : '录入新国际合作项目'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                数据将写入 Firestore 数据库的 projects 集合
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">项目全称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：中德智能工业机器人联合概念验证中心与技术转移项目"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">合作国别 *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="德国">德国</option>
                    <option value="新加坡">新加坡</option>
                    <option value="英国">英国</option>
                    <option value="瑞士">瑞士</option>
                    <option value="日本">日本</option>
                    <option value="澳大利亚">澳大利亚</option>
                    <option value="一带一路沿线">一带一路沿线</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">技术领域 *</label>
                  <select
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="智能制造">智能制造</option>
                    <option value="新能源">新能源</option>
                    <option value="生物医药">生物医药</option>
                    <option value="数字经济">数字经济</option>
                    <option value="现代农业">现代农业</option>
                    <option value="新材料">新材料</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">进展状态 *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="进行中">进行中</option>
                    <option value="筹备中">筹备中</option>
                    <option value="已完成">已完成</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">中方合作主体 *</label>
                  <input
                    type="text"
                    required
                    value={formData.chineseParty}
                    onChange={(e) => setFormData({ ...formData, chineseParty: e.target.value })}
                    placeholder="如：清华大学科技开发部"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">外方合作主体 *</label>
                  <input
                    type="text"
                    required
                    value={formData.foreignParty}
                    onChange={(e) => setFormData({ ...formData, foreignParty: e.target.value })}
                    placeholder="如：德国慕尼黑工业大学 (TUM)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">合作起止周期 *</label>
                <input
                  type="text"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="例如：2024.03 - 2026.12"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">项目详细说明与成效（选填）</label>
                <textarea
                  rows={4}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="简要阐述合作背景、技术攻关目标与阶段转化成效..."
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
                  <span>{editingItem ? '保存修改' : '确认录入'}</span>
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
                <h3 className="text-base font-bold text-slate-900">确认删除合作项目？</h3>
                <p className="text-xs text-slate-500">此操作将从 Firestore 数据库永久移除该项目</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800 line-clamp-2">
                《{deleteTarget.name}》
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {deleteTarget.country} · {deleteTarget.chineseParty} ↔ {deleteTarget.foreignParty}
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
