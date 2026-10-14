// Grupos del filtro de la página de restaurantes (clave → texto de la pestaña).
// Archivo aparte, sin dependencias del servidor, para poder usarlo también en el panel /adminrestaurantes.
export const CUISINES: Record<string, string> = {
  pizza: 'Pizza',
  mexicana: 'Mexicana',
  italiana: 'Italiana',
  americana: 'Americana',
  asiatica: 'Asiática'
};
