'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── 子导航 ───
const subNavItems = [
  { id: 'basic', label: '基本信息' },
  { id: 'leaders', label: '负责人与机构信息' },
  { id: 'org', label: '组织机构' },
  { id: 'reports', label: '年度工作报告' },
  { id: 'credit', label: '信用承诺' },
  { id: 'activities', label: '活动与项目情况' },
  { id: 'interaction', label: '互动交流' },
];

// ─── 基本信息数据 ───
const basicInfo = [
  { label: '机构全称', value: '中国高校校办产业协会国际产学研合作工作委员会（简称：国专委）' },
  { label: '成立批复', value: '中高产协字〔2023〕18号《关于设立中国高校校办产业协会国际产学研合作工作委员会的决定》' },
  { label: '办会宗旨', value: '立足全球科技创新视野，服务国家高水平对外开放与产教融合战略，赋能中国高校科技创新、成果跨境孵化及校办产业高质量出海。' },
  { label: '业务范围', value: '开展国际高校及科研机构产学研合作交流；组织跨国技术对接、展览展会与学术论坛；推动跨境成果孵化与技术转移人才培育；研制团体标准与行业发展智库报告；承担政府部门及总会委托的工作事项。' },
  { label: '秘书处办公地址', value: '北京市海淀区中关村南大街1号科技大厦B座806室（邮编：100081）' },
  { label: '官方联系方式', value: '电话：010-6891XXXX / 电子邮箱：secretariat@guozhuanwei.org.cn' },
];

// ─── 负责人及变动情况数据 ───
const leadersData = [
  {
    role: '主任委员',
    name: '周清源',
    title: '教授 / 博士生导师',
    org: '清华大学资产管理与产业研究院',
    changeRecord: '2023年10月第一届第一次委员代表大会选举产生，现任。',
    desc: '长期从事高校科技体制改革与产业创新战略研究，兼任国家科技成果转化引导基金专家委员会委员。',
  },
  {
    role: '副主任委员',
    name: '陈树安',
    title: '研究员',
    org: '浙江大学工业技术转化研究院',
    changeRecord: '2023年10月选举当选，分管国际技术对接与离岸创新基地建设，现任。',
    desc: '主持国家重点研发计划中欧联合研发专项，在智能制造及新材料国际转移领域经验丰富。',
  },
  {
    role: '副主任委员',
    name: '林美芬',
    title: '正高级经济师',
    org: '华南理工大学国家大学科技园',
    changeRecord: '2023年10月选举当选，分管粤港澳及东盟区域产学研协同平台，现任。',
    desc: '大湾区高校成果孵化联盟联合发起人，主导建立深港澳青年跨境创业联合通道。',
  },
  {
    role: '秘书长',
    name: '刘振宇',
    title: '副研究员 / 国际技术转移经理人(RTTP)',
    org: '国专委常设秘书处',
    changeRecord: '2023年10月常务理事会聘任；2025年换届考察中获全票连任，现任。',
    desc: '全面主持秘书处日常行政与服务运营，主导起草3项高校科技园建设团体标准。',
  },
];

// ─── 年度工作报告数据 ───
const annualReports = [
  {
    year: '2025年度',
    title: '2025年度工作总结与财务决算收支及2026年工作要点报告',
    publishDate: '2026-01-15',
    summary: '全年吸纳骨干高校及校办企业等会员单位32家；组织中欧、中新双向考察交流活动4次；推进并发布团体标准3项；发布《2025中国高校科技成果海外转化白皮书》。',
    plan: '2026年度计划重点推进“一带一路”产教融合实训示范区建设，拓展中亚及东盟技术转移节点。',
    fullContent: '一、2025年度核心业务执行概况\n1. 会员网络拓展：新增清华大学、浙江大学等骨干会员单位，全国入册会员突破120家。\n2. 国际技术撮合：主导举办中欧、中新专场对接路演，促成跨国技术许可与意向合同逾1.2亿元。\n3. 财务与合规：各项经费收支均严格执行总会规章，年度外部审计意见为无保留标准审计结论。',
  },
  {
    year: '2024年度',
    title: '2024年度工作开展情况报告及2025年度计划展望',
    publishDate: '2025-01-12',
    summary: '设立中新高校联合概念验证走廊；开展技术转移经纪人涉外业务骨干培训班3期，参训人员260余人次；完成全国高校涉外技术转移合规自查摸底工作。',
    plan: '2025年度计划加强团体标准立项体系建设，健全对会员单位常态化涉外法律合规咨询服务机制。',
    fullContent: '一、2024年度工作回顾\n1. 机制创新：首设“国际概念验证走廊”，打通中新绿色储能技术转移路径。\n2. 队伍建设：联合海外专业机构开展涉外技术转移人才高级研修，累计培育骨干260人次。\n3. 行业规范：启动首批3项产学研协同团体标准编制立项。',
  },
  {
    year: '2023年度',
    title: '第一届理事会筹备与开局年度工作总结报告',
    publishDate: '2024-01-10',
    summary: '完成民政备案与国专委建章立制；确立首批110家发起会员单位；搭设官方门户平台与国际合作项目初始储备库。',
    plan: '2024年度计划组织首场跨国高校技术路演峰会，完善专家库首期入库遴选工作。',
    fullContent: '一、建章立制与机构起步\n1. 完成组织机构搭建与秘书处设立。\n2. 制定并审议通过《国际产学研合作工作委员会工作条例》。\n3. 确立第一届理事会领导班子，明确三年工作发展纲要。',
  },
];

// ─── 重点活动与项目情况 ───
const activitiesProjects = [
  {
    title: '2026中欧高校产学研国际技术转移与转化峰会',
    type: '重大活动',
    time: '2026年8月',
    location: '中国上海',
    result: '联合50余所中外高校签署《2026上海共识》，达成14项跨国技术转让与许可合作意向备忘录。',
  },
  {
    title: '中新高校纳米新材料与绿色储能示范产线共建工程',
    type: '重点项目',
    time: '2025年 - 2027年',
    location: '中国杭州 / 新加坡 / 马来西亚柔佛',
    result: '带动国内高校衍生企业获东盟产业基金投资3000万新元，首期固态电池中试生产线正进场安装。',
  },
  {
    title: '中国高校高新技术成果（东盟）巡展暨博览会',
    type: '重大活动',
    time: '2025年7月',
    location: '马来西亚吉隆坡',
    result: '26所高校参展成果110余项，现场签署技术对接与联合人才培育意向协议8500万元。',
  },
  {
    title: '高校涉外技术出口合规与跨国PCT专利布局高级培训项目',
    type: '长期培育',
    time: '常态化每季度',
    location: '线上 + 北京/深圳',
    result: '已连续举办5期，累计培训高校院系转化负责人与骨干经纪人超400名，结业考核合格率98%。',
  },
];

// ─── 互动交流 - 意见征集数据 ───
const solicitations = [
  {
    title: '关于对团体标准《高校涉外技术转移合规管理指南》（征求意见稿）公开征求意见的通知',
    deadline: '2026-10-31',
    status: '进行中',
    method: '请将纸质盖章反馈意见扫描后发送至 secretariat@guozhuanwei.org.cn，邮件主题注明“团标意见征集”。',
    note: '结束后公布采用情况：征求期满后15个工作日内，起草组将梳理反馈意见清单并在本栏目公示采纳情况与修订说明。',
  },
  {
    title: '关于开展《中国高校校办企业国际化经营合规白皮书（2026版）》大纲征求行业建议的通知',
    deadline: '2026-08-31',
    status: '已结束',
    method: '书面或电子邮件反馈至规划部邮箱。',
    note: '结束后公布采用情况：已于2026年9月10日向行业公示《意见采纳说明表》，累计征集建议28条，采纳及部分采纳23条。',
  },
];

// ─── 互动交流 - 咨询留言数据 ───
const messageInquiries = [
  {
    user: '某双一流高校技术转移中心 李老师',
    date: '2026-09-18',
    question: '请问会员单位申请参与中欧国际技术转移走廊，是否有单独的资质门槛与申报时间节点？',
    reply: '您好！凡已完成当年度年审合格的会员单位均可随时申报。请在“会员单位与服务”栏目下载《国际合作对接意向表》，随附技术说明书发至服务部，我们将在3个工作日内与您联系对接。（办理时限：收件后3个工作日内初审答复）',
    replyDate: '2026-09-19',
  },
  {
    user: '华东某大学科技园发展有限公司 王先生',
    date: '2026-09-12',
    question: '新发布的团体标准 T/CAUI 016-2025 如何申请纸质正式文本及贯标指导服务？',
    reply: '您好！该标准文本已在协会官网标准公开频道全面上线。若需申领带防伪标识的正式印刷版及贯标专家辅导，请致电标准化工作组（010-6891XXXX 转 802）。（办理时限：即时办结）',
    replyDate: '2026-09-13',
  },
];

export default function DisclosurePage() {
  const [activeAnchor, setActiveAnchor] = useState('basic');
  const [viewingReport, setViewingReport] = useState<any>(null);

  // 在线互动表单
  const [formType, setFormType] = useState('咨询留言');
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContact.trim() || !formContent.trim()) {
      setSubmitFeedback('请完整填写您的姓名/单位、联系方式及具体留言内容');
      return;
    }

    setSubmittingInquiry(true);
    setSubmitFeedback(null);

    try {
      await addDoc(collection(db, 'inquiries'), {
        type: formType,
        name: formName.trim(),
        contact: formContact.trim(),
        content: formContent.trim(),
        status: '待审核办理',
        createdAt: serverTimestamp(),
      });
      setSubmitFeedback('留言提交成功！秘书处将在承诺时限内（3个工作日内）核实并答复。');
      setFormName('');
      setFormContact('');
      setFormContent('');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setSubmitFeedback('提交失败：' + (err.message || '请稍后重试或通过邮箱直接联系秘书处'));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">信息公开</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              信息公开与行业监督平台
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              严格执行民政部、教育部及中国高校校办产业协会自律规范，规范办会、阳光运作、全面受社会监督。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 粘性子导航 ─── */}
      <div className="sticky top-[108px] lg:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
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
            1. 基本信息
        ════════════════════════════════ */}
        <section id="basic" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">基本信息</h2>
            </div>
            <span className="text-xs text-slate-500">法定登记设立依据与核心办会属性信息公示</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicInfo.map((info, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 ${
                  idx === 2 || idx === 3 ? 'md:col-span-2' : ''
                }`}
              >
                <div className="text-xs font-semibold text-blue-900 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                  <span>{info.label}</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-sans pl-3 border-l-2 border-slate-200">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            2. 负责人与机构信息
        ════════════════════════════════ */}
        <section id="leaders" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">负责人与机构信息</h2>
            </div>
            <span className="text-xs text-slate-500">国专委主要负责人名单、履职分工及职务变动记录</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {leadersData.map((leader, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    {leader.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">在任</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{leader.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{leader.title} · {leader.org}</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{leader.desc}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="font-semibold text-slate-700">任免与变动记录：</span>
                  {leader.changeRecord}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            3. 组织机构
        ════════════════════════════════ */}
        <section id="org" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">组织机构架构</h2>
            </div>
            <span className="text-xs text-slate-500">国专委管理运转体系与内设执行部门一览</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900">全国会员网络</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  涵盖全国高水平大学、骨干校办企业、国家大学科技园与技术转移中心，构成国专委广泛的协同工作网络与服务对象基石。
                </p>
              </div>
              <Link
                href="/members"
                className="inline-flex items-center text-xs font-semibold text-blue-800 hover:underline"
              >
                <span>查阅公开会员名录</span>
                <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900">常设秘书处</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  秘书处为理事会常设执行机构，设综合行政部、国际合作部、成果转化部、会员发展部与标准化工作组，负责日常运营、对外联络与财务监督。
                </p>
              </div>
              <div className="text-xs text-slate-500 p-2.5 rounded bg-white border border-slate-200">
                办公地点：北京中关村南大街科技大厦
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900">专门工作委员会与办事机构</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  设立欧美离岸合作专家委员会、东盟一带一路产教走廊联络处、国际知识产权赋权指导中心等分支专业工作单元，按需为会员提供针对性服务。
                </p>
              </div>
              <div className="text-xs text-slate-500 p-2.5 rounded bg-white border border-slate-200">
                机构职能细则经协会常务理事会批准实施
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            4. 年度工作报告
        ════════════════════════════════ */}
        <section id="reports" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">年度工作报告</h2>
            </div>
            <span className="text-xs text-slate-500">逐年公布工作开展成效、活动明细及下一年度规划</span>
          </div>

          <div className="space-y-4">
            {annualReports.map((r, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      {r.year}
                    </span>
                    <span className="text-xs text-slate-400">公示日期：{r.publishDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setViewingReport(r)}
                      className="px-3 py-1 rounded border border-blue-300 text-blue-800 text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      查看报告全文 →
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{r.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-700 block">开展情况与主要成效：</span>
                    <p className="text-slate-600 leading-relaxed">{r.summary}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/60 space-y-1">
                    <span className="font-semibold text-blue-900 block">下一年度主要工作计划：</span>
                    <p className="text-blue-800 leading-relaxed">{r.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            5. 信用承诺
        ════════════════════════════════ */}
        <section id="credit" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">诚信履职与服务收费公开承诺</h2>
            </div>
            <span className="text-xs text-slate-500">自觉恪守非营利组织行业自律，全面公示收费与服务边界</span>
          </div>

          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-4">
            <h3 className="text-sm font-bold text-blue-950">
              中国高校校办产业协会国际产学研合作工作委员会信用承诺书
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <span className="text-blue-800">■</span>
                  <span>服务内容与服务对象承诺</span>
                </span>
                <p>
                  坚决依照协会章程与批准业务范围开展工作，所有国际技术撮合、培训交流与成果展示均以赋能会员单位和促进高校科技自立自强为核心宗旨；不从事与国专委宗旨无关的营利性商业行为。
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <span className="text-blue-800">■</span>
                  <span>会费及服务性收费严格规范</span>
                </span>
                <p>
                  国专委不自行设立独立的会费收费标准或银行基本账户，所有会费缴纳均严格通过中国高校校办产业协会统一账户收取并开具民政部监制全国社会团体会费统一票据；严禁违规摊派与乱收费。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            6. 活动与项目情况
        ════════════════════════════════ */}
        <section id="activities" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">重点活动与项目情况公开</h2>
            </div>
            <Link href="/international#projects" className="text-xs font-semibold text-blue-800 hover:underline">
              查看全部国际合作项目 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activitiesProjects.map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.time}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <div className="text-xs text-slate-500">📍 实施地点：{item.location}</div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">成效：</span>{item.result}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            7. 互动交流（带实时 Firestore 留言提交）
        ════════════════════════════════ */}
        <section id="interaction" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">互动交流与建言监督</h2>
            </div>
            <span className="text-xs text-slate-500">明示具体办理时限，切实保障公众知情权与参与监督权</span>
          </div>

          {/* 子模块一：意见征集 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-800" />
                <h3 className="text-sm font-bold text-slate-900">意见征集专栏（公开听取行业建言）</h3>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 self-start sm:self-auto">
                规定要求：征集结束后15个工作日内向社会公布采用情况
              </span>
            </div>

            <div className="space-y-3">
              {solicitations.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.status === '进行中' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-400">截止日期：{item.deadline}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">反馈途径与方式：</span>{item.method}</p>
                  <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed font-medium">
                    📌 {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 子模块二：咨询留言公开选登 */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">咨询留言公开选登（办理时限公开）</h3>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                公示办理时限：常见咨询不超过3个工作日答复反馈
              </span>
            </div>

            <div className="space-y-4">
              {messageInquiries.map((inq, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-700">留言人：{inq.user}</span>
                    <span className="font-mono">提交时间：{inq.date}</span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed">
                    <span className="font-bold text-blue-900">问：</span>{inq.question}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="flex items-center justify-between font-semibold text-emerald-800">
                      <span>国专委秘书处答复：</span>
                      <span className="text-[11px] text-slate-400 font-mono">答复时间：{inq.replyDate}</span>
                    </div>
                    <p className="text-slate-600">{inq.reply}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 子模块三：在线提交留言与纠错通道（实时写入 Firestore） */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-800" />
              <h3 className="text-sm font-bold text-slate-900">在线提交咨询留言 / 征集建言 / 网站纠错</h3>
            </div>

            <form onSubmit={handleInquirySubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
              {submitFeedback && (
                <div className={`p-3 rounded-lg border text-xs font-medium ${
                  submitFeedback.includes('成功')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {submitFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">反馈事项类别 *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  >
                    <option value="咨询留言">咨询留言（承诺3工作日内答复）</option>
                    <option value="意见建言">行业意见征集建言</option>
                    <option value="网站纠错">网站内容勘误与纠错（承诺1日核实）</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">姓名 / 单位全称 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="如：某高校科技处 张老师"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">联系电话 / 电子邮箱 *</label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="如：010-XXXX / user@domain.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">具体事项说明 *</label>
                <textarea
                  rows={3}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="请详细描述您的咨询事项、征集意见或纠错问题线索（附页面链接及具体出处）..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-400">
                  提交的信息将同步存入国专委秘书处诉求池，全程受协会监督委员会督办。
                </span>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingInquiry ? '正在提交...' : '确认在线提交'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* ─── 年度报告全文模态框 ─── */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900">
                    {viewingReport.year}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {viewingReport.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">公示日期：{viewingReport.publishDate}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans">
                {viewingReport.fullContent || viewingReport.summary}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
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
