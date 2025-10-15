// Barrel para servicios del organigrama a nivel raíz.
// Centralizamos las exportaciones de imagen en la fachada para que los
// consumidores que importen desde `@/app/routes/organigrama/services` obtengan
// la versión consolidada y no las implementaciones internas.
export { default as imageFacade } from './imageFacade';
export * from './imageFacade';