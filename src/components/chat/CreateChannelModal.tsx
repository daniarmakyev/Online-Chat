import { useState } from "react";

interface Props {
	onClose: () => void;
	onCreate: (name: string) => void;
}

export default function CreateChannelModal({ onClose, onCreate }: Props) {
	const [channelName, setChannelName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (channelName.trim()) {
			onCreate(channelName);
			setChannelName("");
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-6 w-full max-w-md">
				<h2 className="text-2xl font-bold mb-4 text-gray-800">Создать канал</h2>
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						value={channelName}
						onChange={(e) => setChannelName(e.target.value)}
						placeholder="Название канала"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
						autoFocus
					/>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
						>
							Отмена
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
						>
							Создать
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
