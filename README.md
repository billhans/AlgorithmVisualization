# 毕老师 · 算法可视化

> 让算法变得看得见、学得会。

通过逐帧动画与双表对照可视化，把抽象的算法过程变成眼前可见的每一步。
纯前端实现，无任何外部依赖，双击 HTML 即可在本地打开，适合课堂教学与自学。

---

## 项目规划 · 六大算法模块

| 模块 | 内容 | 状态 |
|------|------|------|
| 排序算法 | 冒泡 / 选择 / 插入 / 快排 / 归并 | 敬请期待 |
| 基础算法 | 枚举 / 递归 / 分治 / 前缀和 / 双指针 | 敬请期待 |
| 搜索算法 | 二分 / BFS / DFS / 回溯 | 敬请期待 |
| **动态规划** | **0/1 背包 / 完全背包** | **已上线 ✅** |
| 图论算法 | 最短路 / 最小生成树 / 拓扑排序 | 敬请期待 |
| 字符串算法 | KMP / 字典树 / 哈希 | 敬请期待 |

主页 `index.html` 为六大模块入口；未上线模块点击会弹出「敬请期待」提示。

---

## 当前上线内容 · 动态规划

- **完全背包**（`dp/complete-knapsack.html`）：物品可重复使用，一维内层 `j` 正序遍历。
- **0/1 背包**（`dp/01knapsack.html`）：每物最多选一次，一维内层 `j` 逆序遍历。

两个页面都用「二维 DP 表 + 一维滚动数组表」同屏同步演示，并用箭头标出
每一格「选 / 不选」的依赖来源，把正序 vs 逆序、同行左侧 vs 左上的差异讲透。

**默认数据**：3 个物品 (w,v)=(2,3)(3,4)(4,5)，容量 7。
完全背包答案 10，0/1 背包答案 9 —— 正好对比「能否重复使用」的差异。

**颜色语义**：紫 = 当前更新格，橙 = 「选」依赖，蓝 = 「不选」依赖，绿 = 最终答案。

---

## 目录结构

```
ZCodeProject/
├── index.html              # 主页：六大模块入口
├── dp/                     # 动态规划模块
│   ├── knapsack.css        # 背包页公共样式
│   ├── knapsack-core.js    # 背包页公共逻辑（initKnapsack）
│   ├── 01knapsack.html     # 0/1 背包（逆序遍历）
│   └── complete-knapsack.html  # 完全背包（正序遍历）
└── README.md
```

---

## 本地运行

直接双击 `index.html` 即可在浏览器打开，无需服务器。

课堂局域网演示推荐起一个本地服务器：

```bash
# Python（任选其一）
python -m http.server 8000
# 然后浏览器访问 http://localhost:8000
# 局域网内其他设备访问 http://<本机IP>:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个空仓库（例如 `algo-visualizer`），**不要**勾选初始化 README。
2. 本仓库根目录下依次执行（把 `你的用户名` 换成你的 GitHub 用户名）：

   ```bash
   git init
   git add .
   git commit -m "毕老师算法可视化：主页与动态规划模块"
   git branch -M main
   git remote add origin https://github.com/你的用户名/algo-visualizer.git
   git push -u origin main
   ```

   如果是首次推送、提示要登录，Windows 会弹出 GitHub 登录窗口，按提示授权即可。

3. 打开仓库的 **Settings → Pages**，**Source** 选 `Deploy from a branch`，
   分支选 `main`、目录选 `/ (root)`，保存。
4. 等约 1 分钟，访问：

   ```
   https://你的用户名.github.io/algo-visualizer/
   ```

> ⚠️ **国内访问提醒**：`*.github.io` 域名在国内网络下经常不稳定
> （移动/宽带常超时打不开）。若发现学生打不开，请用下面的国内可用方案。

### 国内可用补充方案（任选其一）

**A. Cloudflare Pages（推荐，免费且国内相对稳定）**

1. 把本仓库同步到 GitHub（见上方）。
2. 打开 https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git。
3. 选刚才的仓库，框架预设选 `None`，构建命令留空，输出目录填 `.`，部署。
4. 得到 `https://algo-visualizer.pages.dev` 之类的地址。

**B. Vercel（免费，国内时好时坏）**

```bash
npm i -g vercel
vercel        # 按提示操作
```

**C. 国内对象存储 + CDN（最稳定，需实名认证）**

把整个目录上传到 **腾讯云 COS** 或 **阿里云 OSS**，开启静态网站托管，
再绑一个已备案的域名 + CDN，国内秒开。

---

## 快捷键（背包子页）

| 按键 | 功能 |
|------|------|
| `←` | 上一步 |
| `→` | 下一步 |
| `空格` | 播放 / 暂停 |
| `R` | 重置 |
