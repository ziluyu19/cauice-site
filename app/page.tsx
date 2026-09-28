"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [newsTab, setNewsTab] = useState<"all" | "committee" | "industry" | "meeting">("all");
  const [noticeTab, setNoticeTab] = useState<"all" | "notice" | "evaluate" | "policy">("all");

  // News Data (遵循内容隔离规则，新闻中心绝不进入征集、报名、申报等通知类事项)
  const newsData = [
    {
      id: 1,
      type: "committee",
      tag: "头条要闻",
      title: "2026年高校校办产业高质量创新发展大会暨第三届国际协同交流峰会在京成功召开",
      summary: "汇聚全国重点高校科技产业力量，探讨高校科技成果转化新模式与跨国合作新范式，共拓数字化转型新路径。",
      date: "2026-09-20",
      views: 3420,
    },
    {
      id: 2,
      type: "industry",
      tag: "行业热点",
      title: "多项高校校企协同国际标准获批立项：赋能产业链数智协同与科技成果产业化",
      summary: "国专委牵头组织编制的多项国家及行业团体标准正式进入起草阶段，广泛征集高校及领军校企意见。",
      date: "2026-09-18",
      views: 2180,
    },
    {
      id: 3,
      type: "meeting",
      tag: "会议纪要",
      title: "常务理事会2026年第三季度工作统筹会议在京顺利圆满举行",
      summary: "全面回顾高校产业出海阶段性成果，部署高校前沿智库成果转化及下阶段全球伙伴网络扩容工作。",
      date: "2026-09-15",
      views: 1890,
    },
    {
      id: 4,
      type: "committee",
      tag: "国专委动态",
      title: "国专委专家智库赴多省市高校国家大学科技园开展先进制造与成果转化专项调研",
      summary: "深调研、摸实情、出对策，为高校校办产业集群高质量出海与区域经济融合提供精准指引。",
      date: "2026-09-12",
      views: 1560,
    },
  ];

  // Notices Data
  const noticesData = [
    {
      id: 1,
      type: "notice",
      tag: "公示通知",
      title: "关于开展2026年度“高校校办产业科技创新与国际协同”卓越成果征集评选的通知",
      date: "09-21",
      urgent: true,
    },
    {
      id: 2,
      type: "evaluate",
      tag: "评审评优",
      title: "2026年第二批入会申请会员单位资质审核通过名单及公示公告",
      date: "09-19",
      urgent: false,
    },
    {
      id: 3,
      type: "policy",
      tag: "政策法规",
      title: "转发权威部门《关于进一步深化高校科技创新成果跨境产业化与标准互认的指导意见》",
      date: "09-17",
      urgent: false,
    },
    {
      id: 4,
      type: "notice",
      tag: "活动报名",
      title: "关于举办第十二期全国高校科技成果转移转化与国际合规专家研讨班的报名通告",
      date: "09-14",
      urgent: false,
    },
    {
      id: 5,
      type: "evaluate",
      tag: "课题申报",
      title: "2026年度高校产教融合重点智库专项科研基金自主攻关课题申报指南发布",
      date: "09-10",
      urgent: false,
    },
  ];

  // Service Entrances
  const serviceCards = [
    {
      title: "会员申请入会",
      desc: "在线提交资料，快速认证专属会员高校或企业身份与权益",
      tag: "便捷办理",
      iconBg: "bg-blue-50 text-blue-700",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      title: "科技成果申报",
      desc: "高校校办产业科技成果认定、标准化立项与智库评审入口",
      tag: "全程网办",
      iconBg: "bg-indigo-50 text-indigo-700",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "专家智库咨询",
      desc: "对接两院院士与高校资深专家智库，提供专项咨询与战略诊断",
      tag: "智力支持",
      iconBg: "bg-sky-50 text-sky-700",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "学术会议注册",
      desc: "国际高校产学研研讨会、行业年会及闭门沙龙参会报名通道",
      tag: "线上通道",
      iconBg: "bg-cyan-50 text-cyan-700",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  // Think Tank Reports
  const reports = [
    {
      id: 1,
      title: "2026中国高校校办产业国际化发展与技术转移白皮书",
      author: "国专委产业研究室",
      date: "2026-09",
      badge: "重磅发布",
      downloads: "12,490次",
    },
    {
      id: 2,
      title: "全球新能源与低碳技术高校科研成果跨境转化评估报告",
      author: "国际绿色协同智库",
      date: "2026-08",
      badge: "年度核心",
      downloads: "8,320次",
    },
    {
      id: 3,
      title: "高校产学研用融合效能及跨国创新孵化指数指南",
      author: "国专委创新经济课题组",
      date: "2026-07",
      badge: "决策参考",
      downloads: "6,940次",
    },
  ];

  // International Projects
  const globalProjects = [
    {
      title: "中欧大学科技园与绿色低碳可持续发展技术联合实验室",
      region: "欧洲合作区",
      desc: "联合欧洲顶尖理工大学与科研基地，共建低碳标准认证与技术协同开发平台。",
      status: "常态化运营",
    },
    {
      title: "亚太区域大学科技成果跨境孵化与供应链协同伙伴计划",
      region: "亚太经济圈",
      desc: "连接新加坡、日本等高校产业协会，推动知识产权跨境转化与数据互信互通。",
      status: "推进中",
    },
    {
      title: "“一带一路”共建国家高校校办产业领军人才研修工程",
      region: "全球网络",
      desc: "累计联合多所知名高校培养超60个国家共2800名关键领域产学研管理领军人才。",
      status: "年度计划",
    },
  ];

  // Member Logos / Universities & Enterprises Placeholder
  const memberUnits = [
    "清华大学科技开发部",
    "北京大学科技开发部",
    "浙江大学工业技术转化研究院",
    "上海交通大学先进产业技术研究院",
    "华中科技大学产业集团",
    "西安交通大学国家大学科技园",
    "哈尔滨工业大学资产投资经营公司",
    "中国科学技术大学先进技术研究院",
    "东南大学国家大学科技园",
    "同济创新创业控股有限公司",
    "天津大学内燃机研究所产业化中心",
    "华南理工大学科技成果转化中心",
  ];

  const filteredNews = newsData.filter((item) => {
    if (newsTab === "all") return true;
    return item.type === newsTab;
  });

  const filteredNotices = noticesData.filter((item) => {
    if (noticeTab === "all") return true;
    return item.type === noticeTab;
  });

  return (
    <div id="top" className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">

      {/* ============================================================ */}
      {/* 栏目1：首页 Hero 主视觉区 (对应导航“首页” #top) */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden py-20 lg:py-28">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Decorative Glow */}
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
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-3.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                申请加入国专委
              </button>
              <a
                href="#thinktank"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all"
              >
                查阅智库白皮书
              </a>
              <a
                href="#services"
                className="px-6 py-3.5 text-sm font-semibold rounded-lg text-slate-300 hover:text-white transition-colors inline-flex items-center space-x-1"
              >
                <span>进入办事大厅</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
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
      {/* 栏目2：国专委概况 (对应导航“国专委概况” #about) */}
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
      {/* 栏目3与栏目4：新闻中心 (#news) 与 通知公告 (#notices) 并排 */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* 栏目3：新闻中心 · 要闻专区 (左侧 7 列，对应导航“新闻中心” #news) */}
            <div id="news" className="scroll-mt-48 lg:scroll-mt-52 lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">新闻中心 · 要闻专区</h2>
                </div>
                {/* News Tabs */}
                <div className="flex space-x-2 text-xs font-medium">
                  {[
                    { id: "all", label: "全部" },
                    { id: "committee", label: "国专委动态" },
                    { id: "industry", label: "行业热点" },
                    { id: "meeting", label: "会议纪要" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setNewsTab(tab.id as any)}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        newsTab === tab.id
                          ? "bg-blue-800 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlight News Card */}
              <div className="group block mb-6 p-4 rounded-lg bg-blue-50/50 border border-blue-100 hover:border-blue-300 transition-all">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">置顶</span>
                  <span className="text-xs text-blue-700 font-semibold">首要关注</span>
                  <span className="text-xs text-slate-400">| 2026-09-20</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                  深化高水平开放合作：国专委2026年度战略规划与高校重大科研转化课题发布会在京启动
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
                  会议汇聚来自教育部直属高校、科研院所及领军跨国企业的300余位代表，共同审议通过了高校未来三年产业技术攻关清单与国际标准共享行动纲领。
                </p>
              </div>

              {/* News List */}
              <div className="divide-y divide-slate-100">
                {filteredNews.map((item) => (
                  <div key={item.id} className="py-3.5 group flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2 rounded transition-colors">
                    <div className="flex items-start sm:items-center space-x-2">
                      <span className="shrink-0 px-2 py-0.5 text-[11px] rounded bg-slate-100 text-slate-600 font-medium group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                        {item.tag}
                      </span>
                      <a href="#news" className="text-sm font-medium text-slate-800 group-hover:text-blue-800 transition-colors line-clamp-1">
                        {item.title}
                      </a>
                    </div>
                    <div className="shrink-0 flex items-center space-x-3 text-xs text-slate-400 pl-2 sm:pl-0">
                      <span>{item.date}</span>
                      <span className="hidden sm:inline">阅读 {item.views}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <a href="#news" className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center space-x-1">
                  <span>查看更多要闻动态</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* 栏目4：通知公告区 (右侧 5 列，对应导航“通知公告” #notices) */}
            <div id="notices" className="scroll-mt-48 lg:scroll-mt-52 lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">通知公告</h2>
                  </div>
                  {/* Notice Tabs */}
                  <div className="flex space-x-1.5 text-xs font-medium">
                    {[
                      { id: "all", label: "全部" },
                      { id: "notice", label: "公示" },
                      { id: "evaluate", label: "评审" },
                      { id: "policy", label: "政策" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setNoticeTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          noticeTab === tab.id
                            ? "bg-slate-800 text-white"
                            : "text-slate-600 hover:bg-slate-100"
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
                    <div
                      key={notice.id}
                      className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              notice.urgent
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
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
                        <Link href="/notice" className="text-sm font-medium text-slate-800 group-hover:text-blue-800 transition-colors line-clamp-1 block">
                          {notice.title}
                        </Link>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {notice.date}
                      </span>
                    </div>
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
      {/* 栏目5：国际合作专区 (对应导航“国际合作” #global) */}
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
              <a
                href="#contact"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-300 hover:text-white border-b border-blue-400 pb-0.5"
              >
                <span>申请加入国际合作网络</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {globalProjects.map((item, idx) => (
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
                  <span>查看国际项目档案</span>
                  <span>&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目6：会员单位与服务 (对应导航“会员单位与服务” #services) */}
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
              <div
                key={idx}
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
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="text-xs font-medium text-slate-400 group-hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    立即前往办理
                  </button>
                  <span className="text-blue-800 transform group-hover:translate-x-1 transition-transform">
                    &rarr;
                  </span>
                </div>
              </div>
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
                <div className="pt-2 text-xs font-semibold text-blue-800">
                  已立项发布行业标准 40+ 项 &rarr;
                </div>
              </div>
              <div className="space-y-2 pt-4 md:pt-0 md:px-6">
                <div className="text-sm font-bold text-blue-900">跨国产学研用联合体</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  联动全国重点高校国家重点实验室与跨国行业领军企业，推动核心关键技术攻关与工程化落地。
                </p>
                <div className="pt-2 text-xs font-semibold text-blue-800">
                  联合创新示范基地 18 处 &rarr;
                </div>
              </div>
              <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
                <div className="text-sm font-bold text-blue-900">校企科技领军人才研修</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  提供技术经纪人实操认证、国际知识产权运营与领军人才高级实训，赋能高校科技产业团队梯队建设。
                </p>
                <div className="pt-2 text-xs font-semibold text-blue-800">
                  累计赋能专业人才 5,000+ 人 &rarr;
                </div>
              </div>
            </div>
          </div>

          {/* 会员单位与友好机构名录墙 */}
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
              {memberUnits.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-center text-center group min-h-[72px]"
                >
                  <span className="text-xs font-medium text-slate-700 group-hover:text-blue-900 transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-800 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 cursor-pointer"
              >
                <span>加入国专委会员体系，共享高校智库与产业对接网络</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目7：成果与智库 (对应导航“成果与智库” #thinktank) */}
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
              <a
                href="#thinktank"
                className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center space-x-1"
              >
                <span>浏览全部智库成果库</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map((report) => (
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
                    <div>累计阅读下载：{report.downloads}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button className="text-xs font-semibold text-blue-800 hover:text-blue-900 flex items-center space-x-1 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>下载全文 (PDF)</span>
                  </button>
                  <span className="text-xs text-slate-400">公开授权</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 栏目8：信息公开 (对应导航“信息公开” #disclosure) */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <span className="text-slate-400">PDF</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>会员代表大会选举办法</span>
                    <span className="text-slate-400">PDF</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>学术委员会工作细则</span>
                    <span className="text-slate-400">PDF</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-800 cursor-pointer">
                查阅全部制度 &rarr;
              </div>
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
                    <span>2025年度财务收支审计报告</span>
                    <span className="text-slate-400">06-18</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>会员会费收取与管理办法公示</span>
                    <span className="text-slate-400">03-12</span>
                  </li>
                  <li className="hover:text-blue-800 cursor-pointer flex items-center justify-between">
                    <span>公益赞助与专项基金使用公告</span>
                    <span className="text-slate-400">01-10</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-800 cursor-pointer">
                查阅财务年报 &rarr;
              </div>
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
                    <span>2026年度科技成果奖初评公示</span>
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
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-800 cursor-pointer">
                查阅历年公示 &rarr;
              </div>
            </div>

            {/* Column 4: 官方证书与信函查验 */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>公文证书真伪核验</span>
                </div>
                <p className="text-xs text-blue-200/80 mb-4 leading-relaxed">
                  输入国专委出具的批件编号、会员证书或培训结业证编号，在线核对真伪。
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="输入16位证书或文件编号"
                    className="w-full px-3 py-1.5 text-xs rounded bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => alert("证书核验服务已就绪，请输入有效证明编号进行核验。")}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    立即查验
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-blue-300/70 pt-2 text-center">
                防伪追溯数据库直连
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 附加特色：专题聚焦专区 (Special Topics) */}
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
                title: "发展新质生产力高校产业行动",
                sub: "构建颠覆式科技创新成果产业化与校企融合新引擎",
                color: "from-blue-700 to-indigo-800",
              },
              {
                title: "“双碳”与高校科技绿色低碳转型",
                sub: "推动高校零碳技术研发、绿色校办产业与ESG治理",
                color: "from-emerald-700 to-teal-800",
              },
              {
                title: "高校专精特新校办企业赋能工程",
                sub: "提供天使创投对接、技术中试、专利护航与产业链整合扶持",
                color: "from-blue-900 to-slate-900",
              },
              {
                title: "第三届国际高校产业创新合作年会",
                sub: "线上大会专题：国内外大学校长论坛、产业日程与签约首发",
                color: "from-sky-700 to-blue-900",
              },
            ].map((topic, idx) => (
              <div
                key={idx}
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
              </div>
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}
