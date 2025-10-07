package uao.edu.co.scouts_project.medical.record.repository.jpa.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import uao.edu.co.scouts_project.medical.record.dto.VaccineDTO;

import java.util.Collections;
import java.util.List;

@Converter
public class VaccineListConverter implements AttributeConverter<List<VaccineDTO>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<VaccineDTO>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(List<VaccineDTO> attribute) {
        try { return attribute == null ? null : MAPPER.writeValueAsString(attribute); }
        catch (Exception e) { throw new IllegalArgumentException("Cannot serialize vaccines_detail", e); }
    }

    @Override
    public List<VaccineDTO> convertToEntityAttribute(String dbData) {
        try {
            return (dbData == null || dbData.isBlank())
                    ? Collections.emptyList()
                    : MAPPER.readValue(dbData, TYPE);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot deserialize vaccines_detail", e);
        }
    }
}
