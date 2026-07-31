/**
 * Rapport de couverture E2E des parcours utilisateurs.
 *
 * Ce script ne mesure PAS la couverture de code (le builder Angular `application`
 * ne permet pas d'instrumenter les sources avec istanbul). Il mesure la couverture
 * FONCTIONNELLE : quelle proportion des parcours utilisateurs et des écrans de
 * l'application est effectivement exercée par des tests E2E qui passent.
 *
 * La mesure est dérivée des résultats réels de Cypress (JSON mochawesome), pas
 * déclarée à la main : un test supprimé, renommé ou en échec fait baisser le taux.
 * Un parcours est couvert si AU MOINS UN des tests qui lui sont associés a passé.
 *
 * Sortie : cypress/reports/e2e-coverage.json, cypress/reports/e2e-coverage.html,
 * et un tableau dans le terminal. Sort en code 1 si un taux passe sous le seuil.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const SEUIL = 80;
const DOSSIER_JSON = 'cypress/reports/json';
const DOSSIER_SORTIE = 'cypress/reports';

// ---- Titres exacts des tests, centralisés pour éviter les fautes de frappe ----

const T = {
  accueil: ['accueil-deconnexion.cy.ts', "affiche la page d'accueil avec ses deux points d'entrée"],
  deconnexion: ['accueil-deconnexion.cy.ts', 'déconnecte un utilisateur connecté et le renvoie vers la connexion'],
  inscription: ['inscription-connexion.cy.ts', "inscrit un nouvel utilisateur et redirige vers l'écran de connexion"],
  connexion: ['inscription-connexion.cy.ts', 'connecte l\'utilisateur et affiche la liste avec la navbar connectée'],
  crud: ['etudiants-crud.cy.ts', 'parcourt état vide, création, édition et suppression'],
  gardeInvite: ['protection-routes.cy.ts', 'redirige un invité vers /login avec returnUrl'],
  gardeConnecte: ['protection-routes.cy.ts', 'redirige un utilisateur connecté vers /students'],
  smoke: ['smoke-back-reel.cy.ts', "inscription, connexion, création et suppression d'un étudiant"],
};

// ---- Inventaire : 11 parcours utilisateurs, 6 écrans ----

const PARCOURS = [
  { id: 'P01', libelle: "Consulter la page d'accueil", tests: [T.accueil] },
  { id: 'P02', libelle: 'Créer un compte', tests: [T.inscription, T.smoke] },
  { id: 'P03', libelle: 'Se connecter', tests: [T.connexion, T.smoke] },
  { id: 'P04', libelle: 'Se déconnecter', tests: [T.deconnexion] },
  { id: 'P05', libelle: 'Consulter la liste des étudiants', tests: [T.crud, T.connexion, T.smoke] },
  { id: 'P06', libelle: 'Voir la liste vide (état initial)', tests: [T.crud] },
  { id: 'P07', libelle: "Consulter le détail d'un étudiant", tests: [T.crud, T.smoke] },
  { id: 'P08', libelle: 'Créer un étudiant', tests: [T.crud, T.smoke] },
  { id: 'P09', libelle: 'Modifier un étudiant', tests: [T.crud] },
  { id: 'P10', libelle: 'Supprimer un étudiant', tests: [T.crud, T.smoke] },
  { id: 'P11', libelle: "Être redirigé quand l'accès est refusé (guards)", tests: [T.gardeInvite, T.gardeConnecte] },
];

const ECRANS = [
  { id: 'E1', libelle: 'Accueil (/)', tests: [T.accueil, T.deconnexion] },
  { id: 'E2', libelle: 'Inscription (/register)', tests: [T.inscription, T.smoke] },
  { id: 'E3', libelle: 'Connexion (/login)', tests: [T.inscription, T.connexion, T.gardeInvite, T.deconnexion] },
  { id: 'E4', libelle: 'Liste des étudiants (/students)', tests: [T.crud, T.connexion, T.deconnexion, T.smoke] },
  { id: 'E5', libelle: 'Détail étudiant (/students/:id)', tests: [T.crud, T.smoke] },
  { id: 'E6', libelle: 'Formulaire étudiant (/students/new, /students/:id/edit)', tests: [T.crud, T.smoke] },
];

// ---- Lecture des résultats Cypress ----

function collecterTests(noeud, fichier, accumulateur) {
  for (const test of noeud.tests ?? []) {
    accumulateur.set(`${fichier}::${test.title}`, test.state);
  }
  for (const sousSuite of noeud.suites ?? []) {
    collecterTests(sousSuite, fichier, accumulateur);
  }
}

function lireResultats() {
  if (!existsSync(DOSSIER_JSON)) {
    throw new Error(
      `Aucun résultat dans ${DOSSIER_JSON}. Lancer d'abord les tests E2E ` +
        `(npm run e2e), qui produisent les JSON mochawesome.`
    );
  }
  const fichiers = readdirSync(DOSSIER_JSON).filter(f => f.endsWith('.json'));
  if (fichiers.length === 0) {
    throw new Error(`Aucun fichier .json dans ${DOSSIER_JSON}.`);
  }

  const etats = new Map();
  const specsExecutees = new Set();
  let totalTests = 0;
  let totalEchecs = 0;

  for (const fichier of fichiers) {
    const rapport = JSON.parse(readFileSync(join(DOSSIER_JSON, fichier), 'utf8'));
    for (const resultat of rapport.results ?? []) {
      const spec = basename(resultat.file ?? resultat.fullFile ?? '');
      specsExecutees.add(spec);
      collecterTests(resultat, spec, etats);
    }
    totalTests += rapport.stats?.tests ?? 0;
    totalEchecs += rapport.stats?.failures ?? 0;
  }

  return { etats, specsExecutees, totalTests, totalEchecs };
}

// ---- Calcul de la couverture ----

function evaluer(inventaire, etats) {
  return inventaire.map(entree => {
    const preuves = entree.tests.map(([spec, titre]) => ({
      spec,
      titre,
      etat: etats.get(`${spec}::${titre}`) ?? 'non exécuté',
    }));
    return { ...entree, preuves, couvert: preuves.some(p => p.etat === 'passed') };
  });
}

const taux = liste =>
  liste.length === 0 ? 0 : Math.round((liste.filter(e => e.couvert).length / liste.length) * 1000) / 10;

// ---- Rendu ----

function tableauTerminal(titre, lignes) {
  const largeur = Math.max(...lignes.map(l => l.libelle.length), titre.length);
  console.log(`\n  ${titre}`);
  console.log(`  ${'─'.repeat(largeur + 16)}`);
  for (const ligne of lignes) {
    const statut = ligne.couvert ? '✔ couvert  ' : '✖ NON COUVERT';
    console.log(`  ${ligne.id}  ${ligne.libelle.padEnd(largeur)}  ${statut}`);
  }
}

function html({ parcours, ecrans, tauxParcours, tauxEcrans, meta }) {
  const ligne = e => `
      <tr class="${e.couvert ? 'ok' : 'ko'}">
        <td class="id">${e.id}</td>
        <td>${echapper(e.libelle)}</td>
        <td class="statut">${e.couvert ? '✔ couvert' : '✖ non couvert'}</td>
        <td class="preuves">${e.preuves
          .map(p => `<code class="${p.etat === 'passed' ? 'p' : 'n'}">${echapper(p.spec)} › ${echapper(p.titre)}</code>`)
          .join('')}</td>
      </tr>`;

  const carte = (libelle, valeur) => `
      <div class="carte ${valeur >= SEUIL ? 'vert' : 'rouge'}">
        <div class="valeur">${valeur} %</div>
        <div class="libelle">${libelle}</div>
        <div class="seuil">seuil requis : ${SEUIL} %</div>
      </div>`;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Couverture E2E des parcours utilisateurs</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; padding: 2rem;
         line-height: 1.5; background: #fbfbfd; color: #1a1a1f; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
  .sous { color: #5a5a68; margin: 0 0 1.5rem; font-size: .9rem; }
  .cartes { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
  .carte { border-radius: 12px; padding: 1rem 1.5rem; min-width: 190px; border: 1px solid; }
  .carte.vert { background: #eaf7ee; border-color: #9ad3ab; }
  .carte.rouge { background: #fdecec; border-color: #e0a0a0; }
  .valeur { font-size: 2rem; font-weight: 650; letter-spacing: -.02em; }
  .libelle { font-weight: 550; }
  .seuil { font-size: .8rem; color: #5a5a68; margin-top: .25rem; }
  h2 { font-size: 1.1rem; margin: 2rem 0 .75rem; }
  .enveloppe { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: .88rem; }
  th, td { text-align: left; padding: .5rem .7rem; border-bottom: 1px solid #e3e3ea; vertical-align: top; }
  th { background: #f2f2f6; font-weight: 600; white-space: nowrap; }
  td.id { font-variant-numeric: tabular-nums; color: #5a5a68; white-space: nowrap; }
  td.statut { white-space: nowrap; font-weight: 550; }
  tr.ok td.statut { color: #1c7c3a; }
  tr.ko td.statut { color: #b5321f; }
  code { display: block; font-size: .78rem; padding: .1rem 0; color: #5a5a68; }
  code.p::before { content: "✔ "; color: #1c7c3a; }
  code.n::before { content: "✖ "; color: #b5321f; }
  footer { margin-top: 2.5rem; font-size: .8rem; color: #5a5a68; border-top: 1px solid #e3e3ea; padding-top: 1rem; }
  @media (prefers-color-scheme: dark) {
    body { background: #16161a; color: #ececf1; }
    .sous, .seuil, td.id, code { color: #9b9baa; }
    .carte.vert { background: #14301d; border-color: #2c6b3f; }
    .carte.rouge { background: #351817; border-color: #7a3630; }
    th { background: #202027; }
    th, td, footer { border-color: #2e2e37; }
    tr.ok td.statut { color: #63c983; }
    tr.ko td.statut { color: #f08b7a; }
  }
</style>
</head>
<body>
  <h1>Couverture E2E des parcours utilisateurs</h1>
  <p class="sous">Généré le ${echapper(meta.date)} — dérivé des résultats Cypress, non déclaré à la main.</p>

  <div class="cartes">
    ${carte('Parcours utilisateurs', tauxParcours)}
    ${carte('Écrans de l\'application', tauxEcrans)}
  </div>

  <h2>Parcours utilisateurs (${parcours.filter(p => p.couvert).length}/${parcours.length})</h2>
  <div class="enveloppe">
    <table>
      <thead><tr><th>Id</th><th>Parcours</th><th>Statut</th><th>Tests E2E qui le couvrent</th></tr></thead>
      <tbody>${parcours.map(ligne).join('')}</tbody>
    </table>
  </div>

  <h2>Écrans (${ecrans.filter(e => e.couvert).length}/${ecrans.length})</h2>
  <div class="enveloppe">
    <table>
      <thead><tr><th>Id</th><th>Écran</th><th>Statut</th><th>Tests E2E qui l'exercent</th></tr></thead>
      <tbody>${ecrans.map(ligne).join('')}</tbody>
    </table>
  </div>

  <footer>
    <p><strong>Périmètre de la mesure.</strong> Couverture fonctionnelle : proportion des parcours
    et des écrans exercés par un test E2E qui passe. Ce n'est pas une couverture de code — celle-ci
    est mesurée séparément par Jest (<code style="display:inline">coverage/index.html</code>) et
    JaCoCo côté back-end.</p>
    <p>Specs exécutées : ${meta.specs.map(s => `<code style="display:inline">${echapper(s)}</code>`).join(', ')}
    — ${meta.totalTests} tests, ${meta.totalEchecs} échec(s).</p>
  </footer>
</body>
</html>
`;
}

const echapper = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- Exécution ----

const { etats, specsExecutees, totalTests, totalEchecs } = lireResultats();

const parcours = evaluer(PARCOURS, etats);
const ecrans = evaluer(ECRANS, etats);
const tauxParcours = taux(parcours);
const tauxEcrans = taux(ecrans);

const meta = {
  date: new Date().toISOString().replace('T', ' ').slice(0, 19),
  specs: [...specsExecutees].sort(),
  totalTests,
  totalEchecs,
};

tableauTerminal(`Parcours utilisateurs — ${tauxParcours} % (seuil ${SEUIL} %)`, parcours);
tableauTerminal(`Écrans — ${tauxEcrans} % (seuil ${SEUIL} %)`, ecrans);

mkdirSync(DOSSIER_SORTIE, { recursive: true });
writeFileSync(
  join(DOSSIER_SORTIE, 'e2e-coverage.json'),
  JSON.stringify({ seuil: SEUIL, tauxParcours, tauxEcrans, parcours, ecrans, meta }, null, 2)
);
writeFileSync(
  join(DOSSIER_SORTIE, 'e2e-coverage.html'),
  html({ parcours, ecrans, tauxParcours, tauxEcrans, meta })
);

console.log(`
  Rapport écrit : ${DOSSIER_SORTIE}/e2e-coverage.html
                  ${DOSSIER_SORTIE}/e2e-coverage.json
`);

const echecs = [];
if (totalEchecs > 0) echecs.push(`${totalEchecs} test(s) E2E en échec`);
if (tauxParcours < SEUIL) echecs.push(`parcours ${tauxParcours} % < ${SEUIL} %`);
if (tauxEcrans < SEUIL) echecs.push(`écrans ${tauxEcrans} % < ${SEUIL} %`);

if (echecs.length > 0) {
  console.error(`  ✖ Seuil de couverture E2E non atteint : ${echecs.join(' ; ')}\n`);
  process.exit(1);
}

console.log(`  ✔ Seuil de ${SEUIL} % atteint sur les parcours (${tauxParcours} %) et les écrans (${tauxEcrans} %).\n`);
