export interface TechItem {
  id: string;
  category: '科技成果' | '技术需求';
  title: string;
  unit: string;
  field: string;
  maturity: string;
  status: string;
  summary: string;
  contact: string;
  date?: string;
}

export interface StandardItem {
  id: string;
  code: string;
  title: string;
  type: string;
  date: string;
  desc: string;
  linkUrl?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  unit?: string;
  contact?: string;
}

export interface CaseItem {
  id: string;
  tag: string;
  tagColor?: string;
  title: string;
  unit: string;
  bg: string;
  path: string;
  result: string;
}

export interface ExpertItem {
  id: string;
  name: string;
  title: string;
  unit: string;
  field: string;
  country: string;
  langs: string;
}

export interface TrainingItem {
  id: string;
  type: '课程预告' | '精彩回顾';
  tag: string;
  date: string;
  title: string;
  location: string;
  desc: string;
}

export interface AchievementsContentData {
  techItems: TechItem[];
  standards: StandardItem[];
  reports: ReportItem[];
  cases: CaseItem[];
  experts: ExpertItem[];
  trainings: TrainingItem[];
}

export const defaultAchievementsContentData: AchievementsContentData = {
  // 1. 科技成果与技术需求
  techItems: [
    {
      id: 'tr-1',
      category: '科技成果',
      title: '高精度轮廓视觉检测系统 V3.0',
      unit: '清华大学精密仪器系',
      field: '智能制造',
      maturity: 'TRL 7（样机验证）',
      status: '寻求转让',
      date: '2026-06',
      summary: '面向高端装备制造产线的高精度三维几何量检测平台，具备微米级在线实时测量能力。',
      contact: '010-6278XXXX',
    },
    {
      id: 'tr-2',
      category: '科技成果',
      title: '固态锂钠双离子电池正极材料',
      unit: '浙江大学化学工程系',
      field: '新能源材料',
      maturity: 'TRL 6（中试完成）',
      status: '寻求许可',
      date: '2026-05',
      summary: '突破高比能与宽温域电化学稳定性瓶颈，已完成长三角中试试验线批量制备验证。',
      contact: '0571-8795XXXX',
    },
    {
      id: 'tr-3',
      category: '科技成果',
      title: '抗肿瘤靶向多肽先导化合物 ZD-2026',
      unit: '复旦大学药学院',
      field: '生物医药',
      maturity: 'TRL 5（小试完成）',
      status: '寻求合作开发',
      date: '2026-04',
      summary: '针对实体瘤免疫逃逸通路的创新多肽药物分子，动物体内活性与耐受性表现优异。',
      contact: '021-5163XXXX',
    },
    {
      id: 'tr-4',
      category: '科技成果',
      title: '城市隧道施工地层扰动实时感知平台',
      unit: '同济大学土木工程学院',
      field: '智慧基建',
      maturity: 'TRL 8（产品就绪）',
      status: '已许可',
      date: '2026-03',
      summary: '结合光纤传感与AI地层形变预测模型，已在长三角多个重点轨道交通盾构区间成熟落地。',
      contact: '021-6598XXXX',
    },
    {
      id: 'td-1',
      category: '技术需求',
      title: '寻求中国高校耐盐碱作物品种与滴灌控制技术',
      unit: '哈萨克斯坦纳扎尔巴耶夫大学',
      field: '现代农业',
      maturity: '产学研合作',
      status: '需求发布中',
      date: '2026-07',
      summary: '面向中亚干旱盐碱地生态修复，急需引进抗旱节水高产作物品种培育与自动化水肥一体化装备。',
      contact: 'int-agri@nu.edu.kz',
    },
    {
      id: 'td-2',
      category: '技术需求',
      title: '引进高校智能工业视觉缺陷检测算法（欧洲工业落地）',
      unit: '德国弗劳恩霍夫研究院合作伙伴',
      field: '智能制造',
      maturity: '商业许可',
      status: '需求发布中',
      date: '2026-06',
      summary: '寻求与中国高校合作研发适用于汽车冲压件在线微裂纹高速检测模型，可提供欧洲产线落地测试环境。',
      contact: 'collab@fraunhofer-partner.de',
    },
    {
      id: 'td-3',
      category: '技术需求',
      title: '寻求高校量子通信基础实验平台技术许可与人才培训',
      unit: '新加坡国立大学量子科技研究中心',
      field: '量子信息',
      maturity: '科研与实训',
      status: '需求发布中',
      date: '2026-05',
      summary: '建设东南亚区域量子密钥分发实训走廊，寻求成熟实验装备技术许可及双向访问学者互换机制。',
      contact: 'quantum@nus.edu.sg',
    },
  ],

  // 2. 团体标准 T/CAUI
  standards: [
    {
      id: 'std-1',
      code: 'T/CAUI 016-2025',
      title: '智慧型高等院校科技孵化中心建设指南',
      type: '批准发布',
      date: '2025-09-19',
      desc: '规定智慧型高等院校科技孵化中心的建设目标、功能要求、配套设施及运营服务标准。',
      linkUrl: 'https://www.caui.org.cn/article/55_0_0_0.html?shId=624',
    },
    {
      id: 'std-2',
      code: 'T/CAUI 028-2025',
      title: '校企合作产学研用示范中心建设指南',
      type: '批准发布',
      date: '2025-09-19',
      desc: '明确校企合作产学研用示范中心在组织架构、合作机制、成果共享及考核评价方面的规范要求。',
      linkUrl: 'https://www.caui.org.cn/article/55_0_0_0.html?shId=624',
    },
    {
      id: 'std-3',
      code: 'T/CAUI 032-2025',
      title: '概念验证中心规范化导则 第2部分：服务规范化等级评定',
      type: '批准发布',
      date: '2025-09-19',
      desc: '针对概念验证中心服务能力，建立分级评定指标体系，推动概念验证服务标准化与规范化。',
      linkUrl: 'https://www.caui.org.cn/article/55_0_0_0.html?shId=624',
    },
  ],

  // 3. 研究报告
  reports: [
    {
      id: 'rep-1',
      title: '2026年中国高校科技成果海外转化白皮书',
      date: '2026-07',
      tags: ['成果转化', '国际合作'],
      summary: '系统梳理国内500余所高校科技成果海外许可、专利布局与衍生企业出海的最新趋势，提出六大政策优化建议。',
      unit: '国专委秘书处研究部',
      contact: 'secretariat@guozhuanwei.org.cn',
    },
    {
      id: 'rep-2',
      title: '德国产学研合作环境与高校技术转移机制研究报告',
      date: '2026-05',
      tags: ['国别研究', '德国'],
      summary: '深入分析弗劳恩霍夫模式与德国高校“双元制”技术转移通道，为中德合作提供制度对标参考。',
      unit: '国专委智库课题组',
      contact: 'secretariat@guozhuanwei.org.cn',
    },
    {
      id: 'rep-3',
      title: '东南亚高校科技合作政策环境与机遇评估报告',
      date: '2026-03',
      tags: ['国别研究', '东南亚'],
      summary: '覆盖新加坡、马来西亚、泰国、越南四国高校科技政策、知识产权制度与产学研合作激励机制比较研究。',
      unit: '国际区域合作专家组',
      contact: 'secretariat@guozhuanwei.org.cn',
    },
    {
      id: 'rep-4',
      title: '高校职务科技成果赋权改革实施效果评估报告（2025）',
      date: '2025-12',
      tags: ['政策研究', '成果转化'],
      summary: '跟踪评估40余所试点高校赋权改革落地效果，揭示现行障碍并提出完善建议，配套案例库12个。',
      unit: '高校赋权改革专题评估组',
      contact: 'secretariat@guozhuanwei.org.cn',
    },
  ],

  // 4. 典型案例
  cases: [
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
  ],

  // 5. 专家库
  experts: [
    {
      id: 'exp-1',
      name: '张明远',
      title: '教授 / 技术经纪人',
      unit: '清华大学技术转移研究院',
      field: '技术转移',
      country: '中国',
      langs: '中 / 英 / 德',
    },
    {
      id: 'exp-2',
      name: 'Prof. Hans Müller',
      title: 'Professor',
      unit: '慕尼黑工业大学',
      field: '智能制造',
      country: '德国',
      langs: '英 / 德',
    },
    {
      id: 'exp-3',
      name: '李晓慧',
      title: '副研究员',
      unit: '复旦大学知识产权研究中心',
      field: '涉外知识产权',
      country: '中国',
      langs: '中 / 英',
    },
    {
      id: 'exp-4',
      name: 'Dr. Priya Rajan',
      title: 'Senior Fellow',
      unit: '新加坡南洋理工大学 NTUitive',
      field: '生物医药转化',
      country: '新加坡',
      langs: '英',
    },
    {
      id: 'exp-5',
      name: '王海涛',
      title: '研究员',
      unit: '同济大学国家技术转移中心',
      field: '城市基建技术',
      country: '中国',
      langs: '中 / 英',
    },
    {
      id: 'exp-6',
      name: 'Dr. Olivia Chen',
      title: 'Associate Director',
      unit: '牛津大学创新转化机构 (OUI)',
      field: '生命科学商业化',
      country: '英国',
      langs: '英 / 中',
    },
    {
      id: 'exp-7',
      name: '陈国强',
      title: '正高级工程师',
      unit: '浙江大学工业技术转化研究院',
      field: '新能源材料',
      country: '中国',
      langs: '中 / 英',
    },
    {
      id: 'exp-8',
      name: 'Dr. Andrey Volkov',
      title: 'Research Director',
      unit: '纳扎尔巴耶夫大学',
      field: '农业科技合作',
      country: '哈萨克斯坦',
      langs: '俄 / 英',
    },
  ],

  // 6. 培训与人才
  trainings: [
    {
      id: 'trn-1',
      type: '课程预告',
      tag: '涉外业务',
      date: '2026-10-15',
      title: '高校涉外技术出口合规管控实务培训班（第五期）',
      location: '北京·线下+直播',
      desc: '聚焦技术出口管制清单识别、许可证申请流程与违规风险规避，邀请商务部专家主讲。',
    },
    {
      id: 'trn-2',
      type: '课程预告',
      tag: '国际合作实务',
      date: '2026-11-06',
      title: '中欧高校产学研合作协议谈判技巧与案例分析工作坊',
      location: '上海·线下',
      desc: '采用真实合同文本拆解与角色扮演谈判演练，提升参训者跨文化商务谈判能力。',
    },
    {
      id: 'trn-3',
      type: '精彩回顾',
      tag: '涉外业务',
      date: '2026-08-25',
      title: '第四期高校涉外知识产权合规管理与PCT布局研讨培训班（已结束）',
      location: '深圳·已完成',
      desc: '共98人参训，满意度评分4.8/5.0。课程录像与学员手册已上传会员内部平台，凭账号登录下载。',
    },
  ],
};
