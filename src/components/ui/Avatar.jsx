// Avatar component with image branch and initials branch.
import { cn } from '../../lib/utils';
const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
};
function getInitials(name) {
    // Returns at most two uppercase initials from the provided display name.
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
export default function Avatar({ name, src, size = 'md', className }) {
return (<div className={cn('relative rounded-xl overflow-hidden flex items-center justify-center font-bold', 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white', sizeStyles[size], className)}>
            {/* Fallback branch renders initials when `src` is missing. */}
            {src ? (<img src={src} alt={name} className="h-full w-full object-cover" loading="lazy"/>) : (<span>{getInitials(name)}</span>)}
        </div>);
}


