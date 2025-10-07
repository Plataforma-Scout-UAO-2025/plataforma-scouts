package uao.edu.co.scouts_project.finanzas.payments.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import uao.edu.co.scouts_project.finanzas.payments.dto.AppendPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.InstallmentPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.PaymentRecordDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.SectionPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.SubgroupPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.repository.IPaymentsReadRepository;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptRow;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.MemberWithGroupsRow;

@Service
public class PaymentsService {

    private final IPaymentsReadRepository readRepo;

    public PaymentsService(IPaymentsReadRepository readRepo) {
        this.readRepo = readRepo;
    }

    public List<PaymentRecordDto> listMembersWithInstallments(String tenantId) {
        return readRepo.findScoutMembersWithInstallments(tenantId)
                .stream().map(this::toPaymentRecordDto).toList();
    }

    public List<InstallmentPaymentDto> listInstallmentsByMember(String tenantId, Long memberId) {
        return readRepo.findInstallmentsByMember(tenantId, memberId)
                .stream().map(this::toInstallmentPaymentDto).toList();
    }

    private PaymentRecordDto toPaymentRecordDto(MemberWithGroupsRow row) {
        var dto = new PaymentRecordDto();
        dto.setMember_id(row.getMember_id());
        dto.setFirst_name(row.getFirst_name());
        dto.setLast_name(row.getLast_name());
        dto.setAge(row.getAge());
        dto.setSubgroup(new SubgroupPaymentDto(row.getSubgroup_id(), row.getSubgroup_name()));
        dto.setSection(new SectionPaymentDto(row.getSection_id(), row.getSection_name()));
        // La lista 'installment' se deja vacía en este endpoint.
        return dto;
    }

    private InstallmentPaymentDto toInstallmentPaymentDto(InstallmentWithConceptRow row) {
        var dto = new InstallmentPaymentDto();
        dto.setInstallment_id(row.getInstallment_id());
        dto.setDue_date(row.getDue_date()); 
        dto.setAmount(row.getAmount());
        dto.setStatus(row.getStatus());
        dto.setName(row.getConcept_name());
        dto.setDescription(row.getConcept_desc());

        dto.setPayment_id(row.getPayment_id());
        dto.setPaid_at(row.getPaid_at());
        dto.setMethod(row.getMethod());
        dto.setReference(row.getReference());
        dto.setPayer_member_id(row.getPayer_member_id());
        return dto;
    }

    public void appendPayment(String tenantId, Long installmentId, AppendPaymentDto dto) {
        // Validación simple opcional: si mandan installment_id en body, que coincida
        if (dto.getInstallment_id() != null && !dto.getInstallment_id().equals(installmentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "installment_id mismatch");
        }
        int updated = readRepo.appendPayment(
                tenantId,
                installmentId,
                dto.getPayment_id(),
                dto.getAmount(),
                dto.getPaid_at(),
                dto.getMethod(),
                dto.getReference(),
                dto.getPayer_member_id()
        );

        if (updated == 0) {
            // Puede ser: no existe el installment en el tenant o payment_id duplicado
            // Si quieres distinguir duplicado vs. no encontrado, hacemos consultas separadas.
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Installment not found or payment_id already exists");
        }
    }


}
