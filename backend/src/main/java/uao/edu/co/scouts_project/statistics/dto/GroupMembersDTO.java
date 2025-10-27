package uao.edu.co.scouts_project.statistics.dto;

public class GroupMembersDTO {
    private String groupId;
    private String groupName;
    private Long memberCount;

    public GroupMembersDTO(String groupId, String groupName, Long memberCount) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.memberCount = memberCount;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
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