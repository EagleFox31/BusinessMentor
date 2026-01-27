
import { Project, UserProfile, AgencyType, RevenueModel } from "../../types";

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

export function inferAgencyType(project: Project): AgencyType {
  const blob = [
    project.name,
    project.offer,
    project.description,
    project.problem,
    project.services,
    project.stack,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bpentest\b|\bsoc\b|\bsiem\b|\bvuln|\biso ?27001\b|\baudit\b/.test(blob)) return "CYBERSECURITY";
  if (/\bdata\b|\bbi\b|\betl\b|\bml\b|\bai\b|\brag\b|\bmodel\b|\bvector\b/.test(blob)) return "DATA_AI";
  if (/\bmarketing\b|\bads\b|\bseo\b|\bsocial\b|\bcommunication\b|\bcampagne\b|\binfluence\b/.test(blob))
    return "MARKETING_COMM";
  if (/\bui\b|\bux\b|\bdesign\b|\bfigma\b|\bbranding\b|\bcharte graphique\b/.test(blob)) return "DESIGN_BRANDING";
  if (/\bformation\b|\bbootcamp\b|\bsyllabus\b|\bcertif\b|\bedtech\b/.test(blob)) return "TRAINING_EDTECH";
  if (/\brecrut\b|\bstaff\b|\bmentor\b|\bmatching\b|\brh\b|\btalent\b/.test(blob)) return "HR_RECRUITING";
  if (/\bstrat(é|e)gie\b|\bpmo\b|\bprocess\b|\bgouvernance\b|\bconseil\b/.test(blob))
    return "CONSULTING_STRATEGY";
  if (/\besn\b|\bagence\b|\bdev\b|\bapplication\b|\bapi\b|\bmaintenance\b|\bdelivery\b|\bsupport\b/.test(blob))
    return "DEV_ESN";

  return "UNKNOWN";
}

export function inferRevenueModel(project: Project): RevenueModel {
  const blob = [
    project.revenueModel,
    project.pricing,
    project.offer,
    project.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\bsaas\b|\babonnement\b|\bmrr\b|\bplan\b|\btier\b|\bchurn\b/.test(blob)) return "SAAS";
  if (/\bretainer\b|\bmensuel\b|\bsupport\b|\bmaintenance\b|\bops\b/.test(blob)) return "RETAINER";
  if (/\btjm\b|\brégie\b|\btime\b|\bmaterial\b|\bjour\b/.test(blob)) return "TIME_MATERIAL";
  if (/\bforfait\b|\bprojet\b|\blivrable\b/.test(blob)) return "PROJECT_FIXED";
  if (/\bhybrid\b|\bbuild\b.*\bmaintain\b|\bprojet\b.*\bmensuel\b/.test(blob)) return "HYBRID";

  return "UNKNOWN";
}

/** 3) Spécialisations: quoi packager + comment chiffrer */
type Specializer = (ctx: {
  agencyType: AgencyType;
  revenueModel: RevenueModel;
  project: Project;
  user: UserProfile;
}) => string;

const specializeDevEsn: Specializer = () => `
PRICING PATTERNS — DEV/ESN :
- Packs recommandés : Discovery (cadrage) / Build (delivery) / Maintain (support).
- Unités : forfait par livrable + option TJM pour changements hors périmètre.
- Add-ons : SLA, monitoring, sécurité, perf, hébergement, support 24/7.
- Garde-fous : Change Request obligatoire, acceptation/recette, limites de responsabilité.
`.trim();

const specializeDataAI: Specializer = () => `
PRICING PATTERNS — DATA/IA :
- Structure : Implémentation (setup pipelines) + Abonnement "Data Ops" (monitoring/qualité).
- Unités : connecteurs, sources, dashboards, modèles, volume données, fréquence refresh.
- Add-ons : MLOps/monitoring, gouvernance, catalogue data, formation, SLA.
- Risques : dérive périmètre data, qualité source -> prévoir "Data Readiness Pack".
`.trim();

const specializeCyber: Specializer = () => `
PRICING PATTERNS — CYBER :
- Structure : Audit/Pentest (ponctuel) + SOC/Monitoring (récurrent) + GRC (récurrent).
- Unités : périmètre (assets), fenêtres de test, profondeur (black/grey/white box), rapports.
- Add-ons : re-test, gestion vulnérabilités, runbooks, awareness.
- Garde-fous : règles d’engagement, périmètre strict, confidentialité renforcée.
`.trim();

const specializeMarketing: Specializer = () => `
PRICING PATTERNS — MARKETING/COMM :
- Structure : Setup (stratégie + tracking) + Retainer (exécution) + Budget média (hors prestation).
- Unités : canaux, volume créa, fréquence reporting, landing pages, automation.
- Add-ons : shooting, influence, brand safety, CRO, emailing.
- Garde-fous : obligation de moyens, KPI définis, accès comptes.
`.trim();

const specializeDesign: Specializer = () => `
PRICING PATTERNS — DESIGN/BRANDING :
- Structure : Audit UX/Brand (ponctuel) + Refonte/Design System (projet) + Design Ops (mensuel).
- Unités : écrans, parcours, composants, nombre d’itérations, livrables sources.
- Add-ons : accessibilité, tests utilisateurs, guidelines, templates marketing.
`.trim();

const specializeConsulting: Specializer = () => `
PRICING PATTERNS — CONSEIL/STRATÉGIE :
- Structure : Diagnostic (ponctuel) + Plan cible (ponctuel) + Pilotage (mensuel/PMO).
- Unités : ateliers, livrables, taille orga, complexité, cadence comités.
- Add-ons : formation, coaching, mise en œuvre, KPIs/OKRs.
`.trim();

const specializeTraining: Specializer = () => `
PRICING PATTERNS — FORMATION/EDTECH :
- Structure : Cohortes (par apprenant) + B2B (par équipe) + abonnement contenu (mensuel).
- Unités : heures, niveau, projets, mentoring, évaluations/certifs.
- Add-ons : placement, hackathon, supports premium, LMS.
`.trim();

const specializeHR: Specializer = () => `
PRICING PATTERNS — RH/RECRUTEMENT :
- Structure : Fees de placement + abonnement sourcing/matching + success fee.
- Unités : seniorité, rareté, délai, volume recrutements.
- Add-ons : onboarding, assessment, background checks.
`.trim();

const specializeUnknown: Specializer = () => `
PRICING PATTERNS — INCONNU :
- Proposer 2 architectures : (A) Forfait projet + options (B) Retainer mensuel.
- Exiger les variables minimales (coûts, capacité, cible, valeur créée).
`.trim();

const SPECIALIZERS: Record<AgencyType, Specializer> = {
  DEV_ESN: specializeDevEsn,
  DATA_AI: specializeDataAI,
  CYBERSECURITY: specializeCyber,
  MARKETING_COMM: specializeMarketing,
  DESIGN_BRANDING: specializeDesign,
  CONSULTING_STRATEGY: specializeConsulting,
  TRAINING_EDTECH: specializeTraining,
  HR_RECRUITING: specializeHR,
  UNKNOWN: specializeUnknown,
};

/** 4) Prompt final (un seul point d’entrée) */
export const getPricingPrompt = (
  project: Project,
  user: UserProfile,
  agencyType?: AgencyType,
  revenueModel?: RevenueModel
): string => {
  const type = agencyType ?? project.agencyType ?? inferAgencyType(project);
  const model = revenueModel ?? project.revenueModelType ?? inferRevenueModel(project);

  return `
Tu es un ingénieur en Revenue Strategy (pricing B2B/B2C) spécialisé en packaging d’offres du Trigenys Group.
Ta mission : produire une architecture d'Offres & Pricing directement vendable.

PROJET : ${escape(project.name)}
PAYS : ${escape(project.country)}
DEVISE : ${escape(project.currency)}
TYPE D’AGENCE : ${type}
MODÈLE ÉCO : ${model}

CONTEXTE (source de vérité) :
- Offre / services : ${escape(project.offer)}
- ICP (qui paie) : ${escape(project.icp)}
- Problème & valeur créée : ${escape(project.problem)} / ${escape(project.value)}
- Différenciation : ${escape(project.differentiation)}
- Contraintes : ${escape(project.constraints)}
- Coûts internes (si dispo) : ${escape(project.costs)}
- Capacité équipe (jours/h) : ${escape(user.team)}
- Positionnement : ${escape(project.positioning)} (premium / mid / low-cost)

RÈGLES ANTI-HALLUCINATION (strict) :
- Ne jamais inventer des “prix marché” ou stats pays si non fournis.
- Si tu ne peux pas être “précis”, utilise des FOURCHETTES chiffrées (MIN / PROBABLE / MAX) dans la devise demandée.
- Tous les chiffres doivent être justifiés (hypothèses, unité, marge cible).
- Ajoute une section "Hypothèses & variables à confirmer" (max 10 points).

${SPECIALIZERS[type]({ agencyType: type, revenueModel: model, project, user })}

FORMAT OBLIGATOIRE :
- Utiliser uniquement "## " pour sections, "### " pour sous-sections.
- Listes à puces "- " uniquement.
- Inclure au moins 2 tableaux comparatifs Markdown :
  1) Tableau Packs (Alpha/Horus/Apex) : fonctionnalités + limites + prix
  2) Tableau Add-ons : item + prix + déclencheur (quand ça s’applique)

STRUCTURE À PRODUIRE :

## STRATÉGIE D'ANCRAGE PSYCHOLOGIQUE
### Positionnement & promesse
- Ancrage : comparer au coût du problème (pertes, risques, temps, image)
- “Pourquoi c’est un investissement” : 3 arguments chiffrables (même estimations)
### Politique de prix (règles)
- Remises (si autorisées), conditions, pénalités de retard, acompte

## HYPOTHÈSES & VARIABLES À CONFIRMER
- 7 à 10 bullets : coûts, volume, périmètre, délais, niveau de service, etc.

## PACK ALPHA (Entrée de gamme)
### Pour qui
### Inclus
### Limites (anti scope creep)
### Prix (MIN/PROBABLE/MAX) + unité (par projet / par mois / par jour / par user)

## PACK HORUS (Flagship 80/20)
### Pour qui
### Inclus
### Limites
### Prix (MIN/PROBABLE/MAX) + unité
### ROI attendu (formulé sans mensonge)

## PACK APEX (Premium/Enterprise)
### Pour qui
### Inclus (VIP, SLA, gouvernance, sécurité, reporting)
### Limites / prérequis
### Prix (MIN/PROBABLE/MAX) + unité

## TABLEAU COMPARATIF DES PACKS
- Fournir un tableau Markdown clair (features en lignes, packs en colonnes)

## ADD-ONS (Upsells)
- Au moins 8 add-ons pertinents selon le type d’agence
- Donner prix + déclencheur + valeur

## CONDITIONS COMMERCIALES
- Paiement : acompte/jalons/mensuel
- Révision de prix (indexation simple)
- Durée d’engagement (si retainer/saas)
- Clause de Change Request (si projet)

## MÉCANIQUE DE MARGE (simple et honnette)
- Estimer coût de delivery (heures/jours) + marge cible
- Calcul : Prix = Coût / (1 - marge) (montrer un exemple)
- Donner 3 scénarios (petit/moyen/gros client)

## OBJECTIONS & RÉPONSES (Sales battlecard)
- 6 objections typiques + réponses courtes, factuelles, protectrices

CONTRAINTE : le résultat doit être applicable au pays "${escape(project.country)}" en devise "${escape(
    project.currency
  )}", sans inventer de “marché” si non fourni.
`.trim();
};
