import type { Member } from "./memberTypes";
export interface SchoolDataDto {
  school_data_id?: number;
  member_id?: number;
  tenant_id?: string;
  institution: string;
  course: string;
  calendar: string;
  shift: string;
}

export interface CreateMemberWithSchoolDto {
  member: Member;
  school: SchoolDataDto;
}

export interface CreateMemberWithSchoolResponse {
  member: Member;
  school: SchoolDataDto;
  message: string;
}
