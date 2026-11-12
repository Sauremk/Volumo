const MUS = {
 pecho:{n:'Pecho',v:'f',src:'Estudio ACE (EMG de 9 ejercicios) y estudios de inclinación del banco.',r:[
  ['pb','La que más activa el pectoral en el estudio ACE'],['pd','98% de la activación del press de banca'],['ap','93% de la activación del press de banca'],
  ['pi','Mejor opción para pecho superior (banco a 30°)'],['pmq','Buena activación y fácil de llevar al fallo'],['fd','Más pecho si te inclinas hacia delante'],['fl','La de menor activación del estudio ACE']]},
 hombros:{n:'Hombros',v:'fb',src:'Estudio ACE de deltoides (10 ejercicios) y estudios EMG de elevaciones.',r:[
  ['pmm','El que más activa el hombro frontal (ACE)'],['el','El más usado para el hombro lateral, que da anchura'],['elp','Tensión constante: de los favoritos para crecer'],
  ['ri45','Máxima activación del hombro lateral y posterior (ACE)'],['pj','El que más activa el hombro posterior (ACE)'],['fp','Hombro posterior y salud del hombro'],
  ['pmi','Buena opción, algo menos de recorrido que las mancuernas'],['ef','Poco necesario si ya haces press']]},
 biceps:{n:'Bíceps',v:'f',src:'Estudio ACE de bíceps (EMG de 8 ejercicios).',r:[
  ['cc','El que más activa el bíceps en el estudio ACE'],['cpo','2º en activación (ACE)'],['dms','3º en activación, y además trabaja espalda'],
  ['cbb','4º en activación (ACE)'],['cz','Algo por debajo de la barra recta'],['cb','Variante clásica, útil para corregir desbalances'],
  ['cinc','Bajo en EMG, aunque estira mucho el bíceps'],['cpr','El de menor activación del estudio ACE']]},
 triceps:{n:'Tríceps',v:'b',src:'Estudio ACE de tríceps (EMG) y estudios de crecimiento muscular.',r:[
  ['eoh','En estudios hizo crecer más el tríceps que el jalón'],['fdi','La de mayor activación en el estudio ACE'],['fd','Muy alta activación y permite mucho peso'],
  ['pt','Sorprendentemente alta en el estudio ACE'],['tpc','La cuerda rinde un poco más que la barra'],['tp','Buena para acumular volumen'],['pc','La de menor activación del estudio ACE']]},
 antebrazos:{n:'Antebrazos',v:'fb',src:'Hay poca investigación específica; ordenado por tensión directa en el antebrazo.',r:[
  ['cm','Trabaja braquiorradial y braquial con carga alta'],['cinvb','Trabaja los extensores, a menudo olvidados'],['cmu','Aísla los flexores del antebrazo'],
  ['farm','Agarre fuerte con mucha carga'],['colg','Agarre isométrico, fácil de hacer']]},
 abdomen:{n:'Abdomen',v:'f',src:'Estudio ACE / Universidad Estatal de San Diego (13 ejercicios de abdomen).',r:[
  ['bic','El que más activa el recto abdominal (ACE)'],['ep','2º en el recto abdominal (ACE)'],['cfb','3º, y fuerza menos la cadera (ACE)'],
  ['cpv','4º en activación (ACE)'],['cinv','Mejor que el crunch normal (ACE)'],['cr','Permite añadir peso progresivamente'],['pl','Muy buena para estabilidad'],['crt','Por debajo de casi todos (ACE)']]},
 oblicuos:{n:'Oblicuos',v:'f',src:'Estudio ACE (actividad de oblicuos en 13 ejercicios).',r:[
  ['ep','El que más activa los oblicuos (ACE)'],['bic','2º en oblicuos (ACE)'],['cinv','3º en oblicuos (ACE)'],
  ['pl','4º en oblicuos (ACE)'],['cpv','5º en oblicuos (ACE)'],['pll','Trabaja oblicuos de forma isométrica']]},
 cuadriceps:{n:'Cuádriceps',v:'f',src:'Estudios de crecimiento (sentadilla vs. extensión, prensa vs. extensión).',r:[
  ['hack','Mucha tensión, estable y fácil de progresar'],['sq','Gran crecimiento del vasto lateral y medial'],['pr','Crece como la sentadilla, con menos fatiga'],
  ['ext','La que más hace crecer el recto femoral'],['bulg','Cuádriceps y glúteo con una pierna'],['zc','Más glúteo que cuádriceps']]},
 gemelos:{n:'Gemelos',v:'fb',src:'Kinoshita, Maeo et al. 2023 (de pie vs. sentado, resonancia magnética).',r:[
  ['gm','De pie hizo crecer ~2,7× más la pantorrilla que sentado'],['gpr','Piernas rectas: mismo efecto que de pie'],['gup','Piernas rectas y una pierna a la vez'],
  ['gs','Casi no trabaja el gemelo; solo el sóleo']]},
 trapecio:{n:'Trapecio',v:'b',src:'Estudios EMG de espalda alta y peso muerto.',r:[
  ['pm','Mucho trabajo del trapecio con carga alta'],['enc','Aísla el trapecio superior'],['rmen','Trapecio y hombro lateral'],
  ['fp','Trapecio medio y bajo'],['ri45','Espalda alta y hombro posterior']]},
 dorsales:{n:'Dorsales',v:'b',src:'Estudio ACE de espalda (8 ejercicios) y Contreras (35 ejercicios).',r:[
  ['dm','La que más activa el dorsal'],['rb','La mejor para toda la espalda (ACE)'],['jp','Activación similar con cualquier agarre'],
  ['rm','Alta activación del dorsal y romboides'],['pul','Aísla el dorsal'],['rps','Buena opción en polea'],['rinv','El de menor activación del estudio ACE']]},
 lumbar:{n:'Zona lumbar',v:'b',src:'Estudios EMG de la cadena posterior.',r:[
  ['pm','Máxima activación de toda la espalda baja'],['pmr','Lumbar, glúteos e isquios'],['hip','Aísla la lumbar con poco riesgo'],
  ['bd','Efectivo pero más técnico'],['sup','Fácil, para empezar']]},
 gluteos:{n:'Glúteos',v:'b',src:'Contreras 2015, Goller 2024 (EMG) y Collings 2023/2025 (fuerza muscular).',r:[
  ['hp','Máxima activación del glúteo (143% en EMG)'],['bulg','De las que más fuerza le exigen al glúteo'],['pmr','Mucha fuerza del glúteo en posición estirada'],
  ['zc','Caminando activan más el glúteo que estáticas'],['sq','Trabaja el glúteo, pero el cuádriceps hace más'],['pg','Versión fácil del hip thrust'],['abd','Glúteo medio; poco valor como ejercicio principal']]},
 isquios:{n:'Isquiotibiales',v:'b',src:'Maeo 2021 (sentado vs. tumbado), estudios de curl nórdico y peso muerto.',r:[
  ['cfs','Hizo crecer más los isquios que el curl tumbado'],['pmr','Crece mucho el semimembranoso'],['nord','Gran crecimiento y previene lesiones'],
  ['ci','Funciona, pero por debajo del sentado'],['bd','Alternativa de bisagra de cadera']]}
};

