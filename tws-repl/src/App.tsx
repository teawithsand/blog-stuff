import { useEffect } from "react";
import { startCatpure, stopCapture } from "./repl/console";
import { Repl, ReplEvaluation } from "./repl/repl"

const initLogs: ReplEvaluation[] = []
startCatpure(
	(evaluation) => {
		initLogs.push(evaluation)
	}
);

export const App = () => {
	useEffect(() => {
		// here is a gap, which we do not capture, but it's fine and 
		// simpler than doing global state management like redux
		stopCapture()
	}, [])
	return (
		<Repl initialEntries={initLogs} captureLogs={true} />
	)
}