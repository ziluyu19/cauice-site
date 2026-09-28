"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function InternationalPage() {
  const [activeTab, setActiveTab] = useState<string>("projects");
  const [filterCountry, setFilterCountry] = useState<string>("全部");
  const [filterField, setFilterField] = useState<string>("全部");
  const [filterYear, setFilterYear] = useState<string>("全部");
  const [filterStatus, setFilterStatus] = useState<string>("全部");
  const [briTab, setBriTab] = useState<"policy" | "project" | "activity" | "achievement">("policy");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("全部");
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // 项目库模拟数据
  const mockProjects = [
    {
      id: 1,
      name: "中德智能工业机器人联合概念验证中心与技术转移项目",
      chineseParty: "清华大学科技开发部 / 北京某智能控制技术有限公司",
      foreignParty: "德国慕尼黑工业大学自动化技术研究所 (TUM)",
      period: "2024.03 - 2026.12",
      status: "进行中",
      country: "德国",
      field: "智能制造",
      year: "2024",
      desc: "围绕高精度协同工业机械臂控制算法开展联合验证，并在长三角国家大学科技园设立离岸协同中试线。",
    },
    {
      id: 2,
      name: "中新高校纳米新材料与绿色储能器件跨境联合研发转化工程",
      chineseParty: "浙江大学工业技术转化研究院",
      foreignParty: "新加坡南洋理工大学能源研究院 (NTU ERI@N)",
      period: "2025.01 - 2027.06",
      status: "筹备中",
      country: "新加坡",
      field: "新能源",
      year: "2025",
      desc: "聚焦固态电解质与新型高能量密度电池组装工艺，打造面向东盟市场的绿色能源出海应用基地。",
    },
    {
      id: 3,
      name: "中英精准医疗与生物靶向药物跨境知识产权赋权转化平台",
      chineseParty: "复旦大学上海医学院科技成果转化中心",
      foreignParty: "英国牛津大学创新中心 (Oxford University Innovation)",
      period: "2023.09 - 2025.08",
      status: "已完成",
      country: "英国",
      field: "生物医药",
      year: "2023",
      desc: "完成多项跨国PCT专利布局互认与抗体先导化合物跨境商业许可授权，成果已进入临床II期孵化。",
    },
  ];

  const filteredProjects = mockProjects.filter((p) => {
    if (filterCountry !== "全部" && p.country !== filterCountry) return false;
    if (filterField !== "全部" && p.field !== filterField) return false;
    if (filterYear !== "全部" && p.year !== filterYear) return false;
    if (filterStatus !== "全部" && p.status !== filterStatus) return false;
    return true;
  });

  const subNavItems = [
    { id: "projects", label: "合作项目库" },
    { id: "regions", label: "国别与区域" },
    { id: "bri", label: "一带一路" },
    { id: "activities", label: "涉外交流活动" },
    { id: "matchmaking", label: "合作需求" },
    { id: "organizations", label: "国际组织" },
  ];

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 顶部 Page Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">国际合作</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              国际合作与交流
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              立足全球产学研合作，赋能高校科技产业高质量出海与国际协同创新。
            </p>
          </div>
        </div>
      </section>

      {/* 顶部 6 个锚点子导航 */}
      <div className="sticky top-[148px] sm:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-2.5">
            {subNavItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToAnchor(e, item.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === item.id
                    ? "bg-blue-900 text-white font-semibold"
                    : "text-slate-600 hover:text-blue-900 hover:bg-blue-50"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 6 个空白区块 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* 1. 合作项目库 */}
        <section id="projects" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国际合作项目库</h2>
            </div>
            <span className="text-xs text-slate-500">
              共收录重点高校涉外产业项目，显示 {filteredProjects.length} / {mockProjects.length} 项
            </span>
          </div>

          {/* 四维筛选器 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            {/* 国别 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">合作国别：</span>
              {["全部", "德国", "新加坡", "英国"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterCountry(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterCountry === item
                      ? "bg-blue-800 text-white font-semibold shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 领域 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">专业领域：</span>
              {["全部", "智能制造", "新能源", "生物医药"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterField(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterField === item
                      ? "bg-blue-800 text-white font-semibold shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 年度 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">立项年度：</span>
              {["全部", "2025", "2024", "2023"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterYear(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterYear === item
                      ? "bg-blue-800 text-white font-semibold shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 状态 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">进展状态：</span>
              {["全部", "进行中", "筹备中", "已完成"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilterStatus(item)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filterStatus === item
                      ? "bg-blue-800 text-white font-semibold shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* 项目卡片列表 */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                未检索到符合筛选条件的项目，请调整筛选维度。
              </div>
            ) : (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          {proj.country} · {proj.field}
                        </span>
                        <span className="text-xs text-slate-400">立项：{proj.year}年</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                        {proj.name}
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                        proj.status === "进行中"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : proj.status === "筹备中"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {proj.desc}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">中方合作主体：</span>
                      <span className="font-medium text-slate-800">{proj.chineseParty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">外方合作主体：</span>
                      <span className="font-medium text-slate-800">{proj.foreignParty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">合作起止周期：</span>
                      <span className="font-mono text-slate-700">{proj.period}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">合作模式：</span>
                      <span className="text-slate-700">产学研联合技术验证与离岸转移</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. 国别与区域 */}
        <section id="regions" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国别与重点区域合作</h2>
            </div>
            <span className="text-xs text-slate-500">
              按国家及战略经济圈聚合合作基础与涉外合规指引
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 德国/中欧 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">德国 (Germany)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">中欧工业创新</span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">合作概况：</span>聚焦工业4.0、先进数控机床及双元制工程技术协同培育，重点对接巴伐利亚与北威州高科技产业集群。
                </div>
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200/70 leading-relaxed">
                  <span className="font-bold">⚠️ 政策环境提示：</span>严格关注德国《对外贸易法》关于关键基础设施技术转让审查条款及欧盟碳边境调节机制（CBAM）合规核算。
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                <span className="font-medium text-slate-700">已有合作基础：</span>已共建2处高校离岸中试验证基地，14所骨干高校签署技术成果互认意向。
              </div>
            </div>

            {/* 新加坡/东盟 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">新加坡 (Singapore)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">东盟国际枢纽</span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">合作概况：</span>依托中新互联互通战略及纬壹科技城，重点推动高校金融科技、绿色低碳材料及跨境知识产权商业化。
                </div>
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200/70 leading-relaxed">
                  <span className="font-bold">⚠️ 政策环境提示：</span>享受RCEP原产地累加优惠，需防范跨国数据流动合规及新加坡个人数据保护法（PDPA）科技企业监管要求。
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                <span className="font-medium text-slate-700">已有合作基础：</span>设立中新高校联合概念验证走廊，每年常态化开展“高校成果南洋路演周”。
              </div>
            </div>

            {/* 英国/西欧 */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">英国 (United Kingdom)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">前沿基础转化</span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">合作概况：</span>紧密链接牛津、剑桥及帝国理工高校产业转化网络，专注于生命科学、肿瘤免疫及量子计算概念验证。
                </div>
                <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200/70 leading-relaxed">
                  <span className="font-bold">⚠️ 政策环境提示：</span>注意英国《国家安全与投资法》（NSI Act）对17个敏感技术领域的并购强制申报要求。
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-500">
                <span className="font-medium text-slate-700">已有合作基础：</span>累计实施8项联合药物靶点转让合同，设立中英高校技术经纪人联合认证机制。
              </div>
            </div>
          </div>
        </section>

        {/* 3. 一带一路 */}
        <section id="bri" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">共建“一带一路”产教融合专题</h2>
            </div>
            <span className="text-xs text-slate-500">
              服务科技丝绸之路与高校先进适用技术沿线推广
            </span>
          </div>

          {/* 4 个 Tabs */}
          <div className="flex space-x-2 border-b border-slate-200">
            {[
              { id: "policy", label: "政策指引" },
              { id: "project", label: "沿线示范项目" },
              { id: "activity", label: "合作交流活动" },
              { id: "achievement", label: "重点建设成果" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBriTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  briTab === tab.id
                    ? "border-blue-800 text-blue-900 font-bold bg-blue-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容区 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            {briTab === "policy" && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">《“一带一路”科技创新行动计划高校实施细则》</span>
                    <span className="text-xs text-slate-400">2025-10</span>
                  </div>
                  <p className="text-xs text-slate-600">明确支持高校科技企业在沿线设立“鲁班工坊”衍生技术转化站与绿色农业离岸联合实验室。</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">《高校共建“数字丝绸之路”国际标准互通互认扶持指引》</span>
                    <span className="text-xs text-slate-400">2025-06</span>
                  </div>
                  <p className="text-xs text-slate-600">推动智能电网、轨道交通与数字孪生高校自主技术标准纳入沿线国家行业规范。</p>
                </div>
              </div>
            )}

            {briTab === "project" && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">中哈现代农业节水灌溉技术装备联合产业化示范区</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">推进中</span>
                  </div>
                  <p className="text-xs text-slate-600">西北农林科技大学联合哈萨克斯坦国立农业大学，在阿拉木图落地示范基地逾万亩。</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">中国-东盟智能微电网技术转化与人才联合实训基地</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">已立项</span>
                  </div>
                  <p className="text-xs text-slate-600">华南理工大学与马来亚大学联合共建，服务东盟海岛分布式新能源并网解决方案。</p>
                </div>
              </div>
            )}

            {briTab === "activity" && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">第四届“一带一路”高校校办产业高层圆桌会议</span>
                    <span className="text-xs text-slate-400">2026-05 乌兹别克斯坦塔什干</span>
                  </div>
                  <p className="text-xs text-slate-600">聚焦中亚区域水资源综合治理与矿产绿色开采高校科技成果对接。</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">2026澜湄流域高校成果出海技术线上对接路演会</span>
                    <span className="text-xs text-slate-400">常态化每季度举办</span>
                  </div>
                  <p className="text-xs text-slate-600">面向老挝、泰国、柬埔寨发布国内高校适合就地产业化的中试成果清单。</p>
                </div>
              </div>
            )}

            {briTab === "achievement" && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">累计促成沿线技术转移交易额突破 4.2 亿元人民币</span>
                    <span className="text-xs text-blue-800 font-semibold">2023-2025综合统计</span>
                  </div>
                  <p className="text-xs text-slate-600">覆盖沿线22个共建国家，培育高校跨国产学研联合实体19家，累计授权PCT发明专利46项。</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. 涉外交流活动 */}
        <section id="activities" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">涉外交流活动专区</h2>
            </div>
            <span className="text-xs text-slate-500">
              涵盖出访考察、海外来访、国际论坛、成果展会与专业培训
            </span>
          </div>

          {/* 活动分类筛选标签（出访、来访、论坛、展会、培训） */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">活动类型：</span>
            {["全部", "出访", "来访", "论坛", "展会", "培训"].map((type) => (
              <button
                key={type}
                onClick={() => setActivityTypeFilter(type)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activityTypeFilter === type
                    ? "bg-blue-800 text-white font-semibold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 活动列表（包含预告与纪要） */}
          <div className="space-y-4">
            {[
              {
                id: 1,
                type: "出访",
                status: "活动预告",
                statusColor: "bg-amber-100 text-amber-800 border-amber-200",
                title: "2026年高校校办产业代表团赴德国、瑞士先进智能制造专项出访考察交流",
                date: "2026-11-12 至 2026-11-20",
                location: "德国慕尼黑 / 瑞士苏黎世",
                summary: "【活动预告】组织国内重点高校资产公司与科技园负责人，实地对接苏黎世联邦理工学院概念验证中心与巴伐利亚智能智造创新链，洽谈离岸技术转移机制。",
              },
              {
                id: 2,
                type: "来访",
                status: "活动纪要",
                statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
                title: "新加坡国立大学与南洋理工大学高校企业联合代表团来华访问圆满举行",
                date: "2026-08-18",
                location: "中国北京 · 国专委秘书处",
                summary: "【活动纪要】双方围绕智慧城市、绿色储能电池国际技术许可深入会谈，达成了设立中新高校双向成果孵化绿色通道等多项共识备忘录。",
              },
              {
                id: 3,
                type: "论坛",
                status: "活动预告",
                statusColor: "bg-amber-100 text-amber-800 border-amber-200",
                title: "2026中欧高校产学研国际技术转移与转化峰会（线上+线下）",
                date: "2026-10-28",
                location: "中国上海 · 国家会展中心",
                summary: "【活动预告】汇聚中外50余所知名大学校长与跨国技术经理人，重点探讨跨国产学研利益共享、职务成果海外赋权与跨国合规争议防范实务。",
              },
              {
                id: 4,
                type: "展会",
                status: "活动纪要",
                statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
                title: "第二届中国高校高新技术成果（东盟）巡展暨产学研对接博览会闭幕",
                date: "2026-07-05 至 2026-07-08",
                location: "马来西亚吉隆坡",
                summary: "【活动纪要】国内26所高校参展，展出涉及智能农业、数字医疗等前沿技术成果110余项，现场签署意向合作金额达8500万元。",
              },
              {
                id: 5,
                type: "培训",
                status: "活动预告",
                statusColor: "bg-amber-100 text-amber-800 border-amber-200",
                title: "第四期高校涉外知识产权合规管理与PCT跨国专利布局高级研讨培训班",
                date: "2026-10-15 至 2026-10-17",
                location: "中国深圳",
                summary: "【活动预告】邀请国家知识产权局专家与涉外知名专利律师，专场讲授欧美技术出口管制应对、跨境商业秘密保护与国际许可谈判技巧。",
              },
            ]
              .filter((act) => activityTypeFilter === "全部" || act.type === activityTypeFilter)
              .map((act) => (
                <div
                  key={act.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                        {act.type}活动
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${act.statusColor}`}>
                        {act.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>时间：{act.date}</span>
                      <span>地点：{act.location}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                    {act.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {act.summary}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* 5. 合作需求与对接 */}
        <section id="matchmaking" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">合作需求与跨境对接大厅</h2>
            </div>
            <span className="text-xs text-slate-500">
              汇集国内高校产业需求与海外机构来华合作意向
            </span>
          </div>

          {/* 核心免责声明（置于合作需求显眼位置，带警示高亮框） */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-900 mb-1">权威合规提示与免责声明</h3>
                <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                  注意：本频道合作需求与对接信息不得表述为由国专委直接签约或直接承接合作。页面提交的信息仅作撮合线索，涉及对外法律行为的须加注“经协会授权后实施”。
                </p>
              </div>
            </div>
          </div>

          {/* 国内与海外两块区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 区域一：国内单位发布技术与合作需求 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                <h3 className="text-sm font-bold text-slate-900">国内单位技术攻关与出海需求</h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">高端装备 / 智能制造</span>
                    <span className="text-xs text-slate-400">华东某“双一流”大学国家大学科技园</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">高精度工业视觉缺陷检测算法海外技术合作意向</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    拟寻求欧洲（德国或瑞士）具有成熟工业落地经验的联合实验室，共同开发适应多光源复杂反光表面的质检模型，支持合作建立概念验证中心。
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">发布周期：2026年Q3前有效 · 合作形式：联合研发 / 知识产权共有</div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">新能源 / 储能材料</span>
                    <span className="text-xs text-slate-400">华南重点高校校办产业集团</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">新型固态钠离子电池中试产线东盟本地化组装合作</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    国内核心电极材料中试工艺已成型，寻求新加坡或马来西亚当地具产业资质的工业园承接地，共同设立示范装配工厂，开拓东南亚储能市场。
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">发布周期：长期有效 · 合作形式：技术入股 / 股权合作</div>
                </div>
              </div>
            </div>

            {/* 区域二：海外机构发布合作意向 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <h3 className="text-sm font-bold text-slate-900">海外机构来华意向与技术转移需求</h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">生命科学 / 靶向药物</span>
                    <span className="text-xs text-slate-400">英国牛津区域某创新生物孵化平台</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">早期抗肿瘤先导化合物大中华区临床试验联合开发</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    持有2项已获PCT授权的激酶抑制剂核心专利，希望寻找中国具备三甲教学医院背景的高校科技开发部及药企，开展合作研发与临床试验申报。
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">发布周期：2026年内有效 · 合作形式：专利转让 / 许可授权</div>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">智慧农业 / 水资源</span>
                    <span className="text-xs text-slate-400">中亚创新科技网络联合体 (CAITN)</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">干旱半干旱地区耐盐碱作物与滴灌测控技术引进意向</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    拟引入中国高校成熟的耐旱耐盐作物品种与北斗精准滴灌自动化控制系统，已备齐当地试验示范田，诚邀相关高校专家团队对接。
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">发布周期：常年有效 · 合作形式：成果转让 / 援外产学研项目</div>
                </div>
              </div>
            </div>
          </div>

          {/* 静态发布表单 */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">提交跨境产学研合作需求（静态模拟录入）</h3>
              <span className="text-[11px] text-slate-400">信息提交后将作为撮合线索转交秘书处初审</span>
            </div>

            {formSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span>需求信息已成功模拟提交！平台已生成线索登记编号（经协会授权后实施）。</span>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs font-semibold text-emerald-900 underline ml-3 cursor-pointer"
                >
                  继续提交
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">单位名称 / 机构名称 *</label>
                  <input
                    type="text"
                    placeholder="例如：某高校资产管理公司 / 海外科技创新中心"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">发布类型 *</label>
                  <select className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800">
                    <option>国内单位发布技术与合作需求</option>
                    <option>海外机构发布意向与技术转移</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">专业领域 *</label>
                  <select className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800">
                    <option>智能制造与高端装备</option>
                    <option>新能源与绿色低碳</option>
                    <option>生物医药与生命健康</option>
                    <option>现代农业与水利环境</option>
                    <option>数字经济与人工智能</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">联系人与职务 / 电子邮箱 *</label>
                  <input
                    type="text"
                    placeholder="姓名 · 职务 · 邮箱 (如：zhuanwei@university.edu.cn)"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">合作需求详细描述 *</label>
                  <textarea
                    rows={2}
                    placeholder="简述技术亮点、期望合作国别或机构类型、合作方式与预期周期..."
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-800"
                  ></textarea>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(true)}
                    className="px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold transition-colors cursor-pointer text-xs"
                  >
                    提交需求意向 (模拟)
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. 国际组织与友好机构 */}
        <section id="organizations" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">国际组织与友好合作机构</h2>
            </div>
            <span className="text-xs text-slate-500">
              全球学术创新联合体、技术转移网络与海外友好高校
            </span>
          </div>

          <div className="space-y-6">
            {/* 分组一：国际组织与创新联盟 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                【国际学术组织与创新联盟】
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "国际大学科技园协会 (IASP)",
                    sub: "International Association of Science Parks",
                    desc: "全球科技园区与高校孵化创新区官方联盟，连接70余国知名大学科技园。",
                    country: "总部：西班牙",
                  },
                  {
                    name: "国际技术转移经理人联盟 (ATTP)",
                    sub: "Alliance of Technology Transfer Professionals",
                    desc: "全球权威技术转移专业资格认证机构，协同开展RTTP国际认证培训。",
                    country: "全球联合机构",
                  },
                  {
                    name: "欧洲高校产业联络与技术转移协会 (ASTP)",
                    sub: "Association of European Science & Tech Transfer",
                    desc: "欧洲最大的知识转移与高校科技成果商业化行业互联网络。",
                    country: "总部：荷兰",
                  },
                ].map((org, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        LOGO
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{org.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{org.sub}</div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{org.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>{org.country}</span>
                      <a href="#organizations" className="text-blue-800 font-semibold hover:underline">了解合作 &rarr;</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 分组二：海外重点友好高校与技术转移机构 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                【海外友好高校与科技成果转化机构】
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "德国慕尼黑工业大学科技转化院",
                    sub: "TUM ForTe - Office for Research and Innovation",
                    desc: "欧洲顶尖创业型大学产业转化标杆，在智能机械、先进汽车工程领域具有深度合作。",
                    country: "德国 慕尼黑",
                  },
                  {
                    name: "新加坡南洋理工大学创新中心",
                    sub: "NTUitive (Nanyang Technological University)",
                    desc: "负责南洋理工大学所有前沿研究商业化孵化与衍生企业海外投资培育。",
                    country: "新加坡",
                  },
                  {
                    name: "英国牛津大学创新转化机构",
                    sub: "Oxford University Innovation (OUI)",
                    desc: "全球历史悠久的大学技术许可中心，每年产生数十项高价值衍生实体与专利授权。",
                    country: "英国 牛津",
                  },
                ].map((org, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        UNIV
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{org.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{org.sub}</div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{org.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>{org.country}</span>
                      <a href="#organizations" className="text-blue-800 font-semibold hover:underline">合作简介 &rarr;</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
