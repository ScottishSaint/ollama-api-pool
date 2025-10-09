# Ollama API Pool

<div align="center">

![Ollama API Pool](https://img.shields.io/badge/Ollama-API_Pool-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-yellow?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

[![Deploy Status](https://github.com/dext7r/ollama-api-pool/actions/workflows/deploy.yml/badge.svg?style=flat-square)](https://github.com/dext7r/ollama-api-pool/actions/workflows/deploy.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![GitHub issues](https://img.shields.io/github/issues/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/issues)
[![GitHub stars](https://img.shields.io/github/stars/dext7r/ollama-api-pool?style=flat-square&logo=github)](https://github.com/dext7r/ollama-api-pool/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dext7r/ollama-api-pool?style=flat-square&logo=github)](https://github.com/dext7r/ollama-api-pool/network)
[![GitHub last commit](https://img.shields.io/github/last-commit/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/commits)

[![OpenAI Compatible](https://img.shields.io/badge/OpenAI-Compatible-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com/docs/api-reference)
[![Serverless](https://img.shields.io/badge/Serverless-Edge_Computing-purple?style=flat-square&logo=serverless&logoColor=white)](https://workers.cloudflare.com/)
[![High Availability](https://img.shields.io/badge/High-Availability-success?style=flat-square&logo=statuspage&logoColor=white)](https://ollama-api-pool.h7ml.workers.dev/health)
[![Load Balancing](https://img.shields.io/badge/Load-Balancing-blue?style=flat-square&logo=nginx&logoColor=white)](https://ollama-api-pool.h7ml.workers.dev/api-docs)

An intelligent Ollama API proxy pool based on Cloudflare Workers, featuring multi-account rotation, automatic failover, and unified authentication.

English | [简体中文](./README.md)

**[🚀 Live Demo](https://ollama-api-pool.h7ml.workers.dev)** | **[📚 API Docs](https://ollama-api-pool.h7ml.workers.dev/api-docs)** | **[💬 Discussions](https://github.com/dext7r/ollama-api-pool/discussions)**

</div>

---

## ✨ Features

- 🔄 **API Rotation** - Automatically rotate multiple Ollama API Keys for load balancing
- 🛡️ **Fault Tolerance** - Detect failed keys and auto-switch to available ones
- 🤖 **Smart Management** - Auto-disable keys after consecutive failures, manual enable/disable support
- 📊 **Usage Analytics** - Real-time statistics on requests, success rates, and failures per key
- 🏥 **Health Checks** - Batch validation of API key availability
- 🔐 **Unified Auth** - Custom client tokens to protect upstream API keys
- 🎯 **Auto Categorization** - Automatically identify and categorize API keys (kimi/llama/qwen, etc.)
- 📥 **Batch Import** - Import accounts from ollama.txt files
- 🔍 **Validated Import** - Line-by-line validation of API key validity with auto-categorization
- 🎛️ **Admin Dashboard** - Web UI for managing API keys and client tokens
- ⚡ **High Performance** - Built on Cloudflare Workers with global CDN acceleration

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0 (recommended) or npm

Install pnpm:

```bash
npm install -g pnpm
```

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Login to Cloudflare

```bash
pnpm wrangler login
```

### 3. Configure Project

Copy the configuration template:

```bash
cp wrangler.toml.example wrangler.toml
```

Create KV namespaces:

```bash
pnpm wrangler kv:namespace create "API_KEYS"
pnpm wrangler kv:namespace create "ACCOUNTS"
```

Update `wrangler.toml` with the returned namespace IDs:

```toml
[[kv_namespaces]]
binding = "API_KEYS"
id = "your-api-keys-kv-id"  # Replace with actual ID

[[kv_namespaces]]
binding = "ACCOUNTS"
id = "your-accounts-kv-id"  # Replace with actual ID

[vars]
ADMIN_TOKEN = "your-secure-admin-token-here"  # Set a strong password
```

> ⚠️ **Important**: `wrangler.toml` contains sensitive information and is added to `.gitignore`

### 4. Deploy

```bash
pnpm deploy
```

The deployment will display the access URL, e.g., `https://ollama-api-pool.your-name.workers.dev`

## 🚀 GitHub Actions Auto-Deploy

This project includes GitHub Actions for automatic deployment to Cloudflare Workers.

### Configuration Steps

1. **Add Secrets in GitHub** (Settings > Secrets and variables > Actions):

   Required Secrets:
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
   - `ADMIN_TOKEN`: Admin dashboard password
   - `API_KEYS_KV_ID`: API Keys KV namespace ID
   - `ACCOUNTS_KV_ID`: Accounts KV namespace ID

2. **Get Cloudflare API Token**:
   - Visit <https://dash.cloudflare.com/profile/api-tokens>
   - Click "Create Token"
   - Select "Edit Cloudflare Workers" template
   - Create and copy the token

3. **Get Account ID**:
   - Visit <https://dash.cloudflare.com/>
   - Select your domain, Account ID is shown on the right

4. **Get KV Namespace IDs**:

   ```bash
   pnpm wrangler kv:namespace list
   ```

5. **Push to main branch** - Deployment starts automatically, URLs will be shown in Actions logs

## 📖 Usage

### Admin Dashboard

Access the deployed URL (e.g., `https://ollama-api-pool.your-name.workers.dev`) and enter your admin token.

#### Import API Keys

##### Method 1: Single Add

Enter an Ollama API Key in the "API Keys" tab and click Add.

##### Method 2: Batch Import

1. Switch to "Batch Import" tab
2. Paste `ollama.txt` content
3. Click Import

Format example:

```text
test@example.com----password123----session_token----ollama-abc123...
user@test.com----pass456----session_data----ollama-def456...
```

#### Create Client Tokens

1. Switch to "Client Tokens" tab
2. Enter token name
3. Click Create
4. Copy the generated token for client use

#### View Key Statistics

1. Switch to "Analytics" tab
2. View detailed stats for each key:
   - Total requests, success/failure counts
   - Success rate percentage
   - Last used time
   - Current status (active/disabled)
3. Manually enable/disable keys
4. Run batch health checks

### API Calls

Use client tokens to call the API:

```bash
curl https://ollama-api-pool.your-name.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxx" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Admin dashboard homepage |
| `/v1/chat/completions` | POST | Ollama API proxy (OpenAI compatible) |
| `/v1/models` | GET | Model list |
| `/health` | GET | Health check |
| `/admin/api-keys` | GET/POST/DELETE | Manage API keys |
| `/admin/api-keys/import` | POST | Batch import API keys |
| `/admin/keys/stats` | GET | Get key usage statistics |
| `/admin/keys/enable` | POST | Manually enable API key |
| `/admin/keys/disable` | POST | Manually disable API key |
| `/admin/keys/health-check` | POST | Batch health check |
| `/admin/tokens` | GET/POST/DELETE | Manage client tokens |
| `/admin/stats` | GET | Get statistics overview |

## 📝 Development

### Local Testing

```bash
pnpm dev
```

### View Logs

```bash
pnpm wrangler tail
```

### Update Deployment

```bash
pnpm deploy
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

Please see [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🔗 Related Links

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Ollama Official Site](https://ollama.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)

---

## 🌐 Online Resources

**🚀 Live Demo**: <https://ollama-api-pool.h7ml.workers.dev>

**📚 API Documentation**: <https://ollama-api-pool.h7ml.workers.dev/api-docs>

**💬 Issues**: <https://github.com/dext7r/ollama-api-pool/issues>

**📖 Contributing**: <https://github.com/dext7r/ollama-api-pool/blob/main/CONTRIBUTING.md>

If this project helps you, please give it a ⭐ Star!
