package uao.edu.co.scouts_project.finanzas.payments.dto;

public class SectionPaymentDto {
    private Long id;
    private String name;

    public SectionPaymentDto() {}
    public SectionPaymentDto(Long id, String name) { this.id = id; this.name = name; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
