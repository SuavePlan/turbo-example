// Electrobun build configuration. `electrobun build` produces a native app for
// the *current host* (Electrobun builds per-platform); CI builds the others.
export default {
  app: {
    name: "Turbo Showcase (Electrobun)",
    identifier: "sh.suaveplan.turbo.electrobun",
    version: "0.0.1",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    // Bundle CEF for reliable cross-distro Linux/Windows rendering.
    bundleCEF: true,
  },
  views: {
    main: {
      entrypoint: "src/index.html",
    },
  },
};
