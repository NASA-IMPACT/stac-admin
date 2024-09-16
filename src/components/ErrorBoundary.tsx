import React, { Component } from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch() {
    window.location.href = "/sorry"; 
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
