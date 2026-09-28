"use client";

import React, { useState } from "react";
import Link from "next/link";

// 5 大主栏目定义
type TabType = "announcements" | "publicity" | "policies" | "interpretations" | "guidelines";

interface AnnouncementItem {
  id: string;
  category: "国际合作与交流" | "项目申报" | "活动报名";
  title: string;
  docNo: string;
  date: string;
  views: number;
  urgent?: boolean;
  issuer: string;
  summary: string;
  content: string[];
  attachments?: { name: string; size: string }[];
  deadline?: string;
}

interface PublicityItem {
  id: string;
  category: "评审结果" | "拟入选名单" | "征求意见稿";
  title: string;
  docNo: string;
  date: string;
  views: number;
  publicityPeriod: string;
  issuer: string;
  summary: string;
  content: string[];
  attachments?: { name: string; size: string }[];
  feedbackEmail?: string;
}

interface PolicyItem {
  id: string;
  category: "教育部" | "科技部" | "商务部/发改委";
  title: string;
  docNo: string; // 政策文号 (示例)
  authority: string; // 发布机关 (示例)
  date: string;
  views: number;
  summary: string;
  content: string[];
  relatedInterpId: string; // 关联的政策解读ID
  relatedInterpTitle: string;
  attachments?: { name: string; size: string }[];
}

interface InterpretationItem {
  id: string;
  category: "政策背景" | "核心要点" | "执行细则";
  title: string;
  date: string;
  views: number;
  author: string;
  // 核心要求：明确标注关联的政策文号与发布机关 (注明示例)
  sourcePolicyDocNo: string;
  sourcePolicyAuthority: string;
  relatedPolicyId: string; // 关联的政策法规ID
  relatedPolicyTitle: string;
  background: string;
  keyPoints: { title: string; desc: string }[];
  applicableScope: string;
  attachments?: { name: string; size: string }[];
}

interface GuidelineItem {
  id: string;
  category: "国际合作项目" | "科研成果转化" | "团体标准立项";
  title: string;
  code: string;
  date: string;
  views: number;
  issuer: string;
  summary: string;
  applicableRange: string;
  conditions: string[]; // 申报条件
  materials: string[]; // 材料清单
  schedule: string; // 申报流程与时间表
  attachments?: { name: string; size: string }[];
}

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState<TabType>("announcements");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  
  // 详情弹窗控制
  const [activeModalData, setActiveModalData] = useState<{
    type: TabType;
    data: any;
  } | null>(null);

  // 模拟下载成功提示
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const showDownloadNotice = (fileName: string) => {
    setDownloadToast(`已成功获取附件：《${fileName}》，即将为您开始下载。`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3500);
  };

  // 1. 通知公告模拟数据（严格遵循内容隔离：专委会对外发文，分为对外合作、项目申报、活动报名三类）
  const announcementsData: AnnouncementItem[] = [
    {
      id: "ann-1",
      category: "项目申报",
      title: "关于组织开展2026年度“高校校办产业科技创新与国际协同”重点攻关课题申报的通知",
      docNo: "中高产国专发〔2026〕18号",
      date: "2026-09-22",
      views: 2450,
      urgent: true,
      issuer: "中国高校校办产业协会国际合作与交流专业委员会秘书处",
      deadline: "2026-10-31 17:00 截止",
      summary: "为加快推动高校前沿科技成果跨境产业化落地，专委会现启动2026年度国际协同重点攻关课题申报工作，重点扶持智能智造、绿色新材料及跨境产教融合示范平台。",
      content: [
        "各会员单位、各高等院校科技产业管理部门、国家大学科技园：",
        "为贯彻落实教育、科技、人才一体化发展战略，充分发挥高校校办产业连接学术前沿与产业市场的纽带作用，经中国高校校办产业协会国际合作与交流专业委员会研究决定，正式启动2026年度“高校校办产业科技创新与国际协同”重点攻关课题申报工作。",
        "本次申报重点支持具有明确国际技术合作背景、能够解决产业链关键核心环节卡脖子问题、具备三年内规模化产业化前景的优质项目。资助额度分为重点项目（每项50-80万元）与面上培育项目（每项20-30万元）。",
        "请各有关单位严格按照《申报指南》要求组织本单位申报，申报材料请于2026年10月31日17:00前加盖公章后报送至专委会秘书处，逾期不予受理。",
      ],
      attachments: [
        { name: "2026年度重点攻关课题申报书与填报说明.docx", size: "156 KB" },
        { name: "课题论证活页与形式审查自查表.pdf", size: "420 KB" },
        { name: "高校校办产业专项科研资助经费管理办法.pdf", size: "890 KB" },
      ],
    },
    {
      id: "ann-2",
      category: "国际合作与交流",
      title: "关于征集2026-2027年度“中欧高校校办产业产学研国际技术转移与转化”重点合作意向项目的通知",
      docNo: "中高产国专发〔2026〕15号",
      date: "2026-09-18",
      views: 1890,
      issuer: "国际合作与交流专业委员会对外合作处",
      deadline: "2026-11-15 截止",
      summary: "面向全国高校及领军校办企业，公开征集一批具备自主知识产权、成熟度高、市场潜力大的先进科技成果，统一组织对接欧洲重点高校产业园及跨国联合实验室。",
      content: [
        "各有关高校资产经营公司、大学科技园、跨国产教协同企业：",
        "为深化我国高校校办产业与欧洲高水平学术机构及产业集群的技术合作，建立常态化海外技术孵化协同机制，专委会正联合德国、法国、瑞士等国高校产业创新中心搭建双向技术转移转化走廊。",
        "本次重点征集领域：工业自动化与高端数控、新能源与储能技术、生物医药与现代精准医疗、循环经济与低碳工业。入选项目将收录入《2026中欧高校先进技术转移目录》，并在11月举办的中欧创新技术路演专场进行重点推介。",
        "意向单位请认真填写附件表格并附技术就绪度（TRL）评估材料，于2026年11月15日前反馈至指定邮箱。",
      ],
      attachments: [
        { name: "中欧国际技术转移转化合作意向登记表.docx", size: "118 KB" },
        { name: "中欧高校产业技术双向推介合作框架方案.pdf", size: "650 KB" },
      ],
    },
    {
      id: "ann-3",
      category: "活动报名",
      title: "关于举办第三届全国高校校办产业国际合规管理与跨国知识产权运营高级研修班的报名通知",
      docNo: "中高产国专教〔2026〕09号",
      date: "2026-09-15",
      views: 3120,
      urgent: false,
      issuer: "国际合作与交流专业委员会专业人才发展部",
      deadline: "2026-10-08 18:00 截止报名",
      summary: "定于2026年10月中旬在上海举行，邀请国家知识产权局专家、涉外资深法务专家及顶尖校办上市企业高管，深入解析海外专利布局合规与涉外技术转让风险防控。",
      content: [
        "各高校校办产业高管、科技开发部负责人、总法律顾问及技术转移经纪人：",
        "在全球供应链与科技竞争格局深刻演变的背景下，高校校办产业“走出去”过程中面临日益严格的海外知识产权风控与出口管制合规要求。为此，专委会决定举办第三届高级研修班。",
        "研修内容涵盖：1. 高校海外高价值专利PCT布局策略；2. 跨国并购中无形资产尽职调查实务；3. 美欧涉外知识产权侵权诉讼应对与防范；4. 高校职务科技成果涉外赋权合规流程等。",
        "培训为期3天，考核合格者颁发《全国高校涉外技术转移合规管理专业人才培训结业证书》。因名额有限（限额80人），请有意参会者尽快提交报名回执。",
      ],
      attachments: [
        { name: "第三届高级研修班招生简章与日程安排.pdf", size: "780 KB" },
        { name: "参训人员报名回执表及酒店预定单.docx", size: "84 KB" },
      ],
    },
    {
      id: "ann-4",
      category: "国际合作与交流",
      title: "关于组织高校校办企业代表团赴东盟国家开展高新技术产业出海与经贸对接考察的报名通告",
      docNo: "中高产国专合〔2026〕12号",
      date: "2026-09-08",
      views: 1670,
      issuer: "国际合作与交流专业委员会国际联络处",
      deadline: "2026-09-30 截止报名",
      summary: "专委会拟于2026年11月上旬组织高校校属企业赴新加坡、马来西亚、印度尼西亚开展产业考察，参加中国-东盟高等教育科技创新产业博览会。",
      content: [
        "各有关高校产业实体及会员单位：",
        "为抢抓《区域全面经济伙伴关系协定》（RCEP）生效带来的区域经贸与产业合作新机遇，助力我国高校高新技术产品与装备制造更好服务“一带一路”共建国家，专委会特组织本次经贸产业出海交流团。",
        "出访期间将举办“中国高校优势技术与东盟本地产业对接洽谈会”，实地走访新加坡国立大学企业孵化器、马来西亚高科技园区等标杆项目，并与当地政企代表举行务实闭门商务磋商。",
      ],
      attachments: [
        { name: "赴东盟国家高新技术经贸考察团出访日程与费用明细.pdf", size: "530 KB" },
        { name: "出访人员政审与报名信息采集表.xlsx", size: "72 KB" },
      ],
    },
    {
      id: "ann-5",
      category: "项目申报",
      title: "关于开展2026年第二批“高校国际化大学科技园协同创新示范基地”申报培育的通知",
      docNo: "中高产国专发〔2026〕11号",
      date: "2026-09-03",
      views: 2890,
      issuer: "国际合作与交流专业委员会规划评审处",
      deadline: "2026-09-28 截止",
      summary: "遴选具备良好涉外技术合作载体与跨境孵化环境的国家大学科技园，授予示范基地资格，并优先导入国际智库与海外引智配套资源。",
      content: [
        "各国家大学科技园、高校创新创业示范基地：",
        "根据专委会年度工作规划，现组织第二批示范基地申报工作。重点考核：园区涉外孵化载体面积、入驻跨国研发团队数量、近三年国际技术转移成交总额、国际化双创导师队伍配备情况等核心量化指标。",
        "获评基地将在专委会官网及年度行业白皮书中专版推介，享受海外巡展优先展位支持及投融资对接专场服务。",
      ],
      attachments: [
        { name: "示范基地申报评选指标体系与评分细则.pdf", size: "460 KB" },
        { name: "示范基地申报书模板及佐证材料清单.docx", size: "188 KB" },
      ],
    },
  ];

  // 2. 信息公示模拟数据（评审结果、拟入选名单、征求意见稿等需公示事项）
  const publicityData: PublicityItem[] = [
    {
      id: "pub-1",
      category: "评审结果",
      title: "2026年度“高校校办产业科技创新与国际协同”卓越案例评选入选名单公示",
      docNo: "中高产国专示〔2026〕05号",
      date: "2026-09-21",
      views: 4120,
      publicityPeriod: "2026年9月21日 至 2026年9月27日 (5个工作日)",
      issuer: "国际合作与交流专业委员会评审监督委员会",
      feedbackEmail: "jiandu@gyzhuanwei-edu.cn",
      summary: "经各高校推荐申报、同行专家双盲评审及评选专家委员会现场终审，共遴选出35项拟入选卓越示范案例，现将名单向社会公示。",
      content: [
        "按照公开、公平、公正的评审工作原则，专委会组织开展了2026年度高校校办产业科技创新与国际协同卓越案例征集评选活动。",
        "经组织专家材料初审、技术成果查新、现场答辩及监督委员会合规审查，最终产生35项拟入选卓越案例（含成果出海示范工程12项、跨国产学研联合体8项、校企国际化标准突破15项）。",
        "公示期内，任何单位和个人如对公示名单及相关事实持有异议，请以书面形式并实名向专委会评审监督委员会提出，并提供必要的可查证证明材料。匿名异议不予受理。",
      ],
      attachments: [
        { name: "2026年度卓越案例拟入选单位及项目详单（共35项）.pdf", size: "320 KB" },
        { name: "异议申请表及复查提交材料规范.docx", size: "58 KB" },
      ],
    },
    {
      id: "pub-2",
      category: "拟入选名单",
      title: "中国高校校办产业协会国际合作与交流专业委员会2026年第二批拟吸纳会员单位名单公示",
      docNo: "中高产国专示〔2026〕04号",
      date: "2026-09-16",
      views: 3240,
      publicityPeriod: "2026年9月16日 至 2026年9月22日",
      issuer: "国际合作与交流专业委员会组织联络部",
      feedbackEmail: "huiyuan@gyzhuanwei-edu.cn",
      summary: "经秘书处初核、专委会常务理事会审议表决，拟吸纳北京理工大学产业技术研究院等16家高校科研转化实体与骨干校办企业为新会员单位。",
      content: [
        "根据《中国高校校办产业协会章程》及《国际合作与交流专业委员会工作规则》关于会员发展的相关规定，专委会认真开展了2026年第二批入会申请审核工作。",
        "经资质初审、信用核查并经专委会常务理事会无记名通讯投票表决，拟吸纳16家单位加入本专委会。名单包含高校直属资产经营公司6家、国家级大学科技园4家、高校控股上市企业3家、涉外产学研专业服务机构3家。",
        "现对拟吸纳名单予以公示。公示期无异议后，将由秘书处统一颁发会员单位铭牌与证书。",
      ],
      attachments: [
        { name: "拟吸纳会员单位名录与所在高校推荐说明.pdf", size: "260 KB" },
      ],
    },
    {
      id: "pub-3",
      category: "征求意见稿",
      title: "《高校跨国产学研协同合作基地建设评价规范（征求意见稿）》团体标准公开征求意见公告",
      docNo: "中高产国专标〔2026〕03号",
      date: "2026-09-12",
      views: 2780,
      publicityPeriod: "2026年9月12日 至 2026年10月12日 (30天)",
      issuer: "国际合作与交流专业委员会标准化技术委员会",
      feedbackEmail: "standard@gyzhuanwei-edu.cn",
      summary: "由专委会牵头组织清华大学科技开发部、浙江大学工研院等骨干单位起草的团体标准已完成征求意见稿编制，现向社会公开征求修改意见。",
      content: [
        "为规范和引导我国高校建设高水平、国际化产学研协同基地，促进涉外成果孵化载体规范化运行，中国高校校办产业协会国际合作与交流专业委员会正式立项并编制了《高校跨国产学研协同合作基地建设评价规范》团体标准。",
        "目前标准起草工作组已完成征求意见稿及编制说明，现依法依规面向社会公开征求意见。欢迎广大高校、科研机构、校办企业及标准化专家提出宝贵修改意见和建议。",
        "反馈意见请认真填写《征求意见反馈表》，以电子邮件形式于2026年10月12日之前发送至标准化委员会工作邮箱。",
      ],
      attachments: [
        { name: "《高校跨国产学研协同合作基地建设评价规范（征求意见稿）》.pdf", size: "1.15 MB" },
        { name: "团体标准编制说明（背景、依据与关键指标论证）.pdf", size: "680 KB" },
        { name: "征求意见反馈表.docx", size: "52 KB" },
      ],
    },
    {
      id: "pub-4",
      category: "拟入选名单",
      title: "2026年度“高校科技成果出海领航计划”首批培育入库重点成果名单公示",
      docNo: "中高产国专示〔2026〕03号",
      date: "2026-09-02",
      views: 3960,
      publicityPeriod: "2026年9月2日 至 2026年9月8日",
      issuer: "国际合作与交流专业委员会成果转化部",
      feedbackEmail: "chengguo@gyzhuanwei-edu.cn",
      summary: "经遴选审查，首批入选成果涵盖智能装备、先进光电、新能源储能及绿色生物制造等领域共28项具有高价值专利组合的重点成果。",
      content: [
        "为破解高校科技成果涉外推介难度大、海外合规门槛高的痛点，专委会发起“出海领航计划”，组织国际技术经纪人与跨国知识产权法律顾问团队，为入库成果提供涉外专利布局、跨境估值评估与商务撮合服务。",
        "经专委会技术专家委员会多轮筛选，评定出首批28项入库培育成果，现予以公示。",
      ],
      attachments: [
        { name: "出海领航计划首批入库重点成果公示清册.pdf", size: "480 KB" },
      ],
    },
  ];

  // 3. 政策法规模拟数据（教育部、科技部、商务部等涉外与成果转化政策转载）
  // 必须与 政策解读 具备一一对应的“双向关联”
  const policiesData: PolicyItem[] = [
    {
      id: "pol-1",
      category: "教育部",
      title: "转发教育部、科学技术部、财政部《关于进一步深化高校科技成果转化机制改革 推进高质量校地校企协同的指导意见》",
      docNo: "教技〔2025〕6号 (示例)",
      authority: "中华人民共和国教育部、科学技术部、财政部 (示例)",
      date: "2025-11-20",
      views: 5820,
      summary: "明确赋予科研人员职务科技成果所有权或长期使用权改革规范，创新科技资产考核容错机制，支持高校设立离岸国际技术转移转化中心。",
      relatedInterpId: "int-1",
      relatedInterpTitle: "深度解读教技〔2025〕6号：从“职务赋权”到“跨境孵化”，高校科技转化迎来五大制度突破",
      content: [
        "教育部、科学技术部、财政部联合印发《关于进一步深化高校科技成果转化机制改革 推进高质量校地校企协同的指导意见》（教技〔2025〕6号 (示例)）。",
        "意见提出：一是全面深化职务科技成果权属改革。鼓励具备条件的高校建立科研成果赋权直通车机制，探索“赋权+股权激励”综合运用新路径。",
        "二是完善高校国有科技资产管理评价体系。对科技成果转让、作价入股过程中的正常商业投资损失实行合规尽职免责，不再简单套用经营性国有资产保值增值考核标准。",
        "三是健全跨境协同转化通道。支持高校与国家级高新区、自由贸易试验区合作，在境外创新资源密集区设立联合离岸研发孵化机构，打通涉外产学研合规结汇与知识产权互认机制。",
      ],
      attachments: [
        { name: "教技〔2025〕6号文件全文.pdf", size: "1.42 MB" },
      ],
    },
    {
      id: "pol-2",
      category: "科技部",
      title: "转发科学技术部、国家知识产权局《关于推动高价值专利海外布局与高校涉外知识产权合规风控的通知》",
      docNo: "国科发区〔2025〕42号 (示例)",
      authority: "中华人民共和国科学技术部、国家知识产权局 (示例)",
      date: "2025-08-16",
      views: 4610,
      summary: "加大高校关键核心技术PCT国际专利申请扶持力度，建立涉外知识产权纠纷应对指导体系，规范高校涉外技术转让尽职调查与安全审查。",
      relatedInterpId: "int-2",
      relatedInterpTitle: "权威解读国科发区〔2025〕42号：高校校办企业“扬帆出海”如何织密知识产权安全网？",
      content: [
        "科学技术部、国家知识产权局联合下发《关于推动高价值专利海外布局与高校涉外知识产权合规风控的通知》（国科发区〔2025〕42号 (示例)）。",
        "通知指出：高校作为国家战略科技力量的重要策源地，必须高度重视国际专利高质量申请与海外维权护航工作。",
        "重点任务：1. 设立高校重大科研攻关项目海外专利储备池，优化PCT国际申请资助机制；2. 建设高校涉外知识产权风险预警平台，针对欧美主要贸易伙伴专利纠纷开展常态化风险监测；3. 强化高校涉外技术许可与转让安全评估，防范关键前沿核心技术非法流失与商业秘密侵权。",
      ],
      attachments: [
        { name: "国科发区〔2025〕42号文件全文.pdf", size: "980 KB" },
      ],
    },
    {
      id: "pol-3",
      category: "商务部/发改委",
      title: "转发商务部、工业和信息化部等六部门《关于支持国家级经济技术开发区与高校共建国际化产教融合共同体的若干举措》",
      docNo: "商资发〔2025〕19号 (示例)",
      authority: "中华人民共和国商务部、工业和信息化部等六部门 (示例)",
      date: "2025-05-18",
      views: 3980,
      summary: "支持国家级经开区携手高水平大学建设“离岸研发+在地孵化”产教综合体，给予外资利用、跨境投融资及高端外国专家引育综合便利。",
      relatedInterpId: "int-3",
      relatedInterpTitle: "要点解读商资发〔2025〕19号：六部门联手拆壁垒，高校产业与国家级经开区如何深度绑定？",
      content: [
        "商务部、工业和信息化部等六部门联合发布《关于支持国家级经济技术开发区与高校共建国际化产教融合共同体的若干举措》（商资发〔2025〕19号 (示例)）。",
        "政策旨在发挥国家级经开区高水平对外开放平台优势，加速高校科研“国家队”科技成果在主导产业链落地转化为现代生产力。",
        "具体举措包括：允许经开区与高校联合设立具有独立法人的跨国产业概念验证中心；给予跨国成果转化项目便利外汇资金结算与通关支持；鼓励跨国公司在高校科技园区共建联合技术转移实验室等。",
      ],
      attachments: [
        { name: "商资发〔2025〕19号政策全文.pdf", size: "860 KB" },
      ],
    },
    {
      id: "pol-4",
      category: "商务部/发改委",
      title: "转发国家发展改革委、教育部《关于印发〈高校资产管理与科技成果投资入股全流程操作合规指引〉的通知》",
      docNo: "发改高技〔2024〕118号 (示例)",
      authority: "国家发展和改革委员会、中华人民共和国教育部 (示例)",
      date: "2024-12-10",
      views: 5120,
      summary: "全面规范高校科技成果作价入股、无形资产评估、国有股权转让以及校办企业股权激励操作规程，明确容错清单与审计准则。",
      relatedInterpId: "int-4",
      relatedInterpTitle: "一图读懂发改高技〔2024〕118号：高校成果作价入股与股权激励合规“避坑”实务指南",
      content: [
        "国家发展改革委、教育部联合发布《高校资产管理与科技成果投资入股全流程操作合规指引》（发改高技〔2024〕118号 (示例)）。",
        "指引系统梳理了高校自科技成果披露、估值核定、投资入股、股权持有到最终转让退出的五大核心环节合规要点。",
        "突出亮点是明确了国有无形资产与实物资产的管理差异，对于通过协议定价且履行公示程序的高校科技成果作价入股，可不再进行强制性资产评估备案，极大缩短决策流转周期。",
      ],
      attachments: [
        { name: "发改高技〔2024〕118号操作指引全文.pdf", size: "1.75 MB" },
      ],
    },
  ];

  // 4. 政策解读模拟数据（解读背景、要点、适用范围）
  // 必须显眼展示关联政策文号与发布机关（注明示例），并提供“查看政策原文”入口
  const interpretationsData: InterpretationItem[] = [
    {
      id: "int-1",
      category: "政策背景",
      title: "深度解读教技〔2025〕6号：从“职务赋权”到“跨境孵化”，高校科技转化迎来五大制度突破",
      date: "2025-11-25",
      views: 6420,
      author: "专委会产教智库专家组 · 成果转化特聘研究员",
      sourcePolicyDocNo: "教技〔2025〕6号 (示例)",
      sourcePolicyAuthority: "中华人民共和国教育部、科学技术部、财政部 (示例)",
      relatedPolicyId: "pol-1",
      relatedPolicyTitle: "转发教育部、科学技术部、财政部《关于进一步深化高校科技成果转化机制改革 推进高质量校地校企协同的指导意见》",
      background: "近年来我国高校发明专利授权量连年攀升，但“沉睡专利”转化难、科研人员“不愿转不敢转”以及涉外合规机制不畅成为制约高校产业高水平国际化的制度堵点。三部门联手出台本指导意见，直击成果转化链条痛点。",
      keyPoints: [
        {
          title: "权属改革破冰：职务成果所有权真正向科研人员让渡",
          desc: "首次在国家层面将“先赋权后转化”规范化，赋予科研人员不低于70%的科技成果所有权份额或不少于10年的长期独占使用权，扫清职务发明权属模糊地带。",
        },
        {
          title: "考核机制松绑：确立容错尽职免责红线",
          desc: "明确区分“正常商业投资失败”与“违法违纪失职”，对严格履行内部民主决策和公开公示程序的科技作价入股，免予国有资产流失问责。",
        },
        {
          title: "跨境协同升级：打造离岸技术转移绿色通道",
          desc: "鼓励高校校办产业依托海外合作网络搭建离岸概念验证中心，在资金跨境流动、境外技术出资入股方面享受简化外汇登记手续。",
        },
        {
          title: "专业队伍支撑：设立技术经理人直通评聘通道",
          desc: "高校可设立专职技术转移转化岗位，将技术合同成交额及产业落地成效直接纳入高级职称评审标准。",
        },
      ],
      applicableScope: "全国普通高等学校、各省市高校产业管理委员会、国家大学科技园、高校全资及控股资产经营公司、跨国技术转移服务机构。",
      attachments: [
        { name: "教技〔2025〕6号核心要点梳理图解版.pdf", size: "2.1 MB" },
      ],
    },
    {
      id: "int-2",
      category: "核心要点",
      title: "权威解读国科发区〔2025〕42号：高校校办企业“扬帆出海”如何织密知识产权安全网？",
      date: "2025-08-20",
      views: 4890,
      author: "专委会涉外法务与知识产权委员会专家组",
      sourcePolicyDocNo: "国科发区〔2025〕42号 (示例)",
      sourcePolicyAuthority: "中华人民共和国科学技术部、国家知识产权局 (示例)",
      relatedPolicyId: "pol-2",
      relatedPolicyTitle: "转发科学技术部、国家知识产权局《关于推动高价值专利海外布局与高校涉外知识产权合规风控的通知》",
      background: "伴随高校校办高科技实体出海步伐加快，国际技术壁垒与跨国知识产权纠纷频发，部分高校专利在海外缺乏有效布局保护，甚至遭遇恶意诉讼与技术封锁。两部门发文旨在建立全方位涉外防范体系。",
      keyPoints: [
        {
          title: "前瞻性海外专利布局支持",
          desc: "设立专项资金支持重大科技专项成果开展PCT国际专利申请，优先推荐具有核心竞争力的战略技术进入关键目标国专利池。",
        },
        {
          title: "跨境并购与技术许可全流程尽调",
          desc: "要求校办实体在涉及境外合作时建立强制性IP尽调制度，审查目标技术权属完整性及潜在的出口管制法律风险。",
        },
        {
          title: "常态化海外维权与应急响应体系",
          desc: "组建全国高校涉外知识产权纠纷应对指导专家库，为面临跨国纠纷的校企提供低成本、高效率的应急法律维权援助。",
        },
      ],
      applicableScope: "全国高校科研处/成果转化处、高校高新技术校办上市企业、大学科技园外向型孵化企业及涉外专利代理机构。",
      attachments: [
        { name: "高校涉外专利合规排查自检清单（30条）.pdf", size: "540 KB" },
      ],
    },
    {
      id: "int-3",
      category: "执行细则",
      title: "要点解读商资发〔2025〕19号：六部门联手拆壁垒，高校产业与国家级经开区如何深度绑定？",
      date: "2025-05-24",
      views: 4150,
      author: "专委会区域产教协同推进中心",
      sourcePolicyDocNo: "商资发〔2025〕19号 (示例)",
      sourcePolicyAuthority: "中华人民共和国商务部、工业和信息化部等六部门 (示例)",
      relatedPolicyId: "pol-3",
      relatedPolicyTitle: "转发商务部、工业和信息化部等六部门《关于支持国家级经济技术开发区与高校共建国际化产教融合共同体的若干举措》",
      background: "国家级经开区具有产业集聚度高、对外开放早的优势，高校则具备科研原始创新强项。以往“两张皮”现象使科研与落地脱节，六部门通过政策集成打通要素双向流动渠道。",
      keyPoints: [
        {
          title: "创新载体共建：国家级经开区设立概念验证离岸特区",
          desc: "鼓励经开区管委会为高校提供“零租金”高标准研发厂房与共享中试车间，支持高校跨学科团队带着专利直接入驻落地。",
        },
        {
          title: "外资与科技金融协同借力",
          desc: "拓宽校企吸引国际战略风险投资准入通道，支持具备成长潜力的校办科技项目利用境外低成本绿色金融与自贸创新资金。",
        },
        {
          title: "国际技术专家工作便利保障",
          desc: "针对高校经开区共同体引入的海外高层次工程技术人才，推行外国人工作许可与居留签证一窗式便利办理机制。",
        },
      ],
      applicableScope: "各国家级经济技术开发区管委会、各高校科技开发部、产业投资集团及产学研联合体成员单位。",
      attachments: [
        { name: "高校-经开区产教共同体申报共建指引.pdf", size: "720 KB" },
      ],
    },
    {
      id: "int-4",
      category: "执行细则",
      title: "一图读懂发改高技〔2024〕118号：高校成果作价入股与股权激励合规“避坑”实务指南",
      date: "2024-12-16",
      views: 5690,
      author: "专委会法律与国有资产管理专业委员会",
      sourcePolicyDocNo: "发改高技〔2024〕118号 (示例)",
      sourcePolicyAuthority: "国家发展和改革委员会、中华人民共和国教育部 (示例)",
      relatedPolicyId: "pol-4",
      relatedPolicyTitle: "转发国家发展改革委、教育部《关于印发〈高校资产管理与科技成果投资入股全流程操作合规指引〉的通知》",
      background: "长期以来高校资产管理部门对科技成果投资入股存在“手续繁琐、流程冗长、责任边界不明”的痛点，该合规指引为全国高校提供了极具操作性的标准化路线图。",
      keyPoints: [
        {
          title: "协议定价与公示免评机制",
          desc: "成果拟作价入股的，经高校内部决策及在校内公示满15个工作日无异议的，可以不进行第三方中介评估，直接由双方协商确定价值。",
        },
        {
          title: "股权结构设计与管理层激励",
          desc: "明确了科技人员持有股权在分红、转让时的纳税递延政策，支持骨干科研人员通过有限合伙企业（持股平台）持有企业股权。",
        },
        {
          title: "规范关联交易与利益冲突防范",
          desc: "建立科研人员兼职创业与科技成果转化的信息申报与利益回避制度，既鼓励成果转化，又守住廉洁合规底线。",
        },
      ],
      applicableScope: "各高等院校资产管理处、高校控股投资公司、大学科技园种子基金及科技创新团队。",
      attachments: [
        { name: "高校科技成果作价入股标准合同模板（含股权激励条款）.docx", size: "230 KB" },
      ],
    },
  ];

  // 5. 申报指南模拟数据（各类项目、活动、标准立项的申报条件与材料清单）
  const guidelinesData: GuidelineItem[] = [
    {
      id: "gui-1",
      category: "国际合作项目",
      title: "2026年度“高校校办产业国际协同重大专项科研基金”立项申报指南",
      code: "GDL-2026-SP01",
      date: "2026-09-20",
      views: 3840,
      issuer: "国际合作与交流专业委员会科研规划部",
      summary: "重点支持高校与海外高水平科研机构、跨国行业领军企业联合实施的产业化攻关项目，支持经费最高达80万元/项。",
      applicableRange: "专委会理事及以上单位、教育部及工信部直属重点高校校办产业实体。",
      conditions: [
        "1. 申报单位须为专委会正式注册会员单位或“双一流”建设高校校属产业法人实体；",
        "2. 课题需具备明确的国际技术转移或跨境联合研发落地合作方案，已与海外知名高校或研发机构签署具有法律效力的合作备忘录或研发合同；",
        "3. 课题负责人须具有正高级专业技术职称，近三年内主持过国家级科技计划项目或主导过重大国际技术成果转化落地案例；",
        "4. 产学研配套自筹资金与专委会资助资金比例不得低于 2:1，且自筹资金已到位。",
      ],
      materials: [
        "1. 《高校国际协同重大专项科研基金立项申请书》（加盖高校科研处及资产公司公章，纸质版一式三份及完整电子版）；",
        "2. 境外合作方联合研发合作协议复印件及中文翻译公证件；",
        "3. 拟转化科技成果的自主知识产权权属证明（发明专利证书、PCT受理通知书及权威查新报告）；",
        "4. 申报单位近两年经会计师事务所审计的财务报告及资金配套承诺书；",
        "5. 课题组核心科研人员与涉外商务团队资历及保密审查审批表。",
      ],
      schedule: "每年9月启动申报 -> 10月31日截止提交材料 -> 11月中旬专家组盲审与现场答辩 -> 11月下旬公示立项名单并签订任务合同书。",
      attachments: [
        { name: "2026重大专项立项申请书与论证模板.docx", size: "210 KB" },
        { name: "形式审查对照表及预算编制规范.pdf", size: "750 KB" },
      ],
    },
    {
      id: "gui-2",
      category: "科研成果转化",
      title: "高校校办产业国际化技术转移转化“卓越示范基地”评选申报指南",
      code: "GDL-2026-BD02",
      date: "2026-09-14",
      views: 2950,
      issuer: "国际合作与交流专业委员会示范工程评审组",
      summary: "遴选培育在涉外科技孵化、国际技术引进、跨国科技创新合作方面具备示范标杆作用的高校大学科技园与校办产业示范区。",
      applicableRange: "国家大学科技园、高校产教融合高新技术开发区、国际科技合作示范园区。",
      conditions: [
        "1. 基地具有独立的法人资格和完善的管理运营实体，持续规范运营时间在3年以上；",
        "2. 拥有国际化技术转移专业服务团队不少于5人，且持有国际注册技术转移经理人（RTTP）或中级以上技术经纪人资格者不少于2人；",
        "3. 近两年内成功促成跨国产学研转化落地或海外高新技术引进孵化项目不少于3项，实际技术合同成交额累计不低于1500万元；",
        "4. 具备健全的涉外知识产权保护制度、海外专家服务接待载体及外汇跨境结算支持网络。",
      ],
      materials: [
        "1. 《卓越示范基地立项申报书及自评报告》；",
        "2. 运营团队成员社保证明及相关专业资格证书复印件；",
        "3. 近两年国际技术转移成功落地合同、资金往来凭证及海关/外汇凭证复印件；",
        "4. 基地涉外合规管理、保密机制及孵化服务规章制度汇编；",
        "5. 所在地地方科技主管部门或高校党政联席会议给予基地建设支持的正式批复文件。",
      ],
      schedule: "常年受理申报与辅导，每年分两批次集中组织专家实地核查与评审（分别在6月与11月）。",
      attachments: [
        { name: "卓越示范基地申报指引与评分标准明细.pdf", size: "580 KB" },
        { name: "示范基地申报表及自评表模板.docx", size: "165 KB" },
      ],
    },
    {
      id: "gui-3",
      category: "团体标准立项",
      title: "高校校办产业协同领域“中国高校校办产业协会团体标准”立项申报指南",
      code: "GDL-2026-ST03",
      date: "2026-09-06",
      views: 3310,
      issuer: "国际合作与交流专业委员会标准化技术工作组",
      summary: "鼓励高校校企牵头或联合制定校办产业跨国技术规范、涉外知识产权估值、高校产教融合评价等行业高水平团体标准。",
      applicableRange: "全国高等院校、科研机构、领军校办企业、标准化专业研究机构。",
      conditions: [
        "1. 申报牵头单位具备独立法人资格，在申报标准涵盖的专业技术领域拥有领先的研发实力与行业美誉度；",
        "2. 拟立项标准符合国家产业政策导向与国际标准协调机制，在现有国家标准、行业标准中尚属空白，或技术指标明显严于现行标准；",
        "3. 标准起草联合团队应由不少于3家知名高校科研团队和2家以上产业链头部骨干企业共同组成；",
        "4. 牵头单位需承诺保障标准调研、起草、试验验证、审查与宣贯等阶段所需编制经费自筹到位。",
      ],
      materials: [
        "1. 《中国高校校办产业协会团体标准立项申请书》（加盖牵头单位公章，附全套电子版）；",
        "2. 标准草案初稿及详细编制大纲（包含适用范围、主要技术内容、与国际对标标准的比对分析）；",
        "3. 标准立项科技查新及现有相关标准比对报告；",
        "4. 联合起草单位参与意向确认函；",
        "5. 标准编制工作组专家名单、技术背景简介及详细工作进度时间表。",
      ],
      schedule: "每年9月至11月集中受理申报 -> 12月组织专委会标准化委员会专家答辩会 -> 获批后下达立项计划，编制周期一般不超过12个月。",
      attachments: [
        { name: "团体标准立项申请表及编制大纲规范.docx", size: "145 KB" },
        { name: "专委会团体标准制修订工作细则及管理规定.pdf", size: "890 KB" },
      ],
    },
    {
      id: "gui-4",
      category: "国际合作项目",
      title: "高校青年科研学者与工程技术领军人才“全球科技产业研修访学计划”申报指南",
      code: "GDL-2026-FE04",
      date: "2026-08-28",
      views: 2680,
      issuer: "国际合作与交流专业委员会国际联络与人才部",
      summary: "资助高校优秀青年教师及校办骨干企业高工赴海外顶尖科研机构、全球科技成果转化中心开展为期3-6个月的深度产业研修访学。",
      applicableRange: "全国重点高校校属企业技术带头人、高校青年科研骨干、大学科技园孵化导师。",
      conditions: [
        "1. 年龄原则上不超过45周岁，具有博士学位或副高级以上专业技术职称；",
        "2. 近5年内作为主要成员参与过国家重大科技任务或主持过关键核心技术向校办企业产业化的落地转化；",
        "3. 已获得海外知名大学、国家级实验室或跨国研发总部出具的正式研修访学邀请函；",
        "4. 承诺在访学研修期满归国后，继续在高校校办产业系统工作不少于3年。",
      ],
      materials: [
        "1. 《全球科技产业研修访学计划申报表》；",
        "2. 所在高校人事处及校办产业主管部门出具的正式推荐公函及政审合格意见；",
        "3. 境外接收单位正式邀请函（明确研修时间、科研指导导师及课题方向）及中文对照说明；",
        "4. 个人代表性论文、专利授权、产业化成果经济效益证明材料；",
        "5. 访学期间详细工作计划及归国后产业化落地路线图。",
      ],
      schedule: "每年10月集中组织一次申报，11月专家综合评审，次年春季派出。",
      attachments: [
        { name: "研修访学计划申报书及个人简历表.docx", size: "135 KB" },
      ],
    },
  ];

  // 快捷双向关联跳转函数
  const jumpFromPolicyToInterp = (interpId: string) => {
    setActiveModalData(null);
    setActiveTab("interpretations");
    setSelectedCategory("全部");
    setSearchQuery("");
    // 自动打开对应解读的详情弹窗
    const target = interpretationsData.find((item) => item.id === interpId);
    if (target) {
      setTimeout(() => {
        setActiveModalData({ type: "interpretations", data: target });
      }, 100);
    }
  };

  const jumpFromInterpToPolicy = (policyId: string) => {
    setActiveModalData(null);
    setActiveTab("policies");
    setSelectedCategory("全部");
    setSearchQuery("");
    // 自动打开对应政策的详情弹窗
    const target = policiesData.find((item) => item.id === policyId);
    if (target) {
      setTimeout(() => {
        setActiveModalData({ type: "policies", data: target });
      }, 100);
    }
  };

  // 过滤数据计算
  const getFilteredAnnouncements = () => {
    return announcementsData.filter((item) => {
      const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  };

  const getFilteredPublicity = () => {
    return publicityData.filter((item) => {
      const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  };

  const getFilteredPolicies = () => {
    return policiesData.filter((item) => {
      const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  };

  const getFilteredInterpretations = () => {
    return interpretationsData.filter((item) => {
      const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourcePolicyDocNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.background.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  };

  const getFilteredGuidelines = () => {
    return guidelinesData.filter((item) => {
      const matchCat = selectedCategory === "全部" || item.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  };

  // 分类标签清单
  const getCategoryTags = () => {
    switch (activeTab) {
      case "announcements":
        return ["全部", "国际合作与交流", "项目申报", "活动报名"];
      case "publicity":
        return ["全部", "评审结果", "拟入选名单", "征求意见稿"];
      case "policies":
        return ["全部", "教育部", "科技部", "商务部/发改委"];
      case "interpretations":
        return ["全部", "政策背景", "核心要点", "执行细则"];
      case "guidelines":
        return ["全部", "国际合作项目", "科研成果转化", "团体标准立项"];
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 模拟下载成功 Toast 提示 */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-blue-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-blue-400 flex items-center space-x-3 transition-all animate-bounce">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">{downloadToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 顶部 Page Banner (科技蓝/中性灰设计) */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 lg:py-16 overflow-hidden border-b border-blue-900/40">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-32 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-xs text-blue-200/80 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>&gt;</span>
            <span className="text-white font-medium">通知公告</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span>权威发文 · 政策法规 · 申报指南</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight mb-3">
              通知公告与政策频道
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              集中发布中国高校校办产业协会国际合作与交流专业委员会对外通告、信息公示、涉外成果转化政策汇编与权威解读、国家重大战略课题及标准立项申报指南。
            </p>
          </div>

          {/* 统计指标卡 */}
          <div className="mt-6 pt-6 border-t border-blue-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">国专委对外发文</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">48 <span className="text-xs font-normal text-slate-400">篇</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">涉外转化法规</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">36 <span className="text-xs font-normal text-slate-400">部</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">政策深度解读</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">24 <span className="text-xs font-normal text-slate-400">期</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-xs">
              <div className="text-xs text-blue-300">重大立项申报指南</div>
              <div className="text-lg sm:text-xl font-bold font-serif text-white mt-1">18 <span className="text-xs font-normal text-slate-400">项</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5 个主标签页吸顶导航 (Sticky Sub-Navigation Tabs) */}
      {/* ============================================================ */}
      <div className="sticky top-[148px] sm:top-[156px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {[
                { id: "announcements", label: "通知公告", tag: "对外发文" },
                { id: "publicity", label: "信息公示", tag: "评审/名单" },
                { id: "policies", label: "政策法规", tag: "部委转载" },
                { id: "interpretations", label: "政策解读", tag: "双向关联" },
                { id: "guidelines", label: "申报指南", tag: "条件/材料" },
              ].map((tab) => {
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setSelectedCategory("全部");
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none cursor-pointer flex items-center space-x-1.5 ${
                      isCurrent
                        ? "bg-blue-900 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-normal hidden sm:inline-block ${
                        isCurrent
                          ? "bg-blue-800 text-blue-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 搜索框 */}
            <div className="relative shrink-0 hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="在当前栏目搜索标题、文号..."
                className="w-56 pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent bg-slate-50"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 主体内容区域 */}
      {/* ============================================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
        {/* 分类标签过滤栏 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">分类筛选：</span>
            {getCategoryTags().map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedCategory(tag)}
                className={`px-3 py-1 text-xs rounded-full transition-all cursor-pointer ${
                  selectedCategory === tag
                    ? "bg-blue-800 text-white font-semibold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 移动端搜索框 */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题、文号、关键字..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-800 bg-white"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 栏目1：通知公告 (国专委对外发文，对外合作、项目申报、活动报名) */}
        {/* ============================================================ */}
        {activeTab === "announcements" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-800 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  国专委对外通告列表（含国际合作、项目申报、活动报名）
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                共找到 {getFilteredAnnouncements().length} 条记录
              </span>
            </div>

            {getFilteredAnnouncements().length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                暂无符合条件的通知公告
              </div>
            ) : (
              getFilteredAnnouncements().map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveModalData({ type: "announcements", data: item })}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          item.category === "项目申报"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : item.category === "活动报名"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{item.docNo}</span>
                      {item.urgent && (
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1 animate-ping"></span>
                          重要通知
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{item.date}</span>
                      <span>阅读 {item.views}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 gap-2">
                    <span className="text-slate-500 font-medium">发文单位：{item.issuer}</span>
                    {item.deadline && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200/60">
                        申报截止：{item.deadline}
                      </span>
                    )}
                    <span className="text-blue-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                      <span>查阅通告正文及附件</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 栏目2：信息公示 (评审结果、拟入选名单、征求意见稿) */}
        {/* ============================================================ */}
        {activeTab === "publicity" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-800 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  国专委信息公示大厅（评审结果 · 拟入选名单 · 征求意见稿）
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                共找到 {getFilteredPublicity().length} 条记录
              </span>
            </div>

            {getFilteredPublicity().length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                暂无符合条件的信息公示
              </div>
            ) : (
              getFilteredPublicity().map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveModalData({ type: "publicity", data: item })}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{item.docNo}</span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        公示期：{item.publicityPeriod}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>发布日期：{item.date}</span>
                      <span>关注度：{item.views}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 gap-2">
                    <span className="text-slate-500">
                      异议反馈受理邮箱：
                      <span className="font-mono text-blue-700 underline ml-1">{item.feedbackEmail}</span>
                    </span>
                    <span className="text-blue-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                      <span>查看公示详单与附件</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 栏目3：政策法规 (教育部、科技部、商务部等涉外与成果转化政策) */}
        {/* 核心要求：必须有“查看政策解读”入口 */}
        {/* ============================================================ */}
        {activeTab === "policies" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-800 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  涉外产学研与成果转化政策法规汇编（官方转载）
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                共找到 {getFilteredPolicies().length} 条政策法规
              </span>
            </div>

            {getFilteredPolicies().length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                暂无符合条件的政策法规
              </div>
            ) : (
              getFilteredPolicies().map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-800 border border-blue-200">
                        {item.category}
                      </span>
                      <span className="text-xs text-blue-900 font-bold bg-blue-100/60 px-2 py-0.5 rounded font-mono">
                        {item.docNo}
                      </span>
                      <span className="text-xs text-slate-500">
                        发文机关：{item.authority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{item.date}</span>
                      <span>阅读量：{item.views}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => setActiveModalData({ type: "policies", data: item })}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug mb-2 cursor-pointer"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-3">
                    {item.summary}
                  </p>

                  {/* 双向关联专属卡片：查看政策解读 */}
                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center space-x-2">
                      <span className="shrink-0 px-2 py-0.5 bg-amber-600 text-white rounded text-[11px] font-bold">
                        政策解读配套
                      </span>
                      <span className="text-xs text-slate-700 font-medium line-clamp-1">
                        {item.relatedInterpTitle}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpFromPolicyToInterp(item.relatedInterpId);
                      }}
                      className="shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>查看政策解读 &rarr;</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-slate-100">
                    <span className="text-slate-500">政策法规原文转载自国家部委公开公文</span>
                    <button
                      onClick={() => setActiveModalData({ type: "policies", data: item })}
                      className="text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>查阅全文及条文拆解</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 栏目4：政策解读 (解读背景、核心要点、适用范围) */}
        {/* 核心要求：必须明确标注政策文号与发布机关(仅示例)，并提供“查看政策原文”入口 */}
        {/* ============================================================ */}
        {activeTab === "interpretations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-800 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  涉外科技转化政策深度权威解读专栏
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                共找到 {getFilteredInterpretations().length} 篇解读文章
              </span>
            </div>

            {getFilteredInterpretations().length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                暂无符合条件的政策解读
              </div>
            ) : (
              getFilteredInterpretations().map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">解读者：{item.author}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>发布日期：{item.date}</span>
                      <span>浏览量：{item.views}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => setActiveModalData({ type: "interpretations", data: item })}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug mb-3 cursor-pointer"
                  >
                    {item.title}
                  </h3>

                  {/* 核心要求：在显眼位置标注出政策文号与发布机关，并标注仅示例 */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg mb-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-800 text-white">
                          关联政策文号
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-300">
                          {item.sourcePolicyDocNo}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded font-medium border border-amber-200">
                        * 注：文号及发文机关为合理模拟数据，仅供展示示例
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-700 gap-2">
                      <div>
                        <span className="font-semibold text-slate-900">发布机关：</span>
                        <span>{item.sourcePolicyAuthority}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpFromInterpToPolicy(item.relatedPolicyId);
                        }}
                        className="self-start sm:self-auto px-3.5 py-1 text-xs font-semibold rounded bg-blue-800 hover:bg-blue-900 text-white shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>查看关联政策原文 &rarr;</span>
                      </button>
                    </div>
                  </div>

                  {/* 解读核心要点摘要 */}
                  <div className="space-y-1.5 mb-3">
                    <div className="text-xs font-semibold text-slate-800">【核心要点速递】</div>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {item.keyPoints.slice(0, 2).map((kp, idx) => (
                        <li key={idx} className="line-clamp-1">
                          <span className="font-medium text-slate-800">{kp.title}：</span>
                          {kp.desc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 gap-2">
                    <span className="text-slate-500">
                      适用范围：<span className="text-slate-700">{item.applicableScope}</span>
                    </span>
                    <button
                      onClick={() => setActiveModalData({ type: "interpretations", data: item })}
                      className="text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>阅读完整解读与图解</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 栏目5：申报指南 (各类项目、活动、标准立项申报条件与材料清单) */}
        {/* ============================================================ */}
        {activeTab === "guidelines" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-blue-800 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  重大课题、示范基地与团体标准立项申报指南总览
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                共找到 {getFilteredGuidelines().length} 项申报指南
              </span>
            </div>

            {getFilteredGuidelines().length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                暂无符合条件的申报指南
              </div>
            ) : (
              getFilteredGuidelines().map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveModalData({ type: "guidelines", data: item })}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">指南编号：{item.code}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>更新日期：{item.date}</span>
                      <span>关注：{item.views}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  {/* 申报条件 & 材料清单预览卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/60 mb-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 mb-1 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                        <span>申报关键条件要点：</span>
                      </div>
                      <div className="text-slate-600 space-y-0.5 line-clamp-2">
                        {item.conditions[0]}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 mb-1 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>所需材料清单摘要：</span>
                      </div>
                      <div className="text-slate-600 space-y-0.5 line-clamp-2">
                        {item.materials[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 gap-2">
                    <span className="text-slate-500">组织部门：{item.issuer}</span>
                    <span className="text-blue-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                      <span>查看申报条件、材料清单及模板下载</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 弹窗模态框：查看文章与项目详尽内容 (Detail Modal) */}
      {/* ============================================================ */}
      {activeModalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white">
                  {activeModalData.type === "announcements" && "国专委对外发文"}
                  {activeModalData.type === "publicity" && "国专委信息公示"}
                  {activeModalData.type === "policies" && "政策法规原文"}
                  {activeModalData.type === "interpretations" && "政策深度解读"}
                  {activeModalData.type === "guidelines" && "立项申报指南"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeModalData.data.docNo || activeModalData.data.code || activeModalData.data.sourcePolicyDocNo || "官方文函"}
                </span>
              </div>
              <button
                onClick={() => setActiveModalData(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
              {/* 标题 */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 leading-snug">
                  {activeModalData.data.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pb-4 border-b border-slate-200">
                  <span>发布日期：{activeModalData.data.date}</span>
                  <span>浏览次数：{activeModalData.data.views} 次</span>
                  {activeModalData.data.issuer && <span>发文机构：{activeModalData.data.issuer}</span>}
                  {activeModalData.data.author && <span>分析团队：{activeModalData.data.author}</span>}
                  {activeModalData.data.publicityPeriod && (
                    <span className="text-purple-700 font-medium">公示期：{activeModalData.data.publicityPeriod}</span>
                  )}
                </div>
              </div>

              {/* 特殊区块1：政策法规详情 -> 双向跳转到解读 */}
              {activeModalData.type === "policies" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      <span>本政策已配套专家深度解读文章：</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {activeModalData.data.relatedInterpTitle}
                    </div>
                  </div>
                  <button
                    onClick={() => jumpFromPolicyToInterp(activeModalData.data.relatedInterpId)}
                    className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>跳转查看政策解读</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* 特殊区块2：政策解读详情 -> 显眼标注文号、发布机关(注明示例)，并提供跳转到政策原文 */}
              {activeModalData.type === "interpretations" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/80 pb-2">
                    <span className="text-xs font-bold text-blue-900">
                      【政策关联信息与追溯】
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      * 政策文号与发布机关均为模拟展示数据 (仅示例)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">政策文号：</span>
                      <span className="font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-300 ml-1">
                        {activeModalData.data.sourcePolicyDocNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">发布机关：</span>
                      <span className="font-semibold text-slate-900 ml-1">
                        {activeModalData.data.sourcePolicyAuthority}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-blue-200/60">
                    <span className="text-xs text-slate-600 line-clamp-1">
                      关联政策原文：《{activeModalData.data.relatedPolicyTitle}》
                    </span>
                    <button
                      onClick={() => jumpFromInterpToPolicy(activeModalData.data.relatedPolicyId)}
                      className="shrink-0 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>调出对应的政策法规原文</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* 正文段落 (通告、公示、政策) */}
              {activeModalData.data.content && (
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {activeModalData.data.content.map((paragraph: string, idx: number) => (
                    <p key={idx} className="indent-7">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* 解读文章专有结构：背景 + 核心要点 + 适用范围 */}
              {activeModalData.type === "interpretations" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>出台背景与形势分析</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {activeModalData.data.background}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>政策核心要点逐项剖析</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {activeModalData.data.keyPoints?.map((point: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                          <div className="text-xs sm:text-sm font-bold text-blue-900 mb-1">
                            {idx + 1}. {point.title}
                          </div>
                          <div className="text-xs text-slate-600 leading-relaxed">
                            {point.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span>政策适用范围与受益主体</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700">
                      {activeModalData.data.applicableScope}
                    </p>
                  </div>
                </div>
              )}

              {/* 申报指南专有结构：申报条件 + 材料清单 + 流程日程 */}
              {activeModalData.type === "guidelines" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-800"></span>
                      <span>一、申报条件及资格要求</span>
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      {activeModalData.data.conditions?.map((c: string, idx: number) => (
                        <div key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-2">
                          <span className="text-blue-700 font-bold shrink-0">✔</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                      <span>二、申报材料清单与格式要求</span>
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      {activeModalData.data.materials?.map((m: string, idx: number) => (
                        <div key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-2">
                          <span className="text-emerald-700 font-bold shrink-0">📄</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      <span>三、评审流程与进度安排</span>
                    </h4>
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 text-xs sm:text-sm text-slate-700">
                      {activeModalData.data.schedule}
                    </div>
                  </div>
                </div>
              )}

              {/* 附件下载区域 */}
              {activeModalData.data.attachments && activeModalData.data.attachments.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>相关附件与申报模板下载（{activeModalData.data.attachments.length}个）：</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeModalData.data.attachments.map((file: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <svg className="w-5 h-5 text-blue-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="truncate">
                            <div className="text-xs font-medium text-slate-800 truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-400">{file.size}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => showDownloadNotice(file.name)}
                          className="shrink-0 px-2.5 py-1 text-xs font-semibold text-blue-800 bg-white border border-blue-200 rounded hover:bg-blue-800 hover:text-white transition-colors cursor-pointer"
                        >
                          下载
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 官方防伪及核验印信 */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>中国高校校办产业协会国际合作与交流专业委员会 数字公文系统核验真实有效</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  打印本文档
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveModalData(null)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
