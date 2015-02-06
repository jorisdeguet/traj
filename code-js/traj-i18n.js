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
    FLUSH : 'Flush'
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
    FLUSH : 'Vider'
  });
  $translateProvider.preferredLanguage('fr');
});
