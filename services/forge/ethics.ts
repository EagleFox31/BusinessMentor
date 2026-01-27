
import { Project, UserProfile, AgencyType } from "../../types";

type PromptCtx = { project: Project; user: UserProfile; agencyType: AgencyType };

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

/** 
 * Heuristique d'inférence du type d'agence basée sur les métadonnées projet.
 */
export function inferAgencyType(project: Project): AgencyType {
  const blob = [
    project.name,
    project.offer,
    project.problem,
    project.description,
    project.services,
    project.businessType,
    project.mainGoal
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bpentest\b|\bsoc\b|\bsiem\b|\biso ?27001\b|\baudit\b|\bvuln/.test(blob)) return "CYBERSECURITY";
  if (/\bdata\b|\bbi\b|\betl\b|\bml\b|\bai\b|\brag\b|\bmodel\b|\bprompt\b/.test(blob)) return "DATA_AI";
  if (/\bmarketing\b|\bads\b|\bseo\b|\bsocial\b|\bcommunication\b|\bbrand\b|\bcampagne\b/.test(blob))
    return "MARKETING_COMM";
  if (/\bui\b|\bux\b|\bdesign\b|\bfigma\b|\bcharte graphique\b|\bbranding\b/.test(blob)) return "DESIGN_BRANDING";
  if (/\bformation\b|\bbootcamp\b|\bsyllabus\b|\bcertif\b|\bedtech\b/.test(blob)) return "TRAINING_EDTECH";
  if (/\brecrut\b|\bstaff\b|\bmentor\b|\bmatching\b|\brh\b|\btalent\b/.test(blob)) return "HR_RECRUITING";
  if (/\bstrat(é|e)gie\b|\bpmo\b|\bprocess\b|\bgouvernance\b|\bconseil\b/.test(blob))
    return "CONSULTING_STRATEGY";
  if (/\besn\b|\bagence\b|\bdev\b|\bsaas\b|\bapplication\b|\bapi\b|\binfra\b/.test(blob)) return "DEV_ESN";

  return "UNKNOWN";
}

function baseContext(project: Project, user: UserProfile) {
  return `
CONTEXTE (source de vérité) :
- Organisation : ${escape(project.name)}
- Pays / territoire : ${escape(project.country)}
- Offre / services : ${escape(project.offer)}
- Clients cibles : ${escape(project.icp)}
- Contraintes (secteur, conformité, données) : ${escape(project.constraints)}
- Usage IA / données : ${escape(project.aiPolicyHint)}
- Équipe / prestataires : ${escape(user.team)}
`.trim();
}

function baseRules() {
  return `
RÈGLES TRIGENYS :
- N’invente aucune certification, loi ou label si non fourni.
- Ton : solennel et fondateur, mais applicable (règles + exemples).
- Format Markdown strict.
- Chaque thème contient : Autorisé / Interdit / Attendu.
- Inclure : "Signalement & sanctions" + "Non-représailles".
`.trim();
}

function baseCharterSkeleton(country: string) {
  return `
STRUCTURE OBLIGATOIRE :
## 0. Préambule
## 1. Nos piliers fondamentaux (3 valeurs non négociables)
## 2. Engagement envers le territoire (${country})
## 3. Code de conduite & intégrité (interne + externe)
## 4. Responsabilité technologique (IA, données, sécurité)
## 5. Engagement client & qualité
## 6. Signalement, enquêtes et sanctions
## 7. Acceptation & mise à jour (versioning)
## Annexe : Checklist éthique (10 questions)
`.trim();
}

/** Spécialisations (modules) */
type Specializer = (ctx: PromptCtx) => string;

const specializeDevEsn: Specializer = () => `
MODULE SPÉCIFIQUE — AGENCE DEV / ESN :
Ajoute des clauses explicites sur :
- Propriété intellectuelle : code, licences, réutilisation de briques, open-source.
- Confidentialité projet : dépôts Git, accès, environnements, secrets.
- Qualité delivery : DoD, tests minimum, revue de code obligatoire, traçabilité (tickets/ADR).
- Gestion scope/CR : “no undocumented change”, validation écrite, impact coût/délai.
- Sécurité basique : OWASP mindset, gestion secrets, moindre privilège.
`.trim();

const specializeDataAI: Specializer = () => `
MODULE SPÉCIFIQUE — AGENCE DATA / IA :
Ajoute des clauses explicites sur :
- Gouvernance des données : minimisation, finalité, rétention, anonymisation/pseudonymisation.
- Interdits : données sensibles dans outils IA publics, entraînement non autorisé sur données client.
- Biais & équité : tests de biais, validation humaine, explicabilité proportionnée.
- Traçabilité : sources, data lineage, versioning dataset/modèle, prompt logs si pertinent.
- Sécurité : accès aux datasets, chiffrement au repos/en transit, séparation environnements.
`.trim();

const specializeCyber: Specializer = () => `
MODULE SPÉCIFIQUE — AGENCE CYBERSÉCURITÉ :
Ajoute des clauses explicites sur :
- “Do no harm” : règles d’engagement (RoE), autorisations écrites, périmètre strict.
- Chaîne de preuve : journalisation des actions, stockage sécurisé des preuves.
- Divulgation responsable : délais, coordination, pas d’exposition publique.
- Gestion des accès temporaires : rotation, révocation, comptes nominaux.
- Conflits d’intérêts : pas d’audit sur un système qu’on administre sans garde-fous.
`.trim();

const specializeMarketing: Specializer = () => `
MODULE SPÉCIFIQUE — AGENCE MARKETING / COMM :
Ajoute des clauses explicites sur :
- Vérité publicitaire : pas de manipulation, pas de fake reviews, pas de dark patterns.
- Données & tracking : consentement, transparence, minimisation, respect des audiences.
- Brand safety : contenus sensibles, discours de haine, désinformation → tolérance zéro.
- Propriété intellectuelle : droits des visuels, musiques, contenus, banques d’images.
- Relation influenceurs : transparence des partenariats, mentions obligatoires (si applicable).
`.trim();

const specializeDesignBranding: Specializer = () => `
MODULE SPÉCIFIQUE — AGENCE DESIGN / BRANDING :
Ajoute des clauses explicites sur :
- Originalité : pas de plagiat, pas de “copie d’un concurrent”.
- Licences : polices, icônes, assets, livrables sources (Figma) et droits d’usage.
- Accessibilité : contraste, lisibilité, inclusivité (handicaps, langues).
- Confidentialité : prototypes, NDA, publications portfolio soumises à accord.
`.trim();

const specializeConsulting: Specializer = () => `
MODULE SPÉCIFIQUE — AGENCE CONSEIL / STRATÉGIE :
Ajoute des clauses explicites sur :
- Indépendance & objectivité : pas de recommandations biaisées par commissions cachées.
- Transparence des hypothèses : limites, incertitudes, données utilisées.
- Confidentialité et “need-to-know”.
- Anti-conflit d’intérêts : déclaration systématique.
`.trim();

const specializeTraining: Specializer = () => `
MODULE SPÉCIFIQUE — FORMATION / EDTECH :
Ajoute des clauses explicites sur :
- Équité pédagogique : pas de promesses irréalistes (“emploi garanti”).
- Évaluation : transparence des critères, anti-triche, respect des données apprenants.
- Contenu : respect des licences, pas de piratage, sources citées.
- Sécurité mineurs (si concerné) + conduite formateurs/apprenants.
`.trim();

const specializeHR: Specializer = () => `
MODULE SPÉCIFIQUE — RH / RECRUTEMENT / MATCHING :
Ajoute des clauses explicites sur :
- Non-discrimination : critères pros uniquement, audit des biais.
- Données candidats : consentement, durée de conservation, accès/suppression.
- Transparence : pas de vente de CV sans accord, pas de “ghosting” systémique.
- Confidentialité client/candidat : cloisonnement strict.
`.trim();

const specializeUnknown: Specializer = () => `
MODULE SPÉCIFIQUE — TYPE INCONNU :
Ajoute une section de qualification :
- Quel est le modèle : service, produit, audit, data ?
- Quelles données manipule-t-on ?
- Quels risques majeurs : réputation, sécurité, légal, humain ?
`.trim();

const SPECIALIZERS: Record<AgencyType, Specializer> = {
  DEV_ESN: specializeDevEsn,
  DATA_AI: specializeDataAI,
  CYBERSECURITY: specializeCyber,
  MARKETING_COMM: specializeMarketing,
  DESIGN_BRANDING: specializeDesignBranding,
  CONSULTING_STRATEGY: specializeConsulting,
  TRAINING_EDTECH: specializeTraining,
  HR_RECRUITING: specializeHR,
  UNKNOWN: specializeUnknown,
};

/** 
 * Point d’entrée unique pour la génération de la Charte Éthique.
 */
export function getEthicsPrompt(project: Project, user: UserProfile): string {
  const declared = project.agencyType as AgencyType | undefined;
  const agencyType = declared && SPECIALIZERS[declared] ? declared : inferAgencyType(project);

  const ctx: PromptCtx = { project, user, agencyType };

  return `
Tu es Chief Ethics & Governance Officer du Trigenys Group. Rédige la Charte Éthique de "${escape(project.name)}".
Style : solennel, inspirant, fondateur — mais opérationnel et applicable.

${baseContext(project, user)}

${baseRules()}

Type d’organisation détecté : ${agencyType}
${SPECIALIZERS[agencyType](ctx)}

${baseCharterSkeleton(escape(project.country))}
`.trim();
}
