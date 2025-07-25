const layers = {
  presentation:
    "src/(modules/.*/(.*(controller|route|schema)\\.ts$)|middleware)",
  application: "src/(modules/.*/.*service\\.ts$|infrastructure/queue/jobs)",
  domain: "src/shared/ports",
  infrastructure: "src/(infrastructure/(?!queue/jobs)|db)",
};

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domain-should-not-depend-on-other-layers",
      comment:
        "The domain layer (ports) should be pure and depend on nothing else.",
      severity: "error",
      from: { path: layers.domain },
      to: { pathNot: layers.domain }, // Can't depend on anything but itself
    },
    {
      name: "application-should-not-depend-on-infrastructure",
      comment:
        "The application layer should only depend on domain ports, not concrete infrastructure.",
      severity: "error",
      from: { path: layers.application },
      to: { path: layers.infrastructure },
    },
    {
      name: "presentation-should-not-depend-on-infrastructure",
      comment:
        "The presentation layer should call the application layer, not talk to infrastructure directly.",
      severity: "error",
      from: { path: layers.presentation },
      to: { path: layers.infrastructure },
    },
    {
      name: "dependencies-should-flow-inwards",
      comment:
        "Presentation -> Application -> Domain. Dependencies should not flow in the other direction.",
      severity: "error",
      from: { path: layers.application },
      to: {
        path: layers.presentation,
        pathNot: "\\.schema\\.ts$",
      },
    },
    {
      name: "dependencies-should-flow-inwards-2",
      comment:
        "Presentation -> Application -> Domain. Dependencies should not flow in the other direction.",
      severity: "error",
      from: { path: layers.domain },
      to: { path: layers.application },
    },
  ],
  options: {
    tsConfig: {
      fileName: "tsconfig.json",
    },
    exclude: ["__tests__", "node_modules", "dist"],
  },
};
