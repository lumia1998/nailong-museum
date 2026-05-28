# 奶龙美术馆 - GitHub Pages 部署指南

## 站点信息
- **访问地址**: https://lumia1998.github.io/nailong-museum/
- **托管**: GitHub Pages
- **项目**: nailong-museum

---

## 部署步骤

### 第一步：创建GitHub仓库
1. 登录 https://github.com
2. 点击右上角 **+** → **New repository**
3. 仓库名称: `nailong-museum`
4. 选择 **Public**
5. 点击 **Create repository**

### 第二步：推送代码到GitHub

打开新的CMD或PowerShell窗口，执行:

```bash
cd F:\Lumia\Desktop\work\nailong-museum
git init
git add .
git commit -m "Initial commit: 奶龙美术馆"
git branch -M main
git remote add origin https://github.com/lumia1998/nailong-museum.git
git push -u origin main
```

> 当前仓库地址为 `https://github.com/lumia1998/nailong-museum`。

### 第三步：开启GitHub Pages
1. 打开仓库页面
2. 点击 **Settings** → **Pages**
3. Source 选择 **Deploy from a branch**
4. Branch 选择 **main**，文件夹选 **/ (root)**
5. 点击 **Save**

等待1-2分钟，网站将部署到:
```
https://lumia1998.github.io/nailong-museum/
```

### 第四步：验证部署

等待 GitHub Pages 部署完成后访问:
```
https://lumia1998.github.io/nailong-museum/
```

---

## 文件说明

| 文件 | 作用 |
|------|------|
| `index.html` | 网站主页面（单页面应用） |
| `css/style.css` | 样式文件 |
| `js/paintings-data.js` | 20幅名画数据 |
| `assets/images/` | 图片资源 |
| `assets/videos/` | 视频资源 |

---

## 常见问题

### Q: 网站显示404
A: 检查GitHub Pages是否已开启，仓库是否为Public

### Q: 视频无法播放
A: 检查视频文件是否已推送到GitHub，文件名是否正确

---

## 重新部署

如果修改了代码，重新部署:

```bash
cd F:\Lumia\Desktop\work\nailong-museum
git add .
git commit -m "更新描述"
git push origin main
```

GitHub Pages会自动重新部署。
