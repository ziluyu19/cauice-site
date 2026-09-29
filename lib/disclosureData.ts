export interface BasicInfoItem {
  id: string;
  label: string;
  value: string;
}

export interface LeaderInfoItem {
  id: string;
  role: string;
  name: string;
  title: string;
  org: string;
  changeRecord: string;
  desc: string;
}

export interface OrgUnitItem {
  id: string;
  number: string;
  title: string;
  desc: string;
  footerNote: string;
  linkText?: string;
  linkUrl?: string;
}

export interface AnnualReportItem {
  id: string;
  year: string;
  title: string;
  publishDate: string;
  summary: string;
  plan: string;
  fullContent: string;
}

export interface CreditCommitmentItem {
  id: string;
  title: string;
  content: string;
}

export interface CreditSectionData {
  title: string;
  subtitle: string;
  commitments: CreditCommitmentItem[];
}

export interface DisclosureActivityItem {
  id: string;
  title: string;
  type: string;
  time: string;
  location: string;
  result: string;
}

export interface SolicitationItem {
  id: string;
  title: string;
  deadline: string;
  status: '进行中' | '已结束';
  method: string;
  note: string;
}

export interface MessageInquiryItem {
  id: string;
  user: string;
  date: string;
  question: string;
  reply: string;
  replyDate: string;
}

export interface InteractionData {
  solicitations: SolicitationItem[];
  messageInquiries: MessageInquiryItem[];
}

export interface DisclosureContentData {
  basicInfo: BasicInfoItem[];
  leaders: LeaderInfoItem[];
  orgUnits: OrgUnitItem[];
  annualReports: AnnualReportItem[];
  credit: CreditSectionData;
  activities: DisclosureActivityItem[];
  interaction: InteractionData;
}

export const defaultDisclosureContentData: DisclosureContentData = {
  // 1. 基本信息
  basicInfo: [
    {
      id: 'bi-1',
      label: '机构全称',
      value: '中国高校校办产业协会国际产学研合作工作委员会（简称：国专委）',
    },
    {
      id: 'bi-2',
      label: '成立批复',
      value: '中高产协字〔2023〕18号《关于设立中国高校校办产业协会国际产学研合作工作委员会的决定》',
    },
    {
      id: 'bi-3',
      label: '办会宗旨',
      value: '立足全球科技创新视野，服务国家高水平对外开放与产教融合战略，赋能中国高校科技创新、成果跨境孵化及校办产业高质量出海。',
    },
    {
      id: 'bi-4',
      label: '业务范围',
      value: '开展国际高校及科研机构产学研合作交流；组织跨国技术对接、展览展会与学术论坛；推动跨境成果孵化与技术转移人才培育；研制团体标准与行业发展智库报告；承担政府部门及总会委托的工作事项。',
    },
    {
      id: 'bi-5',
      label: '秘书处办公地址',
      value: '北京市海淀区中关村南大街1号科技大厦B座806室（邮编：100081）',
    },
    {
      id: 'bi-6',
      label: '官方联系方式',
      value: '电话：010-6891XXXX / 电子邮箱：secretariat@guozhuanwei.org.cn',
    },
  ],

  // 2. 负责人与机构信息
  leaders: [
    {
      id: 'ldr-1',
      role: '主任委员',
      name: '周清源',
      title: '教授 / 博士生导师',
      org: '清华大学资产管理与产业研究院',
      changeRecord: '2023年10月第一届第一次委员代表大会选举产生，现任。',
      desc: '长期从事高校科技体制改革与产业创新战略研究，兼任国家科技成果转化引导基金专家委员会委员。',
    },
    {
      id: 'ldr-2',
      role: '副主任委员',
      name: '陈树安',
      title: '研究员',
      org: '浙江大学工业技术转化研究院',
      changeRecord: '2023年10月选举当选，分管国际技术对接与离岸创新基地建设，现任。',
      desc: '主持国家重点研发计划中欧联合研发专项，在智能制造及新材料国际转移领域经验丰富。',
    },
    {
      id: 'ldr-3',
      role: '副主任委员',
      name: '林美芬',
      title: '正高级经济师',
      org: '华南理工大学国家大学科技园',
      changeRecord: '2023年10月选举当选，分管粤港澳及东盟区域产学研协同平台，现任。',
      desc: '大湾区高校成果孵化联盟联合发起人，主导建立深港澳青年跨境创业联合通道。',
    },
    {
      id: 'ldr-4',
      role: '秘书长',
      name: '刘振宇',
      title: '副研究员 / 国际技术转移经理人(RTTP)',
      org: '国专委常设秘书处',
      changeRecord: '2023年10月常务理事会聘任；2025年换届考察中获全票连任，现任。',
      desc: '全面主持秘书处日常行政与服务运营，主导起草3项高校科技园建设团体标准。',
    },
  ],

  // 3. 组织机构
  orgUnits: [
    {
      id: 'org-1',
      number: '01',
      title: '全国会员网络',
      desc: '涵盖全国高水平大学、骨干校办企业、国家大学科技园与技术转移中心，构成国专委广泛的协同工作网络与服务对象基石。',
      footerNote: '涵盖全国高水平骨干会员高校与科技企业',
      linkText: '查阅公开会员名录',
      linkUrl: '/members',
    },
    {
      id: 'org-2',
      number: '02',
      title: '常设秘书处',
      desc: '秘书处为理事会常设执行机构，设综合行政部、国际合作部、成果转化部、会员发展部与标准化工作组，负责日常运营、对外联络与财务监督。',
      footerNote: '办公地点：北京中关村南大街科技大厦',
    },
    {
      id: 'org-3',
      number: '03',
      title: '专门工作委员会与办事机构',
      desc: '设立欧美离岸合作专家委员会、东盟一带一路产教走廊联络处、国际知识产权赋权指导中心等分支专业工作单元，按需为会员提供针对性服务。',
      footerNote: '机构职能细则经协会常务理事会批准实施',
    },
  ],

  // 4. 年度工作报告
  annualReports: [
    {
      id: 'ar-2025',
      year: '2025年度',
      title: '2025年度工作总结与财务决算收支及2026年工作要点报告',
      publishDate: '2026-01-15',
      summary: '全年吸纳骨干高校及校办企业等会员单位32家；组织中欧、中新双向考察交流活动4次；推进并发布团体标准3项；发布《2025中国高校科技成果海外转化白皮书》。',
      plan: '2026年度计划重点推进“一带一路”产教融合实训示范区建设，拓展中亚及东盟技术转移节点。',
      fullContent: '一、2025年度核心业务执行概况\n1. 会员网络拓展：新增清华大学、浙江大学等骨干会员单位，全国入册会员突破120家。\n2. 国际技术撮合：主导举办中欧、中新专场对接路演，促成跨国技术许可与意向合同逾1.2亿元。\n3. 财务与合规：各项经费收支均严格执行总会规章，年度外部审计意见为无保留标准审计结论。',
    },
    {
      id: 'ar-2024',
      year: '2024年度',
      title: '2024年度工作开展情况报告及2025年度计划展望',
      publishDate: '2025-01-12',
      summary: '设立中新高校联合概念验证走廊；开展技术转移经纪人涉外业务骨干培训班3期，参训人员260余人次；完成全国高校涉外技术转移合规自查摸底工作。',
      plan: '2025年度计划加强团体标准立项体系建设，健全对会员单位常态化涉外法律合规咨询服务机制。',
      fullContent: '一、2024年度工作回顾\n1. 机制创新：首设“国际概念验证走廊”，打通中新绿色储能技术转移路径。\n2. 队伍建设：联合海外专业机构开展涉外技术转移人才高级研修，累计培育骨干260人次。\n3. 行业规范：启动首批3项产学研协同团体标准编制立项。',
    },
    {
      id: 'ar-2023',
      year: '2023年度',
      title: '第一届理事会筹备与开局年度工作总结报告',
      publishDate: '2024-01-10',
      summary: '完成民政备案与国专委建章立制；确立首批110家发起会员单位；搭设官方门户平台与国际合作项目初始储备库。',
      plan: '2024年度计划组织首场跨国高校技术路演峰会，完善专家库首期入库遴选工作。',
      fullContent: '一、建章立制与机构起步\n1. 完成组织机构搭建与秘书处设立。\n2. 制定并审议通过《国际产学研合作工作委员会工作条例》。\n3. 确立第一届理事会领导班子，明确三年工作发展纲要。',
    },
  ],

  // 5. 信用承诺
  credit: {
    title: '中国高校校办产业协会国际产学研合作工作委员会信用承诺书',
    subtitle: '自觉恪守非营利组织行业自律，全面公示收费与服务边界',
    commitments: [
      {
        id: 'crd-1',
        title: '服务内容与服务对象承诺',
        content: '坚决依照协会章程与批准业务范围开展工作，所有国际技术撮合、培训交流与成果展示均以赋能会员单位和促进高校科技自立自强为核心宗旨；不从事与国专委宗旨无关的营利性商业行为。',
      },
      {
        id: 'crd-2',
        title: '会费及服务性收费严格规范',
        content: '国专委不自行设立独立的会费收费标准或银行基本账户，所有会费缴纳均严格通过中国高校校办产业协会统一账户收取并开具民政部监制全国社会团体会费统一票据；严禁违规摊派与乱收费。',
      },
    ],
  },

  // 6. 重点活动与项目情况
  activities: [
    {
      id: 'act-1',
      title: '2026中欧高校产学研国际技术转移与转化峰会',
      type: '重大活动',
      time: '2026年8月',
      location: '中国上海',
      result: '联合50余所中外高校签署《2026上海共识》，达成14项跨国技术转让与许可合作意向备忘录。',
    },
    {
      id: 'act-2',
      title: '中新高校纳米新材料与绿色储能示范产线共建工程',
      type: '重点项目',
      time: '2025年 - 2027年',
      location: '中国杭州 / 新加坡 / 马来西亚柔佛',
      result: '带动国内高校衍生企业获东盟产业基金投资3000万新元，首期固态电池中试生产线正进场安装。',
    },
    {
      id: 'act-3',
      title: '中国高校高新技术成果（东盟）巡展暨博览会',
      type: '重大活动',
      time: '2025年7月',
      location: '马来西亚吉隆坡',
      result: '26所高校参展成果110余项，现场签署技术对接与联合人才培育意向协议8500万元。',
    },
    {
      id: 'act-4',
      title: '高校涉外技术出口合规与跨国PCT专利布局高级培训项目',
      type: '长期培育',
      time: '常态化每季度',
      location: '线上 + 北京/深圳',
      result: '已连续举办5期，累计培训高校院系转化负责人与骨干经纪人超400名，结业考核合格率98%。',
    },
  ],

  // 7. 互动交流
  interaction: {
    solicitations: [
      {
        id: 'sol-1',
        title: '关于对团体标准《高校涉外技术转移合规管理指南》（征求意见稿）公开征求意见的通知',
        deadline: '2026-10-31',
        status: '进行中',
        method: '请将纸质盖章反馈意见扫描后发送至 secretariat@guozhuanwei.org.cn，邮件主题注明“团标意见征集”。',
        note: '结束后公布采用情况：征求期满后15个工作日内，起草组将梳理反馈意见清单并在本栏目公示采纳情况与修订说明。',
      },
      {
        id: 'sol-2',
        title: '关于开展《中国高校校办企业国际化经营合规白皮书（2026版）》大纲征求行业建议的通知',
        deadline: '2026-08-31',
        status: '已结束',
        method: '书面或电子邮件反馈至规划部邮箱。',
        note: '结束后公布采用情况：已于2026年9月10日向行业公示《意见采纳说明表》，累计征集建议28条，采纳及部分采纳23条。',
      },
    ],
    messageInquiries: [
      {
        id: 'mi-1',
        user: '某双一流高校技术转移中心 李老师',
        date: '2026-09-18',
        question: '请问会员单位申请参与中欧国际技术转移走廊，是否有单独的资质门槛与申报时间节点？',
        reply: '您好！凡已完成当年度年审合格的会员单位均可随时申报。请在“会员单位与服务”栏目下载《国际合作对接意向表》，随附技术说明书发至服务部，我们将在3个工作日内与您联系对接。（办理时限：收件后3个工作日内初审答复）',
        replyDate: '2026-09-19',
      },
      {
        id: 'mi-2',
        user: '华东某大学科技园发展有限公司 王先生',
        date: '2026-09-12',
        question: '新发布的团体标准 T/CAUI 016-2025 如何申请纸质正式文本及贯标指导服务？',
        reply: '您好！该标准文本已在协会官网标准公开频道全面上线。若需申领带防伪标识的正式印刷版及贯标专家辅导，请致电标准化工作组（010-6891XXXX 转 802）。（办理时限：即时办结）',
        replyDate: '2026-09-13',
      },
    ],
  },
};
