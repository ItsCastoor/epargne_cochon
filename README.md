# 💰 Épargne Cochon

Application React Native Web pour la gestion de comptes partagés d'épargne, portabilisable sur iOS et Android.

## 🚀 Démarrage

### Installation

```bash
npm install
```

### Développement (Web)

```bash
npm run dev
```

L'app s'ouvrira sur `http://localhost:19006`

### Build Web

```bash
npm run build
```

### Démarrage en production

```bash
npm start
```

### Mobile

```bash
# iOS
npm run ios

# Android
npm run android
```

## 📱 Technologies

- **React Native Web** - Framework multiplateforme
- **Expo** - Runtime et build tools
- **Tailwind CSS / nativewind** - Styling
- **React Navigation** - Routage
- **AsyncStorage** - Stockage local
- **TypeScript** - Typage statique

## 📂 Structure

```
├── screens/           # Écrans de l'app
│   ├── auth/         # Authentification
│   ├── accounts/     # Gestion des comptes
│   └── ...
├── lib/
│   ├── api.ts        # Client API
│   ├── auth.ts       # Fonctions auth
│   └── AuthContext.tsx # Context global
└── App.tsx           # Point d'entrée
```

## 🔐 Configuration

Créez `.env.local` :

```env
REACT_APP_API_URL=https://apiepargne.tpareschi.eu
```

## 📡 API

- `getSharedAccounts()` - Récupérer les comptes
- `login(email, password)` - Connexion
- `register(email, password, firstName, lastName)` - Inscription
- Et plus...

## 🎯 À faire

- [ ] Compléter les écrans
- [ ] Tester sur mobile
- [ ] Déployer App Store / Play Store
