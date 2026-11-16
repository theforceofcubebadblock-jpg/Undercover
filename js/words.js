/* Bibliothèque de mots : chaque paire est « mot A|mot B ».
   Au tirage, l'un des deux devient le mot des Civils, l'autre celui des Undercover. */
(function (root) {
  'use strict';

  var THEMES = [
    {
      id: 'facile',
      name: 'Accessible à tous',
      desc: 'Mots simples, pour jouer en famille',
      pairs: [
        'Chat|Chien', 'Café|Thé', 'Pizza|Burger', 'Plage|Piscine', 'Été|Hiver', 'Soleil|Lune',
        'Voiture|Moto', 'Train|Métro', 'Avion|Hélicoptère', 'Vélo|Trottinette', 'Pomme|Poire',
        'Fraise|Framboise', 'Chocolat|Caramel', 'Glace|Sorbet', 'Lit|Canapé', 'Chaise|Tabouret',
        'Stylo|Crayon', 'Livre|Magazine', 'École|Collège', 'Médecin|Infirmier', 'Policier|Pompier',
        'Pluie|Neige', 'Mer|Lac', 'Montagne|Colline', 'Forêt|Jungle', 'Rose|Tulipe', 'Lion|Tigre',
        'Cheval|Âne', 'Poule|Canard', 'Fourchette|Cuillère', 'Verre|Tasse', 'Douche|Bain',
        'Chaussettes|Chaussons', 'Bonnet|Casquette', 'Écharpe|Foulard', 'Lunettes|Lentilles',
        'Montre|Horloge', 'Football|Rugby', 'Guitare|Violon', 'Piano|Orgue', 'Anniversaire|Mariage',
        'Cinéma|Théâtre', 'Pâtes|Riz', 'Beurre|Margarine', 'Lait|Yaourt', 'Clé|Cadenas',
        'Parapluie|Imperméable', 'Bougie|Lampe', 'Savon|Shampoing', 'Ballon|Balle'
      ]
    },
    {
      id: 'culture',
      name: 'Culture générale',
      desc: 'Histoire, arts, sciences',
      pairs: [
        'Tour Eiffel|Statue de la Liberté', 'La Joconde|La Jeune Fille à la perle',
        'Léonard de Vinci|Michel-Ange', 'Picasso|Dalí', 'Mozart|Beethoven', 'Napoléon|Jules César',
        'Louis XIV|Louis XVI', 'Révolution française|Mai 68',
        'Première Guerre mondiale|Seconde Guerre mondiale', 'Pyramides|Sphinx', 'Colisée|Parthénon',
        'Einstein|Newton', 'Marie Curie|Louis Pasteur', 'Victor Hugo|Émile Zola', 'Shakespeare|Molière',
        'Les Misérables|Le Comte de Monte-Cristo', 'Le Petit Prince|Alice au pays des merveilles',
        'Zeus|Poséidon', 'Hercule|Achille', 'Prix Nobel|Médaille Fields', 'Louvre|Musée d\'Orsay',
        'Versailles|Chambord', 'Grande Muraille de Chine|Mur de Berlin', 'Christophe Colomb|Magellan',
        'Cléopâtre|Néfertiti', 'Vikings|Gaulois', 'Moyen Âge|Renaissance', 'Opéra|Ballet',
        'Sculpture|Peinture', 'Roman|Nouvelle', 'Socrate|Platon', 'Démocratie|République',
        'ONU|Union européenne', 'Système solaire|Galaxie', 'Dinosaure|Mammouth', 'Bible|Coran',
        'Gandhi|Nelson Mandela', 'Van Gogh|Monet', 'Darwin|Galilée', 'Taj Mahal|Machu Picchu',
        'Big Ben|Tower Bridge', 'Jeanne d\'Arc|Marie-Antoinette', 'Chevalier|Samouraï',
        'Pharaon|Empereur', 'Hiéroglyphes|Alphabet', 'Odyssée|Iliade',
        'Roméo et Juliette|Tristan et Iseut', 'Astronaute|Cosmonaute', 'Atome|Molécule',
        'Équateur|Méridien de Greenwich'
      ]
    },
    {
      id: 'france',
      name: 'France',
      desc: 'Terroir, lieux et classiques français',
      pairs: [
        'Baguette|Croissant', 'Camembert|Brie', 'Raclette|Fondue', 'Champagne|Cidre',
        'Vin rouge|Rosé', 'Paris|Lyon', 'Marseille|Nice', 'Bretagne|Normandie', 'Crêpe|Galette',
        'Pain au chocolat|Pain aux raisins', 'Tour de France|Roland-Garros', '14 Juillet|11 Novembre',
        'Astérix|Obélix', 'Louis de Funès|Bourvil', 'Johnny Hallyday|Claude François',
        'Édith Piaf|Dalida', 'Jean Dujardin|Omar Sy', 'Intouchables|Bienvenue chez les Ch\'tis',
        'Le Dîner de cons|Les Visiteurs', 'TGV|RER', 'Élysée|Matignon', 'Président|Premier ministre',
        'Mont-Saint-Michel|Carcassonne', 'Côte d\'Azur|Côte basque', 'Alpes|Pyrénées', 'Seine|Loire',
        'Pétanque|Belote', 'Apéro|Goûter', 'Macaron|Éclair', 'Ratatouille|Bouillabaisse',
        'Cassoulet|Choucroute', 'Bœuf bourguignon|Blanquette de veau',
        'Escargots|Cuisses de grenouille', 'Foie gras|Saumon fumé', 'Galette des rois|Bûche de Noël',
        'Béret|Marinière', 'Coq|Marianne', 'Notre-Dame|Sacré-Cœur', 'Champs-Élysées|Montmartre',
        'Arc de Triomphe|Panthéon', 'Bac|Brevet', 'Grève|Manifestation', 'Renault|Peugeot',
        'Daft Punk|David Guetta', 'Koh-Lanta|Fort Boyard',
        'Les Bronzés|Le Père Noël est une ordure', 'Tartiflette|Gratin dauphinois',
        'Quiche lorraine|Tarte flambée', 'Corse|La Réunion', 'Molière|La Fontaine',
        'Kaamelott|OSS 117', 'Sécurité sociale|Mutuelle', 'Assemblée nationale|Sénat',
        'Boulangerie|Fromagerie'
      ]
    },
    {
      id: 'manga',
      name: 'Manga',
      desc: 'Shonen, seinen et héros de papier',
      pairs: [
        'Naruto|Sasuke', 'Luffy|Zoro', 'Goku|Vegeta', 'One Piece|Fairy Tail', 'Light Yagami|L',
        'Tanjiro|Zenitsu', 'Eren|Livaï', 'Sharingan|Byakugan', 'Kamehameha|Rasengan',
        'Fruit du démon|Haki', 'Shonen|Seinen', 'Mangaka|Scénariste', 'Tome|Chapitre',
        'Hokage|Roi des pirates', 'Akatsuki|Brigade fantôme', 'Gon|Kirua',
        'Edward Elric|Alphonse Elric', 'Ichigo|Rukia', 'Bleach|Soul Eater',
        'My Hero Academia|One Punch Man', 'Deku|Bakugo', 'Gojo|Sukuna',
        'Jujutsu Kaisen|Chainsaw Man', 'Sanji|Usopp', 'Nami|Nico Robin', 'Kakashi|Jiraya',
        'Itachi|Madara', 'Berserk|Vinland Saga', 'Tokyo Ghoul|Parasite', 'Slam Dunk|Haikyu',
        'Captain Tsubasa|Blue Lock', 'Détective Conan|Lupin III',
        'Fullmetal Alchemist|Hunter x Hunter', 'Death Note|Monster', 'Chakra|Nen', 'Nezuko|Anya',
        'Dragon Ball|Saint Seiya', 'Saitama|All Might', 'Titan colossal|Titan cuirassé',
        'Zanpakuto|Katana', 'Kurama|Shukaku', 'Akira Toriyama|Eiichiro Oda',
        'Spy x Family|Kaguya-sama', 'Shanks|Barbe Blanche'
      ]
    },
    {
      id: 'anime',
      name: 'Anime',
      desc: 'Séries, films d\'animation et studios',
      pairs: [
        'Studio Ghibli|Pixar', 'Totoro|Ponyo', 'Le Voyage de Chihiro|Princesse Mononoké',
        'Your Name|Les Enfants du temps', 'Hayao Miyazaki|Makoto Shinkai', 'Opening|Ending',
        'VOSTFR|VF', 'Crunchyroll|ADN', 'Pokémon|Digimon', 'Pikachu|Évoli', 'Sacha|Pierre',
        'Cowboy Bebop|Samurai Champloo', 'Evangelion|Gundam', 'Code Geass|Psycho-Pass',
        'Sword Art Online|Re:Zero', 'Olive et Tom|Inazuma Eleven',
        'Les Chevaliers du Zodiaque|Ken le Survivant', 'Goldorak|Albator', 'Nicky Larson|Cobra',
        'Cosplay|Déguisement', 'Otaku|Geek', 'Mecha|Robot', 'Isekai|Fantasy',
        'Akira|Ghost in the Shell', 'Le Château ambulant|Le Château dans le ciel',
        'Kiki la petite sorcière|Nausicaä', 'L\'Attaque des Titans|Demon Slayer',
        'Kuroko\'s Basket|Haikyu', 'Doraemon|Shin-chan', 'Heidi|Candy',
        'Super Saiyan|Ultra Instinct', 'Pokéball|Digivice', 'Frieren|Violet Evergarden',
        'Seiyuu|Doubleur', 'Japan Expo|Comic-Con', 'Sailor Moon|Sakura chasseuse de cartes',
        'Arcane|Cyberpunk Edgerunners', 'Dracaufeu|Tortank', 'Mewtwo|Lugia',
        'Film d\'animation|Série animée', 'Yu-Gi-Oh|Beyblade',
        'Le Tombeau des lucioles|Le vent se lève'
      ]
    },
    {
      id: 'foot',
      name: 'Foot',
      desc: 'Joueurs, clubs et gestes techniques',
      pairs: [
        'Messi|Cristiano Ronaldo', 'Mbappé|Haaland', 'Zidane|Platini', 'PSG|OM',
        'Real Madrid|FC Barcelone', 'Ligue 1|Premier League', 'Ligue des champions|Ligue Europa',
        'Coupe du monde|Euro', 'Ballon d\'Or|Soulier d\'Or', 'Penalty|Coup franc', 'Corner|Touche',
        'Carton jaune|Carton rouge', 'Gardien|Défenseur', 'Attaquant|Milieu de terrain',
        'Arbitre|VAR', 'Hors-jeu|Main', 'Stade de France|Parc des Princes', 'Vélodrome|Camp Nou',
        'Neymar|Ronaldinho', 'Pelé|Maradona', 'Griezmann|Giroud', 'Benzema|Thierry Henry',
        'Didier Deschamps|Pep Guardiola', 'Manchester City|Manchester United', 'Liverpool|Arsenal',
        'Juventus|AC Milan', 'Bayern Munich|Borussia Dortmund', 'Brésil|Argentine',
        'Tête|Retourné acrobatique', 'Petit pont|Sombrero', 'Dribble|Passe décisive',
        'Crampons|Protège-tibias', 'Mercato|Prêt', 'Supporter|Ultra', 'Derby|Clasico',
        'Tirs au but|Prolongations', 'Capitaine|Entraîneur', 'Lyon|Saint-Étienne', 'Lens|Lille',
        'Coupe de France|Trophée des champions', 'Triplé|Doublé', 'Banc de touche|Vestiaire',
        'Kanté|Pogba', 'Buffon|Neuer', 'Lloris|Maignan', 'Coup du foulard|Roulette',
        'Centre|Transversale'
      ]
    },
    {
      id: 'sport',
      name: 'Sport',
      desc: 'Tous les sports, hors foot',
      pairs: [
        'Tennis|Badminton', 'Basket|Handball', 'Rugby|Football américain', 'Ski|Snowboard',
        'Surf|Planche à voile', 'Judo|Karaté', 'Boxe|MMA', 'Formule 1|Rallye', 'Cyclisme|VTT',
        'Marathon|Sprint', 'Saut en hauteur|Saut à la perche', 'Golf|Mini-golf', 'Ping-pong|Padel',
        'Volley|Beach-volley', 'Escalade|Alpinisme', 'Escrime|Tir à l\'arc', 'Gymnastique|Danse',
        'Yoga|Pilates', 'Musculation|CrossFit', 'Skate|Roller',
        'Patinage artistique|Hockey sur glace', 'Aviron|Canoë-kayak', 'Bowling|Billard',
        'Fléchettes|Baby-foot', 'Michael Jordan|LeBron James', 'Nadal|Federer',
        'Usain Bolt|Carl Lewis', 'Wembanyama|Tony Parker', 'Hamilton|Verstappen',
        'Jeux olympiques|Jeux paralympiques', 'Médaille d\'or|Coupe', 'Wimbledon|US Open',
        'Maillot jaune|Maillot à pois', 'Super Bowl|Finale NBA', 'Raquette|Batte',
        'Essai|Touchdown', 'Échecs|Dames', 'Parachute|Parapente',
        'Saut à l\'élastique|Tyrolienne', 'Triathlon|Décathlon', 'Mohamed Ali|Mike Tyson',
        'Léon Marchand|Michael Phelps', 'Dunk|Smash', 'Natation|Water-polo',
        'Plongeon|Natation synchronisée', 'Teddy Riner|Antoine Dupont', 'Pétanque|Curling',
        'Équitation|Course hippique', 'Haltérophilie|Lancer de poids'
      ]
    },
    {
      id: 'tech',
      name: 'Technologie',
      desc: 'Appareils, applis et numérique',
      pairs: [
        'iPhone|Samsung Galaxy', 'Android|iOS', 'Windows|macOS', 'Google|Bing', 'ChatGPT|Siri',
        'Wi-Fi|Bluetooth', '4G|5G', 'Clavier|Souris', 'Ordinateur portable|Tablette',
        'Clé USB|Disque dur', 'Facebook|Instagram', 'TikTok|Snapchat', 'YouTube|Twitch',
        'WhatsApp|Messenger', 'Netflix|Disney+', 'Spotify|Deezer', 'Amazon|AliExpress',
        'Voiture électrique|Voiture hybride', 'Drone|Hélicoptère télécommandé',
        'Casque VR|Lunettes connectées', 'Montre connectée|Bracelet connecté',
        'Écouteurs|Casque audio', 'E-mail|SMS', 'Mot de passe|Code PIN',
        'Empreinte digitale|Reconnaissance faciale', 'Virus|Bug', 'Hacker|Développeur',
        'Site web|Application', 'Cloud|Serveur', 'Bitcoin|Ethereum', 'Imprimante|Scanner',
        'Imprimante 3D|Découpeuse laser', 'Écran|Vidéoprojecteur', 'Chargeur|Batterie externe',
        'QR code|Code-barres', 'GPS|Boussole', 'Elon Musk|Jeff Bezos', 'Steve Jobs|Bill Gates',
        'Apple|Microsoft', 'Python|JavaScript', 'Fibre|ADSL', 'Emoji|GIF', 'Podcast|Radio',
        'Streaming|Téléchargement', 'Satellite|Fusée', 'SpaceX|NASA',
        'Trottinette électrique|Vélo électrique', 'Alexa|Google Home', 'Capture d\'écran|Photo',
        'Mode avion|Mode silencieux', 'Liseuse|Livre audio', 'Robot aspirateur|Robot tondeuse',
        'Intelligence artificielle|Algorithme', 'Webcam|Micro'
      ]
    },
    {
      id: 'persos',
      name: 'Personnages cultes',
      desc: 'Héros et méchants que tout le monde connaît',
      pairs: [
        'Harry Potter|Frodon', 'Dark Vador|Voldemort', 'Batman|Superman', 'Spider-Man|Iron Man',
        'Joker|Thanos', 'James Bond|Ethan Hunt', 'Sherlock Holmes|Hercule Poirot',
        'Indiana Jones|Lara Croft', 'Mario|Sonic', 'Mickey|Bugs Bunny',
        'Jack Sparrow|Capitaine Crochet', 'Gandalf|Dumbledore', 'Yoda|Maître Splinter',
        'Luke Skywalker|Han Solo', 'Terminator|RoboCop', 'Rocky|Rambo', 'Tarzan|Mowgli',
        'Zorro|Robin des Bois', 'Dracula|Frankenstein', 'King Kong|Godzilla', 'E.T.|Alien',
        'Homer Simpson|Peter Griffin', 'Bob l\'éponge|Patrick l\'étoile de mer',
        'Tintin|Lucky Luke', 'Père Noël|Père Fouettard', 'Peter Pan|Pinocchio',
        'Cendrillon|Blanche-Neige', 'Elsa|Raiponce', 'Simba|Bambi', 'Wonder Woman|Catwoman',
        'Hermione|Katniss', 'Scooby-Doo|Snoopy', 'Garfield|Tom', 'Les Schtroumpfs|Les Minions',
        'Wolverine|Deadpool', 'Captain America|Thor', 'Neo|John Wick',
        'Tony Montana|Vito Corleone', 'Walter White|Thomas Shelby', 'Jon Snow|Daenerys',
        'Chewbacca|Groot', 'R2-D2|Wall-E', 'Buzz l\'Éclair|Woody', 'Gollum|Dobby',
        'Hannibal Lecter|Dexter', 'Mr Bean|Charlot', 'Arsène Lupin|Fantômas', 'Shrek|Hulk',
        'Barbie|Ken', 'Dora|Oui-Oui', 'Casper|Beetlejuice'
      ]
    },
    {
      id: 'cinema',
      name: 'Cinéma et séries',
      desc: 'Films, séries et coulisses',
      pairs: [
        'Titanic|Avatar', 'Star Wars|Star Trek', 'Le Seigneur des anneaux|Game of Thrones',
        'Marvel|DC', 'Breaking Bad|Narcos', 'Stranger Things|Mercredi',
        'La Casa de Papel|Prison Break', 'Friends|How I Met Your Mother',
        'The Office|Brooklyn Nine-Nine', 'Squid Game|Alice in Borderland',
        'Inception|Interstellar', 'Matrix|Blade Runner', 'Jurassic Park|King Kong',
        'Le Roi Lion|Le Livre de la jungle', 'Toy Story|Monstres et Cie',
        'La Reine des neiges|Vaiana', 'Les Dents de la mer|Alien', 'Scream|Halloween',
        'Oscar|César', 'Festival de Cannes|Mostra de Venise', 'Réalisateur|Producteur',
        'Acteur|Figurant', 'Bande-annonce|Générique', 'Tarantino|Scorsese',
        'Steven Spielberg|James Cameron', 'Leonardo DiCaprio|Brad Pitt',
        'Fast and Furious|Taxi', 'Le Parrain|Scarface', 'Pulp Fiction|Fight Club',
        'Gladiator|Troie', 'Avengers|Justice League', 'Pirates des Caraïbes|Indiana Jones',
        'Retour vers le futur|Terminator', 'Les Simpson|South Park', 'Rick et Morty|Futurama',
        'Dr House|Grey\'s Anatomy', 'The Walking Dead|The Last of Us', 'Comédie|Drame',
        'Western|Péplum', 'Suite|Remake', 'Saison|Épisode', 'Sous-titres|Doublage',
        'Pop-corn|Bonbons', 'Harry Potter|Twilight', 'Hunger Games|Divergente',
        'Shrek|Kung Fu Panda', 'Le Loup de Wall Street|Arrête-moi si tu peux',
        'Forrest Gump|La Ligne verte', 'Barbie|Oppenheimer'
      ]
    },
    {
      id: 'jeux',
      name: 'Jeux vidéo',
      desc: 'Consoles, licences et jargon gamer',
      pairs: [
        'Minecraft|Roblox', 'Fortnite|Apex Legends', 'Call of Duty|Battlefield', 'FIFA|PES',
        'GTA|Red Dead Redemption', 'Zelda|Link', 'PlayStation|Xbox', 'Nintendo Switch|Game Boy',
        'League of Legends|Dota 2', 'Valorant|Counter-Strike', 'Les Sims|Animal Crossing',
        'Tetris|Candy Crush', 'Pac-Man|Space Invaders', 'Among Us|Loup-garou',
        'Mario Kart|Crash Team Racing', 'Super Smash Bros|Street Fighter', 'Tekken|Mortal Kombat',
        'Assassin\'s Creed|Prince of Persia', 'God of War|Dark Souls', 'Elden Ring|Skyrim',
        'World of Warcraft|Final Fantasy', 'Clash of Clans|Clash Royale',
        'Overwatch|Team Fortress', 'Rocket League|Trackmania', 'Manette|Joystick',
        'Boss|Mini-boss', 'Niveau|Checkpoint', 'Skin|DLC', 'Speedrun|Glitch', 'E-sport|LAN',
        'Resident Evil|Silent Hill', 'Kirby|Yoshi', 'Bowser|Ganondorf',
        'Donkey Kong|Crash Bandicoot', 'Lara Croft|Nathan Drake', 'Steam|Epic Games',
        'PNJ|Avatar', 'Battle royale|FPS', 'Just Dance|Guitar Hero', 'Wii Sports|Wii Fit',
        'Angry Birds|Fruit Ninja', 'Cyberpunk 2077|Watch Dogs', 'Halo|Doom',
        'Geometry Dash|Flappy Bird', 'Mario|Luigi', 'The Witcher|Baldur\'s Gate',
        'Borne d\'arcade|Flipper', 'Game over|Écran de chargement'
      ]
    },
    {
      id: 'musique',
      name: 'Musique',
      desc: 'Artistes, instruments et styles',
      pairs: [
        'Guitare|Basse', 'Batterie|Percussions', 'Rap|Slam', 'Rock|Metal', 'Jazz|Blues',
        'Concert|Festival', 'Michael Jackson|Prince', 'Beyoncé|Rihanna',
        'Taylor Swift|Ariana Grande', 'Eminem|50 Cent', 'Les Beatles|Les Rolling Stones',
        'Queen|ABBA', 'Jul|SCH', 'Booba|Kaaris', 'Orelsan|Bigflo et Oli', 'Stromae|Angèle',
        'Céline Dion|Lara Fabian', 'Micro|Enceinte', 'DJ|Beatmaker', 'Album|Single',
        'Vinyle|CD', 'Refrain|Couplet', 'Karaoké|Blind test', 'Chorale|Orchestre',
        'Opéra|Comédie musicale', 'Saxophone|Trompette', 'Flûte|Clarinette',
        'Violon|Violoncelle', 'Piano|Synthétiseur', 'Eurovision|The Voice',
        'Star Academy|Nouvelle Star', 'K-pop|J-pop', 'BTS|Blackpink', 'Reggae|Dancehall',
        'Techno|House', 'Elvis Presley|Chuck Berry', 'Ed Sheeran|Justin Bieber',
        'The Weeknd|Drake', 'Indochine|Téléphone', 'Jean-Jacques Goldman|Francis Cabrel',
        'Nirvana|Red Hot Chili Peppers', 'Ukulélé|Banjo', 'Harmonica|Accordéon',
        'Aya Nakamura|Wejdene', 'Gims|Dadju', 'Chef d\'orchestre|Compositeur',
        'Playlist|Compilation', 'Partition|Tablature', 'Harpe|Lyre'
      ]
    },
    {
      id: 'cuisine',
      name: 'Cuisine',
      desc: 'Plats, ingrédients et boissons',
      pairs: [
        'Sushi|Maki', 'Kebab|Tacos', 'Frites|Chips', 'Ketchup|Mayonnaise', 'Moutarde|Wasabi',
        'Spaghetti|Tagliatelles', 'Lasagnes|Moussaka', 'Paella|Risotto', 'Couscous|Tajine',
        'Gaufre|Pancake', 'Nutella|Beurre de cacahuète', 'Miel|Sirop d\'érable',
        'Omelette|Œufs brouillés', 'Steak|Escalope', 'Saumon|Thon', 'Crevette|Langoustine',
        'Huître|Moule', 'Tomate|Poivron', 'Courgette|Concombre', 'Brocoli|Chou-fleur',
        'Oignon|Ail', 'Citron|Citron vert', 'Pastèque|Melon', 'Abricot|Pêche',
        'Amande|Noisette', 'Mozzarella|Feta', 'Emmental|Comté', 'Tiramisu|Panna cotta',
        'Mousse au chocolat|Fondant au chocolat', 'Brownie|Cookie', 'Donut|Beignet',
        'Soupe|Velouté', 'Sandwich|Wrap', 'Four|Micro-ondes', 'Poêle|Casserole',
        'Coca-Cola|Pepsi', 'Jus d\'orange|Limonade', 'Mojito|Spritz',
        'Eau plate|Eau gazeuse', 'Sel|Poivre', 'Barbecue|Plancha', 'Pique-nique|Brunch',
        'Chef cuisinier|Pâtissier', 'Ramen|Pho', 'Nems|Samoussas', 'Guacamole|Houmous',
        'Pop-corn|Barbe à papa', 'Hot-dog|Burger', 'Cappuccino|Chocolat chaud',
        'Croque-monsieur|Panini'
      ]
    },
    {
      id: 'animaux',
      name: 'Animaux et nature',
      desc: 'Bêtes, plantes et paysages',
      pairs: [
        'Loup|Renard', 'Ours|Panda', 'Dauphin|Orque', 'Requin|Baleine', 'Aigle|Faucon',
        'Hibou|Chouette', 'Pingouin|Manchot', 'Crocodile|Alligator', 'Tortue|Escargot',
        'Grenouille|Crapaud', 'Serpent|Lézard', 'Abeille|Guêpe', 'Papillon|Libellule',
        'Fourmi|Termite', 'Araignée|Scorpion', 'Éléphant|Rhinocéros', 'Girafe|Zèbre',
        'Singe|Gorille', 'Kangourou|Koala', 'Lapin|Lièvre', 'Souris|Rat',
        'Hamster|Cochon d\'Inde', 'Mouton|Chèvre', 'Cochon|Sanglier', 'Cerf|Chevreuil',
        'Pieuvre|Méduse', 'Crabe|Homard', 'Phoque|Otarie', 'Chameau|Dromadaire',
        'Léopard|Guépard', 'Perroquet|Toucan', 'Cygne|Oie', 'Pigeon|Mouette',
        'Moustique|Mouche', 'Cascade|Rivière', 'Désert|Savane', 'Chêne|Sapin',
        'Tournesol|Marguerite', 'Cactus|Palmier', 'Orage|Tornade',
        'Arc-en-ciel|Aurore boréale', 'Dragon|Licorne', 'Poisson rouge|Poisson-clown',
        'Hérisson|Porc-épic', 'Écureuil|Castor', 'Vache|Bison', 'Coccinelle|Scarabée',
        'Chauve-souris|Hirondelle', 'Flamant rose|Paon', 'Hippopotame|Morse'
      ]
    },
    {
      id: 'geo',
      name: 'Voyages et géographie',
      desc: 'Pays, villes et bagages',
      pairs: [
        'Espagne|Portugal', 'Italie|Grèce', 'Allemagne|Autriche', 'Angleterre|Irlande',
        'États-Unis|Canada', 'Chine|Japon', 'Australie|Nouvelle-Zélande', 'Maroc|Tunisie',
        'Suisse|Luxembourg', 'Suède|Norvège', 'Londres|New York', 'Rome|Athènes',
        'Barcelone|Madrid', 'Tokyo|Séoul', 'Dubaï|Las Vegas', 'Venise|Amsterdam',
        'Los Angeles|Miami', 'Sahara|Désert de Gobi', 'Himalaya|Cordillère des Andes',
        'Everest|Mont Blanc', 'Nil|Amazone', 'Atlantique|Pacifique', 'Île|Presqu\'île',
        'Hawaï|Bali', 'Maldives|Seychelles', 'Islande|Groenland', 'Pôle Nord|Pôle Sud',
        'Passeport|Carte d\'identité', 'Valise|Sac à dos', 'Hôtel|Camping',
        'Auberge de jeunesse|Chambre d\'hôtes', 'Croisière|Ferry', 'Aéroport|Gare',
        'Safari|Zoo', 'Chutes du Niagara|Grand Canyon', 'Afrique|Asie', 'Carte|Globe',
        'Douane|Frontière', 'Mexique|Brésil', 'Égypte|Turquie', 'Belgique|Pays-Bas',
        'Inde|Thaïlande', 'Volcan|Geyser', 'Fjord|Lagon', 'Capitale|Préfecture',
        'Christ Rédempteur|Statue de la Liberté', 'Berlin|Vienne', 'Québec|Louisiane'
      ]
    },
    {
      id: 'quotidien',
      name: 'Métiers et quotidien',
      desc: 'Travail, maison et vie de tous les jours',
      pairs: [
        'Boulanger|Pâtissier', 'Avocat|Juge', 'Professeur|Directeur', 'Plombier|Électricien',
        'Coiffeur|Barbier', 'Pilote|Hôtesse de l\'air', 'Serveur|Barman', 'Facteur|Livreur',
        'Journaliste|Présentateur', 'Architecte|Maçon', 'Pharmacien|Médecin',
        'Agriculteur|Jardinier', 'Caissier|Vendeur', 'Chauffeur de taxi|Chauffeur de bus',
        'Détective|Espion', 'Peintre|Photographe', 'Écrivain|Poète', 'Banquier|Comptable',
        'Ascenseur|Escalator', 'Réveil|Alarme', 'Machine à laver|Lave-vaisselle',
        'Aspirateur|Balai', 'Frigo|Congélateur', 'Oreiller|Couette', 'Miroir|Fenêtre',
        'Portefeuille|Porte-monnaie', 'Ciseaux|Cutter', 'Marteau|Tournevis',
        'Échelle|Escabeau', 'Carte bancaire|Espèces', 'Supermarché|Marché',
        'Bibliothèque|Librairie', 'Hôpital|Clinique', 'Restaurant|Cantine',
        'Bar|Boîte de nuit', 'Vacances|Week-end', 'Réunion|Entretien d\'embauche',
        'Stage|Alternance', 'Salaire|Argent de poche', 'Loyer|Crédit',
        'Embouteillage|Travaux', 'Permis de conduire|Code de la route',
        'Télétravail|Open space', 'Dentiste|Orthodontiste', 'Vétérinaire|Éleveur',
        'Pompier|Ambulancier', 'Poubelle|Compost', 'Parking|Garage',
        'Ticket de caisse|Facture', 'Colis|Lettre'
      ]
    },
    {
      id: 'internet',
      name: 'Internet et créateurs',
      desc: 'Réseaux, applis et vidéastes',
      pairs: [
        'Squeezie|Cyprien', 'Inoxtag|Michou', 'McFly et Carlito|Mister V', 'Mème|Sticker',
        'Like|Partage', 'Influenceur|Youtubeur', 'Hashtag|Mention', 'Story|Reel',
        'Vlog|Podcast', 'Live|Replay', 'Buzz|Bad buzz', 'Troll|Hater', 'Spoiler|Teaser',
        'Wikipédia|Dictionnaire', 'Reddit|Discord', 'Twitter|Threads', 'LinkedIn|Indeed',
        'Tinder|Bumble', 'Vinted|Leboncoin', 'Uber|BlaBlaCar', 'Uber Eats|Deliveroo',
        'Airbnb|Booking', 'Zoom|Teams', 'Selfie|Photo de profil', 'Fake news|Rumeur',
        'Spam|Publicité', 'Cookie|Captcha', 'Mode sombre|Mode clair', 'MrBeast|PewDiePie',
        'ZEvent|Téléthon', 'Kameto|Gotaga', 'Domingo|ZeratoR',
        'Léna Situations|EnjoyPhoenix', 'Tibo InShape|Juju Fitcats', 'Abonné|Fan',
        'Pseudo|Avatar', 'Tuto|Unboxing', 'Commentaire|Message privé', 'Filtre|Retouche',
        'Clash|Drama', 'Notification|Alerte', 'Vidéo virale|Tendance'
      ]
    }
  ];

  if (typeof module === 'object' && module.exports) module.exports = THEMES;
  else root.THEMES = THEMES;
})(typeof self !== 'undefined' ? self : this);
