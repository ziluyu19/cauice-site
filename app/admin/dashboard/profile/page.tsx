'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  GaikuangData,
  defaultGaikuangData,
  LeadershipMember,
  FoundingMember,
  OperatingRule,
  DepartmentItem,
  MilestoneItem,
} from '@/lib/gaikuangData';

export default function AdminProfilePage() {
  const [data, setData] = useState<GaikuangData>(defaultGaikuangData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'rules' | 'org' | 'secretariat' | 'history' | 'contact'>('intro');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 实时订阅或初次读取 Firestore 中的概况配置
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const docRef = doc(db, 'siteConfig', 'gaikuang');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        clearTimeout(timer);
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as Partial<GaikuangData>;
          setData({
            ...defaultGaikuangData,
            ...remoteData,
          });
        } else {
          // 文档尚不存在，保持使用基底数据
          setData(defaultGaikuangData);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Profile doc snapshot error, fallback to default:', error);
        clearTimeout(timer);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 保存数据到 Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'siteConfig', 'gaikuang');
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      showToast('国专委概况已成功更新并发布，前台页面实时生效！', 'success');
    } catch (err: any) {
      console.error('Save profile error:', err);
      showToast(`保存失败：${err?.message || '请检查网络连接'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 恢复为预设基底数据
  const handleResetToDefault = () => {
    setData(JSON.parse(JSON.stringify(defaultGaikuangData)));
    setShowResetConfirm(false);
    showToast('已载入预设基底数据，请点击右上角“保存并发布”以提交到数据库。', 'success');
  };

  // ---------------- 表单辅助更新函数 ----------------
  const updateField = (field: keyof GaikuangData, val: any) => {
    setData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  // 规则增删改
  const updateRule = (index: number, key: keyof OperatingRule, val: string) => {
    const next = [...data.operatingRules];
    next[index] = { ...next[index], [key]: val };
    updateField('operatingRules', next);
  };
  const addRule = () => {
    updateField('operatingRules', [
      ...data.operatingRules,
      { title: `第${data.operatingRules.length + 1}章 新章程规则`, content: '请输入规约详细细则...' },
    ]);
  };
  const removeRule = (index: number) => {
    updateField('operatingRules', data.operatingRules.filter((_, i) => i !== index));
  };

  // 领导班子增删改
  const updateLeader = (index: number, key: keyof LeadershipMember, val: string) => {
    const next = [...data.leadership];
    next[index] = { ...next[index], [key]: val };
    updateField('leadership', next);
  };
  const addLeader = () => {
    updateField('leadership', [
      ...data.leadership,
      { roleTitle: '副主任会员', name: '姓名 职务', unit: '高校或单位名称', desc: '分管领域与业务职责描述...' },
    ]);
  };
  const removeLeader = (index: number) => {
    updateField('leadership', data.leadership.filter((_, i) => i !== index));
  };

  // 发起会员增删改
  const updateMember = (index: number, key: keyof FoundingMember, val: string) => {
    const next = [...data.foundingMembers];
    next[index] = { ...next[index], [key]: val };
    updateField('foundingMembers', next);
  };
  const addMember = () => {
    updateField('foundingMembers', [
      ...data.foundingMembers,
      { unit: '新高校/单位名称', rep: '代表姓名', role: '理事会员单位' },
    ]);
  };
  const removeMember = (index: number) => {
    updateField('foundingMembers', data.foundingMembers.filter((_, i) => i !== index));
  };

  // 办事部门增删改
  const updateDepartment = (index: number, key: keyof DepartmentItem, val: string) => {
    const next = [...data.departments];
    next[index] = { ...next[index], [key]: val };
    updateField('departments', next);
  };
  const addDepartment = () => {
    updateField('departments', [
      ...data.departments,
      { name: '新常设办事部门', division: '职责分工：负责相关业务联络与协同...', phone: '办公专线或邮箱' },
    ]);
  };
  const removeDepartment = (index: number) => {
    updateField('departments', data.departments.filter((_, i) => i !== index));
  };

  // 大事记增删改
  const updateMilestone = (index: number, key: keyof MilestoneItem, val: string) => {
    const next = [...data.milestones];
    next[index] = { ...next[index], [key]: val };
    updateField('milestones', next);
  };
  const addMilestone = () => {
    updateField('milestones', [
      { time: '2026年', title: '新增关键发展里程碑', desc: '描述该事件对国专委发展的重大推进意义（建议不超过80字）' },
      ...data.milestones,
    ]);
  };
  const removeMilestone = (index: number) => {
    updateField('milestones', data.milestones.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500">正在同步《国专委概况》数据...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'intro', label: '1. 简介与法定信息' },
    { id: 'rules', label: '2. 批复与工作规则' },
    { id: 'org', label: '3. 架构与会员名录' },
    { id: 'secretariat', label: '4. 秘书处与办事机构' },
    { id: 'history', label: '5. 大事记时间轴' },
    { id: 'contact', label: '6. 联系方式与指引' },
  ];

  return (
    <div className="space-y-6">
      {/* 吐司提示 */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm flex items-center space-x-2 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '✕'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">国专委概况管理</h2>
          <p className="text-xs text-slate-500 mt-1">
            编辑并维护前台《国专委概况》所有板块数据，数据直连 Firebase Firestore，前台实时生效。
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            重置为预设数据
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>{saving ? '正在发布...' : '保存并发布全站'}</span>
          </button>
        </div>
      </div>

      {/* 分类子标签栏 */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1.5 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 模块一：简介与法定信息 ─── */}
      {activeTab === 'intro' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">顶部横幅与法定资质声明</h3>
            <p className="text-xs text-slate-500 mt-0.5">配置频道头部副标题与显要性质声明</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">页面头部副标题（Banner Slogan）</label>
              <textarea
                rows={2}
                value={data.bannerSubtitle}
                onChange={(e) => updateField('bannerSubtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">重要声明（蓝色高亮引言）</label>
              <textarea
                rows={2}
                value={data.declaration}
                onChange={(e) => updateField('declaration', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">上级协会名称</label>
              <input
                type="text"
                value={data.associationName}
                onChange={(e) => updateField('associationName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">机构法定性质</label>
              <input
                type="text"
                value={data.entityNature}
                onChange={(e) => updateField('entityNature', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">成立批复文号</label>
              <input
                type="text"
                value={data.approvalDocNo}
                onChange={(e) => updateField('approvalDocNo', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">成立时间</label>
              <input
                type="text"
                value={data.foundedDate}
                onChange={(e) => updateField('foundedDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">国专委宗旨</label>
              <textarea
                rows={2}
                value={data.purpose}
                onChange={(e) => updateField('purpose', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">业务范围</label>
              <textarea
                rows={2}
                value={data.businessScope}
                onChange={(e) => updateField('businessScope', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">活动地域</label>
              <input
                type="text"
                value={data.activityRegion}
                onChange={(e) => updateField('activityRegion', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">详细论述第一段</label>
              <textarea
                rows={3}
                value={data.detailedIntro1}
                onChange={(e) => updateField('detailedIntro1', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">详细论述第二段</label>
              <textarea
                rows={3}
                value={data.detailedIntro2}
                onChange={(e) => updateField('detailedIntro2', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 模块二：成立批复与工作规则 ─── */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* 公文卡片信息 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">设立批复文件公文卡片信息</h3>
              <p className="text-xs text-slate-500 mt-0.5">展示于前台公文卡片中的核心法定公文信息</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">批复文件完整标题</label>
                <input
                  type="text"
                  value={data.approvalDocTitle}
                  onChange={(e) => updateField('approvalDocTitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">批准单位</label>
                <input
                  type="text"
                  value={data.approvalAuthority}
                  onChange={(e) => updateField('approvalAuthority', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">机构属性说明</label>
                <input
                  type="text"
                  value={data.approvalNature}
                  onChange={(e) => updateField('approvalNature', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">批复核心主旨</label>
                <textarea
                  rows={2}
                  value={data.approvalSummary}
                  onChange={(e) => updateField('approvalSummary', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">签发日期</label>
                <input
                  type="text"
                  value={data.approvalDate}
                  onChange={(e) => updateField('approvalDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">防伪查验码</label>
                <input
                  type="text"
                  value={data.verifyCode}
                  onChange={(e) => updateField('verifyCode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>
          </div>

          {/* 工作规则列表 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">工作规则纲要（试行办法各章节）</h3>
                <p className="text-xs text-slate-500 mt-0.5">支持自由增加、删除和编辑各规约章节</p>
              </div>
              <button
                type="button"
                onClick={addRule}
                className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + 添加规则章节
              </button>
            </div>

            <div className="space-y-4">
              {data.operatingRules.map((rule, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={rule.title}
                      onChange={(e) => updateRule(idx, 'title', e.target.value)}
                      placeholder="章节标题（例如：第一章 总则与分支机构规约）"
                      className="font-bold text-slate-900 flex-1 px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeRule(idx)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-xs cursor-pointer"
                    >
                      删除本章
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={rule.content}
                    onChange={(e) => updateRule(idx, 'content', e.target.value)}
                    placeholder="章节规约细则内容..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 模块三：组织架构与会员名录 ─── */}
      {activeTab === 'org' && (
        <div className="space-y-6">
          {/* 届次公示 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">理事会届次公示配置</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">当前届次与任期区间</label>
                <input
                  type="text"
                  value={data.currentTerm}
                  onChange={(e) => updateField('currentTerm', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">下届计划换届时间</label>
                <input
                  type="text"
                  value={data.nextTermDate}
                  onChange={(e) => updateField('nextTermDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>
          </div>

          {/* 领导成员 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">领导成员（主任会员、副主任会员与秘书长）</h3>
                <p className="text-xs text-slate-500 mt-0.5">按单位与姓名列示</p>
              </div>
              <button
                type="button"
                onClick={addLeader}
                className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + 添加领导成员
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.leadership.map((leader, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={leader.roleTitle}
                      onChange={(e) => updateLeader(idx, 'roleTitle', e.target.value)}
                      placeholder="职衔（例如：主任会员（主任委员））"
                      className="font-bold text-blue-900 px-2 py-1 rounded border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeLeader(idx)}
                      className="text-red-600 hover:text-red-800 text-xs cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                  <input
                    type="text"
                    value={leader.name}
                    onChange={(e) => updateLeader(idx, 'name', e.target.value)}
                    placeholder="姓名（例如：张敬文 教授）"
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-medium"
                  />
                  <input
                    type="text"
                    value={leader.unit}
                    onChange={(e) => updateLeader(idx, 'unit', e.target.value)}
                    placeholder="所属高校或单位"
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-slate-600"
                  />
                  <textarea
                    rows={2}
                    value={leader.desc}
                    onChange={(e) => updateLeader(idx, 'desc', e.target.value)}
                    placeholder="业务职责与专家背景介绍..."
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 首批重点发起会员单位名录 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">首批重点发起会员单位名录（按单位与姓名列示）</h3>
                <p className="text-xs text-slate-500 mt-0.5">当前共 {data.foundingMembers.length} 家发起单位</p>
              </div>
              <button
                type="button"
                onClick={addMember}
                className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + 添加会员单位
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {data.foundingMembers.map((member, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      title="删除单位"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={member.unit}
                    onChange={(e) => updateMember(idx, 'unit', e.target.value)}
                    placeholder="单位名称"
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-bold text-slate-800 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={member.rep}
                      onChange={(e) => updateMember(idx, 'rep', e.target.value)}
                      placeholder="代表：姓名 职务"
                      className="flex-1 px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateMember(idx, 'role', e.target.value)}
                      placeholder="如：副主任委员单位"
                      className="w-24 px-1.5 py-1 rounded border border-slate-300 bg-white text-[11px] text-blue-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 模块四：秘书处与办事机构 ─── */}
      {activeTab === 'secretariat' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">秘书处常设机构基本信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">秘书处设置单位</label>
                <input
                  type="text"
                  value={data.secretariatUnit}
                  onChange={(e) => updateField('secretariatUnit', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">办公地址与常设工作专区</label>
                <input
                  type="text"
                  value={data.secretariatAddress}
                  onChange={(e) => updateField('secretariatAddress', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">邮政编码</label>
                <input
                  type="text"
                  value={data.secretariatPostalCode}
                  onChange={(e) => updateField('secretariatPostalCode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">常设服务时间</label>
                <input
                  type="text"
                  value={data.secretariatWorkHours}
                  onChange={(e) => updateField('secretariatWorkHours', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">秘书处机构职责说明</label>
                <textarea
                  rows={2}
                  value={data.secretariatDesc}
                  onChange={(e) => updateField('secretariatDesc', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                />
              </div>
            </div>
          </div>

          {/* 各办事部门 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">各常设办事部门职责与专线</h3>
              </div>
              <button
                type="button"
                onClick={addDepartment}
                className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + 添加办事部门
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {data.departments.map((dept, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => updateDepartment(idx, 'name', e.target.value)}
                        placeholder="部门名称"
                        className="font-bold text-slate-900 px-2 py-1 rounded border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeDepartment(idx)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={dept.division}
                      onChange={(e) => updateDepartment(idx, 'division', e.target.value)}
                      placeholder="职责分工详细说明..."
                      className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-slate-600"
                    />
                  </div>
                  <input
                    type="text"
                    value={dept.phone}
                    onChange={(e) => updateDepartment(idx, 'phone', e.target.value)}
                    placeholder="联络专线 / 邮箱"
                    className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-blue-900 font-mono text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 模块五：大事记时间轴 ─── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">大事记（按年度倒序展示）</h3>
              <p className="text-xs text-slate-500 mt-0.5">每条条目建议不超过80字，保持政府公信力严谨表述</p>
            </div>
            <button
              type="button"
              onClick={addMilestone}
              className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
            >
              + 添加大事记事件
            </button>
          </div>

          <div className="space-y-4">
            {data.milestones.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => updateMilestone(idx, 'time', e.target.value)}
                      placeholder="发生时间（如：2026年03月）"
                      className="w-36 font-bold font-mono text-blue-900 px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                      placeholder="事件标题"
                      className="flex-1 font-bold text-slate-900 px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(idx)}
                    className="text-red-600 hover:text-red-800 px-2 py-1 text-xs cursor-pointer"
                  >
                    删除
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.desc}
                  onChange={(e) => updateMilestone(idx, 'desc', e.target.value)}
                  placeholder="事件详述（建议不超过80字）..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 模块六：联系方式与来访指引 ─── */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">官方联络信息与访客交通指引</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">主办单位名称</label>
              <input
                type="text"
                value={data.contactOrgName}
                onChange={(e) => updateField('contactOrgName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">分支机构属性注记</label>
              <input
                type="text"
                value={data.contactAffiliation}
                onChange={(e) => updateField('contactAffiliation', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">英文全称</label>
              <input
                type="text"
                value={data.contactEnglish}
                onChange={(e) => updateField('contactEnglish', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 font-mono text-[11px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">通信地址</label>
              <input
                type="text"
                value={data.contactAddress}
                onChange={(e) => updateField('contactAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">邮政编码</label>
              <input
                type="text"
                value={data.contactPostalCode}
                onChange={(e) => updateField('contactPostalCode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">联系电话</label>
              <input
                type="text"
                value={data.contactTel}
                onChange={(e) => updateField('contactTel', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">办公传真</label>
              <input
                type="text"
                value={data.contactFax}
                onChange={(e) => updateField('contactFax', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">官方电子邮箱</label>
              <input
                type="text"
                value={data.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">工作时间</label>
              <input
                type="text"
                value={data.contactWorkHours}
                onChange={(e) => updateField('contactWorkHours', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">来访交通指引说明</label>
              <textarea
                rows={2}
                value={data.contactTrafficTip}
                onChange={(e) => updateField('contactTrafficTip', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 重置确认模态框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">确认恢复预设基底数据？</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              此操作将当前表单内容替换为系统默认的完整国专委官方基底数据。您可以在确认检查后再决定是否点击“保存并发布全站”。
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg cursor-pointer"
              >
                确认载入预设
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
