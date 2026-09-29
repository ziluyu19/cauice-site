'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  MembersPageContentData,
  defaultMembersContentData,
  MemberStoryItem,
} from '@/lib/membersData';

const subNavItems = [
  { id: 'directory', label: '会员单位名录' },
  { id: 'stories', label: '会员单位风采' },
  { id: 'guide', label: '入会指引' },
  { id: 'services', label: '服务事项与办事指南' },
];

interface MemberItem {
  id: string;
  name: string;
  type: string;
  region: string;
  level: string;
  annualCheck?: string;
  contact?: string;
  desc?: string;
  createdAt?: any;
}

// ── 类别分组规则 ──
const GROUP_CONFIGS = [
  {
    key: '高等院校',
    title: '高校 / 高等院校',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    match: (type: string) => type === '高等院校' || type === '高校',
  },
  {
    key: '校办企业',
    title: '校办企业',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    match: (type: string) => type === '校办企业',
  },
  {
    key: '技术转移机构',
    title: '技术转移机构',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    match: (type: string) => type === '技术转移机构',
  },
  {
    key: '大学科技园',
    title: '大学科技园',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    match: (type: string) => type === '大学科技园',
  },
  {
    key: '其他',
    title: '其他会员单位',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    match: (type: string) => !['高等院校', '高校', '校办企业', '技术转移机构', '大学科技园'].includes(type),
  },
];

const DEFAULT_REGIONS = ['全部', '北京', '上海', '浙江', '广东', '湖北', '陕西', '天津', '江苏', '山东', '四川'];

export default function MembersPage() {
  const [activeAnchor, setActiveAnchor] = useState<string>('directory');
  const [regionFilter, setRegionFilter] = useState<string>('全部');
  const [membersList, setMembersList] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMember, setViewingMember] = useState<MemberItem | null>(null);
  const [viewingStory, setViewingStory] = useState<MemberStoryItem | null>(null);

  // 实时订阅会员频道其余3大板块配置数据（siteConfig/members，平滑支持全站后台编辑）
  const [contentData, setContentData] = useState<MembersPageContentData>(defaultMembersContentData);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const docRef = doc(db, 'siteConfig', 'members');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<MembersPageContentData>;
            setContentData({
              stories: data.stories || defaultMembersContentData.stories,
              guide: data.guide || defaultMembersContentData.guide,
              services: data.services || defaultMembersContentData.services,
            });
          }
        },
        (err) => {
          console.warn('Members siteConfig snapshot fallback:', err);
        }
      );
    } catch (e) {
      console.error('Failed to setup members siteConfig listener:', e);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // 实时订阅 Firestore 中的 members 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    // 4秒安全熔断，防止由于网络波动导致一直转圈
    const timer = setTimeout(() => {
      setLoading(false);
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
          setLoading(false);
        },
        (err) => {
          console.warn('Members query fallback to basic snapshot:', err);
          unsubscribe = onSnapshot(
            collection(db, 'members'),
            (snapshot) => {
              clearTimeout(timer);
              const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<MemberItem, 'id'>),
              }));
              setMembersList(list);
              setLoading(false);
            },
            (fallbackErr) => {
              console.warn('Members fallback error:', fallbackErr);
              clearTimeout(timer);
              setLoading(false);
            }
          );
        }
      );
    } catch (e) {
      console.error('Failed to setup members listener:', e);
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
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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

  // 动态汇集所有地区选项
  const allRegions = Array.from(
    new Set([...DEFAULT_REGIONS, ...membersList.map((m) => m.region).filter(Boolean)])
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── 顶部 Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">会员单位与服务</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              会员单位与服务大厅
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              汇聚全国高校、校办企业、技术转移机构与大学科技园，共同构建产学研国际合作生态。
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
        {/* ═══════════════════════════════════
            1. 会员单位名录（实时连接 Firestore）
        ═══════════════════════════════════ */}
        <section id="directory" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位名录</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                实时收录 {membersList.length} 家会员单位，按分类动态展示
              </span>
            </div>
          </div>

          {/* 按地区筛选器 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">按地区：</span>
              {allRegions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionFilter(r)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    regionFilter === r
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 数据加载中状态 */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>正在同步最新会员名录...</div>
            </div>
          ) : membersList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
              <p className="font-semibold text-slate-700">会员库当前暂未收录公开会员信息</p>
              <p className="text-slate-400">管理员可在后台【会员单位管理】实时录入并同步更新。</p>
            </div>
          ) : (
            /* 分组列表 */
            <div className="space-y-8">
              {GROUP_CONFIGS.map((group) => {
                const groupMembers = membersList.filter((m) => group.match(m.type));
                const filtered = regionFilter === '全部'
                  ? groupMembers
                  : groupMembers.filter((m) => m.region === regionFilter);

                if (filtered.length === 0) return null;

                return (
                  <div key={group.key} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${group.color}`}>
                        {group.title}
                      </span>
                      <span className="text-xs text-slate-400">{filtered.length} 家</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setViewingMember(m)}
                          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                                {m.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 shrink-0 font-medium">
                                {m.level || '会员单位'}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 text-xs text-slate-500">
                              <span>📍 {m.region}</span>
                              {m.annualCheck && (
                                <span className="text-[11px] text-emerald-600 font-medium">
                                  ✓ {m.annualCheck}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {m.desc || '该单位暂未补充简介内容。'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">联络对接：{m.contact ? m.contact.slice(0, 7) + '***' : '请咨询秘书处'}</span>
                            <span className="text-blue-800 font-semibold group-hover:underline">
                              查看资质详情 →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* 地区筛选无结果提示 */}
              {regionFilter !== '全部' &&
                !membersList.some((m) => m.region === regionFilter) && (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                    该地区暂无收录会员单位，请调整筛选条件。
                  </div>
                )}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════
            2. 会员单位风采
        ═══════════════════════════════════ */}
        <section id="stories" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位风采</h2>
            </div>
            <span className="text-xs text-slate-500">
              精选会员在国际合作与成果转化方面的优秀实践案例（{contentData.stories.length} 例）
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contentData.stories.map((s, idx) => (
              <div
                key={s.id || idx}
                onClick={() => setViewingStory(s)}
                className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${s.tagColor || 'bg-blue-100 text-blue-800'}`}>
                    {s.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{s.date}</span>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">{s.unit}</div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {s.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed flex-1 line-clamp-3">{s.summary}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-800 font-semibold">
                  <span>查看案例详情</span>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            3. 入会指引（唯一协会官网统一外链）
        ═══════════════════════════════════ */}
        <section id="guide" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">入会指引</h2>
            </div>
            <span className="text-xs text-slate-500">
              由中国高校校办产业协会统一受理，国专委协助推荐
            </span>
          </div>

          {/* CTA 按钮（唯一入口，严格外链） */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-blue-900 mb-1">{contentData.guide.ctaTitle}</div>
              <p className="text-xs text-blue-700 leading-relaxed">
                {contentData.guide.ctaDesc}
              </p>
            </div>
            <a
              href={contentData.guide.ctaUrl || 'https://www.caui.org.cn/'}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm transition-colors shadow-xs text-center whitespace-nowrap cursor-pointer"
            >
              {contentData.guide.ctaButtonText || '跳转协会统一入会入口 →'}
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* 入会条件 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>入会条件</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                {contentData.guide.conditions.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-800 font-bold mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 所需材料 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>申请所需材料</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                {contentData.guide.materials.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-800 font-bold mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 申请流程 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>申请办理流程</span>
              </h3>
              <ol className="space-y-3 text-xs">
                {contentData.guide.process.map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{s.step}：</span>
                      <span className="text-slate-600">{s.desc}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* 再次放置 CTA（页尾强调） */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {contentData.guide.footerNote}{' '}
              <span className="font-medium text-slate-700">{contentData.guide.contactEmail}</span>
            </p>
            <a
              href={contentData.guide.ctaUrl || 'https://www.caui.org.cn/'}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {contentData.guide.ctaButtonText || '跳转协会统一入会入口 →'}
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════
            4. 服务事项与办事指南
        ═══════════════════════════════════ */}
        <section id="services" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">服务事项与办事指南</h2>
            </div>
            <span className="text-xs text-slate-500">
              共 {contentData.services.items.length} 项对会员单位开放的专项服务
            </span>
          </div>

          {/* 移动端卡片视图 */}
          <div className="md:hidden space-y-3">
            {contentData.services.items.map((s, idx) => (
              <div key={s.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">{s.service}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 shrink-0">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400">办理方式：</span>
                    <span className="text-slate-700">{s.method}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">联络对接：</span>
                    <span className="font-medium text-blue-900">{s.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">所需材料：</span>
                    <span className="text-slate-600">{s.materials}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 桌面端服务清单表格 */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left min-w-[650px]">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap w-8">#</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[160px]">服务内容</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[160px]">办理方式</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[130px]">联系人</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">所需材料</th>
                </tr>
              </thead>
              <tbody>
                {contentData.services.items.map((s, idx) => (
                  <tr
                    key={s.id || idx}
                    className={`border-t border-slate-200 align-top ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    } hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 leading-snug">{s.service}</td>
                    <td className="px-4 py-3 text-slate-600 leading-relaxed">{s.method}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{s.contact}</td>
                    <td className="px-4 py-3 text-slate-600 leading-relaxed">{s.materials}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {contentData.services.footerNote}
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-600 shrink-0">
              <span>📞 {contentData.services.phone}</span>
              <span className="text-slate-300">|</span>
              <span>✉️ {contentData.services.email}</span>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 会员资质详情模态框 ─── */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-6">
              {/* 弹窗头部 */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {viewingMember.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {viewingMember.level || '会员单位'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {viewingMember.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 详情属性网格 */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400">所属省市：</span>
                  <span className="font-semibold text-slate-800 ml-1">{viewingMember.region}</span>
                </div>
                <div>
                  <span className="text-slate-400">年审状态：</span>
                  <span className="font-semibold text-emerald-700 ml-1">{viewingMember.annualCheck || '正常在册'}</span>
                </div>
                <div>
                  <span className="text-slate-400">会员编码：</span>
                  <span className="font-mono text-slate-600 ml-1">{viewingMember.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400">工作联络：</span>
                  <span className="font-mono text-slate-700 ml-1">{viewingMember.contact || '秘书处登记'}</span>
                </div>
              </div>

              {/* 单位简介 */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">单位简介及产业特色</h4>
                <div className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-2xs whitespace-pre-wrap">
                  {viewingMember.desc || '该会员单位正在完善中英文详细介绍与产学研合作成果。'}
                </div>
              </div>

              {/* 提示注记 */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                声明：会员名录信息由各会员单位向中国高校校办产业协会填报登记，国专委根据授权进行公开查阅展示。
              </div>

              {/* 底部按钮 */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  关闭窗口
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 会员风采案例阅读模态框 ─── */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1 pr-6">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${viewingStory.tagColor || 'bg-blue-100 text-blue-800'}`}>
                      {viewingStory.tag}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{viewingStory.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-1">
                    {viewingStory.title}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    申报/示范单位：{viewingStory.unit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingStory(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {viewingStory.summary}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>中国高校校办产业协会国际合作与交流专业委员会 · 优秀案例库</span>
                <button
                  type="button"
                  onClick={() => setViewingStory(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
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
