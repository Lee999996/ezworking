import { highlighter } from '#utils/highlighter'

export const logger = {
  error(...args: unknown[]) {
    console.log(highlighter.error(args.join(' ')))
  },
  warn(...args: unknown[]) {
    console.log(highlighter.warn(args.join(' ')))
  },
  info(...args: unknown[]) {
    console.log(highlighter.info(args.join(' ')))
  },
  success(...args: unknown[]) {
    console.log(highlighter.success(args.join(' ')))
  },
  debug(...args: unknown[]) {
    if (process.env.DEBUG) {
      console.log(args.join(' '))
    }
  },
  log(...args: unknown[]) {
    console.log(args.join(' '))
  },
  break() {
    console.log('')
  },
}
