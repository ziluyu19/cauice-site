'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NewsItem {
  id: string | number;
  type?: string;
  tag: string;
  title: string;
  summary: string;
  date: string;
  views?: number;
  content?: string;
}

interface NoticeItem {
  id: string | number;
  type?: string;
  tag: string;
  title: string;
  date: string;
  urgent?: boolean;
}

interface ProjectItem {
  id: string | number;
  title: string;
  region: string;
  desc: string;
  status: string;
}

interface ReportItem {
  id: string | number;
  title: string;
  author: string;
  date: string;
  badge: string;
  downloads: string;
  summary?: string;
}

// 预设基底新闻数据（当数据库为空时平滑兜底）
const initialNewsData: NewsItem[] = [
  {
    id: 1,
    type: 'committee',
    tag: '头条要闻',
    title: '2026年高校校办产业高质量创新发展大会暨第三届国际协同交流峰会在京成功召开',
    summary: '汇聚全国重点高校科技产业力量，探讨高校科技成果转化新模式与跨国合作新范式，共拓数字化转型新路径。',
    date: '2026-09-20',
    views: 3420,
  },
  {
    id: 2,
    type: 'industry',
    tag: '行业热点',
    title: '多项高校校企协同国际标准获批立项：赋能产业链数智协同与科技成果产业化',
    summary: '国专委牵头组织编制的多项国家及行业团体标准正式进入起草阶段，广泛征集高校及领军校企意见。',
    date: '2026-09-18',
    views: 2180,
  },
  {
    id: 3,
    type: 'meeting',
    tag: '会议纪要',
    title: '常务理事会2026年第三季度工作统筹会议在京顺利圆满举行',
    summary: '全面回顾高校产业出海阶段性成果，部署高校前沿智库成果转化及下阶段全球伙伴网络扩容工作。',
    date: '2026-09-15',
    views: 1890,
  },
  {
    id: 4,
    type: 'committee',
    tag: '国专委动态',
    title: '国专委专家智库赴多省市高校国家大学科技园开展先进制造与成果转化专项调研',
    summary: '深调研、摸实情、出对策，为高校校办产业集群高质量出海与区域经济融合提供精准指引。',
    date: '2026-09-12',
    views: 1560,
  },
];

// 预设基底通知数据
const initialNoticesData: NoticeItem[] = [
  {
    id: 1,
    type: 'notice',
    tag: '公示通知',
    title: '关于开展2026年度“高校校办产业科技创新与国际协同”卓越成果征集评选的通知',
    date: '09-21',
    urgent: true,
  },
  {
    id: 2,
    type: 'evaluate',
    tag: '评审评优',
    title: '2026年第二批入会申请会员单位资质审核通过名单及公示公告',
    date: '09-19',
    urgent: false,
  },
  {
    id: 3,
    type: 'policy',
    tag: '政策法规',
    title: '转发权威部门《关于进一步深化高校科技创新成果跨境产业化与标准互认的指导意见》',
    date: '09-17',
    urgent: false,
  },
  {
    id: 4,
    type: 'notice',
    tag: '活动报名',
    title: '关于举办第十二期全国高校科技成果转移转化与国际合规专家研讨班的报名通告',
    date: '09-14',
    urgent: false,
  },
  {
    id: 5,
    type: 'evaluate',
    tag: '课题申报',
    title: '2026年度高校产教融合重点智库专项科研基金自主攻关课题申报指南发布',
    date: '09-10',
    urgent: false,
  },
];

// 办事入口矩阵
const serviceCards = [
  {
    title: '会员申请入会',
    desc: '在线查阅指引，通过协会官方通道申请专属会员高校或企业资质',
    tag: '统一通道',
    href: '/members#guide',
    iconBg: 'bg-blue-50 text-blue-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    title: '科技成果对接',
    desc: '高校校办产业科技成果认定、供需撮合与标准化立项直通大厅',
    tag: '成果发布',
    href: '/achievements#tech-results',
    iconBg: 'bg-indigo-50 text-indigo-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: '专家智库咨询',
    desc: '对接高校资深学者与国际技术转移经纪人，获取专项诊断支持',
    tag: '智力支持',
    href: '/achievements#experts',
    iconBg: 'bg-sky-50 text-sky-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: '涉外业务培训',
    desc: '国际技术出口合规管制实务、PCT专利布局等专题课程报名',
    tag: '人才实训',
    href: '/achievements#training',
    iconBg: 'bg-cyan-50 text-cyan-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

// 预设基底智库报告
const initialReports: ReportItem[] = [
  {
    id: 1,
    title: '2026中国高校校办产业国际化发展与技术转移白皮书',
    author: '国专委产业研究室',
    date: '2026-09',
    badge: '重磅发布',
    downloads: '12,490次',
    summary: '系统梳理国内500余所高校科技成果海外许可、专利布局与衍生企业出海的最新趋势。',
  },
  {
    id: 2,
    title: '全球新能源与低碳技术高校科研成果跨境转化评估报告',
    author: '国际绿色协同智库',
    date: '2026-08',
    badge: '年度核心',
    downloads: '8,320次',
    summary: '深入分析中欧中新双元技术转移通道，为绿色新能源产业链出海提供制度对标参考。',
  },
  {
    id: 3,
    title: '高校产学研用融合效能及跨国创新孵化指数指南',
    author: '国专委创新经济课题组',
    date: '2026-07',
    badge: '决策参考',
    downloads: '6,940次',
    summary: '跟踪评估重点高校国际孵化器运行绩效，揭示跨境合规与外汇管理要点建议。',
  },
];

// 预设基底国际项目
const initialGlobalProjects: ProjectItem[] = [
  {
    id: 1,
    title: '中欧大学科技园与绿色低碳可持续发展技术联合实验室',
    region: '欧洲合作区',
    desc: '联合欧洲顶尖理工大学与科研基地，共建低碳标准认证与技术协同开发平台。',
    status: '常态化运营',
  },
  {
    id: 2,
    title: '亚太区域大学科技成果跨境孵化与供应链协同伙伴计划',
    region: '亚太经济圈',
    desc: '连接新加坡、日本等高校产业协会，推动知识产权跨境转化与数据互信互通。',
    status: '推进中',
  },
  {
    id: 3,
    title: '“一带一路”共建国家高校校办产业领军人才研修工程',
    region: '全球网络',
    desc: '累计联合多所知名高校培养超60个国家共2800名关键领域产学研管理领军人才。',
    status: '年度计划',
  },
];

// 预设高校成员墙基底
const defaultMemberUnits = [
  '清华大学科技开发部',
  '北京大学科技开发部',
  '浙江大学工业技术转化研究院',
  '上海交通大学先进产业技术研究院',
  '华中科技大学产业集团',
  '西安交通大学国家大学科技园',
  '哈尔滨工业大学资产投资经营公司',
  '中国科学技术大学先进技术研究院',
  '东南大学国家大学科技园',
  '同济创新创业控股有限公司',
  '天津大学内燃机研究所产业化中心',
  '华南理工大学科技成果转化中心',
];

export default function Home() {
  const [newsTab, setNewsTab] = useState<'all' | 'committee' | 'industry' | 'meeting'>('all');
  const [noticeTab, setNoticeTab] = useState<'all' | 'notice' | 'evaluate' | 'policy'>('all');

  // Firestore 实时状态
  const [liveNews, setLiveNews] = useState<NewsItem[]>(initialNewsData);
  const [liveNotices, setLiveNotices] = useState<NoticeItem[]>(initialNoticesData);
  const [liveProjects, setLiveProjects] = useState<ProjectItem[]>(initialGlobalProjects);
  const [liveMembers, setLiveMembers] = useState<string[]>(defaultMemberUnits);
  const [liveReports, setLiveReports] = useState<ReportItem[]>(initialReports);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 模态阅读弹窗状态与真实阅读量更新
  const [readingNews, setReadingNews] = useState<NewsItem | null>(null);

  // 打开新闻并真实递增阅读量
  const handleOpenNews = (item: NewsItem) => {
    const currentViews = typeof item.views === 'number' ? item.views : 0;
    const newViews = currentViews + 1;
    // 乐观更新：弹窗与本地列表即刻显示最新阅读量
    setReadingNews({ ...item, views: newViews });
    setLiveNews((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, views: newViews } : n))
    );

    // 若为 Firestore 数据库真实文档，调用原子递增更新数据库
    if (typeof item.id === 'string' && item.id.length > 0) {
      updateDoc(doc(db, 'news', item.id), { views: increment(1) }).catch((err) => {
        console.warn('Real-time views increment error:', err);
      });
    }
  };

  // 实时订阅 Firestore 数据
  useEffect(() => {
    // 1. 订阅 News
    let unsubNews: () => void = () => {};
    try {
      const qNews = query(collection(db, 'news'), orderBy('date', 'desc'), limit(5));
      unsubNews = onSnapshot(
        qNews,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsItem[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                title: d.title || '',
                tag: d.category === '专委会动态' ? '国专委动态' : (d.tag || d.category || '要闻'),
                summary: d.summary || '',
                date: d.date || '',
                views: typeof d.views === 'number' ? d.views : 0,
                type: (d.category === '国专委要闻' || d.category === '国专委动态' || d.category === '专委会动态')
                  ? 'committee'
                  : (d.category === '会员单位动态' || d.category === '行业热点' || d.category === '成果转化')
                  ? 'industry'
                  : d.category === '会议纪要'
                  ? 'meeting'
                  : 'all',
                content: d.content || '',
              };
            });
            setLiveNews(list);
          }
        },
        (err) => console.warn('Home news snapshot fallback:', err)
      );
    } catch (e) {
      console.error('Home news setup error:', e);
    }

    // 2. 订阅 Notices
    let unsubNotices: () => void = () => {};
    try {
      const qNotices = query(collection(db, 'notices'), orderBy('date', 'desc'), limit(5));
      unsubNotices = onSnapshot(
        qNotices,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NoticeItem[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                title: d.title || '',
                tag: d.category || '通知',
                date: d.date ? d.date.slice(5) : '最新',
                urgent: d.urgent || false,
                type: d.category === '公示通知' ? 'notice' : d.category === '评审评优' ? 'evaluate' : 'all',
              };
            });
            setLiveNotices(list);
          }
        },
        (err) => console.warn('Home notices snapshot fallback:', err)
      );
    } catch (e) {
      console.error('Home notices setup error:', e);
    }

    // 3. 订阅 Projects
    let unsubProjects: () => void = () => {};
    try {
      const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(3));
      unsubProjects = onSnapshot(
        qProjects,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ProjectItem[] = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                title: d.name || '',
                region: d.country || '国际合作',
                desc: d.desc || `中方：${d.chineseParty} × 外方：${d.foreignParty}`,
                status: d.status || '推进中',
              };
            });
            setLiveProjects(list);
          }
        },
        (err) => console.warn('Home projects snapshot fallback:', err)
      );
    } catch (e) {
      console.error('Home projects setup error:', e);
    }

    // 4. 订阅 Members
    let unsubMembers: () => void = () => {};
    try {
      const qMembers = query(collection(db, 'members'), orderBy('createdAt', 'desc'), limit(12));
      unsubMembers = onSnapshot(
        qMembers,
        (snapshot) => {
          if (!snapshot.empty) {
            const names = snapshot.docs.map((docSnap) => docSnap.data().name as string).filter(Boolean);
            if (names.length > 0) {
              setLiveMembers(names);
            }
          }
        },
        (err) => console.warn('Home members snapshot fallback:', err)
      );
    } catch (e) {
      console.error('Home members setup error:', e);
    }

    // 5. 订阅 Achievements (Reports)
    let unsubReports: () => void = () => {};
    try {
      const qReports = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'), limit(6));
      unsubReports = onSnapshot(
        qReports,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ReportItem[] = snapshot.docs
              .filter((docSnap) => docSnap.data().category === '智库报告')
              .slice(0, 3)
              .map((docSnap) => {
                const d = docSnap.data();
                return {
                  id: docSnap.id,
                  title: d.title || '',
                  author: d.unit || '国专委秘书处研究部',
                  date: d.date || '2026',
                  badge: d.field || '前沿报告',
                  downloads: '公开报告',
                  summary: d.summary || '',
                };
              });
            if (list.length > 0) {
              setLiveReports(list);
            }
          }
          setDataLoaded(true);
        },
        (err) => {
          console.warn('Home reports fallback:', err);
          setDataLoaded(true);
        }
      );
    } catch (e) {
      console.error('Home reports setup error:', e);
      setDataLoaded(true);
    }

    return () => {
      unsubNews();
      unsubNotices();
      unsubProjects();
      unsubMembers();
      unsubReports();
    };
  }, []);

  const filteredNews = liveNews.filter((item) => {
    if (newsTab === 'all') return true;
    return item.type === newsTab;
  });

  const filteredNotices = liveNotices.filter((item) => {
    if (noticeTab === 'all') return true;
    return item.type === noticeTab;
  });

  return (
    <div id="top" className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      {/* ============================================================ */}
      {/* 栏目1：首页 Hero 主视觉区 */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute -top-40 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 left-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>权威·协同·智领未来·全球赋能</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight lg:leading-tight mb-6 font-serif">
              聚智创新驱动 <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-blue-400">
                共促高校产业高质量国际化发展
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-normal">
              依托中国高校校办产业协会平台资源，紧密链接全国重点高校科技成果转化基地、国家大学科技园与全球高端创新要素，打造开放融通的产学研国际协同、技术标准共研与智库咨询高地。
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href="/members#guide"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                申请加入国专委
              </Link>
              <Link
                href="/achievements#reports"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all"
              >
                查阅智库白皮书
              </Link>
              <Link
                href="/members#services"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg text-slate-300 hover:text-white transition-colors inline-flex items-center space-x-1"
              >
                <span>进入办事大厅</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-serif">680+</div>
                <div className="text-xs text-slate-400 mt-1">常务理事与会员单位</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-serif">120+</div>
                <div className="text-xs text-slate-400 mt-1">国专委特聘智库专家</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-serif">45项</div>
                <div className="text-xs text-slate-400 mt-1">高校产业标准与规范</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-serif">30+</div>
                <div className="text-xs text-slate-400 mt-1">国际协同合作大学机构</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目2：国专委概况 */}
      {/* ============================================================ */}
      <section id="about" className="scroll-mt-48 lg:scroll-mt-52 py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                <span>国专委概况 · 组织体系与使命</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                链接中国顶尖高校智慧 <br />
                搭建全球化科技产业协同桥梁
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                中国高校校办产业协会国际合作与交流专业委员会（简称“国专委”）是在中国高校校办产业协会统筹领导下设立的全国性专业学术与产业服务机构。
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                国专委始终聚焦国家战略需求与全球产业演进前沿，深度赋能高水平大学校办产业集群、大学科技园与战略性新兴产业，推动科技成果跨国转移转化、高价值专利国际布局与高端人才国际联培，全面服务现代化产业体系建设。
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-blue-900 font-bold text-sm mb-1">主要职能</div>
                  <p className="text-xs text-slate-500">国际交流、成果转移、标准制定、智库咨询、人才实训与会展服务</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-blue-900 font-bold text-sm mb-1">服务对象</div>
                  <p className="text-xs text-slate-500">全国高等院校、校办骨干产业、大学科技园、跨国研发机构及会员单位</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl bg-blue-900 text-white shadow-lg space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">产学研用国际融通</h3>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  推动高校重大原创成果与世界500强龙头企业对接，共建海外联合创新中心与技术联合体。
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-800 text-white shadow-lg space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">高端智库决策支持</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  承担多项部委委托专项研究课题，为高校产业体制改革、科技金融与跨境投资提供前瞻建议。
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">全球友好大学网络</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  在欧美、亚太及“一带一路”沿线重点国家建立联络工作站，组织常态化互访与项目路演。
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">行业合规与标准建设</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  牵头制定高校产学研协同创新评价规范，促进知识产权国际互认与规范化管理运营。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目3与栏目4：新闻中心 与 通知公告 并排 */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 栏目3：新闻中心 · 要闻专区 (左侧 7 列) */}
            <div id="news" className="scroll-mt-48 lg:scroll-mt-52 lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">新闻中心 · 要闻专区</h2>
                </div>
                {/* News Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                  {[
                    { id: 'all', label: '全部' },
                    { id: 'committee', label: '国专委动态' },
                    { id: 'industry', label: '行业热点' },
                    { id: 'meeting', label: '会议纪要' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNewsTab(tab.id as any)}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        newsTab === tab.id
                          ? 'bg-blue-800 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 首条焦点新闻卡片 */}
              {filteredNews.length > 0 && (
                <div
                  onClick={() => handleOpenNews(filteredNews[0])}
                  className="group block mb-6 p-4 rounded-lg bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">最新头条</span>
                    <span className="text-xs text-blue-700 font-semibold">{filteredNews[0].tag}</span>
                    <span className="text-xs text-slate-400">| {filteredNews[0].date}</span>
                    <span className="text-xs text-slate-400">| 阅读 {filteredNews[0].views ?? 0}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {filteredNews[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {filteredNews[0].summary}
                  </p>
                </div>
              )}

              {/* 新闻列表 */}
              <div className="divide-y divide-slate-100">
                {filteredNews.slice(1).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenNews(item)}
                    className="py-3.5 group flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded transition-colors cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center space-x-2">
                      <span className="shrink-0 px-2 py-0.5 text-[11px] rounded bg-slate-100 text-slate-600 font-medium group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                        {item.tag}
                      </span>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-blue-800 transition-colors line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center space-x-3 text-xs text-slate-400 pl-2 sm:pl-0">
                      <span>{item.date}</span>
                      <span className="hidden sm:inline">阅读 {item.views ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  href="/news"
                  className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center space-x-1"
                >
                  <span>查看全部要闻动态</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* 栏目4：通知公告区 (右侧 5 列) */}
            <div id="notices" className="scroll-mt-48 lg:scroll-mt-52 lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">通知公告</h2>
                  </div>
                  {/* Notice Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                    {[
                      { id: 'all', label: '全部' },
                      { id: 'notice', label: '公示' },
                      { id: 'evaluate', label: '评审' },
                      { id: 'policy', label: '政策' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setNoticeTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          noticeTab === tab.id
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notices List */}
                <div className="space-y-3.5">
                  {filteredNotices.map((notice) => (
                    <Link
                      key={notice.id}
                      href="/notice"
                      className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-start justify-between gap-3 group block"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              notice.urgent
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {notice.tag}
                          </span>
                          {notice.urgent && (
                            <span className="text-[10px] font-bold text-red-600 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1 animate-ping"></span>
                              重要紧急
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-800 group-hover:text-blue-800 transition-colors line-clamp-1 block">
                          {notice.title}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {notice.date}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Link
                    href="/notice"
                    className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center space-x-1"
                  >
                    <span>进入通知公告专栏查阅更多</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Fast Link for Download / Public Channel */}
              <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3.5 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-slate-700 font-medium">国专委官方信函与批复核验通道</span>
                </div>
                <Link href="/notice" className="text-xs font-semibold text-blue-800 hover:underline">
                  查阅专栏公告 &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目5：国际合作专区 */}
      {/* ============================================================ */}
      <section id="global" className="scroll-mt-48 lg:scroll-mt-52 py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800">
                Global Partnership
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-tight">
                国际合作与全球协同发展网络
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                秉持“开放协同、互信共赢”理念，深度连接全球高等教育与科技创新高地，推动跨国技术互通、标准互认与青年科学家联合培养。
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/international"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-300 hover:text-white border-b border-blue-400 pb-0.5"
              >
                <span>查阅国际合作项目库</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveProjects.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 hover:border-blue-500/80 transition-all flex flex-col justify-between backdrop-blur-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-blue-400 font-semibold">{item.region}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px]">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-blue-300 font-medium flex items-center justify-between">
                  <Link href="/international#projects" className="hover:underline">
                    查看国际项目档案
                  </Link>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目6：会员单位与服务 */}
      {/* ============================================================ */}
      <section id="services" className="scroll-mt-48 lg:scroll-mt-52 py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
              综合赋能通道
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 tracking-tight">
              会员单位与服务 · 办事入口大厅
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              为全国高校、会员校办企业及产学研机构提供规范化、全流程的一站式办事通道与智库赋能支撑。
            </p>
          </div>

          {/* 办事入口卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((service, idx) => (
              <Link
                key={idx}
                href={service.href}
                className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${service.iconBg}`}>
                      {service.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {service.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 group-hover:text-blue-800 transition-colors">
                    立即前往办理
                  </span>
                  <span className="text-blue-800 transform group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 核心服务矩阵 */}
          <div className="mt-10 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="space-y-2 md:pr-6">
                <div className="text-sm font-bold text-blue-900">高校产业标准研制</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  承担多项高校成果产业化前沿标准起草工作，组织专家论证评审，助力会员单位占领技术规范高地。
                </p>
                <Link href="/achievements#standards" className="pt-2 text-xs font-semibold text-blue-800 hover:underline block">
                  已立项发布行业标准 40+ 项 &rarr;
                </Link>
              </div>
              <div className="space-y-2 pt-4 md:pt-0 md:px-6">
                <div className="text-sm font-bold text-blue-900">跨国产学研用联合体</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  联动全国重点高校国家重点实验室与跨国行业领军企业，推动核心关键技术攻关与工程化落地。
                </p>
                <Link href="/international#projects" className="pt-2 text-xs font-semibold text-blue-800 hover:underline block">
                  联合创新示范基地 18 处 &rarr;
                </Link>
              </div>
              <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
                <div className="text-sm font-bold text-blue-900">校企科技领军人才研修</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  提供技术经纪人实操认证、国际知识产权运营与领军人才高级实训，赋能高校科技产业团队梯队建设。
                </p>
                <Link href="/achievements#training" className="pt-2 text-xs font-semibold text-blue-800 hover:underline block">
                  累计赋能专业人才 5,000+ 人 &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* 会员单位名录墙（动态连接 members 集合） */}
          <div id="members" className="scroll-mt-48 lg:scroll-mt-52 mt-16 pt-12 border-t border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                协同共进·互信共赢
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                常务理事、会员高校及友好协作机构
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                广泛联动全国重点高等院校科技开发部、国家大学科技园、领军校企与国际产学研合作平台。
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {liveMembers.map((item, idx) => (
                <Link
                  key={idx}
                  href="/members#directory"
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-center text-center group min-h-[72px]"
                >
                  <span className="text-xs font-medium text-slate-700 group-hover:text-blue-900 transition-colors">
                    {item}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/members#guide"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-800 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-full border border-blue-200"
              >
                <span>加入国专委会员体系，共享高校智库与产业对接网络</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目7：成果与智库 */}
      {/* ============================================================ */}
      <section id="thinktank" className="scroll-mt-48 lg:scroll-mt-52 py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">成果与智库专区</h2>
              </div>
              <p className="text-slate-500 text-sm">
                聚集高校科技产业政策前沿、跨国技术转移洞察、技术预见与战略研判的系列权威报告。
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/achievements"
                className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center space-x-1"
              >
                <span>浏览全部智库成果库</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveReports.map((report) => (
              <div
                key={report.id}
                className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {report.badge}
                    </span>
                    <span className="text-xs text-slate-400">{report.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 hover:text-blue-800 transition-colors">
                    {report.title}
                  </h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>出品方：{report.author}</div>
                    <div>状态：{report.downloads}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/achievements#reports"
                    className="text-xs font-semibold text-blue-800 hover:text-blue-900 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>查阅白皮书概要</span>
                  </Link>
                  <span className="text-xs text-slate-400">公开授权</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目8：信息公开专区 */}
      {/* ============================================================ */}
      <section id="disclosure" className="scroll-mt-48 lg:scroll-mt-52 py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">信息公开专区</h2>
              </div>
              <p className="text-slate-500 text-sm">
                贯彻落实阳光透明原则，依法依规主动向广大会员、高校及社会公众公示重大事项与法定信息。
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              <span>法定信息公开平台 · 实时更新</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: 机构规章与章程 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-blue-900 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>机构规章与章程</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>国专委工作章程（修订版）</span>
                    <span className="text-slate-400">公开</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>会员代表大会选举办法</span>
                    <span className="text-slate-400">公开</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>学术委员会工作细则</span>
                    <span className="text-slate-400">公开</span>
                  </li>
                </ul>
              </div>
              <Link href="/disclosure#basic" className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-800 hover:underline block">
                查阅全部制度 &rarr;
              </Link>
            </div>

            {/* Column 2: 财务与收费公示 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-blue-900 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>财务与收费公示</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>2025年度财务收支报告</span>
                    <span className="text-slate-400">06-18</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>会员会费管理规范承诺</span>
                    <span className="text-slate-400">03-12</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>公益专项支出明细公示</span>
                    <span className="text-slate-400">01-10</span>
                  </li>
                </ul>
              </div>
              <Link href="/disclosure#credit" className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-800 hover:underline block">
                查阅财务年报 &rarr;
              </Link>
            </div>

            {/* Column 3: 评审评奖与立项公开 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-blue-900 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>评审评奖与立项公示</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>2026年度科技成果奖初评</span>
                    <span className="text-slate-400">09-15</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>第三批国际协同课题立项名单</span>
                    <span className="text-slate-400">08-28</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>优秀会员单位评选结果公示</span>
                    <span className="text-slate-400">07-20</span>
                  </li>
                </ul>
              </div>
              <Link href="/disclosure#reports" className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-800 hover:underline block">
                查阅历年公示 &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 附加特色：专题聚焦专区 */}
      {/* ============================================================ */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">专题聚焦专区</h2>
            </div>
            <span className="text-xs text-slate-500">国家战略 · 重点高校项目 · 产教融合行动</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: '发展新质生产力高校产业行动',
                sub: '构建颠覆式科技创新成果产业化与校企融合新引擎',
                color: 'from-blue-700 to-indigo-800',
                href: '/achievements',
              },
              {
                title: '“双碳”与高校科技绿色低碳转型',
                sub: '推动高校零碳技术研发、绿色校办产业与ESG治理',
                color: 'from-emerald-700 to-teal-800',
                href: '/international',
              },
              {
                title: '高校专精特新校办企业赋能工程',
                sub: '提供天使创投对接、技术中试、专利护航与产业链整合扶持',
                color: 'from-blue-900 to-slate-900',
                href: '/members',
              },
              {
                title: '第三届国际高校产业创新合作年会',
                sub: '线上大会专题：国内外大学校长论坛、产业日程与签约首发',
                color: 'from-sky-700 to-blue-900',
                href: '/news',
              },
            ].map((topic, idx) => (
              <Link
                key={idx}
                href={topic.href}
                className={`p-6 rounded-xl text-white bg-gradient-to-br ${topic.color} shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 block mb-2">
                    SPECIAL TOPIC 0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold leading-snug">{topic.title}</h3>
                  <p className="text-xs text-white/80 mt-2 line-clamp-2 leading-relaxed">
                    {topic.sub}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
                  <span>进入专题</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 新闻详情模态框 ─── */}
      {readingNews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                    {readingNews.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-1">
                    {readingNews.title}
                  </h3>
                  <div className="text-xs text-slate-400">
                    发布日期：{readingNews.date} · 阅读量：{readingNews.views ?? 0}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReadingNews(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed font-medium">
                {readingNews.summary}
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {readingNews.content || '（正在从国专委官方新闻发稿库加载全文内容...）'}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <Link href="/news" className="text-xs font-semibold text-blue-800 hover:underline">
                  进入新闻中心频道查阅更多 →
                </Link>
                <button
                  type="button"
                  onClick={() => setReadingNews(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
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
