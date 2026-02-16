import { ChevronDown } from 'lucide-react';

const baseSelectClasses =
  'w-full appearance-none bg-slate-950/40 border border-white/15 rounded-xl px-3 py-2.5 pr-10 text-white text-sm shadow-[0_8px_24px_rgba(15,23,42,0.22)] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

const Select = ({
  value,
  onChange,
  options = [],
  className = '',
  children,
  ...props
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={`${baseSelectClasses} ${className}`.trim()}
      {...props}
    >
      {children ||
        options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#121426] text-white"
          >
            {option.label}
          </option>
        ))}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
      aria-hidden="true"
    />
  </div>
);

export default Select;
