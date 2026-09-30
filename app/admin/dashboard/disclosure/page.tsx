'use client';

import React, { useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DisclosureContentData,
  defaultDisclosureContentData,
  BasicInfoItem,
  LeaderInfoItem,
  OrgUnitItem,
  AnnualReportItem,
  CreditCommitmentItem,
  DisclosureActivityItem,
  SolicitationItem,
  MessageInquiryItem,
} from '@/lib/disclosureData';

interface UserInquiryItem {
  id: string;
  type: string;
  name: string;
  contact: string;
  content: string;
  status: string;
  reply?: string;
  replyDate?: string;
  repliedBy?: string;
  isPublic?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export default function AdminDisclosurePage() {
  // 7大子栏目切换（与用户截图完全一致）
  const [activeTab, setActiveTab] = useState<
    'basic' | 'leaders' | 'org' | 'reports' | 'credit' | 'activities' | 'interaction'
  >('basic');

  // 信息公开统一数据
  const [contentData, setContentData] = useState<DisclosureContentData>(defaultDisclosureContentData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 消息提示 Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 恢复初始假数据确认弹窗
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 实时订阅 siteConfig/disclosure
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    try {
      const docRef = doc(db, 'siteConfig', 'disclosure');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          clearTimeout(timer);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<DisclosureContentData>;
            setContentData({
              basicInfo: Array.isArray(data.basicInfo) && data.basicInfo.length > 0 ? data.basicInfo : defaultDisclosureContentData.basicInfo,
              leaders: Array.isArray(data.leaders) && data.leaders.length > 0 ? data.leaders : defaultDisclosureContentData.leaders,
              orgUnits: Array.isArray(data.orgUnits) && data.orgUnits.length > 0 ? data.orgUnits : defaultDisclosureContentData.orgUnits,
              annualReports: Array.isArray(data.annualReports) && data.annualReports.length > 0 ? data.annualReports : defaultDisclosureContentData.annualReports,
              credit: data.credit && Array.isArray(data.credit.commitments) && data.credit.commitments.length > 0 ? data.credit : defaultDisclosureContentData.credit,
              activities: Array.isArray(data.activities) && data.activities.length > 0 ? data.activities : defaultDisclosureContentData.activities,
              interaction: data.interaction || defaultDisclosureContentData.interaction,
            });
          } else {
            setContentData(defaultDisclosureContentData);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Disclosure config snapshot fallback:', err);
          clearTimeout(timer);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error('Failed to setup disclosure listener:', e);
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // 统一持久化写入 Firestore
  const persistDisclosure = async (newData: DisclosureContentData, successMsg: string) => {
    setSaving(true);
    try {
      const docRef = doc(db, 'siteConfig', 'disclosure');
      await setDoc(docRef, newData, { merge: true });
      setContentData(newData);
      showToast(successMsg);
    } catch (err: any) {
      console.error('Save disclosure error:', err);
      showToast('保存失败：' + (err.message || '请稍后重试'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // 恢复默认演示数据
  const handleResetToDefaults = async () => {
    setShowResetConfirm(false);
    await persistDisclosure(defaultDisclosureContentData, '已成功恢复信息公开的初始演示假数据！');
  };

  // ──────────────────────────────────────────
  // 1. 基本信息 状态与操作
  // ──────────────────────────────────────────
  const [editingBasicItem, setEditingBasicItem] = useState<BasicInfoItem | null>(null);
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [basicFormData, setBasicFormData] = useState({ label: '', value: '' });

  const handleOpenBasicModal = (item?: BasicInfoItem) => {
    if (item) {
      setEditingBasicItem(item);
      setBasicFormData({ label: item.label, value: item.value });
    } else {
      setEditingBasicItem(null);
      setBasicFormData({ label: '', value: '' });
    }
    setIsBasicModalOpen(true);
  };

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicFormData.label.trim() || !basicFormData.value.trim()) {
      showToast('请完整填写属性名称与公开内容', 'error');
      return;
    }

    let updatedList: BasicInfoItem[];
    if (editingBasicItem) {
      updatedList = contentData.basicInfo.map((b) =>
        b.id === editingBasicItem.id ? { ...basicFormData, id: editingBasicItem.id } : b
      );
    } else {
      const newItem: BasicInfoItem = {
        ...basicFormData,
        id: 'bi-' + Date.now(),
      };
      updatedList = [...contentData.basicInfo, newItem];
    }

    await persistDisclosure(
      { ...contentData, basicInfo: updatedList },
      editingBasicItem ? '基本信息已更新' : '已添加新的基本信息条目'
    );
    setIsBasicModalOpen(false);
  };

  const handleDeleteBasic = async (id: string) => {
    const updatedList = contentData.basicInfo.filter((b) => b.id !== id);
    await persistDisclosure({ ...contentData, basicInfo: updatedList }, '已删除该基本信息条目');
  };

  // ──────────────────────────────────────────
  // 2. 负责人与机构信息 状态与操作
  // ──────────────────────────────────────────
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<LeaderInfoItem | null>(null);
  const [deleteTargetLeader, setDeleteTargetLeader] = useState<LeaderInfoItem | null>(null);
  const [leaderFormData, setLeaderFormData] = useState<Omit<LeaderInfoItem, 'id'>>({
    role: '副主任委员',
    name: '',
    title: '',
    org: '',
    changeRecord: '2023年10月第一届代表大会选举产生，现任。',
    desc: '',
  });

  const handleOpenLeaderModal = (item?: LeaderInfoItem) => {
    if (item) {
      setEditingLeader(item);
      setLeaderFormData({
        role: item.role,
        name: item.name,
        title: item.title,
        org: item.org,
        changeRecord: item.changeRecord,
        desc: item.desc,
      });
    } else {
      setEditingLeader(null);
      setLeaderFormData({
        role: '副主任委员',
        name: '',
        title: '研究员',
        org: '',
        changeRecord: '2023年10月代表大会选举产生，现任。',
        desc: '',
      });
    }
    setIsLeaderModalOpen(true);
  };

  const handleSaveLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderFormData.name.trim() || !leaderFormData.org.trim()) {
      showToast('请完整填写负责人姓名与所属单位', 'error');
      return;
    }

    let updatedList: LeaderInfoItem[];
    if (editingLeader) {
      updatedList = contentData.leaders.map((l) =>
        l.id === editingLeader.id ? { ...leaderFormData, id: editingLeader.id } : l
      );
    } else {
      const newItem: LeaderInfoItem = {
        ...leaderFormData,
        id: 'ldr-' + Date.now(),
      };
      updatedList = [...contentData.leaders, newItem];
    }

    await persistDisclosure(
      { ...contentData, leaders: updatedList },
      editingLeader ? '负责人信息已更新' : '新负责人已录入'
    );
    setIsLeaderModalOpen(false);
  };

  const handleDeleteLeader = async () => {
    if (!deleteTargetLeader) return;
    const updatedList = contentData.leaders.filter((l) => l.id !== deleteTargetLeader.id);
    await persistDisclosure({ ...contentData, leaders: updatedList }, '已删除负责人条目');
    setDeleteTargetLeader(null);
  };

  // ──────────────────────────────────────────
  // 3. 组织机构 状态与操作
  // ──────────────────────────────────────────
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrgUnitItem | null>(null);
  const [deleteTargetOrg, setDeleteTargetOrg] = useState<OrgUnitItem | null>(null);
  const [orgFormData, setOrgFormData] = useState<Omit<OrgUnitItem, 'id'>>({
    number: '04',
    title: '',
    desc: '',
    footerNote: '',
    linkText: '',
    linkUrl: '',
  });

  const handleOpenOrgModal = (item?: OrgUnitItem) => {
    if (item) {
      setEditingOrg(item);
      setOrgFormData({
        number: item.number,
        title: item.title,
        desc: item.desc,
        footerNote: item.footerNote || '',
        linkText: item.linkText || '',
        linkUrl: item.linkUrl || '',
      });
    } else {
      setEditingOrg(null);
      setOrgFormData({
        number: '0' + (contentData.orgUnits.length + 1),
        title: '',
        desc: '',
        footerNote: '由常务理事会授权开展相关工作',
        linkText: '',
        linkUrl: '',
      });
    }
    setIsOrgModalOpen(true);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgFormData.title.trim() || !orgFormData.desc.trim()) {
      showToast('请填写机构单元名称与职能说明', 'error');
      return;
    }

    let updatedList: OrgUnitItem[];
    if (editingOrg) {
      updatedList = contentData.orgUnits.map((o) =>
        o.id === editingOrg.id ? { ...orgFormData, id: editingOrg.id } : o
      );
    } else {
      const newItem: OrgUnitItem = {
        ...orgFormData,
        id: 'org-' + Date.now(),
      };
      updatedList = [...contentData.orgUnits, newItem];
    }

    await persistDisclosure(
      { ...contentData, orgUnits: updatedList },
      editingOrg ? '组织机构已更新' : '新组织单元已添加'
    );
    setIsOrgModalOpen(false);
  };

  const handleDeleteOrg = async () => {
    if (!deleteTargetOrg) return;
    const updatedList = contentData.orgUnits.filter((o) => o.id !== deleteTargetOrg.id);
    await persistDisclosure({ ...contentData, orgUnits: updatedList }, '已删除组织机构条目');
    setDeleteTargetOrg(null);
  };

  // ──────────────────────────────────────────
  // 4. 年度工作报告 状态与操作
  // ──────────────────────────────────────────
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<AnnualReportItem | null>(null);
  const [deleteTargetReport, setDeleteTargetReport] = useState<AnnualReportItem | null>(null);
  const [reportFormData, setReportFormData] = useState<Omit<AnnualReportItem, 'id'>>({
    year: '2026年度',
    title: '',
    publishDate: new Date().toISOString().slice(0, 10),
    summary: '',
    plan: '',
    fullContent: '',
  });

  const handleOpenReportModal = (item?: AnnualReportItem) => {
    if (item) {
      setEditingReport(item);
      setReportFormData({
        year: item.year,
        title: item.title,
        publishDate: item.publishDate,
        summary: item.summary,
        plan: item.plan,
        fullContent: item.fullContent,
      });
    } else {
      setEditingReport(null);
      setReportFormData({
        year: '2026年度',
        title: '2026年度工作进展总结与下阶段工作要点报告',
        publishDate: new Date().toISOString().slice(0, 10),
        summary: '',
        plan: '',
        fullContent: '',
      });
    }
    setIsReportModalOpen(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFormData.title.trim() || !reportFormData.summary.trim()) {
      showToast('请填写报告标题与工作开展总结', 'error');
      return;
    }

    let updatedList: AnnualReportItem[];
    if (editingReport) {
      updatedList = contentData.annualReports.map((r) =>
        r.id === editingReport.id ? { ...reportFormData, id: editingReport.id } : r
      );
    } else {
      const newItem: AnnualReportItem = {
        ...reportFormData,
        id: 'ar-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.annualReports];
    }

    await persistDisclosure(
      { ...contentData, annualReports: updatedList },
      editingReport ? '年度工作报告已更新' : '新年度工作报告已发布'
    );
    setIsReportModalOpen(false);
  };

  const handleDeleteReport = async () => {
    if (!deleteTargetReport) return;
    const updatedList = contentData.annualReports.filter((r) => r.id !== deleteTargetReport.id);
    await persistDisclosure({ ...contentData, annualReports: updatedList }, '已删除年度报告');
    setDeleteTargetReport(null);
  };

  // ──────────────────────────────────────────
  // 5. 信用承诺 状态与操作
  // ──────────────────────────────────────────
  const [creditHeaderForm, setCreditHeaderForm] = useState({
    title: contentData.credit.title,
    subtitle: contentData.credit.subtitle,
  });
  useEffect(() => {
    setCreditHeaderForm({
      title: contentData.credit.title,
      subtitle: contentData.credit.subtitle,
    });
  }, [contentData.credit]);

  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<CreditCommitmentItem | null>(null);
  const [commitmentFormData, setCommitmentFormData] = useState({ title: '', content: '' });

  const handleSaveCreditHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistDisclosure(
      {
        ...contentData,
        credit: {
          ...contentData.credit,
          title: creditHeaderForm.title.trim(),
          subtitle: creditHeaderForm.subtitle.trim(),
        },
      },
      '信用承诺标题及说明已保存'
    );
  };

  const handleOpenCommitmentModal = (item?: CreditCommitmentItem) => {
    if (item) {
      setEditingCommitment(item);
      setCommitmentFormData({ title: item.title, content: item.content });
    } else {
      setEditingCommitment(null);
      setCommitmentFormData({ title: '', content: '' });
    }
    setIsCommitmentModalOpen(true);
  };

  const handleSaveCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitmentFormData.title.trim() || !commitmentFormData.content.trim()) {
      showToast('请完整填写承诺模块标题与具体承诺内容', 'error');
      return;
    }

    let updatedList: CreditCommitmentItem[];
    if (editingCommitment) {
      updatedList = contentData.credit.commitments.map((c) =>
        c.id === editingCommitment.id ? { ...commitmentFormData, id: editingCommitment.id } : c
      );
    } else {
      const newItem: CreditCommitmentItem = {
        ...commitmentFormData,
        id: 'crd-' + Date.now(),
      };
      updatedList = [...contentData.credit.commitments, newItem];
    }

    await persistDisclosure(
      {
        ...contentData,
        credit: { ...contentData.credit, commitments: updatedList },
      },
      editingCommitment ? '承诺条目已更新' : '已添加新承诺条目'
    );
    setIsCommitmentModalOpen(false);
  };

  const handleDeleteCommitment = async (id: string) => {
    const updatedList = contentData.credit.commitments.filter((c) => c.id !== id);
    await persistDisclosure(
      {
        ...contentData,
        credit: { ...contentData.credit, commitments: updatedList },
      },
      '已删除该信用承诺条目'
    );
  };

  // ──────────────────────────────────────────
  // 6. 活动与项目情况 状态与操作
  // ──────────────────────────────────────────
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DisclosureActivityItem | null>(null);
  const [deleteTargetActivity, setDeleteTargetActivity] = useState<DisclosureActivityItem | null>(null);
  const [activityFormData, setActivityFormData] = useState<Omit<DisclosureActivityItem, 'id'>>({
    title: '',
    type: '重大活动',
    time: '2026年',
    location: '中国北京',
    result: '',
  });

  const handleOpenActivityModal = (item?: DisclosureActivityItem) => {
    if (item) {
      setEditingActivity(item);
      setActivityFormData({
        title: item.title,
        type: item.type,
        time: item.time,
        location: item.location,
        result: item.result,
      });
    } else {
      setEditingActivity(null);
      setActivityFormData({
        title: '',
        type: '重大活动',
        time: '2026年',
        location: '中国上海',
        result: '',
      });
    }
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityFormData.title.trim() || !activityFormData.result.trim()) {
      showToast('请填写活动项目名称与成效说明', 'error');
      return;
    }

    let updatedList: DisclosureActivityItem[];
    if (editingActivity) {
      updatedList = contentData.activities.map((a) =>
        a.id === editingActivity.id ? { ...activityFormData, id: editingActivity.id } : a
      );
    } else {
      const newItem: DisclosureActivityItem = {
        ...activityFormData,
        id: 'act-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.activities];
    }

    await persistDisclosure(
      { ...contentData, activities: updatedList },
      editingActivity ? '活动与项目公开信息已更新' : '已添加新活动公开条目'
    );
    setIsActivityModalOpen(false);
  };

  const handleDeleteActivity = async () => {
    if (!deleteTargetActivity) return;
    const updatedList = contentData.activities.filter((a) => a.id !== deleteTargetActivity.id);
    await persistDisclosure({ ...contentData, activities: updatedList }, '已删除活动与项目公开条目');
    setDeleteTargetActivity(null);
  };

  // ──────────────────────────────────────────
  // 7. 互动交流（意见征集 + 留言选登 + 在线留言）
  // ──────────────────────────────────────────
  const [interactionSubTab, setInteractionSubTab] = useState<'solicitations' | 'faqs' | 'online'>(
    'solicitations'
  );

  // 意见征集
  const [isSolicitationModalOpen, setIsSolicitationModalOpen] = useState(false);
  const [editingSolicitation, setEditingSolicitation] = useState<SolicitationItem | null>(null);
  const [solicitationFormData, setSolicitationFormData] = useState<Omit<SolicitationItem, 'id'>>({
    title: '',
    deadline: new Date().toISOString().slice(0, 10),
    status: '进行中',
    method: '请发送盖章反馈意见至 secretariat@guozhuanwei.org.cn',
    note: '征求结束后15个工作日内公布采纳情况。',
  });

  const handleOpenSolicitationModal = (item?: SolicitationItem) => {
    if (item) {
      setEditingSolicitation(item);
      setSolicitationFormData({
        title: item.title,
        deadline: item.deadline,
        status: item.status,
        method: item.method,
        note: item.note,
      });
    } else {
      setEditingSolicitation(null);
      setSolicitationFormData({
        title: '',
        deadline: new Date().toISOString().slice(0, 10),
        status: '进行中',
        method: '发送邮件至 secretariat@guozhuanwei.org.cn',
        note: '征集结束后15个工作日内公示采纳情况说明。',
      });
    }
    setIsSolicitationModalOpen(true);
  };

  const handleSaveSolicitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitationFormData.title.trim()) {
      showToast('请填写征集通知标题', 'error');
      return;
    }

    let updatedList: SolicitationItem[];
    if (editingSolicitation) {
      updatedList = contentData.interaction.solicitations.map((s) =>
        s.id === editingSolicitation.id ? { ...solicitationFormData, id: editingSolicitation.id } : s
      );
    } else {
      const newItem: SolicitationItem = {
        ...solicitationFormData,
        id: 'sol-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.interaction.solicitations];
    }

    await persistDisclosure(
      {
        ...contentData,
        interaction: { ...contentData.interaction, solicitations: updatedList },
      },
      editingSolicitation ? '意见征集通知已更新' : '已发布新意见征集通知'
    );
    setIsSolicitationModalOpen(false);
  };

  const handleDeleteSolicitation = async (id: string) => {
    const updatedList = contentData.interaction.solicitations.filter((s) => s.id !== id);
    await persistDisclosure(
      {
        ...contentData,
        interaction: { ...contentData.interaction, solicitations: updatedList },
      },
      '已删除意见征集通知'
    );
  };

  // 常见咨询选登
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<MessageInquiryItem | null>(null);
  const [faqFormData, setFaqFormData] = useState<Omit<MessageInquiryItem, 'id'>>({
    user: '',
    date: new Date().toISOString().slice(0, 10),
    question: '',
    reply: '',
    replyDate: new Date().toISOString().slice(0, 10),
  });

  const handleOpenFaqModal = (item?: MessageInquiryItem) => {
    if (item) {
      setEditingFaq(item);
      setFaqFormData({
        user: item.user,
        date: item.date,
        question: item.question,
        reply: item.reply,
        replyDate: item.replyDate,
      });
    } else {
      setEditingFaq(null);
      setFaqFormData({
        user: '某会员高校 李老师',
        date: new Date().toISOString().slice(0, 10),
        question: '',
        reply: '',
        replyDate: new Date().toISOString().slice(0, 10),
      });
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormData.question.trim() || !faqFormData.reply.trim()) {
      showToast('请完整填写咨询提问与官方答复', 'error');
      return;
    }

    let updatedList: MessageInquiryItem[];
    if (editingFaq) {
      updatedList = contentData.interaction.messageInquiries.map((f) =>
        f.id === editingFaq.id ? { ...faqFormData, id: editingFaq.id } : f
      );
    } else {
      const newItem: MessageInquiryItem = {
        ...faqFormData,
        id: 'mi-' + Date.now(),
      };
      updatedList = [newItem, ...contentData.interaction.messageInquiries];
    }

    await persistDisclosure(
      {
        ...contentData,
        interaction: { ...contentData.interaction, messageInquiries: updatedList },
      },
      editingFaq ? '咨询答复已更新' : '新咨询答复已选登'
    );
    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = async (id: string) => {
    const updatedList = contentData.interaction.messageInquiries.filter((f) => f.id !== id);
    await persistDisclosure(
      {
        ...contentData,
        interaction: { ...contentData.interaction, messageInquiries: updatedList },
      },
      '已删除咨询答复条目'
    );
  };

  // 真实在线留言订阅（Firestore inquiries 集合）与答复办理状态
  const [userInquiries, setUserInquiries] = useState<UserInquiryItem[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // 办理答复弹窗状态
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyingInquiry, setReplyingInquiry] = useState<UserInquiryItem | null>(null);
  const [replyFormData, setReplyFormData] = useState({
    reply: '',
    replyDate: new Date().toISOString().slice(0, 10),
    repliedBy: '国专委秘书处',
    publishToFrontend: true,
    status: '已答复办结',
  });

  // 删除留言弹窗目标
  const [deleteTargetInquiry, setDeleteTargetInquiry] = useState<UserInquiryItem | null>(null);

  // 格式化时间戳工具函数
  const formatInquiryTime = (ts: any) => {
    if (!ts) return '';
    try {
      if (typeof ts === 'string') return ts.slice(0, 16).replace('T', ' ');
      if (ts.toDate && typeof ts.toDate === 'function') {
        const d = ts.toDate();
        const pad = (n: number) => (n < 10 ? '0' + n : n);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      if (ts.seconds) {
        const d = new Date(ts.seconds * 1000);
        const pad = (n: number) => (n < 10 ? '0' + n : n);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      setLoadingInquiries(true);
      const q = query(collection(db, 'inquiries'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: UserInquiryItem[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<UserInquiryItem, 'id'>),
          }));
          // 内存降序排序：最新提交的排在最前
          list.sort((a, b) => {
            const timeA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const timeB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return timeB - timeA;
          });
          setUserInquiries(list);
          setLoadingInquiries(false);
        },
        (err) => {
          console.warn('Inquiries query fallback:', err);
          setLoadingInquiries(false);
        }
      );
    } catch (e) {
      console.warn('Inquiries listener error:', e);
      setLoadingInquiries(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // 打开答复弹窗
  const handleOpenReplyModal = (inq: UserInquiryItem) => {
    setReplyingInquiry(inq);
    const syncId = 'mi-inq-' + inq.id;
    const isAlreadyInPublic = contentData.interaction.messageInquiries.some(
      (m) => m.id === syncId || (m.question === inq.content && m.user === inq.name)
    );
    setReplyFormData({
      reply: inq.reply || '',
      replyDate: inq.replyDate || new Date().toISOString().slice(0, 10),
      repliedBy: inq.repliedBy || '国专委秘书处',
      publishToFrontend: inq.isPublic !== undefined ? inq.isPublic : isAlreadyInPublic || true,
      status: inq.status === '待审核办理' ? '已答复办结' : (inq.status || '已答复办结'),
    });
    setIsReplyModalOpen(true);
  };

  // 提交并保存官方答复
  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingInquiry) return;
    if (!replyFormData.reply.trim()) {
      showToast('请填写官方办理答复内容', 'error');
      return;
    }

    setSaving(true);
    try {
      const syncId = 'mi-inq-' + replyingInquiry.id;
      const cleanReply = replyFormData.reply.trim();
      const cleanRepliedBy = replyFormData.repliedBy.trim() || '国专委秘书处';
      const replyDate = replyFormData.replyDate || new Date().toISOString().slice(0, 10);

      // 1. 更新 Firestore 中的 inquiries 记录
      const inqRef = doc(db, 'inquiries', replyingInquiry.id);
      await updateDoc(inqRef, {
        reply: cleanReply,
        replyDate: replyDate,
        repliedBy: cleanRepliedBy,
        status: replyFormData.status,
        isPublic: replyFormData.publishToFrontend,
        updatedAt: new Date().toISOString(),
      });

      // 2. 如果勾选了“同步至前台【咨询留言公开选登】”
      let updatedFaqs = [...contentData.interaction.messageInquiries];
      const existingIdx = updatedFaqs.findIndex(
        (m) => m.id === syncId || (m.question === replyingInquiry.content && m.user === replyingInquiry.name)
      );

      if (replyFormData.publishToFrontend) {
        const rawDate = formatInquiryTime(replyingInquiry.createdAt);
        const faqItem: MessageInquiryItem = {
          id: syncId,
          user: replyingInquiry.name,
          date: rawDate ? rawDate.slice(0, 10) : replyDate,
          question: replyingInquiry.content,
          reply: cleanReply,
          replyDate: replyDate,
        };

        if (existingIdx >= 0) {
          updatedFaqs[existingIdx] = faqItem;
        } else {
          updatedFaqs = [faqItem, ...updatedFaqs];
        }

        await persistDisclosure(
          {
            ...contentData,
            interaction: {
              ...contentData.interaction,
              messageInquiries: updatedFaqs,
            },
          },
          '答复已成功保存，并已同步公开选登至前台互动专栏！'
        );
      } else {
        // 如果未勾选且先前已存在于公开选登，则将其下架移除
        if (existingIdx >= 0) {
          updatedFaqs = updatedFaqs.filter((_, idx) => idx !== existingIdx);
          await persistDisclosure(
            {
              ...contentData,
              interaction: {
                ...contentData.interaction,
                messageInquiries: updatedFaqs,
              },
            },
            '答复已成功保存（仅内部记录，未公开）'
          );
        } else {
          showToast('答复已成功保存（仅内部记录）');
        }
      }

      setIsReplyModalOpen(false);
      setReplyingInquiry(null);
    } catch (err: any) {
      console.error('Save inquiry reply error:', err);
      showToast('保存答复失败：' + (err.message || '请稍后重试'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // 快捷切换是否在前台公开选登
  const handleToggleInquiryPublic = async (inq: UserInquiryItem) => {
    if (!inq.reply) {
      showToast('请先为该留言录入官方答复后再同步至前台公开选登', 'error');
      handleOpenReplyModal(inq);
      return;
    }

    const syncId = 'mi-inq-' + inq.id;
    const isCurrentlyPublic = contentData.interaction.messageInquiries.some(
      (m) => m.id === syncId || (m.question === inq.content && m.user === inq.name)
    );
    const willBePublic = !isCurrentlyPublic;

    setSaving(true);
    try {
      // 1. 更新 inquiries 记录的 isPublic 属性
      await updateDoc(doc(db, 'inquiries', inq.id), {
        isPublic: willBePublic,
      });

      // 2. 更新 siteConfig/disclosure 中的 messageInquiries 数组
      let updatedFaqs = [...contentData.interaction.messageInquiries];
      if (willBePublic) {
        const rawDate = formatInquiryTime(inq.createdAt);
        const faqItem: MessageInquiryItem = {
          id: syncId,
          user: inq.name,
          date: rawDate ? rawDate.slice(0, 10) : inq.replyDate || new Date().toISOString().slice(0, 10),
          question: inq.content,
          reply: inq.reply,
          replyDate: inq.replyDate || new Date().toISOString().slice(0, 10),
        };
        const idx = updatedFaqs.findIndex((m) => m.id === syncId);
        if (idx >= 0) {
          updatedFaqs[idx] = faqItem;
        } else {
          updatedFaqs = [faqItem, ...updatedFaqs];
        }
        await persistDisclosure(
          {
            ...contentData,
            interaction: { ...contentData.interaction, messageInquiries: updatedFaqs },
          },
          '已同步选登至前台【咨询留言公开选登】专栏！'
        );
      } else {
        updatedFaqs = updatedFaqs.filter((m) => m.id !== syncId && m.question !== inq.content);
        await persistDisclosure(
          {
            ...contentData,
            interaction: { ...contentData.interaction, messageInquiries: updatedFaqs },
          },
          '已从前台【咨询留言公开选登】专栏中撤下'
        );
      }
    } catch (err: any) {
      showToast('操作失败：' + (err.message || '请稍后重试'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: newStatus });
      showToast('留言办理状态已更新为：' + newStatus);
    } catch (err: any) {
      showToast('更新失败：' + (err.message || '请稍后重试'), 'error');
    }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteTargetInquiry) return;
    try {
      await deleteDoc(doc(db, 'inquiries', deleteTargetInquiry.id));
      const syncId = 'mi-inq-' + deleteTargetInquiry.id;
      if (contentData.interaction.messageInquiries.some((m) => m.id === syncId)) {
        const updatedFaqs = contentData.interaction.messageInquiries.filter((m) => m.id !== syncId);
        await persistDisclosure(
          {
            ...contentData,
            interaction: { ...contentData.interaction, messageInquiries: updatedFaqs },
          },
          '已删除该留言记录及前台同步选登条目'
        );
      } else {
        showToast('已删除该条用户留言记录');
      }
      setDeleteTargetInquiry(null);
    } catch (err: any) {
      showToast('删除失败：' + (err.message || '请稍后重试'), 'error');
    }
  };

  // 页面加载中指示
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">正在载入信息公开数据...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 提示 Toast ─── */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* ─── 顶部标题与恢复按钮 ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">信息公开管理</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            统一维护信息公开平台 7 大板块，修改后前台页面将实时无刷新自动同步。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="将所有板块重置为官方预置演示假数据"
          >
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            恢复初始演示数据
          </button>
        </div>
      </div>

      {/* ─── 7 大核心子栏目切换（与用户截图完全对应） ─── */}
      <div className="flex items-center space-x-1 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'basic', label: '基本信息', count: contentData.basicInfo.length },
          { id: 'leaders', label: '负责人与机构信息', count: contentData.leaders.length },
          { id: 'org', label: '组织机构', count: contentData.orgUnits.length },
          { id: 'reports', label: '年度工作报告', count: contentData.annualReports.length },
          { id: 'credit', label: '信用承诺', count: contentData.credit.commitments.length },
          { id: 'activities', label: '活动与项目情况', count: contentData.activities.length },
          {
            id: 'interaction',
            label: '互动交流',
            count:
              contentData.interaction.solicitations.length +
              contentData.interaction.messageInquiries.length +
              userInquiries.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Tab 1: 基本信息
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理法定登记设立依据与核心办会属性信息公示，支持实时修改与自定义增减条目。
            </p>
            <button
              type="button"
              onClick={() => handleOpenBasicModal()}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
            >
              + 新增基本信息项
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentData.basicInfo.map((info) => (
              <div
                key={info.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                    <span>{info.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenBasicModal(info)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBasic(info.id)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-sans pl-3 border-l-2 border-slate-200">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 2: 负责人与机构信息
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'leaders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理国专委主要负责人名单、职务分工与任免变动记录。
            </p>
            <button
              type="button"
              onClick={() => handleOpenLeaderModal()}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
            >
              + 新增负责人
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {contentData.leaders.map((leader) => (
              <div
                key={leader.id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    {leader.role}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenLeaderModal(leader)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetLeader(leader)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{leader.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {leader.title} · {leader.org}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{leader.desc}</p>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="font-semibold text-slate-700">任免与变动记录：</span>
                  {leader.changeRecord}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 3: 组织机构
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'org' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              管理国专委管理运转体系与内设执行部门架构。
            </p>
            <button
              type="button"
              onClick={() => handleOpenOrgModal()}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
            >
              + 新增组织单元
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {contentData.orgUnits.map((org) => (
              <div
                key={org.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs">
                      {org.number}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenOrgModal(org)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetOrg(org)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{org.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{org.desc}</p>
                </div>

                <div className="text-xs text-slate-500 p-2.5 rounded bg-white border border-slate-200">
                  {org.linkUrl ? `链接至：${org.linkUrl}` : org.footerNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 4: 年度工作报告
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              逐年公布工作开展成效、活动明细及下一年度规划报告。
            </p>
            <button
              type="button"
              onClick={() => handleOpenReportModal()}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
            >
              + 发布年度报告
            </button>
          </div>

          <div className="space-y-4">
            {contentData.annualReports.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      {r.year}
                    </span>
                    <span className="text-xs text-slate-400">公示日期：{r.publishDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(r)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetReport(r)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      删除
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
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 5: 信用承诺
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'credit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <form onSubmit={handleSaveCreditHeader} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">信用承诺公开抬头与说明</span>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1 text-xs font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
              >
                保存抬头
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">主标题</label>
                <input
                  type="text"
                  value={creditHeaderForm.title}
                  onChange={(e) => setCreditHeaderForm({ ...creditHeaderForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">副标题</label>
                <input
                  type="text"
                  value={creditHeaderForm.subtitle}
                  onChange={(e) => setCreditHeaderForm({ ...creditHeaderForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  required
                />
              </div>
            </div>
          </form>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">承诺要点清单</span>
            <button
              type="button"
              onClick={() => handleOpenCommitmentModal()}
              className="px-3 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
            >
              + 新增承诺条款
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentData.credit.commitments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center space-x-1">
                    <span className="text-blue-800">■</span>
                    <span>{c.title}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenCommitmentModal(c)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCommitment(c.id)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 6: 活动与项目情况
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              公布重大活动、重点项目及常态化涉外培育项目的实施时间、地点与取得成效。
            </p>
            <button
              type="button"
              onClick={() => handleOpenActivityModal()}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
            >
              + 新增公开活动/项目
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentData.activities.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-mono mr-2">{item.time}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenActivityModal(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetActivity(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      删除
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <div className="text-xs text-slate-500">📍 实施地点：{item.location}</div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">成效：</span>
                  {item.result}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Tab 7: 互动交流
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'interaction' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          {/* 子板块三级切换 */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            {[
              { id: 'solicitations', label: '意见征集专栏', count: contentData.interaction.solicitations.length },
              { id: 'faqs', label: '咨询留言公开选登', count: contentData.interaction.messageInquiries.length },
              { id: 'online', label: '实时在线收信池', count: userInquiries.length },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setInteractionSubTab(sub.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  interactionSubTab === sub.id
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{sub.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {sub.count}
                </span>
              </button>
            ))}
          </div>

          {/* 1. 意见征集专栏 */}
          {interactionSubTab === 'solicitations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">公开听取行业建言，征集结束后公布采用情况。</span>
                <button
                  type="button"
                  onClick={() => handleOpenSolicitationModal()}
                  className="px-3 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  + 新增意见征集
                </button>
              </div>

              <div className="space-y-3">
                {contentData.interaction.solicitations.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            item.status === '进行中'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs text-slate-400">截止日期：{item.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenSolicitationModal(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSolicitation(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">反馈途径与方式：</span>
                      {item.method}
                    </p>
                    <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed font-medium">
                      📌 {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 常见咨询答复公开选登 */}
          {interactionSubTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">精选典型咨询留言及公开答复。</span>
                <button
                  type="button"
                  onClick={() => handleOpenFaqModal()}
                  className="px-3 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  + 新增选登答复
                </button>
              </div>

              <div className="space-y-4">
                {contentData.interaction.messageInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2">
                      <span className="font-semibold text-slate-700">留言人：{inq.user}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">提交时间：{inq.date}</span>
                        <button
                          type="button"
                          onClick={() => handleOpenFaqModal(inq)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(inq.id)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed">
                      <span className="font-bold text-blue-900">问：</span>
                      {inq.question}
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
          )}

          {/* 3. 实时在线收信池 */}
          {interactionSubTab === 'online' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">用户实时在线留言诉求池</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    前台用户提交的咨询留言、意见建言与纠错信件（实时入库），支持在线办理、录入正式官方答复并一键选登至前台。
                  </p>
                </div>

                {/* 状态快捷筛选 */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInquiryStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      inquiryStatusFilter === 'all'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    全部 ({userInquiries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryStatusFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      inquiryStatusFilter === 'pending'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>待办理</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                      {userInquiries.filter((i) => !i.reply || i.status === '待审核办理' || i.status === '办理中').length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryStatusFilter('resolved')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      inquiryStatusFilter === 'resolved'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>已答复</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                      {userInquiries.filter((i) => !!i.reply || i.status === '已答复办结').length}
                    </span>
                  </button>
                </div>
              </div>

              {loadingInquiries ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>正在载入信件...</p>
                </div>
              ) : userInquiries.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  当前信箱暂无在线留言记录
                </div>
              ) : (
                <div className="space-y-4">
                  {userInquiries
                    .filter((inq) => {
                      if (inquiryStatusFilter === 'pending') {
                        return !inq.reply || inq.status === '待审核办理' || inq.status === '办理中';
                      }
                      if (inquiryStatusFilter === 'resolved') {
                        return !!inq.reply || inq.status === '已答复办结';
                      }
                      return true;
                    })
                    .map((inq) => {
                      const isPubliclyShared = contentData.interaction.messageInquiries.some(
                        (m) => m.id === 'mi-inq-' + inq.id || (m.question === inq.content && m.user === inq.name)
                      );
                      const isResolved = !!inq.reply || inq.status === '已答复办结';

                      return (
                        <div
                          key={inq.id}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            isResolved
                              ? 'border-slate-200 bg-white hover:border-slate-300'
                              : 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                          }`}
                        >
                          {/* 留言头部元信息 */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inq.type === '咨询留言'
                                    ? 'bg-blue-100 text-blue-800'
                                    : inq.type === '意见建言'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {inq.type || '咨询留言'}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{inq.name}</span>
                              <span className="text-xs text-slate-500 font-mono">
                                联系方式：{inq.contact || '未提供'}
                              </span>
                              {inq.createdAt && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  提交时间：{formatInquiryTime(inq.createdAt)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* 是否前台公开徽章 */}
                              {isPubliclyShared && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <span>🌐</span>
                                  <span>已公开选登</span>
                                </span>
                              )}

                              {/* 状态徽章 */}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                  isResolved
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : inq.status === '办理中'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                              >
                                {inq.status || (isResolved ? '已答复办结' : '待审核办理')}
                              </span>
                            </div>
                          </div>

                          {/* 留言正文内容 */}
                          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                            <span className="font-semibold text-slate-600 block mb-1">【诉求与咨询内容】</span>
                            {inq.content}
                          </div>

                          {/* 官方答复预览卡片（如果已填写答复） */}
                          {inq.reply ? (
                            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-1.5 font-semibold text-emerald-900 border-b border-emerald-100 pb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  <span>{inq.repliedBy || '国专委秘书处'} 办理答复意见：</span>
                                </div>
                                <span className="text-[11px] text-emerald-700 font-mono font-normal">
                                  答复日期：{inq.replyDate || '近期'}
                                </span>
                              </div>
                              <p className="text-slate-800 whitespace-pre-wrap font-medium">{inq.reply}</p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 text-[11px] text-amber-800 flex items-center justify-between">
                              <span>⚠️ 该条留言尚未录入正式官方答复，请点击右侧“办理答复”按钮完成答复。</span>
                            </div>
                          )}

                          {/* 底部操作工具条 */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-[11px]">快捷状态：</span>
                              <select
                                value={inq.status || (isResolved ? '已答复办结' : '待审核办理')}
                                onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="待审核办理">待审核办理</option>
                                <option value="办理中">办理中</option>
                                <option value="已答复办结">已答复办结</option>
                              </select>

                              {/* 快速公开同步切换 */}
                              {inq.reply && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleInquiryPublic(inq)}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                                    isPubliclyShared
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                  title={isPubliclyShared ? '点击从前台公开选登撤下' : '点击同步到前台公开选登'}
                                >
                                  {isPubliclyShared ? '✓ 已公开选登 (点击撤下)' : '+ 同步到前台公开'}
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenReplyModal(inq)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
                                  inq.reply
                                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    : 'bg-blue-900 text-white hover:bg-blue-800'
                                }`}
                              >
                                <span>{inq.reply ? '✏️ 修改答复' : '✍️ 办理答复'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTargetInquiry(inq)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 基本信息录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isBasicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveBasic} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingBasicItem ? '编辑基本信息项' : '新增基本信息项'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBasicModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">信息项标签 *</label>
                  <input
                    type="text"
                    value={basicFormData.label}
                    onChange={(e) => setBasicFormData({ ...basicFormData, label: e.target.value })}
                    placeholder="如：办会宗旨 / 业务范围 / 办公地址"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">公开内容详细值 *</label>
                  <textarea
                    rows={4}
                    value={basicFormData.value}
                    onChange={(e) => setBasicFormData({ ...basicFormData, value: e.target.value })}
                    placeholder="填写法定公开的文字内容..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBasicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 负责人录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isLeaderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveLeader} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingLeader ? '编辑负责人信息' : '新增负责人'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLeaderModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">专委会职务 *</label>
                  <input
                    type="text"
                    value={leaderFormData.role}
                    onChange={(e) => setLeaderFormData({ ...leaderFormData, role: e.target.value })}
                    placeholder="如：主任委员 / 副主任委员 / 秘书长"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">姓名 *</label>
                  <input
                    type="text"
                    value={leaderFormData.name}
                    onChange={(e) => setLeaderFormData({ ...leaderFormData, name: e.target.value })}
                    placeholder="如：周清源"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">职称 / 职务</label>
                  <input
                    type="text"
                    value={leaderFormData.title}
                    onChange={(e) => setLeaderFormData({ ...leaderFormData, title: e.target.value })}
                    placeholder="如：教授 / 博士生导师"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">所属高校/机构 *</label>
                  <input
                    type="text"
                    value={leaderFormData.org}
                    onChange={(e) => setLeaderFormData({ ...leaderFormData, org: e.target.value })}
                    placeholder="如：清华大学资产管理与产业研究院"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">任免与变动记录说明</label>
                  <input
                    type="text"
                    value={leaderFormData.changeRecord}
                    onChange={(e) => setLeaderFormData({ ...leaderFormData, changeRecord: e.target.value })}
                    placeholder="如：2023年10月选举产生，现任。"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">履历背景与分工简介</label>
                  <textarea
                    rows={3}
                    value={leaderFormData.desc}
                    onChange={(e) => setLeaderFormData({ ...leaderFormData, desc: e.target.value })}
                    placeholder="简述学术及转化背景、分管业务领域..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 组织机构录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveOrg} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingOrg ? '编辑组织机构' : '新增组织机构'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">序号数字 *</label>
                  <input
                    type="text"
                    value={orgFormData.number}
                    onChange={(e) => setOrgFormData({ ...orgFormData, number: e.target.value })}
                    placeholder="如：01 / 02 / 03"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">单元名称 *</label>
                  <input
                    type="text"
                    value={orgFormData.title}
                    onChange={(e) => setOrgFormData({ ...orgFormData, title: e.target.value })}
                    placeholder="如：全国会员网络 / 常设秘书处"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">机构职能与设置说明 *</label>
                  <textarea
                    rows={3}
                    value={orgFormData.desc}
                    onChange={(e) => setOrgFormData({ ...orgFormData, desc: e.target.value })}
                    placeholder="详细描述该机构单元的职能定位、内设部门或服务机制..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">底部说明文字</label>
                  <input
                    type="text"
                    value={orgFormData.footerNote}
                    onChange={(e) => setOrgFormData({ ...orgFormData, footerNote: e.target.value })}
                    placeholder="如：办公地点：北京中关村"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">跳转链接（可选）</label>
                  <input
                    type="text"
                    value={orgFormData.linkUrl}
                    onChange={(e) => setOrgFormData({ ...orgFormData, linkUrl: e.target.value })}
                    placeholder="如：/members"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 年度工作报告录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveReport} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingReport ? '编辑年度工作报告' : '新增年度工作报告'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">年度 *</label>
                  <input
                    type="text"
                    value={reportFormData.year}
                    onChange={(e) => setReportFormData({ ...reportFormData, year: e.target.value })}
                    placeholder="如：2026年度"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">公示日期 *</label>
                  <input
                    type="date"
                    value={reportFormData.publishDate}
                    onChange={(e) => setReportFormData({ ...reportFormData, publishDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">报告标题 *</label>
                  <input
                    type="text"
                    value={reportFormData.title}
                    onChange={(e) => setReportFormData({ ...reportFormData, title: e.target.value })}
                    placeholder="输入报告全称"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">开展情况与主要成效 *</label>
                  <textarea
                    rows={2}
                    value={reportFormData.summary}
                    onChange={(e) => setReportFormData({ ...reportFormData, summary: e.target.value })}
                    placeholder="概括年度主要业务成效、会员发展与国际撮合数据..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">下一年度主要工作计划</label>
                  <textarea
                    rows={2}
                    value={reportFormData.plan}
                    onChange={(e) => setReportFormData({ ...reportFormData, plan: e.target.value })}
                    placeholder="概括下一年度重点推进的工作要点..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">报告详细全文（弹窗查阅）</label>
                  <textarea
                    rows={4}
                    value={reportFormData.fullContent}
                    onChange={(e) => setReportFormData({ ...reportFormData, fullContent: e.target.value })}
                    placeholder="粘贴报告全文详细文字或章节概要..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 信用承诺条目录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isCommitmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveCommitment} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCommitment ? '编辑信用承诺条目' : '新增信用承诺条目'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCommitmentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">承诺模块标题 *</label>
                  <input
                    type="text"
                    value={commitmentFormData.title}
                    onChange={(e) => setCommitmentFormData({ ...commitmentFormData, title: e.target.value })}
                    placeholder="如：服务内容与服务对象承诺 / 会费及服务性收费严格规范"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">具体承诺公开文本 *</label>
                  <textarea
                    rows={4}
                    value={commitmentFormData.content}
                    onChange={(e) => setCommitmentFormData({ ...commitmentFormData, content: e.target.value })}
                    placeholder="输入该条承诺的合规声明与规范约束文字..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCommitmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 活动与项目情况录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingActivity ? '编辑活动/项目公开' : '新增活动/项目公开'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">类别标签 *</label>
                  <input
                    type="text"
                    value={activityFormData.type}
                    onChange={(e) => setActivityFormData({ ...activityFormData, type: e.target.value })}
                    placeholder="如：重大活动 / 重点项目 / 长期培育"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">实施时间 *</label>
                  <input
                    type="text"
                    value={activityFormData.time}
                    onChange={(e) => setActivityFormData({ ...activityFormData, time: e.target.value })}
                    placeholder="如：2026年8月 / 2025年 - 2027年"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">活动 / 项目名称 *</label>
                  <input
                    type="text"
                    value={activityFormData.title}
                    onChange={(e) => setActivityFormData({ ...activityFormData, title: e.target.value })}
                    placeholder="输入活动或项目全称"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">实施地点</label>
                  <input
                    type="text"
                    value={activityFormData.location}
                    onChange={(e) => setActivityFormData({ ...activityFormData, location: e.target.value })}
                    placeholder="如：中国上海 / 新加坡 / 马来西亚吉隆坡"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">取得主要成效说明 *</label>
                  <textarea
                    rows={3}
                    value={activityFormData.result}
                    onChange={(e) => setActivityFormData({ ...activityFormData, result: e.target.value })}
                    placeholder="简要概括参会规模、签署协议数量或资金成效..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 意见征集录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isSolicitationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveSolicitation} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingSolicitation ? '编辑意见征集' : '新增意见征集'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSolicitationModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">征集事项通知全称 *</label>
                  <input
                    type="text"
                    value={solicitationFormData.title}
                    onChange={(e) => setSolicitationFormData({ ...solicitationFormData, title: e.target.value })}
                    placeholder="如：关于对团体标准《高校涉外技术转移合规管理指南》公开征求意见的通知"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">截止日期 *</label>
                  <input
                    type="date"
                    value={solicitationFormData.deadline}
                    onChange={(e) => setSolicitationFormData({ ...solicitationFormData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">状态 *</label>
                  <select
                    value={solicitationFormData.status}
                    onChange={(e) => setSolicitationFormData({ ...solicitationFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="进行中">进行中</option>
                    <option value="已结束">已结束</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">反馈途径与方式说明 *</label>
                  <textarea
                    rows={2}
                    value={solicitationFormData.method}
                    onChange={(e) => setSolicitationFormData({ ...solicitationFormData, method: e.target.value })}
                    placeholder="如：请将反馈意见发至 secretariat@guozhuanwei.org.cn"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">公示采用情况承诺/说明</label>
                  <textarea
                    rows={2}
                    value={solicitationFormData.note}
                    onChange={(e) => setSolicitationFormData({ ...solicitationFormData, note: e.target.value })}
                    placeholder="如：征求期满后15个工作日内公布采纳清单与修订说明..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSolicitationModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 咨询留言选登录入/编辑
      ══════════════════════════════════════════════════════════════ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveFaq} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingFaq ? '编辑咨询答复选登' : '新增咨询答复选登'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">留言人（脱敏展示） *</label>
                  <input
                    type="text"
                    value={faqFormData.user}
                    onChange={(e) => setFaqFormData({ ...faqFormData, user: e.target.value })}
                    placeholder="如：某双一流高校技术转移中心 李老师"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">提交时间 *</label>
                  <input
                    type="date"
                    value={faqFormData.date}
                    onChange={(e) => setFaqFormData({ ...faqFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">咨询提问内容 *</label>
                  <textarea
                    rows={2}
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                    placeholder="详细描述咨询问题..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">国专委秘书处答复 *</label>
                  <textarea
                    rows={3}
                    value={faqFormData.reply}
                    onChange={(e) => setFaqFormData({ ...faqFormData, reply: e.target.value })}
                    placeholder="官方解答并注明承诺办理时限..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">答复办理时间 *</label>
                  <input
                    type="date"
                    value={faqFormData.replyDate}
                    onChange={(e) => setFaqFormData({ ...faqFormData, replyDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 办理答复用户留言
      ══════════════════════════════════════════════════════════════ */}
      {isReplyModalOpen && replyingInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveReply} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
                  <h3 className="text-base font-bold text-slate-900">
                    {replyingInquiry.reply ? '修改官方答复意见' : '办理答复用户留言 / 咨询'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* 用户原留言摘要 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-slate-500 pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                      {replyingInquiry.type || '咨询留言'}
                    </span>
                    <span className="font-bold text-slate-900">{replyingInquiry.name}</span>
                    <span className="font-mono text-slate-500">({replyingInquiry.contact || '未提供联系方式'})</span>
                  </div>
                  {replyingInquiry.createdAt && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      提交时间：{formatInquiryTime(replyingInquiry.createdAt)}
                    </span>
                  )}
                </div>
                <div className="text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 mr-1">留言原意：</span>
                  {replyingInquiry.content}
                </div>
              </div>

              {/* 答复表单字段 */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">官方办理答复内容 *</label>
                    <span className="text-[11px] text-slate-400">请保持严谨、规范、客观的公文表述</span>
                  </div>
                  <textarea
                    rows={4}
                    value={replyFormData.reply}
                    onChange={(e) => setReplyFormData({ ...replyFormData, reply: e.target.value })}
                    placeholder="输入国专委秘书处的正式答复内容及办理意见..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">答复部门 / 经办人</label>
                    <input
                      type="text"
                      value={replyFormData.repliedBy}
                      onChange={(e) => setReplyFormData({ ...replyFormData, repliedBy: e.target.value })}
                      placeholder="如：国专委秘书处"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">答复日期 *</label>
                    <input
                      type="date"
                      value={replyFormData.replyDate}
                      onChange={(e) => setReplyFormData({ ...replyFormData, replyDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">办结状态</label>
                  <select
                    value={replyFormData.status}
                    onChange={(e) => setReplyFormData({ ...replyFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="已答复办结">已答复办结（正常结办）</option>
                    <option value="办理中">办理中（部分办结/需进一步核实）</option>
                    <option value="待审核办理">待审核办理</option>
                  </select>
                </div>

                {/* 前台公开选登同步开关 */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="publishToFrontend"
                    checked={replyFormData.publishToFrontend}
                    onChange={(e) =>
                      setReplyFormData({ ...replyFormData, publishToFrontend: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-800 cursor-pointer"
                  />
                  <label htmlFor="publishToFrontend" className="text-xs select-none cursor-pointer">
                    <span className="font-bold text-blue-900 block">
                      同步发布至前台【咨询留言公开选登】专栏
                    </span>
                    <span className="text-slate-500 text-[11px] leading-relaxed block mt-0.5">
                      勾选后，该问答将自动在前台“信息公开 &gt; 互动交流 &gt; 咨询留言公开选登”中对社会公众展示，方便同类问题查阅。
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>保存中...</span>
                    </>
                  ) : (
                    <span>提交正式答复</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 删除确认弹窗（Tailwind 原生，无 alert/confirm）
      ══════════════════════════════════════════════════════════════ */}
      {(deleteTargetLeader ||
        deleteTargetOrg ||
        deleteTargetReport ||
        deleteTargetActivity ||
        deleteTargetInquiry) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {deleteTargetInquiry ? '确认删除该条用户留言记录？' : '确认删除该项目？'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {deleteTargetInquiry
                  ? '删除后该留言将从后台收信池中永久移除，若此前已同步选登至前台也将一并撤下。'
                  : '删除后将立即生效并在前台信息公开频道对应板块中隐藏。'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetLeader(null);
                  setDeleteTargetOrg(null);
                  setDeleteTargetReport(null);
                  setDeleteTargetActivity(null);
                  setDeleteTargetInquiry(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTargetLeader) handleDeleteLeader();
                  else if (deleteTargetOrg) handleDeleteOrg();
                  else if (deleteTargetReport) handleDeleteReport();
                  else if (deleteTargetActivity) handleDeleteActivity();
                  else if (deleteTargetInquiry) handleDeleteInquiry();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          Modal: 恢复初始假数据确认弹窗（Tailwind 原生，无 alert/confirm）
      ══════════════════════════════════════════════════════════════ */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">恢复初始假数据确认</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                此操作将把“基本信息、负责人与机构信息、组织机构、年度工作报告、信用承诺、活动与项目情况、互动交流”全部重置为原有的前台演示假数据，您之后仍可在后台自由修改。
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
              >
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
