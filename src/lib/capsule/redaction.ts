const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/(Authorization\s*:\s*Bearer\s+)([^\s,;]+)/gi, "$1[REDACTED]"],
  [/\b(api[_-]?key\s*[=:]\s*)([^\s,;]+)/gi, "$1[REDACTED]"],
  [/\b(private[_-]?key\s*[=:]\s*)([^\s,;]+)/gi, "$1[REDACTED]"],
  [/\b(secret\s*[=:]\s*)([^\s,;]+)/gi, "$1[REDACTED]"],
  [/\b(token\s*[=:]\s*)([^\s,;]+)/gi, "$1[REDACTED]"],
  [/\b(sk_(?:live|test)_[a-zA-Z0-9_-]+)/g, "[REDACTED_OPENAI_KEY]"],
  [/\b(suiprivkey[a-zA-Z0-9_:-]+)/g, "[REDACTED_SUI_PRIVATE_KEY]"],
];

export function redactPublicText(value: string, maxLength = 240): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  const redacted = SECRET_PATTERNS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), normalized);
  return redacted.length > maxLength ? `${redacted.slice(0, maxLength - 1)}…` : redacted;
}
