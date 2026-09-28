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

interface AchievementItem {
  id: string;
  title: string;
  category: string;
  unit: string;
  field: string;
  maturity: string;
  status: string;
  date: string;
  summary: string;
  contact: string;
  createdAt?: any;
}

export default function AdminAchievementsPage() {
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);

  // 删除确认模态框
  const [deleteTarget, setDeleteTarget] = useState<AchievementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 筛选与搜索
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    category: '科技成果',
    unit: '',
    field: '智能制造',
    maturity: 'TRL 7（样机验证）',
    status: '寻求转让',
    date: new Date().toISOString().slice(0, 7),
    summary: '',
    contact: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅 achievements 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AchievementItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<AchievementItem, 'id'>),
          }));
          setAchievementsList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Achievements query fallback to unordered snapshot:', err);
          unsubscribe = onSnapshot(collection(db, 'achievements'), (snapshot) => {
            const list: AchievementItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<AchievementItem, 'id'>),
            }));
            setAchievementsList(list);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      console.error('Failed to setup achievements listener:', e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 打开录入弹窗
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: '科技成果',
      unit: '',
      field: '智能制造',
      maturity: 'TRL 7（样机验证）',
      status: '寻求转让',
      date: new Date().toISOString().slice(0, 7),
      summary: '',
      contact: '',
    });
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (item: AchievementItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || '科技成果',
      unit: item.unit || '',
      field: item.field || '智能制造',
      maturity: item.maturity || '',
      status: item.status || '寻求转让',
      date: item.date || '',
      summary: item.summary || '',
      contact: item.contact || '',
    });
    setIsModalOpen(true);
  };

  // 提交新增或更新
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.unit.trim()) {
      showToast('请完整填写成果/报告名称与研发/发布单位', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // 更新现有记录
        const docRef = doc(db, 'achievements', editingItem.id);
        await updateDoc(docRef, {
          title: formData.title.trim(),
          category: formData.category,
          unit: formData.unit.trim(),
          field: formData.field,
          maturity: formData.maturity.trim(),
          status: formData.status,
          date: formData.date.trim(),
          summary: formData.summary.trim(),
          contact: formData.contact.trim(),
        });
        showToast('成果与智库信息已成功更新');
      } else {
        // 录入新记录
        await addDoc(collection(db, 'achievements'), {
          title: formData.title.trim(),
          category: formData.category,
          unit: formData.unit.trim(),
          field: formData.field,
          maturity: formData.maturity.trim(),
          status: formData.status,
          date: formData.date.trim(),
          summary: formData.summary.trim(),
          contact: formData.contact.trim(),
          createdAt: serverTimestamp(),
        });
        showToast('新成果/报告已成功录入');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save achievement error:', err);
      showToast('保存失败：' + (err.message || '网络或权限错误'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 执行真实删除操作
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'achievements', deleteTarget.id));
      showToast('已安全移除该成果记录');
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete achievement error:', err);
      showToast('删除失败：' + (err.message || '请检查权限配置'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // 过滤成果列表
  const filteredList = achievementsList.filter((item) => {
    if (categoryFilter !== '全部' && item.category !== categoryFilter) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(kw);
      const matchUnit = item.unit?.toLowerCase().includes(kw);
      const matchField = item.field?.toLowerCase().includes(kw);
      if (!matchTitle && !matchUnit && !matchField) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast 提示 */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 顶部标题栏与新建按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">成果与智库管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            录入与管理科技成果、技术需求、智库白皮书、典型案例与团体标准，直通官网展示。
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ 录入成果与智库</span>
        </button>
      </div>

      {/* 筛选与搜索 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* 分类切换 */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {['全部', '科技成果', '技术需求', '智库报告', '典型案例', '团体标准'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 关键字搜索 */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索成果名称、单位或领域..."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50"
          />
        </div>
      </div>

      {/* 成果列表展示 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">成果与报告清单</h3>
          <span className="text-xs text-slate-400">共 {filteredList.length} 条有效记录</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>正在从 Firestore 数据库拉取成果列表...</div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-xl text-xs">
            <p className="text-slate-600 font-medium">当前分类下暂无成果记录</p>
            <p className="text-[11px] text-slate-400">请点击右上角“+ 录入成果与智库”进行新增。</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">分类</th>
                  <th className="px-4 py-3 font-semibold min-w-[200px]">成果 / 报告名称</th>
                  <th className="px-4 py-3 font-semibold min-w-[140px]">研发/发布单位</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">领域</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">成熟度/状态</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">日期</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`align-top hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.summary || '无详细描述'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{item.unit}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {item.field}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 block w-max">
                          {item.status}
                        </span>
                        {item.maturity && (
                          <span className="text-[10px] text-slate-400 block">{item.maturity}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono whitespace-nowrap">{item.date}</td>
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

      {/* ─── 录入 / 编辑模态框 (Modal) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingItem ? '编辑成果与智库信息' : '录入新成果 / 智库报告'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    数据将写入 Firestore 数据库 achievements 集合
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">成果 / 报告 / 标准名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="如：高精度轮廓视觉检测系统 V3.0 / 2026中国高校科技成果海外转化白皮书"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">所属分类 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                    >
                      <option value="科技成果">科技成果</option>
                      <option value="技术需求">技术需求</option>
                      <option value="智库报告">智库报告</option>
                      <option value="典型案例">典型案例</option>
                      <option value="团体标准">团体标准</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">研发 / 牵头 / 发布单位 *</label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="如：清华大学精密仪器系 / 国专委秘书处"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">产业领域 *</label>
                    <select
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                    >
                      <option value="智能制造">智能制造</option>
                      <option value="新能源材料">新能源材料</option>
                      <option value="生物医药">生物医药</option>
                      <option value="智慧基建">智慧基建</option>
                      <option value="现代农业">现代农业</option>
                      <option value="数字经济">数字经济</option>
                      <option value="政策研究">政策研究</option>
                      <option value="其他">其他领域</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">技术成熟度 / 等级</label>
                    <input
                      type="text"
                      value={formData.maturity}
                      onChange={(e) => setFormData({ ...formData, maturity: e.target.value })}
                      placeholder="如：TRL 7（样机验证）/ 批准发布"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">转化 / 发布状态 *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                    >
                      <option value="寻求转让">寻求转让</option>
                      <option value="寻求许可">寻求许可</option>
                      <option value="寻求合作开发">寻求合作开发</option>
                      <option value="已许可">已许可</option>
                      <option value="需求发布中">需求发布中</option>
                      <option value="批准发布">批准发布</option>
                      <option value="已结题">已结题</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">发布年月</label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="如：2026-08"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">联系对接方式</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="如：tech@tsinghua.edu.cn / 010-XXXX"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">成果 / 报告详细介绍</label>
                  <textarea
                    rows={4}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="请输入技术优势、应用场景、合作方式或报告主要结论..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-medium cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? '正在写入数据库...' : editingItem ? '确认更新' : '确认录入'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── 删除确认模态框 ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">确认删除该成果记录？</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                删除后，<span className="font-semibold text-slate-800">{deleteTarget.title}</span> 将立即从前端“成果与智库”频道下架，且无法恢复。
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? '正在删除...' : '确认彻底删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
