const AchievementGridProgressBar = ({
  color,
  currentText,
  label,
  progress,
  progressLabel
}) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs text-white/60 mb-1">
      <span>{label}</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
    {(currentText || progressLabel) && (
      <div className={`text-[11px] text-white/55 mt-1 ${progressLabel ? 'flex items-center justify-between' : 'text-right'}`}>
        {progressLabel ? <span>{currentText}</span> : currentText}
        {progressLabel ? <span>{progressLabel}</span> : null}
      </div>
    )}
  </div>
);

export default AchievementGridProgressBar;
