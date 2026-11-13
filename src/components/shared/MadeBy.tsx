export default function MadeBy() {
  return (
    <div
      className="fixed bottom-3 inset-x-0 z-20 pointer-events-none select-none text-center text-[11px] leading-snug text-nl-black/30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      Made with <span className="text-nl-purple/60">♥</span> by Sarah Husslein
      <span className="hidden sm:inline"> · </span>
      <br className="sm:hidden" />
      Ideas, questions, good vibes? Ping me!
    </div>
  )
}
