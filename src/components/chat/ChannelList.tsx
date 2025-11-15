import type { Channel } from "../../types";

interface Props {
	channels: Channel[];
	selectedChannel: string | null;
	onSelectChannel: (id: string) => void;
	onLeaveChannel?: (channelId: string) => void;
	onDeleteChannel?: (channelId: string) => void;
	currentUserId: string;
	loading?: boolean;
}

export default function ChannelList({
	channels,
	selectedChannel,
	onSelectChannel,
	onLeaveChannel,
	currentUserId,
	loading = false,
}: Props) {
	const handleLeaveClick = (
		e: React.MouseEvent,
		channelId: string,
		isCreator: boolean,
	) => {
		e.stopPropagation();

		if (isCreator) {
			alert("Вы создатель канала. Используйте кнопку 'Удалить канал' в чате.");
			return;
		}

		if (confirm("Вы уверены, что хотите покинуть этот канал?")) {
			onLeaveChannel?.(channelId);
		}
	};

	return (
		<div className="flex-1 overflow-y-auto">
			{loading ? (
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
						<p className="mt-3 text-sm text-gray-600">Загрузка каналов...</p>
					</div>
				</div>
			) : channels.length === 0 ? (
				<div className="p-4 text-center text-gray-500 text-sm">
					Нет доступных каналов
				</div>
			) : (
				<div className="p-2">
					{channels.map((channel) => {
						const isCreator = channel.creatorId === currentUserId;

						return (
							<div
								key={channel.id}
								className={`p-3 rounded-lg mb-2 transition group flex flex-nowrap items-center gap-2 ${
									selectedChannel === channel.id
										? "bg-blue-100 border-l-4 border-blue-600"
										: "hover:bg-gray-100 cursor-pointer"
								}`}
							>
								<button
									type="button"
									onClick={() => onSelectChannel(channel.id)}
									className="w-full text-left"
								>
									<div className="flex items-center justify-between">
										<div className="flex-1 pr-2 truncate max-w-[200px]">
											<h3 className="font-semibold text-gray-800 truncate">
												{channel.name}
											</h3>
											<p className="text-xs text-gray-500 mt-1">
												{channel.members.length} участников
											</p>
										</div>
										<div className="flex items-center gap-2">
											{isCreator && (
												<span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
													Владелец
												</span>
											)}
										</div>
									</div>
								</button>

								{!isCreator && onLeaveChannel && (
									<button
										type="button"
										onClick={(e) => handleLeaveClick(e, channel.id, isCreator)}
										className="group-hover:opacity-100 transition-opacity bg-orange-500 text-white text-xs px-2 py-1 rounded hover:bg-orange-600"
										title="Выйти из канала"
									>
										Выйти
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
