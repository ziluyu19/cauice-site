"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<"account" | "sms">("account");
  const [searchQuery, setSearchQuery] = useState("");

  // 后台管理页面无需渲染前台主导航
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Navigation Links (根据要求，“国专委概况”指向独立页面 /guozhuanwei-gaikuang)
  const navItems = [
    { name: "首页", href: "/" },
    { name: "国专委概况", href: "/guozhuanwei-gaikuang" },
    { name: '新闻中心', href: '/news' },
    { name: "通知公告", href: "/notice" },
    { name: "国际合作", href: "/international" },
    { name: "会员单位与服务", href: "/members" },
    { name: "成果与智库", href: "/achievements" },
    { name: '信息公开', href: '/disclosure' },
  ];

  // 页面内或跨页面的平滑滚动跳转
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "");
      if (pathname === "/") {
        e.preventDefault();
        if (!targetId || targetId === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    } else if (href === "/") {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // 防止在顶栏进行鼠标划选/选中文字时，浏览器错误计算吸顶元素坐标而自动向上滚动
  const handleHeaderMouseDown = () => {
    const initialScrollY = window.scrollY;
    if (initialScrollY <= 0) return;

    const preventScrollJump = () => {
      if (window.scrollY !== initialScrollY) {
        window.scrollTo({ top: initialScrollY, behavior: "instant" as ScrollBehavior });
      }
    };

    const cleanup = () => {
      window.removeEventListener("scroll", preventScrollJump);
      window.removeEventListener("mouseup", cleanup);
    };

    window.addEventListener("scroll", preventScrollJump, { passive: false });
    window.addEventListener("mouseup", cleanup);
  };

  return (
    <>
      <header
        onMouseDown={handleHeaderMouseDown}
        className="border-b border-slate-200 bg-white fixed top-0 left-0 right-0 z-40 shadow-xs"
      >
        {/* 顶部实用功能条 (Top Utility Bar) */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 overscroll-contain">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center space-x-4">
              <span className="select-text">全国统一服务热线：400-820-8899</span>
              <span className="hidden md:inline text-slate-600 select-none">|</span>
              <span className="hidden md:inline text-slate-400 select-text">
                服务时间：工作日09:00-12:00,13:30-18:00
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-4 select-none">
              <Link
                href="/disclosure"
                onClick={(e) => handleNavClick(e, "/disclosure")}
                className="hover:text-white transition-colors cursor-pointer select-none"
              >
                信息公开
              </Link>
              <span className="text-slate-700 select-none">|</span>
              <Link
                href="/#global"
                onClick={(e) => handleNavClick(e, "/#global")}
                className="hover:text-white transition-colors select-none"
              >
                English Version
              </Link>
              <span className="text-slate-700 select-none">|</span>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 cursor-pointer select-none"
              >
                <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>会员登录 / 注册</span>
              </button>
            </div>
          </div>
        </div>

        {/* 机构标识与搜索大厅 (Branding Area) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3.5 group">
            {/* Logo Badge */}
            <img
              src="/logo.png"
              alt="中国高校校办产业协会 Logo"
              className="w-12 h-12 rounded-full object-contain shrink-0 shadow-xs ring-1 ring-slate-200 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-blue-950 font-serif truncate">
                  中国高校校办产业协会国际合作与交流专业委员会
                </span>
                <span className="hidden lg:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  官方门户
                </span>
              </div>
              <p className="text-xs text-slate-500 tracking-wider font-medium truncate">
                International Cooperation and Exchange Committee of the Chinese Association of University-run Industries
              </p>
            </div>
          </Link>

          {/* 右侧动作区：搜索与快捷按钮 */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索政策、公告、智库报告..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3 py-1.5 text-xs rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent bg-slate-50"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 text-xs font-medium rounded-md text-blue-800 border border-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              会员登录
            </button>
            <Link
              href="/#contact"
              onClick={(e) => handleNavClick(e, "/#contact")}
              className="px-4 py-2 text-xs font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 shadow-sm transition-colors"
            >
              在线咨询
            </Link>
          </div>

          {/* 移动端菜单开关 */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded bg-blue-800 text-white"
            >
              登录
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-blue-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 主导航条 (Main Navigation Bar) */}
        <nav className="bg-blue-900 text-white shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="hidden lg:flex items-center justify-between">
              <ul className="flex space-x-1">
                {navItems.map((item, idx) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : item.href === "/guozhuanwei-gaikuang"
                      ? pathname.startsWith("/guozhuanwei-gaikuang")
                      : item.href === "/news"
                      ? pathname.startsWith("/news")
                      : item.href === "/notice"
                      ? pathname.startsWith("/notice")
                      : item.href === "/international"
                      ? pathname.startsWith("/international")
                      : item.href === "/members"
                      ? pathname.startsWith("/members")
                      : item.href === "/achievements"
                      ? pathname.startsWith("/achievements")
                      : item.href === "/disclosure"
                      ? pathname.startsWith("/disclosure")
                      : false;

                  return (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`inline-block px-4 py-3.5 text-sm font-medium tracking-wide transition-all border-b-2 hover:bg-blue-800 hover:text-white border-transparent select-none cursor-pointer ${
                          isActive
                            ? "bg-blue-950 text-white border-white shadow-xs font-semibold"
                            : "text-blue-100"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="text-xs text-blue-200 flex items-center space-x-2 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>国专委云服务平台 2.0 在线</span>
              </div>
            </div>

            {/* 移动端下拉菜单 */}
            {mobileMenuOpen && (
              <div className="lg:hidden py-3 border-t border-blue-800 space-y-1">
                {navItems.map((item, idx) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : item.href === "/guozhuanwei-gaikuang"
                      ? pathname.startsWith("/guozhuanwei-gaikuang")
                      : item.href === "/news"
                      ? pathname.startsWith("/news")
                      : item.href === "/notice"
                      ? pathname.startsWith("/notice")
                      : item.href === "/international"
                      ? pathname.startsWith("/international")
                      : item.href === "/members"
                      ? pathname.startsWith("/members")
                      : item.href === "/achievements"
                      ? pathname.startsWith("/achievements")
                      : item.href === "/disclosure"
                      ? pathname.startsWith("/disclosure")
                      : false;

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        handleNavClick(e, item.href);
                      }}
                      className={`block px-3 py-2 text-sm rounded select-none cursor-pointer ${
                        isActive
                          ? "bg-blue-950 text-white font-semibold"
                          : "text-blue-100 hover:bg-blue-800 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-blue-800">
                  <Link
                    href="/#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-blue-200 hover:bg-blue-800"
                  >
                    在线咨询与办事入口
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 吸顶导航占位高度，防止正文被吸顶导航遮挡 */}
      <div className="h-[108px] lg:h-[156px] w-full shrink-0" aria-hidden="true" />

      {/* 用户登录/咨询弹窗 (Login & Consultation Modal) */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-blue-900 text-white rounded-lg mx-auto flex items-center justify-center font-bold text-base mb-3">
                门
              </div>
              <h3 className="text-xl font-bold text-slate-900">会员统一认证中心</h3>
              <p className="text-xs text-slate-500 mt-1">
                支持国专委会员单位、高校校办产业代表、理事专家及申报机构登录
              </p>
            </div>

            {/* Tab Switch */}
            <div className="flex border-b border-slate-200 mb-5 text-sm font-medium">
              <button
                onClick={() => setLoginTab("account")}
                className={`flex-1 pb-3 text-center transition-colors border-b-2 cursor-pointer ${
                  loginTab === "account"
                    ? "border-blue-900 text-blue-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                账号密码登录
              </button>
              <button
                onClick={() => setLoginTab("sms")}
                className={`flex-1 pb-3 text-center transition-colors border-b-2 cursor-pointer ${
                  loginTab === "sms"
                    ? "border-blue-900 text-blue-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                手机验证码登录
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); alert("已连接国专委测试认证网关：当前处于演示环境。"); setIsLoginOpen(false); }}>
              {loginTab === "account" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      统一社会信用代码 / 会员卡号 / 手机号
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="请输入申报单位代码或管理员手机号"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">登录密码</label>
                    <input
                      type="password"
                      required
                      placeholder="请输入认证密码"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">绑定手机号码</label>
                    <input
                      type="tel"
                      required
                      placeholder="请输入预留手机号"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">短信验证码</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        placeholder="6位数字"
                        className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800"
                      />
                      <button
                        type="button"
                        className="px-3 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-300 cursor-pointer"
                      >
                        获取验证码
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-800 focus:ring-blue-800" />
                  <span>记住登录状态</span>
                </label>
                <a href="#" className="text-blue-800 hover:underline">忘记密码？</a>
              </div>

              <button
                type="submit"
                className="w-full mt-5 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-md transition-colors cursor-pointer"
              >
                立即登录
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              尚无会员或申报账号？{" "}
              <Link
                href="/#services"
                onClick={() => setIsLoginOpen(false)}
                className="text-blue-800 font-semibold hover:underline"
              >
                提交入会申请 &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
