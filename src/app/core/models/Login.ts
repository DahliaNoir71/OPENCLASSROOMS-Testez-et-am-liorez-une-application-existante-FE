// DTO de la requête envoyée à POST /api/login.
// Les noms de champs correspondent exactement à ceux attendus par le back
// (LoginRequestDTO Java : login / password, tous deux obligatoires).
export interface Login {
  login: string,
  password: string
}
