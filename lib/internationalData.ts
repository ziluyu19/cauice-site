export interface RegionItem {
  id: string;
  country: string;
  tag: string;
  tagColor?: string;
  overview: string;
  policyTip: string;
  foundation: string;
}

export interface BriItem {
  id: string;
  category: 'policy' | 'project' | 'activity' | 'achievement';
  title: string;
  dateOrStatus: string;
  statusBadge?: string;
  summary: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  status: string;
  title: string;
  date: string;
  location: string;
  summary: string;
}

export interface MatchmakingNeedItem {
  id: string;
  direction: 'domestic' | 'overseas';
  field: string;
  publisher: string;
  title: string;
  desc: string;
  footerMeta: string;
}

export interface PartnerOrgItem {
  id: string;
  category: 'international_org' | 'overseas_uni';
  name: string;
  sub: string;
  desc: string;
  country: string;
  linkText?: string;
}

export interface InternationalContentData {
  regions: RegionItem[];
  bri: BriItem[];
  activities: ActivityItem[];
  matchmakingNeeds: MatchmakingNeedItem[];
  organizations: PartnerOrgItem[];
}

export const defaultInternationalData: InternationalContentData = {
  // 1. 国别与区域
  regions: [
    {
      id: 'region-1',
      country: '德国 (Germany)',
      tag: '中欧工业创新',
      tagColor: 'bg-blue-100 text-blue-800',
      overview: '聚焦工业4.0、先进数控机床及双元制工程技术协同培育，重点对接巴伐利亚与北威州高科技产业集群。',
      policyTip: '严格关注德国《对外贸易法》关于关键基础设施技术转让审查条款及欧盟碳边境调节机制（CBAM）合规核算。',
      foundation: '已共建2处高校离岸中试验证基地，14所骨干高校签署技术成果互认意向。',
    },
    {
      id: 'region-2',
      country: '新加坡 (Singapore)',
      tag: '东盟国际枢纽',
      tagColor: 'bg-emerald-100 text-emerald-800',
      overview: '依托中新互联互通战略及纬壹科技城，重点推动高校金融科技、绿色低碳材料及跨境知识产权商业化。',
      policyTip: '享受RCEP原产地累加优惠，需防范跨国数据流动合规及新加坡个人数据保护法（PDPA）科技企业监管要求。',
      foundation: '设立中新高校联合概念验证走廊，每年常态化开展“高校成果南洋路演周”。',
    },
    {
      id: 'region-3',
      country: '英国 (United Kingdom)',
      tag: '前沿基础转化',
      tagColor: 'bg-purple-100 text-purple-800',
      overview: '紧密链接牛津、剑桥及帝国理工高校产业转化网络，专注于生命科学、肿瘤免疫及量子计算概念验证。',
      policyTip: '注意英国《国家安全与投资法》（NSI Act）对17个敏感技术领域的并购强制申报要求。',
      foundation: '累计实施8项联合药物靶点转让合同，设立中英高校技术经纪人联合认证机制。',
    },
  ],

  // 2. 一带一路专题
  bri: [
    {
      id: 'bri-1',
      category: 'policy',
      title: '《“一带一路”科技创新行动计划高校实施细则》',
      dateOrStatus: '2025-10',
      summary: '明确支持高校科技企业在沿线设立“鲁班工坊”衍生技术转化站与绿色农业离岸联合实验室。',
    },
    {
      id: 'bri-2',
      category: 'policy',
      title: '《高校共建“数字丝绸之路”国际标准互通互认扶持指引》',
      dateOrStatus: '2025-06',
      summary: '推动智能电网、轨道交通与数字孪生高校自主技术标准纳入沿线国家行业规范。',
    },
    {
      id: 'bri-3',
      category: 'project',
      title: '中哈现代农业节水灌溉技术装备联合产业化示范区',
      dateOrStatus: '阿拉木图万亩示范基地',
      statusBadge: '推进中',
      summary: '西北农林科技大学联合哈萨克斯坦国立农业大学，在阿拉木图落地示范基地逾万亩。',
    },
    {
      id: 'bri-4',
      category: 'project',
      title: '中国-东盟智能微电网技术转化与人才联合实训基地',
      dateOrStatus: '华南理工与马来亚大学',
      statusBadge: '已立项',
      summary: '华南理工大学与马来亚大学联合共建，服务东盟海岛分布式新能源并网解决方案。',
    },
    {
      id: 'bri-5',
      category: 'activity',
      title: '第四届“一带一路”高校校办产业高层圆桌会议',
      dateOrStatus: '2026-05 乌兹别克斯坦塔什干',
      summary: '聚焦中亚区域水资源综合治理与矿产绿色开采高校科技成果对接。',
    },
    {
      id: 'bri-6',
      category: 'activity',
      title: '2026澜湄流域高校成果出海技术线上对接路演会',
      dateOrStatus: '常态化每季度举办',
      summary: '面向老挝、泰国、柬埔寨发布国内高校适合就地产业化的中试成果清单。',
    },
    {
      id: 'bri-7',
      category: 'achievement',
      title: '累计促成沿线技术转移交易额突破 4.2 亿元人民币',
      dateOrStatus: '2023-2025综合统计',
      summary: '覆盖沿线22个共建国家，培育高校跨国产学研联合实体19家，累计授权PCT发明专利46项。',
    },
  ],

  // 3. 涉外交流活动
  activities: [
    {
      id: 'act-1',
      type: '出访',
      status: '活动预告',
      title: '2026年高校校办产业代表团赴德国、瑞士先进智能制造专项出访考察交流',
      date: '2026-11-12 至 2026-11-20',
      location: '德国慕尼黑 / 瑞士苏黎世',
      summary: '【活动预告】组织国内重点高校资产公司与科技园负责人，实地对接苏黎世联邦理工学院概念验证中心与巴伐利亚智能智造创新链，洽谈离岸技术转移机制。',
    },
    {
      id: 'act-2',
      type: '来访',
      status: '活动纪要',
      title: '新加坡国立大学与南洋理工大学高校企业联合代表团来华访问圆满举行',
      date: '2026-08-18',
      location: '中国北京 · 国专委秘书处',
      summary: '【活动纪要】双方围绕智慧城市、绿色储能电池国际技术许可深入会谈，达成了设立中新高校双向成果孵化绿色通道等多项共识备忘录。',
    },
    {
      id: 'act-3',
      type: '论坛',
      status: '活动预告',
      title: '2026中欧高校产学研国际技术转移与转化峰会（线上+线下）',
      date: '2026-10-28',
      location: '中国上海 · 国家会展中心',
      summary: '【活动预告】汇聚中外50余所知名大学校长与跨国技术经理人，重点探讨跨国产学研利益共享、职务成果海外赋权与跨国合规争议防范实务。',
    },
    {
      id: 'act-4',
      type: '展会',
      status: '活动纪要',
      title: '第二届中国高校高新技术成果（东盟）巡展暨产学研对接博览会闭幕',
      date: '2026-07-05 至 2026-07-08',
      location: '马来西亚吉隆坡',
      summary: '【活动纪要】国内26所高校参展，展出涉及智能农业、数字医疗等前沿技术成果110余项，现场签署意向合作金额达8500万元。',
    },
    {
      id: 'act-5',
      type: '培训',
      status: '活动预告',
      title: '第四期高校涉外知识产权合规管理与PCT跨国专利布局高级研讨培训班',
      date: '2026-10-15 至 2026-10-17',
      location: '中国深圳',
      summary: '【活动预告】邀请国家知识产权局专家与涉外知名专利律师，专场讲授欧美技术出口管制应对、跨境商业秘密保护与国际许可谈判技巧。',
    },
  ],

  // 4. 合作需求与对接
  matchmakingNeeds: [
    {
      id: 'need-1',
      direction: 'domestic',
      field: '高端装备 / 智能制造',
      publisher: '华东某“双一流”大学国家大学科技园',
      title: '高精度工业视觉缺陷检测算法海外技术合作意向',
      desc: '拟寻求欧洲（德国或瑞士）具有成熟工业落地经验的联合实验室，共同开发适应多光源复杂反光表面的质检模型，支持合作建立概念验证中心。',
      footerMeta: '发布周期：2026年Q3前有效 · 合作形式：联合研发 / 知识产权共有',
    },
    {
      id: 'need-2',
      direction: 'domestic',
      field: '新能源 / 储能材料',
      publisher: '华南重点高校校办产业集团',
      title: '新型固态钠离子电池中试产线东盟本地化组装合作',
      desc: '国内核心电极材料中试工艺已成型，寻求新加坡或马来西亚当地具产业资质的工业园承接地，共同设立示范装配工厂，开拓东南亚储能市场。',
      footerMeta: '发布周期：长期有效 · 合作形式：技术入股 / 股权合作',
    },
    {
      id: 'need-3',
      direction: 'overseas',
      field: '生命科学 / 靶向药物',
      publisher: '英国牛津区域某创新生物孵化平台',
      title: '早期抗肿瘤先导化合物大中华区临床试验联合开发',
      desc: '持有2项已获PCT授权的激酶抑制剂核心专利，希望寻找中国具备三甲教学医院背景的高校科技开发部及药企，开展合作研发与临床试验申报。',
      footerMeta: '发布周期：2026年内有效 · 合作形式：专利转让 / 许可授权',
    },
    {
      id: 'need-4',
      direction: 'overseas',
      field: '智慧农业 / 水资源',
      publisher: '中亚创新科技网络联合体 (CAITN)',
      title: '干旱半干旱地区耐盐碱作物与滴灌测控技术引进意向',
      desc: '拟引入中国高校成熟的耐旱耐盐作物品种与北斗精准滴灌自动化控制系统，已备齐当地试验示范田，诚邀相关高校专家团队对接。',
      footerMeta: '发布周期：常年有效 · 合作形式：成果转让 / 援外产学研项目',
    },
  ],

  // 5. 国际组织与友好机构
  organizations: [
    {
      id: 'org-1',
      category: 'international_org',
      name: '国际大学科技园协会 (IASP)',
      sub: 'International Association of Science Parks',
      desc: '全球科技园区与高校孵化创新区官方联盟，连接70余国知名大学科技园。',
      country: '总部：西班牙',
      linkText: '了解合作',
    },
    {
      id: 'org-2',
      category: 'international_org',
      name: '国际技术转移经理人联盟 (ATTP)',
      sub: 'Alliance of Technology Transfer Professionals',
      desc: '全球权威技术转移专业资格认证机构，协同开展RTTP国际认证培训。',
      country: '全球联合机构',
      linkText: '了解合作',
    },
    {
      id: 'org-3',
      category: 'international_org',
      name: '欧洲高校产业联络与技术转移协会 (ASTP)',
      sub: 'Association of European Science & Tech Transfer',
      desc: '欧洲最大的知识转移与高校科技成果商业化行业互联网络。',
      country: '总部：荷兰',
      linkText: '了解合作',
    },
    {
      id: 'org-4',
      category: 'overseas_uni',
      name: '德国慕尼黑工业大学科技转化院',
      sub: 'TUM ForTe - Office for Research and Innovation',
      desc: '欧洲顶尖创业型大学产业转化标杆，在智能机械、先进汽车工程领域具有深度合作。',
      country: '德国 慕尼黑',
      linkText: '合作简介',
    },
    {
      id: 'org-5',
      category: 'overseas_uni',
      name: '新加坡南洋理工大学创新中心',
      sub: 'NTUitive (Nanyang Technological University)',
      desc: '负责南洋理工大学所有前沿研究商业化孵化与衍生企业海外投资培育。',
      country: '新加坡',
      linkText: '合作简介',
    },
    {
      id: 'org-6',
      category: 'overseas_uni',
      name: '英国牛津大学创新转化机构',
      sub: 'Oxford University Innovation (OUI)',
      desc: '全球历史悠久的大学技术许可中心，每年产生数十项高价值衍生实体与专利授权。',
      country: '英国 牛津',
      linkText: '合作简介',
    },
  ],
};
