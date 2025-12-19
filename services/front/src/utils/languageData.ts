// languageChoice.ts

export interface GameInfo {
    id: string;
    title: string;
    description: string;
    image: string;
    param: string;
    social: string;
    stat: string;
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
            param: "Paramètres",
            social: "Amis",
            stat: "Statistiques",
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
            play: "JOUER"
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
            stat: "Statistics",
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
            play: "PLAY"
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
            stat: "Estadísticas",
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
            play: "JUGAR"
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
            stat: "Statistiken",
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
            play: "SPIELEN"
        }
    }
};

export type LangKey = keyof typeof ALL_LANGUAGES;