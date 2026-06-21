import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="h-full w-full flex flex-col items-center justify-center text-white gap-4 p-8">
          <p className="text-red-400 font-semibold">Something went wrong.</p>
          <p className="text-gray-500 text-sm text-center max-w-sm">{String(this.state.error)}</p>
          <button
            className="mt-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
