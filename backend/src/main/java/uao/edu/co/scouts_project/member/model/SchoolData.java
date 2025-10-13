package uao.edu.co.scouts_project.member.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SchoolData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "school_data_id")
    private Long schoolDataId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    private String institution;
    private String course;
    private String calendar;
    private String shift;

}