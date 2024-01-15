Installation
===============


Git-Repos clonen
^^^^^^^^^^^^^^^^^

Verzeichnis für den Server erstellen:

.. code-block:: console

    mkdir /var/www


Setze Berechtigungen (auf root zurücksetzen nach Einrichtung):

.. code-block:: console

    sudo chown -R user:group /opt/janus
    sudo chown -R user:group /etc/nginx
    sudo chown -R user:group /var/www


Repos clonen:

.. code-block:: console

    cd /var/www
    git clone --branch master https://github.com/imesluh/relab-server.git server
    cd /var/www/server/app
    git clone --branch db_client https://github.com/imesluh/relab-database.git db_client
    cd /var/www/server
    git clone --branch db_server https://github.com/imesluh/relab-database.git db_server


Python venv konfigurieren
^^^^^^^^^^^^^^^^^^^^^^^^^
Virtual Environment erstellen:

.. code-block:: console

    cd /var/www/server
    python3 -m venv venv
    source venv/bin activate

pip Pakete installieren:

.. code-block:: console

   (.venv) $ pip install -r requirements.txt


Sämtliche nachfolgende Schritte mit Nutzung von Python-Befehlen, werden unter Nutzung der venv ausgeführt.


Datenbank einrichten
^^^^^^^^^^^^^^^^^^^^

MySQL öffnen:

.. code-block:: console
    sudo mysql

Neuen Benutzer "relab" anlegen (verwendetes Passwort später in Textfile schreiben!):

.. code-block:: mysql
    :name: mysql_credentials

    CREATE USER 'relab'@'%' IDENTIFIED BY 'YOUR_PASSWORD';
    GRANT ALL ON *.* TO 'relab'@'%';
    FLUSH PRIVILEGES;
    exit

Datenbanken für die Labore erstellen (individuelle Konfiguration siehe relab-database):

.. code-block:: console

    /var/www/server/db_server
    python3 create_db.py

Datenbanken mit Usern aus .csv Datei beschreiben:

.. code-block:: console

    python3 fill_db.py --lecture MechSys --filepath /path/to/YOUR_USERS.csv --labs 5 -ms 10 -ms 10 -ms 10 -ms 10 -ms 1 --try 7 --solutions 7 --adminMail YOUR_ADMIN@MAIL-ADRESS.de


Passwörter konfigurieren
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Nach Erstellung der Datenbank: In :ref:`diesem Schritt<mysql_credentials>` verwendetes Passwort in Textdatei schreiben:

.. code-block:: console

    cd /var/www/server
    echo <YOUR_PASSWORD> >> password_db.txt



Konfiguration Videostream (Janus)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Config files kopieren:

.. code-block:: console

    cd /var/www/server/video
    rm /opt/janus/etc/janus/*
    cp janus.jcfg janus.plugin.streaming.jcfg janus.transport.http.jcfg /opt/janus/etc/janus

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


Netzwerkadressen konfigurieren
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- Python:

  - IP-Adresse Hauptserver (Verbindung zur Datenbank) in app/booking.py
  - IP-Adresse Hauptserver (Verbindung zur Datenbank) in app/main.py


Konfiguration Webserver (nginx)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Konfiguration (``/var/www/server/server/nginx_proxy.conf``) anpassen:

- Pfade für jedes Labor anpassen (``location /YOUR_LAB/../../{}``)
- Adressen TCP-Sockets (siehe uwsgi config) für jedes Labor anpassen (z.B. ``uwsgi_pass YOUR_UNIX/TCP_SOCKET;``)

Konfigurationen in nginx Verzeichnis kopieren:

.. code-block:: console

    cp /var/www/server/server/nginx_proxy.conf /etc/nginx/conf.d
    cp /var/www/server/server/uwsgi_params /etc/nginxcd config

Serverzertifikat (SSL/TLS-Zertifikat)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- Informationen zur Beantragung beim zuständigen Hochschulrechenzentrum einholen
- Zertifkat unter ``/etc/nginx/ssl`` ablegen

    - Benennung von Zertifikat und Key in diesem Repo angenommen als ``cert_full_chain.pem`` und ``server-key_nopass.pem``
    - alternativ Dateinamen anpassen in ``nginx_proxy.conf``


Externe Javascript Bibliothek herunterladen
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: console

    cd /var/www/server/static/js/lib
    git clone -b 2.7.0 https://github.com/mathjax/MathJax.git MathJax-2.7.0


Zugangsdaten versenden
^^^^^^^^^^^^^^^^^^^^^^^

Nach vollständiger Einrichtung Zugangsdaten an Teilnehmer versenden:

.. code-block: console

    cd /var/www/server/db_server
    python3 password_mails.py --lecture YOUR_LAB
