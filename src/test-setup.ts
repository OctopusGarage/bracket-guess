import '@testing-library/jest-dom'
import i18n from './i18n'

// Tests assert the Chinese strings/team names. Pin the language so the
// browser-locale detector doesn't make them depend on the test runner's locale.
i18n.changeLanguage('zh')

// Fix: In Node.js 18+, the global Request is undici's native implementation.
// jsdom overrides AbortController with its own class, which is incompatible with
// undici's strict instanceof check on RequestInit.signal.
// React Router's data-router calls `new Request(url, { signal })` during navigation
// (even with no loaders), which throws a TypeError in this environment.
// This Proxy wraps the Request constructor and retries without the signal on failure,
// allowing router navigation (Navigate, navigate()) to work correctly in jsdom tests.
if (typeof globalThis.Request !== 'undefined') {
  const OrigRequest = globalThis.Request
  globalThis.Request = new Proxy(OrigRequest, {
    construct(Target, args: [RequestInfo | URL, RequestInit?]) {
      const [input, init] = args
      try {
        return new Target(input, init)
      } catch (e) {
        if (e instanceof TypeError && init?.signal !== undefined) {
          // Retry without the incompatible AbortSignal
          const { signal: _signal, ...rest } = init
          return new Target(input, rest as RequestInit)
        }
        throw e
      }
    },
  })
}
