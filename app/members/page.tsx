'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const subNavItems = [
  { id: 'directory', label: '会员单位名录' },
  { id: 'stories', label: '会员单位风采' },
  { id: 'guide', label: '入会指引' },
  { id: 'services', label: '服务事项与办事指南' },
];

interface MemberItem {
  id: string;
  name: string;
  type: string;
  region: string;
  level: string;
  annualCheck?: string;
  contact?: string;
  desc?: string;
  createdAt?: any;
}

// ── 会员单位风采案例 ──
const storiesData = [
  {
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '浙江大学工业技术转化研究院',
    title: '中新绿色储能联合研发：赋能东盟能源转型',
    summary: '联合新加坡南洋理工大学，在固态电池材料领域搭建双向技术转移通道，2026年完成首批样品在东南亚的产业落地，带动相关产业投资逾2亿元。',
    date: '2026-08',
  },
  {
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    unit: '同济大学国家技术转移中心',
    title: '城市地下空间智能感知系统规模化产业化纪实',
    summary: '历时3年推动自主研发的“地铁盾构地层扰动感知系统”走出实验室，与长三角多个市政项目签约，累计商业合同金额突破4500万元，技术出口德国。',
    date: '2026-06',
  },
  {
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '复旦大学国家大学科技园',
    title: '中英靶向药物孵化走廊：首例PCT跨国授权落地记',
    summary: '与牛津大学创新转化机构（OUI）联合建立“中英生命科学快速通道”，协助在孵企业完成全球首例高校衍生企业向英国本土药企的PCT跨国专利授权。',
    date: '2026-05',
  },
  {
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    unit: '北京清华科技开发有限公司',
    title: 'AI辅助药物分子设计平台成功孵化独角兽企业',
    summary: '依托清华大学药学院AI+分子设计研究成果，2年内完成从中试到商业化产品的转型，公司估值已突破15亿元，获得国内外顶级医疗基金联合投资。',
    date: '2026-04',
  },
  {
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    unit: '中山大学国家大学科技园',
    title: '粤港澳联合孵化：跨境数据合规平台全球首发',
    summary: '整合中山大学与香港科技大学算法资源，开发面向大湾区数字经济企业的跨境数据合规管理平台，已完成港、澳、广三地商业注册，服务企业逾300家。',
    date: '2026-03',
  },
  {
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '西安交通大学技术转移中心',
    title: '共建“一带一路”：中哈能源装备技术援助与商业化',
    summary: '联合哈萨克斯坦国立技术大学，向哈方系统性输出西交大自主研发的高效抽油泵控制系统，商业合作协议已落地，同步培育当地技术经纪人团队15名。',
    date: '2026-02',
  },
];

// ── 服务事项数据 ──
const serviceItems = [
  {
    service: '国际合作项目推荐与匹配',
    method: '线上提交需求 + 秘书处定向匹配',
    contact: '国际合作部 · 郑老师',
    materials: '单位营业执照（或法人证书）、合作需求说明书、联系人信息表',
  },
  {
    service: '技术成果转让与许可登记备案',
    method: '线上申报系统 + 线下纸质归档',
    contact: '成果转化部 · 刘老师',
    materials: '技术合同副本、专利证书复印件、转让方资质证明',
  },
  {
    service: 'PCT国际专利申报辅导',
    method: '预约一对一专家咨询（线上/线下均可）',
    contact: '知识产权服务部 · 陈老师',
    materials: '现有国内专利证书、技术说明书、目标申请国列表',
  },
  {
    service: '会员资质年度审查与积分认定',
    method: '线上提交年度报告，秘书处审核',
    contact: '会员管理部 · 周老师',
    materials: '年度工作总结报告、成果转化汇总清单、财务审计摘要',
  },
  {
    service: '涉外合规与法律风险预评估',
    method: '书面申请 + 专家委员会评估（15个工作日）',
    contact: '法律与合规部 · 王老师',
    materials: '拟开展合作的合同草稿、境外合作方资质材料、合规自查报告',
  },
  {
    service: '国际论坛与展会参展推荐',
    method: '秘书处统一报名，提交参展意向表',
    contact: '活动联络部 · 张老师',
    materials: '参展单位介绍、展示成果清单（不超过5项）、主要联系人信息',
  },
  {
    service: '会员单位培训与研习营报名',
    method: '官网报名系统 + 确认函回传',
    contact: '教育培训部 · 赵老师',
    materials: '参训人员名单、单位介绍函、学历/职称证明（按培训要求）',
  },
];

// ── 类别分组规则 ──
const GROUP_CONFIGS = [
  {
    key: '高等院校',
    title: '高校 / 高等院校',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    match: (type: string) => type === '高等院校' || type === '高校',
  },
  {
    key: '校办企业',
    title: '校办企业',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    match: (type: string) => type === '校办企业',
  },
  {
    key: '技术转移机构',
    title: '技术转移机构',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    match: (type: string) => type === '技术转移机构',
  },
  {
    key: '大学科技园',
    title: '大学科技园',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    match: (type: string) => type === '大学科技园',
  },
  {
    key: '其他',
    title: '其他会员单位',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    match: (type: string) => !['高等院校', '高校', '校办企业', '技术转移机构', '大学科技园'].includes(type),
  },
];

const DEFAULT_REGIONS = ['全部', '北京', '上海', '浙江', '广东', '湖北', '陕西', '天津', '江苏', '山东', '四川'];

export default function MembersPage() {
  const [activeAnchor, setActiveAnchor] = useState<string>('directory');
  const [regionFilter, setRegionFilter] = useState<string>('全部');
  const [membersList, setMembersList] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMember, setViewingMember] = useState<MemberItem | null>(null);

  // 实时订阅 Firestore 中的 members 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MemberItem, 'id'>),
          }));
          setMembersList(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Members query fallback to basic snapshot:', err);
          unsubscribe = onSnapshot(collection(db, 'members'), (snapshot) => {
            const list: MemberItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<MemberItem, 'id'>),
            }));
            setMembersList(list);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      console.error('Failed to setup members listener:', e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 动态汇集所有地区选项
  const allRegions = Array.from(
    new Set([...DEFAULT_REGIONS, ...membersList.map((m) => m.region).filter(Boolean)])
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── 顶部 Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">会员单位与服务</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              会员单位与服务大厅
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              汇聚全国高校、校办企业、技术转移机构与大学科技园，共同构建产学研国际合作生态。
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
        {/* ═══════════════════════════════════
            1. 会员单位名录（实时连接 Firestore）
        ═══════════════════════════════════ */}
        <section id="directory" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位名录</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                实时收录 {membersList.length} 家会员单位，按分类动态展示
              </span>
            </div>
          </div>

          {/* 按地区筛选器 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">按地区：</span>
              {allRegions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionFilter(r)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    regionFilter === r
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 数据加载中状态 */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>正在同步最新会员名录...</div>
            </div>
          ) : membersList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
              <p className="font-semibold text-slate-700">会员库当前暂未收录公开会员信息</p>
              <p className="text-slate-400">管理员可在后台【会员单位管理】实时录入并同步更新。</p>
            </div>
          ) : (
            /* 分组列表 */
            <div className="space-y-8">
              {GROUP_CONFIGS.map((group) => {
                const groupMembers = membersList.filter((m) => group.match(m.type));
                const filtered = regionFilter === '全部'
                  ? groupMembers
                  : groupMembers.filter((m) => m.region === regionFilter);

                if (filtered.length === 0) return null;

                return (
                  <div key={group.key} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${group.color}`}>
                        {group.title}
                      </span>
                      <span className="text-xs text-slate-400">{filtered.length} 家</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setViewingMember(m)}
                          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                                {m.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 shrink-0 font-medium">
                                {m.level || '会员单位'}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 text-xs text-slate-500">
                              <span>📍 {m.region}</span>
                              {m.annualCheck && (
                                <span className="text-[11px] text-emerald-600 font-medium">
                                  ✓ {m.annualCheck}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {m.desc || '该单位暂未补充简介内容。'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">联络对接：{m.contact ? m.contact.slice(0, 7) + '***' : '请咨询秘书处'}</span>
                            <span className="text-blue-800 font-semibold group-hover:underline">
                              查看资质详情 →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* 地区筛选无结果提示 */}
              {regionFilter !== '全部' &&
                !membersList.some((m) => m.region === regionFilter) && (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                    该地区暂无收录会员单位，请调整筛选条件。
                  </div>
                )}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════
            2. 会员单位风采
        ═══════════════════════════════════ */}
        <section id="stories" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">会员单位风采</h2>
            </div>
            <span className="text-xs text-slate-500">
              精选会员在国际合作与成果转化方面的优秀实践案例
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {storiesData.map((s, idx) => (
              <div key={idx} className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${s.tagColor}`}>{s.tag}</span>
                  <span className="text-xs text-slate-400">{s.date}</span>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">{s.unit}</div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                    {s.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed flex-1">{s.summary}</p>
                <div className="pt-2 border-t border-slate-100">
                  <a href="#stories" className="text-xs font-semibold text-blue-800 hover:underline">阅读详情 →</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════
            3. 入会指引（唯一协会官网统一外链）
        ═══════════════════════════════════ */}
        <section id="guide" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">入会指引</h2>
            </div>
            <span className="text-xs text-slate-500">
              由中国高校校办产业协会统一受理，国专委协助推荐
            </span>
          </div>

          {/* CTA 按钮（唯一入口，严格外链） */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-blue-900 mb-1">协会统一入会入口</div>
              <p className="text-xs text-blue-700 leading-relaxed">
                入会申请、资格审核及费用缴纳均通过中国高校校办产业协会（CAUI）官网统一办理，国专委不直接受理入会申请。
              </p>
            </div>
            <a
              href="https://www.caui.org.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm transition-colors shadow-xs text-center whitespace-nowrap"
            >
              跳转协会统一入会入口 →
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* 入会条件 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>入会条件</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>在中华人民共和国境内依法注册的高等院校（含民办高校）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>由高等院校直接投资或控股设立的校办企业（持股比例不低于51%）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>具有技术转移服务资质的国家级或省级认定机构</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>经国家认定的大学科技园（A类、B类均可申请）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>认同协会章程，履行年度会费义务，参与协会活动</span>
                </li>
              </ul>
            </div>

            {/* 所需材料 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>申请所需材料</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>《中国高校校办产业协会入会申请表》（官网下载最新版）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>单位法人证书或营业执照复印件（加盖公章）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>组织机构代码证或统一社会信用代码证明</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>单位近两年度主要工作及成绩简介（不超过2页A4）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-800 font-bold mt-0.5">▸</span>
                  <span>主要负责人身份证明及联系方式</span>
                </li>
              </ul>
            </div>

            {/* 申请流程 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>申请办理流程</span>
              </h3>
              <ol className="space-y-3 text-xs">
                {[
                  { step: '提交申请', desc: '在协会官网在线提交申请表及材料扫描件' },
                  { step: '秘书处受理', desc: '秘书处5个工作日内完成资格初审并反馈' },
                  { step: '理事会审议', desc: '初审通过后提交理事会或常务理事会审议' },
                  { step: '审核结果通知', desc: '审核通过后向申请单位发出正式入会通知书' },
                  { step: '缴纳会费', desc: '根据通知书在规定期限内完成年度会费缴纳' },
                  { step: '颁发证书', desc: '完成缴费后颁发会员证书及相关权益告知书' },
                ].map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{s.step}：</span>
                      <span className="text-slate-600">{s.desc}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* 再次放置 CTA（页尾强调） */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              如需国专委出具推荐意见函，请联系秘书处邮箱：<span className="font-medium text-slate-700">secretariat@guozhuanwei.org.cn</span>
            </p>
            <a
              href="https://www.caui.org.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-xs"
            >
              跳转协会统一入会入口 →
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════
            4. 服务事项与办事指南
        ═══════════════════════════════════ */}
        <section id="services" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">服务事项与办事指南</h2>
            </div>
            <span className="text-xs text-slate-500">
              共 {serviceItems.length} 项对会员单位开放的专项服务
            </span>
          </div>

          {/* 服务清单表格 */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap w-8">#</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[160px]">服务内容</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[160px]">办理方式</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[130px]">联系人</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">所需材料</th>
                </tr>
              </thead>
              <tbody>
                {serviceItems.map((s, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-slate-200 align-top ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    } hover:bg-blue-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 leading-snug">{s.service}</td>
                    <td className="px-4 py-3 text-slate-600 leading-relaxed">{s.method}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{s.contact}</td>
                    <td className="px-4 py-3 text-slate-600 leading-relaxed">{s.materials}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              如需申请以上服务，请先确认贵单位已完成当年度会员资质年审。如遇紧急事项，请直接致电国专委秘书处。
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-600 shrink-0">
              <span>📞 010-XXXX-XXXX</span>
              <span className="text-slate-300">|</span>
              <span>✉️ service@guozhuanwei.org.cn</span>
            </div>
          </div>
        </section>
      </main>

      {/* ─── 会员资质详情模态框 ─── */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-6">
              {/* 弹窗头部 */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {viewingMember.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {viewingMember.level || '会员单位'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {viewingMember.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 详情属性网格 */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-slate-400">所属省市：</span>
                  <span className="font-semibold text-slate-800 ml-1">{viewingMember.region}</span>
                </div>
                <div>
                  <span className="text-slate-400">年审状态：</span>
                  <span className="font-semibold text-emerald-700 ml-1">{viewingMember.annualCheck || '正常在册'}</span>
                </div>
                <div>
                  <span className="text-slate-400">会员编码：</span>
                  <span className="font-mono text-slate-600 ml-1">{viewingMember.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400">工作联络：</span>
                  <span className="font-mono text-slate-700 ml-1">{viewingMember.contact || '秘书处登记'}</span>
                </div>
              </div>

              {/* 单位简介 */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">单位简介及产业特色</h4>
                <div className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-2xs whitespace-pre-wrap">
                  {viewingMember.desc || '该会员单位正在完善中英文详细介绍与产学研合作成果。'}
                </div>
              </div>

              {/* 提示注记 */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                声明：会员名录信息由各会员单位向中国高校校办产业协会填报登记，国专委根据授权进行公开查阅展示。
              </div>

              {/* 底部按钮 */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingMember(null)}
                  className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  关闭窗口
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
