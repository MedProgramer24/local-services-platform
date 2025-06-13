import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

// Form Container
export const FormContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg', className)}>
    {children}
  </div>
);

// Form Title
export const FormTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h1 className={cn('text-2xl font-bold text-center mb-6 text-gray-900', className)}>
    {children}
  </h1>
);

// Form Description
export const FormDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-sm text-gray-600 text-center mb-6', className)}>
    {children}
  </p>
);

// Form Field
export const FormField = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

// Form Label
export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn('block text-sm font-medium text-gray-700 mb-2 text-right', className)}
    {...props}
  />
));
FormLabel.displayName = 'FormLabel';

// Form Input
export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <Input
    ref={ref}
    type={type}
    className={cn(
      'w-full px-4 py-3 text-right border border-gray-300 rounded-lg',
      'focus:ring-2 focus:ring-primary focus:border-transparent outline-none',
      'text-gray-900 placeholder-gray-500',
      className
    )}
    {...props}
  />
));
FormInput.displayName = 'FormInput';

// Password Input with Show/Hide Toggle
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <FormInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-12', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

// Form Select
type FormSelectProps = {
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export const FormSelect = ({
  options,
  placeholder,
  value,
  onChange,
  className,
}: FormSelectProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={cn('w-full text-right', className)}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
FormSelect.displayName = 'FormSelect';

// Form Checkbox
type FormCheckboxProps = {
  id: string;
  label: string;
  className?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  value?: boolean;
  checked?: boolean;
  ref?: React.Ref<HTMLInputElement>;
};

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ id, label, className, name, onChange, onBlur, value, checked, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-reverse space-x-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={id}
            name={name}
            ref={ref}
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500",
              className
            )}
            onChange={onChange}
            onBlur={onBlur}
            checked={checked ?? value}
            {...props}
          />
        </div>
        <Label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
          {label}
        </Label>
      </div>
    );
  }
);
FormCheckbox.displayName = 'FormCheckbox';

// Form Button
export const FormButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }
>(({ children, isLoading, className, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="submit"
      disabled={disabled || isLoading}
      className={cn(
        'flex w-full justify-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          جاري التحميل...
        </div>
      ) : (
        children
      )}
    </button>
  );
});
FormButton.displayName = 'FormButton';

// Form Link
export const FormLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a
    href={href}
    className={cn(
      'text-sm text-primary hover:text-primary/80 transition-colors',
      className
    )}
  >
    {children}
  </a>
);

// Form Error Message
export const FormError = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-sm text-red-600 mt-1 text-right', className)}>
    {children}
  </p>
);

// Form Success Message
export const FormSuccess = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-sm text-green-600 mt-1 text-right', className)}>
    {children}
  </p>
);

// Form Textarea
export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ error, className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm sm:leading-6 rtl',
        error && 'border-red-500',
        className
      )}
      {...props}
    />
  );
});
FormTextarea.displayName = 'FormTextarea'; 