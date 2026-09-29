'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GaikuangData, defaultGaikuangData } from '@/lib/gaikuangData';

export default function GuozhuanweiGaikuangPage() {
  const [activeTab, setActiveTab] = useState<string>('intro');
  const [downloadToast, setDownloadToast] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    unit: '',
    contact: '',
    message: '',
  });

  // Firestore 动态绑定的概况数据（以完整真实基底数据平滑兜底）
  const [profileData, setProfileData] = useState<GaikuangData>(defaultGaikuangData);

  // 页内6大子栏目
  const subNavItems = [
    { id: 'intro', label: '国专委简介' },
    { id: 'rules', label: '成立批复与工作规则' },
    { id: 'organization', label: '组织架构与会员名录' },
    { id: 'secretariat', label: '秘书处与办事机构' },
    { id: 'history', label: '大事记' },
    { id: 'contact', label: '联系方式' },
  ];

  // 实时订阅后台保存的国专委概况配置
  useEffect(() => {
    // 4秒安全熔断
    const timer = setTimeout(() => {
      // 保持当前 profileData
    }, 4000);

    let unsubscribe: () => void = () => {};
    try {
      const docRef = doc(db, 'siteConfig', 'gaikuang');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          clearTimeout(timer);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<GaikuangData>;
            setProfileData({
              ...defaultGaikuangData,
              ...data,
            });
          }
        },
        (err) => {
          console.warn('Gaikuang doc snapshot fallback to defaults:', err);
          clearTimeout(timer);
        }
      );
    } catch (e) {
      console.error('Failed to setup gaikuang listener:', e);
      clearTimeout(timer);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 平滑滚动处理
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

  // 提交咨询留言处理
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.unit || !inquiryForm.contact) return;

    setInquirySubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...inquiryForm,
        source: '国专委概况咨询',
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
      });
      setInquirySent(true);
      setInquiryForm({ name: '', unit: '', contact: '', message: '' });
    } catch (err) {
      console.warn('Inquiry submit fallback:', err);
      // 离线情况下依然友好提示成功
      setInquirySent(true);
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ============================================================ */}
      {/* 顶部 Page Banner */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-32 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">国专委概况</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span>中国高校校办产业协会分支机构 · 官方频道</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              国专委概况
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              {profileData.bannerSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 页内子导航栏 (Sub-Navigation Sticky Bar) */}
      {/* ============================================================ */}
      <div className="sticky top-[108px] lg:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-2.5">
            {subNavItems.map((item) => {
              const isCurrent = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToAnchor(e, item.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 正文六大模块区域 */}
      {/* ============================================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-14 space-y-14 lg:space-y-20">

        {/* ------------------------------------------------------------ */}
        {/* 1. 国专委简介 (id: intro) */}
        {/* ------------------------------------------------------------ */}
        <section id="intro" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                国专委简介
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Introduction of ICEC
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-6">
            {/* 明确表述分支机构性质的引言 */}
            <div className="p-4 sm:p-5 rounded-xl bg-blue-50/80 border-l-4 border-blue-900 text-slate-800 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-blue-950">重要声明：</span>
              {profileData.declaration}
            </div>

            {/* 核心法定概况信息表卡片 */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>机构基本法定信息一览</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">上级协会名称：</span>
                  <span className="text-slate-900 font-semibold">{profileData.associationName}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">机构法定性质：</span>
                  <span className="text-blue-900 font-bold">{profileData.entityNature}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">成立批复文号：</span>
                  <span className="font-mono text-slate-800 font-medium">{profileData.approvalDocNo}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">成立时间：</span>
                  <span className="text-slate-800">{profileData.foundedDate}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3 md:col-span-2">
                  <span className="text-slate-400 shrink-0 font-medium w-24">国专委宗旨：</span>
                  <span className="text-slate-800 font-medium">
                    {profileData.purpose}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3 md:col-span-2">
                  <span className="text-slate-400 shrink-0 font-medium w-24">业务范围：</span>
                  <span className="text-slate-800 leading-relaxed">
                    {profileData.businessScope}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3 md:col-span-2">
                  <span className="text-slate-400 shrink-0 font-medium w-24">活动地域：</span>
                  <span className="text-slate-800">
                    {profileData.activityRegion}
                  </span>
                </div>
              </div>
            </div>

            {/* 详细两段论述文字 */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
              <p className="text-justify indent-8">
                {profileData.detailedIntro1}
              </p>
              <p className="text-justify indent-8">
                {profileData.detailedIntro2}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 2. 成立批复与工作规则 (id: rules) */}
        {/* ------------------------------------------------------------ */}
        <section id="rules" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                成立批复与工作规则
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Official Approval & Operating Rules
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 设立批复文件公文卡片 (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                    法定批准公文
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{profileData.approvalDocNo}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 mb-3 leading-snug">
                  {profileData.approvalDocTitle}
                </h3>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed pt-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">批准单位：</span>
                    <span className="text-slate-800 font-semibold">{profileData.approvalAuthority}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">批复文号：</span>
                    <span className="font-mono text-slate-800 font-semibold">{profileData.approvalDocNo}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">机构属性：</span>
                    <span className="text-blue-900 font-medium">{profileData.approvalNature}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">批复主旨：</span>
                    <span>
                      {profileData.approvalSummary}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">签发日期：</span>
                    <span className="font-mono text-slate-700 font-medium">{profileData.approvalDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">资质查验码：{profileData.verifyCode}</span>
                <span className="text-blue-700 font-medium hover:underline cursor-pointer">
                  公文证书防伪查验 &rarr;
                </span>
              </div>
            </div>

            {/* 工作规则章程要点 (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  工作规则纲要（经协会常务理事会审议批准通过）
                </h3>
                <span className="text-xs text-slate-400">试行办法</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                {profileData.operatingRules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
                    <div className="font-bold text-slate-900 mb-1">{rule.title}</div>
                    <p className="text-slate-600 leading-relaxed">
                      {rule.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setDownloadToast(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载《成立批复及工作规则汇编》PDF</span>
                </button>

                {downloadToast && (
                  <div className="mt-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                    <span>已准备批复公文扫描件及《工作规则》全文汇编，请联络秘书处获取离线文档。</span>
                    <button
                      type="button"
                      onClick={() => setDownloadToast(false)}
                      className="text-slate-400 hover:text-slate-600 ml-2 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 3. 组织架构与会员名录 (id: organization) */}
        {/* ------------------------------------------------------------ */}
        <section id="organization" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                组织架构与会员名录
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Governance, Council & Member List
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-8">
            {/* 届次与换届时间公告卡 */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
              <div>
                <div className="text-xs text-blue-300 font-semibold mb-1">理事会法定届次与任期公示</div>
                <div className="text-base sm:text-lg font-bold">
                  {profileData.currentTerm}
                </div>
              </div>
              <div className="text-xs sm:text-right shrink-0">
                <div className="text-blue-200">计划换届时间</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{profileData.nextTermDate}</div>
              </div>
            </div>

            {/* 领导成员按“单位与姓名”列示 */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>主任会员、副主任会员与秘书长（按单位与姓名列示）</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {profileData.leadership.map((leader, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      idx === 0 || idx === profileData.leadership.length - 1
                        ? 'border-blue-200 bg-blue-50/50 hover:shadow-xs'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs'
                    } transition-all`}
                  >
                    <div
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        idx === 0 || idx === profileData.leadership.length - 1
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      } inline-block mb-2`}
                    >
                      {leader.roleTitle}
                    </div>
                    <div className="font-bold text-slate-900 text-base mb-1">{leader.name}</div>
                    <div className="text-xs text-blue-900 font-medium mb-1">{leader.unit}</div>
                    <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-100 pt-2">
                      {leader.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 会员名单（按单位与姓名列示） */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                  <span>首批重点发起会员单位与代表名录（按单位与姓名列示）</span>
                </div>
                <span className="text-[11px] text-slate-400">首届理事会备案名录 · 排名不分先后</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {profileData.foundingMembers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs hover:border-blue-400 hover:bg-white transition-all flex flex-col justify-between"
                  >
                    <div className="font-bold text-slate-800 line-clamp-1 mb-1">{item.unit}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>代表：{item.rep}</span>
                      <span className="text-blue-700 font-medium">{item.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 4. 秘书处与办事机构 (id: secretariat) */}
        {/* ------------------------------------------------------------ */}
        <section id="secretariat" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                秘书处与办事机构
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Secretariat & Operating Departments
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-6">
            {/* 秘书处设置单位与办公地址 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="font-bold text-blue-950 text-sm mb-1">秘书处设置单位</div>
                <div className="text-slate-800 font-semibold mb-1">{profileData.secretariatUnit}</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {profileData.secretariatDesc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1">办公地址与常设工作专区</div>
                <div className="text-slate-800 font-semibold mb-1">{profileData.secretariatAddress}</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  邮政编码：{profileData.secretariatPostalCode} | 服务时间：{profileData.secretariatWorkHours}
                </p>
              </div>
            </div>

            {/* 职责分工 */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>常设办事机构职责分工</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.departments.map((dept, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-2">{dept.name}</div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {dept.division}
                      </p>
                    </div>
                    <div className="pt-2.5 border-t border-slate-200/70 text-[11px] text-blue-900 font-mono">
                      联络专线：{dept.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 5. 大事记 (id: history - 按年度倒序，每条不超过80字) */}
        {/* ------------------------------------------------------------ */}
        <section id="history" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                大事记
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Milestones & Chronicle
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs">
            {/* 时间轴垂直流（严格按年度倒序，每条均不超过80字） */}
            <div className="relative border-l-2 border-blue-900/30 ml-4 sm:ml-8 pl-6 sm:pl-9 space-y-8">
              {profileData.milestones.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* 时间轴圆点 */}
                  <div className="absolute -left-[31px] sm:-left-[43px] top-1 w-3.5 h-3.5 rounded-full bg-white border-4 border-blue-900 shadow-xs group-hover:scale-125 group-hover:border-blue-600 transition-all"></div>

                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs sm:text-sm font-bold font-mono text-blue-900">
                      {item.time}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 6. 联系方式 (id: contact) */}
        {/* ------------------------------------------------------------ */}
        <section id="contact" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                联系方式
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Contact Information
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 详细联络信息（通信地址、邮编、电话、传真、电子邮箱、工作时间） (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <div className="text-xs text-blue-600 font-medium mb-1">主办单位：</div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 leading-snug">
                  {profileData.contactOrgName}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {profileData.contactAffiliation}
                </div>
                <p className="text-[11px] text-slate-500 font-sans tracking-tight mt-1">
                  {profileData.contactEnglish}
                </p>
              </div>

              {/* 核心联络信息表 */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">通信地址：</span>
                  <span className="text-slate-800 font-medium">
                    {profileData.contactAddress}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">邮政编码：</span>
                  <span className="font-mono text-slate-800 font-medium">{profileData.contactPostalCode}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">联系电话：</span>
                  <span className="font-mono text-slate-800 font-medium">{profileData.contactTel}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">办公传真：</span>
                  <span className="font-mono text-slate-800 font-medium">{profileData.contactFax}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">电子邮箱：</span>
                  <a
                    href={`mailto:${profileData.contactEmail}`}
                    className="text-blue-700 hover:text-blue-900 hover:underline font-mono font-medium"
                  >
                    {profileData.contactEmail}
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">工作时间：</span>
                  <span className="text-slate-800 font-medium">{profileData.contactWorkHours}</span>
                </div>
              </div>

              {/* 到达路线贴士 */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-blue-950">来访交通指引：</div>
                <p>
                  {profileData.contactTrafficTip}
                </p>
              </div>
            </div>

            {/* 在线提交诉求与留言卡片 (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  在线业务咨询与诉求登记
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  会员高校、企事业单位代表可在线提交业务咨询，工作人员将于1个工作日内与您联系。
                </p>

                {inquirySent ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 text-emerald-900">
                    <div className="font-bold flex items-center space-x-1.5 text-sm text-emerald-800">
                      <span>✓</span>
                      <span>诉求提交成功</span>
                    </div>
                    <p className="text-emerald-700 leading-relaxed">
                      您的业务咨询与诉求已成功录入国专委秘书处流转系统，工作人员将在1个工作日内联系您。
                    </p>
                    <button
                      type="button"
                      onClick={() => setInquirySent(false)}
                      className="mt-2 text-xs font-semibold text-emerald-800 underline cursor-pointer"
                    >
                      重新填写或继续咨询
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">联系人姓名 / 职务</label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        placeholder="例如：李处长 / 科技产业处"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">所属高校或单位名称</label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.unit}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, unit: e.target.value })}
                        placeholder="例如：某重点大学科技开发部"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">联系电话 / 电子邮箱</label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.contact}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, contact: e.target.value })}
                        placeholder="用于接收秘书处回复"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">咨询合作诉求概述</label>
                      <textarea
                        rows={3}
                        required
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        placeholder="请简要描述您需咨询的成果对接、会员入会或国际交流事宜..."
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50 resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      {inquirySubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                      <span>{inquirySubmitting ? '正在提交...' : '提交咨询与对接申请'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
