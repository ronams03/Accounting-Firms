import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  gradient?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-white',
  gradient = 'from-blue-500 to-indigo-600',
  trend,
  onClick
}: MetricCardProps) {
  return (
    <Card 
      className={`overflow-hidden hover:shadow-xl transition-all hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
                trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
