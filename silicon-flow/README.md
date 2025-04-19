# Silicon Flow MCP Server

这是一个用于生成图像的MCP服务器，它使用Silicon Flow API来生成高质量的图像。

## 系统要求

- Node.js v16.0.0 或更高版本
- npm（通常随Node.js一起安装）

如果没有安装Node.js，可以从[Node.js官网](https://nodejs.org/)下载安装。

## 安装和使用方式

### 方式一：使用npx（推荐）

直接通过npx运行服务器，无需克隆仓库：

1. 配置MCP设置文件：

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.local/share/code-server/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "silicon-flow": {
      "command": "npx",
      "args": ["silicon-flow-mcp-server"],
      "env": {
        "SILICON_FLOW_API_KEY": "your-api-key-here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

注意：首次运行时，npx会自动安装所需的依赖包，无需手动安装。

### 方式二：本地开发

如果你需要修改或开发服务器，可以选择本地开发方式：

1. 克隆或下载此仓库到本地：
```bash
git clone [repository-url]
cd silicon-flow-server
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.example .env
```
然后编辑 `.env` 文件，填入你的 Silicon Flow API 密钥。

4. 构建项目：
```bash
npm run build
```

5. 配置MCP（本地开发模式）：

```json
{
  "mcpServers": {
    "silicon-flow": {
      "command": "node",
      "args": ["[path-to-server]/build/index.js"],
      "env": {
        "SILICON_FLOW_API_KEY": "your-api-key-here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 使用方法

服务器提供了以下工具：

### generate_image

生成图像的工具，支持以下参数：

- `model`: 生成模型（默认：'Kwai-Kolors/Kolors'）
- `prompt`: 图像描述（必需）
- `negative_prompt`: 需要避免的内容（可选）
- `image_size`: 图像尺寸（默认：'1024x1024'）
- `batch_size`: 生成数量（默认：1）
- `seed`: 随机种子（默认：4999999999）
- `num_inference_steps`: 推理步数（默认：20）
- `guidance_scale`: 引导比例（默认：7.5）

示例使用：
```typescript
const result = await claude.use_mcp_tool({
  server_name: "silicon-flow",
  tool_name: "generate_image",
  arguments: {
    model: "Kwai-Kolors/Kolors",
    prompt: "A beautiful mountain landscape at sunset",
    image_size: "1024x1024"
  }
});
```

## 安全注意事项

- 不要将API密钥提交到版本控制系统
- 确保保护好你的API密钥，不要将其分享给他人
- 生成的图像URL有效期是有限的，请及时保存

## 开发

- 项目使用TypeScript开发
- 使用 `npm run build` 编译代码
- 代码提交前请确保没有包含任何敏感信息
