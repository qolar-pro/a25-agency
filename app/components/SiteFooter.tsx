// Pristine minimal footer. Entirely static English content with no
// interactivity or translated strings, so it stays a server component —
// rendered straight into the initial HTML with nothing to hydrate. JSX
// verbatim from App.tsx.
export default function SiteFooter() {
  return (
    <footer className="bg-blue-700 border-t border-blue-800 mt-20 py-12 px-6 sm:px-10 lg:px-16 xl:px-24 shadow-inner">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center justify-between text-center md:text-left font-mono text-xs text-zinc-300 font-bold uppercase tracking-wider">
        {/* Logo & Company details */}
        <div className="space-y-2 col-span-1">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <img src="/a25icon.jpeg" alt="A25 logo" className="h-8 w-auto rounded shadow-sm" />
            <span className="text-white font-display tracking-widest text-sm">A25 WORKFORCE</span>
          </div>
          <span className="block text-[11px] text-zinc-300 font-normal normal-case pt-1 leading-relaxed">
            Bilateral recruitment pathways connecting premium North Macedonian private sectors and trade candidates in Asia.
          </span>
        </div>

        {/* Contact Details */}
        <div className="space-y-1.5 text-center font-normal uppercase text-zinc-300 text-[11px] leading-relaxed">
          <span className="block font-bold text-xs text-white">DIRECT OFFICE DESK</span>
          <span className="block">CEO Boris Vchkov // Skopje, Macedonia</span>
          <span className="block normal-case font-mono font-bold text-zinc-100">Phone: +389 71 326 293</span>
          <span className="block normal-case font-mono font-bold text-zinc-100">Email: contact@a25.mk</span>
        </div>

        {/* Regional hubs */}
        <div className="flex flex-col md:items-end justify-center gap-1.5">
          <span className="text-white text-xs font-bold">BALKAN RECRUITMENT SITES</span>
          <div className="flex gap-2.5 md:justify-end text-zinc-300 text-[11px] font-bold uppercase">
            <span>SKOPJE</span>
            <span>•</span>
            <span>NORTH MACEDONIA</span>
          </div>
          <span className="block text-[11px] text-zinc-300 font-normal">© 2026 A25 Agency. All rights reserved.</span>
          <a
            href="https://blancographics.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[10px] text-zinc-400 hover:text-white transition-colors mt-1"
          >
            MADE BY APEX SOLUTIONS
          </a>
        </div>
      </div>
    </footer>
  );
}
