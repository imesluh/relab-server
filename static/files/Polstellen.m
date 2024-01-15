%%%% Berechnung der Steuerbarkeits- und Beobachterkeitsmatrix, des Rückführvektors und des Beobachters des Inversen Einfachpendels


%% Berechnung der Hilfsvariablen
m_p = ???;
l_p = ???;
d_p = ???;    %Hier SI-Einheit verwenden!!!

g = 9.81; % Erdbeschleunigung


%% Anlegen der A-Matrix, des B-Vektors und der C-Matrix, ddx als ideal angenommen (ddx = u(t))

A = ???;

B = ???;

C = ???;

%% Berechnung der Rückführvektoren

% zeitkontinuierliche Pole
p = ???;

% Berechnung des Rückführvektors
K = place(A,B,p);

V = ???; %Berechnung des Vorfilters;
