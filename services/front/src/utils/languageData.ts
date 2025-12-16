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
            leave: "Quitter la borne"
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
            leave: "Exit the arcade"
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
            leave: "Salir de la máquina arcade"
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
            leave: "Verlasse den Spielautomaten"

  
        }
    }
};

export type LangKey = keyof typeof ALL_LANGUAGES;