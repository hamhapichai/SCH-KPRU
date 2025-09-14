import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, Button } from '@/components/ui';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'success';
  isLoading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'warning',
  isLoading = false,
}) => {
  const variants = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      confirmButtonVariant: 'primary' as const,
    },
    danger: {
      icon: XCircle,
      iconColor: 'text-danger',
      confirmButtonVariant: 'danger' as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-success',
      confirmButtonVariant: 'primary' as const,
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      showCloseButton={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <Icon className={cn('h-6 w-6', config.iconColor)} />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={config.confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;