import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";

import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
	{
		id: "root",
		element: <Layout />,
	},
	{
		path: "*",
		element: <NotFoundPage />,
	},
]);
