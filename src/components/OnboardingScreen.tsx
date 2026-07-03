interface Props {
  onDone: () => void
}

export function OnboardingScreen({ onDone }: Props) {
  function done() {
    localStorage.setItem('ora-onboarded', '1')
    onDone()
  }

  return (
    <div className="min-h-screen bg-[#f8f4ee] flex flex-col items-center justify-center px-8">

      <div className="text-center mb-14">
        <h1 className="font-serif text-6xl text-stone-800 tracking-wide">Ora</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400 mt-3">
          Tägliche lutherische Andacht
        </p>
      </div>

      <div className="w-full max-w-xs space-y-5 mb-14">
        {[
          {
            head: 'Das Kirchenjahr als Rückgrat',
            body: 'Evangelium, Epistel und Psalm wechseln nach der lutherischen Perikopenordnung — jeden Sonntag ein neues Zentrum.',
          },
          {
            head: 'Morgen, Tag und Abend',
            body: 'Die Andacht passt sich der Tageszeit an: mit Luthers Morgen- oder Abendgebet als Rahmen.',
          },
          {
            head: 'Deine Gedanken bleiben',
            body: 'Markiere Stellen, schreibe Notizen — alles wird gespeichert und bleibt dir erhalten.',
          },
        ].map(({ head, body }) => (
          <div key={head} className="flex gap-4 items-start">
            <div className="w-1 h-full bg-stone-300 rounded-full flex-shrink-0 mt-1.5 self-stretch min-h-[1rem]" />
            <div>
              <p className="font-serif text-[15px] text-stone-700 leading-snug">{head}</p>
              <p className="font-serif text-[13px] text-stone-400 mt-0.5 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={done}
        className="w-full max-w-xs bg-stone-800 hover:bg-stone-700 text-[#f8f4ee] font-serif text-base rounded px-6 py-3.5 transition-colors"
      >
        Zur Andacht
      </button>

      <p className="font-serif text-[11px] text-stone-300 mt-6 text-center italic max-w-xs leading-relaxed">
        Alle Texte sind gemeinfrei: Lutherbibel 1912, Kleiner Katechismus 1529.
      </p>

    </div>
  )
}
