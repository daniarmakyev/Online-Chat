import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import LoginPage from "./src/pages/LoginPage";
import ChatPage from "./src/pages/ChatPage";
import { auth } from "./src/config/firebase";
import type { AuthUser } from "./src/types";

export default function App() {
	const [user, setUser] = useState<AuthUser>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Загрузка...</p>
				</div>
			</div>
		);
	}

	return user ? <ChatPage /> : <LoginPage />;
}
