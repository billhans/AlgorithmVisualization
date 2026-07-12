# 完全背包 · 可视化教学

一个帮助理解「完全背包」的单文件网页：一维 DP 与二维 DP 同屏同步演示，
并支持「完全背包 ↔ 0/1 背包」一键切换，直观对比**正序/逆序遍历**与
**同行左侧/左上**依赖如何决定物品能否重复使用。

双击 `index.html` 即可在本地打开，无需服务器。

---

## 本地运行

直接双击 `index.html`，或起一个本地服务器（课堂局域网演示推荐）：

```bash
# Python（任选其一）
python -m http.server 8000
# 然后浏览器访问 http://localhost:8000
# 局域网内其他设备访问 http://<本机IP>:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个空仓库（例如 `knapsack-viz`），**不要**勾选初始化 README。
2. 本仓库根目录下依次执行（把 `你的用户名` 换成你的 GitHub 用户名）：

   ```bash
   git init
   git add .
   git commit -m "初始化：完全背包可视化教学网页"
   git branch -M main
   git remote add origin https://github.com/你的用户名/knapsack-viz.git
   git push -u origin main
   ```

   如果是首次推送、提示要登录，Windows 会弹出 GitHub 登录窗口，按提示授权即可。

3. 打开仓库的 **Settings → Pages**，**Source** 选 `Deploy from a branch`，
   分支选 `main`、目录选 `/ (root)`，保存。
4. 等约 1 分钟，访问：

   ```
   https://你的用户名.github.io/knapsack-viz/
   ```

> ⚠️ **国内访问提醒**：`*.github.io` 域名在国内网络下经常不稳定
> （移动/宽带常超时打不开）。若发现学生打不开，请用下面的国内可用方案。

---

## 国内可用补充方案（任选其一）

### A. Cloudflare Pages（推荐，免费且国内相对稳定）

1. 把本仓库同步到 GitHub（见上方）。
2. 打开 https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git。
3. 选刚才的仓库，框架预设选 `None`，构建命令留空，输出目录填 `.`，部署。
4. 得到 `https://knapsack-viz.pages.dev` 之类的地址。绑定自定义域名后国内访问更稳定。

### B. Vercel（免费，国内时好时坏）

```bash
npm i -g vercel
vercel        # 按提示操作
```

### C. 国内对象存储 + CDN（最稳定，需实名认证）

把 `index.html` 上传到 **腾讯云 COS** 或 **阿里云 OSS**，开启静态网站托管，
再绑一个已备案的域名 + CDN，国内秒开。适合长期给大量学生使用。

---

## 内容说明

- **默认数据**：3 个物品 (w,v)=(2,3)(3,4)(4,5)，容量 7。
  完全背包答案 10，0/1 背包答案 9——正好对比「重复使用」的差异。
- **颜色语义**：紫=当前更新格，橙=「选」依赖，蓝=「不选」依赖，绿=最终答案。
- **快捷键**：`←/→` 步进，`空格` 播放/暂停，`R` 重置，`M` 切换模式。
