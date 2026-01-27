
import { Project, UserProfile } from "../../types";

const escape = (v: unknown) => (v === null || v === undefined || v === "" ? "À préciser" : String(v));

/**
 * Génère le prompt pour le Playbook de Livraison (OS de Delivery).
 */
export const getDeliveryPrompt = (project: Project, user: UserProfile): string => `
Tu es un expert en Excellence Opérationnelle + Delivery Management + Software Engineering.
Ta mission : rédiger un PLAYBOOK DE LIVRAISON prêt à être appliqué par une équipe (V1 "Ready to Scale").
Contexte : ${escape(project.name)}.

CONTEXTE (source de vérité) :
- Projet : ${escape(project.name)}
- Pays/Marché : ${escape(project.country)}
- Offre / type de projet : ${escape(project.type)} / ${escape(project.offer)}
- ICP / client cible : ${escape(project.icp)}
- Contraintes : ${escape(project.constraints)}
- Stack / tech : ${escape(project.stack)}
- Mode delivery : ${escape(project.deliveryMode)} (ex: agile, sprint, kanban, waterfall, hybride)
- Équipe / rôles disponibles : ${escape(user.team)} ; capacité : ${escape(user.capacity)}
- Exigences sécurité / conformité : ${escape(project.security)}

RÈGLES CRITIQUES :
- N’invente aucun fait : si une info manque => "À préciser" + 3 questions.
- Tout doit être actionnable : checklists, templates, critères, rituels, gates.
- Format Markdown strict avec titres et sous-titres.
- Ton : pragmatique, itératif, orienté qualité, "Ready to Scale".

STRUCTURE OBLIGATOIRE :
## 0. But du Playbook & principes opératoires
- 7 principes max (ex: "No undocumented change", "Quality gates non négociables")

## 1. Gouvernance & rôles (RACI)
- Rôles : Product Owner, Tech Lead, QA, Dev, Ops, Client sponsor, Key users
- Qui décide quoi, qui valide quoi, délais de réponse attendus (SLA de décision)

## 2. Phase d’Onboarding Client (0 → 24h)
Objectif : transformer un prospect signé en partenaire rassuré.
Inclure :
- Checklist "Kickoff Ready"
- Récolte infos : accès, environnements, contraintes, data, stakeholders
- Pack de démarrage : agenda kickoff, canaux, doc de référence, calendrier
- Template : "Compte rendu de kickoff" (sections)

## 3. Cadrage & contrat d’exécution (Scope Control)
Inclure :
- Définition du périmètre (in/out) + hypothèses
- Critères d’acceptation (par user story / livrable)
- Process Change Request (CR) : flux, estimations, validation, impact
- Pattern : **Scope Gate** (aucun dev sans DoR/AC)

## 4. Workflow de production (Alpha → Beta → Release)
Décrire les étapes séquentielles et les "quality gates".
Inclure :
- DoR (Definition of Ready) et DoD (Definition of Done)
- Branching strategy Git (trunk-based ou gitflow selon contexte)
- CI/CD minimal (lint, tests, build, scan sécurité)
- Convention de versioning (SemVer)
- Artefacts obligatoires : ADR, README, runbook, changelog
- Pattern : **Release Train** ou **Feature Flags** (si utile)

## 5. Système de contrôle qualité (QC)
Inclure checklists :
- Code quality : lint, formatting, complexity, duplication
- Tests : unit, integration, e2e, smoke
- Sécurité : secrets, dépendances, RBAC, audit logs (si applicable)
- Performance : budget perf, profiling, pagination, caching
- UX : accessibilité basique, responsive, erreurs
- Pattern : **Quality Gate** + **Shift-left testing**

## 6. Patterns & standards d’architecture (selon type de projet)
Donne une section “Patterns recommandés” avec :
A) Patterns de conception (code)
- Factory, Strategy, Adapter, Facade, Repository, Unit of Work
- Observer/Event Bus (si event-driven)
- Dependency Injection
- Command (actions), Specification (règles métier)

B) Patterns d’architecture (système)
- Layered / Clean Architecture
- Modular Monolith (par défaut) vs Microservices (conditions)
- CQRS (si lecture/écriture asymétriques)
- Event Sourcing (rare, conditions strictes)
- Pattern : **12-Factor App** (si web/cloud)

C) Patterns de résilience
- Retry + backoff, Circuit Breaker, Timeout
- Idempotency keys (paiement/commandes)
- Outbox pattern (si events fiables)
- Rate limiting

Pour chaque pattern : "Quand l’utiliser / Quand l’éviter / Exemple concret dans ce projet".

## 7. Gestion des feedbacks & amélioration continue
Inclure :
- Cadence (hebdo, sprint review, démo)
- Collecte feedback : formulaire, interviews, analytics
- Priorisation : ICE/RICE
- Rituels : rétro, post-mortem blameless
- Pattern : **Feedback Loop** + **Kaizen**

## 8. Communication & reporting (client + interne)
Inclure :
- Weekly report template (avancement, risques, décisions attendues)
- Matrice des risques (probabilité/impact/plan)
- Gestion des incidents (quand ça casse, qui alerte)

## 9. Déploiement, run & support
Inclure :
- Environnements (dev/staging/prod)
- Observabilité : logs, métriques, traces (minimum)
- Runbook d’exploitation
- SLA support (si offert) + process escalade
- Pattern : **Runbook-first** + **SRE-lite**

## 10. Annexes (templates)
Fournir au moins 6 templates :
1) Kickoff note
2) Weekly report
3) Change request
4) Checklist de release
5) Template ADR
6) Runbook minimal

SORTIE ATTENDUE :
- Document complet et directement copiable dans Notion/Confluence.
- Pas de paragraphes vagues : chaque section doit contenir des listes, checklists, et exemples.
`;
