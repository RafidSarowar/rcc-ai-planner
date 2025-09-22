
import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative" role="alert">
      <div className="flex">
        <div className="py-1">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-4" />
        </div>
        <div>
          <strong className="font-bold">An error occurred.</strong>
          <span className="block sm:inline ml-1">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
