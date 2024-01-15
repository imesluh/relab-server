#!/bin/bash
IPT="/sbin/iptables"

##### IP / PORT configuration ######
# load intern IP config from file:
. "/var/www/server/GET_IP_CONFIG.sh"

LOCAL_IP="127.0.0.1"
VIDEO_PORT="25100:25110"

VNC_PORT = 5901
RDP_PORT=3389

ExtReLabPort="8080:8083"
VideoStream="5000:5007"
#ReLab2Video2=5020
#ReLab2Video3=5030
#ReLab2Video4=5040

#LOCAL_IP = "127.0.0.1"
#HOST_IP = "192.168.1.12"

#TURN_STUN = "3478,5349"

# --- config for application-server running on local machine: connection to realtime pc
#HOST_IP="192.168.1.10"
#HOST_PARAMS_PORT=25000
#HOST_CSV_PORT=25001
#HOST_FCNS_PORT=25002
#HOST_PROOF_PORT=25003
#RTP="16384:16485"
#TURN="25111:25150"
#TURNPort="5349"

#TARGET_IP="192.168.1.12"
#TARGET_PARAMS_PORT=25050
#TARGET_KONST_PORT=25051
#TARGET_FCNS_PORT=25052
#TARGET_STREAM_PORT=25053
#TARGET_TASK_PORT=24000


### Interfaces ###
PUB_IF="enp0s31f6"   # public interface
TAR_IF="enx0050b615e4f0"   # interface target pc
LO_IF="lo"      # loopback
##VPN_IF="eth1"   # vpn / private net


#### FILES #####
BLOCKED_IP_TDB=/root/.fw/blocked.ip.txt
SPOOFIP="127.0.0.0/8 192.168.0.0/16 10.0.0.0/8 169.254.0.0/16 0.0.0.0/8 240.0.0.0/4 255.255.255.255/32 168.254.0.0/16 224.0.0.0/4 240.0.0.0/5 248.0.0.0/5 192.0.2.0/24"


### start firewall ###
$IPT -F
$IPT -X
echo "Setting $(hostname) Firewall..."

# DROP and close everything
$IPT -P INPUT DROP
$IPT -P OUTPUT DROP
$IPT -P FORWARD DROP

# Unlimited lo access
$IPT -A INPUT -i ${LO_IF} -j ACCEPT
$IPT -A OUTPUT -o ${LO_IF} -j ACCEPT

# Unlimited target-desktop communication
$IPT -A INPUT -i ${TAR_IF} -j ACCEPT
$IPT -A OUTPUT -o ${TAR_IF} -j ACCEPT

### Remote Access
# Allow VNC
#$IPT -A INPUT -i ${PUB_IF} -s ${VNC_IPS} -d ${SERVER_IP} --dport ${VNC_PORT} -j ACCEPT
# Allow XRDP
#$IPT -A INPUT -i ${PUB_IF} -s ${RDP_IPS} -d ${SERVER_IP} --dport ${RDP_PORT} -j ACCEPT

# Unlimited Extern-ReLab communication
$IPT -A OUTPUT -o ${PUB_IF} -p tcp -d ${ExtReLabIP} --dport ${ExtReLabPort} -j ACCEPT
$IPT -A OUTPUT -o ${PUB_IF} -p udp -d ${ExtReLabIP} --dport ${ExtReLabPort} -j ACCEPT
$IPT -A INPUT -i ${PUB_IF} -p tcp -s ${ExtReLabIP} --sport ${ExtReLabPort} -j ACCEPT
$IPT -A INPUT -i ${PUB_IF} -p udp -s ${ExtReLabIP} --sport ${ExtReLabPort} -j ACCEPT

# Drop sync
$IPT -A INPUT -i ${PUB_IF} -p tcp ! --syn -m state --state NEW -j DROP

# Drop Fragments
$IPT -A INPUT -i ${PUB_IF} -f -j DROP

#$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags ALL FIN,URG,PSH -j DROP
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags ALL ALL -j DROP

# Drop NULL packets
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags ALL NONE -m limit --limit 5/m --limit-burst 7 -j LOG --log-prefix " NULL Packets "
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags ALL NONE -j DROP

$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags SYN,RST SYN,RST -j DROP

# Drop XMAS
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags SYN,FIN SYN,FIN -m limit --limit 5/m --limit-burst 7 -j LOG --log-prefix " XMAS Packets "
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags SYN,FIN SYN,FIN -j DROP

# Drop FIN packet scans
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags FIN,ACK FIN -m limit --limit 5/m --limit-burst 7 -j LOG --log-prefix " Fin Packets Scan "
$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags FIN,ACK FIN -j DROP

$IPT  -A INPUT -i ${PUB_IF} -p tcp --tcp-flags ALL SYN,RST,ACK,FIN,URG -j DROP

# Log and get rid of broadcast / multicast and invalid
$IPT  -A INPUT -i ${PUB_IF} -m pkttype --pkt-type broadcast -j LOG --log-prefix " Broadcast "
$IPT  -A INPUT -i ${PUB_IF} -m pkttype --pkt-type broadcast -j DROP

$IPT  -A INPUT -i ${PUB_IF} -m pkttype --pkt-type multicast -j LOG --log-prefix " Multicast "
$IPT  -A INPUT -i ${PUB_IF} -m pkttype --pkt-type multicast -j DROP

$IPT  -A INPUT -i ${PUB_IF} -m state --state INVALID -j LOG --log-prefix " Invalid "
$IPT  -A INPUT -i ${PUB_IF} -m state --state INVALID -j DROP

# allow incoming ICMP ping pong stuff
$IPT -A INPUT -i ${PUB_IF} -p icmp --icmp-type 8 -s 0/0 -m state --state NEW,ESTABLISHED,RELATED -m limit --limit 30/sec  -j ACCEPT
$IPT -A OUTPUT -o ${PUB_IF} -p icmp --icmp-type 0 -d 0/0 -m state --state ESTABLISHED,RELATED -j ACCEPT

# allow outgoing ICMP ping pong stuff
$IPT -A OUTPUT -o ${PUB_IF} -p icmp --icmp-type 8 -d 0/0 -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
$IPT -A INPUT -i ${PUB_IF} -p icmp --icmp-type 0 -s 0/0 -m state --state ESTABLISHED,RELATED -j ACCEPT


# allow incoming HTTP port 443, 80
$IPT -A INPUT -i ${PUB_IF} -p tcp -d ${SERVER_IP} --dport 80 -j ACCEPT
$IPT -A INPUT -i ${PUB_IF} -p tcp -d ${SERVER_IP} --dport 443 -j ACCEPT
$IPT -A OUTPUT -o ${PUB_IF} -p tcp --sport 80 -j ACCEPT
$IPT -A OUTPUT -o ${PUB_IF} -p tcp --sport 443 -j ACCEPT

# Allow MySQL
$IPT -A INPUT -p tcp -s 0/0 --sport 1024:65535 -d ${SERVER_IP} --dport 3306 -m state --state NEW,ESTABLISHED -j ACCEPT
$IPT -A OUTPUT -p tcp -s ${SERVER_IP} --sport 3306 -d 0/0 --dport 1024:65535 -m state --state ESTABLISHED -j ACCEPT

# Allow XRDP communication in intern Network
$IPT -A INPUT -p tcp -s ${RDP_IPS} -d $SERVER_IP --dport 3389 -j ACCEPT
$IPT -A OUTPUT -p tcp -s $SERVER_IP --sport 3389 -d ${RDP_IPS} -j ACCEPT

# Allow Video Stream
$IPT -A INPUT -i ${PUB_IF} -p udp -d ${SERVER_IP} --dport ${VideoStream} -j ACCEPT
$IPT -A OUTPUT -o ${PUB_IF} -p udp -s ${SERVER_IP} --sport ${VIDEO_PORT} -j ACCEPT
$IPT -A INPUT -i ${PUB_IF} -p udp -d ${SERVER_IP} --dport ${VIDEO_PORT} -j ACCEPT
##$IPT -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
##$IPT -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT#

$IPT -A INPUT -i ${PUB_IF} -p tcp -s ${MAIL_IP} --sport 587 -j ACCEPT
$IPT -A OUTPUT -o ${PUB_IF} -p tcp -d ${MAIL_IP} --dport 587 -j ACCEPT

# Allow ssh only from selected public ips
$IPT -A INPUT -p tcp -d ${SERVER_IP} -s ${RDP_IPS} --dport 22 -j ACCEPT
$IPT -A OUTPUT -p tcp -s ${SERVER_IP} --sport 22 -j ACCEPT


# drop and log everything else
$IPT -A INPUT -m limit --limit 5/m --limit-burst 7 -j LOG --log-prefix " DEFAULT DROP "
$IPT -A INPUT -j DROP

exit 0
