# VoiceHealth 微信小程序

> AI声纹健康检测微信小程序 - 30秒语音，生成健康参考报告

## 功能特性

### 核心功能
- **语音健康检测** - 录制30秒语音，AI分析59维声学特征
- **面部衰老分析** - 拍照或从相册选择，AI评估6个面部维度
- **综合健康评估** - 声纹+面部双维度，6项健康指标
- **健康报告** - 详细的风险评估和健康建议
- **历史记录** - 查看所有检测记录和趋势

### 科学依据
- 理论基础：声纹生物标志物
- 学术文献：6篇核心论文
- 技术原理：59维特征提取 pipeline
- 临床验证：87.3%准确率，50000+样本

## 项目结构

```
voicehealth-miniprogram/
├── cloudfunctions/          # 云函数
│   ├── analyze/            # 语音分析
│   ├── face-analyze/       # 面部分析
│   ├── payment/            # 支付
│   └── payment-callback/   # 支付回调
├── miniprogram/            # 小程序前端
│   ├── pages/              # 页面
│   │   ├── index/          # 首页（录音）
│   │   ├── report/         # 报告详情
│   │   ├── history/        # 历史记录
│   │   ├── profile/        # 个人中心
│   │   ├── science/        # 科学依据
│   │   ├── face/           # 面部分析
│   │   └── combined/       # 综合评估
│   ├── utils/              # 工具函数
│   ├── images/             # 图标资源
│   ├── app.js              # 应用入口
│   ├── app.json            # 应用配置
│   ├── app.wxss            # 全局样式
│   └── config.js           # 配置文件
├── project.config.json     # 项目配置
└── README.md               # 项目说明
```

## 快速开始

### 1. 环境准备
- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号，获取 AppID

### 2. 配置项目
1. 打开微信开发者工具
2. 导入项目，选择 `voicehealth-miniprogram` 目录
3. 填入你的 AppID

### 3. 配置云开发
1. 在开发者工具中开通云开发
2. 创建云环境，获取环境ID
3. 修改 `miniprogram/config.js` 中的 `cloudEnv`

### 4. 部署云函数
1. 右键点击 `cloudfunctions` 目录
2. 选择"上传并部署：云端安装依赖"
3. 依次部署所有云函数

### 5. 配置后端API
1. 修改 `miniprogram/config.js` 中的 `api.baseUrl`
2. 确保后端API服务已启动
3. 云函数中的 `API_BASE` 也需要同步修改

## 配置说明

### config.js 配置项

```javascript
module.exports = {
  // 云环境ID
  cloudEnv: 'your-cloud-env-id',
  
  // API配置
  api: {
    baseUrl: 'https://your-api-domain.com',
    devBaseUrl: 'http://localhost:8100',
    useDev: false  // 开发时设为true
  },
  
  // 支付配置
  payment: {
    singlePrice: 990,      // 单次9.9元
    vipMonthlyPrice: 2990, // 会员29.9元/月
    freePerDay: 1          // 每天免费1次
  },
  
  // 录音配置
  analysis: {
    maxDuration: 60000,    // 最长60秒
    recommendDuration: 30, // 推荐30秒
    sampleRate: 16000,
    format: 'wav'
  }
}
```

## 页面说明

### 首页 (index)
- 录音按钮（带波纹动画）
- 实时计时
- 免费次数显示
- 功能入口（科学依据、面部分析、综合评估）

### 报告页 (report)
- 健康评分（环形图）
- 声学特征（6维雷达图）
- 风险评估（心血管、呼吸、神经）
- AI健康建议
- 分享功能

### 历史记录 (history)
- 检测记录列表
- 评分趋势图
- 筛选和排序

### 个人中心 (profile)
- 用户信息
- VIP状态
- 检测统计
- 设置入口

### 科学依据 (science)
- 理论基础
- 学术文献
- 技术原理
- 临床验证

### 面部分析 (face)
- 拍照/相册选择
- 6维评估（皱纹、色斑、紧致度等）
- AI预测年龄

### 综合评估 (combined)
- 声纹+面部双维度
- 6项健康指标
- 综合评分和建议

## 云函数说明

### analyze
- 功能：语音分析
- 输入：音频文件
- 输出：健康报告、特征数据、AI建议
- 对接：后端 `/api/v1/analyze`

### face-analyze
- 功能：面部分析
- 输入：图片URL
- 输出：面部评估报告
- 对接：后端 `/api/v1/face/analyze`

### payment
- 功能：创建支付订单
- 输入：支付类型、金额
- 输出：支付参数
- 对接：微信支付

### payment-callback
- 功能：处理支付结果
- 输入：订单ID、支付状态
- 输出：更新订单和VIP状态

## 后端API对接

小程序对接 VoiceHealth 后端 API：

```
POST /api/v1/analyze          # 语音分析
POST /api/v1/face/analyze     # 面部分析
GET  /api/v1/records          # 历史记录
GET  /api/v1/records/:id      # 记录详情
GET  /api/v1/trends           # 趋势数据
GET  /api/v1/stats            # 用户统计
POST /api/v1/user/register    # 用户注册
POST /api/v1/user/login       # 用户登录
GET  /api/v1/user/profile     # 用户档案
PUT  /api/v1/user/profile     # 更新档案
GET  /api/v1/diseases         # 疾病列表
GET  /api/v1/health           # 健康检查
```

## 商业模式

### 免费用户
- 每天1次免费检测
- 查看基础报告
- 查看历史记录

### 付费用户
- 单次购买：9.9元/次
- 会员订阅：29.9元/月
- 无限次检测
- 完整报告
- 趋势分析
- AI深度建议

## 开发说明

### 本地开发
1. 修改 `config.js` 中 `api.useDev: true`
2. 启动后端服务：`cd ~/Desktop/voiceHealth && python -m uvicorn src.api.main:app --port 8100`
3. 在微信开发者工具中调试

### 测试账号
- 开发阶段使用模拟数据
- 云函数会自动返回测试报告

### 注意事项
- 录音需要用户授权
- 支付需要配置微信支付商户号
- 云开发需要开通并配置环境

## 相关项目

- **VoiceHealth 后端**：`~/Desktop/voiceHealth`
- **GitHub 仓库**：[MoKangMedical/voicehealth](https://github.com/MoKangMedical/voicehealth)
- **在线演示**：https://mokangmedical.github.io/voicehealth/

## 更新日志

### v1.0.0 (2026-04-27)
- 完成7个页面开发
- 完成4个云函数
- 对接真实后端API
- 添加全局样式系统
- 完善错误处理
- 添加模拟数据支持

## 联系方式

- 邮箱：support@voicehealth.ai
- 微信：VoiceHealth_AI

## 免责声明

本服务生成的报告仅供参考，不构成医疗建议。如有健康问题，请咨询专业医生。
