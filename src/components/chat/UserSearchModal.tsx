import { useState } from "react";
import {
	collection,
	getDocs,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { AppUser } from "../../types";

interface Props {
	onClose: () => void;
	currentUserId: string;
}

export default function UserSearchModal({ onClose, currentUserId }: Props) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<AppUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			setError("Введите никнейм или email для поиска");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const snapshot = await getDocs(collection(db, "users"));

			if (snapshot.empty) {
				setError("В базе нет пользователей");
				setLoading(false);
				return;
			}

			const allUsers = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as AppUser[];

			const searchLower = searchQuery.toLowerCase();
			const filtered = allUsers.filter(
				(user) =>
					user.id !== currentUserId &&
					(user.nickname?.toLowerCase().includes(searchLower) ||
						user.email?.toLowerCase().includes(searchLower)),
			);

			setSearchResults(filtered);

			if (filtered.length === 0) {
				setError(`По запросу "${searchQuery}" пользователи не найдены`);
			}
		} catch (err: unknown) {
			console.error("Search error:", err);
			setError(
				`Ошибка поиска: ${
					err instanceof Error ? err.message : "Попробуйте еще раз"
				}`,
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateDirectChannel = async (otherUser: AppUser) => {
		try {
			await addDoc(collection(db, "channels"), {
				name: `Чат с ${otherUser.nickname}`,
				creatorId: currentUserId,
				members: [currentUserId, otherUser.id],
				createdAt: serverTimestamp(),
			});
			onClose();
		} catch (error) {
			console.error("Error creating channel:", error);
			setError("Ошибка создания чата");
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 w-full max-w-md">
				<h2 className="text-2xl font-bold mb-4 text-gray-800">
					Поиск пользователей
				</h2>

				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setError("");
						}}
						onKeyPress={(e) => e.key === "Enter" && handleSearch()}
						placeholder="Введите никнейм..."
						className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
						autoFocus
					/>
					<button
						type="button"
						onClick={handleSearch}
						disabled={loading}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
					>
						{loading ? "..." : "Найти"}
					</button>
				</div>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}

				<div className="max-h-64 overflow-y-auto">
					{searchResults.length === 0 && !loading && !error && (
						<p className="text-gray-500 text-center py-4">
							Введите никнейм для поиска
						</p>
					)}

					{searchResults.map((user) => (
						<div
							key={user.id}
							className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg mb-2 border border-gray-100"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
									{user.nickname?.[0]?.toUpperCase() || "U"}
								</div>
								<div>
									<p className="font-semibold text-gray-800">{user.nickname}</p>
									<p className="text-sm text-gray-500">{user.email}</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleCreateDirectChannel(user)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
							>
								Создать чат
							</button>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={onClose}
					className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
				>
					Закрыть
				</button>
			</div>
		</div>
	);
}
