export default function Button({
  children,
  className = "",
  variant = "default", // "default" | "primary" | "success"
  active = false,
  ...props
}) {
  const baseStyles = "px-4 py-2 rounded font-medium transition-colors";

  const variants = {
    default: active
      ? "bg-blue-600 text-white"
      : "bg-gray-200 hover:bg-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100",
  };

  const appliedVariant = variants[variant] || variants.default;

  return (
    <button
      className={`${baseStyles} ${appliedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
