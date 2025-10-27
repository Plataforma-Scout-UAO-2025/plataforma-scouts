package uao.edu.co.scouts_project.statistics.dto;

public class GroupMembersDTO {
    private Long groupId;
    private String groupName;
    private Long memberCount;

    public GroupMembersDTO() {
    }

    public GroupMembersDTO(Long groupId, String name, Long memberCount) {
        this.groupId = groupId;
        this.groupName = name;
        this.memberCount = memberCount;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Long getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Long memberCount) {
        this.memberCount = memberCount;
    }
}