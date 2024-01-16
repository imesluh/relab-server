# ReLab Server
-------------

Dieses Repository enthält den (Web-) Hauptserver für das Remote Laboratory "ReLab".

---
## Inhalte
- [Beschreibung](#beschreibung)
- [Verwendetes Setup](#verwendetes-setup)
- [Requirements](#requirements)
- [Verwendung](#verwendung)
- [Verzeichnisse](#verzeichnisse)
- [Read The Docs Anleitung](#read-the-docs-anleitung)

---



## Beschreibung

**Allgmemeines**

Ein Remote Laboratory (ReLab) dient dazu echte Prüfstände zum Fernzugriff zur Verfügung zu stellen. Am Institut für Mechatronische Systeme wird vorlesungsbegleitend zu den Veranstaltungen Mechatronische Systeme, Robotik I und Robotik II ein ReLab ergänzend zur freiwilligen Bearbeitung angeboten. Der Zugriff erfolgt dabei über eine eigens eingerichtete Homepage (welche in diesem Fall nur aus dem Uni-Netz heraus erreichbar ist): https://relab.imes.uni-hannover.de/.
Die Umsetzung ist examplarisch für die Lehrveranstaltung *Robotik I* in diesem [Video](https://www.youtube.com/watch?v=rsq0pxJQl0s/) vorgestellt.

Das Remote Laboratory einer Lehrveranstaltung umfasst in den veröffentlichten Beispielen 4 Laborversuche, die aufeinander thematisch aufbauen. Es können die Labore jedoch in beliebiger Reihenfolge absolviert werden. Jeder Laborversuch besteht aus Aufgaben und ggf. einer „Challenge“. Letztere wird freigeschaltet, sobald die Aufgaben vollständig und richtig bearbeitet sind. In dieser bekommen die Studierenden die Möglichkeit für ihre Lösungen, deren Güte individuell bewertet und bepunktet wird, Zusatzpunkte zu erreichen, um im Ranking (auf der Hauptseite abgebildet) aufzusteigen. In der Regel werden je gelöster Aufgabe z.B. 500 Punkte vergeben und in der Challenge variable, erfolgsabhängige Punktzahlen.

Der allgemeine Ablauf eines Versuchs besteht aus:

1. Durchlesen der Anleitung,
2.  ggf. Vorbereitung des Laborversuchs,
3.  der Buchung des Versuchsstandes,
4.  dem Durchführen des Versuchs und Übermittlung aller notwendigen Daten,
5.  und ggf. dem Lösen bestimmter Aufgaben unter Verwendung von Versuchsdaten.

Abbild der Interfaces (a) Landing und Admin page (b) Startseite mit User-Ranking (c) Buchungsseite (d) Control Interface während des Laborversuchs:

![alt text](docs/Interfaces.svg)


**Software**

Das Remote Laboratory verteilt sich über mehrere Server. Der Hauptserver ist der zentrale Anlaufpunkt und stellt alle Inhalte, die nicht direkt den Prüfstand betreffen zur Verfügung: Internetseiten, Authentifizierung, Webserver und Routing, Firewall, janus-gateway (Videoserver), MySQL Nutzerdantebank, Firewall.
Daneben wird für jedes ReLab einen Application-Server erstellt, welcher die Kommunikation mit dem Prüfstand übernimmt.

Visualisierung der Kommunikationsstruktur:

![alt text](docs/Relab_Struktur.svg)


Auf den Applicationservern erfolgen nur die direkten Interaktionen mit dem Versuchsstand (Speicherung von Messdaten, Starten von Bewegungen, Überprüfung von Lösungen) sowie die Erzeugung des RTP-Video-Streams (dieser wird anschließend an janus-gateway gesendet. Die Kommunikation zwischen dem Hauptserver und den Application-Servern teilt sich in die drei Bereiche:

- Routing (Weiterleitung von nginx),
- VideoStream
- und lesenden sowie schreibenden Zugriff auf die MySQL-Nutzerdatenbank auf dem Hauptserver.

Die Application-Server können auf dem gleichen PC wie der Hauptserver laufen (Beispiel: Labor Mechatronische Systeme relab-appserver-mechsys), oder z.B. im Fall von räumlich getrennten Versuchsständen auf einem separaten PC und über das interne Netzwerk kommunizieren (Beispiel: Labor Robotik I relab-appserver-robotiki).

Die Repositories sind als Vorlage zur Erstellung eigener Labore zu verstehen. Wichtige Unterscheidungsmerkmale sind

- die Ausführung auf dem PC des Hauptservers (Mechatronische Systeme) oder auf einem separaten PC (Robotik I, Robotik II),
- die Kommunikation zum Prüfstand via UDP (Mechatronische Systeme, Robotik II) oder OPC-UA,
- sowie zur Ansteuerung des Prüfstands die Nutzung einer Industriesteuerung (Robotik I) oder eines Target-PCs mit Simulink Real-Time Kernel (Mechatronische Systeme, Robotik II).


## Verwendetes Setup

##### Software

- Webserver: LEMP stack (Linux, nginx, MySQL, Python)

  - webserver engine: nginx
  - Webframefork: flask
  - template engine: jinja2
  - Datenbank: MySQL
- Videostream: Janus WebRTC Server

##### Hardware

- PC Dell Optiplex 7040


_______________________________________________
## Requirements

- Ubuntu (tested with 20.04)
- apt packages:
  - python3 (tested with 3.8.10)
  - python3-venv
  - python3-pip
  - janus (tested with 0.11.7)
  - nginx (tested with 1.18.0)
  - uWSGI (tested with 2.0.19.1): Anwendungsserver für Webanwendungen
  - mysql (tested with 8.0.35): Datenbank-Service


##### Python3
Installation Python3, pip und Python Virtual Environment:
```sh
sudo apt update
sudo apt install python3.8.10 python3-pip python3-venv
```

##### uWSGI
Installation und Konfiguration der Bibliothek für den Anwendungsserver uwsgi

```sh
UWSGI_PROFILE_OVERRIDE=ssl=true
pip install uwsgi==2.0.19.1 -I --no-cache-dir
# Verknüpfung, falls nötig, manuell einrichten
sudo ln –s ~/.local/bin/uwsgi /usr/bin/uwsgi    
```

##### Webserver nginx
Installation und Einrichtung des nginx Webservers:

```sh
sudo apt-get install nginx=1.18.0-0ubuntu1.4
```

##### VideoStream

**Video for Linux installieren:**

```sh
sudo apt install v4l-utils
```

**Janus installieren:**

<details><summary><b>Einzelheiten anzeigen</b></summary>

```sh
sudo apt-get install libmicrohttpd-dev libjansson-dev libssl-dev libsofia-sip-ua-dev libglib2.0-dev libopus-dev libogg-dev libcurl4-openssl-dev liblua5.3-dev libconfig-dev pkg-config gengetopt libtool automake meson git
```

```sh
cd ~/Downloads
wget https://github.com/cisco/libsrtp/archive/v2.3.0.tar.gz
tar xfv v2.3.0.tar.gz
cd libsrtp-2.3.0
./configure --prefix=/usr --enable-openssl
make shared_library && sudo make install
```

```sh
sudo apt-get remove libnice-dev
cd ~/Downloads
git clone https://gitlab.freedesktop.org/libnice/libnice
cd libnice
meson --prefix=/usr build && ninja -C build && sudo ninja -C build install
```

```sh
cd ~/Downloads
git clone https://github.com/meetecho/janus-gateway.git
cd janus-gateway
sh autogen.sh
./configure --disable-aes-gcm --disable-all-plugins --disable-all-transports --disable-all-handlers --enable-plugin-streaming --enable-rest --enable-libsrtp2 --prefix=/opt/janus
make
sudo make install
```
</details>


##### Datenbank (MySQL)

<details><summary><b>Einzelheiten anzeigen</b></summary>

MySQL installieren:

```sh
sudo apt install mysql-server
```

Prüfen, ob der Service läuft:

```sh
sudo systemctl start mysql.service
```

MySQL öffnen und Authentifizierungsmethode ändern:

```sh
sudo mysql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
mysql> exit
```

Secure Installation:

```sh
sudo mysql_secure_installation
```

Authentifizierung zurück auf Default:

```sh
mysql -u root -p
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH auth_socket;
exit
```
</details>

##### Dateiübertragungen

Python-Library zur Nutzung von .htpasswd Dateien:

```sh
cd ~/Downloads
git clone https://gist.github.com/peterwillcn/0918dd36dc1244830f9ac419bf3d226b htpasswd
sudo cp htpasswd/htpasswd.py /usr/local/bin/
sudo rm -fr htpasswd
sudo chmod u+x /usr/local/bin/htpasswd.py
```


## Installation
##### Git-Repos clonen

Verzeichnis für den Server erstellen:
```sh
mkdir /var/www
```

Setze Berechtigungen (auf root zurücksetzen nach Einrichtung):
```sh
sudo chown -R user:group /opt/janus
sudo chown -R user:group /etc/nginx
sudo chown -R user:group /var/www
```

Repos clonen:
```sh
cd /var/www
git clone --branch master https://github.com/imesluh/relab-server.git server
cd /var/www/server/app
git clone --branch db_client https://github.com/imesluh/relab-database.git db_client
cd /var/www/server
git clone --branch db_server https://github.com/imesluh/relab-database.git db_server
```

##### Python venv konfigurieren

Virtual Environment erstellen:
```sh
cd /var/www/server
python3 -m venv venv
source venv/bin activate
```

pip Pakete installieren:
```sh
(.venv) $ pip install -r requirements.txt
```

Sämtliche nachfolgende Schritte mit Nutzung von Python-Befehlen, werden unter Nutzung dieser venv ausgeführt.


##### Datenbank einrichten

<details><summary><b>Einzelheiten anzeigen</b></summary>

MySQL öffnen:
```sh
sudo mysql
```

Neuen Benutzer "relab" anlegen (verwendetes Passwort später in Textfile schreiben!):
```sh
CREATE USER 'relab'@'%' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL ON *.* TO 'relab'@'%';
FLUSH PRIVILEGES;
exit
```

Datenbanken für die Labore erstellen (individuelle Konfiguration siehe relab-database):
```sh
/var/www/server/db_server
python3 create_db.py
```

Datenbanken mit Usern aus .csv Datei beschreiben:
```sh
python3 fill_db.py --lecture MechSys --filepath /path/to/YOUR_USERS.csv --labs 5 -ms 10 -ms 10 -ms 10 -ms 10 -ms 1 --try 7 --solutions 7 --adminMail YOUR_ADMIN@MAIL-ADRESS.de
```

</details>

##### Passwörter konfigurieren

Nach Erstellung der Datenbank: In [diesem Schritt](#datenbank-einrichten) verwendetes Passwort in Textdatei schreiben:
```sh
cd /var/www/server
echo <YOUR_PASSWORD> >> password_db.txt
```

##### Konfiguration Videostream (Janus)

Config files kopieren:
```sh
cd /var/www/server/video
rm /opt/janus/etc/janus/*
cp janus.jcfg janus.plugin.streaming.jcfg janus.transport.http.jcfg /opt/janus/etc/janus
```

Ggf. Anpassungen der Konfigurationen:

- janus.jcfg
    - Pfad zum Zertifikat (Feld *certificates*). Kann z.B. das Serverzertifikat sein, kann aber auch selfsigned sein.
    - Port range für RTP (Feld *media*)
- janus.plugin.streaming.jcfg
    - Definition aller Streams (verschiedene Labore, Kameras und Auflösungen): IDs, Ports, ect.
    - Ports müssen an die in den jeweiligen Application-Server definierten angepasst werden (file ``/var/www/<appserver>/video/pipeline_vp8.sh``)
    - optionale Änderungen: Videocodec
- janus.transport.http.jcfg
    - Transport Settings (http/https, port, ect., Feld *general*)


##### Netzwerkadressen konfigurieren

- Python:
  - IP-Adresse Hauptserver (Verbindung zur Datenbank) in app/booking.py
  - IP-Adresse Hauptserver (Verbindung zur Datenbank) in app/main.py


##### Konfiguration Webserver (nginx)

Konfiguration (``/var/www/server/server/nginx_proxy.conf``) anpassen:

- Pfade für jedes Labor anpassen (``location /YOUR_LAB/../../{}``)
- Adressen TCP-Sockets (siehe uwsgi config) für jedes Labor anpassen (z.B. ``uwsgi_pass YOUR_UNIX/TCP_SOCKET;``)

Konfigurationen in nginx Verzeichnis kopieren:
```sh
cp /var/www/server/server/nginx_proxy.conf /etc/nginx/conf.d
cp /var/www/server/server/uwsgi_params /etc/nginxcd config
```

##### Serverzertifikat (SSL/TLS-Zertifikat)

- Informationen zur Beantragung beim zuständigen Hochschulrechenzentrum einholen
- Zertifkat unter ``/etc/nginx/ssl`` ablegen
    - Benennung von Zertifikat und Key in diesem Repo angenommen als ``cert_full_chain.pem`` und ``server-key_nopass.pem``
    - alternativ Dateinamen anpassen in ``nginx_proxy.conf``


##### Externe Javascript Bibliothek herunterladen

```sh
cd /var/www/server/static/js/lib
git clone -b 2.7.0 https://github.com/mathjax/MathJax.git MathJax-2.7.0
```

##### Zugangsdaten versenden

Nach vollständiger Einrichtung Zugangsdaten an Teilnehmer versenden:
```sh
cd /var/www/server/db_server
python3 password_mails.py --lecture YOUR_LAB
```

## Verwendung
Anwendungen in verschiedenen Terminals (oder Alternativen nutzen, z.B. [Terminator](https://wiki.ubuntuusers.de/Terminator/))

1. Firewall starten
```sh
sudo sh /var/www/server/firewall.sh
```

2. Janus (Transport Videostream) starten
```sh
cd /opt/janus/bin
./janus
```

3. Nginx (Web-Server) starten
```sh
sudo /etc/init.d/nginx start
```
Neustart kann mit sudo ``restart`` erfolgen

4. uwsgi Anwendungen (Hauptserver) starten
```sh
cd /var/www/server/
uwsgi --ini uwsgi_relab.ini
```

5. Application-Server starten

6. Bei Bedarf Admin page (für Zugriff auf die Datenbank) starten
```sh
python3 /var/www/server/db_server/admin_page.py
```
Zugriff über kann über die URL https://relab.imes.uni-hannover.de/YOUR_LAB/rest/admin/ und Benutzer imesAdmin erfolgen.


## Verzeichnisse

Die Verzeichnisstruktur sollte nach vollständiger Einrichtung wie folgt aussehen:
```
    /var/www/server
    ├── app                   # Python Hauptanwendungen
    │   ├── config
    │   ├── db_client         # Verbindung mit Datenbank nach User input
    │   └── templates         # html templates
    ├── db_server             # manuelle, serverseitige DB Funktionen
    ├── docs
    ├── server                # Webserver Configs
    │   └── autostart
    ├── static                # vom Webserer bereitgestellte, statische Dateien
    │   ├── css
    │   ├── files
    │   ├── fonts
    │   ├── html
    │   ├── img
    │   └── js
    ├── vassals               # Configs uwsgi vassals
    ├── venv
    └── video                 # Videostream
```

## Read The Docs Anleitung

Nach Durchführung aller oben genannten Schritte kann eine html Read The Docs Anleitung mit sphinx erstellt werden. Die venv muss aktiv sein.
```sh
cd docs
make html
```

Die Anleitung kann über die Datei index.html in einem beliebigen Browser geöffnet werden.
