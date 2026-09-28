# 中国高校校办产业协会国际合作与交流专业委员会
## 官方数字化综合门户与内容管理系统 (CAUI-ICEC Portal & CMS)

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 📌 项目简介

本项目为**中国高校校办产业协会国际合作与交流专业委员会**（International Cooperation and Exchange Committee of the Chinese Association of University-run Industries，简称“国专委 / CAUI-ICEC”）的官方数字化综合门户与后台内容管理平台。

系统定位于服务全国高等院校、校办骨干产业、大学科技园及技术转移机构，全面展示跨国产学研融合发展新范式、科技成果全球转化、涉外合作对接、行业智库标准及规范信息公开。

系统采用现代化的前后端一体化架构：
- **前台门户**：面向公众、高校会员与海外友好机构，提供权威新闻发布、通告申报、项目库检索、会员风采展示、智库报告查阅与依法信息公开。
- **后台 CMS**：面向国专委秘书处与管理员，提供针对全站 8 大业务频道的全生命周期内容编排、资质审核、数据可视化统计与云端实时配置管理。

---

## 🛠️ 技术栈选型

| 领域 / 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **基础框架** | **Next.js 16 (App Router)** | 基于最新 Next.js 架构，结合 Turbopack 高速编译与 React Server Components |
| **核心视图** | **React 19** | 纯声明式 UI，深度集成 Hooks 体系与状态驱动模型 |
| **样式体系** | **Tailwind CSS v4** | 现代化原子化 CSS，采用科技政务蓝（Brand Blue）与中性灰（Slate）色彩体系 |
| **云端数据库** | **Cloud Firestore** | Google Firebase 分布式 NoSQL 实时文档数据库，实现全站客户端毫秒级 `onSnapshot` 动态订阅 |
| **权限认证** | **Firebase Authentication** | 严谨的管理员身份安全验证，全方位守卫后台路由与 API 访问权限 |
| **开发语言** | **TypeScript 5.x** | 全链路强类型约束，规范严密的数据接口契约 |
| **图标与字体** | **Geist & Custom SVG** | 针对企业级/政务级排版优化的字体与高清晰度矢量图标体系 |

---

## 🌟 核心功能架构

系统整体分为**前台公共门户**与**后台内容管理系统（CMS）**两大体系，且全频道支持**数据动态双向绑定**与**4秒网络安全熔断容灾**机制（数据库网络波动时自动采用高保真预置数据平滑兜底，确保门户 100% 高可用）。

### 一、前台公共门户

1. **门户综合首页 (`/`)**
   - **Header & 品牌标识区**：官方会徽（Favicon / Logo）、服务热线与快捷通道、全站多维度即时搜索栏。
   - **Hero 主视觉轮播区**：国家战略与国际协同标语、核心发展指标动态展示、入会与合作行动入口。
   - **新闻资讯与通知公告**：集成分类 Tab 切换、滚动要闻摘要与“紧急/公示中/进行中”状态角标。
   - **办事入口矩阵**：提供入会申请、需求提报、证书核验等高频服务直通车。
   - **国际合作与智库成果专区**：展示重点海外联合实验室与高频下载智库白皮书。
   - **会员与友好机构轮播**：全国重点高校与科技集团名录快速导航。
   - **官方 Footer**：分支机构性质合规声明、秘书处通信地址、备案号及监督联络方式。

2. **国专委概况频道 (`/guozhuanwei-gaikuang`)**
   - **吸顶快速子导航**：集成滚动监听联动（Scrollspy），页面滚动至哪个板块，顶部蓝色胶囊气泡实时自动对准跟随。
   - **六大核心法定板块**：
     - 国专委简介（明确表述协会分支机构性质）
     - 成立批复与工作规则（民政部/教育部批复背景、规章制度）
     - 组织架构与会员名录
     - 秘书处与办事机构职责分布
     - 历年发展大事记时间轴
     - 官方秘书处联络方式与在线留言通道

3. **新闻中心频道 (`/news`)**
   - 细分为三大核心频道：**国专委要闻**、**会员单位动态**、**媒体关注与报道**。
   - 具备独立二级吸顶滚动导航，直连数据库实时发布，支持免刷新模态框全文阅览。

4. **通知公告与政策频道 (`/notice`)**
   - 包含**最新通知公告**、**对外发文**、**项目申报**、**活动报名**、**政策法规**、**办理须知**六大板块。
   - 包含多维分类筛选器与关键字即时搜索，支持截止时间提醒与公文全文阅览。

5. **国际合作频道 (`/international`)**
   - **合作项目库**：国别、领域、年度、状态四维交集筛选器。
   - **国别与区域**、**共建“一带一路”专题**、**涉外交流活动**。
   - **合作需求与对接大厅**：国内单位技术需求与海外机构合作意向双向看板，支持线上直接提交撮合线索（加注合规提示）。
   - **国际组织与友好机构**：海外大学网络与友好商协会合作名录。

6. **会员单位与服务频道 (`/members`)**
   - **会员单位名录**：按高等院校、校办企业、技术转移机构、大学科技园分类与全国地区交互筛选。
   - **会员单位风采**：展示产学研出海与科技成果转化典型标杆案例。
   - **入会指引**：协会统一入会申请入口（外链跳转）、准入条件、材料清单与4步申请流程。
   - **服务事项与办事指南**：秘书处出具证明、课题立项、海外对接等常态化服务清单。

7. **成果与智库频道 (`/achievements`)**
   - **科技成果与技术需求对接**：供方（科技成果）与需方（技术需求）双维切换检索。
   - **团体标准 T/CAUI**：发布协会立项起草与正式发布的产学研团体标准。
   - **智库研究报告**、**典型实践案例**、**国际产业专家库**及**专业培训体系**。

8. **信息公开频道 (`/disclosure`)**
   - 严格遵循社会组织信息公开监管规范，公开**基本信息**、**负责人信息**、**组织机构**、**历年年度工作报告全文**、**行业自律与信用承诺**、**立项与公示**。
   - 提供**诉求池与意见建议在线提交渠道**。

---

### 二、后台内容管理系统（CMS）

- **统一入口**：`/admin/login`（安全登录） ➔ `/admin/dashboard`（控制台）
- **核心功能**：
  1. **安全校验与全局拦截**：基于 Firebase Auth 监听身份令牌，未登录自动受控重定向至登录页。
  2. **数据看板概览**：统计全站新闻、通知、项目、会员、专家库各项数据规模与最新动态日志。
  3. **国专委概况管理**：实时修改法定声明、批复文号、规则制度、机构职责与大事记。
  4. **新闻中心管理**：支持图文新闻发布、分类归属（要闻/会员/媒体）、置顶与删除。
  5. **通知公告管理**：发布公文、设置办理截止日期、更新申报状态（进行中/公示中/已办结）。
  6. **国际合作管理**：项目库录入、国别政策、一带一路动态与合作需求线索池审核。
  7. **会员单位管理**：会员资质审验、名录维护、风采案例上架与入会指引配置。
  8. **成果与智库管理**：供需双向发布、团体标准更新、研究报告维护与专家档案管理。
  9. **信息公开管理**：年度工作报告全文录入、信用承诺书维护与公众诉求工单流转。
  10. **防错与重置机制**：针对各大频道均内置“恢复初始演示数据”功能，便于演示与紧急数据修复。

---

## 💻 本地环境搭建与启动

### 1. 环境准备
确保本地已安装运行环境：
- **Node.js**：`>= 18.18.0`（推荐使用 Node.js LTS 20.x 或 22.x）
- **包管理器**：`npm`（默认）或 `pnpm` / `yarn`

### 2. 获取代码与依赖安装
克隆或进入项目根目录后执行：
```bash
# 进入项目目录
cd D:/companysite

# 安装项目依赖包
npm install
```

### 3. 配置 Firebase 环境变量
在项目根目录下创建 `.env.local` 文件，填入您的 Firebase 开发者凭据：
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```
*(注：项目内置了安全的演示配置与本地 Fallback 兜底方案，在未绑定外部 Firebase 时依然支持前台完整浏览)*

### 4. 启动本地开发服务器
运行开发调试命令：
```bash
npm run dev
```
控制台将输出启动信息，在浏览器中访问：
- **前台官网门户**：[http://localhost:3000](http://localhost:3000)
- **后台管理系统**：[http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
  - *(首次进入若未登录将自动跳转至 `/admin/login`)*

### 5. 项目构建与生产部署
```bash
# 执行生产环境优化构建
npm run build

# 启动生产服务器
npm run start

# 代码规范检查
npm run lint
```

---

## 📂 项目关键目录结构

```text
D:/companysite/
├── app/                              # Next.js App Router 根路由体系
│   ├── layout.tsx                    # 全局根布局 (含官方 Favicon、全局元数据、Navbar、Footer)
│   ├── page.tsx                      # 门户首页
│   ├── globals.css                   # 全局样式与 Tailwind CSS 配置
│   ├── favicon.ico / icon.png        # 协会官方会徽图标文件
│   ├── guozhuanwei-gaikuang/page.tsx # 国专委概况独立页面
│   ├── news/page.tsx                 # 新闻中心独立页面
│   ├── notice/page.tsx               # 通知公告独立页面
│   ├── international/page.tsx        # 国际合作独立页面
│   ├── members/page.tsx              # 会员单位与服务独立页面
│   ├── achievements/page.tsx         # 成果与智库独立页面
│   ├── disclosure/page.tsx           # 信息公开独立页面
│   └── admin/                        # 后台管理系统模块
│       ├── login/page.tsx            # 管理员安全认证登录页
│       └── dashboard/                # 控制台工作区
│           ├── layout.tsx            # 后台管理响应式侧边栏布局
│           ├── page.tsx              # 仪表盘数据概览
│           ├── profile/page.tsx      # 国专委概况管理
│           ├── news/page.tsx         # 新闻管理
│           ├── notices/page.tsx      # 通知公告管理
│           ├── projects/page.tsx     # 国际合作管理
│           ├── members/page.tsx      # 会员管理
│           ├── achievements/page.tsx # 成果智库管理
│           └── disclosure/page.tsx   # 信息公开管理
├── components/                       # 全局复用 UI 组件
│   ├── Navbar.tsx                    # 官方吸顶主导航栏
│   └── Footer.tsx                    # 官方页脚合规信息与联系方式
├── lib/                              # 基础库与预置数据中心
│   ├── firebase.ts                   # Firebase 客户端与 Firestore 实例初始化
│   ├── gaikuangData.ts               # 国专委概况标准数据模型与预置基底
│   ├── internationalData.ts          # 国际合作标准数据模型与预置基底
│   ├── membersData.ts                # 会员频道标准数据模型与预置基底
│   ├── achievementsData.ts           # 成果智库标准数据模型与预置基底
│   └── disclosureData.ts             # 信息公开标准数据模型与预置基底
├── public/                           # 静态资源存放目录
│   ├── logo.png                      # 协会官方高清会徽标志
│   └── favicon.ico                   # 静态图标
├── next.config.ts                    # Next.js 运行时配置
├── tsconfig.json                     # TypeScript 配置文件
└── package.json                      # 依赖与脚本定义
```

---

## ⚖️ 知识产权与合规声明

1. **机构性质**：本网站所呈现之“国际合作与交流专业委员会”系中国高校校办产业协会所属分支机构，非独立法人社会团体。
2. **版权归属**：© 2026 中国高校校办产业协会国际合作与交流专业委员会 版权所有。
3. **内容防伪**：所有对外合作项目、会议通告及评审证书均以本网站正式公开发文及协会正式批文为准。
