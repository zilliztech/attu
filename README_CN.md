# Attu - Milvus 的 AI 工作台

![GitHub release](https://img.shields.io/github/v/release/zilliztech/attu)
[![Docker pulls](https://img.shields.io/docker/pulls/zilliz/attu)](https://hub.docker.com/r/zilliz/attu/tags)
![GitHub stars](https://img.shields.io/github/stars/zilliztech/attu)
[![English](https://img.shields.io/badge/README-English-blue.svg)](./README.md)

Attu 是面向 [Milvus](https://milvus.io) 向量数据库的 AI 原生管理工具。通过一个 Attu 实例连接多个 Milvus 集群，浏览集合、执行向量搜索、管理备份、监控运行状态，并与了解数据上下文的 AI Agent 对话。

支持 **Web 应用**（Docker、Kubernetes 或独立服务端安装包）和 **桌面应用**（macOS、Linux、Windows）。

![Attu 3.0 集群概览](.github/images/v3/01-overview.png)

---

## v3.0 新功能

Attu 3.0 扩展了对 Milvus 3.0 的可视化支持，同时兼容 Milvus 2.6.0+ 和 Zilliz Cloud。主要更新包括：

- **外部集合与快照**：无需将数据复制到 Milvus，即可探索 Parquet 和 Iceberg 数据；支持刷新外部集合的结构和数据，以及浏览、恢复集合快照。
- **文本与 Schema 演进**：支持 Milvus `TEXT` 字段，在 Schema 页面添加或删除受支持的字段、编辑描述和管理 Function Fields（函数字段）。
- **搜索与分析**：支持 Query 和 Search 聚合、结果分组与排序、大结果集分页，以及 Function Score 重排。
- **MinHash 去重**：配置 MinHash 函数字段和 `MINHASH_LSH` 索引，从原始文本中查找近似重复文档。
- **分析器与文件资源**：注册可复用的词典、停用词表、同义词表和分词器资源。
- **集合与数据管理**：支持单独加载或释放分区、实体级 TTL、完整集合导出和大文件分块导入。

<p align="center">
  <img src=".github/images/v3/02-ai-research-schema.png" alt="包含 TEXT 和 BM25 字段的 AI 研究集合 Schema" width="49%" />
  <img src=".github/images/v3/08-minhash-schema.png" alt="用于文档去重的 MinHash 集合 Schema" width="49%" />
</p>

详情请参阅 [Attu v3.0.0 发布说明](https://github.com/zilliztech/attu/releases/tag/v3.0.0)。

---

## 快速开始

### Docker（推荐）

```bash
docker run -d --name attu \
  -p 3000:3000 \
  -v attu-data:/data \
  zilliz/attu:v3.0.0
```

打开 <http://localhost:3000>，按提示创建首个管理员账户，然后添加 Zilliz Cloud 或开源 Milvus 2.6.0+ / 3.x 连接。如需在启动时预配置连接，请参阅下方的[预配置连接](#预配置连接)。

Docker 镜像默认将 SQLite 数据库存储在 `/data/attu.db`。`-v attu-data:/data` 将已保存的连接、Agent 对话和偏好设置持久化，避免重建容器时丢失。

镜像以非 root 的 `node` 用户（`uid=1000`、`gid=1000`）运行，建议使用命名卷。如果使用 `./attu-data:/data` 这样的宿主机目录挂载，请先准备目录：

```bash
mkdir -p ./attu-data
sudo chown -R 1000:1000 ./attu-data
```

启用 SELinux 的宿主机还需添加 `:Z` 挂载选项：`./attu-data:/data:Z`。

### Docker Compose

如果尚未部署 Milvus，请先按照 [Milvus Docker Compose 安装文档](https://milvus.io/docs/install_standalone-docker-compose.md)部署受支持的 Milvus 2.6.x 或 3.x 实例及其依赖服务。

将下面的 `attu` 服务加入 Milvus 的 Compose 文件，并将 `MILVUS_ADDRESS` 中的 `standalone` 替换为实际的 Milvus 服务名。示例假设原文件已定义 `milvus` 网络；请将 Attu 加入 Milvus 实际使用的同一网络。若文件已有 `services` 或 `volumes` 节点，请合并到现有节点下：

```yaml
services:
  attu:
    image: zilliz/attu:v3.0.0
    ports:
      - "3000:3000"
    environment:
      - MILVUS_ADDRESS=standalone:19530
    networks:
      - milvus
    volumes:
      - attu-data:/data

volumes:
  attu-data:
```

```bash
docker compose up -d
```

打开 <http://localhost:3000>。如果 Milvus 启用了认证，还需配置 `MILVUS_TOKEN` 或用户名和密码。

### 桌面应用

从发布页面下载适合您平台的安装包：

| 平台 | 下载 |
|------|------|
| macOS（Apple Silicon） | [.dmg](https://github.com/zilliztech/attu/releases/latest) |
| Linux | [.AppImage](https://github.com/zilliztech/attu/releases/latest) / [.deb](https://github.com/zilliztech/attu/releases/latest) |
| Windows | [.exe](https://github.com/zilliztech/attu/releases/latest) |

如果 macOS 提示“Attu.app 已损坏，无法打开”，确认安装包来自官方发布页面后，可运行以下命令（路径应与实际安装位置一致）：

```bash
sudo xattr -rd com.apple.quarantine /Applications/Attu.app
```

### 独立服务端安装包

v3.0.0 提供 Linux x64 独立服务端安装包，无需 Docker 或 Electron。运行环境要求 Node.js 24.x，安装包包含 Attu 服务端和 `bin/milvus-backup`。

```bash
curl -LO https://github.com/zilliztech/attu/releases/download/v3.0.0/attu-server-3.0.0-linux-x64-node24.tar.gz
tar -xzf attu-server-3.0.0-linux-x64-node24.tar.gz
cd attu-server-3.0.0-linux-x64-node24
./bin/attu-server
```

打开 <http://localhost:3080>。启动器默认监听 `0.0.0.0:3080`，可通过 `HOST`、`PORT`、`ATTU_DATA_DIR` 或 `ATTU_DB_PATH` 自定义监听地址和数据路径。

---

## 功能特性

### 多集群管理

通过一个 Attu 实例连接多个 Milvus 实例，在侧边栏添加、编辑和切换连接。每个集群都有独立的工作区、监控、Agent 会话和偏好设置，方便同时管理开发、预发布和生产环境。

### 数据浏览器

浏览数据库和集合，直接在表格中查看和编辑数据，支持 CSV、JSON 和 Parquet 格式的数据导入与导出。

![AI 研究集合的数据浏览视图](.github/images/v3/03-ai-research-data.png)

### 向量搜索

交互式向量相似度搜索，可配置 OpenAI、Cohere、Jina、VoyageAI 等嵌入模型提供商。

![AI 研究集合的 BM25 全文搜索](.github/images/v3/04-hybrid-search.png)

### AI Agent

通过对话管理 Milvus，内置 50 多种工具，支持使用自然语言创建集合、执行查询、管理用户和分析性能。

支持 OpenAI、Anthropic Claude、DeepSeek、Google Gemini、OpenRouter 和自定义 API 端点。

![内置 AI Agent 技能](.github/images/v3/05-agent-skills.png)

### 集群概览与监控

实时查看集群健康状态、包含 16 项以上指标的 Prometheus 仪表盘，以及交互式集群拓扑。

![Milvus 交互式集群拓扑](.github/images/v3/06-cluster-topology.png)

### 备份与恢复

支持全量和增量备份，以及 S3、MinIO、GCS 和 Azure Blob Storage。可将备份下载为 ZIP 文件，或上传备份归档进行恢复。

### REST API Playground

提供交互式 API 测试环境，可针对当前连接、数据库和集合发送请求。

![HTTP API Playground 集合列表查询](.github/images/v3/07-api-playground.png)

### 更多功能

- **RBAC 管理**：创建和管理用户、角色及权限组。
- **资源组**：配置节点间的资源分配。
- **慢请求分析**：检查集群级慢查询，定位性能瓶颈。
- **配置与环境查看**：查看运行时配置和环境变量。
- **任务队列**：监控导入、导出、备份、恢复和复制等后台任务。
- **审计日志**：查看从 Attu 界面或服务端函数发起的写操作记录。
- **国际化**：支持中文和英文界面。

---

## 部署配置

### 运行时配置

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `ATTU_DB_PATH` | 否 | Docker：`/data/attu.db`；直接运行服务端：`attu.db` | Attu 应用数据的 SQLite 数据库路径；独立安装包的启动器可设置自己的数据路径 |
| `ATTU_AUDIT_RETENTION_DAYS` | 否 | `90` | 审计日志保留天数；设为 `0` 或负数可禁用自动清理 |
| `LOG_LEVEL` | 否 | `info` | Pino 支持的服务端日志级别 |
| `MILVUS_GRPC_TIMEOUT` | 否 | `15000` | Milvus gRPC 请求超时时间，单位为毫秒 |

### 预配置连接

设置 `MILVUS_ADDRESS` 可在启动时自动创建默认连接，适合与 Milvus 一起部署的 Kubernetes 或 Docker Compose 环境。

```bash
docker run -d \
  --name attu \
  -p 3000:3000 \
  -v attu-data:/data \
  -e MILVUS_ADDRESS=milvus:19530 \
  zilliz/attu:v3.0.0
```

下表中的“必填”仅针对预配置连接；不设置 `MILVUS_ADDRESS` 时，可在界面中手动添加连接。

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `MILVUS_ADDRESS` | 是 | - | Milvus gRPC 地址，例如 `milvus:19530` |
| `MILVUS_NAME` | 否 | 与地址相同 | 连接列表中的显示名称 |
| `MILVUS_DATABASE` | 否 | `default` | 目标数据库 |
| `MILVUS_TOKEN` | 否 | - | 认证令牌；在 Kubernetes 中应通过 Secret 提供敏感值 |
| `MILVUS_USERNAME` | 否 | - | 用户名 |
| `MILVUS_PASSWORD` | 否 | - | 密码；在 Kubernetes 中应通过 Secret 提供敏感值 |
| `MILVUS_SSL` | 否 | `false` | 设为 `true` 启用 TLS |
| `MILVUS_TLS_ROOT_CERT_PATH` | 否 | - | TLS CA / 根证书路径 |
| `MILVUS_TLS_PRIVATE_KEY_PATH` | 否 | - | mTLS 客户端私钥路径 |
| `MILVUS_TLS_CERT_CHAIN_PATH` | 否 | - | mTLS 客户端证书链路径 |
| `MILVUS_TLS_ROOT_CERT` | 否 | - | 内联 CA / 根证书 PEM 内容，保存在连接记录中 |
| `MILVUS_TLS_PRIVATE_KEY` | 否 | - | 内联客户端私钥 PEM 内容，保存在连接记录中 |
| `MILVUS_TLS_CERT_CHAIN` | 否 | - | 内联客户端证书链 PEM 内容，保存在连接记录中 |
| `MILVUS_TLS_SERVER_NAME` | 否 | - | 覆盖 TLS 证书校验 / SNI 使用的服务器名称 |
| `MILVUS_TLS_SKIP_CERT_CHECK` | 否 | `false` | 跳过证书校验，不安全，仅供测试使用 |

设置任意 `MILVUS_TLS_*` 证书、服务器名称或跳过校验变量时，会自动启用 `MILVUS_SSL`。

`MILVUS_ADDRESS` 必须能从 Attu 容器内部访问。`127.0.0.1` 或 `localhost` 通常指向容器自身，应使用同一 Docker 网络中的服务名、Kubernetes 服务名或可访问的主机地址。Docker Desktop 可使用 `host.docker.internal` 访问宿主机；Linux Docker Engine 通常需额外添加 `--add-host=host.docker.internal:host-gateway`。

### 本地登录

Attu 服务端默认启用本地登录，首次访问时会显示一次性初始化表单，用于创建首个管理员账户。桌面 / Electron 版本采用单用户模式，不支持 Attu 多用户登录。

也可在启动时同时设置 `ATTU_ADMIN_USER` 和 `ATTU_ADMIN_PASSWORD`，在尚无用户时创建管理员。对于独立服务端安装包，在解压目录运行：

```bash
ATTU_ADMIN_USER=admin \
ATTU_ADMIN_PASSWORD='Change-me-please-123' \
./bin/attu-server
```

将示例密码替换为自己的密码。Docker 部署可通过 `-e` 传入相同的环境变量。

设置 `ATTU_AUTH_MODE=none` 可让服务端使用单用户模式，适用于本地开发或已有其他访问控制层保护的部署。

如果丢失管理员密码，可在启动时设置一次性恢复密码：

```bash
ATTU_ADMIN_RESET_USER=admin \
ATTU_ADMIN_RESET_PASSWORD='New-change-me-123' \
./bin/attu-server
```

仅有一个有效管理员时，可省略 `ATTU_ADMIN_RESET_USER`。恢复登录后应移除重置变量，因为 Attu 每次启动都会应用这些变量并清除该管理员的现有会话。

| 变量 | 必填 | 说明 |
|------|------|------|
| `ATTU_RUNTIME` | 否 | 设为 `desktop` 强制使用单用户模式；Electron 自动设置，服务端 / Docker 部署应留空 |
| `ATTU_AUTH_MODE` | 否 | `local` 启用 Attu 登录，`none` 禁用；服务端 / Docker 默认 `local`，桌面端默认 `none` |
| `ATTU_AUTH_ENABLED` | 否 | 旧版布尔别名：`true` 对应 `local`，`false` 对应 `none` |
| `ATTU_ADMIN_USER` | 否 | 尚无用户时，在启动阶段创建的管理员用户名或邮箱；需与密码同时设置 |
| `ATTU_ADMIN_PASSWORD` | 否 | 初始化管理员密码；需与 `ATTU_ADMIN_USER` 同时设置 |
| `ATTU_ADMIN_EMAIL` | 否 | 初始化管理员的邮箱 |
| `ATTU_ADMIN_NAME` | 否 | 初始化管理员的显示名称，默认与 `ATTU_ADMIN_USER` 相同 |
| `ATTU_ADMIN_RESET_USER` | 否 | 要重置密码的现有管理员用户名或邮箱；有多个有效管理员时必填 |
| `ATTU_ADMIN_RESET_PASSWORD` | 否 | 启动时应用的一次性重置密码，需满足密码策略，恢复后应移除 |
| `ATTU_AUTH_SESSION_DAYS` | 否 | 会话有效天数，默认 `30` |
| `ATTU_SESSION_DAYS` | 否 | `ATTU_AUTH_SESSION_DAYS` 的旧版别名 |
| `ATTU_AUTH_COOKIE_SECURE` | 否 | 覆盖会话 Cookie 的 `Secure` 属性；默认在 HTTPS 或 `X-Forwarded-Proto: https` 下启用，仅在本地 HTTP 测试时设为 `false` |

### 审计日志

Attu 记录从界面或服务端函数发起的写操作，日志保存在 Attu 的 SQLite 数据库中，与 Milvus 原生日志分开存储。只读浏览、搜索和查询操作不记录审计日志。

审计范围包括连接、数据库和集合管理，Schema 与元数据变更，数据写入，索引和分区操作，用户与角色管理，资源组变更，AI 配置变更，以及导入、导出、备份和恢复任务的启动。

每条记录包含连接、操作者、操作、资源类型与名称、数据库名称、成功或失败状态、错误信息、元数据和时间戳。元数据中键名包含 `password`、`token`、`secret`、`apiKey`、`privateKey`、`cert`、`certificate` 或 `credential` 等内容的敏感字段，会在存储前脱敏。

默认保留 90 天。通过 `ATTU_AUDIT_RETENTION_DAYS` 调整保留时间，设为 `0` 或负数可禁用自动清理。

### 出站请求与 SSRF 防护

Attu 在保存或测试向量化、LLM 服务配置时校验 HTTP/HTTPS 目标地址，并在发送请求时再次校验。因此，安全策略可能在实际调用服务之前就拒绝操作。

Docker 和独立服务端在生产环境下默认启用严格的 SSRF 防护。私有地址和回环地址，包括 `10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8` 及 IPv6 私有地址，都需要显式放行。域名会按解析出的 IP 地址检查，使用内网域名不会绕过限制。

桌面端的行为取决于安装版本。如果本机或局域网服务被拦截，可按下文放行指定主机。**截至 2026 年 9 月 8 日，桌面端默认允许访问本机和局域网服务的改动尚未发布，请勿认为已发布的 v3.0.0 安装包包含该改动。** 此改动也覆盖解析到内网地址的域名；显式设置严格模式时，仍以严格模式为准。

云元数据专用域名及元数据／链路本地地址（例如 `metadata.google.internal`、`169.254.169.254`）始终禁止访问，即使加入白名单也不能放行。仅接受 HTTP 和 HTTPS 地址，不允许在 URL 中嵌入用户名和密码。

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ATTU_SSRF_ALLOWLIST` | 空 | 部署层私有地址策略允许访问的主机名、IP 或 CIDR 网段，多个值用逗号分隔。填写主机，不带协议、端口或路径。 |
| `ATTU_SSRF_PROTECTION` | 非开发环境默认严格；桌面端例外取决于版本 | 设置为 `strict` 可显式启用私有地址检查，对桌面端同样有效。 |

例如，`ATTU_SSRF_ALLOWLIST=embedding.company.local,192.168.1.100` 会放行这两个主机。优先指定实际服务主机；仅在确实需要访问整个网段时使用 CIDR。

#### Docker

将白名单加入 Attu 容器的环境变量，并使用原有数据卷重建容器：

```bash
docker run -d --name attu \
  -p 3000:3000 \
  -v attu-data:/data \
  -e ATTU_SSRF_ALLOWLIST=embedding.company.local,192.168.1.100 \
  zilliz/attu:v3.0.0
```

该示例会新建容器；若存在同名旧容器，需先停止并移除旧容器，保留数据卷。Docker Compose 或 Kubernetes 部署可在 Attu 服务／容器的环境变量中设置同一变量，然后重建或滚动更新。

服务还必须能从容器内部访问。如果使用 `host.docker.internal`，应将该主机名加入白名单；Linux Docker Engine 通常还需添加 `--add-host=host.docker.internal:host-gateway`。白名单只改变访问权限，不会修复 DNS 解析或网络路由。

#### 桌面端

完全退出 Attu（包括后台运行的实例），再带环境变量启动。将主机和程序路径替换为实际值。

macOS：

```bash
ATTU_SSRF_ALLOWLIST=embedding.company.local,192.168.1.100 \
/Applications/Attu.app/Contents/MacOS/Attu
```

Windows PowerShell：

```powershell
$env:ATTU_SSRF_ALLOWLIST = "embedding.company.local,192.168.1.100"
& "C:\path\to\Attu.exe"
```

Linux AppImage：

```bash
ATTU_SSRF_ALLOWLIST=embedding.company.local,192.168.1.100 \
./attu-3.0.0-x86_64.AppImage
```

这些示例仅对从该终端环境启动的应用生效，之后直接点击应用图标启动不会保留此设置。独立服务端安装包可在执行 `./bin/attu-server` 前设置相同变量。

#### 排障

| 错误信息 | 含义与处理方法 |
|----------|----------------|
| `Resolved address is not allowed: ...` | 解析后的 IP 被部署策略拦截。将实际服务主机加入白名单并重启 Attu。 |
| `Private target is not allowed for this tenant` | 组织／租户策略也禁止访问该目标。需由管理员在该租户的出站策略中，为 `embedding` 或 `llm` 用途放行主机及端口；仅配置部署层白名单不够。 |
| `Metadata service hostnames are not allowed` / `Metadata or link-local address is not allowed: ...` | 目标属于不可放行的地址，请改用实际服务端点。 |
| `URL hostname could not be resolved` | 请修复 Attu 运行环境中的 DNS 解析。 |

默认组织继承部署层权限，额外创建的组织可能有更严格的私有地址策略。服务端日志会以 `Blocked outbound request` 记录拦截事件，包含请求上下文、目标主机／端口和原因。向量化配置操作对应的上下文为 `embedding_config.create`、`embedding_config.update` 或 `embedding_config.test`。

### TLS / SSL

Attu 支持 Milvus gRPC 连接的单向 TLS 和双向 TLS（mTLS）。

- **单向 TLS**：Attu 验证 Milvus 服务端证书，可选配自定义 CA / 根证书。
- **双向 TLS（mTLS）**：Attu 验证服务端证书，同时向 Milvus 提供客户端证书和私钥。
- **服务器名称覆盖**：证书主机名与连接地址不一致时，可设置 `MILVUS_TLS_SERVER_NAME` 或界面中的对应字段。
- **跳过证书校验**：`MILVUS_TLS_SKIP_CERT_CHECK=true` 不安全，仅供本地测试，不支持与 mTLS 一起使用。

可在 Attu 界面中上传 PEM 文件，或填写服务端 / 容器可读取的证书路径。上传的 PEM 内容保存在 SQLite 连接记录中，这种方式无需额外挂载证书卷。

通过挂载证书配置单向 TLS：

```bash
docker run -d \
  --name attu \
  -p 3000:3000 \
  -v attu-data:/data \
  -v "$PWD/certs:/etc/attu/certs:ro" \
  -e MILVUS_ADDRESS=milvus.example.com:19530 \
  -e MILVUS_SSL=true \
  -e MILVUS_TLS_ROOT_CERT_PATH=/etc/attu/certs/ca.pem \
  -e MILVUS_TLS_SERVER_NAME=milvus.example.com \
  zilliz/attu:v3.0.0
```

通过挂载证书配置双向 TLS：

```bash
docker run -d \
  --name attu \
  -p 3000:3000 \
  -v attu-data:/data \
  -v "$PWD/certs:/etc/attu/certs:ro" \
  -e MILVUS_ADDRESS=milvus.example.com:19530 \
  -e MILVUS_SSL=true \
  -e MILVUS_TLS_ROOT_CERT_PATH=/etc/attu/certs/ca.pem \
  -e MILVUS_TLS_PRIVATE_KEY_PATH=/etc/attu/certs/client.key \
  -e MILVUS_TLS_CERT_CHAIN_PATH=/etc/attu/certs/client.pem \
  -e MILVUS_TLS_SERVER_NAME=milvus.example.com \
  zilliz/attu:v3.0.0
```

完整的本地 mTLS 流程，包括证书生成、Milvus Docker Compose 配置和验证，请参阅[在 Docker 中连接启用双向 TLS 的本地 Milvus](./docs/milvus-mtls-local-docker.md)。

### Kubernetes

下载[部署示例](./deploy/attu-k8s-deploy.yaml)，将 `MILVUS_ADDRESS` 修改为实际的 Milvus 服务名（例如 `my-release-milvus:19530`），并根据集群环境调整持久卷配置后部署：

```bash
curl -LO https://raw.githubusercontent.com/zilliztech/attu/main/deploy/attu-k8s-deploy.yaml
# 编辑 attu-k8s-deploy.yaml 后执行：
kubectl apply -f attu-k8s-deploy.yaml
```

示例使用 PVC 持久化 `/data`，Service 类型为 `ClusterIP`。本地访问时可运行：

```bash
kubectl port-forward service/my-attu-svc 3000:3000
```

然后打开 <http://localhost:3000>。

### Nginx 反向代理

请参阅 [Nginx 部署指南](./deploy/nginx/README.md)。

---

## 兼容性

Attu v3.0 支持 Zilliz Cloud 和开源 Milvus 2.6.0+、3.x，不支持 Milvus 2.5.x 及更早版本。

外部集合、快照、`TEXT` 字段、MinHash、实体级 TTL、聚合、排序和部分 Schema 操作需要 Milvus 3.x。Attu 会根据所连接的 Milvus 版本和配置调整可用操作。

`TEXT` 字段和外部集合需要 Storage V3。若尚未启用，请在 Milvus 中设置 `common.storage.useLoonFFI=true` 并重启服务。外部集合中的数据在 Attu 中为只读。

旧版 Milvus 可使用下表中的历史 Attu 版本：

| Milvus 版本 | Attu 版本 |
|-------------|-----------|
| Zilliz Cloud | [v3.0.0](https://github.com/zilliztech/attu/releases/tag/v3.0.0) |
| 3.x | [v3.0.0](https://github.com/zilliztech/attu/releases/tag/v3.0.0) |
| 2.6.x | [v3.0.0](https://github.com/zilliztech/attu/releases/tag/v3.0.0) |
| 2.5.x | [v2.5.10](https://github.com/zilliztech/attu/releases/tag/v2.5.10) |
| 2.4.x | [v2.4.12](https://github.com/zilliztech/attu/releases/tag/v2.4.12) |
| 2.3.x | [v2.3.5](https://github.com/zilliztech/attu/releases/tag/v2.3.5) |

---

## 常见问题

**Docker 中的 Attu 无法连接 Milvus？**

确保 `MILVUS_ADDRESS` 能从容器内部访问。同一 Docker 网络中应使用 Milvus 服务名，而非 `localhost`。参阅 [#161](https://github.com/zilliztech/attu/issues/161)。

**macOS 提示应用已损坏？**

请参阅[桌面应用](#桌面应用)中的处理说明。

**如何更新 Attu？**

Docker：拉取目标版本的镜像并重建容器，保留原来的 `/data` 数据卷。桌面应用启动时会自动检查更新，也可从[发布页面](https://github.com/zilliztech/attu/releases/latest)下载安装包。

**如何备份 Attu 配置？**

v3 的应用数据保存在 SQLite 中。Docker 部署应备份 `/data` 数据卷；其他服务端部署应备份实际的 `ATTU_DB_PATH` 数据库及相关数据目录。文件级备份前先停止 Attu，确保数据库副本一致。这里备份的是 Attu 的应用数据；Milvus 数据备份请使用“备份与恢复”功能。

---

## 相关资源

- [Milvus 文档](https://milvus.io/docs)
- [Milvus Python SDK](https://github.com/milvus-io/pymilvus)
- [Milvus Java SDK](https://github.com/milvus-io/milvus-sdk-java)
- [Milvus Go SDK](https://github.com/milvus-io/milvus-sdk-go)
- [Milvus Node.js SDK](https://github.com/milvus-io/milvus-sdk-node)

## 社区

加入 [Milvus Discord](https://discord.com/invite/8uyFbECzPX)，提问、分享反馈并与其他用户交流。

## 许可证

Attu 在 v2.5.12 及之前版本采用 Apache License 2.0 开源。从 v2.6.0 开始，Attu 为专有软件。详情请参阅 [LICENSE_PROPRIETARY.txt](./LICENSE_PROPRIETARY.txt)。
