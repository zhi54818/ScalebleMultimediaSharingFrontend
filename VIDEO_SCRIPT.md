# 5 分钟视频演示演讲稿

## 【开场 - 30 秒】

大家好，我是[你的名字]。今天我要为大家演示我开发的多媒体分享平台。这是一个全栈应用，后端使用 Spring Boot，前端使用 Vue3，所有数据都存储在 Azure 云服务上。

## 【第一部分：应用演示 - 2 分钟】

### 登录和注册（20 秒）

首先看登录注册功能。用户可以注册账号，系统会验证密码长度。登录后，用户信息保存在 Session 中。

### CRUD 操作演示（1 分 40 秒）

**上传图片 - 创建操作（40 秒）**
现在演示上传功能。点击"Upload Picture"按钮，我选择一张图片。上传时，图片会保存到 Azure Blob Storage，图片信息保存到 MongoDB。上传成功，图片立即出现在列表中。

**查看列表 - 读取操作（20 秒）**
这里显示所有图片，支持分页，每页 12、24 或 48 张。还可以搜索图片名称。

**编辑图片 - 更新操作（30 秒）**
点击编辑按钮，可以修改图片名称、描述和分类。保存后，数据更新到数据库。

**删除图片 - 删除操作（30 秒）**
可以删除单张图片，也可以批量选择删除。删除会同时从 Azure Blob Storage 和 MongoDB 移除。

## 【第二部分：Azure 资源展示 - 1 分 30 秒】

### Azure Blob Storage（30 秒）

打开 Azure 门户，这是 Azure Blob Storage。存储账户是 whwblobstorage，容器是 multimedia。所有图片都在这里，可以通过 HTTPS URL 访问。

### Azure Cosmos DB（30 秒）

这是 Azure Cosmos DB，使用 MongoDB API。存储用户信息、图片元数据等业务数据。连接字符串配置在环境变量中。

### Redis 缓存（20 秒）

系统用 Redis 存储 Session，保证登录状态持久化。Session 过期时间 30 天。

### 应用部署（10 秒）

后端部署在 Azure App Service，端口 8123，路径前缀是/api。

## 【第三部分：REST API 端点 - 1 分钟】

打开 API 文档，展示 REST API 端点：

**用户 API：**

- POST /api/user/register - 注册
- POST /api/user/login - 登录
- GET /api/user/get/login - 获取当前用户
- POST /api/user/logout - 登出

**图片 API：**

- POST /api/picture/upload - 上传图片
- POST /api/picture/edit - 编辑图片
- POST /api/picture/delete - 删除图片
- POST /api/picture/delete/batch - 批量删除
- GET /api/picture/get/vo - 获取图片详情
- POST /api/picture/list/page/vo - 分页列表

所有 API 遵循 RESTful 规范，使用标准 HTTP 方法和状态码。

## 【第四部分：高级功能说明 - 30 秒】

关于高级功能：

目前项目未集成 Application Insights，但架构支持后续添加。可以通过添加依赖和配置连接字符串启用。

当前使用日志监控，关键操作都有日志，可通过 Azure App Service 日志流查看。

计划添加 Application Insights，收集性能指标、依赖跟踪和异常监控，提升可观测性。

## 【结尾 - 30 秒】

总结：项目实现了完整 CRUD，使用 Azure Blob Storage 存储文件，Azure Cosmos DB 存储数据，Redis 管理 Session。所有功能通过 RESTful API 提供，前端使用 Vue3 和 Arco Design Vue 构建。

感谢观看，欢迎提问。

---

## 【时间控制】

- 开场：30 秒
- 应用演示：2 分钟
- Azure 资源：1 分 30 秒
- API 端点：1 分钟
- 高级功能：30 秒
- 结尾：30 秒
  **总计：约 5 分钟**

## 【演示前检查清单】

- [ ] 应用正在运行
- [ ] Azure 门户已登录
- [ ] API 文档页面已打开
- [ ] 准备好测试图片
- [ ] 摄像头已开启（如需要）
- [ ] 屏幕录制软件已启动
