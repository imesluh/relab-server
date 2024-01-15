Requirements
===============

- Ubuntu (tested with 20.04)
- apt packages:

  - python3 (tested with 3.8.10)
  - python3-venv
  - python3-pip
  - janus (tested with 0.11.7)
  - nginx (tested with 1.18.0)
  - uWSGI (tested with 2.0.19.1): Anwendungsserver für Webanwendungen
  - mysql (tested with 8.0.35): Datenbank-Service


Python3
^^^^^^^^
Installation Python3, pip und Python Virtual Environment:

.. code-block:: console

    sudo apt update
    sudo apt install python3.8.10 python3-pip python3-venv


uWSGI
^^^^^^^
Installation und Konfiguration der Bibliothek für den Anwendungsserver uwsgi

.. code-block:: console

    UWSGI_PROFILE_OVERRIDE=ssl=true
    pip install uwsgi==2.0.19.1 -I --no-cache-dir
    # Verknüpfung, falls nötig, manuell einrichten
    sudo ln –s ~/.local/bin/uwsgi /usr/bin/uwsgi


Webserver nginx
^^^^^^^^^^^^^^^
Installation und Einrichtung des nginx Webservers:

.. code-block:: console

    sudo apt-get install nginx=1.18.0-0ubuntu1.4


VideoStream
^^^^^^^^^^^^^
**Video for Linux installieren:**

.. code-block:: console

    sudo apt install v4l-utils

**Janus installieren:**

.. code-block:: console

    sudo apt-get install libmicrohttpd-dev libjansson-dev libssl-dev libsofia-sip-ua-dev libglib2.0-dev libopus-dev libogg-dev libcurl4-openssl-dev liblua5.3-dev libconfig-dev pkg-config gengetopt libtool automake meson git


.. code-block:: console

    cd ~/Downloads
    wget https://github.com/cisco/libsrtp/archive/v2.3.0.tar.gz
    tar xfv v2.3.0.tar.gz
    cd libsrtp-2.3.0
    ./configure --prefix=/usr --enable-openssl
    make shared_library && sudo make install


.. code-block:: console

    sudo apt-get remove libnice-dev
    cd ~/Downloads
    git clone https://gitlab.freedesktop.org/libnice/libnice
    cd libnice
    meson --prefix=/usr build && ninja -C build && sudo ninja -C build install


.. code-block:: console

    cd ~/Downloads
    git clone https://github.com/meetecho/janus-gateway.git
    cd janus-gateway
    sh autogen.sh
    ./configure --disable-aes-gcm --disable-all-plugins --disable-all-transports --disable-all-handlers --enable-plugin-streaming --enable-rest --enable-libsrtp2 --prefix=/opt/janus
    make
    sudo make install


Datenbank (MySQL)
^^^^^^^^^^^^

MySQL installieren:

.. code-block:: console

    sudo apt install mysql-server

Prüfen, ob der Service läuft:

.. code-block:: console

    sudo systemctl start mysql.service

MySQL öffnen und Authentifizierungsmethode ändern:

.. code-block:: console

    sudo mysql
    mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
    mysql> exit

Secure Installation:

.. code-block:: console

    sudo mysql_secure_installation

Authentifizierung zurück auf Default:

.. code-block:: console

    mysql -u root -p
    mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH auth_socket;
    exit


Dateiübertragungen
^^^^^^^^^^^^^^^^^^^^^^^

Python-Library zur Nutzung von .htpasswd Dateien:

.. code-block:: console

    cd ~/Downloads
    git clone https://gist.github.com/peterwillcn/0918dd36dc1244830f9ac419bf3d226b htpasswd
    sudo cp htpasswd/htpasswd.py /usr/local/bin/
    sudo rm -fr htpasswd
    sudo chmod u+x /usr/local/bin/htpasswd.py
