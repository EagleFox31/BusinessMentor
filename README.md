
# APEX HORUS 🦅
> **Mission Control for Sovereign Entrepreneurs.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
![License](https://img.shields.io/badge/license-Proprietary-black.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-Operational-emerald.svg?style=flat-square)

**Apex Horus** n'est pas un simple chatbot. C'est une **interface de commandement stratégique** conçue pour transformer une intuition brute en une entreprise structurée, chiffrée et documentée. Il agit comme un co-fondateur virtuel, un architecte de business et un directeur financier, fusionnés dans une interface immersive.

---

## 🎯 La Mission

L'entrepreneuriat moderne souffre de trois maux : la solitude, le chaos structurel et le syndrome de la page blanche. 
**Apex Horus** résout ces frictions grâce à une approche **"Asset-First"** : nous ne faisons pas que discuter, nous forgeons des livrables.

### Pourquoi Apex Horus ?
*   **Architecture Mentale :** Structurez votre vision (Vision, Business, Légal, Tech).
*   **Intelligence Contextuelle :** Le système retient tout. Il connaît votre marché, vos contraintes et votre équipe.
*   **Vitesse d'Exécution :** Générez en 30 secondes des documents qui prendraient 3 jours à un consultant.

---

## ⚡ Capacités Tactiques

### 1. 🧠 Le Mentor Horus (Comm-Link)
Un moteur d'intelligence artificielle contextuel qui agit comme un stratège senior. Il challenge vos hypothèses, affine votre proposition de valeur et mémorise l'évolution de votre projet.
*   *Fonctionnalité clé :* Mémoire persistante et ancrage sur des données réelles (Web Grounding).

### 2. 📝 Blueprint Studio (La Forge)
Un atelier de génération documentaire simulant des livrables physiques (format A4).
*   **Générez :** One-Pagers, Pitch Scripts, Business Models, Pactes d'Associés, SOWs, Chartes Éthiques.
*   **Raffinez :** Utilisez le "Studio Refiner" pour co-rédiger et modifier des sections spécifiques du document par la conversation.
*   **Exportez :** Rendu PDF vectoriel professionnel prêt à être envoyé aux investisseurs ou clients.

### 3. 📊 Simulation Deck
Ne devinez plus. Simulez.
*   Projection financière sur 12/24 mois.
*   Calcul automatique du ROI, du Cash Burn et de la Stabilité.
*   Scénarios de stress (ex: "Que se passe-t-il si je perds mon plus gros client ?").

### 4. 🧬 La Cellule (Team Governance)
Gestion de l'équipe et de la structure de capital.
*   **Sculpting de Profil :** L'IA analyse les profils sommaires des collaborateurs et génère des biographies professionnelles et des rôles stratégiques optimisés.

---

## 🛠 Arsenal Technique

Construit sur une stack moderne, performante et typée.

*   **Core :** React 19, TypeScript, Vite.
*   **UI System :** Tailwind CSS, Lucide React, Glassmorphism propriétaire.
*   **Data & Auth :** Firebase (Firestore, Authentication).
*   **Visualization :** Recharts (Data viz financière).
*   **Engine :** Intégration LLM native (GenAI SDK) avec Prompt Engineering avancé (`services/blueprintForge`).
*   **Export :** jsPDF & html2canvas pour la génération vectorielle.

---

## 🚀 Initialisation du Protocole

Pour déployer une instance locale d'Apex Horus :

### Prérequis
*   Node.js 18+
*   Une clé API valide pour le moteur d'intelligence (à configurer dans l'environnement).
*   Un projet Firebase actif.

### Installation

```bash
# Cloner le réacteur
git clone https://github.com/trigenys-group/apex-horus.git

# Initialiser les dépendances
npm install

# Configurer les variables d'environnement
# Créer un fichier .env à la racine
cp .env.example .env
```

### Configuration .env
```env
API_KEY=votre_clé_intelligence_artificielle
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

### Lancement
```bash
# Démarrer le système en mode développement
npm run dev
```

---

## 🔮 Roadmap & Évolutions

*   **Phase 1 (Actuelle) :** MVP Stable, génération documentaire textuelle, simulations financières.
*   **Phase 2 :** Mode Multimodal (Analyse de schémas d'architecture uploadés).
*   **Phase 3 :** Intégration "Live Search" pour la veille concurrentielle en temps réel.
*   **Phase 4 :** Mode "Multi-Player" pour la collaboration en temps réel entre associés.

---

<div align="center">
  <p><strong>TRIGENYS GROUP</strong></p>
  <p><i>Excellence • Strategy • Power</i></p>
  <p>© 2025 Apex Horus Project. All rights reserved.</p>
</div>
