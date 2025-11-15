import { useState, useEffect } from "react";
import {
	collection,
	onSnapshot,
	addDoc,
	serverTimestamp,
	doc,
	updateDoc,
	arrayRemove,
	arrayUnion,
	query,
	where,
	deleteDoc,
	getDocs,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import ChannelList from "../components/chat/ChannelList";
import ChatWindow from "../components/chat/ChatWindow";
import CreateChannelModal from "../components/chat/CreateChannelModal";
import UserSearchModal from "../components/chat/UserSearchModal";
import JoinChannelModal from "../components/chat/JoinChannelModal";
import type { Channel } from "../types";

export default function ChatPage() {
	const [channels, setChannels] = useState<Channel[]>([]);
	const [allChannels, setAllChannels] = useState<Channel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUserSearch, setShowUserSearch] = useState(false);
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [channelsLoading, setChannelsLoading] = useState(true);

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!user) return;

		const q = query(
			collection(db, "channels"),
			where("members", "array-contains", user.uid),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const channelData = snapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as Channel),
			);
			setChannels(channelData);
			setChannelsLoading(false);

			if (
				selectedChannel &&
				!channelData.find((ch) => ch.id === selectedChannel)
			) {
				setSelectedChannel(null);
			}
		});

		return () => unsubscribe();
	}, [user, selectedChannel]);

	useEffect(() => {
		if (!user) return;

		const unsubscribe = onSnapshot(collection(db, "channels"), (snapshot) => {
			const channelData = snapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as Channel),
			);
			setAllChannels(channelData);
		});

		return () => unsubscribe();
	}, [user]);

	const handleCreateChannel = async (channelName: string) => {
		if (!user) return;

		await addDoc(collection(db, "channels"), {
			name: channelName,
			creatorId: user.uid,
			members: [user.uid],
			createdAt: serverTimestamp(),
		});
		setShowCreateModal(false);
	};

	const handleJoinChannel = async (channelId: string) => {
		if (!user) return;

		const channelRef = doc(db, "channels", channelId);
		await updateDoc(channelRef, {
			members: arrayUnion(user.uid),
		});
		setShowJoinModal(false);
	};

	const handleLogout = async () => {
		await signOut(auth);
	};

	const handleRemoveUser = async (channelId: string, userId: string) => {
		const channelRef = doc(db, "channels", channelId);
		await updateDoc(channelRef, {
			members: arrayRemove(userId),
		});

		if (userId === user?.uid) {
			setSelectedChannel(null);
		}
	};

	const handleLeaveChannel = async (channelId: string) => {
		if (!user) return;

		const channelRef = doc(db, "channels", channelId);
		await updateDoc(channelRef, {
			members: arrayRemove(user.uid),
		});

		setSelectedChannel(null);
	};

	const handleDeleteChannel = async (channelId: string) => {
		if (!user) return;

		try {
			const channel = channels.find((ch) => ch.id === channelId);
			if (channel?.creatorId !== user.uid) {
				alert("Только создатель может удалить канал");
				return;
			}

			const messagesRef = collection(db, "channels", channelId, "messages");
			const messagesSnapshot = await getDocs(messagesRef);

			const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
				deleteDoc(messageDoc.ref),
			);
			await Promise.all(deletePromises);

			await deleteDoc(doc(db, "channels", channelId));

			setSelectedChannel(null);
		} catch (error) {
			console.error("Error deleting channel:", error);
			alert("Ошибка при удалении канала");
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-100">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
					<p className="mt-4 text-gray-600">Загрузка...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-100">
			<div className="w-80 bg-white border-r border-gray-200 flex flex-col fixed h-screen">
				<div className="p-4 border-b border-gray-200 shrink-0">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold text-gray-800">Чаты</h2>
						<button
							type="button"
							onClick={handleLogout}
							className="text-sm text-red-600 hover:text-red-700"
						>
							Выйти
						</button>
					</div>
					<div className="grid grid-cols-2 gap-2 mb-2">
						<button
							type="button"
							onClick={() => setShowCreateModal(true)}
							className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
						>
							+ Канал
						</button>
						<button
							type="button"
							onClick={() => setShowJoinModal(true)}
							className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
						>
							Вступить
						</button>
					</div>
					<button
						type="button"
						onClick={() => setShowUserSearch(true)}
						className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
					>
						Поиск юзеров
					</button>
				</div>

				<ChannelList
					channels={channels}
					selectedChannel={selectedChannel}
					onSelectChannel={setSelectedChannel}
					onLeaveChannel={handleLeaveChannel}
					onDeleteChannel={handleDeleteChannel}
					currentUserId={user?.uid || ""}
					loading={channelsLoading}
				/>
			</div>

			<div className="flex-1 ml-80">
				{selectedChannel ? (
					<ChatWindow
						channelId={selectedChannel}
						currentUser={user}
						onRemoveUser={handleRemoveUser}
						onLeaveChannel={handleLeaveChannel}
						onDeleteChannel={handleDeleteChannel}
						channels={channels}
					/>
				) : (
					<div className="h-screen flex items-center justify-center">
						<div className="text-center">
							<svg
								className="w-24 h-24 mx-auto mb-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							<p className="text-xl">Выберите канал для начала общения</p>
						</div>
					</div>
				)}
			</div>

			{showCreateModal && (
				<CreateChannelModal
					onClose={() => setShowCreateModal(false)}
					onCreate={handleCreateChannel}
				/>
			)}

			{showJoinModal && (
				<JoinChannelModal
					onClose={() => setShowJoinModal(false)}
					onJoin={handleJoinChannel}
					allChannels={allChannels}
					userChannels={channels}
					currentUserId={user?.uid || ""}
				/>
			)}

			{showUserSearch && (
				<UserSearchModal
					onClose={() => setShowUserSearch(false)}
					currentUserId={user?.uid || ""}
				/>
			)}
		</div>
	);
}
