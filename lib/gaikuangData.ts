export interface LeadershipMember {
  roleTitle: string;
  name: string;
  unit: string;
  desc: string;
}

export interface FoundingMember {
  unit: string;
  rep: string;
  role: string;
}

export interface OperatingRule {
  title: string;
  content: string;
}

export interface DepartmentItem {
  name: string;
  division: string;
  phone: string;
}

export interface MilestoneItem {
  time: string;
  title: string;
  desc: string;
}

export interface GaikuangData {
  // 1. 简介与基本法定信息
  bannerSubtitle: string;
  declaration: string;
  associationName: string;
  entityNature: string;
  approvalDocNo: string;
  foundedDate: string;
  purpose: string;
  businessScope: string;
  activityRegion: string;
  detailedIntro1: string;
  detailedIntro2: string;

  // 2. 批复公文与工作规则
  approvalDocTitle: string;
  approvalAuthority: string;
  approvalNature: string;
  approvalSummary: string;
  approvalDate: string;
  verifyCode: string;
  operatingRules: OperatingRule[];

  // 3. 组织架构与会员名录
  currentTerm: string;
  nextTermDate: string;
  leadership: LeadershipMember[];
  foundingMembers: FoundingMember[];

  // 4. 秘书处与办事机构
  secretariatUnit: string;
  secretariatDesc: string;
  secretariatAddress: string;
  secretariatPostalCode: string;
  secretariatWorkHours: string;
  departments: DepartmentItem[];

  // 5. 大事记
  milestones: MilestoneItem[];

  // 6. 联系方式
  contactOrgName: string;
  contactAffiliation: string;
  contactEnglish: string;
  contactAddress: string;
  contactPostalCode: string;
  contactTel: string;
  contactFax: string;
  contactEmail: string;
  contactWorkHours: string;
  contactTrafficTip: string;
}

export const defaultGaikuangData: GaikuangData = {
  // 1. 简介与基本法定信息
  bannerSubtitle: '中国高校校办产业协会国际合作与交流专业委员会（中国高校校办产业协会分支机构），立足国家教育科技产业创新战略，汇聚全国高校产业智慧，深化国际技术转移与产学研协同创新。',
  declaration: '中国高校校办产业协会国际合作与交流专业委员会（简称“国专委”）是经国家民政部门登记社会团体——中国高校校办产业协会批准设立的专业分支机构，国专委为中国高校校办产业协会分支机构。国专委严格在上级协会章程和业务统筹框架下规范运转。',
  associationName: '中国高校校办产业协会',
  entityNature: '中国高校校办产业协会分支机构',
  approvalDocNo: '校产协发〔2024〕18号',
  foundedDate: '2024年12月批复设立 / 2025年11月正式召开成立大会',
  purpose: '开放协同、汇聚智慧、产教融合、共赢发展。立足国家高水平对外开放战略，打造融通全球的高校科技成果转化、国际联合技术攻关与高层次产教智库协同公共服务平台。',
  businessScope: '国际科技交流与学术研讨、高校前沿科技成果跨国转移转化、跨境产学研用联合体搭建、高校产业涉外合规与国际标准制定、高校科技出海领军人才培养、高校产教融合高端智库咨询与行业白皮书编撰。',
  activityRegion: '全国范围及“一带一路”共建国家与全球主要创新协作区域。',
  detailedIntro1: '国专委是在全面深化新时代高等教育综合改革、推进高水平科技自立自强和教育强国建设的大背景下，由全国三十余所重点高校科技开发部、国家大学科技园产业集团及国际科技合作代表机构联合发起设立。依托中国高校校办产业协会的组织优势与全国高校优质科研产业集群，国专委积极担当国家高校产业出海“桥头堡”，搭建起畅通高校实验室与全球经贸产业链对接的权威纽带。',
  detailedIntro2: '聚焦国家战略需求与高校产学研用跨国协同痛点，国专委重点实施“高校校办产业卓越出海赋能行动”、“跨境产学研联合技术攻关计划”与“高校产业智库研究工程”，持续促进高校科技成果跨境合法合规流动与高水平转化，提升中国高等教育与校办科技产业的全球影响力。',

  // 2. 批复公文与工作规则
  approvalDocTitle: '《中国高校校办产业协会关于同意设立国际合作与交流专业委员会的批复》',
  approvalAuthority: '中国高校校办产业协会',
  approvalNature: '中国高校校办产业协会专业分支机构（非独立法人）',
  approvalSummary: '同意由全国三十余所重点高校产业集团共同设立国际合作与交流专业委员会，由协会统一协调监管，严格遵守国家社会团体与外事管理纪律。',
  approvalDate: '2024年12月18日',
  verifyCode: 'CAUI-AP-202418',
  operatingRules: [
    {
      title: '第一章 总则与分支机构规约',
      content: '国专委全称为“中国高校校办产业协会国际合作与交流专业委员会”，是中国高校校办产业协会下设专业分支机构，在协会章程统筹下开展涉外产教研合作与技术转移活动。',
    },
    {
      title: '第二章 领导体制与代表大会职权',
      content: '国专委设主任委员1名、副主任委员若干名、秘书长1名。首届理事会经会员代表大会民主选举产生，每届任期五年，届满按章程规范组织换届选举。',
    },
    {
      title: '第三章 国际交流合规与资产审计监督',
      content: '国专委严格遵守国家外事纪律与科研出海知识产权法律法规。经费收支全部纳入中国高校校办产业协会法定账户统一管理，接受年度专门审计监督并执行信息公开。',
    },
  ],

  // 3. 组织架构与会员名录
  currentTerm: '当前届次：第一届理事会（2025年11月 — 2030年11月）',
  nextTermDate: '2030年11月',
  leadership: [
    {
      roleTitle: '主任会员（主任委员）',
      name: '张敬文 教授',
      unit: '北京大学科技开发部 / 中国高校校办产业协会',
      desc: '两院院士，资深高校科技成果转化与产教协同专家，主持国专委全盘发展与学术战略决策。',
    },
    {
      roleTitle: '常务副主任会员',
      name: '陈振华 博士',
      unit: '清华大学科技开发部',
      desc: '分管高校前沿科技成果出海联合孵化与跨国产学研专项产业基金协同。',
    },
    {
      roleTitle: '副主任会员',
      name: '林晓明 教授',
      unit: '浙江大学工业技术转化研究院',
      desc: '分管“一带一路”技术转化协同网络与国际产业标准互认制订工作。',
    },
    {
      roleTitle: '秘书长（法定执行）',
      name: '王绍峰 研究员',
      unit: '中国高校校办产业协会',
      desc: '主持秘书处常设行政机构日常运转，统筹落实会员代表大会与理事会决议。',
    },
  ],
  foundingMembers: [
    { unit: '清华大学科技开发部', rep: '陆 勇 部长', role: '副主任委员单位' },
    { unit: '北京大学科技开发部', rep: '姚 蔚 处长', role: '主任委员单位' },
    { unit: '浙江大学工业技术转化研究院', rep: '沈 越 副院长', role: '副主任委员单位' },
    { unit: '上海交通大学先进产业技术研究院', rep: '肖 峰 院长', role: '副主任委员单位' },
    { unit: '华中科技大学产业集团', rep: '黄 伟 总裁', role: '副主任委员单位' },
    { unit: '哈尔滨工业大学资产投资经营公司', rep: '韩 健 副总裁', role: '副主任委员单位' },
    { unit: '西安交通大学国家大学科技园', rep: '程 刚 总经理', role: '常务理事单位' },
    { unit: '中国科学技术大学先进技术研究院', rep: '杜 凯 副院长', role: '常务理事单位' },
    { unit: '东南大学国家大学科技园', rep: '许 辉 总经理', role: '常务理事单位' },
    { unit: '同济创新创业控股有限公司', rep: '高 峰 董事长', role: '常务理事单位' },
    { unit: '天津大学内燃机研究所产业化中心', rep: '孟 昭 书记', role: '常务理事单位' },
    { unit: '华南理工大学科技成果转化中心', rep: '谢 敏 主任', role: '常务理事单位' },
    { unit: '中南大学科技园研发总部', rep: '范 敏 主任', role: '理事会员单位' },
    { unit: '重庆大学产业技术研究院', rep: '胡 斌 院长', role: '理事会员单位' },
    { unit: '大连理工大学技术转移中心', rep: '任 鹏 主任', role: '理事会员单位' },
    { unit: '电子科技大学资产经营有限公司', rep: '罗 志 董事长', role: '理事会员单位' },
  ],

  // 4. 秘书处与办事机构
  secretariatUnit: '中国高校校办产业协会',
  secretariatDesc: '秘书处为国专委常设日常执行管理机构，在理事会和秘书长统一领导下规范运转，承担协会赋予的日常联络、项目协调、综合服务等职责。',
  secretariatAddress: '北京市海淀区科技创新大厦 A座18层 国专委秘书处',
  secretariatPostalCode: '100084',
  secretariatWorkHours: '工作日 09:00 - 12:00, 13:30 - 18:00',
  departments: [
    {
      name: '综合事务协调部',
      division: '职责分工：负责日常行政统筹、理事会决议督办、财务合规审计、上级协会总会工作对接及综合档案管理。',
      phone: '(010) 6889-8800 转 801',
    },
    {
      name: '国际合作与交流部',
      division: '职责分工：负责跨国学术交流规划、涉外产学研项目对接、国际代表团出访考察、海外代表处常态化联络。',
      phone: 'global@industry-committee.org.cn',
    },
    {
      name: '产教融合与成果转化部',
      division: '职责分工：主导高校前沿专利海外推广、跨国技术转移枢纽运营、校企联合实验室建设及高校出海标准制修订。',
      phone: 'transfer@industry-committee.org.cn',
    },
    {
      name: '智库研究与出版部',
      division: '职责分工：承担高校产业出海白皮书编撰、重点课题研究专报、高水平学术交流峰会策划及官方出版物运营。',
      phone: '(010) 6889-8801 转 806',
    },
    {
      name: '会员联络与服务部',
      division: '职责分工：负责会员单位发展与资质初审、会籍常态管理、会员权益落地维护、公文防伪验真与咨询诉求响应。',
      phone: '(010) 6889-8801',
    },
    {
      name: '合规与法律服务部',
      division: '职责分工：为高校校企出海提供跨国知识产权保护评估、外事合规预警、反倾销合规辅助与涉外维权法律支持。',
      phone: 'legal@industry-committee.org.cn',
    },
  ],

  // 5. 大事记
  milestones: [
    {
      time: '2026年03月',
      title: '首期《高校校办产业国际协同卓越成果》征集启动',
      desc: '启动2026年度“高校校办产业国际协同卓越成果”评选，联合清华、北大等50余所高校编制产业出海智库白皮书。',
    },
    {
      time: '2025年11月',
      title: '国专委成立大会在京隆重召开',
      desc: '中国高校校办产业协会国际合作与交流专业委员会成立大会在京举行，选举产生第一届理事会与领导班子。',
    },
    {
      time: '2025年06月',
      title: '筹备组赴海外高校开展跨境转化调研',
      desc: '国专委筹备组赴欧洲及“一带一路”多国高校调研，就跨国技术转移互认与国际联合实验室达成合作备忘录。',
    },
    {
      time: '2024年12月',
      title: '协会正式批准设立国专委批复文件',
      desc: '中国高校校办产业协会理事会全票审议通过设立决议，正式下发校产协发〔2024〕18号批复文件。',
    },
    {
      time: '2024年08月',
      title: '全国重点高校科技园联合签署筹备倡议书',
      desc: '全国三十余所重点高校国家大学科技园与骨干校办企业联合签署倡议书，正式启动国专委筹备工作。',
    },
  ],

  // 6. 联系方式
  contactOrgName: '中国高校校办产业协会国际合作与交流专业委员会',
  contactAffiliation: '（中国高校校办产业协会分支机构）',
  contactEnglish: 'International Cooperation and Exchange Committee of the Chinese Association of University-run Industries',
  contactAddress: '北京市海淀区科技创新大厦 A座18层 国专委秘书处',
  contactPostalCode: '100084',
  contactTel: '(010) 6889-8800 / 6889-8801',
  contactFax: '(010) 6889-8802',
  contactEmail: 'secretariat@industry-committee.org.cn',
  contactWorkHours: '工作日 09:00 - 12:00, 13:30 - 18:00',
  contactTrafficTip: '轨道交通13号线/15号线至清华东路西口或五道口站，步行至科技创新大厦A座接待大厅，请持有效身份证件于前台访客登记处办理入厦手续。',
};
