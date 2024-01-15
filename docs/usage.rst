Verwendung
===============

Anwendungen in verschiedenen Terminals (oder Alternativen nutzen, z.B. `Terminator <https://wiki.ubuntuusers.de/Terminator/>`_)

1. Firewall starten

.. code-block:: console

    sudo sh /var/www/server/firewall.sh


2. Janus (Transport Videostream) starten

.. code-block:: console

    cd /opt/janus/bin
    ./janus

3. Nginx (Web-Server) starten

.. code-block:: console

    sudo /etc/init.d/nginx start

Neustart kann mit sudo ``restart`` erfolgen


4. uwsgi Anwendungen (Hauptserver) starten

.. code-block:: console

    cd /var/www/server/
    uwsgi --ini uwsgi_relab.ini

5. Application-Server starten

|
6. Bei Bedarf Admin page (für Zugriff auf die Datenbank) starten

.. code-block:: console

    python3 /var/www/server/db_server/admin_page.py

Zugriff über kann über die URL https://relab.imes.uni-hannover.de/YOUR_LAB/rest/admin/ und Benutzer imesAdmin erfolgen.
