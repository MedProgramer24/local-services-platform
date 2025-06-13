// Analytics utility for tracking user interactions
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

class Analytics {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
  }

  // Track page views
  trackPageView(page: string, title?: string) {
    this.track({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      properties: {
        page_title: title || page,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track user interactions
  trackEvent(category: string, action: string, label?: string, value?: number) {
    this.track({
      event: 'user_interaction',
      category,
      action,
      label,
      value,
      properties: {
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    });
  }

  // Track service searches
  trackSearch(query: string, category?: string, city?: string) {
    this.track({
      event: 'search',
      category: 'search',
      action: 'service_search',
      label: query,
      properties: {
        search_query: query,
        search_category: category,
        search_city: city,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track service bookings
  trackBooking(serviceId: string, serviceName: string, price: number, providerId: string) {
    this.track({
      event: 'booking',
      category: 'conversion',
      action: 'service_booking',
      label: serviceName,
      value: price,
      properties: {
        service_id: serviceId,
        service_name: serviceName,
        provider_id: providerId,
        booking_amount: price,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track user registration
  trackRegistration(userType: 'customer' | 'provider', method: string) {
    this.track({
      event: 'registration',
      category: 'user',
      action: 'user_registration',
      label: userType,
      properties: {
        user_type: userType,
        registration_method: method,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track user login
  trackLogin(userType: 'customer' | 'provider', method: string) {
    this.track({
      event: 'login',
      category: 'user',
      action: 'user_login',
      label: userType,
      properties: {
        user_type: userType,
        login_method: method,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.track({
      event: 'error',
      category: 'error',
      action: 'application_error',
      label: error.message,
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        error_context: context,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    this.track({
      event: 'performance',
      category: 'performance',
      action: 'performance_metric',
      label: metric,
      value,
      properties: {
        metric_name: metric,
        metric_value: value,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Private method to send analytics data
  private track(event: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log('Analytics Event:', event);
      return;
    }

    // Send to your analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch(error => {
      console.error('Analytics tracking failed:', error);
    });

    // Google Analytics 4 (if configured)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties
      });
    }

    // Facebook Pixel (if configured)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', event.action, event.properties);
    }
  }

  // Initialize analytics
  init() {
    if (typeof window !== 'undefined') {
      // Track initial page view
      this.trackPageView(window.location.pathname, document.title);

      // Track performance metrics
      if ('performance' in window) {
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
            this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          }
        });
      }

      // Track errors
      window.addEventListener('error', (event) => {
        this.trackError(new Error(event.message), 'window_error');
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error(event.reason), 'unhandled_promise');
      });
    }
  }
}

export const analytics = new Analytics(); 