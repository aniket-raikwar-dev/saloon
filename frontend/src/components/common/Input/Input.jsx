const Input = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-group__label">
          {label}
          {required && <span className="text-accent">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className="input-group__input"
      />
      {error && <span className="input-group__error">{error}</span>}
      {hint && !error && <span className="input-group__hint">{hint}</span>}
    </div>
  )
}

export default Input
