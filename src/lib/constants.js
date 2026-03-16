export const AFRICAN_COUNTRIES = [
  { name: 'Ghana', cities: ['Accra','Kumasi','Tema','Takoradi','Cape Coast','Tamale','Ho','Koforidua','Sunyani','Wa'] },
  { name: 'Nigeria', cities: ['Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Benin City','Kaduna','Owerri','Uyo'] },
  { name: 'Kenya', cities: ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Garissa','Nyeri'] },
  { name: 'South Africa', cities: ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Nelspruit','Polokwane','Rustenburg'] },
  { name: 'Tanzania', cities: ['Dar es Salaam','Dodoma','Mwanza','Arusha','Mbeya','Morogoro','Tanga','Zanzibar','Kigoma','Iringa'] },
  { name: 'Ethiopia', cities: ['Addis Ababa','Dire Dawa','Mekelle','Gondar','Hawassa','Bahir Dar','Dessie','Jimma','Jijiga','Shashamane'] },
  { name: 'Uganda', cities: ['Kampala','Gulu','Lira','Mbarara','Jinja','Bwizibwera','Mbale','Mukono','Kasese','Masaka'] },
  { name: 'Senegal', cities: ['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Rufisque','Mbour','Tambacounda','Kolda','Louga'] },
  { name: 'Ivory Coast', cities: ['Abidjan','Bouaké','Daloa','Yamoussoukro','San-Pédro','Korhogo','Man','Gagnoa','Divo','Abengourou'] },
  { name: 'Cameroon', cities: ['Douala','Yaoundé','Bamenda','Bafoussam','Garoua','Maroua','Ngaoundéré','Bertoua','Loum','Kumba'] },
  { name: 'Rwanda', cities: ['Kigali','Butare','Gitarama','Musanze','Byumba','Cyangugu','Gisenyi','Ruhengeri','Kibuye','Nyabisindu'] },
  { name: 'Zimbabwe', cities: ['Harare','Bulawayo','Chitungwiza','Mutare','Gweru','Kwekwe','Kadoma','Masvingo','Chinhoyi','Norton'] },
  { name: 'Egypt', cities: ['Cairo','Alexandria','Giza','Shubra El Kheima','Port Said','Suez','Luxor','Mansoura','El Mahalla El Kubra','Tanta'] },
  { name: 'Morocco', cities: ['Casablanca','Rabat','Fes','Tangier','Marrakech','Meknes','Oujda','Kenitra','Agadir','Tetouan'] },
  { name: 'Zambia', cities: ['Lusaka','Kitwe','Ndola','Kabwe','Chingola','Mufulira','Livingstone','Luanshya','Chipata','Kasama'] },
]

export const ROLES = [
  'Videographer', 'Cinematographer', 'Photographer', 'Editor', 'Colorist',
  'Sound Designer', 'Drone Operator', 'Gaffer', '1st AC', 'Prod. Designer',
  'MUA / Stylist', 'Director of Photography', 'Director', 'Producer',
  'Steadicam Operator', 'Camera Operator', 'Script Supervisor', 'Set Designer'
]

export const EQUIPMENT = [
  'Sony FX3', 'Sony FX6', 'Sony A7III', 'ARRI Alexa', 'RED Komodo',
  'RED Monstro', 'DJI Inspire 3', 'DJI Mavic 3', 'DJI Ronin',
  'Aputure 600d', 'ARRI SkyPanel', 'Kino Flo', 'Zoom H6',
  'Sound Devices', 'DaVinci Resolve', 'Premiere Pro', 'After Effects',
  'Final Cut Pro', 'Avid', 'Logic Pro', 'Preston FIZ', 'Lens Kit'
]

export const CURRENCIES = [
  { code: 'GHS', symbol: '₵', name: 'Ghana Cedi' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
]

export const getCurrencySymbol = (code) => CURRENCIES.find(c => c.code === code)?.symbol || code

export const REPORT_REASONS = [
  'Fake profile', 'Inappropriate content', 'Harassment',
  'Scam or fraud', 'Spam', 'Other'
]

export const WHATSAPP_NUMBER = '233XXXXXXXXX' // Replace with your WhatsApp Business number
