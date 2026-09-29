export interface MemberStoryItem {
  id: string;
  tag: string;
  tagColor?: string;
  unit: string;
  title: string;
  summary: string;
  date: string;
}

export interface MemberGuideProcessStep {
  step: string;
  desc: string;
}

export interface MemberGuideData {
  ctaTitle: string;
  ctaDesc: string;
  ctaButtonText: string;
  ctaUrl: string;
  conditions: string[];
  materials: string[];
  process: MemberGuideProcessStep[];
  footerNote: string;
  contactEmail: string;
}

export interface MemberServiceItem {
  id: string;
  service: string;
  method: string;
  contact: string;
  materials: string;
}

export interface MemberServicesConfig {
  items: MemberServiceItem[];
  footerNote: string;
  phone: string;
  email: string;
}

export interface MembersPageContentData {
  stories: MemberStoryItem[];
  guide: MemberGuideData;
  services: MemberServicesConfig;
}

export const defaultStoriesData: MemberStoryItem[] = [
  {
    id: 'story-1',
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '浙江大学工业技术转化研究院',
    title: '中新绿色储能联合研发：赋能东盟能源转型',
    summary: '联合新加坡南洋理工大学，在固态电池材料领域搭建双向技术转移通道，2026年完成首批样品在东南亚的产业落地，带动相关产业投资逾2亿元。',
    date: '2026-08',
  },
  {
    id: 'story-2',
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    unit: '同济大学国家技术转移中心',
    title: '城市地下空间智能感知系统规模化产业化纪实',
    summary: '历时3年推动自主研发的“地铁盾构地层扰动感知系统”走出实验室，与长三角多个市政项目签约，累计商业合同金额突破4500万元，技术出口德国。',
    date: '2026-06',
  },
  {
    id: 'story-3',
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '复旦大学国家大学科技园',
    title: '中英靶向药物孵化走廊：首例PCT跨国授权落地记',
    summary: '与牛津大学创新转化机构（OUI）联合建立“中英生命科学快速通道”，协助在孵企业完成全球首例高校衍生企业向英国本土药企的PCT跨国专利授权。',
    date: '2026-05',
  },
  {
    id: 'story-4',
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    unit: '北京清华科技开发有限公司',
    title: 'AI辅助药物分子设计平台成功孵化独角兽企业',
    summary: '依托清华大学药学院AI+分子设计研究成果，2年内完成从中试到商业化产品的转型，公司估值已突破15亿元，获得国内外顶级医疗基金联合投资。',
    date: '2026-04',
  },
  {
    id: 'story-5',
    tag: '成果转化',
    tagColor: 'bg-emerald-100 text-emerald-800',
    unit: '中山大学国家大学科技园',
    title: '粤港澳联合孵化：跨境数据合规平台全球首发',
    summary: '整合中山大学与香港科技大学算法资源，开发面向大湾区数字经济企业的跨境数据合规管理平台，已完成港、澳、广三地商业注册，服务企业逾300家。',
    date: '2026-03',
  },
  {
    id: 'story-6',
    tag: '国际合作',
    tagColor: 'bg-blue-100 text-blue-800',
    unit: '西安交通大学技术转移中心',
    title: '共建“一带一路”：中哈能源装备技术援助与商业化',
    summary: '联合哈萨克斯坦国立技术大学，向哈方系统性输出西交大自主研发的高效抽油泵控制系统，商业合作协议已落地，同步培育当地技术经纪人团队15名。',
    date: '2026-02',
  },
];

export const defaultGuideData: MemberGuideData = {
  ctaTitle: '协会统一入会入口',
  ctaDesc: '入会申请、资格审核及费用缴纳均通过中国高校校办产业协会（CAUI）官网统一办理，国专委不直接受理入会申请。',
  ctaButtonText: '跳转协会统一入会入口 →',
  ctaUrl: 'https://www.caui.org.cn/',
  conditions: [
    '在中华人民共和国境内依法注册的高等院校（含民办高校）',
    '由高等院校直接投资或控股设立的校办企业（持股比例不低于51%）',
    '具有技术转移服务资质的国家级或省级认定机构',
    '经国家认定的大学科技园（A类、B类均可申请）',
    '认同协会章程，履行年度会费义务，参与协会活动',
  ],
  materials: [
    '《中国高校校办产业协会入会申请表》（官网下载最新版）',
    '单位法人证书或营业执照复印件（加盖公章）',
    '组织机构代码证或统一社会信用代码证明',
    '单位近两年度主要工作及成绩简介（不超过2页A4）',
    '主要负责人身份证明及联系方式',
  ],
  process: [
    { step: '提交申请', desc: '在协会官网在线提交申请表及材料扫描件' },
    { step: '秘书处受理', desc: '秘书处5个工作日内完成资格初审并反馈' },
    { step: '理事会审议', desc: '初审通过后提交理事会或常务理事会审议' },
    { step: '审核结果通知', desc: '审核通过后向申请单位发出正式入会通知书' },
    { step: '缴纳会费', desc: '根据通知书在规定期限内完成年度会费缴纳' },
    { step: '颁发证书', desc: '完成缴费后颁发会员证书及相关权益告知书' },
  ],
  footerNote: '如需国专委出具推荐意见函，请联系秘书处邮箱：',
  contactEmail: 'secretariat@guozhuanwei.org.cn',
};

export const defaultServiceItems: MemberServiceItem[] = [
  {
    id: 'srv-1',
    service: '国际合作项目推荐与匹配',
    method: '线上提交需求 + 秘书处定向匹配',
    contact: '国际合作部 · 郑老师',
    materials: '单位营业执照（或法人证书）、合作需求说明书、联系人信息表',
  },
  {
    id: 'srv-2',
    service: '技术成果转让与许可登记备案',
    method: '线上申报系统 + 线下纸质归档',
    contact: '成果转化部 · 刘老师',
    materials: '技术合同副本、专利证书复印件、转让方资质证明',
  },
  {
    id: 'srv-3',
    service: 'PCT国际专利申报辅导',
    method: '预约一对一专家咨询（线上/线下均可）',
    contact: '知识产权服务部 · 陈老师',
    materials: '现有国内专利证书、技术说明书、目标申请国列表',
  },
  {
    id: 'srv-4',
    service: '会员资质年度审查与积分认定',
    method: '线上提交年度报告，秘书处审核',
    contact: '会员管理部 · 周老师',
    materials: '年度工作总结报告、成果转化汇总清单、财务审计摘要',
  },
  {
    id: 'srv-5',
    service: '涉外合规与法律风险预评估',
    method: '书面申请 + 专家委员会评估（15个工作日）',
    contact: '法律与合规部 · 王老师',
    materials: '拟开展合作的合同草稿、境外合作方资质材料、合规自查报告',
  },
  {
    id: 'srv-6',
    service: '国际论坛与展会参展推荐',
    method: '秘书处统一报名，提交参展意向表',
    contact: '活动联络部 · 张老师',
    materials: '参展单位介绍、展示成果清单（不超过5项）、主要联系人信息',
  },
  {
    id: 'srv-7',
    service: '会员单位培训与研习营报名',
    method: '官网报名系统 + 确认函回传',
    contact: '教育培训部 · 赵老师',
    materials: '参训人员名单、单位介绍函、学历/职称证明（按培训要求）',
  },
];

export const defaultServicesConfig: MemberServicesConfig = {
  items: defaultServiceItems,
  footerNote: '如需申请以上服务，请先确认贵单位已完成当年度会员资质年审。如遇紧急事项，请直接致电国专委秘书处。',
  phone: '010-XXXX-XXXX',
  email: 'service@guozhuanwei.org.cn',
};

export const defaultMembersContentData: MembersPageContentData = {
  stories: defaultStoriesData,
  guide: defaultGuideData,
  services: defaultServicesConfig,
};
