'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DisclosureContentData,
  defaultDisclosureContentData,
  AnnualReportItem,
} from '@/lib/disclosureData';

// ─── 子导航 ───
const subNavItems = [
  { id: 'basic', label: '基本信息' },
  { id: 'leaders', label: '负责人与机构信息' },
  { id: 'org', label: '组织机构' },
  { id: 'reports', label: '年度工作报告' },
  { id: 'credit', label: '信用承诺' },
  { id: 'activities', label: '活动与项目情况' },
  { id: 'interaction', label: '互动交流' },
];

export default function DisclosurePage() {
  const [activeAnchor, setActiveAnchor] = useState('basic');
  const [viewingReport, setViewingReport] = useState<AnnualReportItem | null>(null);

  // 信息公开数据状态（Firestore siteConfig/disclosure，保底使用预置数据）
  const [contentData, setContentData] = useState<DisclosureContentData>(defaultDisclosureContentData);
  const [loading, setLoading] = useState(true);

  // 在线互动表单
  const [formType, setFormType] = useState('咨询留言');
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // 实时订阅 siteConfig/disclosure
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      const docRef = doc(db, 'siteConfig', 'disclosure');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          clearTimeout(timer);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<DisclosureContentData>;
            setContentData({
              basicInfo: Array.isArray(data.basicInfo) && data.basicInfo.length > 0 ? data.basicInfo : defaultDisclosureContentData.basicInfo,
              leaders: Array.isArray(data.leaders) && data.leaders.length > 0 ? data.leaders : defaultDisclosureContentData.leaders,
              orgUnits: Array.isArray(data.orgUnits) && data.orgUnits.length > 0 ? data.orgUnits : defaultDisclosureContentData.orgUnits,
              annualReports: Array.isArray(data.annualReports) && data.annualReports.length > 0 ? data.annualReports : defaultDisclosureContentData.annualReports,
              credit: data.credit && Array.isArray(data.credit.commitments) && data.credit.commitments.length > 0 ? data.credit : defaultDisclosureContentData.credit,
              activities: Array.isArray(data.activities) && data.activities.length > 0 ? data.activities : defaultDisclosureContentData.activities,
              interaction: data.interaction || defaultDisclosureContentData.interaction,
            });
          } else {
            setContentData(defaultDisclosureContentData);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('siteConfig/disclosure snapshot fallback:', err);
          clearTimeout(timer);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error('Failed to setup disclosure listener:', e);
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // 滚动监听，自动高亮当前阅读的子栏目
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveAnchor(subNavItems[subNavItems.length - 1].id);
        return;
      }
      const scrollPosition = window.scrollY + 240;
      for (let i = subNavItems.length - 1; i >= 0; i--) {
        const item = subNavItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveAnchor(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContact.trim() || !formContent.trim()) {
      setSubmitFeedback('请完整填写您的姓名/单位、联系方式及具体留言内容');
      return;
    }

    setSubmittingInquiry(true);
    setSubmitFeedback(null);

    try {
      await addDoc(collection(db, 'inquiries'), {
        type: formType,
        name: formName.trim(),
        contact: formContact.trim(),
        content: formContent.trim(),
        status: '待审核办理',
        createdAt: serverTimestamp(),
      });
      setSubmitFeedback('留言提交成功！秘书处将在承诺时限内（3个工作日内）核实并答复。');
      setFormName('');
      setFormContact('');
      setFormContent('');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setSubmitFeedback('提交失败：' + (err.message || '请稍后重试或通过邮箱直接联系秘书处'));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">信息公开</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              信息公开与行业监督平台
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              严格执行民政部、教育部及中国高校校办产业协会自律规范，规范办会、阳光运作、全面受社会监督。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 粘性子导航 ─── */}
      <div className="sticky top-[108px] lg:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-2.5">
            {subNavItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToAnchor(e, item.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                  activeAnchor === item.id
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
        {/* ════════════════════════════════
            1. 基本信息
        ════════════════════════════════ */}
        <section
          id="basic"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">基本信息</h2>
            </div>
            <span className="text-xs text-slate-500">法定登记设立依据与核心办会属性信息公示</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentData.basicInfo.map((info, idx) => (
              <div
                key={info.id || idx}
                className={`p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 ${
                  idx === 2 || idx === 3 ? 'md:col-span-2' : ''
                }`}
              >
                <div className="text-xs font-semibold text-blue-900 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                  <span>{info.label}</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-sans pl-3 border-l-2 border-slate-200">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            2. 负责人与机构信息
        ════════════════════════════════ */}
        <section
          id="leaders"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">负责人与机构信息</h2>
            </div>
            <span className="text-xs text-slate-500">国专委主要负责人名单、履职分工及职务变动记录</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {contentData.leaders.map((leader, idx) => (
              <div
                key={leader.id || idx}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    {leader.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">在任</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{leader.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {leader.title} · {leader.org}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{leader.desc}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="font-semibold text-slate-700">任免与变动记录：</span>
                  {leader.changeRecord}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            3. 组织机构
        ════════════════════════════════ */}
        <section
          id="org"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">组织机构架构</h2>
            </div>
            <span className="text-xs text-slate-500">国专委管理运转体系与内设执行部门一览</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {contentData.orgUnits.map((org, idx) => (
              <div
                key={org.id || idx}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs">
                    {org.number}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{org.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{org.desc}</p>
                </div>
                {org.linkUrl ? (
                  <Link
                    href={org.linkUrl}
                    className="inline-flex items-center text-xs font-semibold text-blue-800 hover:underline"
                  >
                    <span>{org.linkText || '查看详情'}</span>
                    <span className="ml-1">→</span>
                  </Link>
                ) : (
                  <div className="text-xs text-slate-500 p-2.5 rounded bg-white border border-slate-200">
                    {org.footerNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            4. 年度工作报告
        ════════════════════════════════ */}
        <section
          id="reports"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">年度工作报告</h2>
            </div>
            <span className="text-xs text-slate-500">逐年公布工作开展成效、活动明细及下一年度规划</span>
          </div>

          <div className="space-y-4">
            {contentData.annualReports.map((r, idx) => (
              <div
                key={r.id || idx}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      {r.year}
                    </span>
                    <span className="text-xs text-slate-400">公示日期：{r.publishDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setViewingReport(r)}
                      className="px-3 py-1 rounded border border-blue-300 text-blue-800 text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      查看报告全文 →
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{r.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-700 block">开展情况与主要成效：</span>
                    <p className="text-slate-600 leading-relaxed">{r.summary}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/60 space-y-1">
                    <span className="font-semibold text-blue-900 block">下一年度主要工作计划：</span>
                    <p className="text-blue-800 leading-relaxed">{r.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            5. 信用承诺
        ════════════════════════════════ */}
        <section
          id="credit"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                诚信履职与服务收费公开承诺
              </h2>
            </div>
            <span className="text-xs text-slate-500">{contentData.credit.subtitle}</span>
          </div>

          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-4">
            <h3 className="text-sm font-bold text-blue-950">{contentData.credit.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
              {contentData.credit.commitments.map((c, idx) => (
                <div key={c.id || idx} className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center space-x-1">
                    <span className="text-blue-800">■</span>
                    <span>{c.title}</span>
                  </span>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            6. 活动与项目情况
        ════════════════════════════════ */}
        <section
          id="activities"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">重点活动与项目情况公开</h2>
            </div>
            <Link
              href="/international#projects"
              className="text-xs font-semibold text-blue-800 hover:underline"
            >
              查看全部国际合作项目 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentData.activities.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.time}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <div className="text-xs text-slate-500">📍 实施地点：{item.location}</div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">成效：</span>
                  {item.result}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            7. 互动交流（带实时 Firestore 留言提交）
        ════════════════════════════════ */}
        <section
          id="interaction"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">互动交流与建言监督</h2>
            </div>
            <span className="text-xs text-slate-500">明示具体办理时限，切实保障公众知情权与参与监督权</span>
          </div>

          {/* 子模块一：意见征集 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-800" />
                <h3 className="text-sm font-bold text-slate-900">意见征集专栏（公开听取行业建言）</h3>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 self-start sm:self-auto">
                规定要求：征集结束后15个工作日内向社会公布采用情况
              </span>
            </div>

            <div className="space-y-3">
              {contentData.interaction.solicitations.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          item.status === '进行中'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-400">截止日期：{item.deadline}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">反馈途径与方式：</span>
                    {item.method}
                  </p>
                  <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed font-medium">
                    📌 {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 子模块二：咨询留言公开选登 */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">咨询留言公开选登（办理时限公开）</h3>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                公示办理时限：常见咨询不超过3个工作日答复反馈
              </span>
            </div>

            <div className="space-y-4">
              {contentData.interaction.messageInquiries.map((inq, idx) => (
                <div
                  key={inq.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-700">留言人：{inq.user}</span>
                    <span className="font-mono">提交时间：{inq.date}</span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed">
                    <span className="font-bold text-blue-900">问：</span>
                    {inq.question}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="flex items-center justify-between font-semibold text-emerald-800">
                      <span>国专委秘书处答复：</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        答复时间：{inq.replyDate}
                      </span>
                    </div>
                    <p className="text-slate-600">{inq.reply}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 子模块三：在线提交留言与纠错通道（实时写入 Firestore） */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-800" />
              <h3 className="text-sm font-bold text-slate-900">
                在线提交咨询留言 / 征集建言 / 网站纠错
              </h3>
            </div>

            <form
              onSubmit={handleInquirySubmit}
              className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 text-xs"
            >
              {submitFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs font-medium ${
                    submitFeedback.includes('成功')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {submitFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">反馈事项类别 *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="咨询留言">咨询留言（承诺3工作日内答复）</option>
                    <option value="意见建言">行业意见征集建言</option>
                    <option value="网站纠错">网站内容勘误与纠错（承诺1日核实）</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">姓名 / 单位全称 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="如：某高校科技处 张老师"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">联系电话 / 电子邮箱 *</label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="如：010-XXXX / user@domain.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">具体事项说明 *</label>
                <textarea
                  rows={3}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="请详细描述您的咨询事项、征集意见或纠错问题线索（附页面链接及具体出处）..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-400">
                  提交的信息将同步存入国专委秘书处诉求池，全程受协会监督委员会督办。
                </span>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingInquiry ? '正在提交...' : '确认在线提交'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* ─── 年度报告全文模态框 ─── */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900">
                    {viewingReport.year}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {viewingReport.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    公示日期：{viewingReport.publishDate}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans">
                {viewingReport.fullContent || viewingReport.summary}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
