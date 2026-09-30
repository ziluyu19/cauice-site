'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 认证状态监听与未登录安全拦截（带 3 秒超时机制）
  useEffect(() => {
    let isHandled = false;

    // 3 秒超时机制：如果 3 秒后仍未拿到登录状态，强制使用 router.push('/admin/login') 跳转到登录页
    const timeoutTimer = setTimeout(() => {
      if (isHandled) return;
      isHandled = true;

      if (auth.currentUser) {
        setCurrentUser(auth.currentUser);
        setLoading(false);
      } else {
        setErrorMessage('网络超时或当前域名未授权，请重试');
        try {
          sessionStorage.setItem('admin_auth_error', '网络超时或当前域名未授权，请重试');
        } catch (e) {}

        // 强制使用 router.push('/admin/login') 跳转到登录页
        router.push('/admin/login');

        // 作为内网/极端环境下的安全跳转兜底
        const fallbackTimer = setTimeout(() => {
          if (window.location.pathname.startsWith('/admin/dashboard')) {
            window.location.href = '/admin/login';
          }
        }, 800);

        return () => clearTimeout(fallbackTimer);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (isHandled) return;
        isHandled = true;
        clearTimeout(timeoutTimer);

        if (user) {
          setCurrentUser(user);
          setLoading(false);
        } else {
          setErrorMessage('网络超时或当前域名未授权，请重试');
          try {
            sessionStorage.setItem('admin_auth_error', '网络超时或当前域名未授权，请重试');
          } catch (e) {}
          router.push('/admin/login');
        }
      },
      (error) => {
        if (isHandled) return;
        isHandled = true;
        clearTimeout(timeoutTimer);
        console.warn('onAuthStateChanged error:', error);
        setErrorMessage('网络超时或当前域名未授权，请重试');
        try {
          sessionStorage.setItem('admin_auth_error', '网络超时或当前域名未授权，请重试');
        } catch (e) {}
        router.push('/admin/login');
      }
    );

    return () => {
      isHandled = true;
      clearTimeout(timeoutTimer);
      unsubscribe();
    };
  }, [router]);

  // 退出登录处理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 菜单配置
  const navMenuItems = [
    {
      href: '/admin/dashboard',
      label: '控制台概览',
      exact: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/profile',
      label: '国专委概况管理',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/news',
      label: '新闻管理',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/notices',
      label: '通知管理',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/projects',
      label: '国际合作管理',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/members',
      label: '会员单位与服务',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/achievements',
      label: '成果与智库管理',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      href: '/admin/dashboard/disclosure',
      label: '信息公开管理',
      exact: false,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  // 计算当前页面标题
  const currentNav = navMenuItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  // 动态同步后台管理系统标头与协会 Logo Favicon（遵守 Hooks 规则，在任何条件返回之前调用）
  useEffect(() => {
    const pageTitle = currentNav ? `${currentNav.label} - 国专委管理后台` : '国专委管理后台';
    document.title = `${pageTitle} · 中国高校校办产业协会`;

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = '/logo.png?v=2';
  }, [currentNav]);

  // 校验中状态展示与超时友好提示
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300 p-4">
        {errorMessage ? (
          <div className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-wide">
                管理员权限校验未通过
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {errorMessage}
              </p>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                系统正在为您跳转到登录页面... 如未自动跳转，请点击下方按钮。
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/admin/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                立即前往登录页
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm tracking-wider font-medium">正在校验管理员权限...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800 font-sans">
      {/* ─── 侧边栏 (Sidebar) ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* 系统头部 Logo 与名称 */}
          <div className="h-16 flex items-center justify-between px-5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 rounded-full object-contain bg-white shadow-xs shrink-0"
              />
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-white tracking-wide truncate">
                  国专委管理后台
                </h1>
                <p className="text-[10px] text-blue-300/80 font-mono tracking-wider">
                  CAUI-ICEC CMS v1.0
                </p>
              </div>
            </div>
            {/* 移动端关闭按钮 */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 导航菜单列表 */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              核心业务管理
            </div>
            {navMenuItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 侧边栏底部快捷操作 */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
          {/* 回到前台按钮 */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-blue-300 hover:text-white hover:bg-blue-900/40 transition-colors"
          >
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="font-medium">回到前台首页</span>
          </Link>

          {/* 退出登录 */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 遮罩层（移动端打开侧边栏时） */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ─── 主内容区 (Main Content Area) ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 顶部状态栏 */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            {/* 移动端汉堡按钮 */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <span className="font-bold text-slate-900">
                {currentNav?.label || '控制台'}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500 text-xs hidden sm:inline">工作台监控</span>
            </div>
          </div>

          {/* 右侧管理员身份信息 */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs max-w-[150px] sm:max-w-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-slate-500 hidden sm:inline shrink-0">管理员：</span>
              <span className="font-semibold text-slate-800 font-mono truncate">
                {currentUser?.email || '已认证管理员'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-xs text-slate-500 hover:text-red-700 rounded hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
              title="安全退出"
            >
              <svg className="w-4 h-4 text-red-500 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </header>

        {/* 动态子页面内容注入 */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
