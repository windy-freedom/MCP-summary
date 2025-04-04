# Silicon Flow MCP Server

这是一个用于生成图像的MCP服务器，它使用Silicon Flow API来生成高质量的图像。

## 安装步骤

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

## 配置MCP

在Claude的MCP设置文件中添加服务器配置：

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.local/share/code-server/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "silicon-flow": {
      "command": "node",
      "args": ["[path-to-server]/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

注意：API密钥应该配置在 `.env` 文件中，而不是MCP设置文件中。

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

- 不要将 `.env` 文件提交到版本控制系统
- 确保保护好你的API密钥，不要将其分享给他人
- 生成的图像URL有效期是有限的，请及时保存

## 开发

- 项目使用TypeScript开发
- 使用 `npm run build` 编译代码
- 代码提交前请确保没有包含任何敏感信息
