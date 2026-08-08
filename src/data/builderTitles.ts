export const BUILDER_TITLES = [
  "🌴 Pixel Surfer",
  "🥥 Code Coconut",
  "💻 Beach Code Hacker",
  "🏄 Full Stack Surfer",
  "⛵ Debugging Nomad",
  "🧙 Goa Code Wizard",
  "🏴‍☠️ Product Pirate",
  "🧳 Terminal Tourist",
  "🌊 Rust Wave Rider",
  "🌴 Prompt Palm",
  "⚡ Async Anjuna Hacker",
  "☀️ Sunset Systems Architect",
  "🏝️ Shack Script Kid",
  "🏖️ Bayfront Byte Crusher",
  "🚀 Solana Shack Builder",
  "🕶️ High-Stakes Hacker",
  "🍹 Mojito Code Hacker",
  "🎸 Rock & Roll Refactoring",
  "🔥 Full-Stack Vagabond",
  "✨ Matrix Monolith Maker",
  "🐚 Shell Script Surfer",
  "🌞 Solar Power Builder",
  "🌴 Anjuna Algorithmist",
  "🎯 Zero-Knowledge Zealot",
  "💡 Lighthouse Logician"
];

export const POPULAR_ROLES = [
  "Full Stack Developer",
  "Backend Systems Engineer",
  "Frontend Wizard",
  "Protocol Architect",
  "Product Designer",
  "Smart Contract Dev",
  "DevOps Nomad",
  "Solana Builder",
  "Founding Engineer"
];

export function getRandomBuilderTitle(): string {
  const randomIndex = Math.floor(Math.random() * BUILDER_TITLES.length);
  return BUILDER_TITLES[randomIndex];
}
