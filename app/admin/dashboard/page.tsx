'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface ActivityItem {
  id: string;
  type: string;
  tagColor: string;
  title: string;
  operator: string;
  time: string;
  status: string;
  href: string;
  timestamp: number;
}

export default function AdminDashboardOverviewPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore 真实统计指标
  const [stats, setStats] = useState({
    newsCount: 0,
    noticesCount: 0,
    projectsCount: 0,
    membersCount: 0,
    ongoingNoticesCount: 0,
    uniqueCountriesCount: 0,
    councilMembersCount: 0,
    committeeNewsCount: 0,
  });

  // 真实最新业务入库动态流
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    let newsData: any[] = [];
    let noticesData: any[] = [];
    let projectsData: any[] = [];
    let membersData: any[] = [];

    const updateOverview = () => {
      // 1. 真实数据统计计算
      const newsCount = newsData.length;
      const committeeNewsCount = newsData.filter(
        (n) => n.category === '国专委动态' || n.category === '专委会动态'
      ).length;

      const noticesCount = noticesData.length;
      const ongoingNoticesCount = noticesData.filter(
        (n) => n.status === '进行中' || n.status === '公示中'
      ).length;

      const projectsCount = projectsData.length;
      const uniqueCountries = new Set(
        projectsData.map((p) => p.country).filter(Boolean)
      );
      const uniqueCountriesCount = uniqueCountries.size;

      const membersCount = membersData.length;
      const councilMembersCount = membersData.filter(
        (m) =>
          m.level &&
          (m.level.includes('理事') ||
            m.level.includes('主任') ||
            m.level.includes('副主任'))
      ).length;

      setStats({
        newsCount,
        noticesCount,
        projectsCount,
        membersCount,
        ongoingNoticesCount,
        uniqueCountriesCount,
        councilMembersCount,
        committeeNewsCount,
      });

      // 2. 汇聚各模块真实入库动态
      const activities: ActivityItem[] = [];

      newsData.slice(0, 3).forEach((item) => {
        const displayCategory = (
          item.category === '专委会动态' ? '国专委动态' : (item.category || '国专委动态')
        ).replace(/专委会/g, '国专委');

        activities.push({
          id: `news-${item.id}`,
          type: '新闻动态',
          tagColor: 'bg-blue-100 text-blue-800',
          title: item.title || '未命名新闻',
          operator: displayCategory,
          time: item.date || '最新',
          status: '已发布',
          href: '/admin/dashboard/news',
          timestamp: item.createdAt?.seconds
            ? item.createdAt.seconds * 1000
            : new Date(item.date || 0).getTime(),
        });
      });

      noticesData.slice(0, 3).forEach((item) => {
        activities.push({
          id: `notice-${item.id}`,
          type: '通知公告',
          tagColor: 'bg-emerald-100 text-emerald-800',
          title: item.title || '未命名通知',
          operator: item.category || '对外发文',
          time: item.date || '最新',
          status: item.status || '进行中',
          href: '/admin/dashboard/notices',
          timestamp: item.createdAt?.seconds
            ? item.createdAt.seconds * 1000
            : new Date(item.date || 0).getTime(),
        });
      });

      projectsData.slice(0, 2).forEach((item) => {
        activities.push({
          id: `project-${item.id}`,
          type: '国际合作',
          tagColor: 'bg-purple-100 text-purple-800',
          title: item.name || '未命名项目',
          operator: item.country ? `${item.country}合作` : '国际合作',
          time: item.period || '推进中',
          status: item.status || '进行中',
          href: '/admin/dashboard/projects',
          timestamp: item.createdAt?.seconds ? item.createdAt.seconds * 1000 : 0,
        });
      });

      membersData.slice(0, 2).forEach((item) => {
        activities.push({
          id: `member-${item.id}`,
          type: '会员单位',
          tagColor: 'bg-amber-100 text-amber-800',
          title: item.name || '未命名会员',
          operator: item.region || '全国网络',
          time: item.annualCheck || '已审核',
          status: item.level || '已入册',
          href: '/admin/dashboard/members',
          timestamp: item.createdAt?.seconds ? item.createdAt.seconds * 1000 : 0,
        });
      });

      // 按时间戳倒序排列
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 6));
      setLoading(false);
    };

    // 订阅 4 大业务集合实时数据
    let unsubNews: () => void = () => {};
    let unsubNotices: () => void = () => {};
    let unsubProjects: () => void = () => {};
    let unsubMembers: () => void = () => {};

    try {
      unsubNews = onSnapshot(
        collection(db, 'news'),
        (snapshot) => {
          newsData = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              category: (
                data.category === '专委会动态' ? '国专委动态' : (data.category || '国专委动态')
              ).replace(/专委会/g, '国专委'),
            };
          });
          newsData.sort((a, b) => {
            const timeA = a.createdAt?.seconds
              ? a.createdAt.seconds
              : new Date(a.date || 0).getTime() / 1000;
            const timeB = b.createdAt?.seconds
              ? b.createdAt.seconds
              : new Date(b.date || 0).getTime() / 1000;
            return timeB - timeA;
          });
          updateOverview();
        },
        (e) => {
          console.warn('News stats snapshot err:', e);
          updateOverview();
        }
      );

      unsubNotices = onSnapshot(
        collection(db, 'notices'),
        (snapshot) => {
          noticesData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          noticesData.sort((a, b) => {
            const timeA = a.createdAt?.seconds
              ? a.createdAt.seconds
              : new Date(a.date || 0).getTime() / 1000;
            const timeB = b.createdAt?.seconds
              ? b.createdAt.seconds
              : new Date(b.date || 0).getTime() / 1000;
            return timeB - timeA;
          });
          updateOverview();
        },
        (e) => {
          console.warn('Notices stats snapshot err:', e);
          updateOverview();
        }
      );

      unsubProjects = onSnapshot(
        collection(db, 'projects'),
        (snapshot) => {
          projectsData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          projectsData.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
          updateOverview();
        },
        (e) => {
          console.warn('Projects stats snapshot err:', e);
          updateOverview();
        }
      );

      unsubMembers = onSnapshot(
        collection(db, 'members'),
        (snapshot) => {
          membersData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          membersData.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
          updateOverview();
        },
        (e) => {
          console.warn('Members stats snapshot err:', e);
          updateOverview();
        }
      );
    } catch (err) {
      console.error('Failed to setup dashboard stats listeners:', err);
      setLoading(false);
    }

    return () => {
      unsubAuth();
      unsubNews();
      unsubNotices();
      unsubProjects();
      unsubMembers();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 欢迎通知 Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium border border-blue-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>系统就绪</span>
            <span>·</span>
            <span>Firebase Firestore 实时动态直连</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            欢迎回来，{currentUser?.email?.split('@')[0] || '系统管理员'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
            当前控制台各指标直连官方 Firestore 数据库，实时统计要闻、通知、国际合作项目与会员名录，可点击左侧菜单进行增删改查。
          </p>
        </div>
        <div className="absolute right-6 -bottom-6 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 核心统计指标卡片（全部来自 Firestore 实时真实数据） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 卡片 1：已发布要闻 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">已发布要闻</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                stats.newsCount
              )}{' '}
              <span className="text-xs font-normal text-slate-400">篇</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {stats.newsCount > 0
                ? `↑ 含 ${stats.committeeNewsCount} 篇国专委动态`
                : '• Firestore 实时已连接'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-lg">
            📰
          </div>
        </div>

        {/* 卡片 2：有效通知公告 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">有效通知公告</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                stats.noticesCount
              )}{' '}
              <span className="text-xs font-normal text-slate-400">条</span>
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              {stats.ongoingNoticesCount > 0
                ? `其中 ${stats.ongoingNoticesCount} 条处于进行/公示中`
                : '• 数据库实时自动统计'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg">
            📢
          </div>
        </div>

        {/* 卡片 3：国际合作项目库 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">国际合作项目库</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                stats.projectsCount
              )}{' '}
              <span className="text-xs font-normal text-slate-400">项</span>
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-1">
              {stats.uniqueCountriesCount > 0
                ? `覆盖 ${stats.uniqueCountriesCount} 个主要国别`
                : '• 实时直连 projects 集合'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-bold text-lg">
            🌐
          </div>
        </div>

        {/* 卡片 4：认证会员高校及企业 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">认证会员高校及企业</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                stats.membersCount
              )}{' '}
              <span className="text-xs font-normal text-slate-400">家</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">
              {stats.councilMembersCount > 0
                ? `其中 ${stats.councilMembersCount} 家常务理事/理事单位`
                : '• 实时直连 members 集合'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg">
            🏛️
          </div>
        </div>
      </div>

      {/* 快捷操作区与真实动态列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧两列：真实最新数据入库动态 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-blue-800 rounded-full"></div>
              <h3 className="text-sm font-bold text-slate-900">最新业务动态与入库记录</h3>
            </div>
            <span className="text-xs text-slate-400">来自 Firestore 真实数据流</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">正在从数据库拉取最新动态...</div>
          ) : recentActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2 text-xs">
              <p className="font-medium text-slate-600">数据库各集合已成功建立连接，当前暂无记录</p>
              <p className="text-[11px] text-slate-400">请点击右侧常用通道发布第一篇新闻或添加通知。</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentActivities.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded-lg transition-colors group block"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${item.tagColor}`}>
                      {item.type}
                    </span>
                    <span className="font-medium text-slate-800 group-hover:text-blue-900 truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400 shrink-0 text-[11px]">
                    <span className="text-slate-500">{item.operator}</span>
                    <span className="font-mono">{item.time}</span>
                    <span className="text-emerald-700 font-semibold">{item.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 右侧一列：快捷功能面板 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="w-1.5 h-4 bg-emerald-700 rounded-full"></div>
              <h3 className="text-sm font-bold text-slate-900">常用快捷通道</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <Link
                href="/admin/dashboard/news"
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group block"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-900">发布与管理新闻</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">在线表单，已打通 Firestore 数据库</div>
                </div>
                <span className="text-blue-800 font-bold">&rarr;</span>
              </Link>

              <Link
                href="/admin/dashboard/notices"
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group block"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-900">发布通知公告</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">申报指南、政策解读与公示</div>
                </div>
                <span className="text-blue-800 font-bold">&rarr;</span>
              </Link>

              <Link
                href="/admin/dashboard/projects"
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group block"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-900">管理合作项目</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">跨国合作项目入库与进度跟踪</div>
                </div>
                <span className="text-blue-800 font-bold">&rarr;</span>
              </Link>

              <Link
                href="/admin/dashboard/members"
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group block"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-900">管理会员名录</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">高校与骨干校办企业会员资质</div>
                </div>
                <span className="text-blue-800 font-bold">&rarr;</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all group block"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-900">新窗口预览官网</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">检查前台页面渲染与跳转</div>
                </div>
                <span className="text-emerald-800 font-bold">↗</span>
              </Link>
            </div>
          </div>

          {/* 系统安全状态卡片 */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-700 flex items-center space-x-1.5">
              <span className="text-emerald-600">●</span>
              <span>安全会话已建立</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              当前管理员会话由 Firebase 统一鉴权，支持全库各模块实时动态双向监听。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
