import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ActiveUser } from '@/types/types';

interface PresenceIndicatorProps {
  activeUsers: ActiveUser[];
  currentUserId: string;
}

const CURSOR_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export function PresenceIndicator({ activeUsers, currentUserId }: PresenceIndicatorProps) {
  const otherUsers = activeUsers.filter((u) => u.user_id !== currentUserId);

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Active:</span>
        <div className="flex -space-x-2">
          {otherUsers.slice(0, 5).map((user, index) => {
            const color = user.cursor_color || CURSOR_COLORS[index % CURSOR_COLORS.length];
            return (
              <Tooltip key={user.id}>
                <TooltipTrigger>
                  <Avatar
                    className="h-8 w-8 border-2 border-background"
                    style={{ borderColor: color }}
                  >
                    <AvatarFallback
                      className="text-xs text-white"
                      style={{ backgroundColor: color }}
                    >
                      {user.user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.user?.username || user.user?.email}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {otherUsers.length > 5 && (
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs bg-muted">
                +{otherUsers.length - 5}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
