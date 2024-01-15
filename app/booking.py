# -*- coding: utf-8 -*-
import gevent
from gevent import monkey
monkey.patch_all()
from flask import (
    Flask,
    request,
    jsonify
)
import os
#from flask_uwsgi_websocket import GeventWebSocket

import datetime

import json
from db_client.database_fcn import connection
import get_passwords as get_pw

class Event:
    def __init__(self, ID, Title, Start, End, Edit, Color):
        self.ID = ID
        self.Title = Title
        self.Start = Start
        self.End = End
        self.Edit = Edit
        self.Color = Color

basedir = os.path.abspath(os.path.dirname(__file__))
users_mechsys = {}
ws_connected_mechsys={}
ws_blocked_mechsys = {}
users_robotiki = {}
ws_connected_robotiki={}
ws_blocked_robotiki = {}
users_robotikii = {}
ws_connected_robotikii = {}
ws_blocked_robotikii = {}

color_foreign='#101010'
color_own='#3CB371'

uwsgi_app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__)) ## Pfad der Website auf dem Server
#ws = GeventWebSocket(uwsgi_app)
uwsgi_app.secret_key = os.urandom(24)

pw_sql = get_pw.password_sql()
ip_server = get_pw.get_ip('SERVER_IP')
conn_mechsys = connection("mysql+pymysql://relab:" + pw_sql + "@" + ip_server + ":3306/MechSys")
conn_robotikI = connection("mysql+pymysql://relab:" + pw_sql + "@" + ip_server + ":3306/RobotikI")
conn_robotikII = connection("mysql+pymysql://relab:" + pw_sql + "@" + ip_server + ":3306/RobotikII")

######### Booking MechSys ############################################
config_path_mechsys = basedir + '/config/MechSys/'
with open(config_path_mechsys + 'config_main.json') as config_file:
    main_config_mechsys = json.load(config_file)

def load_events_mechsys():
    """ load blocked time slots from json
    """
    cal_path = config_path_mechsys + 'calendar/'
    fileNames = next(os.walk(cal_path), (None, None, []))[2]  # [] if no file
    calEvents_mechsys = []
    for j in range(len(fileNames)):
        with open(cal_path + fileNames[j]) as config_calEvents:
            if fileNames[j].endswith(".json"):
                config_calEvents_mechsys = json.load(config_calEvents)
                for i in range(len(config_calEvents_mechsys)):
                    calEvents_mechsys.append(json.dumps(config_calEvents_mechsys[i]))
            config_calEvents.close()
    return calEvents_mechsys

calEvents_mechsys = load_events_mechsys()      # load blocked time slots from json
duration_mechsys = main_config_mechsys['Calendar']['Duration']*60

mainroute_mechsys = '/MechSys'


@uwsgi_app.route(mainroute_mechsys + '/rest/be/BI/create/', endpoint = 'MechSys', methods=['POST'])
def create_mechsys():
    user =request.environ.get('REMOTE_USER')
    group = conn_mechsys.get_group(user)
    data = request.get_json()
    if user == "imesAdmin":
        reserv = datetime.datetime.strptime(data['Date'][0], "%Y %m %d %H %M")
        end = datetime.datetime.strptime(data['Date'][1], "%Y %m %d %H %M")
        lab = [int(s) for s in data['Lab'].split() if s.isdigit()][0]
        conn_mechsys.create(user, [reserv, end], lab)
        return jsonify(resp='', success = True, remain=str(12))
    else:
        reserv = datetime.datetime.strptime(data['Date'], "%Y %m %d %H %M")
        if not reserv.minute%(duration_mechsys/60) == 0:
            return jsonify(resp='Dies ist keine reguläre Buchungszeit.', success=False)
        if 'Evaluation' in data['Lab']:
            return jsonify(resp="Der Versuchsstand muss zur Evaluation nicht gebucht werden. Sie können stattdessen den Fragebogen unter 'Lösung > Evaluation' aufrufen.",
                success=False)
        lab = [int(s) for s in data['Lab'].split() if s.isdigit()][0]
        labs = conn_mechsys.get_labs(user)
        reservations = conn_mechsys.get_reservations(user)
        if (lab > 4) and not conn_mechsys.is_imes_user(user):
            return jsonify(resp='Dieser Laborversuch ist derzeit noch nicht buchbar und erst zu einem späteren Zeitpunkt verfügbar.', success = False)
        for labor in labs:
            if labor.number == lab-1:
                if labor.trys_done >= labor.trys_allowed:
                    return jsonify(resp='Sie haben die maximal erlaubte Versuchsanzahl für dieses Labor absolviert.', success = False)
        for reservation in reservations:
            if reservation.reservation is not None:
                if -duration_mechsys<(reserv-datetime.datetime.now()).total_seconds()<-1440:
                    return jsonify(resp='Der Versuchsstand konte nicht reserviert werden, da der Block bald abläuft.', success=False)
                if abs((reservation.reservation-reserv).total_seconds())<duration_mechsys:
                    return jsonify(resp='Der Versuchsstand ist für die gewünschte Zeit bereit gebucht.', success = False)
                if (reserv-datetime.datetime.now()).total_seconds()<=-duration_mechsys:
                    return jsonify(resp='Der gewünschte Block liegt in der Vergangenheit.', success=False)
                if (reservation.reservation-datetime.datetime.now()).total_seconds()>=-duration_mechsys:
                    return jsonify(resp='Sie haben bereit eine aktive, zukünftige Reservierung.', success=False)
            else:
                if (reserv-datetime.datetime.now()).total_seconds()<-duration_mechsys:
                    return jsonify(resp='Der gewünschte Block liegt in der Vergangenheit.', success=False)
        trys_remain, resp, success = conn_mechsys.create(user, reserv, lab)
        return jsonify(resp=resp, success = success, remain=str(trys_remain))

@uwsgi_app.route(mainroute_mechsys+'/rest/be/BI/change/', methods=['POST'])
def change_mechsys():
    user =request.environ.get('REMOTE_USER')
    group = conn_mechsys.get_group(user)
    data = request.get_json()
    reserv = datetime.datetime.strptime(data['Date'], "%Y %m %d %H %M")
    if not reserv.minute%(duration_mechsys/60) == 0:
        return jsonify(resp='Dies ist keine reguläre Buchungszeit.', success=False)
    reservations = conn_mechsys.get_reservations(user)
    for reservation in reservations:
        if abs((reservation.reservation-reserv).total_seconds())<duration_mechsys:
            return jsonify(resp='Es existiert bereits eine Reservierung zu der gewünschten Zeit.', success = False)
        if -duration_mechsys<(reservation.reservation-datetime.datetime.now()).total_seconds()<60:
            return jsonify(resp='Die Reservierung konnte nicht verschoebn werden. Der Block hat entweder schon begonnen oder beginnt bald.', success=False)
        if -duration_mechsys<(reserv-datetime.datetime.now()).total_seconds()<-1440:
            return jsonify(resp='Der gewünschte Block konnte nicht reserviert werden, da er bald endet.', success=False)
        if (reserv-datetime.datetime.now()).total_seconds()<=-duration_mechsys:
            return jsonify(resp='Der gewünschte Termin liegt in der Vergangenheit', success=False)
    suc, msg, remain = conn_mechsys.change(reserv, user)
    return jsonify(resp=msg, success = suc, remain=str(remain))

@uwsgi_app.route(mainroute_mechsys+'/rest/be/BI/delete/', methods=['POST'])
def delete_mechsys():
    user =request.environ.get('REMOTE_USER')
    suc, msg = conn_mechsys.delete(user)
    return jsonify(resp=msg, success = suc)

@uwsgi_app.route(mainroute_mechsys+'/rest/be/BI/init/', methods=['GET'])
def init_mechsys():
    user = request.environ.get('REMOTE_USER')
    calEvents_mechsys = load_events_mechsys()  # load blocked time slots from json
    eventlist, grp, newname = conn_mechsys.initialize(user, color_own,color_foreign)
    calEvents = eventlist + calEvents_mechsys  # events from db and read from json (manual blocked slots)
    return jsonify(resp=calEvents, g_id=grp, newname=newname, success = True)

@uwsgi_app.route(mainroute_mechsys+'/rest/be/BI/groupname/', methods=['POST'])
def goupname_mechsys():
    user = request.environ.get('REMOTE_USER')
    data = request.get_json()
    success = conn_mechsys.groupname(user, data['Name'])
    return jsonify(success = success)


######### Booking RobotikI ############################################

config_path_robotikI = basedir + '/config/RobotikI/'
with open(config_path_robotikI + 'config_main.json') as config_file:
    main_config_robotiki = json.load(config_file)

def load_events_robotikI():
    """ load blocked time slots from json
    """
    cal_path = config_path_robotikI + 'calendar/'
    fileNames = next(os.walk(cal_path), (None, None, []))[2]  # [] if no file
    calEvents_robotik1 = []
    for j in range(len(fileNames)):
        with open(cal_path + fileNames[j]) as config_calEvents:
            if fileNames[j].endswith(".json"):
                config_calEvents_robotikI = json.load(config_calEvents)
                for i in range(len(config_calEvents_robotikI)):
                    calEvents_robotik1.append(json.dumps(config_calEvents_robotikI[i]))
            config_calEvents.close()
    return calEvents_robotik1

calEvents_robotikI = load_events_robotikI()      # load blocked time slots from json

duration_robotiki = main_config_robotiki['Calendar']['Duration']*60

mainroute_robotiki = '/RobotikI'


@uwsgi_app.route(mainroute_robotiki + '/rest/be/BI/create/', methods=['POST'])
def create_robotikI():
    user =request.environ.get('REMOTE_USER')
    data = request.get_json()
    if user == "imesAdmin":
        reserv = datetime.datetime.strptime(data['Date'][0], "%Y %m %d %H %M")
        end = datetime.datetime.strptime(data['Date'][1], "%Y %m %d %H %M")
        lab = [int(s) for s in data['Lab'].split() if s.isdigit()][0]
        conn_robotikI.create(user, [reserv, end], lab)
        return jsonify(resp='', success = True, remain=str(12))
    else:
        reserv = datetime.datetime.strptime(data['Date'], "%Y %m %d %H %M")
        if not reserv.minute%(duration_robotiki/60) == 0:
            return jsonify(resp='Dies ist keine reguläre Buchungszeit.', success=False)
        if 'Evaluation' in data['Lab']:
            return jsonify(resp="Der Versuchsstand muss zur Evaluation nicht gebucht werden. Sie können stattdessen den Fragebogen unter 'Lösung > Evaluation' aufrufen.",
                success=False)
        lab = [int(s) for s in data['Lab'].split() if s.isdigit()][0]
        labs = conn_robotikI.get_labs(user)
        reservations = conn_robotikI.get_reservations(user)
        # workaround fuer Messe-Demo
        #if not conn_robotikI.is_imes_user(user):
        #    return jsonify(resp='Das ReLab wird derzeit im Rahmen der ERW2023 verwendet und ist erst ab dem 24.11.2023 wieder buchbar.',  success=False)
        if (lab > 4) and not conn_robotikI.is_imes_user(user):
            return jsonify(resp='Dieser Laborversuch ist derzeit noch nicht buchbar und erst zu einem späteren Zeitpunkt verfügbar.', success = False)
        for labor in labs:
            if labor.number == lab-1:
                if labor.trys_done >= labor.trys_allowed:
                    return jsonify(resp='Sie haben die maximal erlaubte Versuchsanzahl für dieses Labor absolviert.', success = False)
        for reservation in reservations:
            if reservation.reservation is not None:
                if -duration_robotiki<(reserv-datetime.datetime.now()).total_seconds()<-1440-3*60:
                    return jsonify(resp='Der Versuchsstand konte nicht reserviert werden, da der Block bald abläuft.', success=False)
                if abs((reservation.reservation-reserv).total_seconds())<duration_robotiki:
                    return jsonify(resp='Der Versuchsstand ist für die gewünschte Zeit bereit gebucht.', success = False)
                if (reserv-datetime.datetime.now()).total_seconds()<=-duration_robotiki:
                    return jsonify(resp='Der gewünschte Block liegt in der Vergangenheit.', success=False)
                if (reservation.reservation-datetime.datetime.now()).total_seconds()>=-duration_robotiki:
                    #if not conn_robotikI.is_imes_user(user):  # imes-user koennen mehrfach buchen -> geht mit der derzeitigen Datenstruktur nicht! (jede Group kann nur eine aktive Reservierung haben!)
                    return jsonify(resp='Sie haben bereit eine aktive, zukünftige Reservierung.', success=False)
            else:
                if (reserv-datetime.datetime.now()).total_seconds()<-duration_robotiki:
                    return jsonify(resp='Der gewünschte Block liegt in der Vergangenheit.', success=False)
        trys_remain, resp, success = conn_robotikI.create(user, reserv, lab)
        return jsonify(resp=resp, success = success, remain=str(trys_remain))

@uwsgi_app.route(mainroute_robotiki+'/rest/be/BI/change/', methods=['POST'])
def change_robotikI():
    user =request.environ.get('REMOTE_USER')
    data = request.get_json()
    reserv = datetime.datetime.strptime(data['Date'], "%Y %m %d %H %M")
    if not reserv.minute%(duration_robotiki/60) == 0:
        return jsonify(resp='Dies ist keine reguläre Buchungszeit.', success=False)
    reservations = conn_robotikI.get_reservations(user)
    for reservation in reservations:
        if abs((reservation.reservation-reserv).total_seconds())<duration_robotiki:
            return jsonify(resp='Es existiert bereits eine Reservierung zu der gewünschten Zeit.', success = False)
        if -duration_robotiki<(reservation.reservation-datetime.datetime.now()).total_seconds()<60:
            return jsonify(resp='Die Reservierung konnte nicht verschoebn werden. Der Block hat entweder schon begonnen oder beginnt bald.', success=False)
        if -duration_robotiki<(reserv-datetime.datetime.now()).total_seconds()<-1440:
            return jsonify(resp='Der gewünschte Block konnte nicht reserviert werden, da er bald endet.', success=False)
        if (reserv-datetime.datetime.now()).total_seconds()<=-duration_robotiki:
            return jsonify(resp='Der gewünschte Termin liegt in der Vergangenheit', success=False)
    suc, msg, remain = conn_robotikI.change(reserv, user)
    return jsonify(resp=msg, success = suc, remain=str(remain))

@uwsgi_app.route(mainroute_robotiki+'/rest/be/BI/delete/', methods=['POST'])
def delete_robotikI():
    user =request.environ.get('REMOTE_USER')
    suc, msg = conn_robotikI.delete(user)
    return jsonify(resp=msg, success = suc)

@uwsgi_app.route(mainroute_robotiki+'/rest/be/BI/init/', methods=['GET'])
def init_robotikI():
    user = request.environ.get('REMOTE_USER')
    calEvents_robotikI = load_events_robotikI()      # load blocked time slots from json
    eventlist, grp, newname = conn_robotikI.initialize(user, color_own,color_foreign)
    calEvents = eventlist+calEvents_robotikI        # events from db and read from json (manual blocked slots)
    return jsonify(resp=calEvents, g_id=grp, newname=newname, success = True)

@uwsgi_app.route(mainroute_robotiki+'/rest/be/BI/groupname/', methods=['POST'])
def goupname_robotikI():
    user = request.environ.get('REMOTE_USER')
    data = request.get_json()
    conn_robotikI.groupname(user, data['Name'])
    success = conn_robotikI.groupname(user, data['Name'])
    return jsonify(success = success)


######### Booking RobotikII ############################################
config_path_robotikII = basedir + '/config/RobotikII/'
with open(config_path_robotikII + 'config_main.json') as config_file:
    main_config_robotikii = json.load(config_file)

duration_robotikii = main_config_robotikii['Calendar']['Duration']*60

mainroute_robotikii = '/RobotikII'


@uwsgi_app.route(mainroute_robotikii + '/rest/be/BI/create/', methods=['POST'])
def create_robotikII():
    user =request.environ.get('REMOTE_USER')
    data = request.get_json()
    if user == "imesAdmin":
        reserv = datetime.datetime.strptime(data['Date'][0], "%Y %m %d %H %M")
        end = datetime.datetime.strptime(data['Date'][1], "%Y %m %d %H %M")
        lab = [int(s) for s in data['Lab'].split() if s.isdigit()][0]
        conn_robotikII.create(user, [reserv, end], lab)
        return jsonify(resp='', success = True, remain=str(12))
    else:
        reserv = datetime.datetime.strptime(data['Date'], "%Y %m %d %H %M")
        if not reserv.minute%(duration_robotikii/60) == 0:
            return jsonify(resp='Dies ist keine reguläre Buchungszeit.', success=False)
        lab = [int(s) for s in data['Lab'].split() if s.isdigit()][0]
        labs = conn_robotikII.get_labs(user)
        reservations = conn_robotikII.get_reservations(user)
        for labor in labs:
            if labor.number == lab-1:
                if labor.trys_done >= labor.trys_allowed:
                    return jsonify(resp='Sie haben die maximal erlaubte Versuchsanzahl für dieses Labor absolviert.', success = False)
        for reservation in reservations:
            if reservation.reservation is not None:
                if -duration_robotikii<(reserv-datetime.datetime.now()).total_seconds()<-1440:
                    return jsonify(resp='Der Versuchsstand konte nicht reserviert werden, da der Block bald abläuft.', success=False)
                if abs((reservation.reservation-reserv).total_seconds())<duration_robotikii:
                    return jsonify(resp='Der Versuchsstand ist für die gewünschte Zeit bereit gebucht.', success = False)
                if (reserv-datetime.datetime.now()).total_seconds()<=-duration_robotikii:
                    return jsonify(resp='Der gewünschte Block liegt in der Vergangenheit.', success=False)
                if (reservation.reservation-datetime.datetime.now()).total_seconds()>=-duration_robotikii:
                    return jsonify(resp='Sie haben bereit eine aktive, zukünftige Reservierung.', success=False)
            else:
                if (reserv-datetime.datetime.now()).total_seconds()<-duration_robotikii:
                    return jsonify(resp='Der gewünschte Block liegt in der Vergangenheit.', success=False)
        trys_remain, resp, success = conn_robotikII.create(user, reserv, lab)
        return jsonify(resp=resp, success = success, remain=str(trys_remain))

@uwsgi_app.route(mainroute_robotikii+'/rest/be/BI/change/', methods=['POST'])
def change_robotikII():
    user =request.environ.get('REMOTE_USER')
    data = request.get_json()
    reserv = datetime.datetime.strptime(data['Date'], "%Y %m %d %H %M")
    if not reserv.minute%(duration_robotikii/60) == 0:
        return jsonify(resp='Dies ist keine reguläre Buchungszeit.', success=False)
    reservations = conn_robotikII.get_reservations(user)
    for reservation in reservations:
        if abs((reservation.reservation-reserv).total_seconds())<duration_robotikii:
            return jsonify(resp='Es existiert bereits eine Reservierung zu der gewünschten Zeit.', success = False)
        if -duration_robotikii<(reservation.reservation-datetime.datetime.now()).total_seconds()<60:
            return jsonify(resp='Die Reservierung konnte nicht verschoebn werden. Der Block hat entweder schon begonnen oder beginnt bald.', success=False)
        if -duration_robotikii<(reserv-datetime.datetime.now()).total_seconds()<-1440:
            return jsonify(resp='Der gewünschte Block konnte nicht reserviert werden, da er bald endet.', success=False)
        if (reserv-datetime.datetime.now()).total_seconds()<=-duration_robotikii:
            return jsonify(resp='Der gewünschte Termin liegt in der Vergangenheit', success=False)
    suc, msg, remain = conn_robotikII.change(reserv, user)
    return jsonify(resp=msg, success = suc, remain=str(remain))

@uwsgi_app.route(mainroute_robotikii+'/rest/be/BI/delete/', methods=['POST'])
def delete_robotikII():
    user =request.environ.get('REMOTE_USER')
    suc, msg = conn_robotikII.delete(user)
    return jsonify(resp=msg, success = suc)

@uwsgi_app.route(mainroute_robotikii+'/rest/be/BI/init/', methods=['GET'])
def init_robotikII():
    user = request.environ.get('REMOTE_USER')
    eventlist, grp, newname = conn_robotikII.initialize(user, color_own,color_foreign)
    return jsonify(resp=eventlist, g_id=grp, newname=newname, success = True)

@uwsgi_app.route(mainroute_robotikii+'/rest/be/BI/groupname/', methods=['POST'])
def goupname_robotikII():
    user = request.environ.get('REMOTE_USER')
    data = request.get_json()
    success = conn_robotikII.groupname(user, data['Name'])
    return jsonify(success = success)
