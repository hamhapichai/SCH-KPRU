import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, dismissible = false, onDismiss, ...props }, ref) => {
    const variants = {
      info: {
        container: 'bg-meta-2 border-info text-info',
        icon: Info,
        iconColor: 'text-info',
      },
      success: {
        container: 'bg-success/10 border-success text-success',
        icon: CheckCircle,
        iconColor: 'text-success',
      },
      warning: {
        container: 'bg-warning/10 border-warning text-warning',
        icon: AlertCircle,
        iconColor: 'text-warning',
      },
      error: {
        container: 'bg-danger/10 border-danger text-danger',
        icon: XCircle,
        iconColor: 'text-danger',
      },
    };

    const config = variants[variant];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-sm border p-4',
          config.container,
          className
        )}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium mb-1">{title}</h3>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {dismissible && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className={cn(
                    'h-8 w-8 p-0',
                    variant === 'info' && 'text-blue-500 hover:bg-blue-100',
                    variant === 'success' && 'text-green-500 hover:bg-green-100',
                    variant === 'warning' && 'text-yellow-500 hover:bg-yellow-100',
                    variant === 'error' && 'text-red-500 hover:bg-red-100'
                  )}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;