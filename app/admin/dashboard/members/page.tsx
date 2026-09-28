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

interface MemberItem {
  id: string;
  name: string;
  type: string;
  region: string;
  level: string;
  annualCheck: string;
  contact: string;
  desc?: string;
  createdAt?: any;
}

export default function AdminMembersPage() {
  const [membersList, setMembersList] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 表单模态框
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MemberItem | null>(null);

  // 删除确认模态框
  const [deleteTarget, setDeleteTarget] = useState<MemberItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: '高等院校',
    region: '北京',
    level: '理事会员单位',
    annualCheck: '已通过 (2026)',
    contact: '',
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

  // 实时订阅 members 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MemberItem, 'id'>),
          }));
          setMembersList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Members ordered query fallback to basic snapshot:', err);
          unsubscribe = onSnapshot(collection(db, 'members'), (snapshot) => {
            const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<MemberItem, 'id'>),
            }));
            setMembersList(list);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      console.error('Failed to setup members listener:', e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 打开录入弹窗
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: '高等院校',
      region: '北京',
      level: '理事会员单位',
      annualCheck: '已通过 (2026)',
      contact: '',
      desc: '',
    });
    setIsModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (item: MemberItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      type: item.type || '高等院校',
      region: item.region || '北京',
      level: item.level || '理事会员单位',
      annualCheck: item.annualCheck || '已通过 (2026)',
      contact: item.contact || '',
      desc: item.desc || '',
    });
    setIsModalOpen(true);
  };

  // 提交会员表单
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim()) {
      showToast('请完整填写单位名称与对接人联系方式', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        // 更新会员信息
        const docRef = doc(db, 'members', editingItem.id);
        await updateDoc(docRef, {
          name: formData.name.trim(),
          type: formData.type,
          region: formData.region,
          level: formData.level,
          annualCheck: formData.annualCheck,
          contact: formData.contact.trim(),
          desc: formData.desc.trim(),
          updatedAt: serverTimestamp(),
        });
        showToast('会员单位信息已成功更新！');
      } else {
        // 录入新会员
        await addDoc(collection(db, 'members'), {
          name: formData.name.trim(),
          type: formData.type,
          region: formData.region,
          level: formData.level,
          annualCheck: formData.annualCheck,
          contact: formData.contact.trim(),
          desc: formData.desc.trim(),
          createdAt: serverTimestamp(),
        });
        showToast('新会员单位录入成功！已存入数据库。');
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Submit member error:', error);
      showToast(error?.message || '操作失败，请检查网络或权限', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 确认删除会员
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'members', deleteTarget.id));
      showToast(`已成功删除会员单位《${deleteTarget.name}》`);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Delete member error:', error);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位与资质管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            实时对 Firestore 数据库中的 members 集合进行入库、资质更新与档案管理
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>+</span>
          <span>录入新会员单位</span>
        </button>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">登记会员总数</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
            {membersList.length} <span className="text-xs font-normal text-slate-400">家</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">数据存储集合</div>
          <div className="text-base font-bold text-blue-900 mt-2 font-mono">members (Firestore)</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">高等院校会员</div>
          <div className="text-xl font-bold text-blue-800 mt-1 font-serif">
            {membersList.filter((m) => m.type === '高等院校').length} 所
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">年审通过</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-serif">
            {membersList.filter((m) => m.annualCheck.includes('已通过')).length} 家
          </div>
        </div>
      </div>

      {/* 列表表格 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">会员单位资质清单</h3>
          <span className="text-xs text-slate-400">共 {membersList.length} 家</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>正在从 Firestore 同步会员数据...</div>
          </div>
        ) : membersList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-xl text-xs">
            <p className="text-slate-600 font-medium">当前 members 集合中暂无会员记录</p>
            <p className="text-[11px] text-slate-400">请点击右上角“+ 录入新会员单位”开始录入。</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">机构类别</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">单位名称</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">地区</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">会员级别</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">年审状态</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">联络对接人</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {membersList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`align-top hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 leading-snug">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{item.region}</td>
                    <td className="px-4 py-3.5 text-blue-900 font-medium whitespace-nowrap">{item.level}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.annualCheck.includes('已通过')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.annualCheck}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono whitespace-nowrap">{item.contact}</td>
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
                {editingItem ? '编辑会员单位信息' : '录入新会员单位'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                数据将写入 Firestore 数据库的 members 集合
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">单位名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：清华大学科技开发部 / 某重点大学科技园"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">机构类别 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="高等院校">高等院校</option>
                    <option value="校办企业">校办企业</option>
                    <option value="大学科技园">大学科技园</option>
                    <option value="技术转移机构">技术转移机构</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">所属省市 *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="北京">北京</option>
                    <option value="上海">上海</option>
                    <option value="浙江">浙江</option>
                    <option value="广东">广东</option>
                    <option value="湖北">湖北</option>
                    <option value="陕西">陕西</option>
                    <option value="天津">天津</option>
                    <option value="江苏">江苏</option>
                    <option value="山东">山东</option>
                    <option value="四川">四川</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">会员级别 *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="主任委员单位">主任委员单位</option>
                    <option value="副主任委员单位">副主任委员单位</option>
                    <option value="常务理事单位">常务理事单位</option>
                    <option value="理事会员单位">理事会员单位</option>
                    <option value="普通会员单位">普通会员单位</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">年审状态 *</label>
                  <select
                    value={formData.annualCheck}
                    onChange={(e) => setFormData({ ...formData, annualCheck: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="已通过 (2026)">已通过 (2026)</option>
                    <option value="已通过 (2025)">已通过 (2025)</option>
                    <option value="待审核">待审核</option>
                    <option value="需补正材料">需补正材料</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">对接联系人与方式 *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="如：张部长 / 010-8888XXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">单位简介或重点转化成效（选填）</label>
                <textarea
                  rows={4}
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="简要填写单位在产学研融合、涉外合作中的核心优势..."
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
                <h3 className="text-base font-bold text-slate-900">确认删除会员单位？</h3>
                <p className="text-xs text-slate-500">此操作将从 Firestore 数据库永久移除该会员记录</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800 line-clamp-2">
                《{deleteTarget.name}》
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {deleteTarget.region} · {deleteTarget.type} · 级别：{deleteTarget.level}
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
