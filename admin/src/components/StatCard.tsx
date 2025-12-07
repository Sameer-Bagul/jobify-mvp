import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
}

const colorClasses = {
  purple: {
    bg: 'bg-accent-purple/10',
    border: 'border-accent-purple/30',
    text: 'text-accent-purple',
    gradient: 'from-accent-purple/20 to-transparent',
  },
  blue: {
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue/30',
    text: 'text-accent-blue',
    gradient: 'from-accent-blue/20 to-transparent',
  },
  green: {
    bg: 'bg-accent-green/10',
    border: 'border-accent-green/30',
    text: 'text-accent-green',
    gradient: 'from-accent-green/20 to-transparent',
  },
  orange: {
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange/30',
    text: 'text-accent-orange',
    gradient: 'from-accent-orange/20 to-transparent',
  },
  pink: {
    bg: 'bg-accent-pink/10',
    border: 'border-accent-pink/30',
    text: 'text-accent-pink',
    gradient: 'from-accent-pink/20 to-transparent',
  },
};

export default function StatCard({ icon: Icon, title, value, trend, color }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colors.border} bg-dark-800/50 backdrop-blur-sm p-6`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} pointer-events-none`} />
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-lg ${colors.bg} mb-4`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${colors.text}`}>{trend}</p>
        )}
      </div>
    </div>
  );
}
