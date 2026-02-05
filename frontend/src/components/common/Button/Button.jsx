const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClass = 'btn'
  const variantClass = `btn--${variant}`
  const sizeClass = size !== 'md' ? `btn--${size}` : ''
  const widthClass = fullWidth ? 'btn--full' : ''
  
  const classes = [baseClass, variantClass, sizeClass, widthClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button 
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && iconPosition === 'left' && <i className={`${icon} btn__icon`}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={`${icon} btn__icon`}></i>}
    </button>
  )
}

export default Button
