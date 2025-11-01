package uao.edu.co.scouts_project.organigrama.interfaces;

public interface IMapper<T, E> {
    E toEntity(T dto);
}
