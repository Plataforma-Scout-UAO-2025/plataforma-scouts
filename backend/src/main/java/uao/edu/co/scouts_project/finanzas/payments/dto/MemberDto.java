package uao.edu.co.scouts_project.finanzas.payments.dto;

public class MemberDto {
    private Long member_id;
    private String member_name;
    private Integer age;
    private IdNameDto subgroup;
    private IdNameDto section;

    public static class IdNameDto {
        private Long id;
        private String name;
        public IdNameDto() {}
        public IdNameDto(Long id, String name) { this.id = id; this.name = name; }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public Long getMember_id() { return member_id; }
    public void setMember_id(Long member_id) { this.member_id = member_id; }
    public String getMember_name() { return member_name; }
    public void setMember_name(String member_name) { this.member_name = member_name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public IdNameDto getSubgroup() { return subgroup; }
    public void setSubgroup(IdNameDto subgroup) { this.subgroup = subgroup; }
    public IdNameDto getSection() { return section; }
    public void setSection(IdNameDto section) { this.section = section; }
}
