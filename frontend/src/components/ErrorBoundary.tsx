import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ</h1>
          <p className="text-gray-600 mb-6">
            حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              تفاصيل الخطأ (للمطورين)
            </summary>
            <div className="bg-gray-100 p-4 rounded text-xs font-mono text-gray-800 overflow-auto">
              <div className="mb-2">
                <strong>الخطأ:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="whitespace-pre-wrap mt-2">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={resetError}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            الصفحة الرئيسية
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم
          </p>
          <a
            href="mailto:support@souk-al-khadamat.ma"
            className="text-moroccan-orange hover:text-orange-600 text-sm font-medium"
          >
            support@souk-al-khadamat.ma
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary; 