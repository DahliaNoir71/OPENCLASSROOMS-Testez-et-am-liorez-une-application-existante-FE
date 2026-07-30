// Corps envoyé au back pour créer ou modifier un étudiant
// (StudentCreateDTO / StudentUpdateDTO). Volontairement sans `id` :
// l'identifiant vient de l'URL, jamais du corps.
export interface StudentRequest {
  firstName: string,
  lastName: string
}
