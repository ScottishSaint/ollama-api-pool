# Ollama API Pool

<div align="center">

![Ollama API Pool](https://img.shields.io/badge/Ollama-API_Pool-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=)

<!-- License & Platform -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-yellow?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

<!-- GitHub Actions Workflow Status -->
[![Deploy Status](https://github.com/dext7r/ollama-api-pool/actions/workflows/deploy.yml/badge.svg)](https://github.com/dext7r/ollama-api-pool/actions/workflows/deploy.yml)
[![API Test Status](https://github.com/dext7r/ollama-api-pool/actions/workflows/api-test.yml/badge.svg)](https://github.com/dext7r/ollama-api-pool/actions/workflows/api-test.yml)

<!-- Project Statistics -->
[![GitHub stars](https://img.shields.io/github/stars/dext7r/ollama-api-pool?style=flat-square&logo=github)](https://github.com/dext7r/ollama-api-pool/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dext7r/ollama-api-pool?style=flat-square&logo=github)](https://github.com/dext7r/ollama-api-pool/network)
[![GitHub issues](https://img.shields.io/github/issues/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/pulls)
[![GitHub last commit](https://img.shields.io/github/last-commit/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/commits)

<!-- Code Quality & Contribution -->
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen?style=flat-square)](https://standardjs.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/dext7r/ollama-api-pool/graphs/commit-activity)

<!-- Technical Features -->
[![OpenAI Compatible](https://img.shields.io/badge/OpenAI-Compatible-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com/docs/api-reference)
[![Multi Provider](https://img.shields.io/badge/Multi-Provider-blue?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI2IiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMTgiIGN5PSIxMiIgcj0iMyIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjYiIHI9IjMiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxOCIgcj0iMyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)](https://ollama-api-pool.h7ml.workers.dev/api-docs)
[![Serverless](https://img.shields.io/badge/Serverless-Edge_Computing-purple?style=flat-square&logo=serverless&logoColor=white)](https://workers.cloudflare.com/)
[![High Availability](https://img.shields.io/badge/High-Availability-success?style=flat-square&logo=statuspage&logoColor=white)](https://ollama-api-pool.h7ml.workers.dev/health)
[![Load Balancing](https://img.shields.io/badge/Load-Balancing-blue?style=flat-square&logo=nginx&logoColor=white)](https://ollama-api-pool.h7ml.workers.dev/api-docs)

<!-- Storage Support -->
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Supported-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Cloudflare KV](https://img.shields.io/badge/Cloudflare-KV-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/kv/)

An intelligent Ollama/OpenRouter API proxy pool based on Cloudflare Workers, featuring multi-provider support, account rotation, automatic failover, and unified authentication.

English | [简体中文](./README.md)

**[🚀 Live Demo](https://ollama-api-pool.h7ml.workers.dev)** | **[📚 API Docs](https://ollama-api-pool.h7ml.workers.dev/api-docs)** | **[📊 Live Stats](https://ollama-api-pool.h7ml.workers.dev/stats)** | **[💬 Discussions](https://github.com/dext7r/ollama-api-pool/discussions)**

</div>

---

## ✨ Features

### 🌐 Multi-Provider Support
- 🦙 **Ollama** - Official Ollama API support
- 🔀 **OpenRouter** - OpenRouter API for accessing multiple LLM models
- 🔌 **Unified Interface** - All providers use OpenAI-compatible API
- 🎯 **Smart Routing** - Auto-detect provider from path (e.g., `/openrouter/v1/chat/completions`)

### 💡 Core Features
- 🔄 **API Rotation** - Automatically rotate multiple API Keys for load balancing
- 🛡️ **Fault Tolerance** - Detect failed keys and auto-switch to available ones
- 🤖 **Smart Management** - Auto-disable keys after consecutive failures, manual enable/disable support
- 📊 **Usage Analytics** - Real-time statistics on requests, success rates, and failures per key
- 🏥 **Health Checks** - Batch validation of API key availability
- 🔐 **Unified Auth** - Custom client tokens to protect upstream API keys

### 📦 Management Features
- 🎯 **Auto Categorization** - Automatically identify and categorize API keys (kimi/llama/qwen, etc.)
- 📥 **Batch Import** - Import accounts from ollama.txt files
- 🔍 **Validated Import** - Line-by-line validation of API key validity with auto-categorization
- 🎛️ **Admin Dashboard** - Web UI for managing API keys and client tokens

### 👥 User System <sup>v3.0.0</sup>
- 📧 **Email Registration** - Users can self-register with email to get dedicated API access credentials
- 🔑 **Dual Login Modes** - Support both verification code and password login
- ✉️ **Email Verification** - Integrated push-all-in-one email service with beautiful HTML verification code emails
- 🎯 **User Dashboard** - Independent user console for viewing personal info, API keys, and usage stats
- 📅 **Daily Check-in** - Users can extend API credential validity (+24 hours) by daily check-in
- 📜 **Check-in History** - Complete check-in record query with pagination support
- 🛡️ **Turnstile Verification** - Cloudflare Turnstile integration for bot protection
- 👨‍💼 **User Management** - Admin can batch enable/disable users, extend credentials, reset keys

### ⚡ Performance & Storage
- 🚀 **High Performance** - Built on Cloudflare Workers with global CDN acceleration
- 🗄️ **Multi-tier Storage** - PostgreSQL + Redis + KV hybrid architecture support
- 💾 **Flexible Configuration** - Optional database and cache for handling massive traffic
- 📈 **Scalable** - Easily handle 100K+ account pools or high-frequency calls

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
# Admin Configuration
ADMIN_TOKEN = "your-secure-admin-token-here"  # Set a strong password

# User System Configuration (v3.0.0+)
AUTH_SECRET = "your-jwt-secret-key-here"  # JWT signing key, recommend 32+ random characters
ENABLE_TURNSTILE = "true"  # Enable Turnstile bot protection
TURNSTILE_SITE_KEY = "your-turnstile-site-key"  # Cloudflare Turnstile Site Key
TURNSTILE_SECRET_KEY = "your-turnstile-secret-key"  # Cloudflare Turnstile Secret Key

# Email Service Configuration (v3.0.0+)
EMAIL_FORWARD_URL = "your-push-all-in-one-url"  # push-all-in-one email forwarding service URL
EMAIL_HOST = "smtp.example.com"  # SMTP server address
EMAIL_PORT = "587"  # SMTP port
EMAIL_AUTH_USER = "your-email@example.com"  # SMTP username
EMAIL_AUTH_PASS = "your-email-password"  # SMTP password
EMAIL_SECURE = "true"  # Use TLS
```

> ⚠️ **Important**: `wrangler.toml` contains sensitive information and is added to `.gitignore`
>
> 📧 **Email Service**: Recommend using [push-all-in-one](https://github.com/sinlatansen/push-all-in-one) for email forwarding
>
> 🛡️ **Turnstile**: Create a Turnstile site in [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) to get the keys

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

### Manual Deployment Trigger

In GitHub Actions page, select "Deploy to Cloudflare Workers" workflow and click "Run workflow".

## 📊 Architecture

```mermaid
graph TB
    Client[Client Application]
    CF[Cloudflare Workers<br/>Global CDN Edge]
    Auth[Authentication]
    Pool[API Pool Manager]
    Cache[Cache Layer]
    Storage[Storage Layer]

    Ollama[Ollama API]
    OpenRouter[OpenRouter API]

    Redis[(Redis<br/>Cache)]
    PG[(PostgreSQL<br/>Supabase)]
    KV[(Cloudflare KV)]

    Client -->|HTTPS Request| CF
    CF --> Auth
    Auth -->|Verify Token| Pool
    Pool --> Cache
    Cache --> Storage

    Pool -->|Round-robin| Ollama
    Pool -->|Round-robin| OpenRouter

    Storage --> Redis
    Storage --> PG
    Storage --> KV

    style CF fill:#f96,stroke:#333,stroke-width:2px
    style Pool fill:#6c6,stroke:#333,stroke-width:2px
    style Storage fill:#69f,stroke:#333,stroke-width:2px
```

## 📖 Usage

### Admin Dashboard

Access the deployed URL (e.g., `https://ollama-api-pool.your-name.workers.dev`) and enter your admin token.

<details>
<summary><b>📥 Import API Keys</b></summary>

#### Method 1: Single Add

Enter an Ollama API Key in the "API Keys" tab and click Add.

#### Method 2: Batch Import

1. Switch to "Batch Import" tab
2. Paste `ollama.txt` content
3. Click Import

Format example:

```text
test@example.com----password123----session_token----ollama-abc123...
user@test.com----pass456----session_data----ollama-def456...
```

</details>

<details>
<summary><b>🔑 Create Client Tokens</b></summary>

1. Switch to "Client Tokens" tab
2. Enter token name
3. Click Create
4. Copy the generated token for client use

</details>

<details>
<summary><b>📊 View Key Statistics</b></summary>

1. Switch to "Analytics" tab
2. View detailed stats for each key:
   - Total requests, success/failure counts
   - Success rate percentage
   - Last used time
   - Current status (active/disabled)
3. Manually enable/disable keys
4. Run batch health checks

</details>

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

#### Ollama API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | Ollama Chat Completions (OpenAI compatible) |
| `/v1/models` | GET | Get Ollama model list |

#### OpenRouter API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/openrouter/v1/chat/completions` | POST | OpenRouter Chat Completions (OpenAI compatible) |
| `/openrouter/v1/models` | GET | Get OpenRouter model list |

#### Management API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Admin dashboard homepage |
| `/health` | GET | Health check |
| `/stats` | GET | Public statistics page |
| `/api-docs` | GET | API documentation |
| `/admin/public-stats` | GET | Public statistics data API |
| `/admin/api-keys` | GET/POST/DELETE | Manage API keys |
| `/admin/api-keys/import` | POST | Batch import API keys |
| `/admin/api-keys/import-from-txt` | POST | Import from ollama.txt format |
| `/admin/api-keys/import-with-validation` | POST | Validated import (line-by-line validation) |
| `/admin/keys/stats` | GET | Get key usage statistics |
| `/admin/keys/enable` | POST | Manually enable API key |
| `/admin/keys/disable` | POST | Manually disable API key |
| `/admin/keys/health-check` | POST | Batch health check |
| `/admin/tokens` | GET/POST/DELETE | Manage client tokens |
| `/admin/stats` | GET | Get statistics overview |
| `/admin/cache/stats` | GET | Get cache statistics |
| `/admin/cache/clear` | POST | Clear cache |

> 💡 **Tip**: Management APIs support `?provider=openrouter` parameter to specify provider

## 🛠️ Configuration

<details>
<summary><b>📝 wrangler.toml Configuration Guide</b></summary>

```toml
name = "ollama-api-pool"
main = "src/index.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "API_KEYS"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "ACCOUNTS"
id = "your-accounts-kv-id"

[vars]
# Admin token (must be changed)
ADMIN_TOKEN = "your-admin-secret-token"

# Feature switches
ENABLE_ANALYTICS = "true"        # Enable analytics
ENABLE_RATE_LIMIT = "true"       # Enable IP rate limiting
ENABLE_BOT_DETECTION = "true"    # Enable bot detection
DISABLE_KV_STORAGE = "true"      # Disable KV writes, use Redis/Postgres

# Rate limiting configuration
RATE_LIMIT_REQUESTS = "60"       # Max requests per IP per minute
RATE_LIMIT_WINDOW = "60"         # Time window (seconds)

# Statistics sampling rates (reduce KV write pressure)
STATS_SAMPLE_RATE = "0.1"        # Global stats sampling rate (0.1 = 10%)
MODEL_STATS_SAMPLE_RATE = "0.2"  # Model stats sampling rate (0.2 = 20%)

# External storage (optional but highly recommended)
REDIS_URL = "rediss://default:***@your-redis.upstash.io:6379"
DATABASE_URL = "postgresql://postgres.***:***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_REST_URL = "https://your-project.supabase.co/rest/v1"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOi..."
```

> ✅ **Recommended Setup**: PostgreSQL (Supabase) + Redis (Upstash) + Cloudflare KV

</details>

<details>
<summary><b>🗄️ PostgreSQL (Supabase) Database Integration</b></summary>

### Create Database Tables

1. Execute the following SQL in your Supabase project:

```sql
-- API Keys main table
create table if not exists ollama_api_keys (
  api_key text primary key,
  username text,
  status text default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz,
  failed_until timestamptz,
  disabled_until timestamptz,
  consecutive_failures integer default 0
);

-- API Keys statistics table
create table if not exists ollama_api_key_stats (
  api_key text primary key references ollama_api_keys(api_key) on delete cascade,
  total_requests bigint default 0,
  success_count bigint default 0,
  failure_count bigint default 0,
  success_rate numeric default 0,
  last_used timestamptz,
  last_success timestamptz,
  last_failure timestamptz,
  consecutive_failures integer default 0,
  created_at timestamptz default now()
);

-- Client tokens table
create table if not exists ollama_api_client_tokens (
  token text primary key,
  name text,
  created_at timestamptz default now(),
  expires_at timestamptz,
  request_count bigint default 0
);

-- Global statistics table
create table if not exists ollama_api_global_stats (
  id text primary key default 'global',
  total_requests bigint default 0,
  success_count bigint default 0,
  failure_count bigint default 0,
  updated_at timestamptz default now()
);

-- Model statistics table (multi-provider support)
create table if not exists ollama_api_model_stats (
  id serial primary key,
  provider text default 'ollama',
  model text not null,
  total_requests bigint default 0,
  success_count bigint default 0,
  failure_count bigint default 0,
  last_used timestamptz,
  created_at timestamptz default now(),
  unique(provider, model)
);

-- Hourly model statistics (for trend charts)
create table if not exists ollama_api_model_hourly (
  id serial primary key,
  provider text default 'ollama',
  model text not null,
  hour timestamptz not null,
  requests bigint default 0,
  success bigint default 0,
  failure bigint default 0,
  created_at timestamptz default now(),
  unique(provider, model, hour)
);
```

2. Get from Supabase project settings:
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **REST URL** → `SUPABASE_REST_URL`
   - **Connection String** → `DATABASE_URL`

3. Add configuration to `wrangler.toml` or GitHub Secrets

### OpenRouter Table Structure

To support OpenRouter, add tables with `openrouter_api_` prefix:

```sql
-- OpenRouter API Keys table
create table if not exists openrouter_api_keys (
  api_key text primary key,
  username text,
  status text default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz,
  failed_until timestamptz,
  disabled_until timestamptz,
  consecutive_failures integer default 0
);

-- Other tables follow similar naming...
```

</details>

## 📚 Documentation

- **[Configuration Guide](./CONFIGURATION.md)** - Detailed environment variable configuration
- **[Optimization Guide](./OPTIMIZATION.md)** - KV optimization and performance tuning
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[API Documentation](https://ollama-api-pool.h7ml.workers.dev/api-docs)** - Online API docs
- **[Live Statistics](https://ollama-api-pool.h7ml.workers.dev/stats)** - Public statistics dashboard

---

## 📊 How It Works

### Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant W as Workers
    participant A as Authentication
    participant P as API Pool
    participant O as Ollama API
    participant R as OpenRouter API

    C->>W: HTTPS Request
    W->>A: Verify Client Token
    A-->>W: Token Valid
    W->>P: Get Available API Key
    P->>P: Round-robin rotation

    alt Ollama Request
        P->>O: Forward with API Key
        O-->>P: Response
    else OpenRouter Request
        P->>R: Forward with API Key
        R-->>P: Response
    end

    alt Request Success
        P->>P: Record success stats
        P-->>W: Return result
    else Request Failed
        P->>P: Mark failure + Retry
        P->>P: Auto-disable after 3 consecutive failures
    end

    W-->>C: Return response
```

<details>
<summary><b>⚙️ Key Rotation Strategy</b></summary>

- **Rotation Algorithm**: Round-robin
- **Failure Marking**: Mark failed keys for 1 hour
- **Auto Recovery**: Retry automatically after 1 hour
- **Max Retries**: Maximum 3 retries per request

</details>

<details>
<summary><b>🤖 Smart Management</b></summary>

- **Auto Disable**: Automatically disable keys after 3 consecutive failures for 1 hour
- **Manual Control**: Support manual enable/disable of any key with custom duration
- **Health Check**: Batch validate all key availability and auto-update status
- **Analytics**: Real-time tracking for each key:
  - Total requests, success/failure counts
  - Success rate percentage
  - Last used time
  - Consecutive failure count
  - Disable reason (auto/manual)

</details>

## 🔒 Security Recommendations

<details>
<summary><b>🛡️ Security Best Practices</b></summary>

1. **Protect Admin Token**: Use strong random password
2. **Limit Client Tokens**: Create separate tokens for different users
3. **Regular Rotation**: Periodically update API Keys and Tokens
4. **Monitor Logs**: Regularly check statistics
5. **Access Control**: Restrict admin dashboard access by IP

</details>

## 📝 Development

<details>
<summary><b>🔧 Development Commands</b></summary>

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

</details>

## 🐛 Troubleshooting

<details>
<summary><b>❓ Common Issues and Solutions</b></summary>

### API Key Frequently Fails

Check if upstream Ollama API Key is valid:

```bash
curl https://ollama.com/v1/chat/completions \
  -H "Authorization: Bearer ollama-xxx..." \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2:1b","messages":[{"role":"user","content":"test"}]}'
```

### Client Cannot Connect

- Check if client token is valid
- View Worker logs: `pnpm wrangler tail`
- Verify CORS configuration

### Import Failed

Ensure ollama.txt format is correct:

```text
email----password----session----api_key
```

</details>

## 📦 Project Structure

<details>
<summary><b>📁 Directory Layout</b></summary>

```text
ollama-api-pool/
├── .github/
│   └── workflows/
│       ├── api-test.yml       # Automated API testing workflow
│       └── deploy.yml         # Automated deployment workflow
├── scripts/
│   ├── api-test.js            # API testing script
│   └── README.md              # Testing script documentation
├── src/
│   ├── html/
│   │   ├── login.js           # Login page
│   │   └── main-dashboard.js  # Main dashboard page
│   ├── static/
│   │   ├── api-docs-html.js   # API documentation HTML
│   │   ├── dashboard-js.js    # Dashboard JavaScript
│   │   ├── login-js.js        # Login JavaScript
│   │   └── stats-html.js      # Statistics page HTML
│   ├── admin.js               # Admin API
│   ├── auth.js                # Authentication module
│   ├── buildInfo.js           # Build information
│   ├── cache.js               # Cache module
│   ├── dashboard.js           # Admin dashboard
│   ├── index.js               # Main entry point
│   ├── keyManager.js          # Key management
│   ├── postgres.js            # PostgreSQL integration
│   ├── providers.js           # Provider configuration
│   ├── proxy.js               # API proxy
│   ├── redis.js               # Redis integration
│   └── utils.js               # Utility functions
├── .gitignore                 # Git ignore file
├── CONFIGURATION.md           # Configuration guide
├── CONTRIBUTING.md            # Contributing guide
├── LICENSE                    # MIT License
├── OPTIMIZATION.md            # Optimization guide
├── package.json               # Dependencies configuration
├── PROJECT_SUMMARY.md         # Project summary
├── README.md                  # Chinese documentation
├── README_EN.md               # English documentation
├── wrangler.toml.example      # Cloudflare config template
└── wrangler.toml              # Cloudflare configuration (local)
```

</details>

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
