import { apiClient } from "../client";
import type {
  CreateMemberRequest,
  CreateMemberResponse,
  CreateSchoolDataRequest,
} from "@/app/routes/grupos/basic-info/types/enrollment.type";

const ENROLLMENT_BASE_URL = "/members";

export const enrollmentService = {
  //Crea un nuevo miembro sin datos escolares

  async createMember(
    memberData: CreateMemberRequest
  ): Promise<CreateMemberResponse> {
    const res = await apiClient.post(
      `${ENROLLMENT_BASE_URL}/create_member`,
      memberData
    );
    return res.data;
  },

  //Crea un nuevo miembro junto con sus datos escolares

  async createMemberWithSchool(
    schoolData: CreateSchoolDataRequest
  ): Promise<void> {
    await apiClient.post(
      `${ENROLLMENT_BASE_URL}/create_member_with_school`,
      schoolData
    );
  },
};
