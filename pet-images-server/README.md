# Pet Images MCP Server

这是一个提供猫狗图片API的MCP服务器。它集成了 [Dog API](https://dog.ceo/dog-api/) 和 [Cat as a service (CATAAS)](https://cataas.com/) 的功能。

## 功能

服务器提供以下工具：

### 1. get_random_pet
获取随机的猫或狗图片
- **参数**：
  - type (可选): 'cat'(猫), 'dog'(狗), 'random'(随机)
- **返回**：包含图片URL的JSON响应

### 2. get_dog_by_breed
获取指定品种的狗狗图片
- **参数**：
  - breed (必需): 狗狗品种名称，如 'husky', 'pomeranian' 等
- **返回**：包含指定品种狗狗图片URL的JSON响应

### 3. list_dog_breeds
列出所有可用的狗狗品种
- **参数**：无
- **返回**：包含所有可用狗狗品种列表的JSON响应

### 4. get_cat_with_tag
获取带有特定标签的猫咪图片
- **参数**：
  - tag (必需): 标签名称，如 'cute', 'sleeping' 等
- **返回**：包含带有指定标签的猫咪图片URL的JSON响应

## 安装和使用

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 在MCP设置中添加服务器配置：
```json
{
  "mcpServers": {
    "pet-images": {
      "command": "node",
      "args": ["path/to/pet-images-server/build/index.js"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 示例响应

1. 获取随机宠物图片：
```json
{
  "success": true,
  "type": "cat",
  "imageUrl": "https://cataas.com/cat/u1S16RJ8tmhFgJ1J"
}
```

2. 获取指定品种狗狗图片：
```json
{
  "success": true,
  "imageUrl": "https://images.dog.ceo/breeds/husky/n02110185_5628.jpg"
}
```

3. 获取狗狗品种列表：
```json
{
  "success": true,
  "breeds": ["affenpinscher", "african", "airedale", "akita", ...]
}
```

4. 获取带标签的猫咪图片：
```json
{
  "success": true,
  "imageUrl": "https://cataas.com/cat/xZHQYMLa1wSI7zZq"
}
