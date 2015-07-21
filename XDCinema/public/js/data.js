var cinemaLocations = [
    {"city": "Zurich", "name": "abaton", "lat": 47.388953, "long": 8.52118, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/abaton/"},
    {"city": "Zurich", "name": "Arena Cinemas", "lat": 47.3590066, "long": 8.5248245, "website": "https://www.arena.ch/de/sihlcity"},
    {"city": "Zurich", "name": "capitol", "lat": 47.3778703, "long": 8.5440894, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/capitol/"},
    {"city": "Zurich", "name": "corso", "lat": 47.366633, "long": 8.546574, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/corso/"},
    {"city": "Zurich", "name": "metropol", "lat": 47.3737017, "long": 8.530716, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/metropol/"},
    {"city": "Zurich", "name": "Arthouse Movie", "lat": 47.3706948, "long": 8.5435212, "website": "http://www.arthouse.ch/"},
    {"city": "Zurich", "name": "Riffraff", "lat": 47.3826286, "long": 8.5293278, "website": "http://www.riffraff.ch/"},
    {"city": "Lucerne", "name": "capitol", "lat": 47.0459991, "long": 8.3097675, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/capitol/"},
    {"city": "Lucerne", "name": "Bourbaki", "lat": 47.0564005, "long": 8.3115412, "website": "http://www.kinoluzern.ch/"},
    {"city": "Basel", "name": "Pathe Kuechlin", "lat": 47.5524925, "long": 7.5884172, "website": "http://www.pathe.ch/de/basel/kuchlin"},
    {"city": "Basel", "name": "capitol", "lat": 47.5526131, "long": 7.5882383, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/capitol/"},
    {"city": "Basel", "name": "rex", "lat": 47.553032, "long": 7.5889299, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/rex/"},
    {"city": "Basel", "name": "kult.kino atelier", "lat": 47.5531027, "long": 7.5900093, "website": "http://www.kultkino.ch/"},
    {"city": "Bern", "name": "city", "lat": 46.9496991, "long": 7.4428007, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/city/"},
    {"city": "Bern", "name": "Pathe Westside", "lat": 46.9439424, "long": 7.3726229, "website": "http://www.pathe.ch/de/bern/westside"},
    {"city": "Bern", "name": "jura", "lat": 46.946866, "long": 7.440348, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/jura/"},
    {"city": "Bern", "name": "CineBubenberg", "lat": 46.947663, "long": 7.4371833, "website": "http://www.quinnie.ch/"},
    {"city": "Bern", "name": "capitol", "lat": 46.948042, "long": 7.4489234, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/capitol/"},
    {"city": "Bern", "name": "splendid", "lat": 46.9485731, "long": 7.4417456, "website": "https://www.kitag.com/de/kinos-und-infos/kinos/splendid/"},
    {"city": "Bern", "name": "CineMovie", "lat": 46.9471707, "long": 7.4355858, "website": "http://www.quinnie.ch/"},
    {"city": "Olten", "name": "youcinema", "lat": 47.3490232, "long": 7.9107891, "website": "http://youcinema.ch/Standort-Olten"},
    {"city": "Olten", "name": "Palace", "lat": 47.3517928, "long": 7.9015585, "website": "http://youcinema.ch/Standort-Olten"}
];

var cities = [
    "Zurich",
    "Lucerne",
    "Basel",
    "Bern",
    "Olten"
];

var movies = [
    {
        "title": "Minions",
        "img": "img/minions.jpg",
        "summary": "The story of Universal Pictures and Illumination Entertainment's Minions begins at the dawn of time. Starting as single-celled yellow organisms, Minions evolve through the ages, perpetually serving the most despicable of masters. Continuously unsuccessful at keeping these masters-from T. rex to Napoleon-the Minions find themselves without someone to serve and fall into a deep depression. But one Minion named Kevin has a plan, and he-alongside teenage rebel Stuart and lovable little Bob-ventures out into the world to find a new evil boss for his brethren to follow. The trio embarks upon a thrilling journey that ultimately leads them to their next potential master, Scarlet Overkill (Academy Award (R) winner Sandra Bullock), the world's first-ever female super-villain. They travel from frigid Antarctica to 1960s New York City, ending in mod London, where they must face their biggest challenge to date: saving all of Minionkind...from annihilation.",
        "genres": "Animation, Kids & Family, Comedy",
        "runtime": "1 hr 31 min",
        "rating": "3.5/5",
        "trailer": "https://www.youtube.com/watch?v=eisKxhjBnZ0"
    },
    {
        "title": "Entourage",
        "img": "img/entourage.jpg",
        "summary": "Entourage, the much-anticipated big-screen version of the award-winning hit HBO series, reunites the show's original cast, led by Kevin Connolly, Adrian Grenier, Kevin Dillon, Jerry Ferrara and Jeremy Piven. Movie star Vincent Chase (Grenier), together with his boys, Eric (Connolly), Turtle (Ferrara) and Johnny (Dillon), are back...and back in business with super agent-turned-studio head Ari Gold (Piven). Some of their ambitions have changed, but the bond between them remains strong as they navigate the capricious and often cutthroat world of Hollywood.",
        "genres": "Comedy",
        "runtime": "1 hr 45 min",
        "rating": "3.8/5",
        "trailer": "https://www.youtube.com/watch?v=SGSE_XPF4_g"
    },
    {
        "title": "Jurassic World",
        "img": "img/jurassic_world.jpg",
        "summary": "Steven Spielberg returns to executive produce the long-awaited next installment of his groundbreaking Jurassic Park series, Jurassic World. Colin Trevorrow directs the epic action-adventure based on characters created by Michael Crichton. The screenplay is by Rick Jaffa & Amanda Silver and Derek Connolly & Trevorrow, and the story is by Rick Jaffa & Amanda Silver. Frank Marshall and Patrick Crowley join the team as producers.",
        "genres": "Action & Adventure, Mystery & Suspense, Science Fiction & Fantasy",
        "runtime": "2 hr 3 min",
        "rating": "4s/5",
        "trailer": "https://www.youtube.com/watch?v=RFinNxS5KN4"
    },
    {
        "title": "The DUFF",
        "img": "img/duff.jpg",
        "summary": "Bianca (Mae Whitman) is a content high school senior whose world is shattered when she learns the student body knows her as 'The DUFF' (Designated Ugly Fat Friend) to her prettier, more popular friends (Skyler Samuels & Bianca Santos). Now, despite the words of caution from her favorite teacher (Ken Jeong), she puts aside the potential distraction of her crush, Toby (Nick Eversman), and enlists Wesley (Robbie Amell), a slick but charming jock, to help reinvent herself. To save her senior year from turning into a total disaster, Bianca must find the confidence to overthrow the school's ruthless label maker Madison (Bella Thorne) and remind everyone that no matter what people look or act like, we are all someone's DUFF.",
        "genres": "Comedy",
        "runtime": "1 hr 40 min",
        "rating": "3.7/5",
        "trailer": "https://www.youtube.com/watch?v=ci7eKlNRiuw"
    },
    {
        "title": "Ted 2",
        "img": "img/ted_2.jpg",
        "summary": "Newlywed couple Ted and Tami-Lynn want to have a baby, but in order to qualify to be a parent, Ted will have to prove he's a person in a court of law.",
        "genres": "Comedy",
        "runtime": "1 hr 55 min",
        "rating": "3.5/5",
        "trailer": "https://www.youtube.com/watch?v=S3AVcCggRnU"
    },
    {
        "title": "Terminator Genisys",
        "img": "img/terminator_genisys.jpg",
        "summary": "James Cameron's sci-fi classic gets rebooted in this Paramount production designed as the first installment in a new trilogy.",
        "genres": "Action & Adventure",
        "runtime": "1 hr 59 min",
        "rating": "3.6/5",
        "trailer": "https://www.youtube.com/watch?v=62E4FJTwSuc"
    },
    {
        "title": "Amy - The girl behind the name",
        "img": "img/amy.jpg",
        "summary": "The story of Amy Winehouse in her own words, featuring unseen archival footage and unheard tracks.",
        "genres": "Musical & Performance Arts",
        "runtime": "1 hr 20 min",
        "rating": "4.3/5",
        "trailer": "https://www.youtube.com/watch?v=ZZBXpVXGA_s"
    },
    {
        "title": "While We're Young",
        "img": "img/while_were_young.jpg",
        "summary": "Noah Boaumbach's comedy While We're Young stars Ben Stiller and Naomi Watts as Josh and Cornelia, a childless New York married couple in their mid-forties. As their other friends all start having children, the couple gravitates toward a young hipster couple named Jamie (Adam Driver) and Darby (Amanda Seyfried). He's an aspiring documentary filmmaker, a vocation Josh already has. Soon the older couple begins enjoying the energy they feel haging out with the younger generation, but eventually Josh begins to suspect his new best friend might not be as straightforward and trustworthy as he thought. While We're Young screened at the 2014 Toronto International Film Festival.",
        "genres": "Drama, Comedy",
        "runtime": "1 hr 34 min",
        "rating": "3.3/5",
        "trailer": "https://www.youtube.com/watch?v=NRUcm9Qw9io"
    },
    {
        "title": "Unfriended",
        "img": "img/unfriended.jpg",
        "summary": "Unfriended unfolds over a teenager's computer screen as she and her friends are stalked by an unseen figure who seeks vengeance for a shaming video that led a vicious bully to kill herself a year earlier.",
        "genres": "Mystery & Suspense, Horror",
        "runtime": "1 hr 22 min",
        "rating": "2.9/5",
        "trailer": "https://www.youtube.com/watch?v=Q72LWqCx3pc"
    }
];

var showtimes = [
    {
        "city": "Zurich",
        "movies": [
            {
                "title": "Minions",
                "cinemas": [
                    {"name": "abaton", "showtimes": ["14:00", "16:30", "17:15", "20:15", "21:00"]},
                    {"name": "Arena Cinemas", "showtimes": ["14:40", "17:10", "17:40", "20:10"]},
                    {"name": "capitol", "showtimes": ["14:15", "17:15", "20:15"]},
                    {"name": "corso", "showtimes": ["14:00", "16:30", "20:00", "20:30"]}
                ]
            },
            {
                "title": "Entourage",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:00", "17:00", "20:00"]}
                ]
            },
            {
                "title": "Jurassic World",
                "cinemas": [
                    {"name": "abaton", "showtimes": ["14:15", "14:45", "17:15", "17:45", "20:45"]},
                    {"name": "Arena Cinemas", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "capitol", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "corso", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "metropol", "showtimes": ["14:15", "17:15", "20:15"]}
                ]
            },
            {
                "title": "The DUFF",
                "cinemas": [
                    {"name": "abaton", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "Arena Cinemas", "showtimes": ["15:55", "20:50"]}
                ]
            },
            {
                "title": "Ted 2",
                "cinemas": [
                    {"name": "abaton", "showtimes": ["14:15", "17:15", "20:15"]},
                    {"name": "Arena Cinemas", "showtimes": ["17:20", "20:20"]},
                    {"name": "corso", "showtimes": ["15:00", "18:00", "21:00"]}
                ]
            },
            {
                "title": "Terminator Genisys",
                "cinemas": [
                    {"name": "abaton", "showtimes": ["14:15", "17:15", "20:15"]},
                    {"name": "Arena Cinemas", "showtimes": ["17:00", "17:30", "20:00", "20:30"]},
                    {"name": "metropol", "showtimes": ["14:45", "17:45", "20:45"]}
                ]
            },
            {
                "title": "Amy - The girl behind the name",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:15", "17:15", "20:15"]},
                    {"name": "Riffraff", "showtimes": ["16:40"]},
                    {"name": "Arthouse Movie", "showtimes": ["16:40"]}
                ]
            },
            {
                "title": "While We're Young",
                "cinemas": [
                    {"name": "Arthouse Movie", "showtimes": ["17:00", "21:00"]},
                    {"name": "Riffraff", "showtimes": ["16:50", "18:50", "20:50"]},
                    {"name": "Arena Cinemas", "showtimes": ["14:15", "17:15", "20:00"]}
                ]
            },
            {
                "title": "Unfriended",
                "cinemas": [
                    {"name": "abaton", "showtimes": ["14:15", "16:15", "18:30", "20:45"]},
                    {"name": "Arena Cinemas", "showtimes": ["15:45", "18:20", "21:00"]}
                ]
            }
        ]
    },
    {
        "city": "Lucerne",
        "movies": [
            {
                "title": "Minions",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:30", "17:00", "20:00"]},
                    {"name": "moderne", "showtimes": ["14:45", "17:30", "20:15"]}
                ]
            },
            {
                "title": "Entourage",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:15", "17:15", "20:15"]}
                ]
            },
            {
                "title": "Jurassic World",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:15", "17:15", "20:15"]}

                ]
            },
            {
                "title": "Ted 2",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:15", "17:15", "20:15"]}
                ]
            },
            {
                "title": "Terminator Genisys",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:30", "17:30", "20:30"]}
                ]
            },
            {
                "title": "Amy - The girl behind the name",
                "cinemas": [
                    {"name": "Bourbaki", "showtimes": ["20:30"]}
                ]
            },
            {
                "title": "While We're Young",
                "cinemas": [
                    {"name": "Bourbaki", "showtimes": ["18:45", "20:45"]}
                ]
            }
        ]
    },
    {
        "city": "Basel",
        "movies": [
            {
                "title": "Minions",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["15:00", "18:00", "21:00"]},
                    {"name": "Pathe Kuechlin", "showtimes": ["13:30", "15:30", "17:45", "20:00"]},
                    {"name": "rex", "showtimes": ["14:00", "17:00", "20:00"]}
                ]
            },
            {
                "title": "Entourage",
                "cinemas": [
                    {"name": "Pathe Kuechlin", "showtimes": ["16:00"]}
                ]
            },
            {
                "title": "Jurassic World",
                "cinemas": [
                    {"name": "Pathe Kuechlin", "showtimes": ["12:45", "15:30", "18:10", "20:45"]}
                ]
            },
            {
                "title": "The DUFF",
                "cinemas": [
                    {"name": "Pathe Kuechlin", "showtimes": ["13:15", "15:30"]}
                ]
            },
            {
                "title": "Ted 2",
                "cinemas": [
                    {"name": "Pathe Kuechlin", "showtimes": ["18:00"]}
                ]
            },
            {
                "title": "Terminator Genisys",
                "cinemas": [
                    {"name": "Pathe Kuechlin", "showtimes": ["12:45", "15:30", "18:10", "20:45"]},
                    {"name": "capitol", "showtimes": ["15:00", "18:00", "21:00"]}
                ]
            },
            {
                "title": "Amy - The girl behind the name",
                "cinemas": [
                    {"name": "kult.kino atelier", "showtimes": ["21:00"]},
                    {"name": "rex", "showtimes": ["14:00", "17:00", "20:00"]}
                ]
            },
            {
                "title": "While We're Young",
                "cinemas": [
                    {"name": "kult.kino atelier", "showtimes": ["17:00", "19:00", "21:15"]},
                    {"name": "Pathe Kuechlin", "showtimes": ["12:45", "14:45", "16:45", "18:45", "20:45"]}
                ]
            },
            {
                "title": "Unfriended",
                "cinemas": [
                    {"name": "Pathe Kuechlin", "showtimes": ["14:00", "16:00", "17:30", "20:30"]}
                ]
            }
        ]
    },
    {
        "city": "Bern",
        "movies": [
            {
                "title": "Minions",
                "cinemas": [
                    {"name": "city", "showtimes": ["14:15", "16:30", "18:45", "21:00"]},
                    {"name": "Pathe Westside", "showtimes": ["10:00", "12:00", "14:00", "16:00", "18:15", "20:30"]},
                    {"name": "jura", "showtimes": ["14:15", "16:30", "18:45", "21:00"]},
                    {"name": "CineBubenberg", "showtimes": ["14:00", "16:00", "18:00"]}
                ]
            },
            {
                "title": "Entourage",
                "cinemas": [
                    {"name": "Pathe Westside", "showtimes": ["10:45", "13:15"]}
                ]
            },
            {
                "title": "Jurassic World",
                "cinemas": [
                    {"name": "city", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "jura", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "Pathe Westside", "showtimes": ["10:00", "12:45", "18:00", "20:45"]}
                ]
            },
            {
                "title": "The DUFF",
                "cinemas": [
                    {"name": "Pathe Westside", "showtimes": ["10:30", "16:45", "19:00", "21:10"]}
                ]
            },
            {
                "title": "Ted 2",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "Pathe Westside", "showtimes": ["10:30", "13:00", "15:30", "18:00", "20:30"]}
                ]
            },
            {
                "title": "Terminator Genisys",
                "cinemas": [
                    {"name": "Pathe Westside", "showtimes": ["10:00", "12:40", "18:10", "21:00"]},
                    {"name": "splendid", "showtimes": ["14:00", "17:00", "20:00"]}
                ]
            },
            {
                "title": "Amy - The girl behind the name",
                "cinemas": [
                    {"name": "CineBubenberg", "showtimes": ["20:00"]}
                ]
            },
            {
                "title": "While We're Young",
                "cinemas": [
                    {"name": "CineMovie", "showtimes": ["14:45", "17:45", "20:15"]},
                    {"name": "Pathe Westside", "showtimes": ["11:00", "13:00", "15:00", "17:00", "19:00", "21:00"]}
                ]
            },
            {
                "title": "Unfriended",
                "cinemas": [
                    {"name": "capitol", "showtimes": ["14:30", "17:30", "20:30"]},
                    {"name": "Pathe Westside", "showtimes": ["12:45", "14:45", "19:15", "21:10"]}
                ]
            }
        ]
    },
    {
        "city": "Olten",
        "movies": [
            {
                "title": "Minions",
                "cinemas": [
                    {"name": "youcinema", "showtimes": ["15:00", "17:30", "20:00"]}
                ]
            },
            {
                "title": "Jurassic World",
                "cinemas": [
                    {"name": "youcinema", "showtimes": ["18:00"]}
                ]
            },
            {
                "title": "The DUFF",
                "cinemas": [
                    {"name": "youcinema", "showtimes": ["15:30"]}
                ]
            },
            {
                "title": "Terminator Genisys",
                "cinemas": [
                    {"name": "youcinema", "showtimes": ["15:10", "20:50"]}
                ]
            },
            {
                "title": "Amy - The girl behind the name",
                "cinemas": [
                    {"name": "youcinema", "showtimes": ["17:50"]}
                ]
            },
            {
                "title": "Unfriended",
                "cinemas": [
                    {"name": "Palace", "showtimes": ["20:30"]}
                ]
            }
        ]
    }
];