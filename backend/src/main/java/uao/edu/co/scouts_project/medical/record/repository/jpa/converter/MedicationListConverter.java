package uao.edu.co.scouts_project.medical.record.repository.jpa.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import uao.edu.co.scouts_project.medical.record.dto.MedicationDTO;

import java.util.Collections;
import java.util.List;

@Converter
public class MedicationListConverter implements AttributeConverter<List<MedicationDTO>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<MedicationDTO>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<MedicationDTO> attribute) {
        try { return attribute == null ? null : MAPPER.writeValueAsString(attribute); }
        catch (Exception e) { throw new IllegalArgumentException("Cannot serialize medications_detail", e); }
    }

    @Override
    public List<MedicationDTO> convertToEntityAttribute(String dbData) {
        try {
            return (dbData == null || dbData.isBlank())
                    ? Collections.emptyList()
                    : MAPPER.readValue(dbData, TYPE);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot deserialize medications_detail", e);
        }
    }
}
