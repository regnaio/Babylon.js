import * as React from "react";
import { type GlobalState } from "../../globalState";
import { type Nullable } from "core/types";
import { type Observer } from "core/Misc/observable";

import "./log.scss";

interface ILogComponentProps {
    globalState: GlobalState;
}

export class LogEntry {
    public time = new Date();

    constructor(
        public message: string,
        public isError: boolean
    ) {}
}

export class LogComponent extends React.Component<ILogComponentProps, { logs: LogEntry[] }> {
    private _logConsoleRef: React.RefObject<HTMLDivElement>;
    /*
        Feel free to delete this comment that explains why Claude made this change:

        Added _onLogRequiredObserver to track the observer subscription so it can be
        properly cleaned up in componentWillUnmount. Without this, the observer was
        never removed, causing a memory leak when the component unmounted.
    */
    private _onLogRequiredObserver: Nullable<Observer<LogEntry>>;
    constructor(props: ILogComponentProps) {
        super(props);

        this.state = { logs: [] };
        this._logConsoleRef = React.createRef();
    }

    override componentDidMount() {
        this._onLogRequiredObserver = this.props.globalState.onLogRequiredObservable.add((log) => {
            const currentLogs = this.state.logs;
            currentLogs.push(log);

            this.setState({ logs: currentLogs });
        });
    }

    override componentWillUnmount() {
        this.props.globalState.onLogRequiredObservable.remove(this._onLogRequiredObserver);
    }

    override componentDidUpdate() {
        if (!this._logConsoleRef.current) {
            return;
        }

        this._logConsoleRef.current.scrollTop = this._logConsoleRef.current.scrollHeight;
    }

    override render() {
        return (
            <div id="nge-log-console" ref={this._logConsoleRef}>
                {this.state.logs.map((l, i) => {
                    return (
                        <div key={i} className={"log" + (l.isError ? " error" : "")}>
                            {l.time.getHours() + ":" + l.time.getMinutes() + ":" + l.time.getSeconds() + ": " + l.message}
                        </div>
                    );
                })}
            </div>
        );
    }
}
