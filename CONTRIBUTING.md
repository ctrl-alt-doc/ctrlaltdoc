# Contributing to ctrl alt doc

Thanks for helping improve ctrl alt doc.

## Before opening an issue

Please search existing issues and check the bundled documentation first. Include a minimal reproduction for bugs and the exact environment where the problem occurs.

## Feature requests

ctrl alt doc 1.0 is feature-frozen. Issues are still welcome, but new feature proposals will be evaluated for a later release rather than added casually to the 1.0 feature set.

A useful feature request must include:

- the documentation problem and the users affected
- the proposed author-facing experience
- alternatives or workarounds considered
- concrete, testable acceptance criteria
- compatibility and scope considerations, including Markdown extensions, SSR, search, production builds, and generated projects where relevant

Requests that are primarily a product redesign, duplicate an existing feature, or require a ctrl alt doc-specific abstraction around a capability already provided by Svelte or Vite may be closed or deferred.

## Pull requests

Keep changes focused. Preserve existing Markdown behaviour and framework-owned icon configuration unless the issue explicitly calls for a breaking change. Update documentation and tests when behaviour changes.

Before submitting a pull request, run:

```bash
pnpm check
pnpm lint
pnpm build
```

For changes involving the CLI or generated projects, also validate a freshly generated project and its production build.
