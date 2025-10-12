/**
 * 构建信息 - 在部署时自动生成
 */

const BUILD_TIME_PLACEHOLDER = '{{BUILD_TIME_ISO}}';
const STARTUP_TIME_ISO = new Date().toISOString();

// 构建时间戳（部署时生成，若未替换则使用启动时间）
export const BUILD_TIME = BUILD_TIME_PLACEHOLDER;

function formatChineseTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

function resolveBuildTimeIso(env) {
  const candidate = env?.BUILD_TIME || BUILD_TIME;
  if (!candidate || candidate === BUILD_TIME_PLACEHOLDER) {
    return STARTUP_TIME_ISO;
  }
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    return STARTUP_TIME_ISO;
  }
  return parsed.toISOString();
}

// 格式化构建时间（中文格式）
export function getBuildTime(env) {
  const iso = resolveBuildTimeIso(env);
  return formatChineseTime(new Date(iso));
}

// 格式化当前运行时间（中文格式）
export function getCurrentTime() {
  const date = new Date();
  return formatChineseTime(date);
}
