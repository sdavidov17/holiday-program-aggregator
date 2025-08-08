interface ActivityIconProps {
  type: 'arts' | 'sports' | 'dance' | 'science' | 'music' | 'outdoor' | 'cooking' | 'tech';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const icons = {
  arts: {
    icon: '🎨',
    bg: 'bg-yellow-100',
    color: 'text-yellow-600',
    label: 'Arts & Crafts'
  },
  sports: {
    icon: '⚽',
    bg: 'bg-blue-100', 
    color: 'text-blue-600',
    label: 'Sports'
  },
  dance: {
    icon: '💃',
    bg: 'bg-pink-100',
    color: 'text-pink-600',
    label: 'Dance'
  },
  science: {
    icon: '🔬',
    bg: 'bg-green-100',
    color: 'text-green-600',
    label: 'Science'
  },
  music: {
    icon: '🎵',
    bg: 'bg-purple-100',
    color: 'text-purple-600',
    label: 'Music'
  },
  outdoor: {
    icon: '🏕️',
    bg: 'bg-emerald-100',
    color: 'text-emerald-600',
    label: 'Outdoor'
  },
  cooking: {
    icon: '👨‍🍳',
    bg: 'bg-orange-100',
    color: 'text-orange-600',
    label: 'Cooking'
  },
  tech: {
    icon: '💻',
    bg: 'bg-indigo-100',
    color: 'text-indigo-600',
    label: 'Tech'
  }
};

export default function ActivityIcon({ type, size = 'md', className = '' }: ActivityIconProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const activity = icons[type];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${activity.bg} rounded-2xl flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer`}>
        <span className={activity.color}>{activity.icon}</span>
      </div>
      <span className="text-xs font-medium text-gray-700">{activity.label}</span>
    </div>
  );
}