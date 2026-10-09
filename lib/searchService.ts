import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { defaultAchievementsContentData } from '@/lib/achievementsData';
import { defaultInternationalData } from '@/lib/internationalData';
import { defaultStoriesData, defaultMemberServicesConfig, defaultMemberGuideData } from '@/lib/membersData';
import { defaultDisclosureContentData } from '@/lib/disclosureData';
import { defaultGaikuangData } from '@/lib/gaikuangData';

export interface SearchResultItem {
  id: string;
  title: string;
  category: string; // '新闻中心' | '通知公告' | '成果与智库' | '国际合作' | '会员单位与服务' | '信息公开' | '国专委概况';
  badge: string;
  summary: string;
  url: string;
  date?: string;
  keywords?: string[];
}

// 静态基底搜索数据库（覆盖全站8个频道的核心公开数据）
const BASE_SEARCH_INDEX: SearchResultItem[] = [
  // ─── 1. 新闻中心 ───
  {
    id: 'news-base-1',
    title: '2026年高校校办产业高质量创新发展大会暨第三届国际协同交流峰会在京成功召开',
    category: '新闻中心',
    badge: '头条要闻',
    summary: '汇聚全国重点高校科技产业力量，探讨高校科技成果转化新模式与跨国合作新范式，共拓数字化转型新路径。',
    date: '2026-09-20',
    url: '/news#committee-news',
    keywords: ['发展大会', '峰会', '国际协同', '科技成果转化', '校办产业', '北京'],
  },
  {
    id: 'news-base-2',
    title: '多项高校校企协同国际标准获批立项：赋能产业链数智协同与科技成果产业化',
    category: '新闻中心',
    badge: '行业热点',
    summary: '国专委牵头组织编制的多项国家及行业团体标准正式进入起草阶段，广泛征集高校及领军校企意见。',
    date: '2026-09-18',
    url: '/news#committee-news',
    keywords: ['国际标准', '团体标准', '立项', '数智协同', '产业化'],
  },
  {
    id: 'news-base-3',
    title: '常务理事会2026年第三季度工作统筹会议在京顺利圆满举行',
    category: '新闻中心',
    badge: '会议纪要',
    summary: '全面回顾高校产业出海阶段性成果，部署高校前沿智库成果转化及下阶段全球伙伴网络扩容工作。',
    date: '2026-09-15',
    url: '/news#committee-news',
    keywords: ['常务理事会', '会议纪要', '工作统筹', '出海'],
  },
  {
    id: 'news-base-4',
    title: '国专委专家智库赴多省市高校国家大学科技园开展先进制造与成果转化专项调研',
    category: '新闻中心',
    badge: '国专委动态',
    summary: '深调研、摸实情、出对策，为高校校办产业集群高质量出海与区域经济融合提供精准指引。',
    date: '2026-09-12',
    url: '/news#committee-news',
    keywords: ['大学科技园', '先进制造', '专项调研', '智库'],
  },
  {
    id: 'news-base-5',
    title: '高校产教融合国际化人才联合培养计划正式启动',
    category: '新闻中心',
    badge: '会员动态',
    summary: '支持骨干高校与海外高水平科研机构共建人才联合培养基地，设立专项产业出海基金。',
    date: '2026-09-08',
    url: '/news#member-news',
    keywords: ['人才培养', '产教融合', '联合培养', '基金'],
  },
  {
    id: 'news-base-6',
    title: '《中国教育报》专版刊载：高校科技创新与国际协同新蓝图',
    category: '新闻中心',
    badge: '媒体关注',
    summary: '权威央媒深度报道国专委搭建全球产学研合作平台、赋能中国高校科技自立自强的实践成果。',
    date: '2026-09-02',
    url: '/news#media-focus',
    keywords: ['媒体关注', '中国教育报', '央媒报道', '科技自立自强'],
  },

  // ─── 2. 通知公告 ───
  {
    id: 'notice-base-1',
    title: '关于开展2026年度“高校校办产业科技创新与国际协同”卓越成果征集评选的通知',
    category: '通知公告',
    badge: '项目申报',
    summary: '面向全国各高校会员单位及校办高新技术企业，组织遴选一批具备国际顶尖水平的产学研科技成果与标杆案例，择优给予重点海外路演推荐。',
    date: '2026-09-21',
    url: '/notice#projects',
    keywords: ['成果征集', '评优评奖', '卓越成果', '项目申报', '2026年度'],
  },
  {
    id: 'notice-base-2',
    title: '2026年第二批入会申请会员单位资质审核通过名单及公示公告',
    category: '通知公告',
    badge: '对外发文',
    summary: '经秘书处初审及会长办公会复核，现将通过资质审核的42家拟入会高校科技产业机构名单向社会正式公示。',
    date: '2026-09-19',
    url: '/notice#dispatch',
    keywords: ['入会公示', '资质审核', '名单公示', '对外发文'],
  },
  {
    id: 'notice-base-3',
    title: '关于举办第十二期全国高校科技成果转移转化与国际合规专家研讨班的报名通告',
    category: '通知公告',
    badge: '活动报名',
    summary: '课程涵盖涉外知识产权布局、跨境技术出海合规要点及高校专利作价入股法律风控实务。',
    date: '2026-09-14',
    url: '/notice#activities',
    keywords: ['研讨班', '活动报名', '技术转移', '国际合规', '知识产权'],
  },
  {
    id: 'notice-base-4',
    title: '科技部教育部等发布《关于进一步深化高校科技体制改革若干意见》',
    category: '通知公告',
    badge: '政策法规',
    summary: '明确支持高水平研究型大学校办企业深化混合所有制改革，优化职务科技成果资产单列管理。',
    date: '2026-09-10',
    url: '/notice#policies',
    keywords: ['政策法规', '科技体制改革', '职务科技成果', '资产单列', '混合所有制'],
  },
  {
    id: 'notice-base-5',
    title: '中国高校校办产业协会国际合作与交流专业委员会办事指南与备案须知',
    category: '通知公告',
    badge: '办理须知',
    summary: '详细说明会员入会申办、国际项目备案、标准起草立项及涉外信函核验的规范操作流程。',
    date: '2026-09-01',
    url: '/notice#guide',
    keywords: ['办事指南', '办理须知', '项目备案', '信函核验'],
  },

  // ─── 3. 国专委概况 ───
  {
    id: 'gaikuang-base-1',
    title: '国专委宗旨、组织性质与历史使命',
    category: '国专委概况',
    badge: '机构简介',
    summary: '中国高校校办产业协会国际合作与交流专业委员会是在民政部登记管理、教育部业务主管的国家级社团分支机构。',
    url: '/guozhuanwei-gaikuang#intro',
    keywords: ['国专委简介', '宗旨', '机构性质', '组织体系', '概况'],
  },
  {
    id: 'gaikuang-base-2',
    title: '国专委成立批复公文与法定工作规则',
    category: '国专委概况',
    badge: '批复公文',
    summary: '查阅中国高校校办产业协会《关于同意设立国际合作与交流专业委员会的决定》（中校产协发〔2025〕08号）及专业委员会工作细则。',
    url: '/guozhuanwei-gaikuang#rules',
    keywords: ['批复公文', '工作规则', '成立决定', '工作细则', '规章'],
  },
  {
    id: 'gaikuang-base-3',
    title: '国专委组织架构与常务理事、副会长单位名录',
    category: '国专委概况',
    badge: '组织架构',
    summary: '包含北京大学、清华大学、浙江大学、上海交通大学等重点高校科技产业机构及跨国产学研代表。',
    url: '/guozhuanwei-gaikuang#organization',
    keywords: ['组织架构', '领导机构', '常务理事', '名录', '专家顾问'],
  },
  {
    id: 'gaikuang-base-4',
    title: '国专委秘书处职能与联系方式',
    category: '国专委概况',
    badge: '联系我们',
    summary: '包含综合办公室、国际合作部、科技成果转化部、会员发展部等部门职责与咨询电话、办公地址。',
    url: '/guozhuanwei-gaikuang#contact',
    keywords: ['秘书处', '联系电话', '办公地址', '联系方式', '办事机构'],
  },

  // ─── 4. 会员单位与服务 ───
  {
    id: 'members-base-1',
    title: '会员单位名录大厅与名录检索',
    category: '会员单位与服务',
    badge: '名录大厅',
    summary: '汇集全国重点高校科技开发部、国家大学科技园、骨干校办企业与技术转移中心会员名录。',
    url: '/members#directory',
    keywords: ['会员名录', '会员单位', '高校', '大学科技园', '校办企业'],
  },
  {
    id: 'members-base-2',
    title: '入会指引与全流程办事通道',
    category: '会员单位与服务',
    badge: '入会指引',
    summary: '在线查阅入会申请条件、资质要求、材料清单、审批流程与权利义务。',
    url: '/members#guide',
    keywords: ['入会指引', '入会申请', '加入协会', '申请流程', '材料清单'],
  },
  {
    id: 'members-base-3',
    title: '会员专属服务事项与办事指南',
    category: '会员单位与服务',
    badge: '办事指南',
    summary: '涵盖团体标准立项辅导、跨国技术对接路演、科技成果作价入股法律咨询、评优推优等全套专属赋能服务。',
    url: '/members#services',
    keywords: ['服务事项', '办事指南', '专属赋能', '路演推荐', '辅导'],
  },
];

// 将预置各类成果与智库数据编入索引（安全守卫防越界）
if (Array.isArray(defaultAchievementsContentData?.techItems)) {
  defaultAchievementsContentData.techItems.forEach((t) => {
    BASE_SEARCH_INDEX.push({
      id: `tech-${t.id}`,
      title: t.title,
      category: '成果与智库',
      badge: t.category || '科技成果',
      summary: `【${t.unit}】领域：${t.field}，成熟度：${t.maturity}。${t.summary}`,
      date: t.date || '2026',
      url: '/achievements#tech-results',
      keywords: ['科技成果', '技术需求', t.field, t.unit, t.maturity, t.category],
    });
  });
}

if (Array.isArray(defaultAchievementsContentData?.standards)) {
  defaultAchievementsContentData.standards.forEach((s) => {
    BASE_SEARCH_INDEX.push({
      id: `std-${s.id}`,
      title: `${s.code} ${s.title}`,
      category: '成果与智库',
      badge: '团体标准',
      summary: `类型：${s.type}，发布时间：${s.date}。${s.desc}`,
      date: s.date,
      url: '/achievements#standards',
      keywords: ['团体标准', 'T/CAUI', s.code, s.type, '行业规范'],
    });
  });
}

if (Array.isArray(defaultAchievementsContentData?.reports)) {
  defaultAchievementsContentData.reports.forEach((r) => {
    BASE_SEARCH_INDEX.push({
      id: `rep-${r.id}`,
      title: r.title,
      category: '成果与智库',
      badge: '智库报告',
      summary: `【${r.unit || '国专委智库'}】${r.summary}`,
      date: r.date,
      url: '/achievements#reports',
      keywords: ['智库报告', '白皮书', '前沿研究', ...(r.tags || [])],
    });
  });
}

if (Array.isArray(defaultAchievementsContentData?.cases)) {
  defaultAchievementsContentData.cases.forEach((c) => {
    BASE_SEARCH_INDEX.push({
      id: `case-${c.id}`,
      title: c.title,
      category: '成果与智库',
      badge: '典型案例',
      summary: `【${c.unit}】协同路径：${c.path}；成效成果：${c.result}`,
      url: '/achievements#cases',
      keywords: ['典型案例', c.unit, c.tag, '产学研合作'],
    });
  });
}

if (Array.isArray(defaultAchievementsContentData?.experts)) {
  defaultAchievementsContentData.experts.forEach((e) => {
    BASE_SEARCH_INDEX.push({
      id: `expert-${e.id}`,
      title: `${e.name}（${e.title}）`,
      category: '成果与智库',
      badge: '专家库',
      summary: `单位：${e.unit}，专业领域：${e.field}，国家/地区：${e.country}。`,
      url: '/achievements#experts',
      keywords: ['专家库', e.name, e.unit, e.field, e.country],
    });
  });
}

if (Array.isArray(defaultAchievementsContentData?.trainings)) {
  defaultAchievementsContentData.trainings.forEach((tr) => {
    BASE_SEARCH_INDEX.push({
      id: `training-${tr.id}`,
      title: tr.title,
      category: '成果与智库',
      badge: '培训与人才',
      summary: `【${tr.location}】${tr.desc}`,
      date: tr.date,
      url: '/achievements#training',
      keywords: ['培训', '人才', tr.title],
    });
  });
}

// 将预置国际合作数据编入索引
if (Array.isArray(defaultInternationalData?.regions)) {
  defaultInternationalData.regions.forEach((r) => {
    BASE_SEARCH_INDEX.push({
      id: `intl-region-${r.id}`,
      title: `${r.country}及周边区域合作网络`,
      category: '国际合作',
      badge: '国别与区域',
      summary: `${r.overview} 合作基础：${r.foundation}；政策指引：${r.policyTip}`,
      url: '/international#regions',
      keywords: ['国别与区域', r.country, r.tag, '海外合作'],
    });
  });
}

if (Array.isArray(defaultInternationalData?.bri)) {
  defaultInternationalData.bri.forEach((b) => {
    BASE_SEARCH_INDEX.push({
      id: `intl-bri-${b.id}`,
      title: b.title,
      category: '国际合作',
      badge: '一带一路',
      summary: b.summary,
      date: b.dateOrStatus,
      url: '/international#bri',
      keywords: ['一带一路', '丝路协同', '跨境项目'],
    });
  });
}

if (Array.isArray(defaultInternationalData?.activities)) {
  defaultInternationalData.activities.forEach((a) => {
    BASE_SEARCH_INDEX.push({
      id: `intl-act-${a.id}`,
      title: a.title,
      category: '国际合作',
      badge: `涉外活动·${a.type}`,
      summary: `时间：${a.date}，地点：${a.location}。${a.summary}`,
      date: a.date,
      url: '/international#activities',
      keywords: ['涉外活动', a.type, a.location, '展会', '研讨会'],
    });
  });
}

if (Array.isArray(defaultInternationalData?.matchmakingNeeds)) {
  defaultInternationalData.matchmakingNeeds.forEach((m) => {
    BASE_SEARCH_INDEX.push({
      id: `intl-need-${m.id}`,
      title: m.title,
      category: '国际合作',
      badge: m.direction === 'domestic' ? '国内技术合作' : '海外合作意向',
      summary: `【${m.publisher}】领域：${m.field}。${m.desc}`,
      url: '/international#matchmaking',
      keywords: ['合作需求', '撮合对接', m.field, m.publisher],
    });
  });
}

if (Array.isArray(defaultInternationalData?.organizations)) {
  defaultInternationalData.organizations.forEach((o) => {
    BASE_SEARCH_INDEX.push({
      id: `intl-org-${o.id}`,
      title: `${o.name}（${o.sub}）`,
      category: '国际合作',
      badge: '国际组织与机构',
      summary: `所属国别：${o.country}。${o.desc}`,
      url: '/international#organizations',
      keywords: ['国际组织', '友好高校', o.country, o.name],
    });
  });
}

// 将会员风采编入索引
if (Array.isArray(defaultStoriesData)) {
  defaultStoriesData.forEach((s) => {
    BASE_SEARCH_INDEX.push({
      id: `story-${s.id}`,
      title: s.title,
      category: '会员单位与服务',
      badge: '会员风采',
      summary: `【${s.unit}】${s.summary}`,
      date: s.date,
      url: '/members#stories',
      keywords: ['会员风采', s.unit, s.tag],
    });
  });
}

// 将信息公开编入索引
if (Array.isArray(defaultDisclosureContentData?.annualReports)) {
  defaultDisclosureContentData.annualReports.forEach((ar) => {
    BASE_SEARCH_INDEX.push({
      id: `disc-rep-${ar.id}`,
      title: ar.title,
      category: '信息公开',
      badge: '年度工作报告',
      summary: `发布时间：${ar.publishDate}。${ar.summary}`,
      date: ar.publishDate,
      url: '/disclosure#reports',
      keywords: ['年度工作报告', '财务公示', '工作总结', ar.year],
    });
  });
}

if (Array.isArray(defaultDisclosureContentData?.basicInfo)) {
  defaultDisclosureContentData.basicInfo.forEach((bi) => {
    BASE_SEARCH_INDEX.push({
      id: `disc-base-${bi.id}`,
      title: `国专委基本法定信息：${bi.label}`,
      category: '信息公开',
      badge: '基本信息',
      summary: `${bi.label}：${bi.value}`,
      url: '/disclosure#basic',
      keywords: ['基本信息', bi.label, '法定信息'],
    });
  });
}

if (Array.isArray(defaultDisclosureContentData?.credit?.commitments)) {
  defaultDisclosureContentData.credit.commitments.forEach((cm, i) => {
    BASE_SEARCH_INDEX.push({
      id: `disc-credit-${i}`,
      title: cm.title,
      category: '信息公开',
      badge: '信用承诺',
      summary: cm.content,
      url: '/disclosure#credit',
      keywords: ['信用承诺', '收费规范', '阳光公开', '合规自律'],
    });
  });
}

/**
 * 实时从 Firestore 拉取最新数据并合并，实现“全栈全网动态搜索”
 */
let dynamicFirestoreIndex: SearchResultItem[] = [];
let hasFetchedLiveDocs = false;
let isFetchingLiveDocs = false;

export async function fetchLiveSearchDocs(): Promise<SearchResultItem[]> {
  if (hasFetchedLiveDocs && dynamicFirestoreIndex.length > 0) {
    return dynamicFirestoreIndex;
  }

  // 避免并发重复拉取
  if (isFetchingLiveDocs) {
    return dynamicFirestoreIndex;
  }
  isFetchingLiveDocs = true;

  const liveItems: SearchResultItem[] = [];

  // 并行拉取任务与超时熔断保护（最长等待 2.5 秒，保障前台毫秒级即时响应）
  const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 2500));

  const fetchPromise = Promise.allSettled([
    // 1. 新闻数据
    getDocs(query(collection(db, 'news'), limit(20))).then((snap) => {
      snap.forEach((doc) => {
        const d = doc.data();
        liveItems.push({
          id: `live-news-${doc.id}`,
          title: d.title || '最新动态',
          category: '新闻中心',
          badge: d.category || '要闻',
          summary: d.summary || d.content?.slice(0, 100) || '',
          date: d.date || '',
          url: '/news#committee-news',
          keywords: [d.title, d.category, '新闻动态'],
        });
      });
    }),

    // 2. 通知数据
    getDocs(query(collection(db, 'notices'), limit(20))).then((snap) => {
      snap.forEach((doc) => {
        const d = doc.data();
        liveItems.push({
          id: `live-notice-${doc.id}`,
          title: d.title || '通知公告',
          category: '通知公告',
          badge: d.category || '通知',
          summary: d.summary || d.content?.slice(0, 100) || '',
          date: d.date || '',
          url: '/notice#latest',
          keywords: [d.title, d.category, '通知公告'],
        });
      });
    }),

    // 3. 国际合作项目
    getDocs(query(collection(db, 'projects'), limit(20))).then((snap) => {
      snap.forEach((doc) => {
        const d = doc.data();
        liveItems.push({
          id: `live-project-${doc.id}`,
          title: d.name || '国际合作项目',
          category: '国际合作',
          badge: d.status || '合作项目',
          summary: `中方：${d.chineseParty || ''} × 外方：${d.foreignParty || ''}。领域：${d.field || ''}，国别：${d.country || ''}`,
          date: d.year || '',
          url: '/international#projects',
          keywords: [d.name, d.country, d.field, d.chineseParty, d.foreignParty],
        });
      });
    }),

    // 4. 会员单位
    getDocs(query(collection(db, 'members'), limit(30))).then((snap) => {
      snap.forEach((doc) => {
        const d = doc.data();
        liveItems.push({
          id: `live-member-${doc.id}`,
          title: d.name || '会员单位',
          category: '会员单位与服务',
          badge: d.level || d.type || '常务理事单位',
          summary: `单位类别：${d.type || '高等院校'}，所在地区：${d.region || '全国'}。${d.desc || ''}`,
          url: '/members#directory',
          keywords: [d.name, d.type, d.region, '会员'],
        });
      });
    }),
  ]);

  try {
    await Promise.race([fetchPromise, timeoutPromise]);
  } catch (e) {
    // 降级兜底
  } finally {
    isFetchingLiveDocs = false;
  }

  if (liveItems.length > 0) {
    dynamicFirestoreIndex = liveItems;
    hasFetchedLiveDocs = true;
  }

  return liveItems;
}

/**
 * 全栈搜索执行器
 * @param queryText 搜索关键词
 * @param categoryFilter 频道类别筛选（可选）
 */
export async function searchFullSite(
  queryText: string,
  categoryFilter?: string
): Promise<SearchResultItem[]> {
  const cleanQuery = (queryText || '').trim().toLowerCase();
  if (!cleanQuery) return [];

  // 获取动态数据
  let liveDocs: SearchResultItem[] = [];
  try {
    liveDocs = await fetchLiveSearchDocs();
  } catch (e) {
    // fallback
  }

  const allItems = [...liveDocs, ...BASE_SEARCH_INDEX];
  const queryTerms = cleanQuery.split(/\s+/).filter(Boolean);

  const matched = allItems.filter((item) => {
    // 分类筛选
    if (categoryFilter && categoryFilter !== '全部' && item.category !== categoryFilter) {
      return false;
    }

    const titleLower = item.title.toLowerCase();
    const summaryLower = item.summary.toLowerCase();
    const badgeLower = item.badge.toLowerCase();
    const keywordsLower = (item.keywords || []).map((k) => k.toLowerCase()).join(' ');

    // 每一个搜索词都需匹配其中至少一项
    return queryTerms.every((term) => {
      return (
        titleLower.includes(term) ||
        summaryLower.includes(term) ||
        badgeLower.includes(term) ||
        keywordsLower.includes(term)
      );
    });
  });

  // 去重（按 title + category）
  const seen = new Set<string>();
  const deduplicated: SearchResultItem[] = [];
  for (const item of matched) {
    const key = `${item.category}-${item.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  // 排序打分（标题命中 > 标签命中 > 摘要命中）
  deduplicated.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    queryTerms.forEach((t) => {
      if (a.title.toLowerCase().includes(t)) scoreA += 10;
      if (a.badge.toLowerCase().includes(t)) scoreA += 5;
      if (a.summary.toLowerCase().includes(t)) scoreA += 2;

      if (b.title.toLowerCase().includes(t)) scoreB += 10;
      if (b.badge.toLowerCase().includes(t)) scoreB += 5;
      if (b.summary.toLowerCase().includes(t)) scoreB += 2;
    });

    return scoreB - scoreA;
  });

  return deduplicated;
}
