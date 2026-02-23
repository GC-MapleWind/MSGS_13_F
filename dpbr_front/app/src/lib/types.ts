export interface Character {
	id: string;
	name: string;
	nickname: string;
	avatarUrl: string;
	level: number;
	job: string;
	club: string;
	server: string;
}

export interface SettlementItem {
	id: string;
	characterId: string;
	title: string;
	description: string;
	imageUrl: string;
	acquiredAt: string;
}

export interface TalkComment {
	id: string;
	author: string;
	authorAvatar: string;
	content: string;
	createdAt: string;
	userId: number | null;
	isMine: boolean;
}

export interface User {
	name: string;
	studentId: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	isLoading: boolean;
	registerToken?: string | null;
}

export type GenderType = 'MALE' | 'FEMALE';
export type AcademicStatusType =
	| 'UNDERGRAD'
	| 'GRADUATE'
	| 'LEAVE_GENERAL'
	| 'LEAVE_MILITARY'
	| 'ALUMNI'
	| 'STAFF';
export type OpeningPartyIntent = 'ATTEND' | 'ABSENT' | 'FLEXIBLE';
export type InterviewDateOption = 'SAT_0913' | 'SUN_0914' | 'OTHER';
export type MilitaryMemberOption = 'APPLY' | 'NOT_APPLY' | 'NOT_APPLICABLE';

export interface ApplicationBasePayload {
	term: string;
	name: string;
	student_id: string;
	department: string;
	phone_number: string;
	gender: GenderType;
	academic_status: AcademicStatusType;
	nickname: string;
	job: string;
	world: string;
	level: number;
	union_level: number;
	rule_agreed: boolean;
	opening_party_intent: OpeningPartyIntent;
}

export interface NewApplicationPayload extends ApplicationBasePayload {
	interview_date_option: InterviewDateOption;
	student_card_confirmed: boolean;
	privacy_agreed: boolean;
}

export interface RenewApplicationPayload extends ApplicationBasePayload {
	military_member_option: MilitaryMemberOption;
	free_chat_participation: boolean;
	alliance_chat_participation: boolean;
	fee_notice_ack: boolean;
	reason_for_reregistration: string;
	desired_event_style?: string;
	suggestions: string;
}

export interface ApplicationSummary {
	id: number;
	application_type: 'NEW' | 'RENEW';
	status: 'DRAFT' | 'SUBMITTED';
	term: string;
	nickname: string;
	job: string;
	world: string;
	level: number;
	union_level: number;
	submitted_at: string;
}
