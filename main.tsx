import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./src/styles/index.css";
import { store } from "./src/app/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<App />
	</Provider>,
);
