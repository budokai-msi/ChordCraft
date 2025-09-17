import React from "react";

interface ErrorBoundaryState {
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: undefined, errorInfo: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: "20px",
          backgroundColor: "#1f2937",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "14px",
          lineHeight: "1.5",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h2 style={{ color: "#ef4444", marginBottom: "20px" }}>
            🚨 Application Error
          </h2>
          <div style={{ 
            backgroundColor: "#374151", 
            padding: "20px", 
            borderRadius: "8px",
            maxWidth: "800px",
            width: "100%",
            overflow: "auto"
          }}>
            <h3 style={{ color: "#fbbf24", marginBottom: "10px" }}>Error:</h3>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              wordBreak: "break-word",
              marginBottom: "20px"
            }}>
              {String(this.state.error?.stack || this.state.error)}
            </pre>
            
            {this.state.errorInfo && (
              <>
                <h3 style={{ color: "#fbbf24", marginBottom: "10px" }}>Component Stack:</h3>
                <pre style={{ 
                  whiteSpace: "pre-wrap", 
                  wordBreak: "break-word",
                  fontSize: "12px",
                  opacity: 0.8
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
            
            <div style={{ 
              marginTop: "20px", 
              padding: "15px", 
              backgroundColor: "#1f2937", 
              borderRadius: "6px",
              border: "1px solid #374151"
            }}>
              <p style={{ margin: "0 0 10px 0", color: "#9ca3af" }}>
                This error was caught by the ErrorBoundary. Check the console for more details.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
