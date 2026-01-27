
import { Project, UserProfile } from "../../types";

export type ProjectType =
  | "AGENCY"
  | "SAAS"
  | "MARKETPLACE"
  | "INTERNAL_TOOL"
  | "IMPACT"
  | "UNKNOWN";

type PromptCtx = {
  project: Project;
  user: UserProfile;
  type: ProjectType;
};

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

/**
 * Inférence de type basée sur l'analyse sémantique du projet.
 */
export function inferProjectType(project: Project): ProjectType {
  const text = [
    project.name,
    project.offer,
    project.problem,
    project.differentiation,
    project.description,
    project.mainGoal,
    project.businessType
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // indices SaaS
  if (/\bsaas\b|\bmrr\b|\babonnement\b|\bchurn\b|\bplans?\b|\btier\b/.test(text)) return "SAAS";

  // indices marketplace / matching
  if (/\bmarketplace\b|\bmatching\b|\bmentors?\b|\bfreelances?\b|\boffre\b.*\bdemande\b/.test(text))
    return "MARKETPLACE";

  // indices outil interne / transformation
  if (/\boutil interne\b|\bprocess\b|\bworkflow\b|\brpa\b|\bcrm\b|\bautomati/.test(text))
    return "INTERNAL_TOOL";

  // indices impact
  if (/\bong\b|\bimpact\b|\bsubvention\b|\bcommunaut/.test(text)) return "IMPACT";

  // indices agence
  if (/\bagence\b|\besn\b|\bdev\b|\bprestations?\b|\bclient\b|\bsow\b|\btjm\b/.test(text))
    return "AGENCY";

  return "UNKNOWN";
}

/**
 * Contexte injecté dans le prompt (source de vérité).
 */
function renderContext(project: Project, user: UserProfile) {
  return `
CONTEXTE (source de vérité) :
- Nom : ${escape(project.name)}
- Pays/marché : ${escape(project.country)}
- Offre : ${escape(project.offer)}
- Problème client : ${escape(project.problem)}
- ICP / cible : ${escape(project.icp)}
- Différenciation : ${escape(project.differentiation)}
- Prix envisagé : ${escape(project.pricing)}
- Contraintes : ${escape(project.constraints)}
- Preuves / références : ${escape(project.proof)}
- Ressources / capacité : ${escape(user.capacity ?? user.resources)}
`.trim();
}

/**
 * Règles communes de qualité (anti-bullshit).
 */
function baseRules() {
  return `
RÈGLES CRITIQUES :
- N’invente aucun fait. Si une info manque : écris "À préciser" + propose 3 questions.
- Donne des estimations chiffrées en fourchettes MIN / PROBABLE / MAX quand possible.
- Priorise l’actionnable : bullets, décisions, risques, garde-fous. Zéro marketing.
- Format de sortie STRICT en Markdown avec les titres demandés.
`.trim();
}

/**
 * Base skeleton (commun à tous).
 */
function baseSkeleton() {
  return `
STRUCTURE MINIMALE (commune) :
## 0. Hypothèses & données manquantes
- Hypothèses (max 7)
- Données manquantes + questions

## 1. Revenus (comment on encaisse)
- Offres/prix (max 3)
- Récurrent vs ponctuel
- Upsells & options

## 2. Coûts & Burn (comment on survit)
- Fixes vs variables
- Burn mensuel MIN/PROBABLE/MAX
- Break-even (ordre de grandeur)

## 3. Acquisition / GTM (comment on vend)
- 3 canaux prioritaires + pourquoi
- CAC MIN/PROBABLE/MAX
- Cycle de vente + pipeline minimal

## 4. Avantage défendable (moat)
- Ce qui est durable
- Ce qui est copiable + protection

## 5. Verdict
- Score /100 + justification
- Top 5 risques + mitigations
`.trim();
}

/**
 * Spécialisations.
 */
type Specializer = (ctx: PromptCtx) => string;

const specializeAgency: Specializer = () => `
AJUSTEMENTS AGENCE / ESN :
- Insiste sur : TJM cible, marge brute, capacité (jours-homme), scope creep, impayés.
- Propose 3 offres : Discovery (cadrage), Build (delivery), Maintain (support/retainer).
- Ajoute des clauses recommandées (acceptation, change request, paiement, SLA optionnel).
`.trim();

const specializeSaaS: Specializer = () => `
AJUSTEMENTS SAAS B2B :
- Insiste sur : MRR, churn, ARPA, marge brute, CAC payback.
- Propose 3 tiers de pricing + limites (seats, usage, features).
- Ajoute : boucle de rétention (activation → usage → valeur → renouvellement).
`.trim();

const specializeMarketplace: Specializer = () => `
AJUSTEMENTS MARKETPLACE / MATCHING :
- Insiste sur : liquidité (match rate), stratégie wedge (niche), chicken-and-egg.
- Revenus : take rate, abonnement premium, frais listing, services.
- Risques : fraude, désintermédiation, qualité supply.
`.trim();

const specializeInternal: Specializer = () => `
AJUSTEMENTS OUTIL INTERNE :
- Remplace "revenus" par "ROI" : temps gagné, erreurs réduites, risques réduits.
- Inclue : change management, adoption, KPIs 30/90/180 jours.
- Compare build vs buy (coût total de possession).
`.trim();

const specializeImpact: Specializer = () => `
AJUSTEMENTS IMPACT / ONG :
- Inclue : théorie du changement, mesure d’impact, dépendance financeurs.
- Revenus hybrides : subventions, partenariats, services, sponsoring.
- Gouvernance & transparence : reporting, conformité, réputation.
`.trim();

const specializeUnknown: Specializer = () => `
AJUSTEMENTS TYPE INCONNU :
- Reste sur la structure minimale.
- Pose des questions pour classifier le projet (agence vs SaaS vs marketplace vs interne vs impact).
`.trim();

const SPECIALIZERS: Record<ProjectType, Specializer> = {
  AGENCY: specializeAgency,
  SAAS: specializeSaaS,
  MARKETPLACE: specializeMarketplace,
  INTERNAL_TOOL: specializeInternal,
  IMPACT: specializeImpact,
  UNKNOWN: specializeUnknown,
};

/**
 * Point d’entrée unique.
 */
export function getBusinessModelPrompt(project: Project, user: UserProfile): string {
  const declaredType = project.type as ProjectType | undefined;
  const type = declaredType && SPECIALIZERS[declaredType] ? declaredType : inferProjectType(project);

  const ctx: PromptCtx = { project, user, type };

  return `
Tu es un expert en Lean Business Design et modélisation économique.
Analyse la viabilité de "${escape(project.name)}" avec un style analytique, froid, orienté rentabilité.

${renderContext(project, user)}

${baseRules()}

${SPECIALIZERS[type](ctx)}

${baseSkeleton()}
`.trim();
}
