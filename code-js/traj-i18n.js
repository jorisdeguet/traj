var traj_i18n = angular.module('traj.i18n', ['pascalprecht.translate']);

traj_i18n.config(function ($translateProvider) {
  $translateProvider.translations('en', {
    HOME: 'Home',
    YES : 'Yes',
    NO : 'No',
    CREATE : 'Create',
    LANGUAGE : 'Language',
    RESULTS : 'Results',
    SEARCH : 'Search',
    LIST : 'List',
    MAP : 'Map',
    ADD : 'Add',
    SAVE : 'Save',
    SHARE : 'Share',
    URL_TO_LOAD : 'Enter URL here',
    IMPORT_FROM_FILE : 'Import from a file on your computer',
    LOAD_A_FILE : 'Load the file',
    EVENTS : 'Events',
    IMPORTS : 'Events to import',
    FLUSH : 'Flush',

    TITLE : 'Title',
    DESCRIPTION : 'Description',
    PLACE : 'Place',
    PLACE_HINT :'Address or coordinates',

    ERROR_TITLE : 'Please enter a Title',
    ERROR_DESCRIPTION : 'Please enter a Description',
    ERROR_PLACE : 'Please specify a Place',
    ERROR_COORDINATES : 'Place a marker on the map or Geocode',
    ERROR_DATE : 'Please select a date',
    ERROR_DATE_END : 'Please enter an end date',
    ERROR_DATE_SWAP : 'The end is before the beginning',
    ERROR_GEOCODER : 'No place is found for this address',

    WHAT : 'What',
    WHERE : 'Where',
    WHEN : 'When',
    PONCTUAL : 'Event',
    PERIOD : 'Period'
  });
  $translateProvider.translations('fr', {
    HOME: 'Accueil',
    YES:'Oui',
    NO : 'Non',
    CREATE : 'Créer',
    LANGUAGE : 'Langue',
    RESULTS : 'Résultats',
    SEARCH : 'Rechercher',
    LIST : 'Liste',
    MAP : 'Carte',
    ADD : 'Ajouter',
    SAVE : 'Sauver',
    SHARE : 'Partager',
    URL_TO_LOAD : "Entrer l'URL ici",
    IMPORT_FROM_FILE : 'Importez depuis un fichier sur votre ordinateur',
    LOAD_A_FILE : 'Chargez le fichier',
    EVENTS : 'Événements',
    IMPORTS : 'Événements à importer',
    FLUSH : 'Vider',
    TITLE : 'Titre',
    DESCRIPTION : 'Description',
    PLACE : 'Lieu',
    PLACE_HINT :'Adresse ou coordonnées',

    ERROR_TITLE : 'Veuillez entrer un titre',
    ERROR_DESCRIPTION : 'Veuillez entrer une description',
    ERROR_PLACE : 'Veuillez entrer un lieu',
    ERROR_COORDINATES : 'Placez un marqueur ou appuyez sur Geocode',
    ERROR_DATE : 'Veuillez sélectionner une date',
    ERROR_DATE_END : 'Veuillez entrer une date de fin',
    ERROR_DATE_SWAP : 'La date de fin est après le début',
    ERROR_GEOCODER : 'On ne trouve rien pour cette adresse',

    WHAT : 'Quoi',
    WHERE : 'Où',
    WHEN : 'Quand',
    PONCTUAL : 'Événement ponctuel',
    PERIOD : 'Période'
  });
  $translateProvider.preferredLanguage('fr');
});
