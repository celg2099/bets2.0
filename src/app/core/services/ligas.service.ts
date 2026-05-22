import { Injectable, signal, computed } from '@angular/core';

export interface LigaHomologada {
  nombrePublico: string;
  nombreForApi: string;
  historico: number;
  archivoLigas?: string;
  sofascoreId?: number;
  enable: number;
}

@Injectable({ providedIn: 'root' })
export class LigasService {
  readonly ligas: LigaHomologada[] = [
    { nombrePublico: 'Albania', nombreForApi: 'albania/kategoria-superiore/', historico: 0, archivoLigas: 'Albania.json', enable: 1 },
   //: Muchos partidos a la misma hora. { nombrePublico: 'Alemania', nombreForApi: 'germany/bundesliga/', historico: 0, enable: 1 },
   //: Muchos partidos a la misma hora.  { nombrePublico: 'Alemania_L2', nombreForApi: 'germany/2-bundesliga/', historico: 0, enable: 1 },
   //: Muchos partidos a la misma hora.  { nombrePublico: 'Alemania_L3', nombreForApi: 'germany/3-liga/', historico: 0, enable: 1 },
   //: Muchos partidos a la misma hora. { nombrePublico: 'Angola', nombreForApi: 'angola/girabola/', historico: 0,  sofascoreId: 2308, enable: 1 },
    { nombrePublico: 'Arabia_Saudita', nombreForApi: 'saudi-arabia/saudi-professional-league/', historico: 0,  archivoLigas: 'Arabia_Saudita.json', enable: 1 },
    { nombrePublico: 'Argelia', nombreForApi: 'algeria/ligue-1-2025/', historico: 0, archivoLigas: 'Argelia.json', enable: 1 },
    { nombrePublico: 'Argelia_L2', nombreForApi: 'libia/premier-league/', historico: 0, archivoLigas: 'Argelia_L2.json', sofascoreId: 9459, enable: 1 },
    { nombrePublico: 'Argentina', nombreForApi: 'argentina/primera-division-apertura/', historico: 0, archivoLigas: 'Argentina.json', enable: 1 },
    { nombrePublico: 'Argentina_L1', nombreForApi: 'argentina/premier-league/', historico: 0, archivoLigas: 'Argentina_L1.json', sofascoreId: 703, enable: 1 },
    //{ nombrePublico: 'Argentina_C', nombreForApi: 'argentina/premier-league/', historico: 0, sofascoreId: 11386, enable: 1 },
    //{ nombrePublico: 'Argentina_Women', nombreForApi: 'argentina/womens-primera-division-c/', historico: 0, enable: 1 },
    //{ nombrePublico: 'Argentina B Zone A', nombreForApi: 'argentina/primera-nacional-zone-a/', historico: 0 },
    //{ nombrePublico: 'Argentina B Zone B', nombreForApi: 'argentina/primera-nacional-zone-b/', historico: 0 },
    { nombrePublico: 'Armenia', nombreForApi: 'armenia/premier-league/', historico: 0, archivoLigas: 'Armenia.json', enable: 1 },
    { nombrePublico: 'Australia', nombreForApi: 'australia/a-league/', historico: 0,  archivoLigas: 'Australia.json', enable: 1 },
     //: % bajo de empate.{ nombrePublico: 'Australia_Tasmania', nombreForApi: 'australia/tasmania/', historico: 0, enable: 1 },
    { nombrePublico: 'Austria', nombreForApi: 'austria/bundesliga/', historico: 0,  archivoLigas: 'Austria.json', enable: 1 },
     //: % bajo de empate. { nombrePublico: 'Barein', nombreForApi: 'bahrain/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Bielorusia', nombreForApi: 'belarus/premier-league/', historico: 0, archivoLigas: 'Bielorusia.json', enable: 1 },
     //: % bajo de empate. { nombrePublico: 'Bolivia', nombreForApi: 'bolivia/primera-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Brasil', nombreForApi: 'brazil/serie-a/', historico: 0, archivoLigas: 'Brasil.json', enable: 1 },
    { nombrePublico: 'Benin', nombreForApi: 'Benin/serie-a/', historico: 0, archivoLigas: 'Benin.json', sofascoreId: 22542, enable: 1 },
    { nombrePublico: 'Brasil_B', nombreForApi: 'brazil/serie-b/', historico: 0, archivoLigas: 'Brasil_B.json', enable: 1 },
    { nombrePublico: 'Bulgaria', nombreForApi: 'bulgaria/parva-liga/', historico: 0, archivoLigas: 'Bulgaria.json', enable: 1 },
    //{ nombrePublico: 'Camboya', nombreForApi: 'cambodia/c-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Camerun', nombreForApi: 'cameroon/elite-1/', historico: 0, archivoLigas: 'Camerun.json', enable: 1 },
    { nombrePublico: 'Canada', nombreForApi: 'canada/premier-league/', historico: 0, archivoLigas: 'Canada.json', enable: 1 },
     //: % bajo de empate. { nombrePublico: 'Chile', nombreForApi: 'chile/primera-division/', historico: 0, enable: 1 },
     //: % bajo de empate. { nombrePublico: 'China', nombreForApi: 'china/super-league/', historico: 0, enable: 1 },
    { nombrePublico: 'China_L2', nombreForApi: 'China_L2/super-league/', historico: 0, archivoLigas: 'China_L2.json', sofascoreId: 10381, enable: 1 },
     //: % bajo de empate. { nombrePublico: 'Chipre', nombreForApi: 'cyprus/1-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Colombia', nombreForApi: 'colombia/primera-a-apertura/',  archivoLigas: 'Colombia.json', historico: 0, enable: 1 },
    { nombrePublico: 'Colombia_B', nombreForApi: 'colombia/primera-b-apertura/', archivoLigas: 'Colombia_B.json', historico: 0, enable: 1 },
    { nombrePublico: 'Costa_Rica', nombreForApi: 'costa-rica/primera-division-clausura/', historico: 0, enable: 1 },
    { nombrePublico: 'Croacia', nombreForApi: 'croatia/1st-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Dinamarca', nombreForApi: 'denmark/superliga/', historico: 0, enable: 1 },
    { nombrePublico: 'Dinamarca_L1', nombreForApi: 'denmark/1-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Ecuador', nombreForApi: 'ecuador/serie-a/', historico: 0, archivoLigas: 'Ecuador.json', enable: 1 },
    { nombrePublico: 'Ecuador_B', nombreForApi: 'ecuador/liga-pro-serie-b/', historico: 0, archivoLigas: 'Ecuador_B.json', enable: 1 },
    { nombrePublico: 'Egipto', nombreForApi: 'egypt/premier-league/', historico: 0, archivoLigas: 'Egipto.json', sofascoreId: 808, enable: 1 },
    { nombrePublico: 'Egipto_L2', nombreForApi: 'egypt/2-division-a/', historico: 0, archivoLigas: 'Egipto_L2.json', enable: 1 },
    { nombrePublico: 'El_Salvador', nombreForApi: 'el-salvador/primera-division-clausura/', historico: 0, enable: 1 },
    { nombrePublico: 'Emiratos_Arabes_Unidos', nombreForApi: 'united-arab-emirates/uae-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Escocia', nombreForApi: 'scotland/scotland-premiership/', historico: 0, enable: 1 },
    { nombrePublico: 'Eslovaquia', nombreForApi: 'slovakia/fortuna-liga/', historico: 0, enable: 1 },
    { nombrePublico: 'Eslovenia', nombreForApi: 'slovenia/prva-liga/', historico: 0, enable: 1 },
    { nombrePublico: 'España', nombreForApi: 'spain/laliga/', historico: 0, enable: 1 },
    { nombrePublico: 'España_L2', nombreForApi: 'spain/laliga-2/', historico: 0, enable: 1 },
    { nombrePublico: 'España_D2_G3', nombreForApi: 'spain/segunda-division-rfef-group-3/', historico: 0, archivoLigas: 'España_D2_G3.json', enable: 1 },
    { nombrePublico: 'Estonia', nombreForApi: 'estonia/meistriliiga-2025/', historico: 0, enable: 1 },
    { nombrePublico: 'Finlandia', nombreForApi: 'finland/veikkausliiga/', historico: 0, archivoLigas: 'Finlandia.json', enable: 1 },
    { nombrePublico: 'Francia', nombreForApi: 'france/ligue-1/', historico: 0, enable: 1 },
    { nombrePublico: 'Francia_L2', nombreForApi: 'france/ligue-2/', historico: 0, archivoLigas: 'Francia_L2.json', enable: 1 },
    { nombrePublico: 'Gales', nombreForApi: 'wales/cymru-premier/', historico: 0, enable: 1 },
    { nombrePublico: 'Georgia', nombreForApi: 'georgia/erovnuli-liga/', historico: 0,  archivoLigas: 'Georgia.json', enable: 1 },
    { nombrePublico: 'Grecia', nombreForApi: 'greece/super-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Guatemala', nombreForApi: 'guatemala/liga-nacional-clausura/', historico: 0, archivoLigas: 'Guatemala.json', enable: 1 },
    { nombrePublico: 'Guatemala_1era', nombreForApi: 'guatemala/primera-division/', historico: 0, archivoLigas: 'Guatemala_1era.json', sofascoreId: 28165, enable: 1 },
    { nombrePublico: 'Holanda', nombreForApi: 'netherlands/eredivisie/', historico: 0, enable: 1 },
    { nombrePublico: 'Honduras', nombreForApi: 'honduras/liga-nacional-clausura/', historico: 0, archivoLigas: 'Honduras.json', enable: 1 },
    { nombrePublico: 'Hong_Kong', nombreForApi: 'hong-kong/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Hungria', nombreForApi: 'hungary/nb-i/', historico: 0, enable: 1 },
    { nombrePublico: 'India', nombreForApi: 'india/indian-super-league/', historico: 0, archivoLigas: 'India.json', enable: 1 },
    { nombrePublico: 'India_I_League', nombreForApi: 'india/i-league/', historico: 0, archivoLigas: 'India_I_League.json', enable: 1 },
    { nombrePublico: 'Indonesia', nombreForApi: 'indonesia/super-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Inglaterra', nombreForApi: 'england/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Inglaterra_L2', nombreForApi: 'england/league-2/', historico: 0, enable: 1 },
    { nombrePublico: 'Irlanda', nombreForApi: 'ireland/league-of-ireland-premier-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Irlanda_Del_Norte', nombreForApi: 'northern-ireland/premiership/', historico: 0, enable: 1 },
    { nombrePublico: 'Iran_L2', nombreForApi: 'Iran_L2/botola-2/', historico: 0, archivoLigas: 'Iran_L2.json', sofascoreId: 11338, enable: 1 },
    { nombrePublico: 'Islandia', nombreForApi: 'iceland/urvalsdeild/', historico: 0, enable: 1 },
    { nombrePublico: 'Islas_Faroe', nombreForApi: 'faroe-islands/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Israel', nombreForApi: 'israel/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Italia', nombreForApi: 'italy/serie-a/', historico: 0, enable: 1 },
    { nombrePublico: 'Italia_B', nombreForApi: 'italy/serie-b/', historico: 0, archivoLigas: 'Italia_B.json', enable: 1 },
    { nombrePublico: 'Jamaica', nombreForApi: 'jamaica/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Japon', nombreForApi: 'japan/j-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Jordania', nombreForApi: 'jordan/pro-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Kazajistan', nombreForApi: 'kazakhstan/premier-league/', archivoLigas: 'Kazajistan.json', historico: 0, enable: 1 },
    { nombrePublico: 'Korea_del_Sur', nombreForApi: 'republic-of-korea/k-league-1/', historico: 0, enable: 1 },
    { nombrePublico: 'Kuwait', nombreForApi: 'kuwait/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Lituania', nombreForApi: 'lithuania/a-lyga/', historico: 0, enable: 1 },
    { nombrePublico: 'Luxemburgo', nombreForApi: 'luxembourg/national-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Mauritania', nombreForApi: 'Mauritania/botola-3/', historico: 0, archivoLigas: 'Mauritania.json', sofascoreId: 23703, enable: 1 },
    //{ nombrePublico: 'Mauritania_L1', nombreForApi: 'Mauritania_L1/botola-3/', historico: 0, archivoLigas: 'Mauritania_L1.json', sofascoreId: 16527, enable: 1 },
    { nombrePublico: 'Macedonia_del_Norte', nombreForApi: 'north-macedonia/1st-league', historico: 0, enable: 1 },
    { nombrePublico: 'Marruecos', nombreForApi: 'morocco/botola-pro/', historico: 0, archivoLigas: 'Marruecos.json', enable: 1 },
    { nombrePublico: 'Marruecos_L2', nombreForApi: 'morocco/botola-2/', historico: 0, archivoLigas: 'Marruecos_L2.json', sofascoreId: 10554, enable: 1 },
    { nombrePublico: 'Mexico', nombreForApi: 'mexico/liga-mx-clausura/', historico: 0, enable: 1 },
    { nombrePublico: 'Mexico_Expansion', nombreForApi: 'mexico/liga-de-expansion-mx-clausura/', historico: 0, enable: 1 },
    //{ nombrePublico: 'México_Femenil', nombreForApi: 'mexico/womens-liga-mx-apertura/', historico: 0, enable: 1 },
    //{ nombrePublico: 'México_U20', nombreForApi: 'mexico/liga-mx-u20-clausura/', historico: 0, enable: 1 },
    { nombrePublico: 'Myanmar', nombreForApi: 'myanmar/national-league/', historico: 0, sofascoreId: 10535, enable: 1 },
    { nombrePublico: 'Moldavia', nombreForApi: 'moldova/national-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Montenegro', nombreForApi: 'montenegro/1-cfl/', historico: 0, enable: 1 },
    { nombrePublico: 'Nicaragua', nombreForApi: 'nicaragua/primera-division-clausura/', historico: 0, archivoLigas: 'Nicaragua.json', sofascoreId: 10533, enable: 1 },
    { nombrePublico: 'Noruega', nombreForApi: 'norway/1-division/', historico: 0, archivoLigas: 'Noruega.json', enable: 1 },
    { nombrePublico: 'Namibia', nombreForApi: 'Namibia/1-division/', historico: 0,  sofascoreId: 21358, enable: 1 },
    //{ nombrePublico: 'Panama_EAST', nombreForApi: 'panama/lpf-apertura-east/', historico: 0 },
    //{ nombrePublico: 'Panama_West', nombreForApi: 'panama/lpf-apertura-west/', historico: 0 },
    { nombrePublico: 'Panama', nombreForApi: 'panama/lpf-apertura-west/', historico: 0, archivoLigas: 'Panama.json', sofascoreId: 11533, enable: 1 },
    { nombrePublico: 'Paraguay', nombreForApi: 'paraguay/division-profesional-apertura/', historico: 0, enable: 1 },
    { nombrePublico: 'Paraguay_Int', nombreForApi: 'paraguay/division-intermedia/', historico: 0, archivoLigas: 'Paraguay_Int.json', enable: 1 },
    { nombrePublico: 'Peru', nombreForApi: 'peru/liga-1/', historico: 0, enable: 1 },
    { nombrePublico: 'Polonia', nombreForApi: 'poland/ekstraklasa/', historico: 0, enable: 1 },
    { nombrePublico: 'Polonia_L1', nombreForApi: 'poland/i-liga/', historico: 0, enable: 1 },
    { nombrePublico: 'Portugal', nombreForApi: 'portugal/primeira-liga/', historico: 0, enable: 1 },
    { nombrePublico: 'Portugal_L2', nombreForApi: 'portugal/segunda-liga/', archivoLigas: 'Portugal_L2.json', historico: 0, enable: 1 },
    { nombrePublico: 'Qatar', nombreForApi: 'qatar/qatar-stars-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Republica_Checa', nombreForApi: 'czech-republic/1st-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Rumania', nombreForApi: 'romania/liga-1/', historico: 0, enable: 1 },
    { nombrePublico: 'Singapur', nombreForApi: 'singapore/sg-premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Sierra_Leona', nombreForApi: 'sierra-leone/premier-league/', archivoLigas: 'Sierra_Leona.json', sofascoreId: 16950, historico: 0, enable: 1 },
    { nombrePublico: 'Sudafrica', nombreForApi: 'south-africa/premier-league/', archivoLigas: 'Sudafrica.json', historico: 0, enable: 1 },
    { nombrePublico: 'Suecia', nombreForApi: 'sweden/allsvenskan/', historico: 0, enable: 1 },
    { nombrePublico: 'Suiza', nombreForApi: 'switzerland/super-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Tanzania', nombreForApi: 'tanzania/premier-league/', historico: 0, archivoLigas: 'Tanzania.json', enable: 1 },
    { nombrePublico: 'Thailandia', nombreForApi: 'thailand/thai-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Tunez', nombreForApi: 'libia/premier-league/', historico: 0, archivoLigas: 'Tunez.json', sofascoreId: 984, enable: 1 },  // 10633 - id tunez L2
    { nombrePublico: 'Turquia', nombreForApi: 'turquia/1st-lig', historico: 0, archivoLigas: 'Turquia.json', sofascoreId: 52, enable: 1 },
    //{ nombrePublico: 'Turquia_L1', nombreForApi: 'turkiye/1st-lig/', historico: 0, sofascoreId: 98 },
    { nombrePublico: 'Ucrania', nombreForApi: 'ukraine/premier-league/', historico: 0, enable: 1 },
    { nombrePublico: 'Uganda', nombreForApi: 'uganda/premier-league/', historico: 0, archivoLigas: 'Uganda.json',  sofascoreId: 10166, enable: 1 },
    { nombrePublico: 'Uruguay', nombreForApi: 'uruguay/primera-division-apertura/',  archivoLigas: 'Uruguay.json', historico: 0, enable: 1 },
    { nombrePublico: 'USA_MLS', nombreForApi: 'usa/major-league-soccer/', historico: 0, enable: 1 },
    { nombrePublico: 'Uzbekistan', nombreForApi: 'uzbekistan/superliga/', historico: 0, enable: 1 },
    { nombrePublico: 'Venezuela', nombreForApi: 'venezuela/primera-division/', historico: 0, enable: 1 },
    { nombrePublico: 'Vietnam', nombreForApi: 'vietnam/v-league/', historico: 0, archivoLigas: 'Vietnam.json', enable: 1 },
    //{ nombrePublico: 'Argentina_1era', nombreForApi: 'libia/stars-league/', historico: 0, sofascoreId: 703 }, // NO GOD

    { nombrePublico: 'Rusia', nombreForApi: 'libia/stars-league/', historico: 0, archivoLigas: 'Rusia.json', sofascoreId: 203, enable: 1 }, // GOOD
    { nombrePublico: 'Senegal', nombreForApi: 'senegal/stars-league/', historico: 0, archivoLigas: 'Senegal.json', sofascoreId: 1226, enable: 1 },
    { nombrePublico: 'Senegal_L2', nombreForApi: 'Senegal_L2/stars-league/', historico: 0, sofascoreId: 30857, enable: 1 },
    { nombrePublico: 'Etiopia', nombreForApi: 'B/stars-league/', historico: 0, archivoLigas: 'Etiopia.json', sofascoreId: 16601, enable: 1 },
    { nombrePublico: 'Oman', nombreForApi: 'F/stars-league/', historico: 0, archivoLigas: 'Oman.json', sofascoreId: 965, enable: 1 },
    { nombrePublico: 'Gambia', nombreForApi: 'C/stars-league/', historico: 0, archivoLigas: 'Gambia.json', sofascoreId: 16610, enable: 1 },
    //{ nombrePublico: 'Gambia_L2', nombreForApi: 'C/stars-leagueL2/', historico: 0, archivoLigas: 'Gambia_L2.json',  sofascoreId: 16638, enable: 1 },
    { nombrePublico: 'Chile_L2', nombreForApi: 'D/stars-league/', historico: 0, sofascoreId: 1240, enable: 1 },
    { nombrePublico: 'Uruguay_L2', nombreForApi: 'E/stars-league/', archivoLigas: 'Uruguay_L2.json' ,historico: 0, sofascoreId: 1908, enable: 1 },
     //: % bajo de empate. { nombrePublico: 'Eswatini', nombreForApi: 'Eswatini/stars-league/', historico: 0, sofascoreId: 18452, enable: 1 },
     //: % bajo de empate.{ nombrePublico: 'Chad', nombreForApi: 'chad/stars-league/', historico: 0, sofascoreId: 22106, enable: 1 },

    { nombrePublico: 'Burkina', nombreForApi: 'Burkina/ligue-1/', archivoLigas: 'Burkina.json', sofascoreId: 29369,  historico: 0, enable: 1 },


    // { nombrePublico: 'Egipto_LB', nombreForApi: 'mauritania/ligue-1/', sofascoreId: 23703, archivoLigas: 'Egipto_LB.json', historico: 0, enable: 1 },
    //: Muchos partidos a la misma hora.{ nombrePublico: 'Zimbawe', nombreForApi: 'Zimbawe/stars-league/', historico: 0, sofascoreId: 11033, enable: 1 },

  ];

  private readonly historicosDisponibles = new Set<string>([
    'Albania', 'Alemania_L2', 'Arabia_Saudita', 'Argelia', 'Argelia_L2', 'Argentina', 'Argentina_L1',
    'Argentina_Women', 'Armenia', 'Australia', 'Australia_Tasmania', 'Austria',
    'Benin', 'Bielorusia', 'Bolivia', 'Brasil', 'Brasil_B', 'Bulgaria', 'Camerun',
    'Canada', 'Chile', 'China', 'China_L2', 'Burkina', 'Colombia', 'Colombia_B', 'Costa_Rica',
    'Croacia', 'Dinamarca', 'Ecuador', 'Ecuador_B', 'Egipto', 'Egipto_L2',
    'El_Salvador', 'Emiratos_Arabes_Unidos', 'Eslovenia', 'España',
    'España_L2', 'España_D2_G3', 'Estonia', 'Finlandia', 'Francia', 'Francia_L2', 'Georgia',
    'Grecia', 'Guatemala', 'Guatemala_1era', 'Holanda', 'Honduras', 'Hong_Kong', 'Hungria', 'India', 'India_I_League',
    'Indonesia', 'Iran_L2', 'Israel', 'Italia', 'Italia_B', 'Jamaica', 'Japon',
    'Jordania', 'Kazajistan', 'Korea_del_Sur', 'Kuwait', 'Lituania', 'Mauritania', 'Mauritania_L1',
    'Marruecos', 'Marruecos_L2', 'Mexico', 'Mexico_Expansion', 'México_Femenil', 'Nicaragua', 'Niger', 'Noruega',
    'Panama', 'Paraguay', 'Paraguay_Int', 'Peru', 'Polonia', 'Polonia_L1', 'Portugal', 'Portugal_L2', 'Qatar',
    'Etiopia', 'Gambia', 'Gambia_L2','Oman', 'Republica_Checa', 'Rumania', 'Rusia',
    'Senegal', 'Singapur', 'Sierra_Leona', 'Sudafrica','Suecia', 'Suiza',
    'Tanzania', 'Thailandia', 'Tunez', 'Turquia', 'Ucrania',
    'Uruguay', 'Uruguay_L2', 'Uganda', 'USA_MLS', 'Uzbekistan', 'Vietnam', 'Egipto_LB'
  ]);

  tieneHistorico(nombrePublico: string): boolean {
    return this.historicosDisponibles.has(nombrePublico);
  }

  tieneAmbosArchivos(liga: LigaHomologada): boolean {
    return this.historicosDisponibles.has(liga.nombrePublico) && !!liga.archivoLigas;
  }

  busqueda = signal('');
  ligaSeleccionada = signal<LigaHomologada | null>(null);

  ligasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.ligas;
    return this.ligas.filter((l) =>
      l.nombrePublico.toLowerCase().includes(q)
    );
  });
}
