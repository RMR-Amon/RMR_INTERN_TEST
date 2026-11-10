import { memo, type ReactNode } from 'react'
import styles from './CodeBlock.module.scss'

// Minimal, safe tokenizer for readable highlighting (no innerHTML).
const TOKEN_RE =
  /(\/\/.*$|\/\*.*?\*\/)|('(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`)|(<\/?[a-zA-Z][\w-]*|\/?>)|\b(const|let|var|function|return|if|else|for|while|async|await|new|class|extends|import|from|export|default|type|interface|typeof|keyof|in|of|true|false|null|undefined|this|switch|case|try|catch|finally|throw|as|@use|@mixin|@include|@extend|@function|@return|@each|@apply)\b|(\b\d+(?:\.\d+)?(?:px|rem|em|%|fr|ms|s)?\b)/gm

const highlight = (line: string): ReactNode[] => {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN_RE)) {
    const index = m.index ?? 0
    if (index > last) out.push(line.slice(last, index))
    const cls = m[1] ? styles.cm : m[2] ? styles.str : m[3] ? styles.tag : m[4] ? styles.kw : styles.num
    out.push(
      <span key={index} className={cls}>
        {m[0]}
      </span>,
    )
    last = index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export const CodeBlock = memo(function CodeBlock({ code, label }: { code: string; label: string }) {
  const lines = code.replace(/\s+$/, '').split('\n')
  return (
    <div className={styles.block}>
      <div className={styles.bar} aria-hidden>
        <i />
        <i />
        <i />
        <span>{label}</span>
      </div>
      <pre className={styles.pre}>
        <code>
          {lines.map((line, i) => (
            <span key={i} className={styles.line}>
              <span className={styles.ln} aria-hidden>
                {i + 1}
              </span>
              {highlight(line)}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
})
