package uao.edu.co.scouts_project.finanzas.cuotas.service;

import uao.edu.co.scouts_project.finanzas.cuotas.dto.ActualizarCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CrearCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CuotaDTO;

import java.util.List;
import java.util.UUID;

public interface ICuotasService {
    CuotaDTO crear(CrearCuotaDTO dto);
    List<CuotaDTO> listar();
    CuotaDTO actualizar(UUID id, ActualizarCuotaDTO dto); 
    void eliminar(UUID id);                                
}

