import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Zap,
  Layers,
  Share2,
  Download,
  Keyboard,
  Monitor,
  Terminal,
  Apple,
  ChevronRight,
  ArrowRight,
  Crosshair,
  FileDown,
  Github,
  ExternalLink,
} from "lucide-react";

const SUPPORTED_TOOLS = [
  { name: "Neovim", color: "#57A143" },
  { name: "Vim", color: "#019833" },
  { name: "Zed", color: "#84B5FF" },
  { name: "VS Code", color: "#007ACC" },
  { name: "Cursor", color: "#A78BFA" },
  { name: "tmux", color: "#1BB91F" },
  { name: "Kitty", color: "#F5C542" },
  { name: "Ghostty", color: "#C8C8C8" },
  { name: "WezTerm", color: "#4F46E5" },
  { name: "Alacritty", color: "#F0C674" },
  { name: "Zsh", color: "#EC4899" },
  { name: "Espanso", color: "#F97316" },
  { name: "Lazygit", color: "#2DD4BF" },
  { name: "AeroSpace", color: "#A855F7" },
  { name: "skhd", color: "#EF4444" },
  { name: "i3 / Sway", color: "#38BDF8" },
  { name: "Hyprland", color: "#67E8F9" },
  { name: "Obsidian", color: "#C084FC" },
];

const FEATURES = [
  {
    icon: Search,
    title: "fuzzy search",
    desc: "instantly find any binding across all your tools with highlighted matches",
    span: "col-span-1",
  },
  {
    icon: Layers,
    title: "filter by app",
    desc: "focus on specific tools or see everything at once. filter by category, custom vs default",
    span: "col-span-1",
  },
  {
    icon: Crosshair,
    title: "conflict detection",
    desc: "discover overlapping keybindings across different tools before they bite you",
    span: "col-span-1",
  },
  {
    icon: Keyboard,
    title: "practice mode",
    desc: "test your keybinding knowledge with an interactive quiz. track streaks and high scores",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: Share2,
    title: "share & export",
    desc: "generate shareable urls or export bindings as json, png, or pdf",
    span: "col-span-1",
  },
  {
    icon: Zap,
    title: "12 themes",
    desc: "hacker, tokyo night, dracula, catppuccin, nord, gruvbox, kanagawa, monokai, rose pine, and more",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: Monitor,
    title: "desktop + web",
    desc: "native desktop app reads your real local config files instantly. web version connects to your public github dotfiles repo",
    span: "col-span-1",
  },
];

const TYPING_LINES = [
  "$ cheatsheet",
  "  loading config files...",
  "  neovim    ········ 47 bindings",
  "  tmux      ········ 12 bindings",
  "  aerospace ········ 23 bindings",
  "  zed       ········ 18 bindings",
  "  kitty     ········  8 bindings",
  "  zsh       ········ 31 bindings",
  "",
  "  total: 139 bindings loaded",
  "  ready_",
];

function TerminalAnimation() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (currentLine >= TYPING_LINES.length) {
      setDone(true);
      return;
    }

    const line = TYPING_LINES[currentLine];

    if (currentChar >= line.length) {
      setLines((prev) => [...prev, line]);
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
      return;
    }

    const speed = currentLine === 0 ? 40 : 15;
    const timer = setTimeout(() => setCurrentChar((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [currentLine, currentChar, done]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => {
      setLines([]);
      setCurrentLine(0);
      setCurrentChar(0);
      setDone(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [done]);

  const partialLine =
    currentLine < TYPING_LINES.length
      ? TYPING_LINES[currentLine].slice(0, currentChar)
      : "";

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-1 bg-accent/10 blur-xl rounded-lg" />
      <div className="relative border border-border bg-bg-secondary rounded-lg overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-bg-primary/50">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-[10px] text-text-muted font-mono tracking-wider">
            cheatsheet
          </span>
        </div>
        <div className="p-4 font-mono text-xs leading-relaxed h-[260px] overflow-hidden">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`${
                line.startsWith("$")
                  ? "text-accent"
                  : line.includes("total:")
                    ? "text-accent font-bold"
                    : line.includes("ready_")
                      ? "text-accent"
                      : "text-text-secondary"
              }`}
            >
              {line || "\u00A0"}
            </div>
          ))}
          {currentLine < TYPING_LINES.length && (
            <div
              className={`${
                TYPING_LINES[currentLine].startsWith("$")
                  ? "text-accent"
                  : "text-text-secondary"
              }`}
            >
              {partialLine}
              <span className="cursor-blink text-accent">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function InstallBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-bg-secondary/50 rounded-lg p-5 hover:border-accent/30 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm text-text-primary font-medium tracking-wider">{title}</h4>
      </div>
      <div className="font-mono text-xs text-text-secondary space-y-2">
        {children}
      </div>
    </div>
  );
}

function CodeSnippet({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="relative group bg-bg-primary border border-border rounded px-3 py-2 cursor-pointer hover:border-accent/30 transition-colors"
      onClick={() => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigator.clipboard.writeText(children);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
    >
      <code className="text-accent/90">{children}</code>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? "copied!" : "click to copy"}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const featuresSection = useInView();
  const toolsSection = useInView();
  const downloadSection = useInView();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-base text-accent tracking-wider">
            cheatsheet
          </span>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider">
              features
            </a>
            <a href="#tools" className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider">
              tools
            </a>
            <a href="#download" className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider">
              download
            </a>
            <Link
              to="/app"
              className="px-3 py-1.5 border border-accent/50 text-accent text-xs tracking-wider hover:bg-accent/10 transition-colors cursor-pointer"
            >
              open app <ChevronRight className="inline w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs text-accent/60 tracking-[0.3em] uppercase">
                // developer keybinding viewer
              </p>
              <h1 className="text-4xl md:text-5xl font-display leading-tight text-text-primary">
                all your{" "}
                <span className="text-accent">keybindings</span>
                <br />
                in one place
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                parses your actual config files — including sourced files and
                includes — and displays every keybinding in a searchable,
                filterable ui. supports 18+ developer tools. free and open source.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/app"
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-primary text-sm font-medium tracking-wider hover:bg-accent-light transition-colors cursor-pointer"
              >
                launch web app
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#download"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary text-sm tracking-wider hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                download desktop app
              </a>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/MagnusPladsen/my-cheatsheet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
                open source on github
              </a>
              <span className="text-text-muted/30">|</span>
              <span className="text-xs text-text-muted">
                mit license
              </span>
            </div>
          </div>
          <TerminalAnimation />
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        ref={featuresSection.ref}
        className={`py-24 px-6 transition-all duration-700 ${
          featuresSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-accent/60 tracking-[0.3em] uppercase mb-3">
              // features
            </p>
            <h2 className="text-2xl md:text-3xl font-display text-text-primary">
              everything you need to{" "}
              <span className="text-accent">master</span> your bindings
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`${f.span} group border border-border bg-bg-secondary/30 rounded-lg p-6 hover:border-accent/30 hover:bg-bg-secondary/60 transition-all duration-200 cursor-default`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <f.icon className="w-5 h-5 text-accent mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm text-text-primary font-medium tracking-wider mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Tools */}
      <section
        id="tools"
        ref={toolsSection.ref}
        className={`py-24 px-6 border-t border-border transition-all duration-700 ${
          toolsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-accent/60 tracking-[0.3em] uppercase mb-3">
              // supported tools
            </p>
            <h2 className="text-2xl md:text-3xl font-display text-text-primary">
              <span className="text-accent">18</span> tools and counting
            </h2>
            <p className="text-xs text-text-muted mt-3 max-w-lg leading-relaxed">
              cheatsheet parses the actual config files for each tool.
              neovim lua mappings, tmux binds, zsh aliases, toml configs, json keymaps — it reads them all.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SUPPORTED_TOOLS.map((tool, i) => (
              <div
                key={tool.name}
                className="group border border-border bg-bg-secondary/30 rounded-lg px-4 py-3 hover:border-accent/20 transition-all duration-200 cursor-default"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: tool.color }}
                  />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
                    {tool.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Desktop */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-accent/60 tracking-[0.3em] uppercase mb-3">
              // web vs desktop
            </p>
            <h2 className="text-2xl md:text-3xl font-display text-text-primary">
              why go <span className="text-accent">native</span>?
            </h2>
            <p className="text-xs text-text-muted mt-3 max-w-lg leading-relaxed">
              the web app is great for a quick look, but the desktop app unlocks the full power
              of cheatsheet by reading directly from your local config files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Web column */}
            <div className="border border-border bg-bg-secondary/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <ExternalLink className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm text-text-primary font-medium tracking-wider">web app</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  no install — runs in your browser
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  connect your public github dotfiles repo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  share bindings via url
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted mt-0.5 shrink-0">-</span>
                  <span className="text-text-muted">requires public github repo with dotfiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted mt-0.5 shrink-0">-</span>
                  <span className="text-text-muted">can't read private repos or local-only configs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted mt-0.5 shrink-0">-</span>
                  <span className="text-text-muted">can't follow source/include directives in configs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-text-muted mt-0.5 shrink-0">-</span>
                  <span className="text-text-muted">relies on github api (rate limits, caching)</span>
                </li>
              </ul>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 border border-border text-text-secondary text-xs tracking-wider hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
              >
                try web app <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Desktop column */}
            <div className="border border-accent/30 bg-accent/[0.03] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-4 h-4 text-accent" />
                <h3 className="text-sm text-accent font-medium tracking-wider">desktop app</h3>
                <span className="px-1.5 py-0.5 text-[9px] bg-accent/10 text-accent border border-accent/20 rounded tracking-wider">
                  recommended
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  reads your actual local config files — always up to date
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  follows source/include directives — picks up sourced tmux configs, zsh plugins, neovim requires, and vim runtime files
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  works with private configs, no github needed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  instant — no network requests, no rate limits
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  native performance (tauri/rust)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5 shrink-0">+</span>
                  macos + linux — homebrew, aur, deb, rpm, appimage
                </li>
              </ul>
              <a
                href="#download"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-accent text-bg-primary text-xs font-medium tracking-wider hover:bg-accent-light transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                download desktop app
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Download / Install */}
      <section
        id="download"
        ref={downloadSection.ref}
        className={`py-24 px-6 border-t border-border transition-all duration-700 ${
          downloadSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-accent/60 tracking-[0.3em] uppercase mb-3">
              // download
            </p>
            <h2 className="text-2xl md:text-3xl font-display text-text-primary">
              get <span className="text-accent">cheatsheet</span>
            </h2>
            <p className="text-xs text-text-muted mt-3 max-w-lg leading-relaxed">
              the desktop app reads your real local config files — no github repo needed,
              no network requests. just launch and see your bindings.
            </p>
          </div>

          {/* Web — secondary */}
          <div className="mb-8 border border-border bg-bg-secondary/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <ExternalLink className="w-5 h-5 text-text-muted" />
              <h3 className="text-base text-text-primary font-medium tracking-wider">
                web app — no install
              </h3>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              try cheatsheet in your browser. connect your public github dotfiles repo to see your own
              bindings, or browse the defaults. no signup required.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary text-sm tracking-wider hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
            >
              open web app
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop download grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InstallBlock
              title="macos (homebrew)"
              icon={<Apple className="w-4 h-4 text-text-muted" />}
            >
              <p className="text-text-muted mb-2">recommended for macos users. auto-updates via brew.</p>
              <CodeSnippet>brew tap magnuspladsen/cheatsheet</CodeSnippet>
              <CodeSnippet>brew install cheatsheet-app</CodeSnippet>
              <p className="text-[10px] text-text-muted mt-2">
                first launch fix if needed:{" "}
                <code className="text-accent/60">xattr -cr /Applications/cheatsheet.app</code>
              </p>
            </InstallBlock>

            <InstallBlock
              title="macos (direct download)"
              icon={<Apple className="w-4 h-4 text-text-muted" />}
            >
              <p className="text-text-muted mb-2">download the .dmg for your architecture.</p>
              <div className="space-y-1.5">
                <a
                  href="https://github.com/MagnusPladsen/my-cheatsheet/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded hover:border-accent/30 transition-colors group cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                  <span className="group-hover:text-accent transition-colors">apple silicon (m1/m2/m3/m4)</span>
                </a>
                <a
                  href="https://github.com/MagnusPladsen/my-cheatsheet/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded hover:border-accent/30 transition-colors group cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
                  <span className="group-hover:text-accent transition-colors">intel</span>
                </a>
              </div>
            </InstallBlock>

            <InstallBlock
              title="arch linux (aur)"
              icon={<Terminal className="w-4 h-4 text-text-muted" />}
            >
              <p className="text-text-muted mb-2">available on the aur. use your preferred aur helper.</p>
              <CodeSnippet>yay -S cheatsheet-app-bin</CodeSnippet>
              <p className="text-[10px] text-text-muted mt-1">
                or: <code className="text-accent/60">paru -S cheatsheet-app-bin</code>
              </p>
            </InstallBlock>

            <InstallBlock
              title="debian / ubuntu / mint"
              icon={<Terminal className="w-4 h-4 text-text-muted" />}
            >
              <p className="text-text-muted mb-2">
                download the .deb from{" "}
                <a
                  href="https://github.com/MagnusPladsen/my-cheatsheet/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent/60 hover:text-accent transition-colors"
                >
                  latest release
                </a>
                , then:
              </p>
              <CodeSnippet>sudo dpkg -i cheatsheet_*_amd64.deb</CodeSnippet>
              <CodeSnippet>sudo apt-get install -f</CodeSnippet>
            </InstallBlock>

            <InstallBlock
              title="fedora / rhel"
              icon={<Terminal className="w-4 h-4 text-text-muted" />}
            >
              <p className="text-text-muted mb-2">
                download the .rpm from{" "}
                <a
                  href="https://github.com/MagnusPladsen/my-cheatsheet/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent/60 hover:text-accent transition-colors"
                >
                  latest release
                </a>
                , then:
              </p>
              <CodeSnippet>sudo rpm -i cheatsheet-*.x86_64.rpm</CodeSnippet>
            </InstallBlock>

            <InstallBlock
              title="appimage (any linux)"
              icon={<Terminal className="w-4 h-4 text-text-muted" />}
            >
              <p className="text-text-muted mb-2">
                universal linux binary. download from{" "}
                <a
                  href="https://github.com/MagnusPladsen/my-cheatsheet/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent/60 hover:text-accent transition-colors"
                >
                  latest release
                </a>
                .
              </p>
              <CodeSnippet>chmod +x cheatsheet_*_amd64.AppImage</CodeSnippet>
              <CodeSnippet>./cheatsheet_*_amd64.AppImage</CodeSnippet>
            </InstallBlock>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm text-accent tracking-wider">
              cheatsheet
            </span>
            <span className="text-text-muted/30">|</span>
            <span className="text-xs text-text-muted">free & open source</span>
            <span className="text-text-muted/30">|</span>
            <span className="text-xs text-text-muted">mit license</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/MagnusPladsen/my-cheatsheet"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4" />
            </a>
            <Link
              to="/app"
              className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider cursor-pointer"
            >
              open app <ChevronRight className="inline w-3 h-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
