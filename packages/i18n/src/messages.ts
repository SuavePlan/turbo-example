/**
 * The shared message catalog for the whole ecosystem. Every surface (web,
 * desktop x2, extension, mobile) translates from this single source of truth.
 * Supported locales: en-GB (default) and zh-CN.
 */

export const locales = ["en-GB", "zh-CN"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en-GB";

/** Human-readable language names, shown in the language switcher. */
export const localeNames: Record<Locale, string> = {
  "en-GB": "English (UK)",
  "zh-CN": "简体中文",
};

export type MessageKey =
  | "appName"
  | "tagline"
  | "language"
  | "pdf.title"
  | "pdf.upload"
  | "pdf.pages"
  | "pdf.docTitle"
  | "pdf.words"
  | "image.title"
  | "image.upload"
  | "pingApi"
  | "renderedOn"
  | "error"
  | "mobile.describePdf"
  | "server.healthy"
  | "server.upstreamUnreachable"
  | "server.upstreamStatus"
  | "server.invalidBase64"
  | "server.pdfParse"
  | "server.imageResize"
  | "server.unsupportedFormat";

export const messages: Record<Locale, Record<MessageKey, string>> = {
  "en-GB": {
    appName: "Turbo Polyglot Showcase",
    tagline: "Upload a document — the API hands it to Python and back.",
    language: "Language",
    "pdf.title": "PDF info",
    "pdf.upload": "Upload a PDF — parsed by the Python service.",
    "pdf.pages": "Pages",
    "pdf.docTitle": "Title",
    "pdf.words": "Words",
    "image.title": "Image resize",
    "image.upload": "Upload an image — resised to 256×256 by the Python service.",
    pingApi: "Ping API",
    renderedOn: "Rendered on {surface}",
    error: "Error",
    "mobile.describePdf": "Describe a PDF",
    "server.healthy": "Service is healthy",
    "server.upstreamUnreachable": "The Python service is unreachable at {url}.",
    "server.upstreamStatus": "The Python service responded with status {status}.",
    "server.invalidBase64": "Invalid base64 payload.",
    "server.pdfParse": "Could not parse the PDF.",
    "server.imageResize": "Could not resize the image.",
    "server.unsupportedFormat": "Unsupported image format: {format}.",
  },
  "zh-CN": {
    appName: "Turbo 多语言示例",
    tagline: "上传文档——接口交给 Python 处理后返回结果。",
    language: "语言",
    "pdf.title": "PDF 信息",
    "pdf.upload": "上传 PDF——由 Python 服务解析。",
    "pdf.pages": "页数",
    "pdf.docTitle": "标题",
    "pdf.words": "字数",
    "image.title": "图片缩放",
    "image.upload": "上传图片——由 Python 服务缩放到 256×256。",
    pingApi: "测试接口",
    renderedOn: "运行于 {surface}",
    error: "错误",
    "mobile.describePdf": "解析 PDF",
    "server.healthy": "服务运行正常",
    "server.upstreamUnreachable": "无法连接 Python 服务：{url}。",
    "server.upstreamStatus": "Python 服务返回状态码 {status}。",
    "server.invalidBase64": "无效的 base64 数据。",
    "server.pdfParse": "无法解析该 PDF。",
    "server.imageResize": "无法缩放该图片。",
    "server.unsupportedFormat": "不支持的图片格式：{format}。",
  },
};
