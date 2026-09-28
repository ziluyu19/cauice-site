'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── 子导航 ───
const subNavItems = [
  { id: 'committee-news', label: '专委会要闻' },
  { id: 'member-news', label: '会员单位动态' },
  { id: 'media-focus', label: '媒体关注' },
  { id: 'media-gallery', label: '图片与视频' },
];

// ─── 专委会要闻数据 ───
const committeeNewsData = [
  {
    date: '2026-09-15',
    tag: '重要会议',
    tagColor: 'bg-blue-100 text-blue-800',
    title: '国专委2026年度第三次常务理事会圆满召开，审议通过多项重要工作报告',
    summary: '会议听取了国际合作工作委员会、成果转化工作委员会年中进展汇报，审议通过《2026年下半年重点工作计划》及《团体标准立项审查报告》，并就新一轮会员单位吸纳工作进行专题研讨。',
    imgAlt: '常务理事会会议现场，与会代表正在审议工作报告',
  },
  {
    date: '2026-08-28',
    tag: '活动承办',
    tagColor: 'bg-emerald-100 text-emerald-800',
    title: '国专委承办"2026中欧高校产学研国际技术转移峰会"，50余所中外高校代表出席',
    summary: '峰会在上海国家会展中心举行，聚焦跨国产学研利益共享机制、职务成果海外赋权与跨国合规争议防范。与会代表达成14项合作意向备忘录，会后形成《2026上海共识》并向相关部委提交政策建议。',
    imgAlt: '中欧峰会主论坛现场，主持人与中外嘉宾在台上就技术转移机制展开对话',
  },
  {
    date: '2026-08-10',
    tag: '工作进展',
    tagColor: 'bg-purple-100 text-purple-800',
    title: '国专委完成2026年度第一批会员单位资质审查，新吸纳会员11家',
    summary: '经秘书处初审与常务理事会审议，共11家单位通过2026年第一批会员资质审查，涵盖3所高校、4家校办企业、2家技术转移机构及2所国家大学科技园，会员总数现已达到179家。',
    imgAlt: '秘书处工作人员正在整理新会员单位资质档案及电子备案材料',
  },
  {
    date: '2026-07-22',
    tag: '标准发布',
    tagColor: 'bg-amber-100 text-amber-800',
    title: '三项团体标准 T/CAUI 正式批准发布，填补高校科技园规范化建设领域空白',
    summary: 'T/CAUI 016-2025《智慧型高等院校科技孵化中心建设指南》、T/CAUI 028-2025《校企合作产学研用示范中心建设指南》及T/CAUI 032-2025《概念验证中心规范化导则》正式发布实施，全国高校科技园可据此开展对标建设。',
    imgAlt: '标准发布仪式上，国专委秘书长与团标审查委员会专家代表共同签署批准文件',
  },
];

// ─── 会员单位动态数据 ───
const memberNewsData = [
  {
    date: '2026-09-10',
    unit: '清华大学科技开发部',
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    title: '清华AI辅助药物分子设计平台衍生企业完成B轮融资，估值突破15亿元',
    summary: '依托清华大学药学院核心成果孵化的某生物科技企业完成B轮融资3.2亿元，由国内外顶级医疗基金联合领投，将用于临床前候选药物扩充及海外市场准入申报。',
  },
  {
    date: '2026-09-03',
    unit: '浙江大学工业技术转化研究院',
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    title: '浙大与新加坡南洋理工大学联合研发固态电池产业化项目正式落地马来西亚',
    summary: '中新双方联合在马来西亚柔佛州工业园签约建设示范产线，首批产品预计2027年Q1下线，东盟战略合作投资已到位3000万新元，标志着国内高校新能源成果东南亚产业化的重大突破。',
  },
  {
    date: '2026-08-20',
    unit: '同济大学国家技术转移中心',
    tag: '标准与合规',
    tagColor: 'bg-purple-100 text-purple-800',
    title: '同济技术转移中心主导完成首个高校涉外技术转移合规管理团体标准送审稿',
    summary: '经过18个月研制，面向全国技术转移机构的涉外合规管理标准送审稿已正式提交国专委团标委员会，预计2026年底完成最终审查并批准发布，将填补该领域重要制度空白。',
  },
  {
    date: '2026-08-05',
    unit: '复旦大学国家大学科技园',
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    title: '复旦科技园"中英生命科学快速通道"促成首例高校衍生企业跨国PCT专利授权',
    summary: '依托与牛津大学创新转化机构联合建立的绿色通道，复旦在孵企业完成全球首例中国高校衍生企业向英国本土药企的PCT跨国专利独家许可，首付许可费约600万英镑。',
  },
  {
    date: '2026-07-15',
    unit: '西安交通大学技术转移中心',
    tag: '一带一路',
    tagColor: 'bg-amber-100 text-amber-800',
    title: '西交大抽油泵控制技术中哈商业化合作累计合同额突破5000万元',
    summary: '在国专委国际合作部协助撮合下，西安交通大学与哈萨克斯坦国立技术大学技术合作进入深化阶段，已培训当地工程师38名，本地化服务能力初步建立，后续技术服务合同正在洽谈中。',
  },
  {
    date: '2026-07-02',
    unit: '中山大学国家大学科技园',
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    title: '中山大学粤港澳跨境数据合规平台完成港澳广三地商业注册，服务企业逾300家',
    summary: '整合中山大学与香港科技大学算法资源开发的跨境数据合规管理平台已正式进入商业化阶段，三地注册实体已完成工商登记，成为大湾区产学研协同创新的标杆案例。',
  },
];

// ─── 媒体关注数据 ───
const mediaFocusData = [
  {
    date: '2026-09-12',
    media: '《科技日报》',
    mediaType: '中央媒体',
    title: '高校科技成果"出海"加速，国专委探索涉外合规新机制',
    url: '#',
  },
  {
    date: '2026-09-05',
    media: '《中国教育报》',
    mediaType: '教育主流媒体',
    title: '国专委三项团体标准发布，为高校科技园建设提供规范依据',
    url: '#',
  },
  {
    date: '2026-08-30',
    media: '澎湃新闻',
    mediaType: '互联网媒体',
    title: '中欧技术转移峰会在沪举行，中外高校代表达成《2026上海共识》',
    url: '#',
  },
  {
    date: '2026-08-18',
    media: '新华网',
    mediaType: '中央媒体',
    title: '清华、浙大等高校校办产业加速国际化，专委会平台发挥关键作用',
    url: '#',
  },
  {
    date: '2026-08-08',
    media: '《第一财经》',
    mediaType: '财经媒体',
    title: '固态电池东盟产业化落地：一个中国高校成果出海的完整案例解析',
    url: '#',
  },
  {
    date: '2026-07-20',
    media: '光明日报',
    mediaType: '中央媒体',
    title: '产学研深度融合，高校校办产业在国际科技合作中的新角色',
    url: '#',
  },
];

// ─── 图片与视频数据 ───
const galleryData = [
  {
    type: '图片',
    typeColor: 'bg-blue-100 text-blue-800',
    date: '2026-09-15',
    caption: '国专委2026年第三次常务理事会全体与会代表合影，摄于北京某高校会议中心。',
    desc: '常务理事会会议',
    bgColor: 'from-blue-900 to-slate-800',
    icon: '📸',
  },
  {
    type: '视频',
    typeColor: 'bg-red-100 text-red-700',
    date: '2026-08-28',
    caption: '2026中欧高校产学研峰会主旨演讲完整录像，时长约3小时，包含中英双语同传。',
    desc: '中欧峰会主旨演讲',
    bgColor: 'from-slate-800 to-blue-950',
    icon: '🎬',
  },
  {
    type: '图片',
    typeColor: 'bg-blue-100 text-blue-800',
    date: '2026-08-28',
    caption: '峰会展览区，来自中德、中英、中新高校的成果展示摊位吸引参展者驻足交流。',
    desc: '峰会展览区实拍',
    bgColor: 'from-emerald-900 to-slate-800',
    icon: '📸',
  },
  {
    type: '视频',
    typeColor: 'bg-red-100 text-red-700',
    date: '2026-08-10',
    caption: '国专委2026年新会员单位迎新说明会全程回放，介绍会员权益与服务使用指南，时长约1.5小时。',
    desc: '新会员迎新说明会',
    bgColor: 'from-purple-900 to-slate-800',
    icon: '🎬',
  },
  {
    type: '图片',
    typeColor: 'bg-blue-100 text-blue-800',
    date: '2026-07-22',
    caption: '三项T/CAUI团体标准发布仪式现场，国专委秘书长与各标准起草单位代表共同为标准揭幕。',
    desc: '团体标准发布仪式',
    bgColor: 'from-amber-900 to-slate-800',
    icon: '📸',
  },
  {
    type: '图片',
    typeColor: 'bg-blue-100 text-blue-800',
    date: '2026-07-08',
    caption: '第二届中国高校高新技术成果（东盟）巡展在马来西亚吉隆坡举行，国专委代表团与马方主办机构负责人合影。',
    desc: '东盟成果巡展',
    bgColor: 'from-teal-900 to-slate-800',
    icon: '📸',
  },
];

export default function NewsPage() {
  const [activeAnchor, setActiveAnchor] = useState('committee-news');

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">

      {/* ─── Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">新闻中心</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              新闻中心
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              汇聚国专委要闻、会员单位动态、媒体报道与活动影像，记录高校产学研国际合作的每一步进展。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 子导航 ─── */}
      <div className="sticky top-[148px] sm:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2.5">
            {subNavItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToAnchor(e, item.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeAnchor === item.id
                    ? 'bg-blue-900 text-white font-semibold'
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

        {/* ════════════════════════════════
            1. 专委会要闻
        ════════════════════════════════ */}
        <section id="committee-news" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">专委会要闻</h2>
            </div>
            <span className="text-xs text-slate-500">专委会主办、承办重要活动及工作进展动态</span>
          </div>

          <div className="space-y-6">
            {committeeNewsData.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-5 p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group">
                {/* 左侧图片占位 */}
                <div className="md:w-48 md:shrink-0">
                  <div className="w-full h-28 md:h-full min-h-[80px] rounded-lg bg-gradient-to-br from-blue-900 to-slate-700 flex flex-col items-center justify-center text-white text-center p-3 space-y-1">
                    <span className="text-2xl">📋</span>
                    <span className="text-[10px] leading-tight opacity-80">{item.imgAlt}</span>
                  </div>
                </div>
                {/* 右侧文字 */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${item.tagColor}`}>{item.tag}</span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            2. 会员单位动态
        ════════════════════════════════ */}
        <section id="member-news" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位动态</h2>
            </div>
            <span className="text-xs text-slate-500">会员单位在国际合作与成果转化方面的最新进展</span>
          </div>

          <div className="divide-y divide-slate-100">
            {memberNewsData.map((item, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-3 group hover:bg-blue-50/30 -mx-2 px-2 rounded-lg transition-colors">
                {/* 日期与标签列 */}
                <div className="sm:w-36 shrink-0 space-y-1">
                  <div className="text-xs text-slate-400 font-mono">{item.date}</div>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded font-semibold ${item.tagColor}`}>{item.tag}</span>
                </div>
                {/* 内容列 */}
                <div className="flex-1 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-medium">{item.unit}</div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            3. 媒体关注
        ════════════════════════════════ */}
        <section id="media-focus" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">媒体关注</h2>
            </div>
            <span className="text-xs text-slate-500">第三方媒体对国专委及会员单位的报道索引</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">日期</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">媒体名称</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">类型</th>
                  <th className="px-4 py-3 font-semibold min-w-[260px]">报道标题</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">链接</th>
                </tr>
              </thead>
              <tbody>
                {mediaFocusData.map((item, i) => (
                  <tr
                    key={i}
                    className={`border-t border-slate-200 align-middle ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/40 transition-colors`}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">{item.date}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{item.media}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">{item.mediaType}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium leading-snug">{item.title}</td>
                    <td className="px-4 py-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 rounded-lg border border-blue-300 text-blue-800 font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        查看原文 →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ════════════════════════════════
            4. 图片与视频
        ════════════════════════════════ */}
        <section id="media-gallery" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">图片与视频</h2>
            </div>
            <span className="text-xs text-slate-500">活动影像资料存档，每项均附图文说明</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleryData.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-blue-300 hover:shadow-md transition-all group flex flex-col"
              >
                {/* 图片/视频占位区（带说明文字，不允许纯图） */}
                <div className={`relative bg-gradient-to-br ${item.bgColor} h-44 flex flex-col items-center justify-center text-white text-center p-4 space-y-2`}>
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-sm font-bold tracking-wide">{item.desc}</span>
                  <span className={`absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded font-semibold ${item.typeColor}`}>
                    {item.type}
                  </span>
                </div>
                {/* 文字说明区（必填，严格要求有内容） */}
                <div className="p-4 flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${item.typeColor}`}>{item.type}</span>
                  </div>
                  {/* 新闻图片说明（每张必须配备一句话完整说明） */}
                  <p className="text-xs text-slate-700 leading-relaxed flex-1 font-medium">
                    {item.caption}
                  </p>
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href="#media-gallery"
                      className="text-xs font-semibold text-blue-800 hover:underline"
                    >
                      {item.type === '视频' ? '播放视频 ▶' : '查看大图 →'}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-400 text-center pt-2">
            图片与视频仅供存档参考，如需授权使用请联系秘书处：secretariat@guozhuanwei.org.cn
          </div>
        </section>

      </main>
    </div>
  );
}
