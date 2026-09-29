'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 若已处于登录状态，自动重定向到后台首页
  useEffect(() => {
    // 3秒安全熔断，防止由于网络波动导致长时间处于“正在校验系统权限...”
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timer);
      if (user) {
        router.replace('/admin/dashboard');
      } else {
        setCheckingAuth(false);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [router]);

  // 设置登录页标题与协会 Logo Favicon
  useEffect(() => {
    document.title = '管理员登录 - 国专委管理后台 · 中国高校校办产业协会';
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = '/logo.png?v=2';
  }, []);

  // 处理管理员登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('请填写完整的管理员邮箱与登录密码');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential'
      ) {
        setErrorMsg('管理员账号或密码不正确，请重新核对');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('请输入合法的邮箱地址格式');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('尝试登录失败次数过多，已被系统临时保护，请稍后再试');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('网络连接异常，无法连接到认证服务器');
      } else {
        setErrorMsg(err?.message || '登录失败，请检查网络或配置');
      }
    } finally {
      setLoading(false);
    }
  };

  // 认证状态初始化检查中骨架屏
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs tracking-wider">正在校验系统权限...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* 顶部标识 */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-14 h-14 rounded-full object-contain bg-white shadow-xs"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
              国专委内容管理系统
            </h2>
            <p className="mt-1 text-xs text-blue-200/80">
              CAUI-ICEC Content Management System · 管理员登录
            </p>
          </div>
        </div>

        {/* 登录卡片 */}
        <div className="mt-8 bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* 错误提示框 */}
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700 animate-in fade-in duration-200">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                管理员邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cauiice.org.cn"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                登录密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入您的管理员密码"
                  className="block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-xs sm:text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>正在验证凭据...</span>
                  </>
                ) : (
                  <span>登 录 管 理 后 台</span>
                )}
              </button>
            </div>
          </form>

          {/* 底部功能区 */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Firebase 身份认证保护</span>
            </span>
            <Link
              href="/"
              className="text-blue-800 hover:text-blue-950 font-medium hover:underline inline-flex items-center space-x-1"
            >
              <span>← 返回前台官网</span>
            </Link>
          </div>
        </div>

        {/* 版权声明 */}
        <p className="mt-6 text-center text-xs text-blue-200/60">
          中国高校校办产业协会国际合作与交流专业委员会 版权所有
        </p>
      </div>
    </div>
  );
}
