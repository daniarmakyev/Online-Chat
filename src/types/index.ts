import type { Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

export interface Channel {
	id: string;
	name: string;
	creatorId: string;
	members: string[];
	createdAt?: Timestamp | null;
}

export interface Message {
	id: string;
	text: string;
	userId: string;
	userName?: string;
	createdAt?: Timestamp | null;
}

export interface AppUser {
	id: string;
	nickname?: string;
	email?: string;
}

export interface UserData {
	id: string;
	nickname?: string;
	email?: string;
}

export type AuthUser = User | null;
