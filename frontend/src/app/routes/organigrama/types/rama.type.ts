// Barrel file: re-export modular types and provide backward-compatible aliases
export * from './frontend';
export * from './backend';
export * from './operations';

// Backwards-compatible aliases (legacy Spanish names) kept for a smooth migration
import type * as F from './frontend';
import type * as B from './backend';

export type Branch = F.Branch;
export type Subgroup = F.Subgroup;

export type Rama = Branch;
export type Subrama = Subgroup;

export type CreateBranchData = F.CreateBranchData;
export type UpdateBranchData = F.UpdateBranchData;
export type CreateSubgroupData = F.CreateSubgroupData;
export type UpdateSubgroupData = F.UpdateSubgroupData;

export type CreateRamaData = CreateBranchData;
export type UpdateRamaData = UpdateBranchData;
export type CreateSubramaData = CreateSubgroupData;
export type UpdateSubramaData = UpdateSubgroupData;

export type CreateBranchBackendData = B.CreateBranchBackendData;
export type UpdateBranchBackendData = B.UpdateBranchBackendData;
export type CreateSubgroupBackendData = B.CreateSubgroupBackendData;
export type UpdateSubgroupBackendData = B.UpdateSubgroupBackendData;

export type CreateRamaBackendData = CreateBranchBackendData;
export type UpdateRamaBackendData = UpdateBranchBackendData;
export type CreateSubramaBackendData = CreateSubgroupBackendData;
export type UpdateSubramaBackendData = UpdateSubgroupBackendData;

export type BackendRama = B.BackendBranch;
export type BackendSubrama = B.BackendSubgroup;

export type BackendBranch = B.BackendBranch;
export type BackendSubgroup = B.BackendSubgroup;
