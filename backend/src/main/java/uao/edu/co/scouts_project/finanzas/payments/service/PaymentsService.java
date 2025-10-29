package uao.edu.co.scouts_project.finanzas.payments.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.EntityNotFoundException;
import uao.edu.co.scouts_project.finanzas.payments.dto.AppendPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.CuotasEstadoDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.EstadoCuentaDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.InstallmentPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.MemberDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.PaymentRecordDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.SectionPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.dto.SubgroupPaymentDto;
import uao.edu.co.scouts_project.finanzas.payments.repository.IPaymentsReadRepository;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptAndMemberRow;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptRow;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.MemberWithGroupsRow;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;

@Service
public class PaymentsService {

    private final IPaymentsReadRepository readRepo;
    
    private final IMemberRepository memberRepo;


    public PaymentsService(IPaymentsReadRepository readRepo, IMemberRepository memberRepo) {
        this.readRepo = readRepo;
        this.memberRepo = memberRepo;
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

// PaymentsService.java
public void appendPayment(String tenantId, Long installmentId, AppendPaymentDto dto) {
    // 1) validación de path vs body
    if (dto.getInstallment_id() != null && !dto.getInstallment_id().equals(installmentId)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "installment_id mismatch");
    }

    // 2) payer_member_id es requerido
    if (dto.getPayer_member_id() == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "payer_member_id is required");
    }

    // 3) paid_at no puede ser futura
    if (dto.getPaid_at() != null) {
        LocalDate today = LocalDate.now(); // o ZoneId.of("America/Bogota")
        if (dto.getPaid_at().isAfter(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "paid_at cannot be in the future");
        }
    }

    // 4) el payer debe existir en el mismo tenant
    boolean exists = readRepo.memberExistsInTenant(tenantId, dto.getPayer_member_id());
    if (!exists) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payer member not found in tenant");
    }

    // 5) insertar el pago (UPDATE JSONB) y marcar PAID si corresponde
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
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Installment not found or payment_id already exists");
    }
}



    public List<EstadoCuentaDto> listAccountStatusForTenant(String tenantId) {
        // 1) marcar OVERDUE antes de consultar
        readRepo.markOverdueForTenant(tenantId);
        readRepo.markPaidWhereHasPayments(tenantId);

        var rows = readRepo.findAllInstallmentsForTenant(tenantId);
        return buildGlobalEstadoCuenta(rows, /*includeMembers=*/false);
    }

    public List<EstadoCuentaDto> listAccountStatusForGuardian(String tenantId, Long guardianId) {
        readRepo.markPaidWhereHasPayments(tenantId);
        readRepo.markOverdueForTenant(tenantId); // overdue también afecta la vista del acudiente
        var rows = readRepo.findAllInstallmentsForGuardian(tenantId, guardianId);
        return buildGlobalEstadoCuenta(rows, /*includeMembers=*/true);
    }

    private List<EstadoCuentaDto> buildGlobalEstadoCuenta(
            List<InstallmentWithConceptAndMemberRow> rows,
            boolean includeMembers
    ) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int year = today.getYear();
        int month = today.getMonthValue();

        BigDecimal totalPagado = BigDecimal.ZERO;
        BigDecimal totalPendienteMes = BigDecimal.ZERO;
        long cuotasVencidas = 0;

        // Armamos cuotas (flatten)
        List<CuotasEstadoDto> cuotas = new ArrayList<>(rows.size());

        // Para armar members[] del caso acudiente
        Map<Long, MemberDto> memberMap = new LinkedHashMap<>();

        for (var r : rows) {
            boolean isPaid = "PAID".equalsIgnoreCase(r.getStatus());
            LocalDate due = r.getDue_date();

            if (isPaid) {
                totalPagado = totalPagado.add(nullSafe(r.getAmount()));
            } else {
                // PENDING del mes actual
                if (due != null && due.getYear() == year && due.getMonthValue() == month) {
                    if ("PENDING".equalsIgnoreCase(r.getStatus())) {
                        totalPendienteMes = totalPendienteMes.add(nullSafe(r.getAmount()));
                    }
                }
                // vencidas (no pagadas y vencidas antes de hoy)
                if (due != null && due.isBefore(today)) {
                    cuotasVencidas++;
                }
            }

            var c = new CuotasEstadoDto();
            c.setInstallment_id(r.getInstallment_id());
            c.setName(r.getConcept_name());
            c.setAmount(r.getAmount());
            c.setDue_date(r.getDue_date());
            c.setStatus(r.getStatus());
            c.setPaid_at(r.getPaid_at());
            c.setMethod(r.getMethod());
            c.setReference(r.getReference());
            c.setPayment_id(r.getPayment_id());

            String memberName = ((r.getFirst_name() == null ? "" : r.getFirst_name()) +
                                (r.getLast_name() == null ? "" : " " + r.getLast_name())).trim();
            c.setMember_name(memberName);

            cuotas.add(c);

            if (includeMembers) {
                memberMap.computeIfAbsent(r.getMember_id(), id -> {
                    var m = new MemberDto();
                    m.setMember_id(r.getMember_id());
                    m.setMember_name(memberName);
                    m.setAge(null); // si quieres edad, añádela a la query
                    m.setSubgroup(new MemberDto.IdNameDto(r.getSubgroup_id(), r.getSubgroup_name()));
                    m.setSection (new MemberDto.IdNameDto(r.getSection_id(),  r.getSection_name()));
                    return m;
                });
            }
        }

        var dto = new EstadoCuentaDto();
        dto.setKpis(new EstadoCuentaDto.KpisDto(totalPendienteMes, totalPagado, cuotasVencidas));
        dto.setCuotas(cuotas);
        dto.setMembers(includeMembers ? new ArrayList<>(memberMap.values()) : null);

        // El contrato pide "arreglo de objetos"; devolvemos un único objeto global en una lista.
        return java.util.List.of(dto);
    }

    private static BigDecimal nullSafe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    public Long getGuardianIdFromUserId(String userId) {
        return memberRepo.findMemberIdByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró un acudiente asociado al usuario " + userId));
    }

}
