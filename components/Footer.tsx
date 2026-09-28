"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // 后台管理页面无需渲染前台页脚
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 lg:py-16">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: 主办单位与联系方式 (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-start space-x-3.5">
              <img
                src="/logo.png"
                alt="中国高校校办产业协会 Logo"
                className="w-12 h-12 rounded-full object-contain shrink-0 shadow-md ring-1 ring-slate-800"
              />
              <div className="space-y-1">
                <div className="text-xs text-blue-400 font-medium">
                  主办单位：
                </div>
                <div className="text-white text-base lg:text-[17px] font-bold font-serif leading-snug tracking-wide">
                  中国高校校办产业协会国际合作与交流专业委员会
                </div>
                <div className="text-xs text-slate-400 font-sans font-normal">
                  （中国高校校办产业协会分支机构）
                </div>
                <div className="text-[11px] text-slate-500 font-sans tracking-tight pt-0.5">
                  International Cooperation and Exchange Committee of the Chinese Association of University-run Industries
                </div>
              </div>
            </div>

            {/* 秘书处联系方式 */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
              <div className="text-white font-semibold flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>秘书处联系方式</span>
              </div>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-start space-x-2">
                  <span className="text-slate-500 shrink-0">通信地址：</span>
                  <span className="text-slate-300">
                    北京市海淀区科技创新大厦 A座18层 国专委秘书处
                    <span className="text-slate-500 font-mono ml-2">（邮政编码：100084）</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 shrink-0">联系电话：</span>
                    <span className="font-mono text-slate-300">(010) 6889-8800 / 6889-8801</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 shrink-0">办公传真：</span>
                    <span className="font-mono text-slate-300">(010) 6889-8802</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 shrink-0">电子邮箱：</span>
                  <a
                    href="mailto:secretariat@industry-committee.org.cn"
                    className="text-blue-400 hover:text-blue-300 hover:underline font-mono"
                  >
                    secretariat@industry-committee.org.cn
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 shrink-0">工作时间：</span>
                  <span className="text-slate-300">工作日 09:00 - 12:00, 13:30 - 18:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2 & 3: 站点地图 (Sitemap & 全站栏目结构索引) (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-white font-semibold text-sm flex items-center space-x-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>站点地图 · 栏目结构文字索引</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* 核心板块 */}
              <div className="space-y-2">
                <div className="text-slate-300 font-medium text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">
                  综合概况与资讯
                </div>
                <ul className="space-y-1.5">
                  <li>
                    <a href="/#top" className="hover:text-white transition-colors">
                      首页
                    </a>
                  </li>
                  <li>
                    <Link href="/guozhuanwei-gaikuang" className="hover:text-white transition-colors">
                      国专委概况
                    </Link>
                  </li>
                  <li>
                    <Link href="/news" className="hover:text-white transition-colors">
                      新闻中心
                    </Link>
                  </li>
                  <li>
                    <Link href="/notice" className="hover:text-white transition-colors">
                      通知公告
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 合作与服务板块 */}
              <div className="space-y-2">
                <div className="text-slate-300 font-medium text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">
                  合作服务与公开
                </div>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/international" className="hover:text-white transition-colors">
                      国际合作
                    </Link>
                  </li>
                  <li>
                    <Link href="/members" className="hover:text-white transition-colors">
                      会员单位与服务
                    </Link>
                  </li>
                  <li>
                    <Link href="/achievements" className="hover:text-white transition-colors">
                      成果与智库
                    </Link>
                  </li>
                  <li>
                    <Link href="/disclosure" className="hover:text-white transition-colors">
                      信息公开
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>需要协助？拨打全国热线或在线提交诉求</span>
              <Link href="/members" className="text-blue-400 hover:text-blue-300 font-medium shrink-0">
                进入服务矩阵 &rarr;
              </Link>
            </div>
          </div>

          {/* Col 4: 官方认证与公众号 (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-white font-semibold text-sm flex items-center space-x-2">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>官方发布与服务直达</span>
            </div>
            <div className="flex items-start space-x-4">
              {/* Mock QR Code */}
              <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center border border-slate-700 shrink-0">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M10 10h30v30h-30zM15 15v20h20v-20zM60 10h30v30h-30zM65 15v20h20v-20zM10 60h30v30h-30zM15 65v20h20v-20zM22 22h6v6h-6zM72 22h6v6h-6zM22 72h6v6h-6zM50 15h5v15h-5zM60 60h10v10h-10zM75 60h15v5h-15zM60 75h5v15h-5zM75 75h15v15h-15zM50 50h10v10h-10z" />
                </svg>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-white font-medium">国专委官方微信</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  微信扫一扫关注官方发布平台，第一时间获取政策导向与活动通知。
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="/#top"
                className="block w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-center text-xs font-semibold shadow-xs transition-colors"
              >
                返回顶部 · 会员认证入口
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Filings, Copyright & Legal Links */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-center text-slate-500 text-xs gap-3">
            {/* Copyright & Organization */}
            <div className="text-center lg:text-left text-slate-400">
              <span>
                © 2026 中国高校校办产业协会国际合作与交流专业委员会 版权所有
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-slate-400">
              <a href="/#about" className="hover:text-slate-300 transition-colors">
                法律声明
              </a>
              <span className="text-slate-700">|</span>
              <a href="/#disclosure" className="hover:text-slate-300 transition-colors">
                信息公开规定
              </a>
              <span className="text-slate-700">|</span>
              <a href="/#about" className="hover:text-slate-300 transition-colors">
                隐私保护指引
              </a>
              <span className="text-slate-700">|</span>
              <a href="/#top" className="hover:text-slate-300 transition-colors">
                无障碍浏览适配
              </a>
            </div>
          </div>

          {/* ICP and Public Security Filings (超链接要求) */}
          <div className="flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-900 gap-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
              <span>备案主体：中国高校校办产业协会</span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors underline-offset-4 hover:underline"
              >
                ICP备案编号：京ICP备11029388号-1
              </a>
              <span className="hidden sm:inline text-slate-700">|</span>
              <a
                href="https://beian.mps.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-slate-400 hover:text-blue-400 transition-colors underline-offset-4 hover:underline"
              >
                <svg className="w-3.5 h-3.5 shrink-0 text-slate-400 inline" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
                <span>公安机关备案：京公网安备 11010802020088号</span>
              </a>
            </div>

            <div className="text-slate-600 text-[10px]">
              建议使用 Chrome、Edge、Firefox 等现代浏览器访问本站
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
