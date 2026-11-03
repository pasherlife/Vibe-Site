import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  asChild?: boolean;
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className
        )}
      >
        <img
          className="aspect-square h-full w-full object-cover"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, ...props }, ref) => {
    return <img className={cn('aspect-square h-full w-full object-cover', className)} ref={ref} {...props} />;
  }
);

AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
