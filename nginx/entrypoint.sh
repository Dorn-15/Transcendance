#!/bin/sh

# Génération dynamique du fichier .htpasswd pour Prometheus
if [ -n "$PROMETHEUS_ADMIN_USER" ] && [ -n "$PROMETHEUS_ADMIN_PASSWORD" ]; then
    echo "Génération de .htpasswd-prometheus pour l'utilisateur : $PROMETHEUS_ADMIN_USER"
    htpasswd -bc /etc/nginx/.htpasswd-prometheus "$PROMETHEUS_ADMIN_USER" "$PROMETHEUS_ADMIN_PASSWORD"
else
    echo "Attention : PROMETHEUS_ADMIN_USER ou PROMETHEUS_ADMIN_PASSWORD non défini."
    # On crée un fichier vide pour éviter que Nginx ne plante au démarrage s'il est référencé
    touch /etc/nginx/.htpasswd-prometheus
fi

# Génération dynamique du fichier .htpasswd pour Alertmanager
if [ -n "$ALERTMANAGER_ADMIN_USER" ] && [ -n "$ALERTMANAGER_ADMIN_PASSWORD" ]; then
    echo "Génération de .htpasswd-alertmanager pour l'utilisateur : $ALERTMANAGER_ADMIN_USER"
    htpasswd -bc /etc/nginx/.htpasswd-alertmanager "$ALERTMANAGER_ADMIN_USER" "$ALERTMANAGER_ADMIN_PASSWORD"
else
    echo "Attention : ALERTMANAGER_ADMIN_USER ou ALERTMANAGER_ADMIN_PASSWORD non défini."
    # On crée un fichier vide pour éviter que Nginx ne plante au démarrage s'il est référencé
    touch /etc/nginx/.htpasswd-alertmanager
fi

# Génération dynamique du fichier .htpasswd pour Grafana
if [ -n "$GRAFANA_ADMIN_USER" ] && [ -n "$GRAFANA_ADMIN_PASSWORD" ]; then
    echo "Génération de .htpasswd-grafana pour l'utilisateur : $GRAFANA_ADMIN_USER"
    htpasswd -bc /etc/nginx/.htpasswd-grafana "$GRAFANA_ADMIN_USER" "$GRAFANA_ADMIN_PASSWORD"
else
    echo "Attention : GRAFANA_ADMIN_USER ou GRAFANA_ADMIN_PASSWORD non défini."
    # On crée un fichier vide pour éviter que Nginx ne plante au démarrage s'il est référencé
    touch /etc/nginx/.htpasswd-grafana
fi

# On appelle l'entrypoint d'origine de l'image Nginx 
# (celui qui s'occupe de remplacer les variables dans ton nginx.conf)
exec /docker-entrypoint.sh "$@"

