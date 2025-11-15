import { useState } from "react";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	updateProfile,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [nickname, setNickname] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (isSignUp) {
				const userCredential = await createUserWithEmailAndPassword(
					auth,
					email,
					password,
				);
				await updateProfile(userCredential.user, { displayName: nickname });
				await setDoc(doc(db, "users", userCredential.user.uid), {
					nickname,
					email,
					uid: userCredential.user.uid,
					createdAt: new Date(),
				});
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
		} catch (err) {
			if (err instanceof Error) setError(err.message);
			else setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
				<h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
					{isSignUp ? "Регистрация" : "Вход"}
				</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignUp && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Никнейм
							</label>
							<input
								type="text"
								value={nickname}
								onChange={(e) => setNickname(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required={isSignUp}
							/>
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Пароль
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
					</div>

					{error && (
						<div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
					>
						{loading
							? "Загрузка..."
							: isSignUp
							? "Зарегистрироваться"
							: "Войти"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<button
						onClick={() => setIsSignUp(!isSignUp)}
						className="text-blue-600 hover:text-blue-700 font-medium"
					>
						{isSignUp
							? "Уже есть аккаунт? Войти"
							: "Нет аккаунта? Зарегистрироваться"}
					</button>
				</div>
			</div>
		</div>
	);
}
