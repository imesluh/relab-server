"""
Auslesen von Passwörtern und internen IP-Configs aus lokalen Textdateien für Python-Anwendungen.
"""
import subprocess
def password_sql():
    with open("/var/www/server/password_db.txt") as f:
        lines = f.readlines()
        password = lines[0].strip()
        return password

def password_mail():
    with open("/var/www/server/password_mail.txt") as f:
        lines = f.readlines()
        password = lines[0].strip()
        return password

def password_db_defaultUsers():
    with open("/var/www/server/password_db_defaultUsers.txt") as f:
        lines = f.readlines()
        password = lines[0].strip()
        return password

def get_ip(varname):
    #CMD = 'echo $(source /var/www/server/GET_IP_CONFIG.sh; echo $%s)' % varname
    CMD = 'echo $(. /var/www/server/GET_IP_CONFIG.sh; echo $%s)' % varname
    p = subprocess.Popen(CMD, stdout=subprocess.PIPE, shell=True, executable='/bin/bash')
    str_p = p.stdout.readlines()[0].strip().decode('utf-8')
    return str_p

