'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  InternationalContentData,
  defaultInternationalData,
  RegionItem,
  BriItem,
  ActivityItem,
  MatchmakingNeedItem,
  PartnerOrgItem,
} from '@/lib/internationalData';

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
  // 6大子栏目切换（与前台国际合作频道完全对齐）
  const [activeTab, setActiveTab] = useState<
    'projects' | 'regions' | 'bri' | 'activities' | 'matchmaking' | 'organizations'
  >('projects');

  // ──────────────────────────────────────────
  // 1. 合作项目库状态（Firestore projects 集合）
  // ──────────────────────────────────────────
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteTargetProject, setDeleteTargetProject] = useState<ProjectItem | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    country: '德国',
    field: '智能制造',
    chineseParty: '',
    foreignParty: '',
    period: '2025.01 - 2027.12',
    status: '进行中',
    desc: '',
  });

  // ──────────────────────────────────────────
  // 2. 国际合作其余5大板块状态（siteConfig/international）
  // ──────────────────────────────────────────
  const [intlData, setIntlData] = useState<InternationalContentData>(defaultInternationalData);
  const [loadingIntl, setLoadingIntl] = useState(true);
  const [savingIntl, setSavingIntl] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 子板块筛选与模态框状态
  const [briFilter, setBriFilter] = useState<'全部' | 'policy' | 'project' | 'activity' | 'achievement'>('全部');
  const [activityFilter, setActivityFilter] = useState('全部');
  const [matchmakingFilter, setMatchmakingFilter] = useState<'全部' | 'domestic' | 'overseas'>('全部');
  const [orgFilter, setOrgFilter] = useState<'全部' | 'international_org' | 'overseas_uni'>('全部');

  // 通用单项编辑模态框
  const [editingModalType, setEditingModalType] = useState<
    'region' | 'bri' | 'activity' | 'need' | 'org' | null
  >(null);
  const [editingItemData, setEditingItemData] = useState<any>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'region' | 'bri' | 'activity' | 'need' | 'org';
    id: string;
    title: string;
  } | null>(null);

  // 吐司提示
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅 1：projects 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const timer = setTimeout(() => {
      setLoadingProjects(false);
    }, 4000);

    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timer);
          const list: ProjectItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProjectItem, 'id'>),
          }));
          setProjectsList(list);
          setLoadingProjects(false);
        },
        (err) => {
          console.warn('Projects ordered query fallback:', err);
          unsubscribe = onSnapshot(
            collection(db, 'projects'),
            (snapshot) => {
              clearTimeout(timer);
              const list: ProjectItem[] = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<ProjectItem, 'id'>),
              }));
              setProjectsList(list);
              setLoadingProjects(false);
            },
            (fallbackErr) => {
              console.warn('Projects fallback err:', fallbackErr);
              clearTimeout(timer);
              setLoadingProjects(false);
            }
          );
        }
      );
    } catch (e) {
      console.error('Projects setup listener err:', e);
      clearTimeout(timer);
      setLoadingProjects(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 实时订阅 2：siteConfig/international 文档
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const timer = setTimeout(() => {
      setLoadingIntl(false);
    }, 4000);

    try {
      const docRef = doc(db, 'siteConfig', 'international');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          clearTimeout(timer);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<InternationalContentData>;
            setIntlData({
              regions: data.regions || defaultInternationalData.regions,
              bri: data.bri || defaultInternationalData.bri,
              activities: data.activities || defaultInternationalData.activities,
              matchmakingNeeds: data.matchmakingNeeds || defaultInternationalData.matchmakingNeeds,
              organizations: data.organizations || defaultInternationalData.organizations,
            });
          } else {
            setIntlData(defaultInternationalData);
          }
          setLoadingIntl(false);
        },
        (err) => {
          console.warn('International config snapshot fallback:', err);
          clearTimeout(timer);
          setLoadingIntl(false);
        }
      );
    } catch (e) {
      console.error('International config listener err:', e);
      clearTimeout(timer);
      setLoadingIntl(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 保存其余5大板块数据到 Firestore
  const handleSaveIntlConfig = async (overrideData?: InternationalContentData) => {
    setSavingIntl(true);
    try {
      const docRef = doc(db, 'siteConfig', 'international');
      await setDoc(docRef, {
        ...(overrideData || intlData),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast('国际合作配置已成功保存发布！前台对应板块已实时更新。', 'success');
    } catch (err: any) {
      console.error('Save international config error:', err);
      showToast(`保存失败：${err?.message || '请检查网络'}`, 'error');
    } finally {
      setSavingIntl(false);
    }
  };

  // 恢复其余5大板块为默认基底数据
  const handleResetToDefault = async () => {
    setIntlData(JSON.parse(JSON.stringify(defaultInternationalData)));
    setShowResetConfirm(false);
    await handleSaveIntlConfig(defaultInternationalData);
    showToast('已重置为系统预设基底数据并同步至数据库！', 'success');
  };

  // ──────────────────────────────────────────
  // 合作项目库（projects）处理方法
  // ──────────────────────────────────────────
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectFormData({
      name: '',
      country: '德国',
      field: '智能制造',
      chineseParty: '',
      foreignParty: '',
      period: '2025.01 - 2027.12',
      status: '进行中',
      desc: '',
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (item: ProjectItem) => {
    setEditingProject(item);
    setProjectFormData({
      name: item.name || '',
      country: item.country || '德国',
      field: item.field || '智能制造',
      chineseParty: item.chineseParty || '',
      foreignParty: item.foreignParty || '',
      period: item.period || '2025.01 - 2027.12',
      status: item.status || '进行中',
      desc: item.desc || '',
    });
    setIsProjectModalOpen(true);
  };

  const handleSubmitProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.name.trim() || !projectFormData.chineseParty.trim() || !projectFormData.foreignParty.trim()) {
      showToast('请完整填写项目名称、中方合作主体与外方合作主体', 'error');
      return;
    }

    try {
      if (editingProject) {
        const docRef = doc(db, 'projects', editingProject.id);
        await updateDoc(docRef, {
          name: projectFormData.name.trim(),
          country: projectFormData.country,
          field: projectFormData.field,
          chineseParty: projectFormData.chineseParty.trim(),
          foreignParty: projectFormData.foreignParty.trim(),
          period: projectFormData.period.trim(),
          status: projectFormData.status,
          desc: projectFormData.desc.trim(),
          updatedAt: serverTimestamp(),
        });
        showToast('国际合作项目已成功更新！');
      } else {
        await addDoc(collection(db, 'projects'), {
          name: projectFormData.name.trim(),
          country: projectFormData.country,
          field: projectFormData.field,
          chineseParty: projectFormData.chineseParty.trim(),
          foreignParty: projectFormData.foreignParty.trim(),
          period: projectFormData.period.trim(),
          status: projectFormData.status,
          desc: projectFormData.desc.trim(),
          createdAt: serverTimestamp(),
        });
        showToast('新合作项目录入成功！');
      }
      setIsProjectModalOpen(false);
    } catch (err: any) {
      console.error('Submit project error:', err);
      showToast(err?.message || '操作失败', 'error');
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteTargetProject) return;
    setIsDeletingProject(true);
    try {
      await deleteDoc(doc(db, 'projects', deleteTargetProject.id));
      showToast(`已成功删除项目《${deleteTargetProject.name}》`);
      setDeleteTargetProject(null);
    } catch (err: any) {
      console.error('Delete project error:', err);
      showToast(err?.message || '删除失败', 'error');
    } finally {
      setIsDeletingProject(false);
    }
  };

  // ──────────────────────────────────────────
  // 5大子模块项增删改通用处理
  // ──────────────────────────────────────────
  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModalType || !editingItemData) return;

    let updated = { ...intlData };

    if (editingModalType === 'region') {
      const idx = updated.regions.findIndex((r) => r.id === editingItemData.id);
      if (idx >= 0) {
        updated.regions[idx] = editingItemData;
      } else {
        updated.regions = [
          ...updated.regions,
          { ...editingItemData, id: `region-${Date.now()}` },
        ];
      }
    } else if (editingModalType === 'bri') {
      const idx = updated.bri.findIndex((b) => b.id === editingItemData.id);
      if (idx >= 0) {
        updated.bri[idx] = editingItemData;
      } else {
        updated.bri = [
          ...updated.bri,
          { ...editingItemData, id: `bri-${Date.now()}` },
        ];
      }
    } else if (editingModalType === 'activity') {
      const idx = updated.activities.findIndex((a) => a.id === editingItemData.id);
      if (idx >= 0) {
        updated.activities[idx] = editingItemData;
      } else {
        updated.activities = [
          { ...editingItemData, id: `act-${Date.now()}` },
          ...updated.activities,
        ];
      }
    } else if (editingModalType === 'need') {
      const idx = updated.matchmakingNeeds.findIndex((n) => n.id === editingItemData.id);
      if (idx >= 0) {
        updated.matchmakingNeeds[idx] = editingItemData;
      } else {
        updated.matchmakingNeeds = [
          ...updated.matchmakingNeeds,
          { ...editingItemData, id: `need-${Date.now()}` },
        ];
      }
    } else if (editingModalType === 'org') {
      const idx = updated.organizations.findIndex((o) => o.id === editingItemData.id);
      if (idx >= 0) {
        updated.organizations[idx] = editingItemData;
      } else {
        updated.organizations = [
          ...updated.organizations,
          { ...editingItemData, id: `org-${Date.now()}` },
        ];
      }
    }

    setIntlData(updated);
    setEditingModalType(null);
    setEditingItemData(null);
    handleSaveIntlConfig(updated);
  };

  const handleExecuteDeleteItem = () => {
    if (!deleteConfirmItem) return;
    const { type, id } = deleteConfirmItem;
    let updated = { ...intlData };

    if (type === 'region') {
      updated.regions = updated.regions.filter((r) => r.id !== id);
    } else if (type === 'bri') {
      updated.bri = updated.bri.filter((b) => b.id !== id);
    } else if (type === 'activity') {
      updated.activities = updated.activities.filter((a) => a.id !== id);
    } else if (type === 'need') {
      updated.matchmakingNeeds = updated.matchmakingNeeds.filter((n) => n.id !== id);
    } else if (type === 'org') {
      updated.organizations = updated.organizations.filter((o) => o.id !== id);
    }

    setIntlData(updated);
    setDeleteConfirmItem(null);
    handleSaveIntlConfig(updated);
  };

  // 导航标签定义
  const navTabs = [
    { id: 'projects', label: '合作项目库', count: projectsList.length },
    { id: 'regions', label: '国别与区域', count: intlData.regions.length },
    { id: 'bri', label: '一带一路', count: intlData.bri.length },
    { id: 'activities', label: '涉外交流活动', count: intlData.activities.length },
    { id: 'matchmaking', label: '合作需求', count: intlData.matchmakingNeeds.length },
    { id: 'organizations', label: '国际组织', count: intlData.organizations.length },
  ];

  return (
    <div className="space-y-6">
      {/* 吐司提示条 */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold text-white border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 border-emerald-400'
              : 'bg-red-900 border-red-400'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 顶部标题与保存按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">国际合作频道全量管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            全面管理前台国际合作 6 大子板块：合作项目库、国别区域、一带一路、涉外活动、合作需求与国际组织。
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {activeTab !== 'projects' && (
            <>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                重置当前预设
              </button>
              <button
                type="button"
                onClick={() => handleSaveIntlConfig()}
                disabled={savingIntl}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                {savingIntl && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                <span>{savingIntl ? '正在保存...' : '保存发布全站'}</span>
              </button>
            </>
          )}

          {activeTab === 'projects' && (
            <button
              type="button"
              onClick={handleOpenCreateProject}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>录入新合作项目</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 大子板块切换标签栏（对齐前台子导航） */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1.5 min-w-max">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          板块 1：合作项目库（原功能 100% 完整保留）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
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

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">涉外合作项目列表</h3>
              <span className="text-xs text-slate-400">共 {projectsList.length} 项</span>
            </div>

            {loadingProjects ? (
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
              <>
                {/* 移动端卡片流 */}
                <div className="md:hidden space-y-3">
                  {projectsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                          {item.country} · {item.field}
                        </span>
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
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 leading-snug text-sm">{item.name}</h4>
                        <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                          <div>中方：{item.chineseParty}</div>
                          <div>外方：{item.foreignParty}</div>
                          <div className="text-slate-400 font-mono">周期：{item.period}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          ID: {item.id}
                        </span>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(item)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetProject(item)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 桌面端表格 */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">项目名称</th>
                        <th className="py-3 px-4">国别 / 领域</th>
                        <th className="py-3 px-4">中外合作主体</th>
                        <th className="py-3 px-4">执行周期</th>
                        <th className="py-3 px-4">状态</th>
                        <th className="py-3 px-4 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {projectsList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[220px]">
                            <div className="truncate font-medium" title={item.name}>
                              {item.name}
                            </div>
                            {item.desc && (
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                {item.desc}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                              {item.country} · {item.field}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-medium text-slate-800 truncate max-w-[180px]">{item.chineseParty}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">↔ {item.foreignParty}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                            {item.period}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
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
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProject(item)}
                              className="text-blue-700 hover:text-blue-900 font-medium cursor-pointer"
                            >
                              编辑
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetProject(item)}
                              className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 2：国别与区域（regions）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'regions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">国别与重点区域合作卡片</h3>
              <p className="text-xs text-slate-500 mt-0.5">按国家战略圈维护合作概况、政策环境提示与合作基础</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingModalType('region');
                setEditingItemData({
                  id: '',
                  country: '',
                  tag: '区域合作',
                  tagColor: 'bg-blue-100 text-blue-800',
                  overview: '',
                  policyTip: '',
                  foundation: '',
                });
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              + 添加国别/区域卡片
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {intlData.regions.map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">{reg.country}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${reg.tagColor || 'bg-blue-100 text-blue-800'}`}>
                      {reg.tag}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">概况：</strong>{reg.overview}
                  </p>
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed">
                    <span className="font-bold">⚠️ 政策提示：</span>{reg.policyTip}
                  </div>
                  <div className="pt-2 text-slate-500 border-t border-slate-200/60 text-[11px]">
                    <strong className="text-slate-700">合作基础：</strong>{reg.foundation}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingModalType('region');
                      setEditingItemData({ ...reg });
                    }}
                    className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 rounded font-medium cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirmItem({
                        type: 'region',
                        id: reg.id,
                        title: reg.country,
                      })
                    }
                    className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 3：一带一路专题（bri）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'bri' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">共建“一带一路”产教融合专题</h3>
              <p className="text-xs text-slate-500 mt-0.5">涵盖政策指引、沿线示范项目、合作交流活动与重点成果</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingModalType('bri');
                setEditingItemData({
                  id: '',
                  category: 'policy',
                  title: '',
                  dateOrStatus: '2026',
                  statusBadge: '推进中',
                  summary: '',
                });
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              + 添加一带一路条目
            </button>
          </div>

          {/* 分类筛选器 */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">分类筛选：</span>
            {[
              { id: '全部', label: '全部' },
              { id: 'policy', label: '政策指引' },
              { id: 'project', label: '沿线示范项目' },
              { id: 'activity', label: '合作交流活动' },
              { id: 'achievement', label: '重点建设成果' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBriFilter(tab.id as any)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  briFilter === tab.id
                    ? 'bg-blue-800 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {intlData.bri
              .filter((item) => briFilter === '全部' || item.category === briFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-blue-100 text-blue-900">
                        {item.category === 'policy'
                          ? '政策指引'
                          : item.category === 'project'
                          ? '示范项目'
                          : item.category === 'activity'
                          ? '交流活动'
                          : '重点成果'}
                      </span>
                      {item.statusBadge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {item.statusBadge}
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[11px]">{item.dateOrStatus}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.summary}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModalType('bri');
                        setEditingItemData({ ...item });
                      }}
                      className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 rounded font-medium cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmItem({
                          type: 'bri',
                          id: item.id,
                          title: item.title,
                        })
                      }
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 4：涉外交流活动（activities）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">涉外交流活动专区</h3>
              <p className="text-xs text-slate-500 mt-0.5">涵盖出访考察、海外来访、国际论坛、成果展会与专业培训</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingModalType('activity');
                setEditingItemData({
                  id: '',
                  type: '出访',
                  status: '活动预告',
                  title: '',
                  date: new Date().toISOString().split('T')[0],
                  location: '中国北京',
                  summary: '',
                });
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              + 添加交流活动
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">活动类型：</span>
            {['全部', '出访', '来访', '论坛', '展会', '培训'].map((type) => (
              <button
                key={type}
                onClick={() => setActivityFilter(type)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activityFilter === type
                    ? 'bg-blue-800 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {intlData.activities
              .filter((act) => activityFilter === '全部' || act.type === activityFilter)
              .map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-blue-50 text-blue-900 border border-blue-200">
                        {act.type}活动
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          act.status === '活动预告'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {act.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{act.date}</span>
                      <span className="text-slate-500 text-[11px]">· {act.location}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{act.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{act.summary}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModalType('activity');
                        setEditingItemData({ ...act });
                      }}
                      className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 rounded font-medium cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmItem({
                          type: 'activity',
                          id: act.id,
                          title: act.title,
                        })
                      }
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 5：合作需求与对接（matchmaking）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'matchmaking' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">合作需求与跨境对接大厅</h3>
              <p className="text-xs text-slate-500 mt-0.5">国内高校出海攻关需求与海外机构来华意向管理</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingModalType('need');
                setEditingItemData({
                  id: '',
                  direction: 'domestic',
                  field: '智能制造与高端装备',
                  publisher: '',
                  title: '',
                  desc: '',
                  footerMeta: '发布周期：长期有效 · 合作形式：联合研发',
                });
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              + 添加对接需求意向
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">需求分类：</span>
            {[
              { id: '全部', label: '全部' },
              { id: 'domestic', label: '国内单位技术攻关与出海' },
              { id: 'overseas', label: '海外机构来华意向与技术转移' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMatchmakingFilter(tab.id as any)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  matchmakingFilter === tab.id
                    ? 'bg-blue-800 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intlData.matchmakingNeeds
              .filter((n) => matchmakingFilter === '全部' || n.direction === matchmakingFilter)
              .map((need) => (
                <div
                  key={need.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          need.direction === 'domestic'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {need.direction === 'domestic' ? '国内高校需求' : '海外机构意向'}
                      </span>
                      <span className="text-[11px] text-slate-400">{need.publisher}</span>
                    </div>
                    <div className="font-semibold text-blue-800 text-[11px]">{need.field}</div>
                    <h4 className="font-bold text-slate-900 text-sm">{need.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{need.desc}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                      {need.footerMeta}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModalType('need');
                        setEditingItemData({ ...need });
                      }}
                      className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 rounded font-medium cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmItem({
                          type: 'need',
                          id: need.id,
                          title: need.title,
                        })
                      }
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 6：国际组织与友好机构（organizations）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'organizations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">国际组织与友好合作机构</h3>
              <p className="text-xs text-slate-500 mt-0.5">全球学术创新联合体、技术转移网络与海外友好高校</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingModalType('org');
                setEditingItemData({
                  id: '',
                  category: 'international_org',
                  name: '',
                  sub: '',
                  desc: '',
                  country: '总部：海外',
                  linkText: '了解合作',
                });
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              + 添加国际组织/机构
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">机构类别：</span>
            {[
              { id: '全部', label: '全部' },
              { id: 'international_org', label: '国际学术组织与创新联盟' },
              { id: 'overseas_uni', label: '海外友好高校与科技转化机构' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOrgFilter(tab.id as any)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  orgFilter === tab.id
                    ? 'bg-blue-800 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intlData.organizations
              .filter((org) => orgFilter === '全部' || org.category === orgFilter)
              .map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-900">
                        {org.category === 'international_org' ? '国际组织联盟' : '海外高校机构'}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{org.country}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{org.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{org.sub}</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{org.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModalType('org');
                        setEditingItemData({ ...org });
                      }}
                      className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 rounded font-medium cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmItem({
                          type: 'org',
                          id: org.id,
                          title: org.name,
                        })
                      }
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-medium cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          合作项目库录入/编辑模态框
      ══════════════════════════════════════════════════════ */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProject ? '编辑国际合作项目' : '录入新国际合作项目'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProjectForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">项目名称 *</label>
                <input
                  type="text"
                  required
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  placeholder="例如：中德智能制造工业互联网联合实验室"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">合作国别 *</label>
                  <select
                    value={projectFormData.country}
                    onChange={(e) => setProjectFormData({ ...projectFormData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="德国">德国</option>
                    <option value="新加坡">新加坡</option>
                    <option value="英国">英国</option>
                    <option value="瑞士">瑞士</option>
                    <option value="日本">日本</option>
                    <option value="法国">法国</option>
                    <option value="意大利">意大利</option>
                    <option value="俄罗斯">俄罗斯</option>
                    <option value="澳大利亚">澳大利亚</option>
                    <option value="其他国别">其他国别</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">专业领域 *</label>
                  <select
                    value={projectFormData.field}
                    onChange={(e) => setProjectFormData({ ...projectFormData, field: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="智能制造">智能制造</option>
                    <option value="新能源">新能源</option>
                    <option value="生物医药">生物医药</option>
                    <option value="数字经济">数字经济</option>
                    <option value="新材料">新材料</option>
                    <option value="现代农业">现代农业</option>
                    <option value="绿色低碳">绿色低碳</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">中方合作主体 *</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.chineseParty}
                    onChange={(e) => setProjectFormData({ ...projectFormData, chineseParty: e.target.value })}
                    placeholder="例如：清华大学科技开发部"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">外方合作主体 *</label>
                  <input
                    type="text"
                    required
                    value={projectFormData.foreignParty}
                    onChange={(e) => setProjectFormData({ ...projectFormData, foreignParty: e.target.value })}
                    placeholder="例如：慕尼黑工业大学科技转化院"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">执行周期</label>
                  <input
                    type="text"
                    value={projectFormData.period}
                    onChange={(e) => setProjectFormData({ ...projectFormData, period: e.target.value })}
                    placeholder="例如：2025.01 - 2027.12"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">进展状态</label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="进行中">进行中</option>
                    <option value="筹备中">筹备中</option>
                    <option value="已完成">已完成</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">项目合作亮点与简述</label>
                <textarea
                  rows={3}
                  value={projectFormData.desc}
                  onChange={(e) => setProjectFormData({ ...projectFormData, desc: e.target.value })}
                  placeholder="简述该项目的主要技术攻关方向、预期转化产值及国际协同成果..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingProject ? '保存修改' : '确认录入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          合作项目删除确认模态框
      ══════════════════════════════════════════════════════ */}
      {deleteTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">确认删除合作项目？</h3>
            <p className="text-xs text-slate-600">
              此操作将从 Firestore 数据库永久移除项目《{deleteTargetProject.name}》。
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={() => setDeleteTargetProject(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={handleConfirmDeleteProject}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                {isDeletingProject ? '正在删除...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          5大子模块条目编辑模态框
      ══════════════════════════════════════════════════════ */}
      {editingModalType && editingItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingModalType === 'region' && '编辑国别与区域合作'}
                {editingModalType === 'bri' && '编辑一带一路产教融合条目'}
                {editingModalType === 'activity' && '编辑涉外交流活动'}
                {editingModalType === 'need' && '编辑合作需求对接意向'}
                {editingModalType === 'org' && '编辑国际组织与机构'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingModalType(null);
                  setEditingItemData(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4 text-xs">
              {/* 国别与区域表单 */}
              {editingModalType === 'region' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">国家名称 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.country}
                      onChange={(e) => setEditingItemData({ ...editingItemData, country: e.target.value })}
                      placeholder="例如：德国 (Germany)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">标签 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.tag}
                      onChange={(e) => setEditingItemData({ ...editingItemData, tag: e.target.value })}
                      placeholder="例如：中欧工业创新"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">合作概况 *</label>
                    <textarea
                      rows={2}
                      required
                      value={editingItemData.overview}
                      onChange={(e) => setEditingItemData({ ...editingItemData, overview: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">政策环境提示 *</label>
                    <textarea
                      rows={2}
                      required
                      value={editingItemData.policyTip}
                      onChange={(e) => setEditingItemData({ ...editingItemData, policyTip: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">已有合作基础 *</label>
                    <textarea
                      rows={2}
                      required
                      value={editingItemData.foundation}
                      onChange={(e) => setEditingItemData({ ...editingItemData, foundation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </>
              )}

              {/* 一带一路表单 */}
              {editingModalType === 'bri' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">所属分类 *</label>
                      <select
                        value={editingItemData.category}
                        onChange={(e) => setEditingItemData({ ...editingItemData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      >
                        <option value="policy">政策指引</option>
                        <option value="project">示范项目</option>
                        <option value="activity">交流活动</option>
                        <option value="achievement">重点成果</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">时间 / 状态 / 机构</label>
                      <input
                        type="text"
                        value={editingItemData.dateOrStatus}
                        onChange={(e) => setEditingItemData({ ...editingItemData, dateOrStatus: e.target.value })}
                        placeholder="例如：2026-05 或 推进中"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">标题 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.title}
                      onChange={(e) => setEditingItemData({ ...editingItemData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">详细描述 *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItemData.summary}
                      onChange={(e) => setEditingItemData({ ...editingItemData, summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </>
              )}

              {/* 涉外交流活动表单 */}
              {editingModalType === 'activity' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">活动类型 *</label>
                      <select
                        value={editingItemData.type}
                        onChange={(e) => setEditingItemData({ ...editingItemData, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      >
                        <option value="出访">出访</option>
                        <option value="来访">来访</option>
                        <option value="论坛">论坛</option>
                        <option value="展会">展会</option>
                        <option value="培训">培训</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">活动状态 *</label>
                      <select
                        value={editingItemData.status}
                        onChange={(e) => setEditingItemData({ ...editingItemData, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      >
                        <option value="活动预告">活动预告</option>
                        <option value="活动纪要">活动纪要</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">活动标题 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.title}
                      onChange={(e) => setEditingItemData({ ...editingItemData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">活动日期 *</label>
                      <input
                        type="text"
                        required
                        value={editingItemData.date}
                        onChange={(e) => setEditingItemData({ ...editingItemData, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">活动地点 *</label>
                      <input
                        type="text"
                        required
                        value={editingItemData.location}
                        onChange={(e) => setEditingItemData({ ...editingItemData, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">活动内容详述 *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItemData.summary}
                      onChange={(e) => setEditingItemData({ ...editingItemData, summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </>
              )}

              {/* 合作需求对接表单 */}
              {editingModalType === 'need' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">发布主体属性 *</label>
                      <select
                        value={editingItemData.direction}
                        onChange={(e) => setEditingItemData({ ...editingItemData, direction: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      >
                        <option value="domestic">国内单位技术攻关需求</option>
                        <option value="overseas">海外机构来华对接意向</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">专业领域 *</label>
                      <input
                        type="text"
                        required
                        value={editingItemData.field}
                        onChange={(e) => setEditingItemData({ ...editingItemData, field: e.target.value })}
                        placeholder="例如：高端装备 / 智能制造"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">发布单位名称 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.publisher}
                      onChange={(e) => setEditingItemData({ ...editingItemData, publisher: e.target.value })}
                      placeholder="例如：华东某重点大学国家大学科技园"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">需求/意向标题 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.title}
                      onChange={(e) => setEditingItemData({ ...editingItemData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">详细描述 *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItemData.desc}
                      onChange={(e) => setEditingItemData({ ...editingItemData, desc: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">合作形式与有效期注记</label>
                    <input
                      type="text"
                      value={editingItemData.footerMeta}
                      onChange={(e) => setEditingItemData({ ...editingItemData, footerMeta: e.target.value })}
                      placeholder="发布周期：2026年Q3前有效 · 合作形式：联合研发"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </>
              )}

              {/* 国际组织与高校表单 */}
              {editingModalType === 'org' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">机构类别 *</label>
                      <select
                        value={editingItemData.category}
                        onChange={(e) => setEditingItemData({ ...editingItemData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      >
                        <option value="international_org">国际学术组织与创新联盟</option>
                        <option value="overseas_uni">海外友好高校与科技转化机构</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">国别 / 地点 *</label>
                      <input
                        type="text"
                        required
                        value={editingItemData.country}
                        onChange={(e) => setEditingItemData({ ...editingItemData, country: e.target.value })}
                        placeholder="例如：总部：西班牙 或 英国 牛津"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">机构名称 *</label>
                    <input
                      type="text"
                      required
                      value={editingItemData.name}
                      onChange={(e) => setEditingItemData({ ...editingItemData, name: e.target.value })}
                      placeholder="例如：国际大学科技园协会 (IASP)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">英文名称 / 简称</label>
                    <input
                      type="text"
                      value={editingItemData.sub}
                      onChange={(e) => setEditingItemData({ ...editingItemData, sub: e.target.value })}
                      placeholder="例如：International Association of Science Parks"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">机构合作简介 *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingItemData.desc}
                      onChange={(e) => setEditingItemData({ ...editingItemData, desc: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingModalType(null);
                    setEditingItemData(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                >
                  保存并同步
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          5大子模块删除确认模态框
      ══════════════════════════════════════════════════════ */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">确认删除该条目？</h3>
            <p className="text-xs text-slate-600">
              确定要删除条目《{deleteConfirmItem.title}》吗？删除后将自动保存并同步至前台。
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteItem}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置基底确认模态框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">确认恢复预设基底数据？</h3>
            <p className="text-xs text-slate-600">
              此操作将国别区域、一带一路、涉外活动、合作需求与国际组织恢复为系统默认的完整基底数据并立即写入数据库。
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
