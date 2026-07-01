# AI Children English Learning System

本项目的长期目标是构建一个 AI 驱动的儿童英语认知学习系统：

英语句子 -> 听力播放 -> 图像选择 -> 语义理解 -> 错题复现 -> 学习报告。

它不是单纯题库，也不是单纯游戏，而是围绕“英语到画面理解能力”建立的自动化学习平台。

## 系统目标

输入：

- Level 范围，长期可扩展到 Level 1-800
- 年龄段与阶段目标
- 课程生成规则

输出：

- 课程句子
- 图片生成 prompt
- TTS 音频路径
- 学习路径
- 错题复习计划
- 家长控制与学习报告数据

## 五层架构

### 1. Content Engine

负责生成课程内容。核心原则：

- 一句英文对应一个画面
- 不使用复杂句、从句、解释句
- 每个阶段只引入一个主要认知变量
- 70% 复现，30% 微变化

长期 Level 结构：

- Level 1-130：动作
- Level 131-260：物品 + 场景
- Level 261-400：位置 + 数量
- Level 401-550：颜色 + 描述
- Level 551-650：家庭 + 社交
- Level 651-800：综合理解

基础模板：

- `The X is V-ing.`
- `The X is on/in/under Y.`
- `There are + number + objects.`
- `My mother is V-ing.`

基础内容结构：

```json
{
  "id": "L101_Q01",
  "level": 101,
  "sentence": "The boy is running.",
  "concept": "action",
  "difficulty": 1
}
```

### 2. Image Engine

输入：`sentence`

输出：`image_prompt`

固定风格：

- children's picture book illustration
- soft pastel colors
- clean background
- single subject
- centered composition
- warm lighting
- same finished illustration quality as the Level 1-100 production images
- polished rounded cartoon characters with clean outlines
- full-body or clearly framed subject with no cropped limbs
- not a simplified vector placeholder
- no stick-figure or geometric icon style
- no text
- no watermark

生产规则：

- 默认使用 12 格拼图：4 列 x 3 行，每格接近方形，兼顾速度、额度和清晰度
- 高风险内容使用 6 格拼图：3 列 x 2 行，包括精确数量、位置关系、颜色唯一差异、家庭角色差异
- 禁止 30 格大拼图作为生产方案，因为单格过小，容易出现裁切、串图、数量错误和简笔占位风格
- 每张裁出的最终题图统一为 `840x630`
- 画面必须保持 Level 1-100 的完成度：绘本风、主体完整、低干扰、无文字、无水印
- 如果生图出现漏格、错位、人物身份不清、动作多变量、数量错误，必须丢弃该拼图并拆成 6 格重做

示例：

```json
{
  "image_prompt": "A cute polished children's picture book illustration of a boy running in a park, same finished illustration quality as the Level 1-100 production images, soft pastel colors, clean background, centered subject, warm lighting, rounded cartoon character, clean outlines, no cropped limbs, not a simplified vector placeholder, no text, no watermark",
  "style": "children_book"
}
```

### 3. TTS Engine

输入：`sentence`

输出：`audio_url`

规则：

- 英语标准发音
- 支持 female / male 两种音色
- 同一 Level 内保持音色一致
- 默认音色可由产品配置决定

结构：

```json
{
  "audio_url": "assets/textbook/audio-male/level-101/q001.m4a",
  "voice": "male_us_01"
}
```

### 4. Memory Engine

当孩子答错时，系统记录错题，并在后续进度插入复现。

复现规则：

- +3 题后复现
- +10 题后复现
- +25 题后复现

结构：

```json
{
  "question_id": "L101_Q01",
  "review_schedule": [3, 10, 25],
  "status": "active"
}
```

实现原则：

- 不改变原题结构
- 不改变原关卡主线顺序
- 到期错题优先显示
- 复现题答对后继续原学习进度

### 5. Parent Panel

家长系统用于后续版本，不在当前原型中强行加入。

计划能力：

- 孩子档案：小名、年龄、学习进度
- 学习报告：正确率、薄弱主题、完成时间
- 错题查看：wrongList、手动复习
- 学习控制：每日关卡数、每日学习时长

报告结构：

```json
{
  "level": 132,
  "accuracy": 0.78,
  "weak_topics": ["prepositions"]
}
```

## 自动生成流程

```text
Level 输入
  -> 生成句子
  -> 生成图片 Prompt
  -> 生成音频路径
  -> 写入学习系统
  -> 同步记忆系统
  -> 后续同步家长面板
```

## 当前项目落地状态

当前原型已经优先落地：

- Level 1-100 可播放内容
- Level 101-300 结构化课程数据生成
- 图片 prompt 生成规则
- 答案左右随机
- 连续 3 题不固定同一侧
- 错题 +3/+10/+25 复现数据机制
- 关卡选择、语速、音色、中文提示、英文提示、结果鼓励

尚未落地：

- Level 101-300 的完整图片与音频资产
- Level 301-800 内容生成
- 家长面板
- 用户账号系统
- 付费系统

## 商业结构草案

- Free：Level 1-50
- Paid：Level 51-800
- Pro：家长分析、多孩子管理、错题 AI 分析

## 核心定义

用 AI 自动生成“英语 -> 图像 -> 听力 -> 记忆”的完整学习闭环。
