import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import type { UserData } from "../../types";

interface Props {
	channelId: string;
	members: string[];
	isCreator: boolean;
	currentUserId: string;
	onRemoveUser: (channelId: string, userId: string) => void;
}

export default function MembersList({
	channelId,
	members,
	isCreator,
	currentUserId,
	onRemoveUser,
}: Props) {
	const [usersData, setUsersData] = useState<UserData[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			const users = await Promise.all(
				members.map(async (memberId) => {
					const userDoc = await getDoc(doc(db, "users", memberId));
					return { id: memberId, ...userDoc.data() };
				}),
			);
			setUsersData(users);
		};

		fetchUsers();
	}, [members]);

	return (
		<div className="w-64 bg-white border-l border-gray-200 p-4 fixed right-0 h-screen">
			<h3 className="font-bold text-gray-800 mb-4">Участники</h3>
			<div className="space-y-2">
				{usersData.map((user) => (
					<div
						key={user.id}
						className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
					>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
								{user.nickname?.[0]?.toUpperCase() || "U"}
							</div>
							<span className="text-sm text-gray-800">
								{user.nickname || user.email}
							</span>
						</div>
						{isCreator && user.id !== currentUserId && (
							<button
								onClick={() => onRemoveUser(channelId, user.id)}
								className="text-red-600 hover:text-red-700 text-xs"
							>
								Удалить
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
