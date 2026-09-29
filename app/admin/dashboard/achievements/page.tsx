'use client';

import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AchievementsContentData,
  defaultAchievementsContentData,
  TechItem,
  StandardItem,
  ReportItem,
  CaseItem,
  ExpertItem,
  TrainingItem,
} from '@/lib/achievementsData';

export default function AdminAchievementsPage() {
  // 6大子板块切换（与前台成果与智库频道 6 大锚点完全对应）
  const [activeTab, setActiveTab] = useState<
    'tech' | 'standards' | 'reports' | 'cases' | 'experts' | 'trainings'
  >('tech');

  // 成果与智库统一数据
  const [contentData, setContentData] = useState<AchievementsContentData>(defaultAchievementsContentData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 消息提示 Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 恢复初始假数据确认弹窗
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 实时订阅 siteConfig/achievements
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      const docRef = doc(db, 'siteConfig', 'achievements');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          clearTimeout(timer);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<AchievementsContentData>;
            setContentData({
              techItems: Array.isArray(data.techItems) && data.techItems.length > 0 ? data.techItems : defaultAchievementsContentData.techItems,
              standards: Array.isArray(data.standards) && data.standards.length > 0 ? data.standards : defaultAchievementsContentData.standards,
              reports: Array.isArray(data.reports) && data.reports.length > 0 ? data.reports : defaultAchievementsContentData.reports,
              cases: Array.isArray(data.cases) && data.cases.length > 0 ? data.cases : defaultAchievementsContentData.cases,
              experts: Array.isArray(data.experts) && data.experts.length > 0 ? data.experts : defaultAchievementsContentData.experts,
              trainings: Array.isArray(data.trainings) && data.trainings.length > 0 ? data.trainings : defaultAchievementsContentData.trainings,
            });
          } else {
            setContentData(defaultAchievementsContentData);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Achievements config snapshot fallback:', err);
          clearTimeout(timer);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error('Failed to setup achievements listener:', e);
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 统一持久化写入 Firestore
  const persistAchievements = async (newData: AchievementsContentData, successMsg: string) => {
    setSaving(true);
    try {
      const docRef = doc(db, 'siteConfig', 'achievements');
      await setDoc(docRef, newData, { merge: true });
      setContentData(newData);
      showToast(successMsg);
    } catch (err: any) {
      console.error('Save achievements error:', err);
      showToast('保存失败：' + (err.message || '请稍后重试'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // 恢复默认演示数据
  const handleResetToDefaults = async () => {
    setShowResetConfirm(false);
    await persistAchievements(defaultAchievementsContentData, '已成功恢复成果与智库的初始演示数据！');
  };

  // ──────────────────────────────────────────
  // 1. 科技成果与技术需求 状态与操作
  // ──────────────────────────────────────────
  const [techCategoryFilter, setTechCategoryFilter] = useState<'全部' | '科技成果' | '技术需求'>('全部');
  const [techSearch, setTechSearch] = useState('');
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechItem | null>(null);
  const [deleteTargetTech, setDeleteTargetTech] = useState<TechItem | null>(null);
  const [techFormData, setTechFormData] = useState<Omit<TechItem, 'id'>>({
    category: '科技成果',
    title: '',
    unit: '',
    field: '智能制造',
    maturity: 'TRL 7（样机验证）',
    status: '寻求转让',
    date: new Date().toISOString().slice(0, 7),
    summary: '',
    contact: '',
  });

  const handleOpenTechModal = (item?: TechItem) => {
    if (item) {
      setEditingTech(item);
      setTechFormData({
        category: item.category,
        title: item.title,
        unit: item.unit,
        field: item.field,
        maturity: item.maturity || '',
        status: item.status,
        date: item.date || new Date().toISOString().slice(0, 7),
        summary: item.summary,
        contact: item.contact,
      });
    } else {
      setEditingTech(null);
      setTechFormData({
        category: '科技成果',
        title: '',
        unit: '',
        field: '智能制造',
        maturity: 'TRL 7（样机验证）',
        status: '寻求转让',
        date: new Date().toISOString().slice(0, 7),
        summary: '',
        contact: '',
      });
    }
    setIsTechModalOpen(true);
  };

  const handleSaveTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techFormData.title.trim() || !techFormData.unit.trim()) {
      showToast('请完整填写项目名称与发布主体', 'error');
      return;
    }

    let updatedList: TechItem[];
    if (editingTech) {
      updatedList = contentData.techItems.map((item) =>
        item.id === editingTech.id ? { ...techFormData, id: editingTech.id } : item
      );
    } else {
      const newItem: TechItem = {
        ...techFormData,
        id: 'tech-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.techItems];
    }

    await persistAchievements(
      { ...contentData, techItems: updatedList },
      editingTech ? '成果/需求信息已更新' : '新成果/需求已成功添加'
    );
    setIsTechModalOpen(false);
  };

  const handleDeleteTech = async () => {
    if (!deleteTargetTech) return;
    const updatedList = contentData.techItems.filter((i) => i.id !== deleteTargetTech.id);
    await persistAchievements({ ...contentData, techItems: updatedList }, '已删除该成果/需求');
    setDeleteTargetTech(null);
  };

  // ──────────────────────────────────────────
  // 2. 团体标准 T/CAUI 状态与操作
  // ──────────────────────────────────────────
  const [standardSearch, setStandardSearch] = useState('');
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<StandardItem | null>(null);
  const [deleteTargetStandard, setDeleteTargetStandard] = useState<StandardItem | null>(null);
  const [standardFormData, setStandardFormData] = useState<Omit<StandardItem, 'id'>>({
    code: '',
    title: '',
    type: '批准发布',
    date: new Date().toISOString().slice(0, 10),
    desc: '',
    linkUrl: 'https://www.caui.org.cn/article/55_0_0_0.html?shId=624',
  });

  const handleOpenStandardModal = (item?: StandardItem) => {
    if (item) {
      setEditingStandard(item);
      setStandardFormData({
        code: item.code,
        title: item.title,
        type: item.type,
        date: item.date,
        desc: item.desc,
        linkUrl: item.linkUrl || '',
      });
    } else {
      setEditingStandard(null);
      setStandardFormData({
        code: 'T/CAUI ' + (Math.floor(Math.random() * 90) + 10) + '-2026',
        title: '',
        type: '批准发布',
        date: new Date().toISOString().slice(0, 10),
        desc: '',
        linkUrl: 'https://www.caui.org.cn/article/55_0_0_0.html?shId=624',
      });
    }
    setIsStandardModalOpen(true);
  };

  const handleSaveStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardFormData.code.trim() || !standardFormData.title.trim()) {
      showToast('请填写标准编号与标准名称', 'error');
      return;
    }

    let updatedList: StandardItem[];
    if (editingStandard) {
      updatedList = contentData.standards.map((item) =>
        item.id === editingStandard.id ? { ...standardFormData, id: editingStandard.id } : item
      );
    } else {
      const newItem: StandardItem = {
        ...standardFormData,
        id: 'std-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.standards];
    }

    await persistAchievements(
      { ...contentData, standards: updatedList },
      editingStandard ? '团体标准已更新' : '团体标准已添加'
    );
    setIsStandardModalOpen(false);
  };

  const handleDeleteStandard = async () => {
    if (!deleteTargetStandard) return;
    const updatedList = contentData.standards.filter((i) => i.id !== deleteTargetStandard.id);
    await persistAchievements({ ...contentData, standards: updatedList }, '已删除团体标准');
    setDeleteTargetStandard(null);
  };

  // ──────────────────────────────────────────
  // 3. 研究报告 状态与操作
  // ──────────────────────────────────────────
  const [reportSearch, setReportSearch] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [deleteTargetReport, setDeleteTargetReport] = useState<ReportItem | null>(null);
  const [reportFormData, setReportFormData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 7),
    tagsStr: '成果转化, 国际合作',
    unit: '国专委秘书处研究部',
    contact: 'secretariat@guozhuanwei.org.cn',
    summary: '',
  });

  const handleOpenReportModal = (item?: ReportItem) => {
    if (item) {
      setEditingReport(item);
      setReportFormData({
        title: item.title,
        date: item.date,
        tagsStr: item.tags ? item.tags.join(', ') : '',
        unit: item.unit || '国专委智库课题组',
        contact: item.contact || 'secretariat@guozhuanwei.org.cn',
        summary: item.summary,
      });
    } else {
      setEditingReport(null);
      setReportFormData({
        title: '',
        date: new Date().toISOString().slice(0, 7),
        tagsStr: '政策研究, 成果转化',
        unit: '国专委秘书处研究部',
        contact: 'secretariat@guozhuanwei.org.cn',
        summary: '',
      });
    }
    setIsReportModalOpen(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFormData.title.trim() || !reportFormData.summary.trim()) {
      showToast('请填写报告标题与核心摘要', 'error');
      return;
    }

    const tags = reportFormData.tagsStr
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const reportObj: Omit<ReportItem, 'id'> = {
      title: reportFormData.title.trim(),
      date: reportFormData.date.trim(),
      tags: tags.length > 0 ? tags : ['政策智库'],
      unit: reportFormData.unit.trim(),
      contact: reportFormData.contact.trim(),
      summary: reportFormData.summary.trim(),
    };

    let updatedList: ReportItem[];
    if (editingReport) {
      updatedList = contentData.reports.map((item) =>
        item.id === editingReport.id ? { ...reportObj, id: editingReport.id } : item
      );
    } else {
      const newItem: ReportItem = {
        ...reportObj,
        id: 'rep-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.reports];
    }

    await persistAchievements(
      { ...contentData, reports: updatedList },
      editingReport ? '研究报告已更新' : '新研究报告已添加'
    );
    setIsReportModalOpen(false);
  };

  const handleDeleteReport = async () => {
    if (!deleteTargetReport) return;
    const updatedList = contentData.reports.filter((i) => i.id !== deleteTargetReport.id);
    await persistAchievements({ ...contentData, reports: updatedList }, '已删除研究报告');
    setDeleteTargetReport(null);
  };

  // ──────────────────────────────────────────
  // 4. 典型案例 状态与操作
  // ──────────────────────────────────────────
  const [caseSearch, setCaseSearch] = useState('');
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [deleteTargetCase, setDeleteTargetCase] = useState<CaseItem | null>(null);
  const [caseFormData, setCaseFormData] = useState<Omit<CaseItem, 'id'>>({
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    title: '',
    unit: '',
    bg: '',
    path: '',
    result: '',
  });

  const handleOpenCaseModal = (item?: CaseItem) => {
    if (item) {
      setEditingCase(item);
      setCaseFormData({
        tag: item.tag,
        tagColor: item.tagColor || 'bg-blue-100 text-blue-800',
        title: item.title,
        unit: item.unit,
        bg: item.bg,
        path: item.path,
        result: item.result,
      });
    } else {
      setEditingCase(null);
      setCaseFormData({
        tag: '成果转化',
        tagColor: 'bg-emerald-100 text-emerald-800',
        title: '',
        unit: '',
        bg: '',
        path: '',
        result: '',
      });
    }
    setIsCaseModalOpen(true);
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseFormData.title.trim() || !caseFormData.unit.trim()) {
      showToast('请填写案例标题与合作单位', 'error');
      return;
    }

    let updatedList: CaseItem[];
    if (editingCase) {
      updatedList = contentData.cases.map((item) =>
        item.id === editingCase.id ? { ...caseFormData, id: editingCase.id } : item
      );
    } else {
      const newItem: CaseItem = {
        ...caseFormData,
        id: 'case-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.cases];
    }

    await persistAchievements(
      { ...contentData, cases: updatedList },
      editingCase ? '典型案例已更新' : '典型案例已录入'
    );
    setIsCaseModalOpen(false);
  };

  const handleDeleteCase = async () => {
    if (!deleteTargetCase) return;
    const updatedList = contentData.cases.filter((i) => i.id !== deleteTargetCase.id);
    await persistAchievements({ ...contentData, cases: updatedList }, '已删除典型案例');
    setDeleteTargetCase(null);
  };

  // ──────────────────────────────────────────
  // 5. 专家库 状态与操作
  // ──────────────────────────────────────────
  const [expertSearch, setExpertSearch] = useState('');
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<ExpertItem | null>(null);
  const [deleteTargetExpert, setDeleteTargetExpert] = useState<ExpertItem | null>(null);
  const [expertFormData, setExpertFormData] = useState<Omit<ExpertItem, 'id'>>({
    name: '',
    title: '教授 / 技术经纪人',
    unit: '',
    field: '智能制造',
    country: '中国',
    langs: '中 / 英',
  });

  const handleOpenExpertModal = (item?: ExpertItem) => {
    if (item) {
      setEditingExpert(item);
      setExpertFormData({
        name: item.name,
        title: item.title,
        unit: item.unit,
        field: item.field,
        country: item.country,
        langs: item.langs,
      });
    } else {
      setEditingExpert(null);
      setExpertFormData({
        name: '',
        title: '教授 / 专家顾问',
        unit: '',
        field: '智能制造',
        country: '中国',
        langs: '中 / 英',
      });
    }
    setIsExpertModalOpen(true);
  };

  const handleSaveExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertFormData.name.trim() || !expertFormData.unit.trim()) {
      showToast('请填写专家姓名与所属单位', 'error');
      return;
    }

    let updatedList: ExpertItem[];
    if (editingExpert) {
      updatedList = contentData.experts.map((item) =>
        item.id === editingExpert.id ? { ...expertFormData, id: editingExpert.id } : item
      );
    } else {
      const newItem: ExpertItem = {
        ...expertFormData,
        id: 'exp-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.experts];
    }

    await persistAchievements(
      { ...contentData, experts: updatedList },
      editingExpert ? '专家信息已更新' : '新专家已录入在库'
    );
    setIsExpertModalOpen(false);
  };

  const handleDeleteExpert = async () => {
    if (!deleteTargetExpert) return;
    const updatedList = contentData.experts.filter((i) => i.id !== deleteTargetExpert.id);
    await persistAchievements({ ...contentData, experts: updatedList }, '已移除该在库专家');
    setDeleteTargetExpert(null);
  };

  // ──────────────────────────────────────────
  // 6. 培训与人才 状态与操作
  // ──────────────────────────────────────────
  const [trainingTypeFilter, setTrainingTypeFilter] = useState<'全部' | '课程预告' | '精彩回顾'>('全部');
  const [trainingSearch, setTrainingSearch] = useState('');
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingItem | null>(null);
  const [deleteTargetTraining, setDeleteTargetTraining] = useState<TrainingItem | null>(null);
  const [trainingFormData, setTrainingFormData] = useState<Omit<TrainingItem, 'id'>>({
    type: '课程预告',
    tag: '涉外业务',
    date: new Date().toISOString().slice(0, 10),
    title: '',
    location: '北京·线下+直播',
    desc: '',
  });

  const handleOpenTrainingModal = (item?: TrainingItem) => {
    if (item) {
      setEditingTraining(item);
      setTrainingFormData({
        type: item.type,
        tag: item.tag,
        date: item.date,
        title: item.title,
        location: item.location,
        desc: item.desc,
      });
    } else {
      setEditingTraining(null);
      setTrainingFormData({
        type: '课程预告',
        tag: '涉外业务',
        date: new Date().toISOString().slice(0, 10),
        title: '',
        location: '北京·线下+直播',
        desc: '',
      });
    }
    setIsTrainingModalOpen(true);
  };

  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingFormData.title.trim() || !trainingFormData.desc.trim()) {
      showToast('请填写培训项目名称与简要说明', 'error');
      return;
    }

    let updatedList: TrainingItem[];
    if (editingTraining) {
      updatedList = contentData.trainings.map((item) =>
        item.id === editingTraining.id ? { ...trainingFormData, id: editingTraining.id } : item
      );
    } else {
      const newItem: TrainingItem = {
        ...trainingFormData,
        id: 'trn-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.trainings];
    }

    await persistAchievements(
      { ...contentData, trainings: updatedList },
      editingTraining ? '培训项目已更新' : '培训项目已发布'
    );
    setIsTrainingModalOpen(false);
  };

  const handleDeleteTraining = async () => {
    if (!deleteTargetTraining) return;
    const updatedList = contentData.trainings.filter((i) => i.id !== deleteTargetTraining.id);
    await persistAchievements({ ...contentData, trainings: updatedList }, '已删除该培训项目');
    setDeleteTargetTraining(null);
  };

  // 页面加载中指示
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">正在载入成果与智库数据...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 提示 Toast ─── */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* ─── 顶部标题与恢复按钮 ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">成果与智库管理</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            统一维护成果与智库平台全部 6 大板块，修改后前台页面将实时无刷新自动同步。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="将所有板块重置为官方预置演示假数据"
          >
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            恢复初始演示数据
          </button>
        </div>
      </div>

      {/* ─── 6 大核心子栏目切换（与用户截图完全对应） ─── */}
      <div className="flex items-center space-x-1 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'tech', label: '科技成果与技术需求', count: contentData.techItems.length },
          { id: 'standards', label: '团体标准 T/CAUI', count: contentData.standards.length },
          { id: 'reports', label: '研究报告', count: contentData.reports.length },
          { id: 'cases', label: '典型案例', count: contentData.cases.length },
          { id: 'experts', label: '专家库', count: contentData.experts.length },
          { id: 'trainings', label: '培训与人才', count: contentData.trainings.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Tab 1: 科技成果与技术需求
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'tech' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['全部', '科技成果', '技术需求'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTechCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    techCategoryFilter === cat
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}{' '}
                  {cat === '全部'
                    ? `(${contentData.techItems.length})`
                    : `(${contentData.techItems.filter((i) => i.category === cat).length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                placeholder="搜索名称 / 发布单位 / 领域..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleOpenTechModal()}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                + 新增成果或需求
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">类别</th>
                  <th className="px-4 py-3 font-semibold min-w-[200px]">名称</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">研发 / 发布主体</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">技术领域</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">阶段 / 意向</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">联络方式</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contentData.techItems
                  .filter((item) => {
                    if (techCategoryFilter !== '全部' && item.category !== techCategoryFilter) return false;
                    if (techSearch) {
                      const kw = techSearch.toLowerCase();
                      return (
                        item.title.toLowerCase().includes(kw) ||
                        item.unit.toLowerCase().includes(kw) ||
                        item.field.toLowerCase().includes(kw)
                      );
                    }
                    return true;
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.category === '科技成果'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.summary}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{item.unit}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {item.field}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-slate-800">{item.maturity || '-'}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">{item.status}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-mono">
                        {item.contact || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenTechModal(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetTech(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 2: 团体标准 T/CAUI
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'standards' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理 T/CAUI 团体标准条目，包含标准编号、名称、发布日期及全文外链。
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={standardSearch}
                onChange={(e) => setStandardSearch(e.target.value)}
                placeholder="搜索标准编号 / 标题..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleOpenStandardModal()}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                + 新增团体标准
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {contentData.standards
              .filter((s) => {
                if (standardSearch) {
                  const kw = standardSearch.toLowerCase();
                  return s.code.toLowerCase().includes(kw) || s.title.toLowerCase().includes(kw);
                }
                return true;
              })
              .map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-900">{s.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {s.type}
                      </span>
                      <span className="text-xs text-slate-400">发布日期：{s.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">《{s.title}》</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                    {s.linkUrl && (
                      <div className="text-[11px] text-blue-600 break-all font-mono">
                        链接：{s.linkUrl}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenStandardModal(s)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetStandard(s)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 3: 研究报告
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理智库报告列表，前台用户可查看报告核心摘要及对接领取方式。
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="搜索报告标题 / 标签..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleOpenReportModal()}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                + 新增研究报告
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentData.reports
              .filter((r) => {
                if (reportSearch) {
                  const kw = reportSearch.toLowerCase();
                  return (
                    r.title.toLowerCase().includes(kw) ||
                    (r.tags && r.tags.some((t) => t.toLowerCase().includes(kw)))
                  );
                }
                return true;
              })
              .map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.tags &&
                        r.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      <span className="text-xs text-slate-400 ml-auto font-mono">{r.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{r.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{r.summary}</p>
                    <div className="text-[11px] text-slate-500">
                      发布主体：{r.unit || '国专委智库课题组'} · 对接：{r.contact || '-'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(r)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetReport(r)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 4: 典型案例
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'cases' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理高校国际技术转移与转化典型案例（背景、路径与成效）。
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
                placeholder="搜索案例标题 / 合作单位..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleOpenCaseModal()}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                + 新增典型案例
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {contentData.cases
              .filter((c) => {
                if (caseSearch) {
                  const kw = caseSearch.toLowerCase();
                  return c.title.toLowerCase().includes(kw) || c.unit.toLowerCase().includes(kw);
                }
                return true;
              })
              .map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          c.tagColor || 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.tag}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{c.unit}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCaseModal(c)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetCase(c)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-semibold text-slate-700 block">案例背景</span>
                      <p className="text-slate-600 leading-relaxed">{c.bg}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/60 space-y-1">
                      <span className="font-semibold text-blue-800 block">转化路径</span>
                      <p className="text-blue-700 leading-relaxed">{c.path}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 space-y-1">
                      <span className="font-semibold text-emerald-800 block">取得成效</span>
                      <p className="text-emerald-700 leading-relaxed">{c.result}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 5: 专家库
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'experts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理智库专家库成员（姓名、职称、所属单位、专业领域与工作语言）。
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={expertSearch}
                onChange={(e) => setExpertSearch(e.target.value)}
                placeholder="搜索专家姓名 / 领域 / 国别..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleOpenExpertModal()}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                + 新增在库专家
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentData.experts
              .filter((e) => {
                if (expertSearch) {
                  const kw = expertSearch.toLowerCase();
                  return (
                    e.name.toLowerCase().includes(kw) ||
                    e.field.toLowerCase().includes(kw) ||
                    e.country.toLowerCase().includes(kw) ||
                    e.unit.toLowerCase().includes(kw)
                  );
                }
                return true;
              })
              .map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 text-center"
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-800 to-slate-700 text-white flex items-center justify-center text-sm font-bold mx-auto shadow-xs">
                      {e.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{e.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{e.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5 font-medium">{e.unit}</div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                        {e.field}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {e.country}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">语言：{e.langs}</div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenExpertModal(e)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetExpert(e)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 6: 培训与人才
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'trainings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['全部', '课程预告', '精彩回顾'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrainingTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    trainingTypeFilter === t
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}{' '}
                  {t === '全部'
                    ? `(${contentData.trainings.length})`
                    : `(${contentData.trainings.filter((i) => i.type === t).length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={trainingSearch}
                onChange={(e) => setTrainingSearch(e.target.value)}
                placeholder="搜索培训标题 / 标签 / 地点..."
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
              <button
                type="button"
                onClick={() => handleOpenTrainingModal()}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                + 新增培训项目
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {contentData.trainings
              .filter((tr) => {
                if (trainingTypeFilter !== '全部' && tr.type !== trainingTypeFilter) return false;
                if (trainingSearch) {
                  const kw = trainingSearch.toLowerCase();
                  return (
                    tr.title.toLowerCase().includes(kw) ||
                    tr.tag.toLowerCase().includes(kw) ||
                    tr.location.toLowerCase().includes(kw)
                  );
                }
                return true;
              })
              .map((tr) => (
                <div
                  key={tr.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    tr.type === '课程预告'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-emerald-200 bg-emerald-50/20'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold border ${
                          tr.type === '课程预告'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {tr.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                        {tr.tag}
                      </span>
                      <span className="text-xs text-slate-500">
                        📅 {tr.date} · 📍 {tr.location}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{tr.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{tr.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenTrainingModal(tr)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetTraining(tr)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 科技成果与技术需求录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isTechModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveTech} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingTech ? '编辑成果/需求' : '新增科技成果或技术需求'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTechModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">类别 *</label>
                  <select
                    value={techFormData.category}
                    onChange={(e) =>
                      setTechFormData({ ...techFormData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="科技成果">科技成果（供方）</option>
                    <option value="技术需求">技术需求（需方）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">技术领域 *</label>
                  <input
                    type="text"
                    value={techFormData.field}
                    onChange={(e) => setTechFormData({ ...techFormData, field: e.target.value })}
                    placeholder="如：智能制造 / 新能源材料"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">项目名称 *</label>
                  <input
                    type="text"
                    value={techFormData.title}
                    onChange={(e) => setTechFormData({ ...techFormData, title: e.target.value })}
                    placeholder="输入成果或需求完整标题"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">研发 / 发布单位 *</label>
                  <input
                    type="text"
                    value={techFormData.unit}
                    onChange={(e) => setTechFormData({ ...techFormData, unit: e.target.value })}
                    placeholder="如：清华大学精密仪器系"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">阶段 / 成熟度</label>
                  <input
                    type="text"
                    value={techFormData.maturity}
                    onChange={(e) => setTechFormData({ ...techFormData, maturity: e.target.value })}
                    placeholder="如：TRL 7（样机验证）"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">状态 / 转化意向</label>
                  <input
                    type="text"
                    value={techFormData.status}
                    onChange={(e) => setTechFormData({ ...techFormData, status: e.target.value })}
                    placeholder="如：寻求转让 / 需求发布中"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">发布年月</label>
                  <input
                    type="text"
                    value={techFormData.date}
                    onChange={(e) => setTechFormData({ ...techFormData, date: e.target.value })}
                    placeholder="如：2026-06"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">对接联络方式</label>
                  <input
                    type="text"
                    value={techFormData.contact}
                    onChange={(e) => setTechFormData({ ...techFormData, contact: e.target.value })}
                    placeholder="电话或邮箱"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">详细描述 / 合作说明</label>
                  <textarea
                    rows={4}
                    value={techFormData.summary}
                    onChange={(e) => setTechFormData({ ...techFormData, summary: e.target.value })}
                    placeholder="成果核心技术突破或具体对接合作诉求简述..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTechModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 团体标准录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isStandardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveStandard} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingStandard ? '编辑团体标准' : '新增团体标准'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsStandardModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">标准编号 *</label>
                  <input
                    type="text"
                    value={standardFormData.code}
                    onChange={(e) =>
                      setStandardFormData({ ...standardFormData, code: e.target.value })
                    }
                    placeholder="如：T/CAUI 016-2025"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">状态 / 类型 *</label>
                  <input
                    type="text"
                    value={standardFormData.type}
                    onChange={(e) =>
                      setStandardFormData({ ...standardFormData, type: e.target.value })
                    }
                    placeholder="如：批准发布"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">标准名称 *</label>
                  <input
                    type="text"
                    value={standardFormData.title}
                    onChange={(e) =>
                      setStandardFormData({ ...standardFormData, title: e.target.value })
                    }
                    placeholder="如：智慧型高等院校科技孵化中心建设指南"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">发布日期</label>
                  <input
                    type="date"
                    value={standardFormData.date}
                    onChange={(e) =>
                      setStandardFormData({ ...standardFormData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">全文入口链接</label>
                  <input
                    type="url"
                    value={standardFormData.linkUrl}
                    onChange={(e) =>
                      setStandardFormData({ ...standardFormData, linkUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">标准简介与适用范围</label>
                  <textarea
                    rows={4}
                    value={standardFormData.desc}
                    onChange={(e) =>
                      setStandardFormData({ ...standardFormData, desc: e.target.value })
                    }
                    placeholder="简要概括本标准规范要点..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStandardModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 研究报告录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveReport} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingReport ? '编辑研究报告' : '新增研究报告'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">报告标题 *</label>
                  <input
                    type="text"
                    value={reportFormData.title}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, title: e.target.value })
                    }
                    placeholder="如：2026年中国高校科技成果海外转化白皮书"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">发布年月 *</label>
                  <input
                    type="text"
                    value={reportFormData.date}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, date: e.target.value })
                    }
                    placeholder="如：2026-07"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={reportFormData.tagsStr}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, tagsStr: e.target.value })
                    }
                    placeholder="如：成果转化, 国际合作"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">发布机构 / 研制团队</label>
                  <input
                    type="text"
                    value={reportFormData.unit}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, unit: e.target.value })
                    }
                    placeholder="如：国专委秘书处研究部"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">联络领取方式</label>
                  <input
                    type="text"
                    value={reportFormData.contact}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, contact: e.target.value })
                    }
                    placeholder="邮箱或说明"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">报告核心摘要 *</label>
                  <textarea
                    rows={4}
                    value={reportFormData.summary}
                    onChange={(e) =>
                      setReportFormData({ ...reportFormData, summary: e.target.value })
                    }
                    placeholder="系统梳理核心观点、政策建议与关键数据..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 典型案例录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveCase} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCase ? '编辑典型案例' : '新增典型案例'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">案例分类标签 *</label>
                  <input
                    type="text"
                    value={caseFormData.tag}
                    onChange={(e) => setCaseFormData({ ...caseFormData, tag: e.target.value })}
                    placeholder="如：国际合作 / 成果转化"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">合作单位 *</label>
                  <input
                    type="text"
                    value={caseFormData.unit}
                    onChange={(e) => setCaseFormData({ ...caseFormData, unit: e.target.value })}
                    placeholder="如：清华大学 × 慕尼黑工业大学"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">案例标题 *</label>
                  <input
                    type="text"
                    value={caseFormData.title}
                    onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                    placeholder="如：中德机器人感知算法离岸联合验证..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">案例背景</label>
                  <textarea
                    rows={2}
                    value={caseFormData.bg}
                    onChange={(e) => setCaseFormData({ ...caseFormData, bg: e.target.value })}
                    placeholder="双方前期基础及合作动机..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">转化路径</label>
                  <textarea
                    rows={2}
                    value={caseFormData.path}
                    onChange={(e) => setCaseFormData({ ...caseFormData, path: e.target.value })}
                    placeholder="协议签署 → 离岸验证 → 商业落地..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">取得成效</label>
                  <textarea
                    rows={2}
                    value={caseFormData.result}
                    onChange={(e) => setCaseFormData({ ...caseFormData, result: e.target.value })}
                    placeholder="授权专利、商业许可收益或经济社会效益..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 专家库录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isExpertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveExpert} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingExpert ? '编辑在库专家' : '新增在库专家'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsExpertModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">专家姓名 *</label>
                  <input
                    type="text"
                    value={expertFormData.name}
                    onChange={(e) =>
                      setExpertFormData({ ...expertFormData, name: e.target.value })
                    }
                    placeholder="如：张明远 / Prof. Hans Müller"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">职称 / 职务</label>
                  <input
                    type="text"
                    value={expertFormData.title}
                    onChange={(e) =>
                      setExpertFormData({ ...expertFormData, title: e.target.value })
                    }
                    placeholder="如：教授 / 技术经纪人"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">所属单位 *</label>
                  <input
                    type="text"
                    value={expertFormData.unit}
                    onChange={(e) =>
                      setExpertFormData({ ...expertFormData, unit: e.target.value })
                    }
                    placeholder="如：清华大学技术转移研究院"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">专业领域 *</label>
                  <input
                    type="text"
                    value={expertFormData.field}
                    onChange={(e) =>
                      setExpertFormData({ ...expertFormData, field: e.target.value })
                    }
                    placeholder="如：智能制造 / 技术转移"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">国别 *</label>
                  <input
                    type="text"
                    value={expertFormData.country}
                    onChange={(e) =>
                      setExpertFormData({ ...expertFormData, country: e.target.value })
                    }
                    placeholder="如：中国 / 德国 / 新加坡"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">工作语言</label>
                  <input
                    type="text"
                    value={expertFormData.langs}
                    onChange={(e) =>
                      setExpertFormData({ ...expertFormData, langs: e.target.value })
                    }
                    placeholder="如：中 / 英 / 德"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpertModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 培训与人才录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveTraining} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingTraining ? '编辑培训项目' : '新增培训项目'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">培训类别 *</label>
                  <select
                    value={trainingFormData.type}
                    onChange={(e) =>
                      setTrainingFormData({ ...trainingFormData, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="课程预告">课程预告</option>
                    <option value="精彩回顾">精彩回顾</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">业务标签 *</label>
                  <input
                    type="text"
                    value={trainingFormData.tag}
                    onChange={(e) =>
                      setTrainingFormData({ ...trainingFormData, tag: e.target.value })
                    }
                    placeholder="如：涉外业务 / 国际合作实务"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">培训名称 *</label>
                  <input
                    type="text"
                    value={trainingFormData.title}
                    onChange={(e) =>
                      setTrainingFormData({ ...trainingFormData, title: e.target.value })
                    }
                    placeholder="输入培训班/研修班全称"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">举办日期</label>
                  <input
                    type="text"
                    value={trainingFormData.date}
                    onChange={(e) =>
                      setTrainingFormData({ ...trainingFormData, date: e.target.value })
                    }
                    placeholder="如：2026-10-15"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">地点 / 形式</label>
                  <input
                    type="text"
                    value={trainingFormData.location}
                    onChange={(e) =>
                      setTrainingFormData({ ...trainingFormData, location: e.target.value })
                    }
                    placeholder="如：北京·线下+直播"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">培训简介 / 活动总结 *</label>
                  <textarea
                    rows={4}
                    value={trainingFormData.desc}
                    onChange={(e) =>
                      setTrainingFormData({ ...trainingFormData, desc: e.target.value })
                    }
                    placeholder="简要描述培训主讲师资、主要内容或参训成效..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 删除确认弹窗（Tailwind 原生，无 alert/confirm）
      ══════════════════════════════════════════════════════════════ */}
      {(deleteTargetTech ||
        deleteTargetStandard ||
        deleteTargetReport ||
        deleteTargetCase ||
        deleteTargetExpert ||
        deleteTargetTraining) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">确认删除该项目？</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                删除后将立即生效并在前台成果与智库频道中隐藏。
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetTech(null);
                  setDeleteTargetStandard(null);
                  setDeleteTargetReport(null);
                  setDeleteTargetCase(null);
                  setDeleteTargetExpert(null);
                  setDeleteTargetTraining(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTargetTech) handleDeleteTech();
                  else if (deleteTargetStandard) handleDeleteStandard();
                  else if (deleteTargetReport) handleDeleteReport();
                  else if (deleteTargetCase) handleDeleteCase();
                  else if (deleteTargetExpert) handleDeleteExpert();
                  else if (deleteTargetTraining) handleDeleteTraining();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 恢复初始假数据确认弹窗（Tailwind 原生，无 alert/confirm）
      ══════════════════════════════════════════════════════════════ */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">恢复初始假数据确认</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                此操作将把“科技成果与技术需求、团体标准、研究报告、典型案例、专家库、培训与人才”全部重置为原有的前台演示假数据，您之后仍可在后台自由修改。
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
              >
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
