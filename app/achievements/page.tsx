'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
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

// ─── 子导航 ───
const subNavItems = [
  { id: 'tech-results', label: '科技成果与技术需求' },
  { id: 'standards', label: '团体标准 T/CAUI' },
  { id: 'reports', label: '研究报告' },
  { id: 'cases', label: '典型案例' },
  { id: 'experts', label: '专家库' },
  { id: 'training', label: '培训与人才' },
];

export default function AchievementsPage() {
  const [activeAnchor, setActiveAnchor] = useState('tech-results');
  const [techTab, setTechTab] = useState<'results' | 'demands'>('results');
  const [expertField, setExpertField] = useState('全部');
  const [expertCountry, setExpertCountry] = useState('全部');

  // 成果与智库统一配置（来自 Firestore siteConfig/achievements，保底使用 defaultAchievementsContentData）
  const [contentData, setContentData] = useState<AchievementsContentData>(defaultAchievementsContentData);
  const [loading, setLoading] = useState(true);

  // 兼容可能存在的旧版 achievements 集合项
  const [legacyItems, setLegacyItems] = useState<TechItem[]>([]);

  // 详情模态框
  const [viewingItem, setViewingItem] = useState<{
    category: string;
    title: string;
    unit?: string;
    field?: string;
    maturity?: string;
    status?: string;
    date?: string;
    contact?: string;
    summary?: string;
  } | null>(null);

  // 实时订阅 siteConfig/achievements
  useEffect(() => {
    let unsubscribeConfig: () => void = () => {};

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      const docRef = doc(db, 'siteConfig', 'achievements');
      unsubscribeConfig = onSnapshot(
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
          console.warn('siteConfig/achievements snapshot fallback:', err);
          clearTimeout(timer);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error('Failed to setup siteConfig listener:', e);
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribeConfig();
    };
  }, []);

  // 兼容订阅 legacy achievements 集合
  useEffect(() => {
    let unsubscribeLegacy: () => void = () => {};
    try {
      const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'));
      unsubscribeLegacy = onSnapshot(
        q,
        (snapshot) => {
          const list: TechItem[] = snapshot.docs.map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              category: (d.category === '技术需求' ? '技术需求' : '科技成果') as '科技成果' | '技术需求',
              title: d.title || '',
              unit: d.unit || '',
              field: d.field || '智能制造',
              maturity: d.maturity || '',
              status: d.status || '寻求合作',
              summary: d.summary || '',
              contact: d.contact || '',
              date: d.date || '',
            };
          });
          setLegacyItems(list);
        },
        (err) => {
          console.warn('Legacy achievements query fallback:', err);
        }
      );
    } catch (e) {
      console.warn('Failed to subscribe legacy achievements:', e);
    }

    return () => {
      unsubscribeLegacy();
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

  // 组合科技成果列表
  const rawResults = contentData.techItems.filter((i) => i.category === '科技成果');
  const legacyResults = legacyItems.filter((i) => i.category === '科技成果' && !rawResults.some((r) => r.id === i.id));
  const displayResults = [...rawResults, ...legacyResults];

  // 组合技术需求列表
  const rawDemands = contentData.techItems.filter((i) => i.category === '技术需求');
  const legacyDemands = legacyItems.filter((i) => i.category === '技术需求' && !rawDemands.some((r) => r.id === i.id));
  const displayDemands = [...rawDemands, ...legacyDemands];

  // 动态提取专家领域的筛选选项
  const expertFields = [
    '全部',
    ...Array.from(new Set(contentData.experts.map((e) => e.field).filter(Boolean))),
  ];
  const expertCountries = [
    '全部',
    ...Array.from(new Set(contentData.experts.map((e) => e.country).filter(Boolean))),
  ];

  const filteredExperts = contentData.experts.filter((e) => {
    if (expertField !== '全部' && e.field !== expertField) return false;
    if (expertCountry !== '全部' && e.country !== expertCountry) return false;
    return true;
  });

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
            <span className="text-white font-medium">成果与智库</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              科技成果与智库平台
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              汇聚高校创新成果、标准研制、专家资源与产学研典型实践，服务国际产业转化全链条。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 子导航 ─── */}
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
            1. 科技成果与技术需求
        ════════════════════════════════ */}
        <section
          id="tech-results"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">科技成果与技术需求</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                实时对接数据库，共展示 {displayResults.length + displayDemands.length} 项成果与需求
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {[
              { id: 'results', label: `科技成果（供方 · ${displayResults.length}）` },
              { id: 'demands', label: `技术需求（需方 · ${displayDemands.length}）` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTechTab(t.id as 'results' | 'demands')}
                className={`px-5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  techTab === t.id
                    ? 'border-blue-800 text-blue-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 成果列表 */}
          {techTab === 'results' && (
            <>
              {displayResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">暂无科技成果展示</div>
              ) : (
                <>
                  {/* 移动端卡片视图 */}
                  <div className="md:hidden space-y-3">
                    {displayResults.map((r, i) => (
                      <div key={r.id || i} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-medium">
                              {r.field}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {r.maturity || 'TRL 阶段论证'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                            {r.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{r.title}</h4>
                          {r.summary && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {r.summary}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-slate-500">研发单位：{r.unit}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setViewingItem({
                                category: '科技成果',
                                title: r.title,
                                unit: r.unit,
                                field: r.field,
                                maturity: r.maturity,
                                status: r.status,
                                date: r.date,
                                contact: r.contact,
                                summary: r.summary,
                              })
                            }
                            className="px-3 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold transition-colors cursor-pointer text-xs"
                          >
                            查看详情 →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 桌面端表格 */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left min-w-[650px]">
                      <thead>
                        <tr className="bg-blue-900 text-white">
                          <th className="px-4 py-3 font-semibold min-w-[220px]">成果名称</th>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[140px]">研发单位</th>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">技术领域</th>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">成熟度</th>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">转化意向</th>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayResults.map((r, i) => (
                          <tr
                            key={r.id || i}
                            className={`align-middle ${
                              i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            } hover:bg-blue-50/50 transition-colors`}
                          >
                            <td className="px-4 py-3.5 font-semibold text-slate-900 leading-snug">
                              {r.title}
                              {r.summary && (
                                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                                  {r.summary}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{r.unit}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium whitespace-nowrap">
                                {r.field}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                              {r.maturity || 'TRL 阶段论证'}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium whitespace-nowrap">
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() =>
                                  setViewingItem({
                                    category: '科技成果',
                                    title: r.title,
                                    unit: r.unit,
                                    field: r.field,
                                    maturity: r.maturity,
                                    status: r.status,
                                    date: r.date,
                                    contact: r.contact,
                                    summary: r.summary,
                                  })
                                }
                                className="px-3 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold transition-colors cursor-pointer text-xs"
                              >
                                查看详情 →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* 需求列表 */}
          {techTab === 'demands' && (
            <>
              {displayDemands.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">暂无技术需求展示</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayDemands.map((d, i) => (
                    <div
                      key={d.id || i}
                      onClick={() =>
                        setViewingItem({
                          category: '技术需求',
                          title: d.title,
                          unit: d.unit,
                          field: d.field,
                          maturity: d.maturity,
                          status: d.status,
                          date: d.date,
                          contact: d.contact,
                          summary: d.summary,
                        })
                      }
                      className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                            海外需求
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                            {d.field}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                            {d.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{d.title}</h3>
                        <p className="text-xs text-slate-500">发布主体：{d.unit}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {d.summary || '暂无更多需求详细说明。'}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">对接咨询</span>
                        <span className="text-amber-800 font-semibold">响应对接 →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ════════════════════════════════
            2. 团体标准 T/CAUI
        ════════════════════════════════ */}
        <section
          id="standards"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">团体标准 T/CAUI</h2>
            </div>
            <span className="text-xs text-slate-500">由国专委联合研制，经中国高校校办产业协会正式发布</span>
          </div>

          <div className="space-y-3">
            {contentData.standards.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">暂无团体标准发布</div>
            ) : (
              contentData.standards.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-900">{s.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {s.type}
                      </span>
                      <span className="text-xs text-slate-400">{s.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">《{s.title}》</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                  {s.linkUrl ? (
                    <a
                      href={s.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-4 py-1.5 rounded-lg border border-blue-300 text-blue-800 text-xs font-semibold hover:bg-blue-50 transition-colors self-start"
                    >
                      全文入口 →
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setViewingItem({
                          category: '团体标准',
                          title: s.title,
                          unit: '中国高校校办产业协会',
                          field: s.code,
                          status: s.type,
                          date: s.date,
                          summary: s.desc,
                        })
                      }
                      className="shrink-0 px-4 py-1.5 rounded-lg border border-blue-300 text-blue-800 text-xs font-semibold hover:bg-blue-50 transition-colors self-start cursor-pointer"
                    >
                      标准详情 →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ════════════════════════════════
            3. 研究报告
        ════════════════════════════════ */}
        <section
          id="reports"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">研究报告</h2>
            </div>
            <span className="text-xs text-slate-500">国别产学研环境研究、成果转化专题分析与政策解读</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contentData.reports.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">暂无研究报告</div>
            ) : (
              contentData.reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() =>
                    setViewingItem({
                      category: '研究报告',
                      title: r.title,
                      unit: r.unit || '国专委智库课题组',
                      field: (r.tags && r.tags.join(' / ')) || '政策智库',
                      status: '已发布',
                      date: r.date,
                      contact: r.contact || 'secretariat@guozhuanwei.org.cn',
                      summary: r.summary,
                    })
                  }
                  className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group space-y-3 cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {r.tags &&
                      r.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    <span className="text-xs text-slate-400 ml-auto">{r.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug flex-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{r.summary}</p>
                  <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-blue-800 group-hover:underline">
                    查看报告详情 →
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ════════════════════════════════
            4. 典型案例
        ════════════════════════════════ */}
        <section
          id="cases"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">典型案例</h2>
            </div>
            <span className="text-xs text-slate-500">完整记录国际合作与成果转化路径、成效</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contentData.cases.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">暂无案例收录</div>
            ) : (
              contentData.cases.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-4 group"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        c.tagColor || 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {c.tag}
                    </span>
                    <span className="text-xs text-slate-400">{c.unit}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {c.title}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-semibold text-slate-700 block">案例背景</span>
                      <p className="text-slate-600 leading-relaxed">{c.bg}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200/60 space-y-1">
                      <span className="font-semibold text-blue-800 block">转化路径</span>
                      <p className="text-blue-700 leading-relaxed">{c.path}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/60 space-y-1">
                      <span className="font-semibold text-emerald-800 block">取得成效</span>
                      <p className="text-emerald-700 leading-relaxed">{c.result}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ════════════════════════════════
            5. 专家库
        ════════════════════════════════ */}
        <section
          id="experts"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">专家库</h2>
            </div>
            <span className="text-xs text-slate-500">
              显示 {filteredExperts.length} / {contentData.experts.length} 位在库专家
            </span>
          </div>

          {/* 双维筛选器 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">专业领域：</span>
              {expertFields.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setExpertField(f)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    expertField === f
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">国别：</span>
              {expertCountries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setExpertCountry(c)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    expertCountry === c
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 专家卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredExperts.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-400">
                暂无符合筛选条件的专家
              </div>
            ) : (
              filteredExperts.map((e, i) => (
                <div
                  key={e.id || i}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-800 to-slate-700 text-white flex items-center justify-center text-base font-bold mx-auto shadow">
                    {e.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{e.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{e.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{e.unit}</div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {e.field}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {e.country}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">工作语言：{e.langs}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ════════════════════════════════
            6. 培训与人才
        ════════════════════════════════ */}
        <section
          id="training"
          className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">培训与人才</h2>
            </div>
            <span className="text-xs text-slate-500">涉外业务能力培训与国际合作实务课程</span>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>课程预告</span>
            </div>
            {contentData.trainings.filter((t) => t.type === '课程预告').length === 0 ? (
              <div className="py-4 text-xs text-slate-400 pl-4">近期暂无排期中的预告课程</div>
            ) : (
              contentData.trainings
                .filter((t) => t.type === '课程预告')
                .map((t, i) => (
                  <div
                    key={t.id || i}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                        课程预告
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                        {t.tag}
                      </span>
                      <span className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">
                        📅 {t.date} · 📍 {t.location}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                  </div>
                ))
            )}
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>精彩回顾</span>
            </div>
            {contentData.trainings.filter((t) => t.type === '精彩回顾').length === 0 ? (
              <div className="py-4 text-xs text-slate-400 pl-4">暂无历史培训回顾内容</div>
            ) : (
              contentData.trainings
                .filter((t) => t.type === '精彩回顾')
                .map((t, i) => (
                  <div
                    key={t.id || i}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                        精彩回顾
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                        {t.tag}
                      </span>
                      <span className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">
                        📅 {t.date} · 📍 {t.location}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>

      {/* ─── 成果 / 智库详细信息模态框 ─── */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {viewingItem.category}
                    </span>
                    {viewingItem.status && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {viewingItem.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {viewingItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {viewingItem.unit && (
                  <div>
                    <span className="text-slate-400">所属单位：</span>
                    <span className="font-semibold text-slate-800 ml-1">{viewingItem.unit}</span>
                  </div>
                )}
                {viewingItem.field && (
                  <div>
                    <span className="text-slate-400">技术领域：</span>
                    <span className="font-semibold text-blue-800 ml-1">{viewingItem.field}</span>
                  </div>
                )}
                {viewingItem.maturity && (
                  <div>
                    <span className="text-slate-400">成熟度/阶段：</span>
                    <span className="text-slate-700 ml-1">{viewingItem.maturity}</span>
                  </div>
                )}
                {viewingItem.date && (
                  <div>
                    <span className="text-slate-400">发布日期：</span>
                    <span className="font-mono text-slate-600 ml-1">{viewingItem.date}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-slate-400">对接联络：</span>
                  <span className="font-mono text-slate-700 ml-1">
                    {viewingItem.contact || '国专委秘书处协调对接'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">详细描述与合作说明</h4>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {viewingItem.summary || '该项目暂未登记详细全文描述。如需接洽，请联系国专委秘书处。'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
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
