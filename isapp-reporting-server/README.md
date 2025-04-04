# IronSource API MCP Server

这是一个用于获取IronSource广告报表数据的MCP服务器。

## 安装步骤

1. 克隆仓库：
```bash
git clone [repository-url]
cd isapp-reporting-server
```

2. 安装依赖：
```bash
npm install
```

3. 构建项目：
```bash
npm run build
```

## 配置

1. 在Cline的MCP设置文件中添加以下配置（通常位于 `~/.local/share/code-server/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`）：

```json
{
  "mcpServers": {
    "iron-source": {
      "command": "node",
      "args": ["path/to/isapp-reporting-server/build/index.js"],
      "env": {
        "ISAPP_API_KEY": "your-api-key-here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

2. 将 `path/to` 替换为实际的服务器路径
3. 将 `your-api-key-here` 替换为你的IronSource API密钥

## 使用方法

服务器提供了一个名为 `get_report` 的工具，用于获取广告报表数据。

### 基本用法

```typescript
await use_mcp_tool({
  server_name: "iron-source",
  tool_name: "get_report",
  arguments: {
    start_date: "2025-04-02",  // 必填，格式：YYYY-MM-DD
    end_date: "2025-04-02",    // 必填，格式：YYYY-MM-DD
  }
});
```

### 高级用法

你可以自定义要获取的指标和维度：

```typescript
await use_mcp_tool({
  server_name: "iron-source",
  tool_name: "get_report",
  arguments: {
    start_date: "2025-04-02",
    end_date: "2025-04-02",
    metrics: ["impressions", "clicks", "installs", "spend"],  // 可选
    breakdowns: ["day", "campaign_name", "app_name"]          // 可选
  }
});
```

### 可用参数

1. 必填参数：
   - `start_date`: 开始日期（YYYY-MM-DD格式）
   - `end_date`: 结束日期（YYYY-MM-DD格式）

2. 可选参数：
   - `metrics`: 要获取的指标数组，可用值：
     * impressions（展示次数）
     * clicks（点击次数）
     * completions（完成次数）
     * launches（启动次数）
     * installs（安装次数）
     * spend（支出）

   - `breakdowns`: 分组维度数组，可用值：
     * day（日期）
     * app_name（应用名称）
     * package_name（包名）
     * campaign_id（广告活动ID）
     * campaign_name（广告活动名称）

### 返回数据

数据以CSV格式返回，包含表头和数据行。例如：

```csv
"day","campaign_name","impressions","installs","spend"
"2025-04-02","Campaign_A",21502,442,184.365
"2025-04-02","Campaign_B",1,16,0.509
```

## 错误处理

服务器会返回适当的错误信息，常见错误包括：
- 认证失败
- 无效的日期格式
- 无效的指标或维度
- API服务器错误

## 注意事项

1. 确保API密钥有效且具有适当的权限
2. 日期范围不要太大，以避免数据量过大
3. 选择合适的指标和维度组合，避免无效的组合
