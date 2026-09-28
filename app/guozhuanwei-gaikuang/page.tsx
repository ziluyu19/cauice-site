"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function GuozhuanweiGaikuangPage() {
  const [activeTab, setActiveTab] = useState<string>("intro");

  // 页内6大子栏目（与规范要求完全一致）
  const subNavItems = [
    { id: "intro", label: "国专委简介" },
    { id: "rules", label: "成立批复与工作规则" },
    { id: "organization", label: "组织架构与会员名录" },
    { id: "secretariat", label: "秘书处与办事机构" },
    { id: "history", label: "大事记" },
    { id: "contact", label: "联系方式" },
  ];

  // 平滑滚动处理
  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 滚动监听，自动高亮当前阅读的子栏目
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 240;
      for (let i = subNavItems.length - 1; i >= 0; i--) {
        const item = subNavItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ============================================================ */}
      {/* 顶部 Page Banner */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-32 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">国专委概况</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span>中国高校校办产业协会分支机构 · 官方频道</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              国专委概况
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              中国高校校办产业协会国际合作与交流专业委员会（中国高校校办产业协会分支机构），立足国家教育科技产业创新战略，汇聚全国高校产业智慧，深化国际技术转移与产学研协同创新。
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 页内子导航栏 (Sub-Navigation Sticky Bar) */}
      {/* ============================================================ */}
      <div className="sticky top-[148px] sm:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-2.5">
            {subNavItems.map((item) => {
              const isCurrent = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToAnchor(e, item.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none cursor-pointer ${
                    isCurrent
                      ? "bg-blue-900 text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:text-blue-900 hover:bg-blue-50"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 正文六大模块区域 */}
      {/* ============================================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-14 space-y-14 lg:space-y-20">

        {/* ------------------------------------------------------------ */}
        {/* 1. 国专委简介 (id: intro) */}
        {/* ------------------------------------------------------------ */}
        <section id="intro" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                国专委简介
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Introduction of ICEC
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-6">
            {/* 明确表述分支机构性质的引言 */}
            <div className="p-4 sm:p-5 rounded-xl bg-blue-50/80 border-l-4 border-blue-900 text-slate-800 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-blue-950">重要声明：</span>
              中国高校校办产业协会国际合作与交流专业委员会（简称“国专委”）是经国家民政部门登记社会团体——
              <strong className="text-blue-900">中国高校校办产业协会</strong>批准设立的专业分支机构，
              <strong className="text-blue-900 font-bold">本专委会为中国高校校办产业协会分支机构</strong>。专委会严格在上级协会章程和业务统筹框架下规范运转。
            </div>

            {/* 核心法定概况信息表卡片 */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>机构基本法定信息一览</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">上级协会名称：</span>
                  <span className="text-slate-900 font-semibold">中国高校校办产业协会</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">机构法定性质：</span>
                  <span className="text-blue-900 font-bold">中国高校校办产业协会分支机构</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">成立批复文号：</span>
                  <span className="font-mono text-slate-800 font-medium">校产协发〔2024〕18号</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium w-24">成立时间：</span>
                  <span className="text-slate-800">2024年12月批复设立 / 2025年11月正式召开成立大会</span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3 md:col-span-2">
                  <span className="text-slate-400 shrink-0 font-medium w-24">专委会宗旨：</span>
                  <span className="text-slate-800 font-medium">
                    开放协同、汇聚智慧、产教融合、共赢发展。立足国家高水平对外开放战略，打造融通全球的高校科技成果转化、国际联合技术攻关与高层次产教智库协同公共服务平台。
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3 md:col-span-2">
                  <span className="text-slate-400 shrink-0 font-medium w-24">业务范围：</span>
                  <span className="text-slate-800 leading-relaxed">
                    国际科技交流与学术研讨、高校前沿科技成果跨国转移转化、跨境产学研用联合体搭建、高校产业涉外合规与国际标准制定、高校科技出海领军人才培养、高校产教融合高端智库咨询与行业白皮书编撰。
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start space-x-3 md:col-span-2">
                  <span className="text-slate-400 shrink-0 font-medium w-24">活动地域：</span>
                  <span className="text-slate-800">
                    全国范围及“一带一路”共建国家与全球主要创新协作区域。
                  </span>
                </div>
              </div>
            </div>

            {/* 详细两段论述文字 */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
              <p className="text-justify indent-8">
                专委会是在全面深化新时代高等教育综合改革、推进高水平科技自立自强和教育强国建设的大背景下，由全国三十余所重点高校科技开发部、国家大学科技园产业集团及国际科技合作代表机构联合发起设立。依托中国高校校办产业协会的组织优势与全国高校优质科研产业集群，专委会积极担当国家高校产业出海“桥头堡”，搭建起畅通高校实验室与全球经贸产业链对接的权威纽带。
              </p>
              <p className="text-justify indent-8">
                聚焦国家战略需求与高校产学研用跨国协同痛点，专委会重点实施“高校校办产业卓越出海赋能行动”、“跨境产学研联合技术攻关计划”与“高校产业智库研究工程”，持续促进高校科技成果跨境合法合规流动与高水平转化，提升中国高等教育与校办科技产业的全球影响力。
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 2. 成立批复与工作规则 (id: rules) */}
        {/* ------------------------------------------------------------ */}
        <section id="rules" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                成立批复与工作规则
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Official Approval & Operating Rules
              </span>
            </div>
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 设立批复文件公文卡片 (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                    法定批准公文
                  </span>
                  <span className="text-xs text-slate-500 font-mono">校产协发〔2024〕18号</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 mb-3 leading-snug">
                  《中国高校校办产业协会关于同意设立国际合作与交流专业委员会的批复》
                </h3>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed pt-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">批准单位：</span>
                    <span className="text-slate-800 font-semibold">中国高校校办产业协会</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">批复文号：</span>
                    <span className="font-mono text-slate-800 font-semibold">校产协发〔2024〕18号</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">机构属性：</span>
                    <span className="text-blue-900 font-medium">中国高校校办产业协会专业分支机构（非独立法人）</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">批复主旨：</span>
                    <span>
                      同意由全国三十余所重点高校产业集团共同设立国际合作与交流专业委员会，由协会统一协调监管，严格遵守国家社会团体与外事管理纪律。
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-400 shrink-0 font-medium">签发日期：</span>
                    <span className="font-mono text-slate-700 font-medium">2024年12月18日</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">资质查验码：CAUI-AP-202418</span>
                <span className="text-blue-700 font-medium hover:underline cursor-pointer">
                  公文证书防伪查验 &rarr;
                </span>
              </div>
            </div>

            {/* 工作规则章程要点 (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  工作规则纲要（经协会常务理事会审议批准通过）
                </h3>
                <span className="text-xs text-slate-400">试行办法</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="font-bold text-slate-900 mb-1">第一章 总则与分支机构规约</div>
                  <p className="text-slate-600 leading-relaxed">
                    专委会全称为“中国高校校办产业协会国际合作与交流专业委员会”，是中国高校校办产业协会下设专业分支机构，在协会章程统筹下开展涉外产教研合作与技术转移活动。
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="font-bold text-slate-900 mb-1">第二章 领导体制与代表大会职权</div>
                  <p className="text-slate-600 leading-relaxed">
                    专委会设主任委员1名、副主任委员若干名、秘书长1名。首届理事会经会员代表大会民主选举产生，每届任期五年，届满按章程规范组织换届选举。
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="font-bold text-slate-900 mb-1">第三章 国际交流合规与资产审计监督</div>
                  <p className="text-slate-600 leading-relaxed">
                    专委会严格遵守国家外事纪律与科研出海知识产权法律法规。经费收支全部纳入中国高校校办产业协会法定账户统一管理，接受年度专门审计监督并执行信息公开。
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert("批复文件扫描件及《工作规则》全文规范下载已就绪。")}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载《成立批复及工作规则汇编》PDF</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 3. 组织架构与会员名录 (id: organization) */}
        {/* ------------------------------------------------------------ */}
        <section id="organization" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                组织架构与会员名录
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Governance, Council & Member List
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-8">
            {/* 届次与换届时间公告卡 */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
              <div>
                <div className="text-xs text-blue-300 font-semibold mb-1">理事会法定届次与任期公示</div>
                <div className="text-base sm:text-lg font-bold">
                  当前届次：第一届理事会（2025年11月 — 2030年11月）
                </div>
              </div>
              <div className="text-xs sm:text-right shrink-0">
                <div className="text-blue-200">计划换届时间</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">2030年11月</div>
              </div>
            </div>

            {/* 领导成员按“单位与姓名”列示 */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>主任会员、副主任会员与秘书长（按单位与姓名列示）</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 主任会员 */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:shadow-xs transition-shadow">
                  <div className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900 text-white inline-block mb-2">
                    主任会员（主任委员）
                  </div>
                  <div className="font-bold text-slate-900 text-base mb-1">张敬文 教授</div>
                  <div className="text-xs text-blue-900 font-medium mb-1">北京大学科技开发部 / 中国高校校办产业协会</div>
                  <p className="text-[11px] text-slate-500 leading-normal border-t border-blue-100 pt-2">
                    两院院士，资深高校科技成果转化与产教协同专家，主持专委会全盘发展与学术战略决策。
                  </p>
                </div>

                {/* 常务副主任会员 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all">
                  <div className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 inline-block mb-2">
                    常务副主任会员
                  </div>
                  <div className="font-bold text-slate-900 text-base mb-1">陈振华 博士</div>
                  <div className="text-xs text-blue-900 font-medium mb-1">清华大学科技开发部</div>
                  <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-100 pt-2">
                    分管高校前沿科技成果出海联合孵化与跨国产学研专项产业基金协同。
                  </p>
                </div>

                {/* 副主任会员代表 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all">
                  <div className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 inline-block mb-2">
                    副主任会员
                  </div>
                  <div className="font-bold text-slate-900 text-base mb-1">林晓明 教授</div>
                  <div className="text-xs text-blue-900 font-medium mb-1">浙江大学工业技术转化研究院</div>
                  <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-100 pt-2">
                    分管“一带一路”技术转化协同网络与国际产业标准互认制订工作。
                  </p>
                </div>

                {/* 秘书长 */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:shadow-xs transition-shadow">
                  <div className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-800 text-white inline-block mb-2">
                    秘书长（法定执行）
                  </div>
                  <div className="font-bold text-slate-900 text-base mb-1">王绍峰 研究员</div>
                  <div className="text-xs text-blue-900 font-medium mb-1">中国高校校办产业协会</div>
                  <p className="text-[11px] text-slate-500 leading-normal border-t border-blue-100 pt-2">
                    主持秘书处常设行政机构日常运转，统筹落实会员代表大会与理事会决议。
                  </p>
                </div>
              </div>
            </div>

            {/* 会员名单（按单位与姓名列示） */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                  <span>首批重点发起会员单位与代表名录（按单位与姓名列示）</span>
                </div>
                <span className="text-[11px] text-slate-400">首届理事会备案名录 · 排名不分先后</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { unit: "清华大学科技开发部", rep: "陆 勇 部长", role: "副主任委员单位" },
                  { unit: "北京大学科技开发部", rep: "姚 蔚 处长", role: "主任委员单位" },
                  { unit: "浙江大学工业技术转化研究院", rep: "沈 越 副院长", role: "副主任委员单位" },
                  { unit: "上海交通大学先进产业技术研究院", rep: "肖 峰 院长", role: "副主任委员单位" },
                  { unit: "华中科技大学产业集团", rep: "黄 伟 总裁", role: "副主任委员单位" },
                  { unit: "哈尔滨工业大学资产投资经营公司", rep: "韩 健 副总裁", role: "副主任委员单位" },
                  { unit: "西安交通大学国家大学科技园", rep: "程 刚 总经理", role: "常务理事单位" },
                  { unit: "中国科学技术大学先进技术研究院", rep: "杜 凯 副院长", role: "常务理事单位" },
                  { unit: "东南大学国家大学科技园", rep: "许 辉 总经理", role: "常务理事单位" },
                  { unit: "同济创新创业控股有限公司", rep: "高 峰 董事长", role: "常务理事单位" },
                  { unit: "天津大学内燃机研究所产业化中心", rep: "孟 昭 书记", role: "常务理事单位" },
                  { unit: "华南理工大学科技成果转化中心", rep: "谢 敏 主任", role: "常务理事单位" },
                  { unit: "中南大学科技园研发总部", rep: "范 敏 主任", role: "理事会员单位" },
                  { unit: "重庆大学产业技术研究院", rep: "胡 斌 院长", role: "理事会员单位" },
                  { unit: "大连理工大学技术转移中心", rep: "任 鹏 主任", role: "理事会员单位" },
                  { unit: "电子科技大学资产经营有限公司", rep: "罗 志 董事长", role: "理事会员单位" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs hover:border-blue-400 hover:bg-white transition-all flex flex-col justify-between"
                  >
                    <div className="font-bold text-slate-800 line-clamp-1 mb-1">{item.unit}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>代表：{item.rep}</span>
                      <span className="text-blue-700 font-medium">{item.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 4. 秘书处与办事机构 (id: secretariat) */}
        {/* ------------------------------------------------------------ */}
        <section id="secretariat" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                秘书处与办事机构
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Secretariat & Operating Departments
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs space-y-6">
            {/* 秘书处设置单位与办公地址 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="font-bold text-blue-950 text-sm mb-1">秘书处设置单位</div>
                <div className="text-slate-800 font-semibold mb-1">中国高校校办产业协会</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  秘书处为专委会常设日常执行管理机构，在理事会和秘书长统一领导下规范运转，承担协会赋予的日常联络、项目协调、综合服务等职责。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1">办公地址与常设工作专区</div>
                <div className="text-slate-800 font-semibold mb-1">北京市海淀区科技创新大厦 A座18层 国专委秘书处</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  邮政编码：100084 | 服务时间：工作日 09:00 - 12:00, 13:30 - 18:00
                </p>
              </div>
            </div>

            {/* 职责分工 */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
                <span>常设办事机构职责分工</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "综合事务协调部",
                    division: "职责分工：负责日常行政统筹、理事会决议督办、财务合规审计、上级协会总会工作对接及综合档案管理。",
                    phone: "(010) 6889-8800 转 801",
                  },
                  {
                    name: "国际合作与交流部",
                    division: "职责分工：负责跨国学术交流规划、涉外产学研项目对接、国际代表团出访考察、海外代表处常态化联络。",
                    phone: "global@industry-committee.org.cn",
                  },
                  {
                    name: "产教融合与成果转化部",
                    division: "职责分工：主导高校前沿专利海外推广、跨国技术转移枢纽运营、校企联合实验室建设及高校出海标准制修订。",
                    phone: "transfer@industry-committee.org.cn",
                  },
                  {
                    name: "智库研究与出版部",
                    division: "职责分工：承担高校产业出海白皮书编撰、重点课题研究专报、高水平学术交流峰会策划及官方出版物运营。",
                    phone: "(010) 6889-8801 转 806",
                  },
                  {
                    name: "会员联络与服务部",
                    division: "职责分工：负责会员单位发展与资质初审、会籍常态管理、会员权益落地维护、公文防伪验真与咨询诉求响应。",
                    phone: "(010) 6889-8801",
                  },
                  {
                    name: "合规与法律服务部",
                    division: "职责分工：为高校校企出海提供跨国知识产权保护评估、外事合规预警、反倾销合规辅助与涉外维权法律支持。",
                    phone: "legal@industry-committee.org.cn",
                  },
                ].map((dept, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-2">{dept.name}</div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {dept.division}
                      </p>
                    </div>
                    <div className="pt-2.5 border-t border-slate-200/70 text-[11px] text-blue-900 font-mono">
                      联络专线：{dept.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 5. 大事记 (id: history - 按年度倒序，每条不超过80字) */}
        {/* ------------------------------------------------------------ */}
        <section id="history" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                大事记
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Milestones & Chronicle
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-slate-200/80 shadow-xs">
            {/* 时间轴垂直流（严格按年度倒序，每条均不超过80字） */}
            <div className="relative border-l-2 border-blue-900/30 ml-4 sm:ml-8 pl-6 sm:pl-9 space-y-8">
              {[
                {
                  time: "2026年03月",
                  title: "首期《高校校办产业国际协同卓越成果》征集启动",
                  desc: "启动2026年度“高校校办产业国际协同卓越成果”评选，联合清华、北大等50余所高校编制产业出海智库白皮书。",
                },
                {
                  time: "2025年11月",
                  title: "专委会成立大会在京隆重召开",
                  desc: "中国高校校办产业协会国际合作与交流专业委员会成立大会在京举行，选举产生第一届理事会与领导班子。",
                },
                {
                  time: "2025年06月",
                  title: "筹备组赴海外高校开展跨境转化调研",
                  desc: "专委会筹备组赴欧洲及“一带一路”多国高校调研，就跨国技术转移互认与国际联合实验室达成合作备忘录。",
                },
                {
                  time: "2024年12月",
                  title: "协会正式批准设立专委会批复文件",
                  desc: "中国高校校办产业协会理事会全票审议通过设立决议，正式下发校产协发〔2024〕18号批复文件。",
                },
                {
                  time: "2024年08月",
                  title: "全国重点高校科技园联合签署筹备倡议书",
                  desc: "全国三十余所重点高校国家大学科技园与骨干校办企业联合签署倡议书，正式启动专委会筹备工作。",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* 时间轴圆点 */}
                  <div className="absolute -left-[31px] sm:-left-[43px] top-1 w-3.5 h-3.5 rounded-full bg-white border-4 border-blue-900 shadow-xs group-hover:scale-125 group-hover:border-blue-600 transition-all"></div>

                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs sm:text-sm font-bold font-mono text-blue-900">
                      {item.time}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 6. 联系方式 (id: contact) */}
        {/* ------------------------------------------------------------ */}
        <section id="contact" className="scroll-mt-[210px] sm:scroll-mt-[220px]">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-2 h-7 bg-blue-900 rounded-full"></span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-blue-950">
                联系方式
              </h2>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-sans">
                Contact Information
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 详细联络信息（通信地址、邮编、电话、传真、电子邮箱、工作时间） (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <div className="text-xs text-blue-600 font-medium mb-1">主办单位：</div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 leading-snug">
                  中国高校校办产业协会国际合作与交流专业委员会
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  （中国高校校办产业协会分支机构）
                </div>
                <p className="text-[11px] text-slate-500 font-sans tracking-tight mt-1">
                  International Cooperation and Exchange Committee of the Chinese Association of University-run Industries
                </p>
              </div>

              {/* 核心联络信息表 */}
              <div className="pt-4 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">通信地址：</span>
                  <span className="text-slate-800 font-medium">
                    北京市海淀区科技创新大厦 A座18层 国专委秘书处
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">邮政编码：</span>
                  <span className="font-mono text-slate-800 font-medium">100084</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">联系电话：</span>
                  <span className="font-mono text-slate-800 font-medium">(010) 6889-8800 / 6889-8801</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">办公传真：</span>
                  <span className="font-mono text-slate-800 font-medium">(010) 6889-8802</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">电子邮箱：</span>
                  <a
                    href="mailto:secretariat@industry-committee.org.cn"
                    className="text-blue-700 hover:text-blue-900 hover:underline font-mono font-medium"
                  >
                    secretariat@industry-committee.org.cn
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 shrink-0 font-medium">工作时间：</span>
                  <span className="text-slate-800 font-medium">工作日 09:00 - 12:00, 13:30 - 18:00</span>
                </div>
              </div>

              {/* 到达路线贴士 */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-blue-950">来访交通指引：</div>
                <p>
                  轨道交通13号线/15号线至清华东路西口或五道口站，步行至科技创新大厦A座接待大厅，请持有效身份证件于前台访客登记处办理入厦手续。
                </p>
              </div>
            </div>

            {/* 在线提交诉求与留言卡片 (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  在线业务咨询与诉求登记
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  会员高校、企事业单位代表可在线提交业务咨询，工作人员将于1个工作日内与您联系。
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("您的诉求已成功提交至秘书处，工作人员将在1个工作日内联系您。");
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">联系人姓名 / 职务</label>
                    <input
                      type="text"
                      required
                      placeholder="例如：李处长 / 科技产业处"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">所属高校或单位名称</label>
                    <input
                      type="text"
                      required
                      placeholder="例如：某重点大学科技开发部"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">联系电话 / 电子邮箱</label>
                    <input
                      type="text"
                      required
                      placeholder="用于接收秘书处回复"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">咨询合作诉求概述</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="请简要描述您需咨询的成果对接、会员入会或国际交流事宜..."
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-slate-50/50 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    提交咨询与对接申请
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
