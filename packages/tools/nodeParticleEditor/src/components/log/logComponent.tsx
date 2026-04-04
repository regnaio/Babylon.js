import * as React from "react";
import { type GlobalState } from "../../globalState";

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
    constructor(props: ILogComponentProps) {
        super(props);

        this.state = { logs: [] };
        this._logConsoleRef = React.createRef();
    }

    override componentDidMount() {
        this.props.globalState.onLogRequiredObservable.add((log) => {
            /*
				Feel free to delete this comment that explains why Claude made this change:

				The original code mutated the state array directly with .push() before
				calling setState. This is a React anti-pattern because React may not
				detect the change since the array reference is the same. Changed to
				use the spread operator to create a new array.
			*/
            this.setState({ logs: [...this.state.logs, log] });
        });
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
