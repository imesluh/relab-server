### kill uwsgi processes of server
uwsgi --reload /tmp/uwsgi_main.pid
uwsgi --reload /tmp/uwsgi_booking.pid
#
#
### kill uwsgi processes of application server (mechsys)
{ # try
uwsgi --reload /tmp/uwsgi_mechsys_main.pid
} || { # catch
echo "no file uwsgi_mechsys_main.pid"
}
{ # try
uwsgi --reload /tmp/uwsgi_mechsys_booking.pid
} || { # catch
echo "no file uwsgi_mechsys_booking.pid"
}
{ # try
uwsgi --reload /tmp/uwsgi_mechsys_solution.pid
} || { # catch
echo "no file uwsgi_mechsys_solution.pid"
}
{ # try
uwsgi --reload /tmp/uwsgi_mechsys_pass.pid
} || { # catch
echo "no file uwsgi_mechsys_pass.pid"
}
