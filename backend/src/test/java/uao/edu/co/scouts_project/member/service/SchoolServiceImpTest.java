package uao.edu.co.scouts_project.member.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.repository.ISchoolRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SchoolServiceImpTest {

    @Mock
    private ISchoolRepository schoolRepository;

    @InjectMocks
    private SchoolServiceImp schoolService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateSchool_shouldSaveSuccessfully() {
        SchoolData schoolData = new SchoolData();
        schoolData.setMemberId(1L);
        schoolData.setTenantId("tenant1");

        when(schoolRepository.save(any(SchoolData.class))).thenAnswer(i -> {
            SchoolData s = i.getArgument(0);
            s.setSchoolDataId(10L);
            return s;
        });

        SchoolData result = schoolService.create_school(schoolData);

        assertNotNull(result);
        assertEquals(10L, result.getSchoolDataId());
        verify(schoolRepository).save(any(SchoolData.class));
    }

    @Test
    void testCreateSchool_shouldThrowWhenInvalid() {
        SchoolData schoolData = new SchoolData();
        schoolData.setTenantId(""); // tenant vacío

        assertThrows(IllegalArgumentException.class, () -> schoolService.create_school(schoolData));
    }

    @Test
    void testGetSchoolDataByMemberId_shouldReturnOptional() {
        SchoolData s = new SchoolData();
        s.setSchoolDataId(5L);
        when(schoolRepository.findByMemberId(1L)).thenReturn(Optional.of(s));

        Optional<SchoolData> result = schoolService.getSchoolDataByMemberId(1L);

        assertTrue(result.isPresent());
        assertEquals(5L, result.get().getSchoolDataId());
    }

    @Test
    void testGetSchoolDataByMemberId_shouldThrowIfNull() {
        assertThrows(IllegalArgumentException.class, () -> schoolService.getSchoolDataByMemberId(null));
    }
}
