### kill uwsgi processes of server
uwsgi --stop /tmp/uwsgi_main.pid
uwsgi --stop /tmp/uwsgi_booking.pid
#
#
### kill uwsgi processes of application server (mechsys)
{ # try
uwsgi --stop /tmp/uwsgi_mechsys_main.pid
} || { # catch
echo "no file uwsgi_mechsys_main.pid"
}
{ # try
uwsgi --stop /tmp/uwsgi_mechsys_booking.pid
} || { # catch
echo "no file uwsgi_mechsys_booking.pid"
}
{ # try
uwsgi --stop /tmp/uwsgi_mechsys_solution.pid
} || { # catch
echo "no file uwsgi_mechsys_solution.pid"
}
{ # try
uwsgi --stop /tmp/uwsgi_mechsys_pass.pid
} || { # catch
echo "no file uwsgi_mechsys_pass.pid"
}
