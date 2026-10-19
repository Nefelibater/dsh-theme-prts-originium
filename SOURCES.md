# 素材与设计参考

这个主题为用户个人使用而制作。界面布局、测绘线、菱形图标与样式为本次新设计；游戏美术与官网字体的权利属于各自权利人。没有使用 AI 生成插画。

## 随包素材

- `assets/originiums.png`：明日方舟中国官网世界观「源石」原图，未改动文件内容。来源页面：<https://ak.hypergryph.com/>；原资源：<https://web.hycdn.cn/arknights/official/_next/static/media/originiums.9f8e9628.png>。
- `assets/Bender-Regular.woff2`：官网使用的 Bender Regular。原资源：<https://web.hycdn.cn/arknights/official/_next/static/media/Bender-Regular.6950ba72.woff2>。
- `assets/Bender-Bold.woff2`：官网使用的 Bender Bold。原资源：<https://web.hycdn.cn/arknights/official/_next/static/media/Bender-Bold.b4c7998a.woff2>。
- `assets/priestess-memory.jpg`：用户现有主题素材中的官方普瑞赛斯天台 CG 副本，只在侧栏记忆残片展开时出现；未修改原文件。原工作区相对位置为 `theme-build/assets/background.jpg`。
- `assets/priestess-hand.jpg`：普瑞赛斯握手画面。取得自社区文章转载，未修改原文件；来源页：<https://www.bilibili.com/read/cv14965476/>；图片：<https://i0.hdslb.com/bfs/article/11db084cab99a397dc91a6b44ba8749581cb3298.jpg>。
- `assets/priestess-night.webp`：普瑞赛斯夜色中的记忆画面。取得自社区转载，未核实到官方原始发布文件；来源页：<https://www.kangehao.com/news/111598.html>；图片：<https://news.kangehao.com/news/mm/2025_13/86402b5efe447dd9889a8f41a8b2aaf6.webp>。未修改图片内容，卡片仅通过 CSS 适配显示。
- `icon.svg`：本次制作的几何主题图标。
- `src/schematic.svg`：本次以代码制作的原创晶体切面、测量线、轨道和记录标记；不是官方图标或游戏 UI 的提取文件。
- `src/originium-mesh.mjs` 与 `model/originium-crystal.glb`：参考用户给出的二维源石图重新构造的原创三维晶簇。共有 224 块晶体与碎片；主体 7,398 个三角面，加上菱形薄框与光晕后共 8,134 个三角面。背面与厚度由本次设计补全。1.3 中的空心光印、暗红光与黑曜石材质参考用户补充的同一源石画面。不是官方 3D 资源，也不是通过贴图平面假装旋转。
- `src/originium-viewer.js`：本次编写的本地 WebGL 查看器和材质着色器，无外部 3D 引擎依赖。

模型导出采用 Khronos 的 [清漆材质扩展](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_clearcoat)、[无光照材质扩展](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit)与[点光源扩展](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_lights_punctual)。这些是格式实现参考，未加入外部引擎代码或贴图。

## 设计研究

- 《明日方舟》游戏概念宣传 PV-4：<https://www.bilibili.com/video/BV1VC411H78i/>。用户截帧中的测绘式线稿、线性分区与留白用于构图研究。
- 《明日方舟：终末地》特别映像「塔卫二：一号简报」：<https://www.bilibili.com/video/BV1Vbpc6QE6o/>。用户截帧中的标记、编号与局部金色信息层用于设计研究。
- 《明日方舟：终末地》官网：<https://endfield.hypergryph.com/>。查看公开页面和样式，研究工业排版、界面层级与标识组织。
- 明日方舟中、日官网：<https://ak.hypergryph.com/>、<https://www.arknights.jp/>。核对源石美术及 Bender / Oswald 等字体使用方式。
- 用户补充的三张游戏截图：仅用于理解源石黑色晶体与内部琥珀金能量的材质关系，未把低分辨率截图用作主题背景或启动画面。

下载日期：原主题素材为 2026-10-18，新增记忆画面为 2026-10-19。运行时不访问这些网站；使用的素材已经包含在客户端中。此包为个人主题，未发布到插件市场。这里的来源记录不是对游戏美术或字体的再许可。
