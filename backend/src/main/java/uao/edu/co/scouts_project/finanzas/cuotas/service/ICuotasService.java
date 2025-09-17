package uao.edu.co.scouts_project.finanzas.cuotas.service;

import uao.edu.co.scouts_project.finanzas.cuotas.dto.CrearCuotaDTO;
import uao.edu.co.scouts_project.finanzas.cuotas.dto.CuotaDTO;

import java.util.List;

public interface ICuotasService {
    CuotaDTO crear(CrearCuotaDTO dto);
    List<CuotaDTO> listar();
}

