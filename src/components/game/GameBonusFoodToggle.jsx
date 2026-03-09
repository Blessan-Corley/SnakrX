const GameBonusFoodToggle = ({ bonusFoodEnabled, description, onToggle }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Large Bonus Food</h3>
        <p className="text-sm text-white/65 mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={bonusFoodEnabled}
        aria-label="Toggle large bonus food"
        onClick={onToggle}
        className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-all duration-200 ${
          bonusFoodEnabled
            ? 'border-primary-400 bg-primary-500/25 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
            : 'border-white/15 bg-white/10'
        }`}
      >
        <span className="sr-only">Toggle large bonus food</span>
        <span
          className={`absolute left-1 text-[9px] font-semibold uppercase tracking-[0.24em] transition-opacity duration-200 ${
            bonusFoodEnabled ? 'text-primary-200 opacity-100' : 'opacity-0'
          }`}
        >
          On
        </span>
        <span
          className={`absolute right-1 text-[9px] font-semibold uppercase tracking-[0.24em] transition-opacity duration-200 ${
            bonusFoodEnabled ? 'opacity-0' : 'text-white/70 opacity-100'
          }`}
        >
          Off
        </span>
        <span
          className={`ml-1 inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
            bonusFoodEnabled ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  </div>
);

export default GameBonusFoodToggle;
