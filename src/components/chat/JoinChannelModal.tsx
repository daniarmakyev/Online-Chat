import type { Channel } from "../../types";

interface Props {
	onClose: () => void;
	onJoin: (channelId: string) => void;
	allChannels: Channel[];
	userChannels: Channel[];
	currentUserId: string;
}

export default function JoinChannelModal({
	onClose,
	onJoin,
	allChannels,
	currentUserId,
}: Props) {
	const availableChannels = allChannels.filter(
		(channel) => !channel.members.includes(currentUserId),
	);

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
				<h2 className="text-2xl font-bold mb-4 text-gray-800">
					Вступить в канал
				</h2>

				<div className="flex-1 overflow-y-auto">
					{availableChannels.length === 0 ? (
						<p className="text-gray-500 text-center py-8">
							Нет доступных каналов для вступления
						</p>
					) : (
						<div className="space-y-2">
							{availableChannels.map((channel) => (
								<div
									key={channel.id}
									className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
								>
									<div>
										<h3 className="font-semibold text-gray-800">
											{channel.name}
										</h3>
										<p className="text-sm text-gray-500">
											{channel.members.length} участников
										</p>
									</div>
									<button
										type="button"
										onClick={() => onJoin(channel.id)}
										className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
									>
										Вступить
									</button>
								</div>
							))}
						</div>
					)}
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
