'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── 子导航 ───
const subNavItems = [
  { id: 'tech-results', label: '科技成果与技术需求' },
  { id: 'standards', label: '团体标准 T/CAUI' },
  { id: 'reports', label: '研究报告' },
  { id: 'cases', label: '典型案例' },
  { id: 'experts', label: '专家库' },
  { id: 'training', label: '培训与人才' },
];

interface AchievementItem {
  id: string;
  title: string;
  category: string;
  unit: string;
  field: string;
  maturity?: string;
  status: string;
  date?: string;
  summary?: string;
  contact?: string;
  createdAt?: any;
}

// ─── 预置科技成果基底数据 ───
const initialTechResults = [
  { id: 'tr-1', title: '高精度轮廓视觉检测系统 V3.0', unit: '清华大学精密仪器系', field: '智能制造', maturity: 'TRL 7（样机验证）', status: '寻求转让', category: '科技成果', summary: '面向高端装备制造产线的高精度三维几何量检测平台，具备微米级在线实时测量能力。', contact: '010-6278XXXX' },
  { id: 'tr-2', title: '固态锂钠双离子电池正极材料', unit: '浙江大学化学工程系', field: '新能源材料', maturity: 'TRL 6（中试完成）', status: '寻求许可', category: '科技成果', summary: '突破高比能与宽温域电化学稳定性瓶颈，已完成长三角中试试验线批量制备验证。', contact: '0571-8795XXXX' },
  { id: 'tr-3', title: '抗肿瘤靶向多肽先导化合物 ZD-2026', unit: '复旦大学药学院', field: '生物医药', maturity: 'TRL 5（小试完成）', status: '寻求合作开发', category: '科技成果', summary: '针对实体瘤免疫逃逸通路的创新多肽药物分子，动物体内活性与耐受性表现优异。', contact: '021-5163XXXX' },
  { id: 'tr-4', title: '城市隧道施工地层扰动实时感知平台', unit: '同济大学土木工程学院', field: '智慧基建', maturity: 'TRL 8（产品就绪）', status: '已许可', category: '科技成果', summary: '结合光纤传感与AI地层形变预测模型，已在长三角多个重点轨道交通盾构区间成熟落地。', contact: '021-6598XXXX' },
];

// ─── 预置技术需求基底数据 ───
const initialTechDemands = [
  { id: 'td-1', title: '寻求中国高校耐盐碱作物品种与滴灌控制技术', unit: '哈萨克斯坦纳扎尔巴耶夫大学', field: '现代农业', maturity: '产学研合作', status: '需求发布中', category: '技术需求', summary: '面向中亚干旱盐碱地生态修复，急需引进抗旱节水高产作物品种培育与自动化水肥一体化装备。', contact: 'int-agri@nu.edu.kz' },
  { id: 'td-2', title: '引进高校智能工业视觉缺陷检测算法（欧洲工业落地）', unit: '德国弗劳恩霍夫研究院合作伙伴', field: '智能制造', maturity: '商业许可', status: '需求发布中', category: '技术需求', summary: '寻求与中国高校合作研发适用于汽车冲压件在线微裂纹高速检测模型，可提供欧洲产线落地测试环境。', contact: 'collab@fraunhofer-partner.de' },
  { id: 'td-3', title: '寻求高校量子通信基础实验平台技术许可与人才培训', unit: '新加坡国立大学量子科技研究中心', field: '量子信息', maturity: '科研与实训', status: '需求发布中', category: '技术需求', summary: '建设东南亚区域量子密钥分发实训走廊，寻求成熟实验装备技术许可及双向访问学者互换机制。', contact: 'quantum@nus.edu.sg' },
];

// ─── 团体标准数据 ───
const initialStandardsData = [
  { id: 'std-1', code: 'T/CAUI 016-2025', title: '智慧型高等院校科技孵化中心建设指南', type: '批准发布', date: '2025-09-19', desc: '规定智慧型高等院校科技孵化中心的建设目标、功能要求、配套设施及运营服务标准。' },
  { id: 'std-2', code: 'T/CAUI 028-2025', title: '校企合作产学研用示范中心建设指南', type: '批准发布', date: '2025-09-19', desc: '明确校企合作产学研用示范中心在组织架构、合作机制、成果共享及考核评价方面的规范要求。' },
  { id: 'std-3', code: 'T/CAUI 032-2025', title: '概念验证中心规范化导则 第2部分：服务规范化等级评定', type: '批准发布', date: '2025-09-19', desc: '针对概念验证中心服务能力，建立分级评定指标体系，推动概念验证服务标准化与规范化。' },
];

// ─── 研究报告数据 ───
const initialReportsData = [
  {
    id: 'rep-1',
    title: '2026年中国高校科技成果海外转化白皮书',
    date: '2026-07',
    tags: ['成果转化', '国际合作'],
    summary: '系统梳理国内500余所高校科技成果海外许可、专利布局与衍生企业出海的最新趋势，提出六大政策优化建议。',
  },
  {
    id: 'rep-2',
    title: '德国产学研合作环境与高校技术转移机制研究报告',
    date: '2026-05',
    tags: ['国别研究', '德国'],
    summary: '深入分析弗劳恩霍夫模式与德国高校“双元制”技术转移通道，为中德合作提供制度对标参考。',
  },
  {
    id: 'rep-3',
    title: '东南亚高校科技合作政策环境与机遇评估报告',
    date: '2026-03',
    tags: ['国别研究', '东南亚'],
    summary: '覆盖新加坡、马来西亚、泰国、越南四国高校科技政策、知识产权制度与产学研合作激励机制比较研究。',
  },
  {
    id: 'rep-4',
    title: '高校职务科技成果赋权改革实施效果评估报告（2025）',
    date: '2025-12',
    tags: ['政策研究', '成果转化'],
    summary: '跟踪评估40余所试点高校赋权改革落地效果，揭示现行障碍并提出完善建议，配套案例库12个。',
  },
];

// ─── 典型案例数据 ───
const initialCasesData = [
  {
    id: 'case-1',
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    title: '中德机器人感知算法离岸联合验证：从实验室到慕尼黑产线',
    unit: '清华大学 × 慕尼黑工业大学',
    bg: '双方在高精度视觉感知领域已有3年学术合作基础，决定推进技术商业化。',
    path: '签署联合研发协议 → 清华技术入股合资公司 → 在TUM离岸实验室完成产线适配 → 向宝马等整车厂商业授权',
    result: '联合专利5项（PCT申请3项），商业许可首年收益逾800万元，带动校企联合实体落地慕尼黑。',
  },
  {
    id: 'case-2',
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    title: '浙大固态电池中试成果在新加坡完成东盟首商业化部署',
    unit: '浙江大学 × 南洋理工大学 NTU ERI@N',
    bg: '浙大固态电解质中试工艺完成验证，与南洋理工合作寻求东南亚产业落地。',
    path: '中新双方合作协议 → 在纬壹科技城设立联合实验室 → 与马来西亚工业园签约建设示范产线 → 向ASEAN市场推广',
    result: '成功引进东盟本地投资3000万新元，带动中方持股衍生企业市值突破1.2亿人民币。',
  },
];

// ─── 专家库数据 ───
const expertsData = [
  { name: '张明远', title: '教授 / 技术经纪人', unit: '清华大学技术转移研究院', field: '技术转移', country: '中国', langs: '中 / 英 / 德' },
  { name: 'Prof. Hans Müller', title: 'Professor', unit: '慕尼黑工业大学', field: '智能制造', country: '德国', langs: '英 / 德' },
  { name: '李晓慧', title: '副研究员', unit: '复旦大学知识产权研究中心', field: '涉外知识产权', country: '中国', langs: '中 / 英' },
  { name: 'Dr. Priya Rajan', title: 'Senior Fellow', unit: '新加坡南洋理工大学 NTUitive', field: '生物医药转化', country: '新加坡', langs: '英' },
  { name: '王海涛', title: '研究员', unit: '同济大学国家技术转移中心', field: '城市基建技术', country: '中国', langs: '中 / 英' },
  { name: 'Dr. Olivia Chen', title: 'Associate Director', unit: '牛津大学创新转化机构 (OUI)', field: '生命科学商业化', country: '英国', langs: '英 / 中' },
  { name: '陈国强', title: '正高级工程师', unit: '浙江大学工业技术转化研究院', field: '新能源材料', country: '中国', langs: '中 / 英' },
  { name: 'Dr. Andrey Volkov', title: 'Research Director', unit: '纳扎尔巴耶夫大学', field: '农业科技合作', country: '哈萨克斯坦', langs: '俄 / 英' },
];

// ─── 培训数据 ───
const trainingData = [
  { type: '课程预告', tag: '涉外业务', date: '2026-10-15', title: '高校涉外技术出口合规管控实务培训班（第五期）', location: '北京·线下+直播', desc: '聚焦技术出口管制清单识别、许可证申请流程与违规风险规避，邀请商务部专家主讲。' },
  { type: '课程预告', tag: '国际合作实务', date: '2026-11-06', title: '中欧高校产学研合作协议谈判技巧与案例分析工作坊', location: '上海·线下', desc: '采用真实合同文本拆解与角色扮演谈判演练，提升参训者跨文化商务谈判能力。' },
  { type: '精彩回顾', tag: '涉外业务', date: '2026-08-25', title: '第四期高校涉外知识产权合规管理与PCT布局研讨培训班（已结束）', location: '深圳·已完成', desc: '共98人参训，满意度评分4.8/5.0。课程录像与学员手册已上传会员内部平台，凭账号登录下载。' },
];

export default function AchievementsPage() {
  const [activeAnchor, setActiveAnchor] = useState('tech-results');
  const [techTab, setTechTab] = useState<'results' | 'demands'>('results');
  const [expertField, setExpertField] = useState('全部');
  const [expertCountry, setExpertCountry] = useState('全部');

  // Firestore 动态成果列表
  const [firestoreItems, setFirestoreItems] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 详情模态框
  const [viewingItem, setViewingItem] = useState<AchievementItem | null>(null);

  // 实时订阅 achievements 集合
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AchievementItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<AchievementItem, 'id'>),
          }));
          setFirestoreItems(list);
          setLoading(false);
        },
        (err) => {
          console.warn('Achievements fallback listener:', err);
          unsubscribe = onSnapshot(collection(db, 'achievements'), (snapshot) => {
            const list: AchievementItem[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<AchievementItem, 'id'>),
            }));
            setFirestoreItems(list);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      console.error('Failed to setup achievements listener:', e);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // 组合动态与基底数据
  const dynamicResults = firestoreItems.filter((i) => i.category === '科技成果');
  const displayResults = dynamicResults.length > 0 ? dynamicResults : (initialTechResults as AchievementItem[]);

  const dynamicDemands = firestoreItems.filter((i) => i.category === '技术需求');
  const displayDemands = dynamicDemands.length > 0 ? dynamicDemands : (initialTechDemands as AchievementItem[]);

  const dynamicStandards = firestoreItems.filter((i) => i.category === '团体标准');
  const dynamicReports = firestoreItems.filter((i) => i.category === '智库报告');
  const dynamicCases = firestoreItems.filter((i) => i.category === '典型案例');

  const expertFields = ['全部', '技术转移', '智能制造', '涉外知识产权', '生物医药转化', '城市基建技术', '生命科学商业化', '新能源材料', '农业科技合作'];
  const expertCountries = ['全部', '中国', '德国', '新加坡', '英国', '哈萨克斯坦'];

  const filteredExperts = expertsData.filter((e) => {
    if (expertField !== '全部' && e.field !== expertField) return false;
    if (expertCountry !== '全部' && e.country !== expertCountry) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* ─── Banner ─── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">成果与智库</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              科技成果与智库平台
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              汇聚高校创新成果、标准研制、专家资源与产学研典型实践，服务国际产业转化全链条。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 子导航 ─── */}
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
            1. 科技成果与技术需求
        ════════════════════════════════ */}
        <section id="tech-results" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">科技成果与技术需求</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>实时对接数据库，共展示 {displayResults.length + displayDemands.length} 项成果与需求</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {[{ id: 'results', label: `科技成果（供方 · ${displayResults.length}）` }, { id: 'demands', label: `技术需求（需方 · ${displayDemands.length}）` }].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTechTab(t.id as 'results' | 'demands')}
                className={`px-5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  techTab === t.id
                    ? 'border-blue-800 text-blue-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 成果列表 */}
          {techTab === 'results' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-3 font-semibold min-w-[220px]">成果名称</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[140px]">研发单位</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">技术领域</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">成熟度</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">转化意向</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayResults.map((r, i) => (
                    <tr
                      key={r.id || i}
                      className={`align-middle ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50/50 transition-colors`}
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-900 leading-snug">
                        {r.title}
                        {r.summary && <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">{r.summary}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{r.unit}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium whitespace-nowrap">
                          {r.field}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{r.maturity || 'TRL 阶段论证'}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium whitespace-nowrap">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingItem(r)}
                          className="px-3 py-1 rounded bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold transition-colors cursor-pointer text-xs"
                        >
                          查看详情 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 需求列表 */}
          {techTab === 'demands' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayDemands.map((d, i) => (
                <div
                  key={d.id || i}
                  onClick={() => setViewingItem(d)}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                        海外需求
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                        {d.field}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                        {d.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {d.title}
                    </h3>
                    <p className="text-xs text-slate-500">发布主体：{d.unit}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {d.summary || '暂无更多需求详细说明。'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">对接咨询</span>
                    <span className="text-amber-800 font-semibold">响应对接 →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════════════════════════════
            2. 团体标准 T/CAUI
        ════════════════════════════════ */}
        <section id="standards" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">团体标准 T/CAUI</h2>
            </div>
            <span className="text-xs text-slate-500">由国专委联合研制，经中国高校校办产业协会正式发布</span>
          </div>

          <div className="space-y-3">
            {/* 动态标准（如管理员在后台录入） */}
            {dynamicStandards.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-xl border border-blue-200 bg-blue-50/20 hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-900">{s.maturity || 'T/CAUI 最新'}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">{s.status || '批准发布'}</span>
                    <span className="text-xs text-slate-400">{s.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">《{s.title}》</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingItem(s)}
                  className="shrink-0 px-4 py-1.5 rounded-lg border border-blue-300 text-blue-800 text-xs font-semibold hover:bg-blue-50 transition-colors self-start cursor-pointer"
                >
                  标准详情 →
                </button>
              </div>
            ))}

            {/* 基底预置标准 */}
            {initialStandardsData.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-900">{s.code}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">{s.type}</span>
                    <span className="text-xs text-slate-400">{s.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">《{s.title}》</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
                <a
                  href="https://www.caui.org.cn/article/55_0_0_0.html?shId=624"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-4 py-1.5 rounded-lg border border-blue-300 text-blue-800 text-xs font-semibold hover:bg-blue-50 transition-colors self-start"
                >
                  全文入口 →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            3. 研究报告
        ════════════════════════════════ */}
        <section id="reports" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">研究报告</h2>
            </div>
            <span className="text-xs text-slate-500">国别产学研环境研究、成果转化专题分析与政策解读</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 动态智库报告 */}
            {dynamicReports.map((r) => (
              <div
                key={r.id}
                onClick={() => setViewingItem(r)}
                className="flex flex-col p-5 rounded-xl border border-blue-200 bg-white hover:border-blue-400 hover:shadow-md transition-all group space-y-3 cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{r.field}</span>
                  <span className="text-xs text-slate-400 ml-auto">{r.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug flex-1">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{r.summary}</p>
                <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-blue-800 group-hover:underline">
                  查看报告摘要与领取方式 →
                </div>
              </div>
            ))}

            {/* 预置智库报告 */}
            {initialReportsData.map((r) => (
              <div
                key={r.id}
                onClick={() => setViewingItem({ id: r.id, title: r.title, category: '智库报告', unit: '国专委秘书处研究部', field: r.tags[0], status: '已发布', date: r.date, summary: r.summary, contact: 'secretariat@guozhuanwei.org.cn' })}
                className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group space-y-3 cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {r.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{tag}</span>
                  ))}
                  <span className="text-xs text-slate-400 ml-auto">{r.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug flex-1">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{r.summary}</p>
                <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-blue-800 group-hover:underline">
                  查看报告详情 →
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            4. 典型案例
        ════════════════════════════════ */}
        <section id="cases" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">典型案例</h2>
            </div>
            <span className="text-xs text-slate-500">完整记录国际合作与成果转化路径、成效</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 动态案例 */}
            {dynamicCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setViewingItem(c)}
                className="p-5 rounded-xl border border-blue-200 bg-white hover:border-blue-400 hover:shadow-md transition-all space-y-4 cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">{c.field}</span>
                  <span className="text-xs text-slate-400">{c.unit}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h3>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  {c.summary}
                </div>
                <div className="text-xs font-semibold text-blue-800 hover:underline">查看全流程复盘 →</div>
              </div>
            ))}

            {/* 预置典型案例 */}
            {initialCasesData.map((c) => (
              <div key={c.id} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-4 group">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${c.tagColor}`}>{c.tag}</span>
                  <span className="text-xs text-slate-400">{c.unit}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug">
                  {c.title}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-700 block">案例背景</span>
                    <p className="text-slate-600 leading-relaxed">{c.bg}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200/60 space-y-1">
                    <span className="font-semibold text-blue-800 block">转化路径</span>
                    <p className="text-blue-700 leading-relaxed">{c.path}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/60 space-y-1">
                    <span className="font-semibold text-emerald-800 block">取得成效</span>
                    <p className="text-emerald-700 leading-relaxed">{c.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            5. 专家库
        ════════════════════════════════ */}
        <section id="experts" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">专家库</h2>
            </div>
            <span className="text-xs text-slate-500">
              显示 {filteredExperts.length} / {expertsData.length} 位在库专家
            </span>
          </div>

          {/* 双维筛选器 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">专业领域：</span>
              {expertFields.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setExpertField(f)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    expertField === f
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 w-16 shrink-0">国别：</span>
              {expertCountries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setExpertCountry(c)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    expertCountry === c
                      ? 'bg-blue-800 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 专家卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredExperts.map((e, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-3 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-800 to-slate-700 text-white flex items-center justify-center text-base font-bold mx-auto shadow">
                  {e.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{e.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{e.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{e.unit}</div>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{e.field}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{e.country}</span>
                </div>
                <div className="text-[10px] text-slate-400">工作语言：{e.langs}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════
            6. 培训与人才
        ════════════════════════════════ */}
        <section id="training" className="scroll-mt-56 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-blue-800 rounded-full" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">培训与人才</h2>
            </div>
            <span className="text-xs text-slate-500">涉外业务能力培训与国际合作实务课程</span>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>课程预告</span>
            </div>
            {trainingData.filter((t) => t.type === '课程预告').map((t, i) => (
              <div key={i} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:shadow-md transition-all space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">课程预告</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">{t.tag}</span>
                  <span className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">📅 {t.date} · 📍 {t.location}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>精彩回顾</span>
            </div>
            {trainingData.filter((t) => t.type === '精彩回顾').map((t, i) => (
              <div key={i} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-md transition-all space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">精彩回顾</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">{t.tag}</span>
                  <span className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">📅 {t.date} · 📍 {t.location}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── 成果 / 智库详细信息模态框 ─── */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {viewingItem.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {viewingItem.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {viewingItem.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400">所属单位：</span>
                  <span className="font-semibold text-slate-800 ml-1">{viewingItem.unit}</span>
                </div>
                <div>
                  <span className="text-slate-400">技术领域：</span>
                  <span className="font-semibold text-blue-800 ml-1">{viewingItem.field}</span>
                </div>
                <div>
                  <span className="text-slate-400">成熟度/阶段：</span>
                  <span className="text-slate-700 ml-1">{viewingItem.maturity || '未标注'}</span>
                </div>
                <div>
                  <span className="text-slate-400">发布日期：</span>
                  <span className="font-mono text-slate-600 ml-1">{viewingItem.date || '长期有效'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">对接联络：</span>
                  <span className="font-mono text-slate-700 ml-1">{viewingItem.contact || '国专委秘书处协调对接'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">详细描述与合作说明</h4>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {viewingItem.summary || '该成果/报告暂未登记详细全文描述。如需接洽，请联系国专委秘书处。'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
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
