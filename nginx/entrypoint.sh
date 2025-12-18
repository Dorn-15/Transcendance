#!/bin/sh

# Génération dynamique du fichier .htpasswd pour le monitoring
if [ -n "$MONITORING_USER" ] && [ -n "$MONITORING_PASSWORD" ]; then
    echo "Génération de .htpasswd pour l'utilisateur : $MONITORING_USER"
    htpasswd -bc /etc/nginx/.htpasswd "$MONITORING_USER" "$MONITORING_PASSWORD"
else
    echo "Attention : MONITORING_USER ou MONITORING_PASSWORD non défini."
    # On crée un fichier vide pour éviter que Nginx ne plante au démarrage s'il est référencé
    touch /etc/nginx/.htpasswd
fi

# On appelle l'entrypoint d'origine de l'image Nginx 
# (celui qui s'occupe de remplacer les variables dans ton nginx.conf)
exec /docker-entrypoint.sh "$@"

