# Lisa の小さなお部屋

浏览器里的温馨房间小游戏。Node.js 18+，应用无第三方运行依赖。

```sh
cd /workspace/lisa
npm run dev
```

默认端口 3000，可用 `PORT` 覆盖。点击五个区域或下方快捷按钮，Lisa 会绕开家具移动，到达后选择行动。点击空地自由移动。行动会影响状态条；状态仅保留在当前页面。时钟使用 Asia/Shanghai 时间。

## 图片资源

`public/assets/room.png` 是根据用户上传的平面图生成的背景，保留主要家具布局，并非原始上传文件。`public/assets/lisa-run.png` 是根据角色参考生成的透明四帧奔跑精灵图，使用 CSS 帧动画播放。地图碰撞采用归一化矩形和网格寻路，后续更换地图需要同步调整 `public/app.js` 的区域和障碍物。

## 验证

`npm test` 使用当前云环境提供的 Playwright 和 `/usr/bin/chromium` 执行浏览器功能测试。其他环境需先安装 Playwright，并通过 `CHROMIUM_PATH` 指定 Chromium。测试前启动服务器。测试涵盖五个区域的到达和行动、帮助弹窗、手机布局及控制台错误。
