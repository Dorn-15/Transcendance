export interface GameInfo {
    id: string;
    title: string;
    description: string;
    image: string;
    param: string;
    social: string;
    legal: string;
    win: string;
    lose: string;
    back: string;
    trans: string;
    noFriends: string;
    leave: string;
    connectedAs: string;
    welcome: string;
    username: string;
    enter: string;
    loading: string;
    coin: string;
    CreateOrJoin: string;
    create: string;
    join: string;
    error: string;
    state: string;
    waiting: string;
    online: string;
    descPong: string;
    descBreakout: string;
    descSpaceInvaders: string;
    workIn: string;
    laterCoin: string;
    alienLate: string;
    play: string;
    running: string;
    passWord: string;
    signOut: string;
    newAccount: string;
    loginOrEmail: string;
	email: string;
    confirmPassword: string;
    confirmPasswordError: string;
	missingFields: string;
	emailAlreadyExists: string;
	userAlreadyExists: string;
	operationFailed: string;
    firstToFive: string;
    useArrows: string;

    // Privacy Policy Keys
    privacyPolicy: string;
    effectiveDate: string;
    introduction: string;
    welcomeTo: string;
    dataCollected: string;
    mayCollect: string;
    listData: string;
    howWeUsed: string;
    usedDataDesc: string;
    contactUs: string;
    contactText: string;

    // Terms of Service Keys
    termsOfService: string;
    lastUpdated: string;
    acceptance: string;
    acceptanceDesc: string;
    userConduct: string;
    conductDesc: string;
    disclaimer: string;
    disclaimerDesc: string;
    governingLaw: string;
    governingDesc: string;
}

export interface LanguageData {
    defaultInfo: GameInfo;
}

export const ALL_LANGUAGES: Record<number, LanguageData> = {
    // 1 = FRANÇAIS
    1: {
        defaultInfo: {
            id: "",
            title: "Arcade Room 3D",
            description: "Bienvenue dans la salle d'arcade virtuelle. Découvrez nos bornes interactives.",
            image: "/assets/previews/room.jpg",
            param: "Parametres",
            social: "Amis",
            legal: "Mentions Legales",
            win: "Victoires",
            lose: "Defaites",
            back: "Retour",
            trans: "Transcendance",
            noFriends: "Aucun ami ajoute",
            leave: "Quitter la borne",
            connectedAs: "Connecte en tant que",
            welcome: "Bienvenue",
            username: "Pseudo",
            enter: "Entrer",
            loading: "Chargement des modeles",
            coin: "INSEREZ UNE PIECE",
            CreateOrJoin: "(CREEZ OU REJOIGNEZ UNE PARTIE)",
            create: "CREER",
            join: "REJOINDRE",
            error: "ERREUR",
            state: "ETAT",
            waiting: "EN ATTENTE",
            online: "CONNECTE",
            descPong: "LE JEUX DE PING PONG ORIGINEL",
            descBreakout: "DETRUIT LES BRIQUES",
            descSpaceInvaders: "PROTEGE LA TERRE",
            workIn: "CHANTIER EN COURS",
            laterCoin: "INSEREZ UNE PIECE PLUS TARD...",
            alienLate: "LES ALIENS SONT EN RETARD",
            play: "JOUER",
            running: "EN COURS",
			loginOrEmail: "Login ou email",
			email: "Email",
            passWord: "Mot de passe",
            signOut: "Deconnexion",
            newAccount: "NOUVEAU COMPTE",
            confirmPassword: "Confirmez le mot de passe",
			confirmPasswordError: "Les mots de passe ne correspondent pas",
			missingFields: "Champs manquants",
			emailAlreadyExists: "Email déjà existant",
			userAlreadyExists: "Utilisateur déjà existant",
			operationFailed: "Erreur lors de l'opération",
            firstToFive: "LE PREMIER A 5 GAGNE",
            useArrows: "UTILISEZ LES FLECHES HAUT ET BAS POUR BOUGER",

            // Privacy
            privacyPolicy: "Politique de confidentialite",
            effectiveDate: "Date d'entrée en vigueur :",
            introduction: "1. Introduction",
            welcomeTo: "Bienvenue chez TRANSCENDANCE. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles.",
            dataCollected: "2. Données que nous collectons",
            mayCollect: "Nous pouvons collecter les types d'informations suivants :",
            listData: "E-mail, Pseudo",
            howWeUsed: "3. Utilisation de vos données",
            usedDataDesc: "Vos données sont utilisées pour fournir et améliorer le service, spécifiquement pour l'authentification et le classement.",
            contactUs: "4. Nous contacter",
            contactText: "Si vous avez des questions concernant cette politique, contactez-nous à :",

            // Terms
            termsOfService: "CONDITIONS D'UTILISATION",
            lastUpdated: "Dernière mise à jour :",
            acceptance: "1. Acceptation des conditions",
            acceptanceDesc: "En accédant à TRANSCENDANCE, vous acceptez d'être lié par les termes de cet accord.",
            userConduct: "2. Conduite de l'utilisateur",
            conductDesc: "Vous acceptez de ne pas participer à des activités interdites : triche, piratage, spam.",
            disclaimer: "3. Avertissement",
            disclaimerDesc: "Le service est fourni 'TEL QUEL'. Nous ne garantissons pas sa fiabilité absolue.",
            governingLaw: "4. Loi applicable",
            governingDesc: "Ces conditions sont régies conformément aux lois en vigueur."
        }
    },
    // 2 = ANGLAIS
    2: {
        defaultInfo: {
            id: "",
            title: "Arcade Room 3D",
            description: "Welcome to the virtual arcade room. Discover our interactive machines.",
            image: "/assets/previews/room.jpg",
            param: "Settings",
            social: "Friends",
            legal: "Legal Notices",
            win: "victories",
            lose: "defeat",
            back: "Back",
            trans: "Transcendence",
            noFriends: "No friends add",
            leave: "Exit the arcade",
            connectedAs: "Connected as",
            welcome: "Welcome",
            username: "Username",
            enter: "Enter",
            loading: "Loading models",
            coin: "INSERT COIN",
            CreateOrJoin: "(CREATE OR JOIN A GAME)",
            create: "CREATE",
            join: "JOIN",
            error: "ERROR",
            state: "STATE",
            waiting: "WAITING",
            online: "ONLINE",
            descPong: "THE ORIGINAL PING PONG GAME",
            descBreakout: "DESTROY THE BRICKS",
            descSpaceInvaders: "DEFEND THE EARTH",
            workIn: "WORK IN PROGRESS",
            laterCoin: "INSERT COIN LATER...",
            alienLate: "THE ALIENS ARE LATE",
            play: "PLAY",
            running: "RUNNING",
			loginOrEmail: "Login or email",
			email: "Email",
            passWord: "Password",
            signOut: "Sign out",
            newAccount: "NEW ACCOUNT",
            confirmPassword: "Confirm Password",
			confirmPasswordError: "The passwords do not match",
			missingFields: "Missing fields",
			emailAlreadyExists: "Email already exists",
			userAlreadyExists: "User already exists",
			operationFailed: "Operation failed",
            firstToFive: "FIRST TO 5 WINS",
            useArrows: "USE THE UP AND DOWN ARROWS TO MOVE",

            // Privacy
            privacyPolicy: "Privacy Policy",
            effectiveDate: "Effective Date:",
            introduction: "1. Introduction",
            welcomeTo: "Welcome to TRANSCENDANCE. We respect your privacy and are committed to protecting your personal data.",
            dataCollected: "2. Data We Collect",
            mayCollect: "We may collect the following types of information:",
            listData: "Email, Username",
            howWeUsed: "3. How We Use Your Data",
            usedDataDesc: "Your data is used to provide and improve the Service, specifically for authentication and leaderboard tracking.",
            contactUs: "4. Contact Us",
            contactText: "If you have any questions about this Privacy Policy, please contact us at:",

            // Terms
            termsOfService: "TERMS OF SERVICE",
            lastUpdated: "Last Updated:",
            acceptance: "1. Acceptance of Terms",
            acceptanceDesc: "By accessing TRANSCENDANCE, you accept and agree to be bound by the terms of this agreement.",
            userConduct: "2. User Conduct",
            conductDesc: "You agree not to engage in prohibited activities: cheating, hacking, distributing spam.",
            disclaimer: "3. Disclaimer",
            disclaimerDesc: "The Service is provided on an 'AS IS' basis. We make no warranties regarding reliability.",
            governingLaw: "4. Governing Law",
            governingDesc: "These Terms shall be governed in accordance with applicable laws."
        }
    },
    // 3 = ESPAGNOL
    3: {
        defaultInfo: {
            id: "",
            title: "Sala de Arcade 3D",
            description: "Bienvenido a la sala de juegos virtual. Descubre nuestras máquinas interactivas.",
            image: "/assets/previews/room.jpg",
            param: "Ajustes",
            social: "Amigos",
            legal: "Aviso Legal",
            win: "victorias",
            lose: "fracaso",
            back: "Atrás",
            trans: "Trascendencia",
            noFriends: "No se agregan amigos",
            leave: "Salir de la máquina arcade",
            connectedAs: "Conéctate como",
            welcome: "Bienvenido",
            username: "nombre de usuario",
            enter: "ingresar",
            loading: "Cargando modelos",
            coin: "INSERTAR UNA MONEDA",
            CreateOrJoin: "(CREAR O UNIRSE A UN JUEGO)",
            create: "CREAR",
            join: "UNIRSE",
            error: "ERROR",
            state: "ESTADO",
            waiting: "ESPERA",
            online: "EN LÍNEA",
            descPong: "EL JUEGO DE PING PONG ORIGINAL",
            descBreakout: "DESTRUYE LOS LADRILLOS",
            descSpaceInvaders: "PROTEJAMOS LA TIERRA",
            workIn: "CONSTRUCCIÓN EN CURSO",
            laterCoin: "INSERTE UNA MONEDA MÁS TARDE...",
            alienLate: "LOS EXTRATERRESTRES LLEGAN TARDE",
            play: "JUGAR",
            running: "CORRER",
			loginOrEmail: "Login o email",
			email: "Email",
            passWord: "Contraseña",
            signOut: "Desconectar",
            newAccount: "NUEVA CUENTA",
            confirmPassword: "Confirmar Contraseña",
			confirmPasswordError: "Las contraseñas no coinciden",
			missingFields: "Campos faltantes",
			emailAlreadyExists: "Email ya existe",
			userAlreadyExists: "Usuario ya existe",
			operationFailed: "Error al realizar la operación",
            firstToFive: "PRIMERO A 5 GANA",
            useArrows: "USE THE UP AND DOWN ARROWS TO MOVE",

            // Privacy
            privacyPolicy: "Política de privacidad",
            effectiveDate: "Fecha de vigencia:",
            introduction: "1. Introducción",
            welcomeTo: "Bienvenido a TRANSCENDANCE. Respetamos su privacidad y protegemos sus datos personales.",
            dataCollected: "2. Datos que recopilamos",
            mayCollect: "Podemos recopilar los siguientes tipos de información:",
            listData: "Correo, nombre de usuario",
            howWeUsed: "3. Uso de sus datos",
            usedDataDesc: "Sus datos se utilizan para mejorar el Servicio, la autenticación y el seguimiento de puntuaciones.",
            contactUs: "4. Contáctenos",
            contactText: "Si tiene preguntas sobre esta política, contáctenos en:",

            // Terms
            termsOfService: "TÉRMINOS DE SERVICIO",
            lastUpdated: "Última actualización:",
            acceptance: "1. Aceptación de los términos",
            acceptanceDesc: "Al acceder a TRANSCENDANCE, acepta estar sujeto a los términos de este acuerdo.",
            userConduct: "2. Conducta del usuario",
            conductDesc: "Acepta no participar en actividades prohibidas: trampas, piratería, spam.",
            disclaimer: "3. Descargo de responsabilidad",
            disclaimerDesc: "El Servicio se proporciona 'TAL CUAL'. No ofrecemos garantías de fiabilidad.",
            governingLaw: "4. Ley aplicable",
            governingDesc: "Estos Términos se regirán de acuerdo con las leyes vigentes."
        }
    },
    // 4 = ALLEMAND
    4: {
        defaultInfo: {
            id: "",
            title: "3D-Spielhalle",
            description: "Willkommen in der virtuellen Spielhalle. Entdecken Sie unsere interaktiven Automaten.",
            image: "/assets/previews/room.jpg",
            param: "Einstellungen",
            social: "Freunde",
            legal: "Rechtliche Hinweise",
            win: "Siege",
            lose: "Niederlagen",
            back: "Zurück",
            trans: "Transzendenz",
            noFriends: "Keine Freunde hinzugefügt",
            leave: "Verlasse den Spielautomaten",
            connectedAs: "Verbinden als",
            welcome: "Willkommen",
            username: "Benutzername",
            enter: "eingeben",
            loading: "Laden von Modellen",
            coin: "MÜNZE EINWEICHEN",
            CreateOrJoin: "(SPIEL ERSTELLEN ODER BEITRETEN)",
            create: "ERSTELLEN",
            join: "VERBINDEN",
            error: "FEHLER",
            state: "ZUSTAND",
            waiting: "WARTEN",
            online: "VERBUNDEN",
            descPong: "DAS ORIGINAL-PING-PONG-SPIEL",
            descBreakout: "ZERSTÖRT DIE ZIEGEL",
            descSpaceInvaders: "SCHÜTZT DIE ERDE",
            workIn: "BAUARBEITEN IM LAUFENDEN",
            laterCoin: "WERFEN SIE SPÄTER EINE MÜNZE EIN...",
            alienLate: "DIE ALIENS SIND ZU SPÄT",
            play: "SPIELEN",
            running: "LÄUFT",
			loginOrEmail: "Login oder Email",
			email: "Email",
            passWord: "Passwort",
            signOut: "Abmelden",
            newAccount: "NEUES KONTO",
            confirmPassword: "Passwort bestätigen",
			confirmPasswordError: "Die Passwörter stimmen nicht überein",
			missingFields: "Fehlende Felder",
			emailAlreadyExists: "Email bereits existiert",
			userAlreadyExists: "Benutzer bereits existiert",
			operationFailed: "Fehler beim Ausführen der Operation",
            firstToFive: "WER ZUERST 5 HAT GEWINNT",
            useArrows: "BENUTZE DIE AUF- UND AB-PFEILEN ZUM BEWEGEN",

            // Privacy
            privacyPolicy: "Datenschutzrichtlinie",
            effectiveDate: "Datum des Inkrafttretens:",
            introduction: "1. Einführung",
            welcomeTo: "Willkommen bei TRANSCENDANCE. Wir respektieren Ihre Privatsphäre und schützen Ihre Daten.",
            dataCollected: "2. Erfasste Daten",
            mayCollect: "Wir erfassen möglicherweise folgende Informationen:",
            listData: "E-Mail, Benutzername",
            howWeUsed: "3. Verwendung Ihrer Daten",
            usedDataDesc: "Daten dienen der Bereitstellung des Dienstes, Authentifizierung und Ranglisten.",
            contactUs: "4. Kontaktieren Sie uns",
            contactText: "Bei Fragen zu dieser Richtlinie kontaktieren Sie uns bitte unter:",

            // Terms
            termsOfService: "NUTZUNGSBEDINGUNGEN",
            lastUpdated: "Letzte Aktualisierung:",
            acceptance: "1. Annahme der Bedingungen",
            acceptanceDesc: "Durch den Zugriff auf TRANSCENDANCE akzeptieren Sie diese Vereinbarung.",
            userConduct: "2. Benutzerverhalten",
            conductDesc: "Keine verbotenen Aktivitäten: Cheaten, Hacking, Spam.",
            disclaimer: "3. Haftungsausschluss",
            disclaimerDesc: "Der Dienst wird 'WIE BESEHEN' bereitgestellt. Keine Garantie auf Zuverlässigkeit.",
            governingLaw: "4. Geltendes Recht",
            governingDesc: "Diese Bedingungen unterliegen den geltenden Gesetzen."
        }
    }
};

export type LangKey = keyof typeof ALL_LANGUAGES;