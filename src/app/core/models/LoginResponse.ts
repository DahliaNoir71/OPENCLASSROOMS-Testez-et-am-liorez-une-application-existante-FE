// DTO de la réponse de POST /api/login.
// Attention : le back ne renvoie PAS un objet JSON { token }, mais le JWT brut
// en text/plain. Cette interface est une convention côté front : le service
// emballe la chaîne brute dans { token } (voir AuthService.login).
export interface LoginResponse {
  token: string
}
