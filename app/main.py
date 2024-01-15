import gevent
from gevent import monkey
monkey.patch_all()
from flask import (
    Flask,
    render_template,
    request,
    jsonify
)
import os
import socket
import struct

import copy

import json
from db_client.database_fcn import connection
import datetime
import get_passwords as get_pw

from functools import total_ordering

@total_ordering
class MinType(object):
    def __le__(self,other):
        return True
    def __eq__(self,other):
        return (self is other)

Min = MinType()

uwsgi_app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__)) ## Pfad der Website auf dem Server
uwsgi_app.secret_key = os.urandom(24)

pw_sql = get_pw.password_sql()
ip_server = get_pw.get_ip('SERVER_IP')
conn_mechsys = connection("mysql+pymysql://relab:" + pw_sql + "@" + ip_server + ":3306/MechSys")
conn_robotikI = connection("mysql+pymysql://relab:" + pw_sql + "@" + ip_server + ":3306/RobotikI")
conn_robotikII = connection("mysql+pymysql://relab:" + pw_sql + "@" + ip_server + ":3306/RobotikII")

################# Hilfe-Seite ################################
mainroute_help = "/help"
location_help = {'relab': '','booking': '', 'faq': '', 'contact': ''}

@uwsgi_app.route(mainroute_help + "/relab/")
def help_relab():
    location = copy.deepcopy(location_help)
    location['relab']='active'
    return render_template('/help/relab.html', location=location)

@uwsgi_app.route(mainroute_help + "/booking/")
def help_booking():
    location = copy.deepcopy(location_help)
    location['booking'] = 'active'
    return render_template('/help/booking.html', location=location)

@uwsgi_app.route(mainroute_help + "/faq/")
def help_faq():
    location = copy.deepcopy(location_help)
    location['faq'] = 'active'
    return render_template('/help/faq.html', location=location)

@uwsgi_app.route(mainroute_help + "/contact/")
def help_contact():
    location = copy.deepcopy(location_help)
    location['contact'] = 'active'
    return render_template('/help/contact.html', location=location)

################# MechSys ####################################
config_path_mechsys = basedir + '/config/MechSys/'
with open(config_path_mechsys + 'config_main.json') as config_file:
        main_config_mechsys = json.load(config_file)

with open(config_path_mechsys+'groups.json') as groups:
    groups_mechsys = json.load(groups)
    groups_mechsys = groups_mechsys["labs"]

with open(config_path_mechsys+'sliders.json') as sliders:
    sliders_mechsys = json.load(sliders)
    sliders_mechsys = sliders_mechsys["labs"]

duration = main_config_mechsys['Calendar']['Duration']*60
labs_mechsys = main_config_mechsys['Labs']
labnames_mechsys = []
for lab in labs_mechsys:
    labnames_mechsys.append(lab["name"])


mainroute_mechsys = "/MechSys"
location_mechsys = {'info': {'link':'','Labs': ['' for lab in labs_mechsys]},'solution': {'link':'','Labs': ['' for lab in labs_mechsys]},'booking':'','control':'','main':''}

@uwsgi_app.route(mainroute_mechsys + "/")
def mechsys_main():
    location = copy.deepcopy(location_mechsys)
    location['main']='active'
    return render_template('/MechSys/main.html', labs = labs_mechsys, location=location)

@uwsgi_app.route(mainroute_mechsys + "/help/data/")
def mechsys_help_data():
    location = copy.deepcopy(location_mechsys)
    location['info']['link']='active'
    return render_template('/MechSys/data.html', labs = labs_mechsys, location=location)


@uwsgi_app.route(mainroute_mechsys + "/help/labs/<lab>")
def mechsys_help_labs(lab):
    labnumber = [int(s) for s in lab.split() if s.isdigit()][0]
    location = copy.deepcopy(location_mechsys)
    location['info']['link']='active'
    location['info']['Labs'][labnumber-1]='active'
    return render_template('/MechSys/'+lab+'.html', labs = labs_mechsys, location=location)

@uwsgi_app.route(mainroute_mechsys + "/rest/view/SI/labs/<lab>")
def mechsys_solutions(lab):
    labnumber = [int(s) for s in lab.split() if s.isdigit()][0]
    with open(config_path_mechsys+'solution'+str(labnumber)+'.json') as data_file:
        values = json.load(data_file)
    try:
        text = ''
        for exer in values:
            for subtext in exer["text"]:
                text = text + subtext + ' '
            exer["text"]=text
            text=''
    except:
        pass
    location = copy.deepcopy(location_mechsys)
    location['solution']['link']='active'
    location['solution']['Labs'][labnumber-1]='active'
    return render_template('/MechSys/solution'+str(labnumber) +'.html', labs = labs_mechsys, location=location, values=values)



@uwsgi_app.route(mainroute_mechsys + "/rest/view/BI/")
def mechsys_bi():
    location = copy.deepcopy(location_mechsys)
    location['booking']='active'
    return render_template('/MechSys/bi.html', labs = labs_mechsys, labnames=labnames_mechsys, location=location)


@uwsgi_app.route(mainroute_mechsys + "/rest/view/CI/")
def mechsys_ci():
    user =request.environ.get('REMOTE_USER')
    reservations = conn_mechsys.get_reservations(user)
    for reservation in reservations:
        if reservation.reservation is not None:
            if duration-61 <= (datetime.datetime.now()-reservation.reservation).total_seconds() <duration+1:
                return render_template('raus.html')
            if -duration < (datetime.datetime.now()-reservation.reservation).total_seconds() <=0:
                seconds_wait = abs((reservation.reservation-datetime.datetime.now()).total_seconds())
                minutes, seconds = divmod(seconds_wait, 60)
                time="%02d:%02d" % (minutes, seconds)
                return render_template('custom.html', data={'msg': 'Ihre Reservierung startet in ' + time +' min.', 'url':'/MechSys'})
            if (datetime.datetime.now()-reservation.reservation).total_seconds() <=-duration:
                return render_template('custom.html', data={'msg': 'Ihre Reservierung hat noch nicht begonnen.', 'url':'/MechSys'})
            if 1<(datetime.datetime.now()-reservation.reservation).total_seconds() <duration-61:
                labnumber = str(int(conn_mechsys.get_lab(user,reservation.reservation))+1)
                print(labnumber)
                with open(config_path_mechsys+'data' + labnumber + '.json') as data_file:
                    data = json.load(data_file)
                names = []
                colors = []
                ranges = []
                for value in data:
                    names.append('\\(' + value["name"] + '\\)' + ' ' + '\\(\\left(' + value["unit"] + '\\right)\\)')
                    colors.append(value["color"])
                    ranges.append([float(value["range"][0]),float(value["range"][1])])
                data = {"names": names, "colors": colors, "ranges": ranges}
                location = copy.deepcopy(location_mechsys)
                location['control']='active'
                return render_template('/MechSys/control' + labnumber + '.html', labs = labs_mechsys, location=location, data=data, sliderd = sliders_mechsys[int(labnumber)-1], gp = groups_mechsys[int(labnumber)-1])
    return render_template('/MechSys/perm_deny.html')

@uwsgi_app.route(mainroute_mechsys + "/video/")
def mechsys_video():
    """
    Testseite nur mit dem Videostream
    """
    labnumber = str(1)
    with open(config_path_mechsys +'data' + labnumber + '.json') as data_file:
        data = json.load(data_file)
    names = []
    colors = []
    ranges = []
    for value in data:
        names.append('\\(' + value["name"] + '\\)' + ' ' + '\\(\\left(' + value["unit"] + '\\right)\\)')
        colors.append(value["color"])
        ranges.append([float(value["range"][0]),float(value["range"][1])])
    data = {"names": names, "colors": colors, "ranges": ranges}
    location = copy.deepcopy(location_mechsys)
    location['control']='active'
    return render_template('/MechSys/video.html', labs = labs_mechsys, location=location, data=data, sliderd = sliders_mechsys[int(labnumber)-1], gp = groups_mechsys[int(labnumber)-1])


@uwsgi_app.route(mainroute_mechsys + '/rest/view/ranking/', methods=['GET'])
def mechsys_update_ranking():
    user = request.environ.get('REMOTE_USER')
    own_score, scores = conn_mechsys.get_score(user)
    scores.sort(key=lambda x: Min if x[0] is None else x[0], reverse=True)
    positions = []
    index = 1
    score_before = -1
    for score in scores:
        if score[0] == score_before:
            positions.append('')
        else:
            positions.append(str(index))
        index = index + 1
        score_before = score[0]
    if own_score[1] == None:
        own = 0
    else:
        own = scores.index(own_score) + 1

    return jsonify(positions=positions, scores=scores, own_pos=own, success=False)


################# Robotik I ####################################
config_path_robotikI = basedir + '/config/RobotikI/'
with open(config_path_robotikI + 'config_main.json') as config_file:
        main_config_robotikI = json.load(config_file)

with open(config_path_robotikI+'groups.json') as groups:
    groups_robotikI = json.load(groups)
    groups_robotikI = groups_robotikI["labs"]

with open(config_path_robotikI+'sliders.json') as sliders:
    sliders_robotikI = json.load(sliders)
    sliders_robotikI = sliders_robotikI["labs"]

duration = main_config_robotikI['Calendar']['Duration']*60
labs_robotikI = main_config_robotikI['Labs']
labnames_robotikI = []
for lab in labs_robotikI:
    labnames_robotikI.append(lab["name"])


mainroute_robotikI = "/RobotikI"
location_robotikI = {'info': {'link':'','Labs': ['' for lab in labs_robotikI]},'solution': {'link':'','Labs': ['' for lab in labs_robotikI]},'booking':'','control':'','main':''}

@uwsgi_app.route(mainroute_robotikI + "/")
def robotikI_main():
    location = copy.deepcopy(location_robotikI)
    location['main']='active'
    return render_template('/RobotikI/main.html', labs = labs_robotikI, location=location)

@uwsgi_app.route(mainroute_robotikI + "/help/data/")
def robotikI_help_data():
    location = copy.deepcopy(location_robotikI)
    location['info']['link']='active'
    return render_template('/RobotikI/data.html', labs = labs_robotikI, location=location)


@uwsgi_app.route(mainroute_robotikI + "/help/labs/<lab>")
def robotikI_help_labs(lab):
    labnumber = [int(s) for s in lab.split() if s.isdigit()][0]
    location = copy.deepcopy(location_robotikI)
    location['info']['link']='active'
    location['info']['Labs'][labnumber-1]='active'
    return render_template('/RobotikI/'+lab+'.html', labs = labs_robotikI, location=location)

@uwsgi_app.route(mainroute_robotikI + "/rest/view/SI/labs/<lab>")
def robotikI_solutions(lab):
    labnumber = [int(s) for s in lab.split() if s.isdigit()][0]
    with open(config_path_robotikI+'solution'+str(labnumber)+'.json') as data_file:
        values = json.load(data_file)
    text = ''
    try:
        for exer in values:
            for subtext in exer["text"]:
                text = text + subtext + ' '
            exer["text"]=text
            text=''
    except:
        pass
    location = copy.deepcopy(location_robotikI)
    location['solution']['link']='active'
    location['solution']['Labs'][labnumber-1]='active'
    return render_template('/RobotikI/solution'+str(labnumber) +'.html', labs = labs_robotikI, location=location, values=values)



@uwsgi_app.route(mainroute_robotikI + "/rest/view/BI/")
def robotikI_bi():
    location = copy.deepcopy(location_robotikI)
    location['booking']='active'
    return render_template('/RobotikI/bi.html', labs = labs_robotikI, labnames=labnames_robotikI, location=location)

@uwsgi_app.route(mainroute_robotikI + "/video/")
def robotikI_video():
    """
    Testseite nur mit dem Videostream
    """
    labnumber = str(1)
    with open(config_path_robotikI +'data' + labnumber + '.json') as data_file:
        data = json.load(data_file)
    names = []
    colors = []
    ranges = []
    for value in data:
        names.append('\\(' + value["name"] + '\\)' + ' ' + '\\(\\left(' + value["unit"] + '\\right)\\)')
        colors.append(value["color"])
        ranges.append([float(value["range"][0]),float(value["range"][1])])
    data = {"names": names, "colors": colors, "ranges": ranges}
    location = copy.deepcopy(location_robotikI)
    location['control']='active'
    return render_template('/RobotikI/video.html', labs = labs_robotikI, location=location, data=data,
                           sliderd = sliders_robotikI[int(labnumber)-1], gp = groups_robotikI[int(labnumber)-1])

@uwsgi_app.route(mainroute_robotikI + "/rest/view/CI/")
def robotikI_ci():
    user =request.environ.get('REMOTE_USER')
    reservations = conn_robotikI.get_reservations(user)
    for reservation in reservations:
        if reservation.reservation is not None:
            if duration-61 <= (datetime.datetime.now()-reservation.reservation).total_seconds() <duration+1:
                render_template('raus.html')
            if -duration < (datetime.datetime.now()-reservation.reservation).total_seconds() <=0:
                seconds_wait = abs((reservation.reservation-datetime.datetime.now()).total_seconds())
                minutes, seconds = divmod(seconds_wait, 60)
                time="%02d:%02d" % (minutes, seconds)
                return render_template('custom.html', data={'msg': 'Ihre Reservierung startet in ' + time +' min.', 'url':'/RobotikI'})
            if (datetime.datetime.now()-reservation.reservation).total_seconds() <=-duration:
                return render_template('custom.html', data={'msg': 'Ihre Reservierung hat noch nicht begonnen.', 'url':'/RobotikI'})
            if 1<(datetime.datetime.now()-reservation.reservation).total_seconds() <duration-61:
                labnumber = str(int(conn_robotikI.get_lab(user,reservation.reservation))+1)
                with open(config_path_robotikI+'data' + labnumber + '.json') as data_file:
                    data = json.load(data_file)
                names = []
                colors = []
                ranges = []
                for value in data:
                    names.append('\\(' + value["name"] + '\\)' + ' ' + '\\(\\left(' + value["unit"] + '\\right)\\)')
                    colors.append(value["color"])
                    ranges.append([float(value["range"][0]),float(value["range"][1])])
                data = {"names": names, "colors": colors, "ranges": ranges}
                location = copy.deepcopy(location_robotikI)
                location['control']='active'
                return render_template('/RobotikI/control' + labnumber + '.html', labs = labs_robotikI, location=location, data=data, sliderd = sliders_robotikI[int(labnumber)-1], gp = groups_robotikI[int(labnumber)-1])
    return render_template('/RobotikI/perm_deny.html')


@uwsgi_app.route(mainroute_robotikI + '/rest/view/ranking/', methods=['GET'])
def robotikI_update_ranking():
    user = request.environ.get('REMOTE_USER')
    own_score, scores = conn_robotikI.get_score(user)
    scores.sort(key=lambda x: Min if x[0] is None else x[0], reverse=True)
    positions = []
    index = 1
    score_before = -1
    for score in scores:
        if score[0] == score_before:
            positions.append('')
        else:
            positions.append(str(index))
        index = index + 1
        score_before = score[0]
    if own_score[1] == None:
        own = 0
    else:
        own = scores.index(own_score) + 1

    return jsonify(positions=positions, scores=scores, own_pos=own, success=False)

################# Robotik II ####################################
config_path_robotikII = basedir + '/config/RobotikII/'
with open(config_path_robotikII + 'config_main.json') as config_file:
        main_config_robotikII = json.load(config_file)

with open(config_path_robotikII+'groups.json') as groups:
    groups_robotikII = json.load(groups)
    groups_robotikII = groups_robotikII["labs"]

with open(config_path_robotikII+'sliders.json') as sliders:
    sliders_robotikII = json.load(sliders)
    sliders_robotikII = sliders_robotikII["labs"]


duration = main_config_robotikII['Calendar']['Duration']*60
labs_robotikII = main_config_robotikII['Labs']
labnames_robotikII = []
for lab in labs_robotikII:
    labnames_robotikII.append(lab["name"])


mainroute_robotikII = "/RobotikII"
location_robotikII = {'info': {'link':'','Labs': ['' for lab in labs_robotikII]},'solution': {'link':'','Labs': ['' for lab in labs_robotikII]},'booking':'','control':'','main':''}

@uwsgi_app.route(mainroute_robotikII + "/")
def robotikII_main():
    location = copy.deepcopy(location_robotikII)
    location['main']='active'
    return render_template('/RobotikII/main.html', labs = labs_robotikII, location=location)

@uwsgi_app.route(mainroute_robotikII + "/help/data/")
def robotikII_help_data():
    location = copy.deepcopy(location_robotikII)
    location['info']['link']='active'
    return render_template('/RobotikII/data.html', labs = labs_robotikII, location=location)


@uwsgi_app.route(mainroute_robotikII + "/help/labs/<lab>")
def robotikII_help_labs(lab):
    labnumber = [int(s) for s in lab.split() if s.isdigit()][0]
    location = copy.deepcopy(location_robotikII)
    location['info']['link']='active'
    location['info']['Labs'][labnumber-1]='active'
    return render_template('/RobotikII/'+lab+'.html', labs = labs_robotikII, location=location)

@uwsgi_app.route(mainroute_robotikII + "/rest/view/SI/labs/<lab>")
def robotikII_solutions(lab):
    labnumber = [int(s) for s in lab.split() if s.isdigit()][0]
    with open(config_path_robotikII+'solution'+str(labnumber)+'.json') as data_file:
        values = json.load(data_file)
    text = ''
    for exer in values:
        for subtext in exer["text"]:
            text = text + subtext + ' '
        exer["text"]=text
        text=''
    location = copy.deepcopy(location_robotikII)
    location['solution']['link']='active'
    location['solution']['Labs'][labnumber-1]='active'
    return render_template('/RobotikII/solution'+str(labnumber) +'.html', labs = labs_robotikII, location=location, values=values)



@uwsgi_app.route(mainroute_robotikII + "/rest/view/BI/")
def robotikII_bi():
    location = copy.deepcopy(location_robotikII)
    location['booking']='active'
    return render_template('/RobotikII/bi.html', labs = labs_robotikII, labnames=labnames_robotikII, location=location)


@uwsgi_app.route(mainroute_robotikII + "/rest/view/CI/")
def robotikII_ci():
    user =request.environ.get('REMOTE_USER')
    reservations = conn_robotikII.get_reservations(user)
    for reservation in reservations:
        if reservation.reservation is not None:
            if duration-61 <= (datetime.datetime.now()-reservation.reservation).total_seconds() <duration+1:
                render_template('raus.html')
            if -duration < (datetime.datetime.now()-reservation.reservation).total_seconds() <=0:
                seconds_wait = abs((reservation.reservation-datetime.datetime.now()).total_seconds())
                minutes, seconds = divmod(seconds_wait, 60)
                time="%02d:%02d" % (minutes, seconds)
                return render_template('custom.html', data={'msg': 'Ihre Reservierung startet in ' + time +' min.', 'url':'/RobotikII'})
            if (datetime.datetime.now()-reservation.reservation).total_seconds() <=-duration:
                return render_template('custom.html', data={'msg': 'Ihre Reservierung hat noch nicht begonnen.', 'url':'/RobotikII'})
            if 1<(datetime.datetime.now()-reservation.reservation).total_seconds() <duration-61:
                labnumber = str(int(conn_robotikII.get_lab(user,reservation.reservation))+1)
                if int(labnumber)==3:
                    sols = conn_robotikII.get_solution(user, 2)
                    if sols == False:
                        return render_template('custom.html', data={'msg': 'Sie müssen zuerst die Kamerakalibrierung durchführen.', 'url':'/RobotikII/rest/view/SI/labs/Labor 3'})

                with open(config_path_robotikII+'data' + labnumber + '.json') as data_file:
                    data = json.load(data_file)
                names = []
                colors = []
                ranges = []
                for value in data:
                    names.append('\\(' + value["name"] + '\\)' + ' ' + '\\(\\left(' + value["unit"] + '\\right)\\)')
                    colors.append(value["color"])
                    ranges.append([float(value["range"][0]),float(value["range"][1])])
                data = {"names": names, "colors": colors, "ranges": ranges}
                location = copy.deepcopy(location_robotikII)
                location['control']='active'
                return render_template('/RobotikII/control' + labnumber + '.html', labs = labs_robotikII, location=location, data=data, sliderd = sliders_robotikII[int(labnumber)-1], gp = groups_robotikII[int(labnumber)-1])
    return render_template('/RobotikII/perm_deny.html')


@uwsgi_app.route(mainroute_robotikII + '/rest/view/ranking/', methods=['GET'])
def robotikII_update_ranking():
    user = request.environ.get('REMOTE_USER')
    own_score, scores = conn_robotikII.get_score(user)
    scores.sort(key=lambda x: Min if x[0] is None else x[0], reverse=True)
    positions = []
    index = 1
    score_before = -1
    for score in scores:
        if score[0] == score_before:
            positions.append('')
        else:
            positions.append(str(index))
        index = index + 1
        score_before = score[0]
    if own_score[1] == None:
        own = 0
    else:
        own = scores.index(own_score) + 1

    return jsonify(positions=positions, scores=scores, own_pos=own, success=False)
