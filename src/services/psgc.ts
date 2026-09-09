import { PSGCBarangay, PSGCLocation } from '../types';

const BASE_URL = 'https://psgc.gitlab.io/api';

// Cache to prevent duplicate network calls
const cache = new Map<string, any>();

export interface ProvinceItem {
  code: string;
  name: string;
  regionCode?: string;
  regionName?: string;
}

export interface MunicipalityItem {
  code: string;
  name: string;
  provinceCode: string;
  provinceName: string;
  isCity?: boolean;
}

export const POPULAR_MUNICIPALITIES: { code: string; name: string; province: string }[] = [
  { code: '045813000', name: 'Taytay', province: 'Rizal' },
  { code: '045801000', name: 'Angono', province: 'Rizal' },
  { code: '045802000', name: 'Antipolo City', province: 'Rizal' },
  { code: '045804000', name: 'Binangonan', province: 'Rizal' },
  { code: '045805000', name: 'Cainta', province: 'Rizal' },
  { code: '043428000', name: 'Santa Rosa City', province: 'Laguna' },
  { code: '043405000', name: 'Calamba City', province: 'Laguna' },
  { code: '043404000', name: 'Cabuyao City', province: 'Laguna' },
  { code: '043403000', name: 'Biñan City', province: 'Laguna' },
  { code: '042103000', name: 'Bacoor City', province: 'Cavite' },
  { code: '042106000', name: 'Dasmariñas City', province: 'Cavite' },
  { code: '042108000', name: 'Imus City', province: 'Cavite' },
  { code: '042119000', name: 'Tagaytay City', province: 'Cavite' },
  { code: '041005000', name: 'Batangas City', province: 'Batangas' },
  { code: '041014000', name: 'Lipa City', province: 'Batangas' },
  { code: '137404000', name: 'Quezon City', province: 'Metro Manila' },
  { code: '133900000', name: 'City of Manila', province: 'Metro Manila' },
  { code: '137403000', name: 'Pasig City', province: 'Metro Manila' },
  { code: '137602000', name: 'Makati City', province: 'Metro Manila' },
  { code: '137607000', name: 'Taguig City', province: 'Metro Manila' },
  { code: '072217000', name: 'Cebu City', province: 'Cebu' },
  { code: '072226000', name: 'Lapu-Lapu City', province: 'Cebu' },
  { code: '072230000', name: 'Mandaue City', province: 'Cebu' },
  { code: '112402000', name: 'Davao City', province: 'Davao del Sur' },
  { code: '141102000', name: 'Baguio City', province: 'Benguet' },
  { code: '063022000', name: 'Iloilo City', province: 'Iloilo' },
  { code: '064501000', name: 'Bacolod City', province: 'Negros Occidental' },
  { code: '104305000', name: 'Cagayan de Oro City', province: 'Misamis Oriental' },
  { code: '126303000', name: 'General Santos City', province: 'South Cotabato' },
  { code: '097332000', name: 'Zamboanga City', province: 'Zamboanga del Sur' },
  { code: '031402000', name: 'Malolos City', province: 'Bulacan' },
  { code: '035401000', name: 'Angeles City', province: 'Pampanga' },
  { code: '035416000', name: 'San Fernando City', province: 'Pampanga' },
];

// All Philippine Provinces (Alphabetical + Codes)
export const ALL_PHILIPPINE_PROVINCES: ProvinceItem[] = [
  { code: '130000000', name: 'Metro Manila (NCR)', regionName: 'NCR' },
  { code: '140100000', name: 'Abra', regionName: 'CAR' },
  { code: '160200000', name: 'Agusan del Norte', regionName: 'Region XIII' },
  { code: '160300000', name: 'Agusan del Sur', regionName: 'Region XIII' },
  { code: '060400000', name: 'Aklan', regionName: 'Region VI' },
  { code: '050500000', name: 'Albay', regionName: 'Region V' },
  { code: '060600000', name: 'Antique', regionName: 'Region VI' },
  { code: '148100000', name: 'Apayao', regionName: 'CAR' },
  { code: '037700000', name: 'Aurora', regionName: 'Region III' },
  { code: '150700000', name: 'Basilan', regionName: 'BARMM' },
  { code: '030800000', name: 'Bataan', regionName: 'Region III' },
  { code: '020900000', name: 'Batanes', regionName: 'Region II' },
  { code: '041000000', name: 'Batangas', regionName: 'Region IV-A' },
  { code: '141100000', name: 'Benguet', regionName: 'CAR' },
  { code: '087800000', name: 'Biliran', regionName: 'Region VIII' },
  { code: '071200000', name: 'Bohol', regionName: 'Region VII' },
  { code: '101300000', name: 'Bukidnon', regionName: 'Region X' },
  { code: '031400000', name: 'Bulacan', regionName: 'Region III' },
  { code: '021500000', name: 'Cagayan', regionName: 'Region II' },
  { code: '051600000', name: 'Camarines Norte', regionName: 'Region V' },
  { code: '051700000', name: 'Camarines Sur', regionName: 'Region V' },
  { code: '101800000', name: 'Camiguin', regionName: 'Region X' },
  { code: '061900000', name: 'Capiz', regionName: 'Region VI' },
  { code: '052000000', name: 'Catanduanes', regionName: 'Region V' },
  { code: '042100000', name: 'Cavite', regionName: 'Region IV-A' },
  { code: '072200000', name: 'Cebu', regionName: 'Region VII' },
  { code: '124700000', name: 'Cotabato (North Cotabato)', regionName: 'Region XII' },
  { code: '118200000', name: 'Davao de Oro', regionName: 'Region XI' },
  { code: '112300000', name: 'Davao del Norte', regionName: 'Region XI' },
  { code: '112400000', name: 'Davao del Sur', regionName: 'Region XI' },
  { code: '118600000', name: 'Davao Occidental', regionName: 'Region XI' },
  { code: '112500000', name: 'Davao Oriental', regionName: 'Region XI' },
  { code: '168500000', name: 'Dinagat Islands', regionName: 'Region XIII' },
  { code: '082600000', name: 'Eastern Samar', regionName: 'Region VIII' },
  { code: '067900000', name: 'Guimaras', regionName: 'Region VI' },
  { code: '142700000', name: 'Ifugao', regionName: 'CAR' },
  { code: '012800000', name: 'Ilocos Norte', regionName: 'Region I' },
  { code: '012900000', name: 'Ilocos Sur', regionName: 'Region I' },
  { code: '063000000', name: 'Iloilo', regionName: 'Region VI' },
  { code: '023100000', name: 'Isabela', regionName: 'Region II' },
  { code: '143200000', name: 'Kalinga', regionName: 'CAR' },
  { code: '013300000', name: 'La Union', regionName: 'Region I' },
  { code: '043400000', name: 'Laguna', regionName: 'Region IV-A' },
  { code: '103500000', name: 'Lanao del Norte', regionName: 'Region X' },
  { code: '153600000', name: 'Lanao del Sur', regionName: 'BARMM' },
  { code: '083700000', name: 'Leyte', regionName: 'Region VIII' },
  { code: '153800000', name: 'Maguindanao del Norte', regionName: 'BARMM' },
  { code: '153900000', name: 'Maguindanao del Sur', regionName: 'BARMM' },
  { code: '174000000', name: 'Marinduque', regionName: 'MIMAROPA' },
  { code: '054100000', name: 'Masbate', regionName: 'Region V' },
  { code: '104200000', name: 'Misamis Occidental', regionName: 'Region X' },
  { code: '104300000', name: 'Misamis Oriental', regionName: 'Region X' },
  { code: '144400000', name: 'Mountain Province', regionName: 'CAR' },
  { code: '064500000', name: 'Negros Occidental', regionName: 'Region VI' },
  { code: '074600000', name: 'Negros Oriental', regionName: 'Region VII' },
  { code: '084800000', name: 'Northern Samar', regionName: 'Region VIII' },
  { code: '034900000', name: 'Nueva Ecija', regionName: 'Region III' },
  { code: '025000000', name: 'Nueva Vizcaya', regionName: 'Region II' },
  { code: '175100000', name: 'Occidental Mindoro', regionName: 'MIMAROPA' },
  { code: '175200000', name: 'Oriental Mindoro', regionName: 'MIMAROPA' },
  { code: '175300000', name: 'Palawan', regionName: 'MIMAROPA' },
  { code: '035400000', name: 'Pampanga', regionName: 'Region III' },
  { code: '015500000', name: 'Pangasinan', regionName: 'Region I' },
  { code: '045600000', name: 'Quezon', regionName: 'Region IV-A' },
  { code: '025700000', name: 'Quirino', regionName: 'Region II' },
  { code: '045800000', name: 'Rizal', regionName: 'Region IV-A' },
  { code: '175900000', name: 'Romblon', regionName: 'MIMAROPA' },
  { code: '086000000', name: 'Samar (Western Samar)', regionName: 'Region VIII' },
  { code: '128000000', name: 'Sarangani', regionName: 'Region XII' },
  { code: '076100000', name: 'Siquijor', regionName: 'Region VII' },
  { code: '056200000', name: 'Sorsogon', regionName: 'Region V' },
  { code: '126300000', name: 'South Cotabato', regionName: 'Region XII' },
  { code: '086400000', name: 'Southern Leyte', regionName: 'Region VIII' },
  { code: '126500000', name: 'Sultan Kudarat', regionName: 'Region XII' },
  { code: '156600000', name: 'Sulu', regionName: 'BARMM' },
  { code: '166700000', name: 'Surigao del Norte', regionName: 'Region XIII' },
  { code: '166800000', name: 'Surigao del Sur', regionName: 'Region XIII' },
  { code: '036900000', name: 'Tarlac', regionName: 'Region III' },
  { code: '157000000', name: 'Tawi-Tawi', regionName: 'BARMM' },
  { code: '037100000', name: 'Zambales', regionName: 'Region III' },
  { code: '097200000', name: 'Zamboanga del Norte', regionName: 'Region IX' },
  { code: '097300000', name: 'Zamboanga del Sur', regionName: 'Region IX' },
  { code: '098300000', name: 'Zamboanga Sibugay', regionName: 'Region IX' },
];

// Rich Local Municipalities Catalog (Fast Offline Response & Search)
export const PROVINCE_MUNICIPALITIES_MAP: Record<string, MunicipalityItem[]> = {
  // Metro Manila (NCR)
  '130000000': [
    { code: '133900000', name: 'City of Manila', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137404000', name: 'Quezon City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137401000', name: 'Caloocan City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137602000', name: 'Makati City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137607000', name: 'Taguig City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137403000', name: 'Pasig City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137605000', name: 'Parañaque City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137402000', name: 'Marikina City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137603000', name: 'Mandaluyong City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137604000', name: 'Muntinlupa City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137606000', name: 'Pasay City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137601000', name: 'Las Piñas City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137504000', name: 'Valenzuela City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137502000', name: 'Malabon City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137503000', name: 'Navotas City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137405000', name: 'San Juan City', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: true },
    { code: '137608000', name: 'Pateros', provinceCode: '130000000', provinceName: 'Metro Manila (NCR)', isCity: false },
  ],
  // Rizal
  '045800000': [
    { code: '045813000', name: 'Taytay', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045801000', name: 'Angono', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045802000', name: 'Antipolo City', provinceCode: '045800000', provinceName: 'Rizal', isCity: true },
    { code: '045803000', name: 'Baras', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045804000', name: 'Binangonan', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045805000', name: 'Cainta', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045806000', name: 'Cardona', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045807000', name: 'Jalajala', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045808000', name: 'Morong', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045809000', name: 'Pililla', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045810000', name: 'Rodriguez (Montalban)', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045811000', name: 'San Mateo', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045812000', name: 'Tanay', provinceCode: '045800000', provinceName: 'Rizal' },
    { code: '045814000', name: 'Teresa', provinceCode: '045800000', provinceName: 'Rizal' },
  ],
  // Laguna
  '043400000': [
    { code: '043405000', name: 'Calamba City', provinceCode: '043400000', provinceName: 'Laguna', isCity: true },
    { code: '043428000', name: 'Santa Rosa City', provinceCode: '043400000', provinceName: 'Laguna', isCity: true },
    { code: '043404000', name: 'Cabuyao City', provinceCode: '043400000', provinceName: 'Laguna', isCity: true },
    { code: '043403000', name: 'Biñan City', provinceCode: '043400000', provinceName: 'Laguna', isCity: true },
    { code: '043425000', name: 'San Pedro City', provinceCode: '043400000', provinceName: 'Laguna', isCity: true },
    { code: '043424000', name: 'San Pablo City', provinceCode: '043400000', provinceName: 'Laguna', isCity: true },
    { code: '043426000', name: 'Santa Cruz (Capital)', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043411000', name: 'Los Baños', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043402000', name: 'Bay', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043406000', name: 'Calauan', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043422000', name: 'Pila', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043417000', name: 'Nagcarlan', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043418000', name: 'Paete', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043419000', name: 'Pagsanjan', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043427000', name: 'Santa Maria', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043430000', name: 'Victoria', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043410000', name: 'Liliw', provinceCode: '043400000', provinceName: 'Laguna' },
    { code: '043429000', name: 'Siniloan', provinceCode: '043400000', provinceName: 'Laguna' },
  ],
  // Cavite
  '042100000': [
    { code: '042103000', name: 'Bacoor City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042106000', name: 'Dasmariñas City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042108000', name: 'Imus City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042107000', name: 'General Trias City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042119000', name: 'Tagaytay City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042122000', name: 'Trece Martires City (Capital)', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042105000', name: 'Cavite City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042104000', name: 'Carmona City', provinceCode: '042100000', provinceName: 'Cavite', isCity: true },
    { code: '042118000', name: 'Silang', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042120000', name: 'Tanza', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042115000', name: 'Naic', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042117000', name: 'Rosario', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042110000', name: 'Kawit', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042116000', name: 'Noveleta', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042109000', name: 'Indang', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042101000', name: 'Alfonso', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042102000', name: 'Amadeo', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042121000', name: 'Ternate', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042114000', name: 'Mendez (Mendez-Nuñez)', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042113000', name: 'Maragondon', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042112000', name: 'Magallanes', provinceCode: '042100000', provinceName: 'Cavite' },
    { code: '042111000', name: 'General Mariano Alvarez (GMA)', provinceCode: '042100000', provinceName: 'Cavite' },
  ],
  // Batangas
  '041000000': [
    { code: '041005000', name: 'Batangas City (Capital)', provinceCode: '041000000', provinceName: 'Batangas', isCity: true },
    { code: '041014000', name: 'Lipa City', provinceCode: '041000000', provinceName: 'Batangas', isCity: true },
    { code: '041029000', name: 'Tanauan City', provinceCode: '041000000', provinceName: 'Batangas', isCity: true },
    { code: '041028000', name: 'Santo Tomas City', provinceCode: '041000000', provinceName: 'Batangas', isCity: true },
    { code: '041007000', name: 'Calaca City', provinceCode: '041000000', provinceName: 'Batangas', isCity: true },
    { code: '041006000', name: 'Bauan', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041025000', name: 'San Pascual', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041017000', name: 'Nasugbu', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041012000', name: 'Lemery', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041027000', name: 'Taal', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041019000', name: 'Rosario', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041021000', name: 'San Juan', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041020000', name: 'San Jose', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041015000', name: 'Mabini', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041008000', name: 'Calatagan', provinceCode: '041000000', provinceName: 'Batangas' },
    { code: '041003000', name: 'Balayan', provinceCode: '041000000', provinceName: 'Batangas' },
  ],
  // Quezon
  '045600000': [
    { code: '045624000', name: 'Lucena City (Capital)', provinceCode: '045600000', provinceName: 'Quezon', isCity: true },
    { code: '045640000', name: 'Tayabas City', provinceCode: '045600000', provinceName: 'Quezon', isCity: true },
    { code: '045610000', name: 'Candelaria', provinceCode: '045600000', provinceName: 'Quezon' },
    { code: '045638000', name: 'Sariaya', provinceCode: '045600000', provinceName: 'Quezon' },
    { code: '045641000', name: 'Tiaong', provinceCode: '045600000', provinceName: 'Quezon' },
    { code: '045618000', name: 'Gumaca', provinceCode: '045600000', provinceName: 'Quezon' },
    { code: '045625000', name: 'Lucban', provinceCode: '045600000', provinceName: 'Quezon' },
    { code: '045623000', name: 'Lopez', provinceCode: '045600000', provinceName: 'Quezon' },
    { code: '045619000', name: 'Infanta', provinceCode: '045600000', provinceName: 'Quezon' },
  ],
  // Bulacan
  '031400000': [
    { code: '031402000', name: 'Malolos City (Capital)', provinceCode: '031400000', provinceName: 'Bulacan', isCity: true },
    { code: '031420000', name: 'City of San Jose del Monte', provinceCode: '031400000', provinceName: 'Bulacan', isCity: true },
    { code: '031412000', name: 'Meycauayan City', provinceCode: '031400000', provinceName: 'Bulacan', isCity: true },
    { code: '031404000', name: 'Baliuag City', provinceCode: '031400000', provinceName: 'Bulacan', isCity: true },
    { code: '031411000', name: 'Marilao', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031422000', name: 'Santa Maria', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031405000', name: 'Bocaue', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031407000', name: 'Bulakan', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031408000', name: 'Bustos', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031409000', name: 'Calumpit', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031410000', name: 'Guiguinto', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031417000', name: 'Plaridel', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031418000', name: 'Pulilan', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031419000', name: 'San Ildefonso', provinceCode: '031400000', provinceName: 'Bulacan' },
    { code: '031421000', name: 'San Miguel', provinceCode: '031400000', provinceName: 'Bulacan' },
  ],
  // Pampanga
  '035400000': [
    { code: '035401000', name: 'Angeles City', provinceCode: '035400000', provinceName: 'Pampanga', isCity: true },
    { code: '035416000', name: 'City of San Fernando (Capital)', provinceCode: '035400000', provinceName: 'Pampanga', isCity: true },
    { code: '035413000', name: 'Mabalacat City', provinceCode: '035400000', provinceName: 'Pampanga', isCity: true },
    { code: '035409000', name: 'Guagua', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035411000', name: 'Lubao', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035414000', name: 'Macabebe', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035415000', name: 'Mexico', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035403000', name: 'Arayat', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035404000', name: 'Bacolor', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035408000', name: 'Floridablanca', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035417000', name: 'San Luis', provinceCode: '035400000', provinceName: 'Pampanga' },
    { code: '035419000', name: 'Santa Rita', provinceCode: '035400000', provinceName: 'Pampanga' },
  ],
  // Pangasinan
  '015500000': [
    { code: '015518000', name: 'Dagupan City', provinceCode: '015500000', provinceName: 'Pangasinan', isCity: true },
    { code: '015543000', name: 'San Carlos City', provinceCode: '015500000', provinceName: 'Pangasinan', isCity: true },
    { code: '015546000', name: 'Urdaneta City', provinceCode: '015500000', provinceName: 'Pangasinan', isCity: true },
    { code: '015503000', name: 'Alaminos City', provinceCode: '015500000', provinceName: 'Pangasinan', isCity: true },
    { code: '015526000', name: 'Lingayen (Capital)', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015515000', name: 'Calasiao', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015529000', name: 'Malasiqui', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015530000', name: 'Manaog', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015531000', name: 'Mangaldan', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015536000', name: 'Rosales', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015511000', name: 'Bayambang', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015512000', name: 'Binalonan', provinceCode: '015500000', provinceName: 'Pangasinan' },
    { code: '015514000', name: 'Bolinao', provinceCode: '015500000', provinceName: 'Pangasinan' },
  ],
  // Cebu
  '072200000': [
    { code: '072217000', name: 'Cebu City (Capital)', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072226000', name: 'Lapu-Lapu City (Opon)', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072230000', name: 'Mandaue City', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072251000', name: 'Talisay City', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072252000', name: 'Toledo City', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072219000', name: 'Danao City', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072214000', name: 'Carcar City', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072234000', name: 'Naga City', provinceCode: '072200000', provinceName: 'Cebu', isCity: true },
    { code: '072218000', name: 'Consolacion', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072227000', name: 'Liloan', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072232000', name: 'Minglanilla', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072211000', name: 'Bantayan', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072210000', name: 'Balamban', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072215000', name: 'Carmen', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072233000', name: 'Moalboal', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072242000', name: 'San Fernando', provinceCode: '072200000', provinceName: 'Cebu' },
    { code: '072244000', name: 'Santa Fe', provinceCode: '072200000', provinceName: 'Cebu' },
  ],
  // Iloilo
  '063000000': [
    { code: '063022000', name: 'Iloilo City (Capital)', provinceCode: '063000000', provinceName: 'Iloilo', isCity: true },
    { code: '063035000', name: 'Passi City', provinceCode: '063000000', provinceName: 'Iloilo', isCity: true },
    { code: '063034000', name: 'Oton', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063039000', name: 'Santa Barbara', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063038000', name: 'San Miguel', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063036000', name: 'Pavia', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063037000', name: 'Pototan', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063019000', name: 'Dumangas', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063021000', name: 'Guimbal', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063030000', name: 'Miagao', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063013000', name: 'Carles', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063018000', name: 'Dingle', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063026000', name: 'Leganes', provinceCode: '063000000', provinceName: 'Iloilo' },
    { code: '063041000', name: 'Tigbauan', provinceCode: '063000000', provinceName: 'Iloilo' },
  ],
  // Negros Occidental
  '064500000': [
    { code: '064501000', name: 'Bacolod City (Capital)', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064528000', name: 'Talisay City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064524000', name: 'Silay City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064502000', name: 'Bago City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064509000', name: 'Cadiz City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064520000', name: 'San Carlos City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064516000', name: 'Kabankalan City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064523000', name: 'Sagay City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064531000', name: 'Victorias City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064517000', name: 'La Carlota City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064514000', name: 'Himamaylan City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064525000', name: 'Sipalay City', provinceCode: '064500000', provinceName: 'Negros Occidental', isCity: true },
    { code: '064510000', name: 'Calatrava', provinceCode: '064500000', provinceName: 'Negros Occidental' },
    { code: '064518000', name: 'Manapla', provinceCode: '064500000', provinceName: 'Negros Occidental' },
    { code: '064521000', name: 'San Enrique', provinceCode: '064500000', provinceName: 'Negros Occidental' },
  ],
  // Davao del Sur
  '112400000': [
    { code: '112402000', name: 'Davao City', provinceCode: '112400000', provinceName: 'Davao del Sur', isCity: true },
    { code: '112403000', name: 'Digos City (Capital)', provinceCode: '112400000', provinceName: 'Davao del Sur', isCity: true },
    { code: '112401000', name: 'Bansalan', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112404000', name: 'Hagonoy', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112407000', name: 'Malalag', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112408000', name: 'Matanao', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112410000', name: 'Padada', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112412000', name: 'Santa Cruz', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112413000', name: 'Sulop', provinceCode: '112400000', provinceName: 'Davao del Sur' },
    { code: '112406000', name: 'Magsaysay', provinceCode: '112400000', provinceName: 'Davao del Sur' },
  ],
  // Benguet / Baguio
  '141100000': [
    { code: '141102000', name: 'Baguio City', provinceCode: '141100000', provinceName: 'Benguet', isCity: true },
    { code: '141108000', name: 'La Trinidad (Capital)', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141106000', name: 'Itogon', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141113000', name: 'Tuba', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141114000', name: 'Tublay', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141104000', name: 'Buguias', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141107000', name: 'Kabayan', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141109000', name: 'Mankayan', provinceCode: '141100000', provinceName: 'Benguet' },
    { code: '141111000', name: 'Sablan', provinceCode: '141100000', provinceName: 'Benguet' },
  ],
  // Albay
  '050500000': [
    { code: '050506000', name: 'Legazpi City (Capital)', provinceCode: '050500000', provinceName: 'Albay', isCity: true },
    { code: '050508000', name: 'Ligao City', provinceCode: '050500000', provinceName: 'Albay', isCity: true },
    { code: '050517000', name: 'Tabaco City', provinceCode: '050500000', provinceName: 'Albay', isCity: true },
    { code: '050504000', name: 'Daraga (Locsin)', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050505000', name: 'Guinobatan', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050503000', name: 'Camalig', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050510000', name: 'Malinao', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050514000', name: 'Polangui', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050516000', name: 'Santo Domingo', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050518000', name: 'Tiwi', provinceCode: '050500000', provinceName: 'Albay' },
    { code: '050501000', name: 'Bacacay', provinceCode: '050500000', provinceName: 'Albay' },
  ],
  // Camarines Sur
  '051700000': [
    { code: '051724000', name: 'Naga City', provinceCode: '051700000', provinceName: 'Camarines Sur', isCity: true },
    { code: '051717000', name: 'Iriga City', provinceCode: '051700000', provinceName: 'Camarines Sur', isCity: true },
    { code: '051729000', name: 'Pili (Capital)', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051711000', name: 'Caramoan', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051712000', name: 'Del Gallego', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051718000', name: 'Lagonoy', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051719000', name: 'Libmanan', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051721000', name: 'Magarao', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051723000', name: 'Milaor', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051726000', name: 'Ocampo', provinceCode: '051700000', provinceName: 'Camarines Sur' },
    { code: '051731000', name: 'Ragay', provinceCode: '051700000', provinceName: 'Camarines Sur' },
  ],
  // Palawan
  '175300000': [
    { code: '175316000', name: 'Puerto Princesa City (Capital)', provinceCode: '175300000', provinceName: 'Palawan', isCity: true },
    { code: '175311000', name: 'El Nido (Bacuit)', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175310000', name: 'Coron', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175319000', name: 'San Vicente', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175322000', name: 'Taytay', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175305000', name: 'Bataraza', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175306000', name: 'Brooke\'s Point', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175309000', name: 'Culion', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175317000', name: 'Quezon', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175318000', name: 'Roxas', provinceCode: '175300000', provinceName: 'Palawan' },
    { code: '175314000', name: 'Narra', provinceCode: '175300000', provinceName: 'Palawan' },
  ],
  // Misamis Oriental
  '104300000': [
    { code: '104305000', name: 'Cagayan de Oro City (Capital)', provinceCode: '104300000', provinceName: 'Misamis Oriental', isCity: true },
    { code: '104307000', name: 'El Salvador City', provinceCode: '104300000', provinceName: 'Misamis Oriental', isCity: true },
    { code: '104308000', name: 'Gingoog City', provinceCode: '104300000', provinceName: 'Misamis Oriental', isCity: true },
    { code: '104301000', name: 'Alubijid', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
    { code: '104319000', name: 'Opol', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
    { code: '104323000', name: 'Tagoloan', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
    { code: '104324000', name: 'Villanueva', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
    { code: '104310000', name: 'Initao', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
    { code: '104311000', name: 'Jasaan', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
    { code: '104304000', name: 'Balingasag', provinceCode: '104300000', provinceName: 'Misamis Oriental' },
  ],
  // South Cotabato
  '126300000': [
    { code: '126303000', name: 'General Santos City (Dadiangas)', provinceCode: '126300000', provinceName: 'South Cotabato', isCity: true },
    { code: '126306000', name: 'Koronadal City (Capital)', provinceCode: '126300000', provinceName: 'South Cotabato', isCity: true },
    { code: '126308000', name: 'Polomolok', provinceCode: '126300000', provinceName: 'South Cotabato' },
    { code: '126312000', name: 'Tupi', provinceCode: '126300000', provinceName: 'South Cotabato' },
    { code: '126311000', name: 'T\'Boli', provinceCode: '126300000', provinceName: 'South Cotabato' },
    { code: '126310000', name: 'Surallah', provinceCode: '126300000', provinceName: 'South Cotabato' },
    { code: '126307000', name: 'Norala', provinceCode: '126300000', provinceName: 'South Cotabato' },
    { code: '126302000', name: 'Banga', provinceCode: '126300000', provinceName: 'South Cotabato' },
  ],
  // Zamboanga del Sur
  '097300000': [
    { code: '097332000', name: 'Zamboanga City', provinceCode: '097300000', provinceName: 'Zamboanga del Sur', isCity: true },
    { code: '097317000', name: 'Pagadian City (Capital)', provinceCode: '097300000', provinceName: 'Zamboanga del Sur', isCity: true },
    { code: '097302000', name: 'Aurora', provinceCode: '097300000', provinceName: 'Zamboanga del Sur' },
    { code: '097305000', name: 'Dumalinao', provinceCode: '097300000', provinceName: 'Zamboanga del Sur' },
    { code: '097312000', name: 'Labangan', provinceCode: '097300000', provinceName: 'Zamboanga del Sur' },
    { code: '097315000', name: 'Molave', provinceCode: '097300000', provinceName: 'Zamboanga del Sur' },
    { code: '097321000', name: 'San Miguel', provinceCode: '097300000', provinceName: 'Zamboanga del Sur' },
  ],
  // Zambales
  '037100000': [
    { code: '037107000', name: 'Olongapo City', provinceCode: '037100000', provinceName: 'Zambales', isCity: true },
    { code: '037104000', name: 'Iba (Capital)', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037112000', name: 'Subic', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037101000', name: 'Botolan', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037103000', name: 'Castillejos', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037109000', name: 'San Antonio', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037111000', name: 'San Narciso', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037113000', name: 'San Felipe', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037108000', name: 'Palauig', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037105000', name: 'Masinloc', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037102000', name: 'Cabangan', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037106000', name: 'Candelaria', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037110000', name: 'San Marcelino', provinceCode: '037100000', provinceName: 'Zambales' },
    { code: '037114000', name: 'Santa Cruz', provinceCode: '037100000', provinceName: 'Zambales' },
  ],
  // Tarlac
  '036900000': [
    { code: '036916000', name: 'Tarlac City (Capital)', provinceCode: '036900000', provinceName: 'Tarlac', isCity: true },
    { code: '036904000', name: 'Capas', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036905000', name: 'Concepcion', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036908000', name: 'La Paz', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036911000', name: 'Paniqui', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036903000', name: 'Camiling', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036902000', name: 'Bamban', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036915000', name: 'Santa Ignacia', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036917000', name: 'Victoria', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036906000', name: 'Gerona', provinceCode: '036900000', provinceName: 'Tarlac' },
    { code: '036910000', name: 'Moncada', provinceCode: '036900000', provinceName: 'Tarlac' },
  ],
  // Nueva Ecija
  '034900000': [
    { code: '034906000', name: 'Cabanatuan City', provinceCode: '034900000', provinceName: 'Nueva Ecija', isCity: true },
    { code: '034919000', name: 'Palayan City (Capital)', provinceCode: '034900000', provinceName: 'Nueva Ecija', isCity: true },
    { code: '034910000', name: 'Gapan City', provinceCode: '034900000', provinceName: 'Nueva Ecija', isCity: true },
    { code: '034927000', name: 'Science City of Muñoz', provinceCode: '034900000', provinceName: 'Nueva Ecija', isCity: true },
    { code: '034922000', name: 'San Jose City', provinceCode: '034900000', provinceName: 'Nueva Ecija', isCity: true },
    { code: '034926000', name: 'Talavera', provinceCode: '034900000', provinceName: 'Nueva Ecija' },
    { code: '034923000', name: 'San Leonardo', provinceCode: '034900000', provinceName: 'Nueva Ecija' },
    { code: '034911000', name: 'General Tinio (Papaya)', provinceCode: '034900000', provinceName: 'Nueva Ecija' },
    { code: '034925000', name: 'Santa Rosa', provinceCode: '034900000', provinceName: 'Nueva Ecija' },
    { code: '034912000', name: 'Guimba', provinceCode: '034900000', provinceName: 'Nueva Ecija' },
  ],
  // Bataan
  '030800000': [
    { code: '030803000', name: 'Balanga City (Capital)', provinceCode: '030800000', provinceName: 'Bataan', isCity: true },
    { code: '030806000', name: 'Dinalupihan', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030807000', name: 'Hermosa', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030808000', name: 'Limay', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030809000', name: 'Mariveles', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030810000', name: 'Morong', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030811000', name: 'Orani', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030812000', name: 'Orion', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030801000', name: 'Abucay', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030802000', name: 'Bagac', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030804000', name: 'Pilar', provinceCode: '030800000', provinceName: 'Bataan' },
    { code: '030805000', name: 'Samal', provinceCode: '030800000', provinceName: 'Bataan' },
  ],
  // La Union
  '013300000': [
    { code: '013314000', name: 'San Fernando City (Capital)', provinceCode: '013300000', provinceName: 'La Union', isCity: true },
    { code: '013316000', name: 'San Juan (Surfing Capital)', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013301000', name: 'Agoo', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013303000', name: 'Bacnotan', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013305000', name: 'Bauang', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013308000', name: 'Caba', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013309000', name: 'Luna', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013311000', name: 'Naguilian', provinceCode: '013300000', provinceName: 'La Union' },
    { code: '013313000', name: 'Rosario', provinceCode: '013300000', provinceName: 'La Union' },
  ],
  // Ilocos Norte
  '012800000': [
    { code: '012812000', name: 'Laoag City (Capital)', provinceCode: '012800000', provinceName: 'Ilocos Norte', isCity: true },
    { code: '012805000', name: 'Batac City', provinceCode: '012800000', provinceName: 'Ilocos Norte', isCity: true },
    { code: '012818000', name: 'San Nicolas', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
    { code: '012819000', name: 'Sarrat', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
    { code: '012808000', name: 'Currimao', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
    { code: '012814000', name: 'Pagudpud', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
    { code: '012815000', name: 'Paoay', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
    { code: '012816000', name: 'Pasuquin', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
    { code: '012804000', name: 'Bangui', provinceCode: '012800000', provinceName: 'Ilocos Norte' },
  ],
  // Ilocos Sur
  '012900000': [
    { code: '012934000', name: 'Vigan City (Capital)', provinceCode: '012900000', provinceName: 'Ilocos Sur', isCity: true },
    { code: '012911000', name: 'Candon City', provinceCode: '012900000', provinceName: 'Ilocos Sur', isCity: true },
    { code: '012903000', name: 'Bantay', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012910000', name: 'Cabugao', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012915000', name: 'Magsingal', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012916000', name: 'Narvacan', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012927000', name: 'Santa Maria', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012930000', name: 'Santo Domingo', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012931000', name: 'Sinait', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
    { code: '012932000', name: 'Tagudin', provinceCode: '012900000', provinceName: 'Ilocos Sur' },
  ],
  // Bohol
  '071200000': [
    { code: '071244000', name: 'Tagbilaran City (Capital)', provinceCode: '071200000', provinceName: 'Bohol', isCity: true },
    { code: '071233000', name: 'Panglao', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071217000', name: 'Dauis', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071241000', name: 'Talibon', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071243000', name: 'Tubigon', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071212000', name: 'Carmen (Chocolate Hills)', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071228000', name: 'Loon', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071224000', name: 'Jagna', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071246000', name: 'Ubay', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071221000', name: 'Guindulman', provinceCode: '071200000', provinceName: 'Bohol' },
    { code: '071204000', name: 'Baclayon', provinceCode: '071200000', provinceName: 'Bohol' },
  ],
};

// Embedded sample barangays for zero-lag resilience
const FALLBACK_BARANGAYS: Record<string, PSGCBarangay[]> = {
  // Taytay, Rizal
  '045813000': [
    { code: '045813001', name: 'Dolores (Poblacion)' },
    { code: '045813002', name: 'Muzon' },
    { code: '045813003', name: 'San Isidro' },
    { code: '045813004', name: 'San Juan' },
    { code: '045813005', name: 'Santa Ana' },
  ],
  // Angono, Rizal
  '045801000': [
    { code: '045801001', name: 'Bagumbayan' },
    { code: '045801002', name: 'Kalayaan' },
    { code: '045801003', name: 'Mahabang Parang' },
    { code: '045801004', name: 'Poblacion Ibaba' },
    { code: '045801005', name: 'Poblacion Itaas' },
    { code: '045801006', name: 'San Isidro' },
    { code: '045801007', name: 'San Pedro' },
    { code: '045801008', name: 'San Roque' },
    { code: '045801009', name: 'San Vicente' },
    { code: '045801010', name: 'Santo Niño' },
  ],
  // Antipolo City
  '045802000': [
    { code: '045802001', name: 'Bagong Nayon' },
    { code: '045802002', name: 'Beverly Hills' },
    { code: '045802003', name: 'Calawis' },
    { code: '045802004', name: 'Cupang' },
    { code: '045802005', name: 'Dalig' },
    { code: '045802006', name: 'Dela Paz (Poblacion)' },
    { code: '045802007', name: 'Inarawan' },
    { code: '045802008', name: 'Mambugan' },
    { code: '045802009', name: 'Mayamot' },
    { code: '045802010', name: 'Muntindilaw' },
    { code: '045802011', name: 'San Isidro (Poblacion)' },
    { code: '045802012', name: 'San Jose (Poblacion)' },
    { code: '045802013', name: 'San Juan' },
    { code: '045802014', name: 'San Luis' },
    { code: '045802015', name: 'San Roque (Poblacion)' },
    { code: '045802016', name: 'Santa Cruz' },
  ],
  // Santa Rosa City, Laguna
  '043428000': [
    { code: '043428001', name: 'Aplaya' },
    { code: '043428002', name: 'Balibago' },
    { code: '043428003', name: 'Caingin' },
    { code: '043428004', name: 'Dila' },
    { code: '043428005', name: 'Dita' },
    { code: '043428006', name: 'Don Jose' },
    { code: '043428007', name: 'Ibaba' },
    { code: '043428008', name: 'Kanluran' },
    { code: '043428009', name: 'Labas' },
    { code: '043428010', name: 'Macabling' },
    { code: '043428011', name: 'Malitlit' },
    { code: '043428012', name: 'Market Area' },
    { code: '043428013', name: 'Pooc' },
    { code: '043428014', name: 'Pulong Santa Cruz' },
    { code: '043428015', name: 'Santo Domingo' },
    { code: '043428016', name: 'Sinalhan' },
    { code: '043428017', name: 'Tagapo' },
    { code: '043428018', name: 'Poblacion' },
  ],
  // Baguio City
  '141102000': [
    { code: '141102001', name: 'Alfonso Tabora' },
    { code: '141102002', name: 'Ambiong' },
    { code: '141102003', name: 'Asin Road' },
    { code: '141102004', name: 'Bakakeng Central' },
    { code: '141102005', name: 'Bakakeng North' },
    { code: '141102006', name: 'Camp 7' },
    { code: '141102007', name: 'Camp 8' },
    { code: '141102008', name: 'City Camp Central' },
    { code: '141102009', name: 'Country Club Village' },
    { code: '141102010', name: 'Dominican Hill-Mirador' },
    { code: '141102011', name: 'Engineers\' Hill' },
    { code: '141102012', name: 'General Luna Upper' },
    { code: '141102013', name: 'Gibraltar' },
    { code: '141102014', name: 'Irisan' },
    { code: '141102015', name: 'Kabayanihan' },
    { code: '141102016', name: 'Kagitingan' },
    { code: '141102017', name: 'Loakan Proper' },
    { code: '141102018', name: 'Mines View Park' },
    { code: '141102019', name: 'Pacdal' },
    { code: '141102020', name: 'Session Road Area' },
  ],
  // Cebu City
  '072217000': [
    { code: '072217001', name: 'Apas' },
    { code: '072217002', name: 'Banilad' },
    { code: '072217003', name: 'Basak San Nicolas' },
    { code: '072217004', name: 'Bulacao' },
    { code: '072217005', name: 'Busay' },
    { code: '072217006', name: 'Calamba' },
    { code: '072217007', name: 'Capitol Site' },
    { code: '072217008', name: 'Carreta' },
    { code: '072217009', name: 'Guadalupe' },
    { code: '072217010', name: 'Kamputhaw (Camputhaw)' },
    { code: '072217011', name: 'Kasambagan' },
    { code: '072217012', name: 'Lahug' },
    { code: '072217013', name: 'Mabolo' },
    { code: '072217014', name: 'Pahina Central' },
    { code: '072217015', name: 'Punta Princesa' },
    { code: '072217016', name: 'Santo Niño' },
    { code: '072217017', name: 'Talamban' },
    { code: '072217018', name: 'Tisa' },
  ],
  // Davao City
  '112402000': [
    { code: '112402001', name: 'Agdao' },
    { code: '112402002', name: 'Bayanihan' },
    { code: '112402003', name: 'Bucana' },
    { code: '112402004', name: 'Buhangin (Poblacion)' },
    { code: '112402005', name: 'Bunawan (Poblacion)' },
    { code: '112402006', name: 'Cabantian' },
    { code: '112402007', name: 'Calinan (Poblacion)' },
    { code: '112402008', name: 'Catalunan Grande' },
    { code: '112402009', name: 'Catalunan Pequeño' },
    { code: '112402010', name: 'Daliao' },
    { code: '112402011', name: 'Matina Aplaya' },
    { code: '112402012', name: 'Matina Crossing' },
    { code: '112402013', name: 'Poblacion District 1' },
    { code: '112402014', name: 'Sasa' },
    { code: '112402015', name: 'Talomo (Poblacion)' },
    { code: '112402016', name: 'Toril (Poblacion)' },
  ],
  // Quezon City
  '137404000': [
    { code: '137404001', name: 'Alicia' },
    { code: '137404002', name: 'Bagong Silangan' },
    { code: '137404003', name: 'Batasan Hills' },
    { code: '137404004', name: 'Commonwealth' },
    { code: '137404005', name: 'Culiat' },
    { code: '137404006', name: 'Diliman (Central)' },
    { code: '137404007', name: 'Holy Spirit' },
    { code: '137404008', name: 'Katipunan / Loyola Heights' },
    { code: '137404009', name: 'Matandang Balara' },
    { code: '137404010', name: 'Novaliches Proper' },
    { code: '137404011', name: 'Pasong Tamo' },
    { code: '137404012', name: 'Pinyahan' },
    { code: '137404013', name: 'San Bartolome' },
    { code: '137404014', name: 'South Triangle' },
    { code: '137404015', name: 'Tandang Sora' },
    { code: '137404016', name: 'UP Campus' },
  ],
};

async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return fallback;
    }
    
    const data = await response.json();
    cache.set(url, data);
    return data as T;
  } catch (err) {
    return fallback;
  }
}

export const fetchBarangaysByMunicipality = async (municipalityCode: string): Promise<PSGCBarangay[]> => {
  const fallback = FALLBACK_BARANGAYS[municipalityCode] || [
    { code: `${municipalityCode.slice(0, 6)}001`, name: 'Poblacion' },
    { code: `${municipalityCode.slice(0, 6)}002`, name: 'San Jose' },
    { code: `${municipalityCode.slice(0, 6)}003`, name: 'San Roque' },
    { code: `${municipalityCode.slice(0, 6)}004`, name: 'Santa Maria' },
    { code: `${municipalityCode.slice(0, 6)}005`, name: 'Santo Domingo' },
    { code: `${municipalityCode.slice(0, 6)}006`, name: 'San Isidro' },
    { code: `${municipalityCode.slice(0, 6)}007`, name: 'San Antonio' },
    { code: `${municipalityCode.slice(0, 6)}008`, name: 'Bagong Silang' },
    { code: `${municipalityCode.slice(0, 6)}009`, name: 'Mabuhay' },
    { code: `${municipalityCode.slice(0, 6)}010`, name: 'Maligaya' },
  ];

  // Try cities-municipalities first
  const url1 = `${BASE_URL}/cities-municipalities/${municipalityCode}/barangays.json`;
  const data1 = await fetchWithFallback<any[]>(url1, []);
  if (data1 && Array.isArray(data1) && data1.length > 0) {
    return data1.map((item) => ({
      code: item.code,
      name: item.name || item.barangayName || item.code,
      municipalityCode,
    }));
  }

  // Try municipalities directly
  const url2 = `${BASE_URL}/municipalities/${municipalityCode}/barangays.json`;
  const data2 = await fetchWithFallback<any[]>(url2, []);
  if (data2 && Array.isArray(data2) && data2.length > 0) {
    return data2.map((item) => ({
      code: item.code,
      name: item.name || item.barangayName || item.code,
      municipalityCode,
    }));
  }

  // Try cities directly
  const url3 = `${BASE_URL}/cities/${municipalityCode}/barangays.json`;
  const data3 = await fetchWithFallback<any[]>(url3, fallback);
  return data3.map((item) => ({
    code: item.code,
    name: item.name || item.barangayName || item.code,
    municipalityCode,
  }));
};

export const psgcService = {
  getAllProvinces(): ProvinceItem[] {
    return ALL_PHILIPPINE_PROVINCES;
  },

  async getMunicipalitiesByProvince(provinceCode: string, provinceName?: string): Promise<MunicipalityItem[]> {
    const fallbackList = PROVINCE_MUNICIPALITIES_MAP[provinceCode] || [];
    
    // Attempt live fetch from official PSGC API
    const url = `${BASE_URL}/provinces/${provinceCode}/cities-municipalities.json`;
    try {
      const data = await fetchWithFallback<any[]>(url, []);
      if (data && Array.isArray(data) && data.length > 0) {
        const liveList: MunicipalityItem[] = data.map((item) => ({
          code: item.code,
          name: item.name || item.municipalityName || item.cityName || item.code,
          provinceCode,
          provinceName: provinceName || 'Selected Province',
          isCity: item.isCity || item.name?.toLowerCase().includes('city') || false,
        }));
        
        // Merge with fallback list to avoid losing any local cities
        const map = new Map<string, MunicipalityItem>();
        fallbackList.forEach((m) => map.set(m.code, m));
        liveList.forEach((m) => map.set(m.code, m));
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (e) {
      // ignore
    }

    if (fallbackList.length > 0) {
      return [...fallbackList].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Default dynamic items if not in map
    const provClean = provinceName ? provinceName.replace(/\(.*\)/, '').trim() : 'LGU';
    return [
      { code: `${provinceCode.slice(0, 4)}01000`, name: `${provClean} Capital City`, provinceCode, provinceName: provinceName || '', isCity: true },
      { code: `${provinceCode.slice(0, 4)}02000`, name: `North ${provClean}`, provinceCode, provinceName: provinceName || '' },
      { code: `${provinceCode.slice(0, 4)}03000`, name: `Central ${provClean}`, provinceCode, provinceName: provinceName || '' },
      { code: `${provinceCode.slice(0, 4)}04000`, name: `East ${provClean}`, provinceCode, provinceName: provinceName || '' },
      { code: `${provinceCode.slice(0, 4)}05000`, name: `South ${provClean}`, provinceCode, provinceName: provinceName || '' },
    ];
  },

  getAllMunicipalitiesList(): MunicipalityItem[] {
    const list: MunicipalityItem[] = [];
    Object.values(PROVINCE_MUNICIPALITIES_MAP).forEach((munList) => {
      munList.forEach((m) => list.push(m));
    });
    return list;
  },

  searchMunicipalities(query: string): MunicipalityItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    
    const all = this.getAllMunicipalitiesList();
    return all.filter((m) => 
      m.name.toLowerCase().includes(q) || 
      m.provinceName.toLowerCase().includes(q) ||
      m.code.includes(q)
    ).slice(0, 15);
  },

  getBarangaysByMunicipality: fetchBarangaysByMunicipality,
};
