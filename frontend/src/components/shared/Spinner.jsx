const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`${sizes[size]} ${className} border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin`} />
  );
}
