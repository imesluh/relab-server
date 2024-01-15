function [r_i_Si,J_i_i,m] = GetDynamikParameter()
% Dynamikparameter aus Datenblatt (Spec_Robot_Model_Parameters_v1_0.pdf)
% J_i_i in kg*mm^2
% r_i_Si in mm
% m in kg
%% Massen
m=[5.976;9.572;4.557;2.588;2.588;1.025];%kg
%% Massenträgheitstensoren und Schwerpunktskoordinaten 
% aller Segmente i im KS_i (Wahl der KS_i nach CÜ2)
J_i_i=zeros(3,3,6);
r_i_Si=zeros(3,6);
% Link 1
i=1;
J_i_i(1,1,i)=4.641e-2;%Ixx in kg*m^2
J_i_i(2,2,i)=3.619e-2;%Iyy
J_i_i(3,3,i)=2.264e-2;%Izz
J_i_i(1,2,i)=0.002e-2;%Ixy
J_i_i(2,1,i)=J_i_i(1,2,i);
J_i_i(2,3,i)=-0.001e-2;%Iyz
J_i_i(3,2,i)=J_i_i(2,3,i);
J_i_i(1,3,i)=0.001e-2;%Ixz
J_i_i(3,1,i)=J_i_i(1,3,i);
r_i_Si(1,i)=0.02e-3;%x_Si in m
r_i_Si(2,i)=6.35e-3;%y_Si
r_i_Si(3,i)=33.42e-3;%z_Si
% Link 2
i=2;
J_i_i(1,1,i)=4.223e-2;%Ixx in kg*m^2
J_i_i(2,2,i)=99.637e-2;%Iyy
J_i_i(3,3,i)=97.760e-2;%Izz
J_i_i(1,2,i)=0.006e-2;%Ixy
J_i_i(2,1,i)=J_i_i(1,2,i);
J_i_i(2,3,i)=1.707e-2;%Iyz
J_i_i(3,2,i)=J_i_i(2,3,i);
J_i_i(1,3,i)=0e-2;%Ixz
J_i_i(3,1,i)=J_i_i(1,3,i);
r_i_Si(1,i)=-233.26e-3;%x_Si in m
r_i_Si(2,i)=0e-3;%y_Si
r_i_Si(3,i)=-4.83e-3;%z_Si
% Link 3
i=3;
J_i_i(1,1,i)=3.218e-2;%Ixx in kg*m^2
J_i_i(2,2,i)=44.258e-2;%Iyy
J_i_i(3,3,i)=41.879e-2;%Izz
J_i_i(1,2,i)=-0.002e-2;%Ixy
J_i_i(2,1,i)=J_i_i(1,2,i);
J_i_i(2,3,i)=-7.558e-2;%Iyz
J_i_i(3,2,i)=J_i_i(2,3,i);
J_i_i(1,3,i)=0e-2;%Ixz
J_i_i(3,1,i)=J_i_i(1,3,i);
r_i_Si(1,i)=-186.89e-3;%x_Si in m
r_i_Si(2,i)=-0.04e-3;%y_Si
r_i_Si(3,i)=27.56e-3;%z_Si
% Link 4
i=4;
J_i_i(1,1,i)=1.372e-2;%Ixx in kg*m^2
J_i_i(2,2,i)=0.681e-2;%Iyy
J_i_i(3,3,i)=1.059e-2;%Izz
J_i_i(1,2,i)=0e-2;%Ixy
J_i_i(2,1,i)=J_i_i(1,2,i);
J_i_i(2,3,i)=-0.001e-2;%Iyz
J_i_i(3,2,i)=J_i_i(2,3,i);
J_i_i(1,3,i)=0.004e-2;%Ixz
J_i_i(3,1,i)=J_i_i(1,3,i);
r_i_Si(1,i)=-0.05e-3;%x_Si in m
r_i_Si(2,i)=23.89e-3;%y_Si
r_i_Si(3,i)=0.75e-3;%z_Si
% Link 5
i=5;
J_i_i(1,1,i)=1.372e-2;%Ixx in kg*m^2
J_i_i(2,2,i)=0.681e-2;%Iyy
J_i_i(3,3,i)=1.059e-2;%Izz
J_i_i(1,2,i)=0.001e-2;%Ixy
J_i_i(2,1,i)=J_i_i(1,2,i);
J_i_i(2,3,i)=0.001e-2;%Iyz
J_i_i(3,2,i)=J_i_i(2,3,i);
J_i_i(1,3,i)=-0.004e-2;%Ixz
J_i_i(3,1,i)=J_i_i(1,3,i);
r_i_Si(1,i)=0.08e-3;%x_Si in m
r_i_Si(2,i)=-16.19e-3;%y_Si
r_i_Si(3,i)=6.75e-3;%z_Si
% Link 6
i=6;
J_i_i(1,1,i)=1.057e-2;%Ixx in kg*m^2
J_i_i(2,2,i)=0.971e-2;%Iyy
J_i_i(3,3,i)=0.221e-2;%Izz
J_i_i(1,2,i)=-0.001e-2;%Ixy
J_i_i(2,1,i)=J_i_i(1,2,i);
J_i_i(2,3,i)=0.001e-2;%Iyz
J_i_i(3,2,i)=J_i_i(2,3,i);
J_i_i(1,3,i)=-0.003e-2;%Ixz
J_i_i(3,1,i)=J_i_i(1,3,i);
r_i_Si(1,i)=-0.13e-3;%x_Si in m
r_i_Si(2,i)=1.5e-3;%y_Si
r_i_Si(3,i)=-73.84e-3;%z_Si
% Umrechnung zu mm
J_i_i=J_i_i*10^6;%[kg*mm^2]
r_i_Si=r_i_Si*10^3;%[mm]
end
