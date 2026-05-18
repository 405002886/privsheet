简体中文 | [English](README_EN.md)

# PrivSheet - 纯前端 Excel 数据处理工具

> 所有数据处理均在浏览器本地完成，数据不上传，无需注册，无需联网。

产品地址：[https://privsheet.com](https://privsheet.com)

## 项目起源

这个项目源于我的妻子——她工作中需要处理大量 Excel 文档，但并不熟悉 Excel 的复杂操作。最开始我只是为她做了几个简单但必要的功能，希望能减轻她的工作压力。后来我想到，应该有很多和她一样的人：面对繁琐的 Excel 用法望而却步，只想快速完成手头的数据处理任务。于是 PrivSheet 逐渐成长为一个功能全面的便捷工具，专供那些不愿意学习繁琐 Excel 用法的用户。

## 功能一览

| 类别 | 功能 |
|------|------|
| **数据清洗** | 去除空行/空列、首尾空格、所有空格、特殊字符、日期格式统一、数字修约、全角半角转换 |
| **敏感信息脱敏** | 身份证（30+国家格式）、手机号、邮箱、姓名、自定义脱敏（快速脱敏 + 正则脱敏） |
| **拆分与合并** | 按分隔符拆分、按固定宽度拆分、合并多列、行列转置 |
| **去重与排序** | 整行去重、关键列去重、升序/降序排列、随机乱序 |
| **格式转换** | Excel → CSV / JSON / SQL INSERT / SQL IN |
| **批量提取** | 列转字符串、正则提取 |
| **统计计算** | 求和、计数、平均值、最大/最小值、批量运算、分组汇总 |
| **文本处理** | 文本替换、字母映射替换、大小写转换、首字母大写 |
| **多文件操作** | 追加行合并、横向拼接 |
| **VLOOKUP 匹配** | 精确匹配、模糊匹配、自定义未匹配填充值 |
| **工资条拆分** | 按姓名拆分为带表头工资条，支持导出 Excel / PDF |
| **自定义管道** | 组合多个操作批量顺序处理，支持步骤管理和实时预览 |
| **智能意图输入** | 自然语言输入自动识别操作意图，多意图自动进入管道模式 |

## 技术栈

- **Vue 3** + Composition API (`<script setup>`)
- **Vite 5** 构建
- **Pinia** 状态管理
- **Vue Router 4** 路由
- **Vue I18n 9** 国际化（中/英文）
- **SheetJS (xlsx)** Excel 解析
- **ExcelJS** 高保真样式 Excel 导出
- **pdfmake** PDF 生成
- **VitePWA** 离线支持

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 构建中文版
npm run build:zh

# 构建英文版
npm run build:en

# 预览构建产物
npm run preview
```

## 项目结构

```
src/
├── main.js                 # 应用入口
├── App.vue                 # 根组件
├── assets/                 # 静态资源
├── config/                 # 配置（错误码、身份证国家配置）
├── i18n/                   # 国际化设置
├── locales/                # 中英文翻译文件
├── router/                 # 路由定义
├── pages/                  # 页面组件
│   ├── HomePage.vue        # 首页（任务卡片 + 意图输入）
│   ├── TaskPage.vue        # 任务执行页（4步向导）
│   └── HelpPage.vue        # 帮助文档页
├── components/             # 组件
│   ├── common/             # 通用组件（上传、预览、加载、Toast、网络监控）
│   ├── intent/             # 意图输入组件
│   ├── pipeline/           # 管道编辑器组件
│   ├── merge/              # 多文件合并向导
│   └── lookup/             # VLOOKUP 匹配向导
├── stores/                 # Pinia 状态管理
│   ├── fileStore.js        # 文件数据、多文件、VLOOKUP、意图状态
│   ├── pipelineStore.js    # 管道步骤状态
│   └── settingsStore.js    # 主题、语言、引擎、文件大小限制
├── services/               # 业务服务
│   ├── intent/             # 意图解析引擎（规则匹配）
│   ├── pipeline/           # 管道执行引擎
│   └── toastService.js     # Toast 通知服务
└── utils/                  # 工具函数
    ├── parser/             # Excel/CSV 文件解析
    ├── operations/         # 43 个原子操作模块 + 注册表
    └── export/             # Excel/PDF 导出
```

## 数据安全

- 100% 浏览器本地处理，无数据上传功能
- 内置网络活动监控组件（NetworkMonitor）
- 无需注册账号，无需联网即可使用
- 文件大小限制：桌面端 100MB / 移动端 50MB

## 代码规范

```bash
# ESLint 检查并自动修复
npm run lint

# Prettier 格式化
npm run format
```

项目使用 Husky + Commitlint 规范提交信息，遵循 Conventional Commits 格式。

## License

Private - 保留所有权利
