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
  MembersPageContentData,
  defaultMembersContentData,
  MemberStoryItem,
  MemberServiceItem,
  MemberGuideProcessStep,
} from '@/lib/membersData';

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
  // 4大核心子板块切换（与前台“会员单位与服务”四大锚点完全对齐）
  const [activeTab, setActiveTab] = useState<'directory' | 'stories' | 'guide' | 'services'>('directory');

  // ──────────────────────────────────────────
  // 1. 会员单位名录状态（Firestore members 集合）
  // ──────────────────────────────────────────
  const [membersList, setMembersList] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [deleteTargetMember, setDeleteTargetMember] = useState<MemberItem | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    type: '高等院校',
    region: '北京',
    level: '理事会员单位',
    annualCheck: '已通过 (2026)',
    contact: '',
    desc: '',
  });
  const [submittingMember, setSubmittingMember] = useState(false);

  // ──────────────────────────────────────────
  // 2. 会员频道其余3大板块状态（siteConfig/members）
  // ──────────────────────────────────────────
  const [contentData, setContentData] = useState<MembersPageContentData>(defaultMembersContentData);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 会员风采模态框
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<MemberStoryItem | null>(null);
  const [deleteTargetStory, setDeleteTargetStory] = useState<MemberStoryItem | null>(null);
  const [storyFormData, setStoryFormData] = useState<Omit<MemberStoryItem, 'id'>>({
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '',
    title: '',
    summary: '',
    date: new Date().toISOString().slice(0, 7),
  });

  // 服务事项模态框
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MemberServiceItem | null>(null);
  const [deleteTargetService, setDeleteTargetService] = useState<MemberServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Omit<MemberServiceItem, 'id'>>({
    service: '',
    method: '',
    contact: '',
    materials: '',
  });

  // 入会指引编辑状态
  const [guideForm, setGuideForm] = useState(defaultMembersContentData.guide);
  const [newConditionText, setNewConditionText] = useState('');
  const [newMaterialText, setNewMaterialText] = useState('');
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepFormData, setStepFormData] = useState({ step: '', desc: '' });

  // 吐司提示
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅 1：members 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const timer = setTimeout(() => {
      setLoadingMembers(false);
    }, 4000);

    try {
      const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timer);
          const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MemberItem, 'id'>),
          }));
          setMembersList(list);
          setLoadingMembers(false);
        },
        (err) => {
          console.warn('Members ordered query fallback to basic snapshot:', err);
          unsubscribe = onSnapshot(
            collection(db, 'members'),
            (snapshot) => {
              clearTimeout(timer);
              const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<MemberItem, 'id'>),
              }));
              setMembersList(list);
              setLoadingMembers(false);
            },
            (fallbackErr) => {
              console.warn('Members fallback snapshot error:', fallbackErr);
              clearTimeout(timer);
              setLoadingMembers(false);
            }
          );
        }
      );
    } catch (e) {
      console.error('Failed to setup members listener:', e);
      clearTimeout(timer);
      setLoadingMembers(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 实时订阅 2：siteConfig/members 文档
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    const timer = setTimeout(() => {
      setLoadingConfig(false);
    }, 4000);

    try {
      const docRef = doc(db, 'siteConfig', 'members');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          clearTimeout(timer);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<MembersPageContentData>;
            const merged: MembersPageContentData = {
              stories: data.stories || defaultMembersContentData.stories,
              guide: data.guide || defaultMembersContentData.guide,
              services: data.services || defaultMembersContentData.services,
            };
            setContentData(merged);
            setGuideForm(merged.guide);
          } else {
            setContentData(defaultMembersContentData);
            setGuideForm(defaultMembersContentData.guide);
          }
          setLoadingConfig(false);
        },
        (err) => {
          console.warn('Members config snapshot fallback:', err);
          clearTimeout(timer);
          setLoadingConfig(false);
        }
      );
    } catch (e) {
      console.error('Members config listener err:', e);
      clearTimeout(timer);
      setLoadingConfig(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 保存其余3大板块数据到 Firestore
  const handleSaveContentConfig = async (overrideData?: MembersPageContentData) => {
    setSavingConfig(true);
    try {
      const docRef = doc(db, 'siteConfig', 'members');
      await setDoc(
        docRef,
        {
          ...(overrideData || contentData),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      showToast('会员单位与服务配置已成功发布！前台已实时更新。', 'success');
    } catch (err: any) {
      console.error('Save members config error:', err);
      showToast(`保存失败：${err?.message || '请检查网络'}`, 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // 恢复其余3大板块为默认基底数据
  const handleResetToDefault = async () => {
    const cloned = JSON.parse(JSON.stringify(defaultMembersContentData));
    setContentData(cloned);
    setGuideForm(cloned.guide);
    setShowResetConfirm(false);
    await handleSaveContentConfig(defaultMembersContentData);
    showToast('已成功恢复前台原始假数据至后台！');
  };

  // ──────────────────────────────────────────
  // 1. 会员单位名录 CRUD
  // ──────────────────────────────────────────
  const handleOpenCreateMember = () => {
    setEditingMember(null);
    setMemberFormData({
      name: '',
      type: '高等院校',
      region: '北京',
      level: '理事会员单位',
      annualCheck: '已通过 (2026)',
      contact: '',
      desc: '',
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (item: MemberItem) => {
    setEditingMember(item);
    setMemberFormData({
      name: item.name || '',
      type: item.type || '高等院校',
      region: item.region || '北京',
      level: item.level || '理事会员单位',
      annualCheck: item.annualCheck || '已通过 (2026)',
      contact: item.contact || '',
      desc: item.desc || '',
    });
    setIsMemberModalOpen(true);
  };

  const handleSubmitMemberForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.name.trim() || !memberFormData.contact.trim()) {
      showToast('请完整填写单位名称与对接人联系方式', 'error');
      return;
    }

    setSubmittingMember(true);
    try {
      if (editingMember) {
        const docRef = doc(db, 'members', editingMember.id);
        await updateDoc(docRef, {
          name: memberFormData.name.trim(),
          type: memberFormData.type,
          region: memberFormData.region,
          level: memberFormData.level,
          annualCheck: memberFormData.annualCheck,
          contact: memberFormData.contact.trim(),
          desc: memberFormData.desc.trim(),
          updatedAt: serverTimestamp(),
        });
        showToast('会员单位信息已成功更新！');
      } else {
        await addDoc(collection(db, 'members'), {
          name: memberFormData.name.trim(),
          type: memberFormData.type,
          region: memberFormData.region,
          level: memberFormData.level,
          annualCheck: memberFormData.annualCheck,
          contact: memberFormData.contact.trim(),
          desc: memberFormData.desc.trim(),
          createdAt: serverTimestamp(),
        });
        showToast('新会员单位录入成功！已存入数据库。');
      }
      setIsMemberModalOpen(false);
    } catch (error: any) {
      console.error('Submit member error:', error);
      showToast(error?.message || '操作失败，请检查网络或权限', 'error');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!deleteTargetMember) return;
    setIsDeletingMember(true);
    try {
      await deleteDoc(doc(db, 'members', deleteTargetMember.id));
      showToast(`已成功删除会员单位《${deleteTargetMember.name}》`);
      setDeleteTargetMember(null);
    } catch (error: any) {
      console.error('Delete member error:', error);
      showToast(error?.message || '删除失败，请稍后重试', 'error');
    } finally {
      setIsDeletingMember(false);
    }
  };

  // ──────────────────────────────────────────
  // 2. 会员单位风采 CRUD
  // ──────────────────────────────────────────
  const handleOpenCreateStory = () => {
    setEditingStory(null);
    setStoryFormData({
      tag: '成果转化',
      tagColor: 'bg-emerald-100 text-emerald-800',
      unit: '',
      title: '',
      summary: '',
      date: new Date().toISOString().slice(0, 7),
    });
    setIsStoryModalOpen(true);
  };

  const handleOpenEditStory = (story: MemberStoryItem) => {
    setEditingStory(story);
    setStoryFormData({
      tag: story.tag,
      tagColor: story.tagColor || (story.tag === '国际合作' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'),
      unit: story.unit,
      title: story.title,
      summary: story.summary,
      date: story.date,
    });
    setIsStoryModalOpen(true);
  };

  const handleSubmitStoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFormData.title.trim() || !storyFormData.unit.trim()) {
      showToast('请完整填写案例标题与示范会员单位', 'error');
      return;
    }

    const color = storyFormData.tag === '国际合作' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';
    let updatedStories = [...contentData.stories];

    if (editingStory) {
      const idx = updatedStories.findIndex((s) => s.id === editingStory.id);
      if (idx >= 0) {
        updatedStories[idx] = {
          ...editingStory,
          ...storyFormData,
          tagColor: color,
        };
      }
    } else {
      const newStory: MemberStoryItem = {
        id: `story-${Date.now()}`,
        ...storyFormData,
        tagColor: color,
      };
      updatedStories = [newStory, ...updatedStories];
    }

    const updatedData: MembersPageContentData = {
      ...contentData,
      stories: updatedStories,
    };
    setContentData(updatedData);
    setIsStoryModalOpen(false);
    await handleSaveContentConfig(updatedData);
  };

  const handleConfirmDeleteStory = async () => {
    if (!deleteTargetStory) return;
    const updatedStories = contentData.stories.filter((s) => s.id !== deleteTargetStory.id);
    const updatedData: MembersPageContentData = {
      ...contentData,
      stories: updatedStories,
    };
    setContentData(updatedData);
    setDeleteTargetStory(null);
    await handleSaveContentConfig(updatedData);
    showToast(`已成功删除风采案例《${deleteTargetStory.title}》`);
  };

  // ──────────────────────────────────────────
  // 3. 入会指引配置
  // ──────────────────────────────────────────
  const handleSaveGuideConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedData: MembersPageContentData = {
      ...contentData,
      guide: guideForm,
    };
    setContentData(updatedData);
    await handleSaveContentConfig(updatedData);
  };

  const handleAddCondition = () => {
    if (!newConditionText.trim()) return;
    const updatedConditions = [...guideForm.conditions, newConditionText.trim()];
    const updatedGuide = { ...guideForm, conditions: updatedConditions };
    setGuideForm(updatedGuide);
    setNewConditionText('');
  };

  const handleDeleteCondition = (index: number) => {
    const updatedConditions = guideForm.conditions.filter((_, idx) => idx !== index);
    setGuideForm({ ...guideForm, conditions: updatedConditions });
  };

  const handleAddMaterial = () => {
    if (!newMaterialText.trim()) return;
    const updatedMaterials = [...guideForm.materials, newMaterialText.trim()];
    const updatedGuide = { ...guideForm, materials: updatedMaterials };
    setGuideForm(updatedGuide);
    setNewMaterialText('');
  };

  const handleDeleteMaterial = (index: number) => {
    const updatedMaterials = guideForm.materials.filter((_, idx) => idx !== index);
    setGuideForm({ ...guideForm, materials: updatedMaterials });
  };

  const handleOpenCreateStep = () => {
    setEditingStepIndex(null);
    setStepFormData({ step: '', desc: '' });
    setIsStepModalOpen(true);
  };

  const handleOpenEditStep = (step: MemberGuideProcessStep, index: number) => {
    setEditingStepIndex(index);
    setStepFormData({ step: step.step, desc: step.desc });
    setIsStepModalOpen(true);
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepFormData.step.trim() || !stepFormData.desc.trim()) {
      showToast('请完整填写流程步骤名称与说明', 'error');
      return;
    }
    const updatedSteps = [...guideForm.process];
    if (editingStepIndex !== null) {
      updatedSteps[editingStepIndex] = stepFormData;
    } else {
      updatedSteps.push(stepFormData);
    }
    setGuideForm({ ...guideForm, process: updatedSteps });
    setIsStepModalOpen(false);
  };

  const handleDeleteStep = (index: number) => {
    const updatedSteps = guideForm.process.filter((_, idx) => idx !== index);
    setGuideForm({ ...guideForm, process: updatedSteps });
  };

  // ──────────────────────────────────────────
  // 4. 服务事项与办事指南 CRUD
  // ──────────────────────────────────────────
  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceFormData({
      service: '',
      method: '',
      contact: '',
      materials: '',
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: MemberServiceItem) => {
    setEditingService(srv);
    setServiceFormData({
      service: srv.service,
      method: srv.method,
      contact: srv.contact,
      materials: srv.materials,
    });
    setIsServiceModalOpen(true);
  };

  const handleSubmitServiceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.service.trim() || !serviceFormData.contact.trim()) {
      showToast('请完整填写服务内容与联络对接人', 'error');
      return;
    }

    let updatedItems = [...contentData.services.items];
    if (editingService) {
      const idx = updatedItems.findIndex((s) => s.id === editingService.id);
      if (idx >= 0) {
        updatedItems[idx] = {
          ...editingService,
          ...serviceFormData,
        };
      }
    } else {
      const newItem: MemberServiceItem = {
        id: `srv-${Date.now()}`,
        ...serviceFormData,
      };
      updatedItems.push(newItem);
    }

    const updatedData: MembersPageContentData = {
      ...contentData,
      services: {
        ...contentData.services,
        items: updatedItems,
      },
    };
    setContentData(updatedData);
    setIsServiceModalOpen(false);
    await handleSaveContentConfig(updatedData);
  };

  const handleConfirmDeleteService = async () => {
    if (!deleteTargetService) return;
    const updatedItems = contentData.services.items.filter((s) => s.id !== deleteTargetService.id);
    const updatedData: MembersPageContentData = {
      ...contentData,
      services: {
        ...contentData.services,
        items: updatedItems,
      },
    };
    setContentData(updatedData);
    setDeleteTargetService(null);
    await handleSaveContentConfig(updatedData);
    showToast(`已成功删除服务事项《${deleteTargetService.service}》`);
  };

  const handleSaveServicesFooter = async (footerNote: string, phone: string, email: string) => {
    const updatedData: MembersPageContentData = {
      ...contentData,
      services: {
        ...contentData.services,
        footerNote,
        phone,
        email,
      },
    };
    setContentData(updatedData);
    await handleSaveContentConfig(updatedData);
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位与服务管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            统一维护前台【会员单位名录】、【会员单位风采】、【入会指引】及【服务事项与办事指南】四大模块
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {activeTab === 'directory' ? (
            <button
              type="button"
              onClick={handleOpenCreateMember}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>录入新会员单位</span>
            </button>
          ) : activeTab === 'stories' ? (
            <button
              type="button"
              onClick={handleOpenCreateStory}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>添加风采案例</span>
            </button>
          ) : activeTab === 'services' ? (
            <button
              type="button"
              onClick={handleOpenCreateService}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>+</span>
              <span>添加服务事项</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 4大板块切换导航 */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center space-x-1.5 min-w-max">
          {[
            { id: 'directory', label: '会员单位名录', count: `${membersList.length} 家` },
            { id: 'stories', label: '会员单位风采', count: `${contentData.stories.length} 例` },
            { id: 'guide', label: '入会指引', count: `${guideForm.conditions.length}条条件·${guideForm.process.length}步` },
            { id: 'services', label: '服务事项与办事指南', count: `${contentData.services.items.length} 项` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-900 text-white font-semibold shadow-xs'
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

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto pr-1">
          {activeTab !== 'directory' && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              恢复初始演示数据
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          板块 1：会员单位名录（Firestore members 集合）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* 指标卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">登记会员总数</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-serif">
                {membersList.length} <span className="text-xs font-normal text-slate-400">家</span>
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">数据存储集合</div>
              <div className="text-sm sm:text-base font-bold text-blue-900 mt-2 font-mono truncate">
                members (Firestore)
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">高等院校会员</div>
              <div className="text-lg sm:text-xl font-bold text-blue-800 mt-1 font-serif">
                {membersList.filter((m) => m.type === '高等院校' || m.type === '高校').length} 所
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">年审通过</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 font-serif">
                {membersList.filter((m) => m.annualCheck?.includes('已通过')).length} 家
              </div>
            </div>
          </div>

          {/* 列表表格 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">会员单位资质清单</h3>
              <span className="text-xs text-slate-400">共 {membersList.length} 家</span>
            </div>

            {loadingMembers ? (
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
              <>
                {/* 移动端卡片视图 */}
                <div className="md:hidden space-y-3">
                  {membersList.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-blue-100 text-blue-900 border border-blue-200">
                            {item.type}
                          </span>
                          <span className="text-[11px] font-semibold text-blue-900">
                            {item.level}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.annualCheck?.includes('已通过')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.annualCheck}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                        <div className="flex justify-between">
                          <span>所在省市：</span>
                          <span className="font-medium text-slate-700">{item.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>对接联络：</span>
                          <span className="font-mono text-slate-700">{item.contact}</span>
                        </div>
                        {item.desc && (
                          <div className="pt-1 border-t border-slate-200/60 text-slate-600 line-clamp-2">
                            {item.desc}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMember(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetMember(item)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 桌面端表格视图 */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">单位类型</th>
                        <th className="px-4 py-3 font-semibold min-w-[200px]">单位名称</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">地区</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">会籍等级</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">年审状态</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">联络方式</th>
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
                            <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                            {item.desc && (
                              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.desc}</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{item.region}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                            {item.level}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                item.annualCheck?.includes('已通过')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.annualCheck}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                            {item.contact}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMember(item)}
                              className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetMember(item)}
                              className="px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer"
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
          板块 2：会员单位风采（contentData.stories）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">会员单位风采案例库</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  在前台展示重点会员单位在科技成果转化与产学研跨国合作中的优秀典型示范
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">
                  共 {contentData.stories.length} 个案例
                </span>
                <button
                  type="button"
                  onClick={handleOpenCreateStory}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  + 添加风采案例
                </button>
              </div>
            </div>

            {loadingConfig ? (
              <div className="py-12 text-center text-slate-400 text-xs">正在同步配置...</div>
            ) : contentData.stories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                暂无风采案例，可点击上方按钮添加或恢复演示数据。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentData.stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            story.tag === '国际合作'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {story.tag}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{story.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {story.unit}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {story.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {story.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditStory(story)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetStory(story)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 3：入会指引配置（guideForm）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">入会指引与申请流程设置</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  设置前台【入会指引】板块的协会统一入口、入会条件、所需材料与办理六步流程
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveGuideConfig()}
                disabled={savingConfig}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-1.5"
              >
                {savingConfig && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>保存入会指引配置</span>
              </button>
            </div>

            {/* 1. 协会统一入会入口 (CTA横幅设置) */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <h4 className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                <span>🔗</span>
                <span>协会统一入会入口（CTA 横幅外链设置）</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">横幅主标题</label>
                  <input
                    type="text"
                    value={guideForm.ctaTitle}
                    onChange={(e) => setGuideForm({ ...guideForm, ctaTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">跳转按钮文字</label>
                  <input
                    type="text"
                    value={guideForm.ctaButtonText}
                    onChange={(e) => setGuideForm({ ...guideForm, ctaButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">说明提醒文案</label>
                  <textarea
                    rows={2}
                    value={guideForm.ctaDesc}
                    onChange={(e) => setGuideForm({ ...guideForm, ctaDesc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white leading-relaxed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">协会官网外链地址</label>
                  <input
                    type="url"
                    value={guideForm.ctaUrl}
                    onChange={(e) => setGuideForm({ ...guideForm, ctaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. 入会条件与材料清单 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 入会条件 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-800 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>入会条件清单 ({guideForm.conditions.length} 项)</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {guideForm.conditions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-start justify-between gap-2"
                    >
                      <span className="text-slate-700 leading-relaxed flex-1">
                        <span className="font-semibold text-blue-900 mr-1.5">{idx + 1}.</span>
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCondition(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 shrink-0 cursor-pointer"
                        title="删除该条件"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="输入新的入会条件要求..."
                    value={newConditionText}
                    onChange={(e) => setNewConditionText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    + 添加
                  </button>
                </div>
              </div>

              {/* 申请所需材料 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-800 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>申请所需材料清单 ({guideForm.materials.length} 项)</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {guideForm.materials.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-start justify-between gap-2"
                    >
                      <span className="text-slate-700 leading-relaxed flex-1">
                        <span className="font-semibold text-blue-900 mr-1.5">{idx + 1}.</span>
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 shrink-0 cursor-pointer"
                        title="删除该材料"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="输入新的材料要求..."
                    value={newMaterialText}
                    onChange={(e) => setNewMaterialText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                  >
                    + 添加
                  </button>
                </div>
              </div>
            </div>

            {/* 3. 办理流程步骤 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-800 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>申请办理流程步骤 ({guideForm.process.length} 步)</span>
                </h4>
                <button
                  type="button"
                  onClick={handleOpenCreateStep}
                  className="px-2.5 py-1 text-xs bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded cursor-pointer"
                >
                  + 新增流程步骤
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {guideForm.process.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center space-x-1">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-blue-900 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{step.step}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed mt-1">{step.desc}</p>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditStep(step, idx)}
                        className="text-[11px] text-blue-800 hover:underline cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(idx)}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 推荐信与联系邮箱说明 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  页尾推荐信指引说明文案
                </label>
                <input
                  type="text"
                  value={guideForm.footerNote}
                  onChange={(e) => setGuideForm({ ...guideForm, footerNote: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">秘书处专属联系邮箱</label>
                <input
                  type="email"
                  value={guideForm.contactEmail}
                  onChange={(e) => setGuideForm({ ...guideForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          板块 4：服务事项与办事指南（contentData.services）
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">专项服务事项清单</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  维护面向会员单位开放的国际合作匹配、成果登记、专利辅导及合规审查等服务清单
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">
                  共 {contentData.services.items.length} 项
                </span>
                <button
                  type="button"
                  onClick={handleOpenCreateService}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  + 添加服务事项
                </button>
              </div>
            </div>

            {loadingConfig ? (
              <div className="py-12 text-center text-slate-400 text-xs">正在同步服务清单...</div>
            ) : contentData.services.items.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                暂无服务事项记录，点击右上角添加。
              </div>
            ) : (
              <>
                {/* 移动端服务卡片 */}
                <div className="md:hidden space-y-3">
                  {contentData.services.items.map((srv, idx) => (
                    <div
                      key={srv.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{srv.service}</span>
                        <span className="font-mono text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400">办理方式：</span>
                          <span>{srv.method}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">联络对接：</span>
                          <span className="font-medium text-blue-900">{srv.contact}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">所需材料：</span>
                          <span>{srv.materials}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditService(srv)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetService(srv)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 桌面端服务表格 */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-4 py-3 font-semibold whitespace-nowrap w-8">#</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[160px]">服务内容</th>
                        <th className="px-4 py-3 font-semibold min-w-[160px]">办理方式</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[130px]">联络对接人</th>
                        <th className="px-4 py-3 font-semibold min-w-[200px]">所需材料</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contentData.services.items.map((srv, idx) => (
                        <tr
                          key={srv.id || idx}
                          className={`align-top hover:bg-blue-50/40 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          }`}
                        >
                          <td className="px-4 py-3.5 text-slate-400 font-mono">
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">{srv.service}</td>
                          <td className="px-4 py-3.5 text-slate-600 leading-relaxed">{srv.method}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                            {srv.contact}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 leading-relaxed">{srv.materials}</td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditService(srv)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetService(srv)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer"
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

            {/* 底部咨询热线与邮箱配置 */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">服务专线与联络邮箱配置</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">咨询电话</label>
                  <input
                    type="text"
                    value={contentData.services.phone}
                    onChange={(e) =>
                      setContentData({
                        ...contentData,
                        services: { ...contentData.services, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">咨询邮箱</label>
                  <input
                    type="email"
                    value={contentData.services.email}
                    onChange={(e) =>
                      setContentData({
                        ...contentData,
                        services: { ...contentData.services, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">底部提醒文案</label>
                  <input
                    type="text"
                    value={contentData.services.footerNote}
                    onChange={(e) =>
                      setContentData({
                        ...contentData,
                        services: { ...contentData.services, footerNote: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveServicesFooter(
                      contentData.services.footerNote,
                      contentData.services.phone,
                      contentData.services.email
                    )
                  }
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  保存热线与联络设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 1：录入 / 编辑会员单位名录 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingMember ? '编辑会员单位信息' : '录入新会员单位'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                数据将直接存入 Firestore 数据库 members 集合，并在前台即时展现
              </p>
            </div>

            <form onSubmit={handleSubmitMemberForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">会员单位完整官方名称 *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  placeholder="例如：北京大学科技开发部、同济创新创业控股有限公司"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">单位所属类别 *</label>
                  <select
                    value={memberFormData.type}
                    onChange={(e) => setMemberFormData({ ...memberFormData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="高等院校">高等院校</option>
                    <option value="校办企业">校办企业</option>
                    <option value="技术转移机构">技术转移机构</option>
                    <option value="大学科技园">大学科技园</option>
                    <option value="其他">其他创新机构</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">所属省份/直辖市 *</label>
                  <select
                    value={memberFormData.region}
                    onChange={(e) => setMemberFormData({ ...memberFormData, region: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    {[
                      '北京',
                      '上海',
                      '浙江',
                      '广东',
                      '湖北',
                      '陕西',
                      '天津',
                      '江苏',
                      '山东',
                      '四川',
                      '重庆',
                      '湖南',
                      '安徽',
                      '黑龙江',
                      '辽宁',
                      '吉林',
                      '福建',
                      '河南',
                      '海外合作机构',
                    ].map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">会籍级别 *</label>
                  <select
                    value={memberFormData.level}
                    onChange={(e) => setMemberFormData({ ...memberFormData, level: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="理事会员单位">理事会员单位</option>
                    <option value="常务理事单位">常务理事单位</option>
                    <option value="普通会员单位">普通会员单位</option>
                    <option value="副理事长单位">副理事长单位</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">年度审查状态 *</label>
                  <select
                    value={memberFormData.annualCheck}
                    onChange={(e) => setMemberFormData({ ...memberFormData, annualCheck: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="已通过 (2026)">已通过 (2026)</option>
                    <option value="已通过 (2025)">已通过 (2025)</option>
                    <option value="审查中 (2026)">审查中 (2026)</option>
                    <option value="待提交年审报告">待提交年审报告</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">联络人及方式 *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.contact}
                  onChange={(e) => setMemberFormData({ ...memberFormData, contact: e.target.value })}
                  placeholder="例如：科技开发部 王老师 010-6275XXXX / 138XXXXXXXX"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">单位简介及产业特色（选填）</label>
                <textarea
                  rows={3}
                  value={memberFormData.desc}
                  onChange={(e) => setMemberFormData({ ...memberFormData, desc: e.target.value })}
                  placeholder="简述该单位在产学研融合、专利转化或重点研发领域的代表性成就..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submittingMember}
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-2"
                >
                  {submittingMember && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingMember ? '保存修改' : '确认录入'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 2：删除会员确认 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {deleteTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认注销该会员单位？</h3>
                <p className="text-xs text-slate-500">此操作将从 Firestore 数据库永久注销该会员单位数据</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                {deleteTargetMember.name}
              </div>
              <div className="text-[11px] text-slate-400">
                类型：{deleteTargetMember.type} · 省份：{deleteTargetMember.region} · 级别：{deleteTargetMember.level}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeletingMember}
                onClick={() => setDeleteTargetMember(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isDeletingMember}
                onClick={handleConfirmDeleteMember}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-1.5"
              >
                {isDeletingMember && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 3：风采案例添加 / 编辑 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsStoryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingStory ? '编辑风采案例' : '添加会员风采案例'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                数据实时同步至 siteConfig/members，并在前台“会员单位风采”板块展示
              </p>
            </div>

            <form onSubmit={handleSubmitStoryForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">案例主标题 *</label>
                <input
                  type="text"
                  required
                  value={storyFormData.title}
                  onChange={(e) => setStoryFormData({ ...storyFormData, title: e.target.value })}
                  placeholder="例如：中新绿色储能联合研发：赋能东盟能源转型"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">示范会员单位名称 *</label>
                <input
                  type="text"
                  required
                  value={storyFormData.unit}
                  onChange={(e) => setStoryFormData({ ...storyFormData, unit: e.target.value })}
                  placeholder="例如：浙江大学工业技术转化研究院"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">分类标签 *</label>
                  <select
                    value={storyFormData.tag}
                    onChange={(e) => setStoryFormData({ ...storyFormData, tag: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="成果转化">成果转化</option>
                    <option value="国际合作">国际合作</option>
                    <option value="产教融合">产教融合</option>
                    <option value="智库建设">智库建设</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">发布/成果年月 *</label>
                  <input
                    type="month"
                    required
                    value={storyFormData.date}
                    onChange={(e) => setStoryFormData({ ...storyFormData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">核心摘要 / 实践成效 *</label>
                <textarea
                  rows={4}
                  required
                  value={storyFormData.summary}
                  onChange={(e) => setStoryFormData({ ...storyFormData, summary: e.target.value })}
                  placeholder="输入案例详细背景、合作亮点、签约金额或社会经济示范效应..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-2"
                >
                  {savingConfig && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingStory ? '保存案例' : '添加案例'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 4：删除风采案例确认 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {deleteTargetStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认删除该风采案例？</h3>
                <p className="text-xs text-slate-500">删除后前台页面将不再展示该典型案例</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">{deleteTargetStory.title}</div>
              <div className="text-[11px] text-slate-400">单位：{deleteTargetStory.unit}</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetStory(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStory}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 5：服务事项添加 / 编辑 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingService ? '编辑服务事项' : '添加新服务事项'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                实时同步至 siteConfig/members，并呈现于前台服务清单表格
              </p>
            </div>

            <form onSubmit={handleSubmitServiceForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">服务内容项目名称 *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.service}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, service: e.target.value })}
                  placeholder="例如：国际合作项目推荐与匹配、PCT国际专利申报辅导"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">办理方式说明 *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.method}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, method: e.target.value })}
                  placeholder="例如：线上申报系统 + 线下纸质归档、预约一对一专家咨询"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">联络对接部门及联系人 *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.contact}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, contact: e.target.value })}
                  placeholder="例如：成果转化部 · 刘老师、知识产权服务部 · 陈老师"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">所需材料清单 *</label>
                <textarea
                  rows={3}
                  required
                  value={serviceFormData.materials}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, materials: e.target.value })}
                  placeholder="例如：单位营业执照（或法人证书）、合作需求说明书、联系人信息表..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center space-x-2"
                >
                  {savingConfig && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingService ? '保存修改' : '确认添加'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 6：删除服务事项确认 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {deleteTargetService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认删除服务事项？</h3>
                <p className="text-xs text-slate-500">删除后前台服务清单将不再列出该项服务</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="font-semibold text-slate-800">{deleteTargetService.service}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">对接人：{deleteTargetService.contact}</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetService(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteService}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 7：流程步骤添加 / 编辑 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {isStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsStepModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStepIndex !== null ? '编辑流程步骤' : '添加流程步骤'}
              </h3>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">步骤名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：提交申请、理事会审议、颁发证书"
                  value={stepFormData.step}
                  onChange={(e) => setStepFormData({ ...stepFormData, step: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">步骤具体说明 *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="说明该步骤的具体办理方式、受理期限或交付成果..."
                  value={stepFormData.desc}
                  onChange={(e) => setStepFormData({ ...stepFormData, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsStepModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                >
                  确认保存步骤
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          模态框 8：恢复演示数据确认 (Tailwind Modal)
      ══════════════════════════════════════════════════════ */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg shrink-0">
                🔄
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">确认恢复初始演示数据？</h3>
                <p className="text-xs text-slate-500">将把风采案例、入会指引及服务事项恢复为前台最初展示的假数据</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 leading-relaxed">
              此操作会覆盖【会员单位风采】、【入会指引】和【服务事项】当前的后台配置，会员名录不受影响。
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                确认恢复初始数据
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
