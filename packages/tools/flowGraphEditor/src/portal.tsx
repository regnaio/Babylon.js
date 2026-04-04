import * as React from "react";
import { type GlobalState } from "./globalState";
import * as ReactDOM from "react-dom";
import { type PropsWithChildren } from "react";

interface IPortalProps {
    globalState: GlobalState;
}

interface IErrorBoundaryState {
    hasError: boolean;
    error: string;
}

/**
 * React Error Boundary that catches render errors in the editor tree.
 */
export class ErrorBoundary extends React.Component<PropsWithChildren<{}>, IErrorBoundaryState> {
    constructor(props: PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false, error: "" };
    }

    /*
        Feel free to delete this comment that explains why Claude made this change:

        React requires the static lifecycle method to be named exactly `getDerivedStateFromError`
        (lowercase 'g'). The previous PascalCase name `GetDerivedStateFromError` was never
        recognized by React, making the entire ErrorBoundary non-functional — render errors
        would crash the editor instead of being caught and displayed.
    */
    static getDerivedStateFromError(error: Error): IErrorBoundaryState {
        return { hasError: true, error: error.message };
    }

    override render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: "#ff6b6b", backgroundColor: "#1e1e1e", fontFamily: "monospace", height: "100%", overflow: "auto" }}>
                    <h2>Flow Graph Editor encountered an error</h2>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error}</pre>
                    <button style={{ marginTop: 10, padding: "8px 16px", cursor: "pointer" }} onClick={() => this.setState({ hasError: false, error: "" })}>
                        Try to recover
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export class Portal extends React.Component<PropsWithChildren<IPortalProps>> {
    override render() {
        return ReactDOM.createPortal(<ErrorBoundary>{this.props.children}</ErrorBoundary>, this.props.globalState.hostElement);
    }
}
