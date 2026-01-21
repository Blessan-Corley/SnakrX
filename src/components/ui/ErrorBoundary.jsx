import { Component } from 'react';
import logger from '@/utils/logger.js';
import DefaultErrorView from './errorBoundary/DefaultErrorView.jsx';
import { getErrorMessage } from './errorBoundary/errorMessages.jsx';
import {
  buildReportMailtoUrl,
  createErrorId,
  createInitialErrorState,
  detectErrorType,
  shouldForceReloadOnRetry
} from './errorBoundary/errorUtils.js';
import {
  ErrorFallback,
  GameError,
  NetworkError,
  NotFoundError
} from './errorBoundary/fallbackComponents.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = createInitialErrorState();
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: createErrorId(),
      errorType: detectErrorType(error)
    };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error boundary caught an application error.', {
      error,
      errorInfo,
      stack: error?.stack || null
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    const shouldReload = shouldForceReloadOnRetry(this.state.errorType);
    this.setState(createInitialErrorState(), () => {
      if (shouldReload) {
        window.location.reload();
      }
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const mailtoUrl = buildReportMailtoUrl({
      error: this.state.error,
      errorId: this.state.errorId,
      errorType: this.state.errorType
    });
    window.location.href = mailtoUrl;
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallback: FallbackComponent } = this.props;
    if (FallbackComponent) {
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onReportBug={this.handleReportBug}
        />
      );
    }

    return (
      <DefaultErrorView
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        errorMessage={getErrorMessage(this.state.errorType)}
        errorType={this.state.errorType}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
        onReportBug={this.handleReportBug}
      />
    );
  }
}

export { ErrorFallback, GameError, NetworkError, NotFoundError };
export default ErrorBoundary;
