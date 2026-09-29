'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  issuer: string;
  date: string;
  status: string;
  summary: string;
  content: string;
  deadline?: string;
  createdAt?: any;
}

// ─── 子导航 ───
const subNavItems = [
  { id: 'latest', label: '最新通知公告' },
  { id: 'dispatch', label: '对外发文' },
  { id: 'projects', label: '项目申报' },
  { id: 'activities', label: '活动报名' },
  { id: 'policies', label: '政策法规' },
  { id: 'guide', label: '办理须知' },
];

// 基础预设通知数据（平滑兜底保障）
const defaultNoticesList: NoticeItem[] = [
  {
    id: 'notice-1',
    title: '关于开展2026年度“高校校办产业科技创新与国际协同”卓越成果征集评选的通知',
    category: '项目申报',
    issuer: '国专委秘书处 / 科技协同工作组',
    date: '2026-09-21',
    status: '进行中',
    deadline: '2026-10-31',
    summary: '面向全国各高校会员单位及校办高新技术企业，组织遴选一批具备国际顶尖水平的产学研科技成果与标杆案例，并择优给予重点海外路演推荐。',
    content: '为贯彻落实国家关于深化高校产教融合与科技成果转移转化的决策部署，中国高校校办产业协会国际合作与交流专业委员会现启动2026年度科技创新与国际协同卓越成果征集工作。\n\n一、申报对象：全国高校校办产业会员单位、高校直属高新技术企业及大学科技园在孵企业。\n二、支持方向：新一代信息技术、高端装备制造、绿色新能源与生物医药等前沿重点领域。\n三、材料报送：请于2026年10月31日前将申报表加盖单位公章后报送至秘书处邮箱。',
  },
  {
    id: 'notice-2',
    title: '2026年第二批入会申请会员单位资质审核通过名单及公示公告',
    category: '对外发文',
    issuer: '中国高校校办产业协会国专委会员服务部',
    date: '2026-09-19',
    status: '公示中',
    deadline: '2026-09-26',
    summary: '根据《协会章程》及会员管理办法，经秘书处初审及会长办公会复核，现将通过资质审核的42家拟入会高校科技产业机构名单向社会正式公示。',
    content: '根据民政部关于社会团体会员管理及信息公开的有关规定，现将2026年第二批拟吸纳为中国高校校办产业协会国际合作与交流专业委员会会员单位的名单予以公示。\n\n公示期为7个自然日（2026年9月19日至9月26日）。公示期间任何单位或个人如对公示单位资质存有异议，均可通过书面形式向秘书处监督委员会反映。',
  },
  {
    id: 'notice-3',
    title: '关于举办第十二期全国高校科技成果转移转化与国际合规专家研讨班的报名通告',
    category: '活动报名',
    issuer: '国专委国际交流部 / 人才发展专班',
    date: '2026-09-14',
    status: '进行中',
    deadline: '2026-10-10',
    summary: '为提升各高校校办产业知识产权出海战略布局与涉外法律合规能力，特邀科技部、知识产权局及跨国律所资深专家进行专题辅导与案例研习。',
    content: '随着高校科技产业国际合作的不断深入，涉外技术转让与知识产权保护面临新形势与新要求。国专委定于2026年10月中旬在上海举办第十二期高级研修班。\n\n研修内容包括：跨国技术转移合规审查、欧美反倾销与出口管制应对、涉外合同知识产权条款规范等。各会员单位享有优先参训名额。',
  },
  {
    id: 'notice-4',
    title: '转发权威部门《关于进一步深化高校科技创新成果跨境产业化与标准互认的指导意见》',
    category: '政策法规',
    issuer: '国专委政策研究室',
    date: '2026-09-17',
    status: '已发布',
    summary: '指导意见明确了高校职务科技成果跨境产业转化的合规激励机制、作价入股税务支持政策及海外协同创新基地的认定标准。',
    content: '现将权威指导意见全文转发给各会员高校及校办骨干企业。各单位应严格遵照文件精神，规范建立境外协同研发平台的审批报备流程，强化知识产权安全评估机制，确保高校资产保值增值与合规出海。',
  },
  {
    id: 'notice-5',
    title: '2026年度高校产教融合重点智库专项科研基金自主攻关课题申报指南发布',
    category: '项目申报',
    issuer: '国专委智库课题评审委员会',
    date: '2026-09-10',
    status: '进行中',
    deadline: '2026-10-20',
    summary: '设立专项资助资金，围绕“高校校办产业新质生产力布局”、“中欧产教合作网络”等6个重点方向开展深度战略咨询课题研究。',
    content: '为充分发挥智库在高校产业体制改革与决策咨询中的前瞻支撑作用，国专委2026年度重点智库专项科研基金课题申报工作正式开启。每项立项课题将获匹配资助资金，并纳入协会年度高层研究报告。',
  },
  {
    id: 'notice-6',
    title: '关于规范使用“中国高校校办产业协会国际合作与交流专业委员会”名称及防伪备案的通报',
    category: '对外发文',
    issuer: '国专委秘书处行政监督室',
    date: '2026-09-05',
    status: '已发布',
    summary: '严正声明国专委为中国高校校办产业协会所属分支机构，任何对外合作及证书颁发必须通过官方审核与登记追溯，防范违规冒名侵权。',
    content: '近期接群众咨询，市场上出现个别机构未经授权冒用或虚假关联国专委名义开展培训及商业活动。特此通报：国专委所有立项课题、会议培训及合作项目均须取得协会正式书面授权并在官网公示备案，请各会员单位提高鉴别防范意识。',
  },
];

export default function NoticePage() {
  const [activeAnchor, setActiveAnchor] = useState('latest');
  const [noticesList, setNoticesList] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选与搜索状态
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  // 模态框详情阅读状态
  const [readingNotice, setReadingNotice] = useState<NoticeItem | null>(null);

  // 分类选项
  const categoryOptions = [
    '全部',
    '对外发文',
    '项目申报',
    '活动报名',
    '信息公示',
    '政策法规',
    '申报指南',
  ];

  // 监听并平滑滚动到指定锚点
  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

  // 从 Firestore 实时订阅 notices 集合数据
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timer);
          const list: NoticeItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<NoticeItem, 'id'>),
          }));
          setNoticesList(list.length > 0 ? list : defaultNoticesList);
          setLoading(false);
        },
        (err) => {
          console.warn('Notices query error, fallback to default notices:', err);
          unsubscribe = onSnapshot(
            collection(db, 'notices'),
            (snapshot) => {
              clearTimeout(timer);
              const list: NoticeItem[] = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<NoticeItem, 'id'>),
              }));
              list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
              setNoticesList(list.length > 0 ? list : defaultNoticesList);
              setLoading(false);
            },
            () => {
              clearTimeout(timer);
              setNoticesList(defaultNoticesList);
              setLoading(false);
            }
          );
        }
      );
    } catch (error) {
      console.error('Failed to setup Firestore notices listener:', error);
      clearTimeout(timer);
      setNoticesList(defaultNoticesList);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const effectiveNotices = noticesList.length > 0 ? noticesList : defaultNoticesList;

  // 综合搜索与筛选
  const filteredNotices = effectiveNotices.filter((item) => {
    const matchCategory =
      selectedCategory === '全部' || item.category === selectedCategory;
    const matchSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.issuer && item.issuer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // 各板块分类数据
  const dispatchNotices = effectiveNotices.filter(
    (n) => n.category === '对外发文' || n.category === '信息公示' || n.category === '公示公告'
  );
  const projectNotices = effectiveNotices.filter(
    (n) => n.category === '项目申报' || n.category === '申报指南' || n.category === '课题申报'
  );
  const activityNotices = effectiveNotices.filter(
    (n) => n.category === '活动报名' || n.category === '研讨培训' || n.category === '交流活动'
  );
  const policyNotices = effectiveNotices.filter(
    (n) => n.category === '政策法规' || n.category === '指导意见' || n.category === '合规指南'
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── 顶部 Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">通知公告</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              通知公告与政策频道
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              集中发布中国高校校办产业协会国际合作与交流专业委员会对外通告、信息公示、涉外成果转化政策与重大申报指南。
            </p>
          </div>

          {/* 实时统计指标卡 */}
          <div className="mt-6 pt-6 border-t border-blue-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">当前已公示条目</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">
                {effectiveNotices.length} <span className="text-xs font-normal text-slate-400">条</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">申报期进行中</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">
                {effectiveNotices.filter((n) => n.status === '进行中').length} <span className="text-xs font-normal text-slate-400">项</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">数据对接管道</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">Firestore 直连</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">公示更新机制</div>
              <div className="text-sm font-bold text-blue-200 mt-1">实时推送生效</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 次级吸顶快速导航 (Sub-Nav Tabs) ─── */}
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
            1. 最新通知公告 (综合检索) (id: latest)
        ═══════════════════════════════════ */}
        <section id="latest" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">最新通知公告</h2>
                <p className="text-xs text-slate-400 mt-0.5">全站权威通告综合检索与动态汇总</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              共检索到 {filteredNotices.length} 条记录
            </span>
          </div>

          {/* 筛选与搜索控件 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-900 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative shrink-0 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题、发文部门或关键字..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">正在从数据库加载通知公告...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
              <p className="text-sm font-medium text-slate-600">未检索到符合条件的通知公告</p>
              <p className="text-xs text-slate-400">请尝试切换分类或调整搜索关键字。</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredNotices.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setReadingNotice(item)}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                        {item.category || '对外发文'}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          item.status === '进行中'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === '公示中'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                      {item.deadline && (
                        <span className="text-amber-700 font-semibold font-sans">
                          截止：{item.deadline}
                        </span>
                      )}
                      <span>发布日期：{item.date}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.summary || item.content?.slice(0, 110)}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1.5">
                    <span>发文署名：{item.issuer}</span>
                    <span className="font-semibold text-blue-800 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                      <span>阅读详细通告及附件说明</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════
            2. 对外发文 (id: dispatch)
        ═══════════════════════════════════ */}
        <section id="dispatch" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-900 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">对外发文与官方通报</h2>
                <p className="text-xs text-slate-400 mt-0.5">国专委正式行文、资质审核公示及重要公函发布</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">共 {dispatchNotices.length} 项</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dispatchNotices.map((item) => (
              <div
                key={item.id}
                onClick={() => setReadingNotice(item)}
                className="p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3 bg-slate-50/50"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-900">
                      {item.category}
                    </span>
                    <span className="text-slate-400 font-mono">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                  <span>{item.issuer}</span>
                  <span className="text-blue-800 font-medium">查看公文 &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            3. 项目申报 (id: projects)
        ═══════════════════════════════════ */}
        <section id="projects" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">项目申报与评审评优</h2>
                <p className="text-xs text-slate-400 mt-0.5">科技创新成果遴选、专项科研基金申报指南及评优推荐</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">共 {projectNotices.length} 项</span>
          </div>

          <div className="space-y-3.5">
            {projectNotices.map((item) => (
              <div
                key={item.id}
                onClick={() => setReadingNotice(item)}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    {item.deadline && (
                      <span className="text-xs text-amber-700 font-medium">截止：{item.deadline}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.summary}</p>
                </div>
                <div className="shrink-0 flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    立即查阅指南
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            4. 活动报名 (id: activities)
        ═══════════════════════════════════ */}
        <section id="activities" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">活动报名与研讨会议</h2>
                <p className="text-xs text-slate-400 mt-0.5">高校成果转化研讨班、国际产教合作对接会及学术峰会通告</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">共 {activityNotices.length} 项</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityNotices.map((item) => (
              <div
                key={item.id}
                onClick={() => setReadingNotice(item)}
                className="p-5 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3 bg-purple-50/20"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded font-semibold bg-purple-100 text-purple-800">
                      {item.category}
                    </span>
                    <span className="text-purple-700 font-medium">截止：{item.deadline || item.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{item.issuer}</span>
                  <span className="text-purple-800 font-semibold">参会报名说明 &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            5. 政策法规 (id: policies)
        ═══════════════════════════════════ */}
        <section id="policies" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-amber-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">政策法规与合规指南</h2>
                <p className="text-xs text-slate-400 mt-0.5">国家主管部门产教融合政策、涉外合规指引与知识产权标准</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">共 {policyNotices.length} 项</span>
          </div>

          <div className="space-y-3.5">
            {policyNotices.map((item) => (
              <div
                key={item.id}
                onClick={() => setReadingNotice(item)}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/15"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-900">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.summary}</p>
                </div>
                <div className="shrink-0 flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold group-hover:border-amber-300">
                    查阅政策原文
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            6. 办理须知 (id: guide)
        ═══════════════════════════════════ */}
        <section id="guide" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
            <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">申报与办理须知</h2>
              <p className="text-xs text-slate-400 mt-0.5">通知公告涉及项目的办理流程、材料报送与咨询通道</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-700" />
                <span>1. 资质审核与初核</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                申报单位须为正式在册会员高校或校办企业，提交申请须附加盖单位公章的真实性承诺书。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-700" />
                <span>2. 专家组同行评审</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                秘书处按照公文规定的办理时限，组织高校产业专家库评审专家进行双盲评审与合规筛查。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-700" />
                <span>3. 统一公示与正式发文</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                评审通过事项统一在本频道予以7个自然日公示，公示无异议后正式出具备案批复函。
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-700">
              <span className="font-bold text-blue-950">公文咨询及申报对接通道：</span>
              <span>国专委秘书处综合事务部 · 电话：010-68988899 · 邮箱：notice@cauiice.org.cn</span>
            </div>
            <Link
              href="/guozhuanwei-gaikuang#contact"
              className="shrink-0 px-4 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
            >
              联系办事处
            </Link>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════
          通知公告详情模态框 (纯 Tailwind Modal，绝无 alert)
      ══════════════════════════════════ */}
      {readingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setReadingNotice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 模态框头部 */}
            <div className="space-y-3 border-b border-slate-100 pb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                  {readingNotice.category}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                  状态：{readingNotice.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  发布日期：{readingNotice.date}
                </span>
                {readingNotice.deadline && (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    办理截止：{readingNotice.deadline}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {readingNotice.title}
              </h2>
              <div className="text-xs text-slate-500 font-medium">
                发文机构：{readingNotice.issuer}
              </div>
            </div>

            {/* 详细通知内容 */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap space-y-4">
              {readingNotice.content}
            </div>

            {/* 模态框尾部 */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
              <span>中国高校校办产业协会国际合作与交流专业委员会（国专委） 权威发布</span>
              <button
                type="button"
                onClick={() => setReadingNotice(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer self-end sm:self-auto"
              >
                关闭阅读
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
