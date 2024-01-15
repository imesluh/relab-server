##### Prozesse Hauptserver
date
sleep 180 #80 # vollstaendigen boot abwarten
#
# Befehle zwischen den '!' als relab ausfuehren
PSSWRD="$(cat /home/relab/passwd.txt)"
echo "$PSSWRD"
su - relab <<!
"$PSSWRD"
whoami
# firewall starten
#screen -d -m /var/www/server/server/autostart/as_firewall.sh
#
# janus starten
screen -d -m /var/www/server/server/autostart/as_janus.sh
#
# nginx starten
screen -d -m /var/www/server/server/autostart/as_nginx.sh
sleep 30
#
# uwsgi (server) starten
screen -d -m /var/www/server/server/autostart/as_uwsgi_server.sh
#
#
#
##### Prozesse Application Server Mechsys
# Videostream starten
screen -d -m /var/www/server/server/autostart/as_video.sh
# uwsgi (app-server) starten
screen -d -m /var/www/server/server/autostart/as_uwsgi_mechsys.sh
!
whoami
