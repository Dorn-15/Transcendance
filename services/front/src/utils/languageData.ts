// languageChoice.ts

export interface GameInfo {
    id: string;
    title: string;
    description: string;
    image: string;
    param: string;
    social: string;
    stat: string;
}

// Structure qui contient : une liste de jeux ET les infos par défaut pour chaque langue
export interface LanguageData {
    defaultInfo: GameInfo;
    gamesList: Record<string, GameInfo>;
}

// Notre base de données multilingue
export const ALL_LANGUAGES: Record<number, LanguageData> = {
    // 1 = FRANÇAIS
    1: {
        defaultInfo: {
            id: "",
            title: "Arcade Room 3D",
            description: "Bienvenue dans la salle d'arcade virtuelle. Découvrez nos bornes interactives.",
            image: "/assets/previews/room.jpg",
            param: "Paramètres",
            social: "Social",
            stat: "Statistiques"
        },
        gamesList: {
            "pong": {
                id: "pong",
                title: "Pong 3D Arcade",
                description: "Le classique absolu. Affrontez l'IA dans ce duel rétro remastérisé.",
                image: "/assets/previews/pong.jpg",
                param: "",
                social: "Social",
                stat: "Stats",
            },
            "breakout": {
                id: "breakout",
                title: "Super Breakout",
                description: "Cassez toutes les briques ! Un défi d'adresse et de réflexes.",
                image: "/assets/previews/breakout.jpg",
                param: "",
                social: "Social",
                stat: "Stats",
            },
            "space-invaders": {
                id: "space-invaders",
                title: "Space Invaders",
                description: "Défendez la terre contre l'invasion alien.",
                image: "/assets/previews/space.jpg",
                param: "",
                social: "Social",
                stat: "Stats",
            }
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
            social: "Social",
            stat: "Statistics"
        },
        gamesList: {
            "pong": {
                id: "pong",
                title: "Pong 3D Arcade",
                description: "The absolute classic. Face the AI in this remastered retro duel.",
                image: "/assets/previews/pong.jpg",
                param: "",
                social: "Social",
                stat: "Stats",
            },
            "breakout": {
                id: "breakout",
                title: "Super Breakout",
                description: "Break all the bricks! A challenge of skill and reflexes.",
                image: "/assets/previews/breakout.jpg",
                param: "",
                social: "Social",
                stat: "Stats",
            },
            "space-invaders": {
                id: "space-invaders",
                title: "Space Invaders",
                description: "Defend the Earth against the alien invasion.",
                image: "/assets/previews/space.jpg",
                param: "",
                social: "Social",
                stat: "Stats",
            }
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
            social: "Social",
            stat: "Estadísticas"
        },
        gamesList: {
            "pong": {
                id: "pong",
                title: "Pong 3D Arcade",
                description: "El clásico absoluto. Enfréntate a la IA en este duelo retro remasterizado.",
                image: "/assets/previews/pong.jpg",
                param: "",
                social: "Social",
                stat: "Estad.",
            },
            "breakout": {
                id: "breakout",
                title: "Super Breakout",
                description: "¡Rompe todos los ladrillos! Un desafío de habilidad y reflejos.",
                image: "/assets/previews/breakout.jpg",
                param: "",
                social: "Social",
                stat: "Estad.",
            },
            "space-invaders": {
                id: "space-invaders",
                title: "Space Invaders",
                description: "Defiende la tierra contra la invasión alienígena.",
                image: "/assets/previews/space.jpg",
                param: "",
                social: "Social",
                stat: "Estad.",
            }
        }
    }
};

export type LangKey = keyof typeof ALL_LANGUAGES;