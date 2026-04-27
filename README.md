# VoiceHealth 微信小程序

AI声纹健康参考工具 - 30秒语音，生成健康参考报告

## 项目结构

```
voiceHealth-miniprogram/
├── miniprogram/           # 小程序前端
│   ├── pages/
│   │   ├── index/        # 首页（录音）
│   │   ├── report/       # 报告页
│   │   ├── history/      # 历史记录
│   │   └── profile/      # 个人中心
│   ├── images/           # 图标资源
│   ├── utils/            # 工具函数
│   ├── app.js            # 入口文件
│   ├── app.json          # 配置文件
│   └── app.wxss          # 全局样式
├── cloudfunctions/        # 云函数
│   ├── analyze/          # 音频分析
│   ├── face-analyze/     # 面部分析
│   ├── payment/          # 支付处理
│   └── payment-callback/ # 支付回调
└── project.config.json   # 项目配置
```

## 功能特性

- 🎤 30秒语音录制
- 🎯 59维声学特征分析
- ❤️ 25项健康维度参考
- 📸 面部衰老AI识别
- 📊 声纹+面部综合评估
- 🔬 科学依据与文献支持
- 📋 历史记录查看
- 💰 按次收费 (9.9元/次)
- 👑 会员制 (29.9元/月)

## 开发配置

### 1. 申请小程序AppID

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号
3. 获取 AppID

### 2. 配置云开发

1. 在微信开发者工具中开通云开发
2. 创建云环境
3. 修改 `miniprogram/app.js` 中的环境ID

```javascript
wx.cloud.init({
  env: 'your-env-id', // 替换为你的云环境ID
  traceUser: true,
})
```

### 3. 配置支付

1. 申请微信支付商户号
2. 在 `cloudfunctions/payment/index.js` 中配置子商户号

```javascript
subMchId: 'YOUR_SUB_MCH_ID', // 替换为你的子商户号
```

### 4. 上传云函数

在微信开发者工具中：
1. 右键点击 `cloudfunctions/analyze`
2. 选择 "上传并部署：云端安装依赖"
3. 对 `cloudfunctions/payment` 执行同样操作

### 5. 创建数据库集合

在云开发控制台创建以下集合：
- `reports` - 存储声纹分析报告
- `face_reports` - 存储面部分析报告
- `orders` - 存储支付订单
- `user_vip` - 存储会员信息

## 部署步骤

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目（选择 `voiceHealth-miniprogram` 目录）
3. 配置 AppID
4. 开通云开发
5. 上传云函数
6. 创建数据库集合
7. 预览/上传小程序

## 收费说明

### 按次收费
- 价格：9.9元/次
- 每天免费1次
- 超出后需付费

### 会员制
- 价格：29.9元/月
- 无限次使用
- 详细健康趋势报告

## 合规说明

**重要：本服务仅供参考，不构成医疗建议**

- 不使用"诊断""检测""筛查"等医疗词汇
- 使用"参考""建议""提醒"等表述
- 在所有页面添加免责声明
- 不卖诊断结果，卖"健康报告解读服务"

## 后续优化

1. 对接真实的声学分析后端
2. 添加更多健康维度
3. 实现健康趋势追踪
4. 添加分享功能
5. 优化UI/UX

## 联系方式

- 邮箱：support@voicehealth.ai
- 微信：VoiceHealth_AI
