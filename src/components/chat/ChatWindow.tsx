import { useState, useEffect, useRef } from "react";
import {
	collection,
	query,
	orderBy,
	onSnapshot,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import MembersList from "./MembersList";
import type { Channel, Message, AuthUser } from "../../types";

interface Props {
	channelId: string;
	currentUser: AuthUser;
	onRemoveUser: (channelId: string, userId: string) => void;
	onLeaveChannel: (channelId: string) => void;
	onDeleteChannel?: (channelId: string) => void;
	channels: Channel[];
}

export default function ChatWindow({
	channelId,
	currentUser,
	onRemoveUser,
	onLeaveChannel,
	onDeleteChannel,
	channels,
}: Props) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [showMembers, setShowMembers] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const channelInfo: Channel | null =
		channels.find((c) => c.id === channelId) ?? null;

	useEffect(() => {
		const q = query(
			collection(db, "channels", channelId, "messages"),
			orderBy("createdAt", "asc"),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const messagesData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as Omit<Message, "id">),
			}));
			setMessages(messagesData as Message[]);
		});

		return () => unsubscribe();
	}, [channelId]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !currentUser) return;

		await addDoc(collection(db, "channels", channelId, "messages"), {
			text: newMessage,
			userId: currentUser.uid,
			userName: currentUser.displayName || currentUser.email,
			createdAt: serverTimestamp(),
		});

		setNewMessage("");
	};

	const isCreator = channelInfo?.creatorId === currentUser?.uid;

	const handleLeaveChannel = () => {
		if (confirm("Вы уверены, что хотите покинуть этот канал?")) {
			onLeaveChannel(channelId);
		}
	};

	const handleDeleteChannel = () => {
		const memberCount = channelInfo?.members?.length || 0;
		const confirmMessage =
			memberCount > 1
				? `В канале ${memberCount} участников. Удалить канал навсегда?`
				: "Удалить этот канал навсегда?";

		if (confirm(confirmMessage)) {
			onDeleteChannel?.(channelId);
		}
	};

	return (
		<div className="h-screen flex flex-col">
			<div className="bg-white border-b border-gray-200 p-4 shrink-0 fixed w-full z-30">
				<div>
					<h2 className="text-xl font-bold text-gray-800 wrap-break-word">
						{channelInfo?.name}
					</h2>

					<p className="text-sm text-gray-500">
						{channelInfo?.members?.length || 0} участников
					</p>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setShowMembers(!showMembers)}
						className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium text-gray-700"
					>
						Участники
					</button>
					{isCreator ? (
						<button
							type="button"
							onClick={handleDeleteChannel}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
						>
							Удалить канал
						</button>
					) : (
						<button
							type="button"
							onClick={handleLeaveChannel}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
						>
							Выйти из канала
						</button>
					)}
				</div>
			</div>

			<div className="flex-1 flex mt-28">
				<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.userId === currentUser?.uid
									? "justify-end"
									: "justify-start"
							}`}
						>
							<div
								className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
									message.userId === currentUser?.uid
										? "bg-blue-600 text-white"
										: "bg-white text-gray-800"
								}`}
							>
								<p className="text-xs opacity-75 mb-1">{message.userName}</p>
								<p>{message.text}</p>
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				{showMembers && (
					<MembersList
						channelId={channelId}
						members={channelInfo?.members || []}
						isCreator={isCreator}
						currentUserId={currentUser?.uid || ""}
						onRemoveUser={onRemoveUser}
					/>
				)}
			</div>

			<form
				onSubmit={handleSendMessage}
				className={`bg-white border-t border-gray-200 p-4 shrink-0 ${
					showMembers && "me-64"
				}`}
			>
				<div className="flex gap-2">
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="Введите сообщение..."
						className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<button
						type="submit"
						className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
					>
						Отправить
					</button>
				</div>
			</form>
		</div>
	);
}
