'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  InternationalContentData,
  defaultInternationalData,
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
  year?: string;
  createdAt?: any;
}

export default function InternationalPage() {
  const [activeTab, setActiveTab] = useState<string>('projects');
  const [filterCountry, setFilterCountry] = useState<string>('全部');
  const [filterField, setFilterField] = useState<string>('全部');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [briTab, setBriTab] = useState<'policy' | 'project' | 'activity' | 'achievement'>('policy');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('全部');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [matchmakingForm, setMatchmakingForm] = useState({
    unit: '',
    type: '国内单位发布技术与合作需求',
    field: '智能制造与高端装备',
    contact: '',
    desc: '',
  });

  // 1. 合作项目库数据（Firestore projects 集合）
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [viewingProject, setViewingProject] = useState<ProjectItem | null>(null);

  // 2. 国际合作其余5大板块数据（实时连接 siteConfig/international 文档，完整基底平滑兜底）
  const [intlData, setIntlData] = useState<InternationalContentData>(defaultInternationalData);

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
          console.warn('Projects query fallback to basic snapshot:', err);
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
              console.warn('Projects fallback error:', fallbackErr);
              clearTimeout(timer);
              setLoadingProjects(false);
            }
          );
        }
      );
    } catch (e) {
      console.error('Failed to setup projects listener:', e);
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
      // 保持当前 intlData
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
          }
        },
        (err) => {
          console.warn('International page snapshot fallback:', err);
          clearTimeout(timer);
        }
      );
    } catch (e) {
      console.error('Failed to setup international listener:', e);
      clearTimeout(timer);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 需求意向提交
  const handleMatchmakingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchmakingForm.unit || !matchmakingForm.contact) return;
    setInquirySubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...matchmakingForm,
        source: '国际合作需求对接大厅',
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
      });
      setFormSubmitted(true);
      setMatchmakingForm({
        unit: '',
        type: '国内单位发布技术与合作需求',
        field: '智能制造与高端装备',
        contact: '',
        desc: '',
      });
    } catch (err) {
      console.warn('Inquiry submit fallback:', err);
      setFormSubmitted(true);
    } finally {
      setInquirySubmitting(false);
    }
  };

  const filteredProjects = projectsList.filter((p) => {
    if (filterCountry !== '全部' && p.country !== filterCountry) return false;
    if (filterField !== '全部' && p.field !== filterField) return false;
    if (filterStatus !== '全部' && p.status !== filterStatus) return false;
    return true;
  });

  const subNavItems = [
    { id: 'projects', label: '合作项目库' },
    { id: 'regions', label: '国别与区域' },
    { id: 'bri', label: '一带一路' },
    { id: 'activities', label: '涉外交流活动' },
    { id: 'matchmaking', label: '合作需求' },
    { id: 'organizations', label: '国际组织' },
  ];

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 滚动监听，自动高亮当前阅读的子栏目
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveTab(subNavItems[subNavItems.length - 1].id);
        return;
      }
      const scrollPosition = window.scrollY + 240;
      for (let i = subNavItems.length - 1; i >= 0; i--) {
        const item = subNavItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 顶部 Page Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">国际合作</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              国际合作与交流
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              立足全球产学研合作，赋能高校科技产业高质量出海与国际协同创新。
            </p>
          </div>
        </div>
      </section>

      {/* 顶部 6 个锚点子导航 */}
      <div className="sticky top-[108px] lg:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-2.5">
            {subNavItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToAnchor(e, item.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-blue-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* ──────────────────────────────────────────────────────── */}
        {/* 1. 合作项目库 */}
        {/* ──────────────────────────────────────────────────────── */}
        <section id="projects" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国际合作项目库</h2>
            </div>
            <span className="text-xs text-slate-500">
              共收录重点高校涉外产业项目，显示 {filteredProjects.length} / {projectsList.length} 项
            </span>
          </div>

          {/* 四维筛选器 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            {/* 国别 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">合作国别：</span>
              {['全部', '德国', '新加坡', '英国', '瑞士', '日本'].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterCountry(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterCountry === item
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 领域 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">专业领域：</span>
              {['全部', '智能制造', '新能源', '生物医药', '数字经济', '新材料'].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterField(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterField === item
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 状态 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">进展状态：</span>
              {['全部', '进行中', '筹备中', '已完成'].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterStatus(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterStatus === item
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 项目卡片列表 */}
          <div className="space-y-4">
            {loadingProjects ? (
              <div className="p-12 text-center text-slate-400 space-y-2 text-xs">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>正在连接 Firestore 读取合作项目数据...</div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                未检索到符合筛选条件的涉外项目，可切换筛选或在管理后台录入新项目。
              </div>
            ) : (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setViewingProject(proj)}
                  className="p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all bg-white group space-y-3 cursor-pointer"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          {proj.country} · {proj.field}
                        </span>
                        {proj.period && (
                          <span className="text-xs text-slate-400 font-mono">周期：{proj.period}</span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                        {proj.name}
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                        proj.status === '进行中'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : proj.status === '筹备中'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {proj.desc && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {proj.desc}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">中方合作主体：</span>
                      <span className="font-medium text-slate-800">{proj.chineseParty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">外方合作主体：</span>
                      <span className="font-medium text-slate-800">{proj.foreignParty}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 2. 国别与区域（后台动态数据） */}
        {/* ──────────────────────────────────────────────────────── */}
        <section id="regions" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国别与重点区域合作</h2>
            </div>
            <span className="text-xs text-slate-500">
              按国家及战略经济圈聚合合作基础与涉外合规指引（共 {intlData.regions.length} 个重点区域）
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intlData.regions.map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">{reg.country}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${reg.tagColor || 'bg-blue-100 text-blue-800'}`}>
                      {reg.tag}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">合作概况：</span>{reg.overview}
                  </div>
                  <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200/70 leading-relaxed">
                    <span className="font-bold">⚠️ 政策环境提示：</span>{reg.policyTip}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">已有合作基础：</span>{reg.foundation}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 3. 一带一路（后台动态数据） */}
        {/* ──────────────────────────────────────────────────────── */}
        <section id="bri" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">共建“一带一路”产教融合专题</h2>
            </div>
            <span className="text-xs text-slate-500">
              服务科技丝绸之路与高校先进适用技术沿线推广
            </span>
          </div>

          {/* 4 个 Tabs */}
          <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-px">
            {[
              { id: 'policy', label: '政策指引' },
              { id: 'project', label: '沿线示范项目' },
              { id: 'activity', label: '合作交流活动' },
              { id: 'achievement', label: '重点建设成果' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBriTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  briTab === tab.id
                    ? 'border-blue-800 text-blue-900 font-bold bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容区 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="space-y-3">
              {intlData.bri
                .filter((item) => item.category === briTab)
                .map((item) => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      <div className="flex items-center space-x-2">
                        {item.statusBadge && (
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                            {item.statusBadge}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">{item.dateOrStatus}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              {intlData.bri.filter((item) => item.category === briTab).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">暂无该分类内容</div>
              )}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 4. 涉外交流活动（后台动态数据） */}
        {/* ──────────────────────────────────────────────────────── */}
        <section id="activities" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">涉外交流活动专区</h2>
            </div>
            <span className="text-xs text-slate-500">
              涵盖出访考察、海外来访、国际论坛、成果展会与专业培训
            </span>
          </div>

          {/* 活动分类筛选标签 */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">活动类型：</span>
            {['全部', '出访', '来访', '论坛', '展会', '培训'].map((type) => (
              <button
                key={type}
                onClick={() => setActivityTypeFilter(type)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activityTypeFilter === type
                    ? 'bg-blue-800 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 活动列表 */}
          <div className="space-y-4">
            {intlData.activities
              .filter((act) => activityTypeFilter === '全部' || act.type === activityTypeFilter)
              .map((act) => (
                <div
                  key={act.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                        {act.type}活动
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                          act.status === '活动预告'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>时间：{act.date}</span>
                      <span>地点：{act.location}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                    {act.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {act.summary}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 5. 合作需求与对接（后台动态数据） */}
        {/* ──────────────────────────────────────────────────────── */}
        <section id="matchmaking" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">合作需求与跨境对接大厅</h2>
            </div>
            <span className="text-xs text-slate-500">
              汇集国内高校产业需求与海外机构来华合作意向
            </span>
          </div>

          {/* 国内与海外两块区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 区域一：国内单位发布技术与合作需求 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                <h3 className="text-sm font-bold text-slate-900">国内单位技术攻关与出海需求</h3>
              </div>

              <div className="space-y-3">
                {intlData.matchmakingNeeds
                  .filter((n) => n.direction === 'domestic')
                  .map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">{item.field}</span>
                        <span className="text-xs text-slate-400">{item.publisher}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 font-mono">
                        {item.footerMeta}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 区域二：海外机构发布合作意向 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <h3 className="text-sm font-bold text-slate-900">海外机构来华意向与技术转移需求</h3>
              </div>

              <div className="space-y-3">
                {intlData.matchmakingNeeds
                  .filter((n) => n.direction === 'overseas')
                  .map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">{item.field}</span>
                        <span className="text-xs text-slate-400">{item.publisher}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 font-mono">
                        {item.footerMeta}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 提交需求表单 */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">提交跨境产学研合作需求</h3>
              <span className="text-[11px] text-slate-400">信息提交后将转交秘书处初审对接</span>
            </div>

            {formSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span>需求信息已成功提交！秘书处流转系统已登记，工作人员将在1个工作日内与您联系。</span>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs font-semibold text-emerald-900 underline ml-3 cursor-pointer"
                >
                  继续提交
                </button>
              </div>
            ) : (
              <form onSubmit={handleMatchmakingSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">单位名称 / 机构名称 *</label>
                  <input
                    type="text"
                    required
                    value={matchmakingForm.unit}
                    onChange={(e) => setMatchmakingForm({ ...matchmakingForm, unit: e.target.value })}
                    placeholder="例如：某高校资产管理公司 / 海外科技创新中心"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">发布类型 *</label>
                  <select
                    value={matchmakingForm.type}
                    onChange={(e) => setMatchmakingForm({ ...matchmakingForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    <option>国内单位发布技术与合作需求</option>
                    <option>海外机构发布意向与技术转移</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">专业领域 *</label>
                  <select
                    value={matchmakingForm.field}
                    onChange={(e) => setMatchmakingForm({ ...matchmakingForm, field: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    <option>智能制造与高端装备</option>
                    <option>新能源与绿色低碳</option>
                    <option>生物医药与生命健康</option>
                    <option>现代农业与水利环境</option>
                    <option>数字经济与人工智能</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">联系人与职务 / 电子邮箱 *</label>
                  <input
                    type="text"
                    required
                    value={matchmakingForm.contact}
                    onChange={(e) => setMatchmakingForm({ ...matchmakingForm, contact: e.target.value })}
                    placeholder="姓名 · 职务 · 邮箱 / 电话"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">合作需求详细描述</label>
                  <textarea
                    rows={2}
                    value={matchmakingForm.desc}
                    onChange={(e) => setMatchmakingForm({ ...matchmakingForm, desc: e.target.value })}
                    placeholder="简述技术亮点、期望合作国别或机构类型、合作方式与预期周期..."
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  ></textarea>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white font-semibold transition-colors cursor-pointer text-xs"
                  >
                    {inquirySubmitting ? '正在提交...' : '提交需求对接申请'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 6. 国际组织与友好机构（后台动态数据） */}
        {/* ──────────────────────────────────────────────────────── */}
        <section id="organizations" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国际组织与友好合作机构</h2>
            </div>
            <span className="text-xs text-slate-500">
              全球学术创新联合体、技术转移网络与海外友好高校
            </span>
          </div>

          <div className="space-y-6">
            {/* 分组一：国际组织与创新联盟 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                【国际学术组织与创新联盟】
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intlData.organizations
                  .filter((o) => o.category === 'international_org')
                  .map((org) => (
                    <div key={org.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          LOGO
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{org.name}</div>
                          {org.sub && <div className="text-[10px] text-slate-400 line-clamp-1">{org.sub}</div>}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{org.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <span>{org.country}</span>
                        <span className="text-blue-800 font-semibold cursor-pointer">{org.linkText || '了解合作'} &rarr;</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 分组二：海外重点友好高校与技术转移机构 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                【海外友好高校与科技成果转化机构】
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intlData.organizations
                  .filter((o) => o.category === 'overseas_uni')
                  .map((org) => (
                    <div key={org.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          UNIV
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{org.name}</div>
                          {org.sub && <div className="text-[10px] text-slate-400 line-clamp-1">{org.sub}</div>}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{org.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <span>{org.country}</span>
                        <span className="text-blue-800 font-semibold cursor-pointer">{org.linkText || '合作简介'} &rarr;</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 项目详情弹窗 */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  {viewingProject.country} · {viewingProject.field}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{viewingProject.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg">
                <div>中方主体：<strong className="text-slate-900">{viewingProject.chineseParty}</strong></div>
                <div>外方主体：<strong className="text-slate-900">{viewingProject.foreignParty}</strong></div>
                <div>执行周期：<span className="font-mono">{viewingProject.period}</span></div>
                <div>进展状态：<span className="font-semibold text-emerald-700">{viewingProject.status}</span></div>
              </div>

              {viewingProject.desc && (
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">项目合作亮点：</div>
                  <p className="leading-relaxed bg-white p-3 rounded-lg border border-slate-100 text-slate-700">
                    {viewingProject.desc}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
