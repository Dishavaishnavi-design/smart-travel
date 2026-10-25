
// ── Auth: Check login on page load ──────────────────────────
(function checkAuth() {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const welcomeMsg = document.getElementById("welcomeMsg");
    const addSection = document.getElementById("addDestinationSection");

    if (token && userName) {
        loginLink.style.display = "none";
        logoutBtn.style.display = "inline-block";
        welcomeMsg.textContent = "👋 Hi, " + userName + (userRole === "admin" ? " 🛡️" : "") + "!";
    }

    // Show Add Destination section only for admins
    if (userRole === "admin") {
        addSection.style.display = "block";
    } else {
        addSection.style.display = "none";
    }
})();

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "/login.html";
}

function isLoggedIn() {
    return !!(localStorage.getItem("token") && localStorage.getItem("userName"));
}

function handleNavPlanTrip(e) {
    if (!isLoggedIn()) {
        if (e) e.preventDefault();
        window.location.href = "/login.html";
        return;
    }
}

function handleNavSavedItin(e) {
    if (!isLoggedIn()) {
        if (e) e.preventDefault();
        window.location.href = "/login.html";
        return;
    }
}

function handlePlannerSubmit(e) {
    if (e) e.preventDefault();
    if (!isLoggedIn()) {
        const destSelect = document.getElementById("planDestination");
        if (destSelect && destSelect.value) {
            localStorage.setItem("pendingPlanDestination", destSelect.value);
        }
        window.location.href = "/login.html";
        return;
    }
    generateItinerary();
}

const defaultDestinations = [
    {
        name: "Taj Mahal",
        location: "Agra, Uttar Pradesh",
        description: "Visit the famous white marble monument."
    },
    {
        name: "Goa Beaches",
        location: "Goa, India",
        description: "Enjoy beautiful beaches and sunsets."
    },
    {
        name: "Araku Valley",
        location: "Andhra Pradesh, India",
        description: "Explore green hills, coffee gardens and waterfalls."
    },
    {
        name: "Kerala",
        location: "Kerala, India",
        description: "Experience peaceful backwaters and nature."
    },
    {
        name: "Jaipur",
        location: "Rajasthan, India",
        description: "Discover forts, palaces and historical places."
    },
    {
        name: "Ooty",
        location: "Tamil Nadu, India",
        description: "Enjoy cool weather and beautiful green hills."
    },
    
    {
        name: "Visakhapatnam",
        location: "Andhra Pradesh, India",
        description: "Enjoy RK Beach, Kailasagiri and scenic coastal views."
    },
    {
        name: "Lambasingi",
        location: "Andhra Pradesh, India",
        description: "Experience misty hills and beautiful scenery."
    },
    {
        name: "Tirupati",
        location: "Andhra Pradesh, India",
        description: "Visit the famous Tirumala Venkateswara Temple."
    },
    {
        name: "Hampi",
        location: "Karnataka, India",
        description: "Explore ancient temples and historic ruins."
    },
    {
        name: "Mysuru",
        location: "Karnataka, India",
        description: "Discover Mysore Palace and local markets."
    },
    {
        name: "Munnar",
        location: "Kerala, India",
        description: "Explore tea plantations and misty valleys."
    },
    {
        name: "Manali",
        location: "Himachal Pradesh, India",
        description: "Enjoy mountain views and seasonal snow."
    },
    {
        name: "Darjeeling",
        location: "West Bengal, India",
        description: "See tea gardens and Himalayan views."
    },
    {
        name: "Udaipur",
        location: "Rajasthan, India",
        description: "Discover beautiful lakes and historic palaces."
    },
    {
        name: "Rishikesh",
        location: "Uttarakhand, India",
        description: "Enjoy riverside scenery and adventure activities."
    },
    {
        name: "Mumbai",
        location: "Maharashtra, India",
        description: "Explore the Gateway of India and city attractions."
    },
    {
        name: "Andaman Islands",
        location: "Andaman and Nicobar Islands, India",
        description: "Enjoy tropical beaches and clear waters."
    }
    
];

let destinations = [...defaultDestinations];

const destinationList = document.getElementById("destinationList");

function displayDestinations(list) {
    destinationList.innerHTML = "";

    if (list.length === 0) {
        destinationList.innerHTML = "<p>No destinations found.</p>";
        return;
    }

    list.forEach(function(destination) {
        const card = document.createElement("div");
        card.className = "destination-card";

        const title = document.createElement("h3");
        title.textContent = destination.name;

        const location = document.createElement("p");
        location.textContent = destination.location;

        const description = document.createElement("p");
        description.textContent =
            destination.description || "Explore this beautiful destination.";

        const button = document.createElement("button");
        button.textContent = "Plan This Trip";

        button.addEventListener("click", function() {
            if (!isLoggedIn()) {
                localStorage.setItem("pendingPlanDestination", destination.name);
                window.location.href = "/login.html";
                return;
            }
            const select = document.getElementById("planDestination");
            if (select) select.value = destination.name;
            document.getElementById("planner").scrollIntoView({
                behavior: "smooth"
            });
            generateItinerary();
        });

        card.append(title, location, description, button);
        destinationList.appendChild(card);
    });
}

// Load destinations from MongoDB through the backend API
async function loadDestinations() {
    try {
        const response = await fetch("/api/destinations");

        if (!response.ok) {
            throw new Error("Could not load destinations");
        }

        const databaseDestinations = await response.json();

        // Keep existing cards and update/add database destinations
        databaseDestinations.forEach(function(item) {
            const index = destinations.findIndex(function(destination) {
                return destination.name.toLowerCase() ===
                    item.name.toLowerCase();
            });

            if (index !== -1) {
                destinations[index] = {
                    ...destinations[index],
                    ...item
                };
            } else {
                destinations.push({
                    ...item,
                    description:
                        item.description ||
                        "Explore this beautiful destination."
                });
            }
        });

        displayDestinations(destinations);
        populatePlannerDropdown();
    } catch (error) {
        console.error("Destination loading error:", error);
        // The default destinations remain available if the API fails.
    }
}

// Show existing destinations immediately
displayDestinations(destinations);

// Load database destinations
loadDestinations();

// Search destinations
document.getElementById("search").addEventListener("input", function() {
    const searchText = this.value.toLowerCase();

    const filteredDestinations = destinations.filter(function(destination) {
        return (
            destination.name.toLowerCase().includes(searchText) ||
            destination.location.toLowerCase().includes(searchText)
        );
    });

    displayDestinations(filteredDestinations);
});


// ── Itinerary Database ───────────────────────────────────────
// ── Itinerary Database (Clean, Realistic Itineraries for All Destinations) ─
const itineraryDB = {
    "Araku Valley": {
        hub: "Vizag",
        transport: "Train / Bus",
        travelCost: 1500,
        hotelCostPerNight: 750,
        foodCostPerDay: 333.34,
        day1: {
            title: "Vizag to Araku",
            activities: [
                "Train / Bus to Araku",
                "Visit Araku Valley (Borra Caves, Tribal Museum)",
                "Stay at Araku"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Coffee Plantations",
                    "Waterfalls",
                    "Local food"
                ]
            },
            {
                title: "Gardens & Hilltop Views",
                activities: [
                    "Padmapuram Botanical Gardens",
                    "Chaparai Water Cascades",
                    "Tribal handicrafts & organic coffee shopping"
                ]
            },
            {
                title: "Adventure & Valleys",
                activities: [
                    "Ananthagiri Hills viewpoint trek",
                    "Katiki Waterfalls exploration",
                    "Authentic bamboo chicken & regional cuisine"
                ]
            }
        ],
        returnDay: {
            title: "Return to Vizag",
            activities: [
                "Morning sightseeing",
                "Return to Vizag"
            ]
        }
    },
    "Visakhapatnam": {
        hub: "Vizag",
        transport: "Train / Flight",
        travelCost: 1200,
        hotelCostPerNight: 900,
        foodCostPerDay: 400,
        day1: {
            title: "Arrival in Visakhapatnam",
            activities: [
                "Train / Flight to Visakhapatnam",
                "Visit RK Beach & Submarine Museum",
                "Stay at Visakhapatnam"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Kailasagiri Hilltop ropeway & coastal view",
                    "Rushikonda Beach water sports",
                    "Local Andhra seafood"
                ]
            },
            {
                title: "Heritage & Nature",
                activities: [
                    "Simhachalam ancient hill temple",
                    "Indira Gandhi Zoological Park",
                    "Tenneti Park cliff-side view"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning beach walk & local shopping",
                "Return journey home"
            ]
        }
    },
    "Lambasingi": {
        hub: "Vizag",
        transport: "Bus / Cab",
        travelCost: 1200,
        hotelCostPerNight: 800,
        foodCostPerDay: 350,
        day1: {
            title: "Vizag to Lambasingi",
            activities: [
                "Scenic drive / Bus from Vizag to Lambasingi",
                "Check-in to misty hill camp / resort",
                "Stay at Lambasingi"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Misty valley sunrise & strawberry gardens",
                    "Kothapalli Waterfalls",
                    "Local tribal food & bonfire"
                ]
            },
            {
                title: "Plantations & Waterfalls",
                activities: [
                    "Thandava River & reservoir walk",
                    "Coffee & black pepper plantation tour",
                    "Organic hill honey & local tea tasting"
                ]
            }
        ],
        returnDay: {
            title: "Return to Vizag",
            activities: [
                "Morning fog photography",
                "Return to Vizag"
            ]
        }
    },
    "Tirupati": {
        hub: "Transit",
        transport: "Train / Bus",
        travelCost: 1500,
        hotelCostPerNight: 900,
        foodCostPerDay: 400,
        day1: {
            title: "Journey to Tirupati",
            activities: [
                "Train / Bus to Tirupati",
                "Check-in to hotel / guesthouse",
                "Stay at Tirupati"
            ]
        },
        sightseeingPool: [
            {
                title: "Tirumala Darshan & Sightseeing",
                activities: [
                    "Tirumala Venkateswara Temple Darshan",
                    "Silathoranam & Akasaganga Theertham",
                    "Local South Indian food & Laddu prasadam"
                ]
            },
            {
                title: "Heritage Temples",
                activities: [
                    "Sri Padmavathi Ammavari Temple (Tiruchanur)",
                    "Kapila Theertham sacred waterfall",
                    "Chandragiri Fort & heritage museum"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning temple prayers & souvenir shopping",
                "Return journey home"
            ]
        }
    },
    "Goa Beaches": {
        hub: "Goa",
        transport: "Train / Flight",
        travelCost: 2500,
        hotelCostPerNight: 1500,
        foodCostPerDay: 600,
        day1: {
            title: "Journey to Goa",
            activities: [
                "Train / Flight to Goa",
                "Check-in to beachside resort",
                "Stay at Goa"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Calangute & Baga Beach water sports",
                    "Dudhsagar / Waterfalls & Chapora Fort",
                    "Local Goan food & beach shacks"
                ]
            },
            {
                title: "South Goa & Heritage",
                activities: [
                    "Basilica of Bom Jesus in Old Goa",
                    "Palolem Beach & dolphin boat cruise",
                    "Mandovi River sunset cruise & music"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning beach walk & cashew shopping",
                "Return journey home"
            ]
        }
    },
    "Taj Mahal": {
        hub: "Delhi",
        transport: "Train / Express Bus",
        travelCost: 1800,
        hotelCostPerNight: 1200,
        foodCostPerDay: 500,
        day1: {
            title: "Delhi to Agra",
            activities: [
                "Express Train / Bus to Agra",
                "Visit Agra Fort & Mehtab Bagh",
                "Stay at Agra"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Sunrise visit to iconic Taj Mahal",
                    "Fatehpur Sikri royal heritage complex",
                    "Local Mughlai food & Agra Petha"
                ]
            },
            {
                title: "Heritage & Craftsmanship",
                activities: [
                    "Itmad-ud-Daulah (Baby Taj) marble mausoleum",
                    "Kinari Bazaar marble inlay workshops",
                    "Rooftop dining with Taj Mahal view"
                ]
            }
        ],
        returnDay: {
            title: "Return to Delhi",
            activities: [
                "Morning Kinari Bazaar souvenir shopping",
                "Return to Delhi"
            ]
        }
    },
    "Kerala": {
        hub: "Kochi",
        transport: "Train / Flight",
        travelCost: 2500,
        hotelCostPerNight: 1400,
        foodCostPerDay: 600,
        day1: {
            title: "Journey to Kerala",
            activities: [
                "Train / Flight to Kochi / Alleppey",
                "Check-in to backwater resort / houseboat",
                "Stay at Kerala"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Alleppey backwaters houseboat cruise",
                    "Athirappilly Waterfalls",
                    "Traditional Kerala Sadhya & local food"
                ]
            },
            {
                title: "Tea Valleys & Culture",
                activities: [
                    "Munnar tea plantations & viewpoints",
                    "Kathakali cultural dance performance",
                    "Spice plantations & Ayurvedic wellness"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning backwater sunrise & spice market",
                "Return journey home"
            ]
        }
    },
    "Jaipur": {
        hub: "Delhi",
        transport: "Train / Bus",
        travelCost: 1800,
        hotelCostPerNight: 1200,
        foodCostPerDay: 500,
        day1: {
            title: "Delhi to Jaipur",
            activities: [
                "Express Train / Bus to Jaipur",
                "Check-in to heritage hotel",
                "Stay at Jaipur"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Amber Fort & Hawa Mahal",
                    "City Palace & Jantar Mantar",
                    "Dal Baati Churma & local Rajasthani food"
                ]
            },
            {
                title: "Astronomy & Hilltop Forts",
                activities: [
                    "Nahargarh Fort panoramic sunset view",
                    "Jal Mahal water palace viewpoint",
                    "Johari Bazaar gems & textile shopping"
                ]
            }
        ],
        returnDay: {
            title: "Return to Delhi",
            activities: [
                "Morning Pyaaz Kachori breakfast & shopping",
                "Return to Delhi"
            ]
        }
    },
    "Ooty": {
        hub: "Coimbatore",
        transport: "Train / Bus",
        travelCost: 1600,
        hotelCostPerNight: 1100,
        foodCostPerDay: 450,
        day1: {
            title: "Coimbatore to Ooty",
            activities: [
                "Nilgiri Mountain Toy Train to Ooty",
                "Check-in to hillside resort",
                "Stay at Ooty"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Botanical Garden & Doddabetta Peak",
                    "Pykara Waterfalls & Lake boating",
                    "Homemade chocolates & local food"
                ]
            },
            {
                title: "Peaks & Tea Plantations",
                activities: [
                    "Tea factory & tea tasting tour",
                    "Pine forest walking trail",
                    "Rose garden & lake cycling"
                ]
            }
        ],
        returnDay: {
            title: "Return to Coimbatore",
            activities: [
                "Morning tea plantation walk",
                "Return to Coimbatore"
            ]
        }
    },
    "Hampi": {
        hub: "Bangalore",
        transport: "Train / Bus",
        travelCost: 1800,
        hotelCostPerNight: 1000,
        foodCostPerDay: 450,
        day1: {
            title: "Journey to Hampi",
            activities: [
                "Train to Hospet / Bus to Hampi",
                "Check-in to riverside guesthouse",
                "Stay at Hampi"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Virupaksha Temple & stone chariot at Vittala",
                    "Coracle boat ride on Tungabhadra River",
                    "Karnataka thali & local food"
                ]
            },
            {
                title: "Royal Enclosure & Hills",
                activities: [
                    "Lotus Mahal & Elephant Stables",
                    "Matanga Hill sunrise / sunset viewpoint",
                    "Hemakuta Hill ancient boulder temples"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning sunrise at Hemakuta Hill",
                "Return journey home"
            ]
        }
    },
    "Mysuru": {
        hub: "Bangalore",
        transport: "Train / Bus",
        travelCost: 1400,
        hotelCostPerNight: 1000,
        foodCostPerDay: 450,
        day1: {
            title: "Bangalore to Mysuru",
            activities: [
                "Express Train / Bus to Mysuru",
                "Check-in to city hotel",
                "Stay at Mysuru"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Mysore Palace royal heritage tour",
                    "Brindavan Gardens & musical fountain",
                    "Mysore Masala Dosa & local sweets"
                ]
            },
            {
                title: "Hills & Heritage Markets",
                activities: [
                    "Chamundi Hills & Sri Chamundeshwari Temple",
                    "Devaraja Market sandalwood & silk shopping",
                    "Karanji Lake & bird sanctuary"
                ]
            }
        ],
        returnDay: {
            title: "Return to Bangalore",
            activities: [
                "Morning South Indian filter coffee & breakfast",
                "Return to Bangalore"
            ]
        }
    },
    "Munnar": {
        hub: "Kochi",
        transport: "Bus / Cab",
        travelCost: 2000,
        hotelCostPerNight: 1200,
        foodCostPerDay: 500,
        day1: {
            title: "Kochi to Munnar",
            activities: [
                "Scenic drive / Bus from Kochi to Munnar",
                "Check-in to tea estate resort",
                "Stay at Munnar"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Eravikulam National Park & Tea Museum",
                    "Attukad Waterfalls & Mattupetty Dam",
                    "Fresh Kerala meals & local food"
                ]
            },
            {
                title: "Top Station & Tea Gardens",
                activities: [
                    "Top Station panoramic Western Ghats view",
                    "Lockhart Gap & spice plantation walk",
                    "Echo Point boat ride"
                ]
            }
        ],
        returnDay: {
            title: "Return to Kochi",
            activities: [
                "Morning walk through tea plantations",
                "Return to Kochi"
            ]
        }
    },
    "Manali": {
        hub: "Delhi",
        transport: "Volvo Bus / Flight",
        travelCost: 3500,
        hotelCostPerNight: 1500,
        foodCostPerDay: 600,
        day1: {
            title: "Delhi to Manali",
            activities: [
                "Volvo Bus / Flight to Manali",
                "Check-in to mountain resort",
                "Stay at Manali"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Solang Valley snow & adventure activities",
                    "Jogini Waterfalls & Hadimba Temple",
                    "Hot momos, Thukpa & local Himachali food"
                ]
            },
            {
                title: "Rohtang & Old Manali",
                activities: [
                    "Rohtang Pass high altitude snow view",
                    "Vashisht hot sulphur springs",
                    "Old Manali riverside cafés & music"
                ]
            }
        ],
        returnDay: {
            title: "Return to Delhi",
            activities: [
                "Morning Mall Road handicraft shopping",
                "Return to Delhi"
            ]
        }
    },
    "Darjeeling": {
        hub: "Bagdogra",
        transport: "Toy Train / Jeep",
        travelCost: 2800,
        hotelCostPerNight: 1300,
        foodCostPerDay: 500,
        day1: {
            title: "Bagdogra to Darjeeling",
            activities: [
                "Toy Train / Hill Jeep to Darjeeling",
                "Check-in to colonial heritage hotel",
                "Stay at Darjeeling"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Tiger Hill sunrise over Kanchenjunga",
                    "Happy Valley Tea Gardens & Zoo",
                    "Darjeeling tea & local Tibetan food"
                ]
            },
            {
                title: "Zoo & Peace Pagoda",
                activities: [
                    "Padmaja Naidu Himalayan Zoo (Red Pandas)",
                    "Japanese Peace Pagoda & monastery",
                    "Chowrasta Mall Road evening walk"
                ]
            }
        ],
        returnDay: {
            title: "Return to Bagdogra",
            activities: [
                "Morning Himalayan sunrise view",
                "Return to Bagdogra"
            ]
        }
    },
    "Udaipur": {
        hub: "Transit",
        transport: "Train / Flight",
        travelCost: 2200,
        hotelCostPerNight: 1300,
        foodCostPerDay: 550,
        day1: {
            title: "Journey to Udaipur",
            activities: [
                "Train / Flight / Bus to Udaipur",
                "Check-in to lakeside hotel",
                "Stay at Udaipur"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "City Palace royal architecture tour",
                    "Lake Pichola scenic boat cruise",
                    "Rooftop dining with lake view & local food"
                ]
            },
            {
                title: "Gardens & Culture",
                activities: [
                    "Saheliyon Ki Bari historic marble fountains",
                    "Bagore Ki Haveli cultural folk dance",
                    "Hathipole silver & handicraft market"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning walk at Fateh Sagar Lake",
                "Return journey home"
            ]
        }
    },
    "Rishikesh": {
        hub: "Delhi",
        transport: "Train / Bus",
        travelCost: 1800,
        hotelCostPerNight: 1000,
        foodCostPerDay: 450,
        day1: {
            title: "Delhi to Rishikesh",
            activities: [
                "Train / Bus / Cab to Rishikesh",
                "Check-in to riverside camp / hotel",
                "Stay at Rishikesh"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "White water rafting on the Ganges",
                    "Neergarh Waterfalls nature trek",
                    "Triveni Ghat Ganga Aarti & local food"
                ]
            },
            {
                title: "Yoga & Beatles Ashram",
                activities: [
                    "Morning riverside yoga & meditation",
                    "Beatles Ashram graffiti & history",
                    "Lakshman Jhula & Ram Jhula walk"
                ]
            }
        ],
        returnDay: {
            title: "Return to Delhi",
            activities: [
                "Morning walk along riverbank",
                "Return to Delhi"
            ]
        }
    },
    "Mumbai": {
        hub: "Transit",
        transport: "Train / Flight",
        travelCost: 2500,
        hotelCostPerNight: 1800,
        foodCostPerDay: 700,
        day1: {
            title: "Arrival in Mumbai",
            activities: [
                "Train / Flight to Mumbai",
                "Check-in to South Mumbai hotel",
                "Stay at Mumbai"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Gateway of India & Elephanta Caves ferry",
                    "Marine Drive sunset & Queen's Necklace",
                    "Pav Bhaji, Vada Pav & coastal seafood"
                ]
            },
            {
                title: "Culture & Sea Link",
                activities: [
                    "Bandra-Worli Sea Link & Bandra cafés",
                    "Colaba Causeway & street shopping",
                    "Seafood dinner at famous coastal diner"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning Marine Drive stroll & shopping",
                "Return journey home"
            ]
        }
    },
    "Andaman Islands": {
        hub: "Port Blair",
        transport: "Flight",
        travelCost: 4500,
        hotelCostPerNight: 1800,
        foodCostPerDay: 700,
        day1: {
            title: "Arrival in Port Blair",
            activities: [
                "Flight to Port Blair",
                "Check-in to beachside resort",
                "Stay at Port Blair"
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Ferry to Havelock Island & Radhanagar Beach",
                    "Scuba diving & snorkeling at Elephant Beach",
                    "Fresh coastal seafood & local food"
                ]
            },
            {
                title: "Coral Reefs & History",
                activities: [
                    "Neil Island natural bridge & coral reef",
                    "Cellular Jail light & sound historical show",
                    "Water sports & sea turtle spotting"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning ocean sunrise & seashell shopping",
                "Return flight home"
            ]
        }
    }
};

// ── Fallback Generator for Custom / Dynamic Destinations ────
function getDestinationData(destName) {
    if (itineraryDB[destName]) {
        return itineraryDB[destName];
    }
    return {
        hub: "Transit Hub",
        transport: "Train / Bus",
        travelCost: 1500,
        hotelCostPerNight: 1000,
        foodCostPerDay: 400,
        day1: {
            title: "Journey to " + destName,
            activities: [
                "Train / Bus to " + destName,
                "Check-in to hotel & visit central sights",
                "Stay at " + destName
            ]
        },
        sightseeingPool: [
            {
                title: "Local Sightseeing",
                activities: [
                    "Popular landmarks & scenic viewpoints",
                    "Waterfalls & nature trails",
                    "Local food & regional specialties"
                ]
            },
            {
                title: "Culture & Sights",
                activities: [
                    "Historic heritage monuments",
                    "Traditional arts & craft market",
                    "Evening café & cultural cuisine"
                ]
            }
        ],
        returnDay: {
            title: "Return Journey",
            activities: [
                "Morning sightseeing & souvenir shopping",
                "Return journey home"
            ]
        }
    };
}

// ── Clean City Name Helper ────────────────────────────────────
function cleanCityName(name) {
    if (!name) return "Visakhapatnam";
    let cleaned = name.trim();
    if (cleaned.includes("(")) {
        cleaned = cleaned.split("(")[0].trim();
    }
    if (cleaned.includes("/")) {
        cleaned = cleaned.split("/")[0].trim();
    }
    return cleaned;
}

// ── Calculate Realistic Travel Route & Costs ─────────────────
function calculateRouteTravel(originRaw, destinationRaw, baseData) {
    const origin = cleanCityName(originRaw || "Visakhapatnam");
    const dest = cleanCityName(destinationRaw || "Araku Valley");

    const o = origin.toLowerCase();
    const d = dest.toLowerCase();

    // 1. Same city / local area
    if (o === d || (o.includes("vizag") && d.includes("vizag")) || (o.includes("mumbai") && d.includes("mumbai")) || (o.includes("delhi") && d.includes("delhi"))) {
        return {
            mode: "Local Metro / City Cab",
            cost: 500,
            desc: "Local transit within " + dest
        };
    }

    // City zones / clusters
    const cityZones = {
        // Coastal Andhra (Vizag hub)
        "araku valley": { zone: "ap_coastal", hub: "vizag", state: "AP" },
        "araku": { zone: "ap_coastal", hub: "vizag", state: "AP" },
        "visakhapatnam": { zone: "ap_coastal", hub: "vizag", state: "AP" },
        "vizag": { zone: "ap_coastal", hub: "vizag", state: "AP" },
        // Central/South Andhra & Telangana
        "vijayawada": { zone: "ap_central", hub: "vijayawada", state: "AP" },
        "tirupati": { zone: "ap_south", hub: "tirupati", state: "AP" },
        "hyderabad": { zone: "telangana", hub: "hyderabad", state: "TS" },
        // South Central & Hills
        "bangalore": { zone: "south_central", hub: "bangalore", state: "KA" },
        "bengaluru": { zone: "south_central", hub: "bangalore", state: "KA" },
        "coorg": { zone: "south_hills", hub: "bangalore", state: "KA" },
        "hampi": { zone: "south_central", hub: "bangalore", state: "KA" },
        "ooty": { zone: "south_hills", hub: "coimbatore", state: "TN" },
        "coimbatore": { zone: "tamil_nadu", hub: "coimbatore", state: "TN" },
        "chennai": { zone: "tamil_nadu", hub: "chennai", state: "TN" },
        "pondicherry": { zone: "tamil_nadu", hub: "chennai", state: "PY" },
        "kochi": { zone: "kerala", hub: "kochi", state: "KL" },
        "munnar": { zone: "kerala", hub: "kochi", state: "KL" },
        "alleppey": { zone: "kerala", hub: "kochi", state: "KL" },
        // West
        "mumbai": { zone: "west_coast", hub: "mumbai", state: "MH" },
        "pune": { zone: "west_interior", hub: "mumbai", state: "MH" },
        "goa": { zone: "west_coast", hub: "goa", state: "GA" },
        "ahmedabad": { zone: "gujarat", hub: "ahmedabad", state: "GJ" },
        "udaipur": { zone: "rajasthan", hub: "udaipur", state: "RJ" },
        "jaipur": { zone: "rajasthan", hub: "delhi", state: "RJ" },
        // North
        "delhi": { zone: "north_plains", hub: "delhi", state: "DL" },
        "agra": { zone: "north_plains", hub: "delhi", state: "UP" },
        "taj mahal": { zone: "north_plains", hub: "delhi", state: "UP" },
        "rishikesh": { zone: "north_hills", hub: "delhi", state: "UK" },
        "manali": { zone: "himalayas", hub: "delhi", state: "HP" },
        "varanasi": { zone: "north_plains", hub: "varanasi", state: "UP" },
        "lucknow": { zone: "north_plains", hub: "lucknow", state: "UP" },
        // East & NE
        "kolkata": { zone: "east", hub: "kolkata", state: "WB" },
        "bhubaneswar": { zone: "east", hub: "bhubaneswar", state: "OD" },
        "darjeeling": { zone: "ne_hills", hub: "kolkata", state: "WB" },
        "shillong": { zone: "ne_hills", hub: "guwahati", state: "ML" },
        // Special
        "leh ladakh": { zone: "ladakh", hub: "delhi", state: "LA" },
        "andaman islands": { zone: "island", hub: "port_blair", state: "AN" }
    };

    function getZone(cityName) {
        for (const [key, val] of Object.entries(cityZones)) {
            if (cityName.includes(key) || key.includes(cityName)) return val;
        }
        return { zone: "other", hub: "general", state: "IN" };
    }

    const oZ = getZone(o);
    const dZ = getZone(d);

    // Island Special (Andaman Islands)
    if (dZ.zone === "island" || oZ.zone === "island") {
        if (oZ.hub === "chennai" || oZ.hub === "kolkata" || oZ.hub === "vizag") {
            return {
                mode: "Direct Flight / Cruise Ship",
                cost: 7500,
                desc: "Direct flight or sea transit from " + origin
            };
        }
        return {
            mode: "Connecting Flight (via Chennai/Kolkata)",
            cost: 10500,
            desc: "Roundtrip connecting flights from " + origin
        };
    }

    // Leh Ladakh Special
    if (dZ.zone === "ladakh") {
        if (oZ.zone === "north_plains" || oZ.hub === "delhi") {
            return {
                mode: "Mountain Flight or Scenic Bus via Manali",
                cost: 6500,
                desc: "Flight or scenic Himalayan highway from " + origin
            };
        }
        return {
            mode: "Connecting Flight via Delhi",
            cost: 9500,
            desc: "Roundtrip connecting flight via Delhi from " + origin
        };
    }

    // Tier 1: Local / Primary Hub (e.g. Vizag to Araku, Delhi to Agra, Coimbatore to Ooty, Kochi to Munnar)
    if (oZ.hub === dZ.hub || (oZ.zone === dZ.zone && oZ.zone !== "other")) {
        const localCost = (baseData && baseData.travelCost) ? baseData.travelCost : 1500;
        return {
            mode: (baseData && baseData.transport) ? baseData.transport : "Scenic Train / AC Bus",
            cost: localCost,
            desc: "Local scenic rail / AC highway transit"
        };
    }

    // Tier 2: Neighboring State / Regional Connection (e.g. Hyderabad to Araku, Mumbai to Goa, Bangalore to Ooty, Delhi to Jaipur, Vijayawada to Vizag/Araku)
    const isNeighbor = (
        (oZ.state === "AP" && dZ.state === "TS") || (oZ.state === "TS" && dZ.state === "AP") ||
        (oZ.state === "AP" && dZ.state === "OD") || (oZ.state === "OD" && dZ.state === "AP") ||
        (oZ.state === "KA" && (dZ.state === "TN" || dZ.state === "KL" || dZ.state === "GA")) ||
        (oZ.state === "TN" && (dZ.state === "KA" || dZ.state === "KL" || dZ.state === "PY")) ||
        (oZ.state === "MH" && (dZ.state === "GA" || dZ.state === "GJ" || dZ.state === "RJ")) ||
        (oZ.state === "DL" && (dZ.state === "UP" || dZ.state === "RJ" || dZ.state === "UK" || dZ.state === "HP")) ||
        (oZ.state === "WB" && (dZ.state === "OD" || dZ.state === "ML"))
    );

    if (isNeighbor) {
        return {
            mode: "Superfast Express Train (3AC) / Sleeper AC Bus",
            cost: 2800,
            desc: "Direct Superfast Train or AC Sleeper Bus roundtrip"
        };
    }

    // Tier 3: Medium Distance (e.g. Hyderabad to Goa, Bangalore to Munnar, Delhi to Varanasi, Chennai to Vizag)
    const southStates = ["AP", "TS", "KA", "TN", "KL", "GA", "PY"];
    const northStates = ["DL", "UP", "RJ", "UK", "HP", "PB", "CH"];
    if ((southStates.includes(oZ.state) && southStates.includes(dZ.state)) ||
        (northStates.includes(oZ.state) && northStates.includes(dZ.state))) {
        return {
            mode: "Express Train (3AC) / Semi-Sleeper AC Bus",
            cost: 3600,
            desc: "Interstate Express Train (3AC) or Multi-Axle Volvo roundtrip"
        };
    }

    // Tier 4: Long Distance / Cross-Country (e.g. Delhi to Araku, Mumbai to Darjeeling, Bangalore to Manali, Kolkata to Goa)
    return {
        mode: "Superfast Train (3AC/2AC) or Economy Flight",
        cost: 5800,
        desc: "Roundtrip Cross-Country Train or Economy Flight with local connection"
    };
}

// ── Build Itinerary & Costs ──────────────────────────────────
function buildItinerary(destName, days, interest, originCity) {
    const data = getDestinationData(destName);
    const origin = cleanCityName(originCity || "Visakhapatnam");
    const routeInfo = calculateRouteTravel(originCity, destName, data);
    const dayPlans = [];

    // Day 1: Transit from Origin to Destination
    dayPlans.push({
        title: `${origin} to ${destName}`,
        activities: [
            `Depart from ${origin} by ${routeInfo.mode} to ${destName}`,
            `Scenic transit & arrival at ${destName}`,
            `Check-in to hotel / resort, freshen up & evening local sightseeing with regional dinner`
        ]
    });

    if (days === 1) {
        dayPlans[0] = {
            title: `Day Trip: ${origin} to ${destName}`,
            activities: [
                `Morning departure from ${origin} to ${destName}`,
                data.sightseeingPool[0].activities[0],
                `Evening return journey back to ${origin}`
            ]
        };
    } else if (days === 2) {
        dayPlans.push({
            title: `Local Sightseeing & Return to ${origin}`,
            activities: [
                data.sightseeingPool[0].activities[0],
                data.sightseeingPool[0].activities[1],
                `Evening return transit (${routeInfo.mode}) back to ${origin}`
            ]
        });
    } else {
        // Days 2 to N-1 (Supports any duration up to 90 days)
        const extendedThemes = [
            "Local Sightseeing & Highlights",
            "Waterfalls & Scenic Nature",
            "Hills & Valley Exploration",
            "Cultural Heritage & Temples",
            "Adventure Treks & Viewpoints",
            "Plantations & Countryside Tour",
            "Historic Landmarks & Museums",
            "Regional Food & Artisan Markets",
            "Lakes, Boating & Wildlife",
            "Hidden Gems & Village Walk",
            "Photography & Sunset Trails",
            "Leisure, Wellness & Local Shopping"
        ];

        for (let d = 2; d < days; d++) {
            const poolIndex = (d - 2) % data.sightseeingPool.length;
            const poolItem = data.sightseeingPool[poolIndex];
            const themeTitle = extendedThemes[(d - 2) % extendedThemes.length];
            const title = (d <= 3 && poolItem.title) ? poolItem.title : themeTitle;

            dayPlans.push({
                title: title,
                activities: poolItem.activities
            });
        }

        // Final Return Day
        dayPlans.push({
            title: `Return to ${origin}`,
            activities: [
                `Morning breakfast & local souvenir / handicraft shopping at ${destName}`,
                `Return journey (${routeInfo.mode}) from ${destName} back to ${origin}`,
                `Safe arrival back home in ${origin}`
            ]
        });
    }

    // Cost calculations
    const travelCost = Math.round(routeInfo.cost);
    const nights = Math.max(days - 1, (days === 1 ? 0 : 1));
    const hotelCost = Math.round(data.hotelCostPerNight * nights);
    const foodCost = Math.round(data.foodCostPerDay * days);
    const totalCost = travelCost + hotelCost + foodCost;

    return {
        data: data,
        origin: origin,
        routeInfo: routeInfo,
        dayPlans: dayPlans,
        costs: {
            travel: travelCost,
            hotel: hotelCost,
            food: foodCost,
            total: totalCost
        }
    };
}

function formatINR(val) {
    return "₹ " + Number(val).toLocaleString("en-IN");
}

// ── Populate destination dropdown ────────────────────────────
function populatePlannerDropdown() {
    const select = document.getElementById("planDestination");
    if (!select) return;

    const previousValue = select.value;
    select.innerHTML = '<option value="">Select a Destination</option>';

    const allNames = Array.from(new Set([
        ...destinations.map(d => d.name),
        ...Object.keys(itineraryDB)
    ]));

    allNames.forEach(function(name) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });

    if (previousValue && allNames.includes(previousValue)) {
        select.value = previousValue;
    } else if (allNames.includes("Araku Valley")) {
        select.value = "Araku Valley";
    }
}

// ── Generate Itinerary ───────────────────────────────────────
function generateItinerary() {
    const originInput = document.getElementById("planOrigin");
    const destSelect = document.getElementById("planDestination");
    const daysSelect = document.getElementById("planDays");
    const budgetInput = document.getElementById("planBudget");
    const output = document.getElementById("itineraryOutput");

    if (!destSelect || !output) return;

    if (!isLoggedIn()) {
        output.innerHTML = `
            <div class="planner-login-required">
                <div class="lock-icon">🔒</div>
                <h3>Login Required to Plan Your Trip</h3>
                <p>Please log in or create an account to view custom day-by-day itineraries, route transit fares, and save your travel plans.</p>
                <a href="/login.html" class="btn-login-to-plan">Sign In / Register to Plan</a>
            </div>
        `;
        return;
    }

    const originCity = (originInput && originInput.value.trim()) || "Visakhapatnam (Vizag)";
    const destination = destSelect.value || "Araku Valley";
    const days = parseInt(daysSelect.value) || 3;
    const budget = parseInt(budgetInput.value) || 0;
    const interest = document.getElementById("planInterest") ? document.getElementById("planInterest").value : "all";

    const itin = buildItinerary(destination, days, interest, originCity);
    const { dayPlans, costs } = itin;

    // Timeline nodes
    const timelineItems = dayPlans.map(function(day, index) {
        const bullets = day.activities.map(function(act) {
            return `<li>${act}</li>`;
        }).join("");

        return `
            <div class="tl-item">
                <div class="tl-dot"></div>
                <div class="tl-body">
                    <h4 class="tl-day-title">Day ${index + 1} – ${day.title}</h4>
                    <ul class="tl-acts">
                        ${bullets}
                    </ul>
                </div>
            </div>
        `;
    }).join("");

    const isWithinBudget = budget > 0 && costs.total <= budget;
    const isOverBudget = budget > 0 && costs.total > budget;

    let budgetBadgeHTML = "";
    if (isOverBudget) {
        budgetBadgeHTML = `<div class="budget-badge over">⚠️ Over Budget by ${formatINR(costs.total - budget)}</div>`;
    } else if (isWithinBudget) {
        budgetBadgeHTML = `<div class="budget-badge within">✅ Within Budget! Saving ${formatINR(budget - costs.total)}</div>`;
    }

    const savedList = getSavedItinerariesList();
    const isAlreadySaved = savedList.some(item => 
        item.destination === destination && 
        String(item.days) === String(days) && 
        (item.origin || "").toLowerCase() === itin.origin.toLowerCase() &&
        item.costs && item.costs.total === costs.total
    );

    output.innerHTML = `
        <div class="itin-container">
            <div class="itin-left">
                <h3 class="itin-header-title">Suggested Itinerary (${itin.origin} ➔ ${destination})</h3>
                <div class="timeline-wrap">
                    <div class="tl-vertical-line"></div>
                    ${timelineItems}
                </div>
            </div>

            <div class="itin-right">
                <div class="cost-card">
                    <h4 class="cost-card-title">Estimated Cost</h4>
                    <div class="cost-row">
                        <span>Travel</span>
                        <span class="cost-val">${formatINR(costs.travel)}</span>
                    </div>
                    <div class="travel-route-tag">🚆 ${itin.origin} ⇄ ${destination}</div>
                    <div class="travel-route-mode">${itin.routeInfo.mode}</div>

                    <div class="cost-row" style="margin-top: 12px;">
                        <span>Hotel</span>
                        <span class="cost-val">${formatINR(costs.hotel)}</span>
                    </div>
                    <div class="cost-row">
                        <span>Food</span>
                        <span class="cost-val">${formatINR(costs.food)}</span>
                    </div>
                    <div class="cost-divider"></div>
                    <div class="cost-total-row">
                        <span>Total</span>
                        <span class="total-val">${formatINR(costs.total)}</span>
                    </div>
                    ${budgetBadgeHTML}
                    <button type="button" id="btnSaveItin" class="btn-save-itin ${isAlreadySaved ? 'saved' : ''}" onclick="handleSaveCurrentItinerary('${destination.replace(/'/g, "\\'")}', ${days}, ${costs.travel}, ${costs.hotel}, ${costs.food}, ${costs.total}, '${itin.origin.replace(/'/g, "\\'")}')">
                        ${isAlreadySaved ? '❤️ Saved!' : '♡ Save Itinerary'}
                    </button>
                    <div id="saveMsg" class="save-msg"></div>
                </div>
            </div>
        </div>
    `;
}

// ── Save Current Itinerary ───────────────────────────────────
function handleSaveCurrentItinerary(dest, days, travel, hotel, food, total, origin) {
    if (!isLoggedIn()) {
        localStorage.setItem("pendingPlanDestination", dest);
        window.location.href = "/login.html";
        return;
    }
    const originInput = document.getElementById("planOrigin");
    const originCity = origin || (originInput && originInput.value.trim()) || "Visakhapatnam";
    const saved = getSavedItinerariesList();
    const exists = saved.some(item => 
        item.destination === dest && 
        String(item.days) === String(days) && 
        (item.origin || "").toLowerCase() === originCity.toLowerCase() &&
        item.costs && item.costs.total === total
    );

    const btn = document.getElementById("btnSaveItin");
    const msg = document.getElementById("saveMsg");

    if (exists) {
        if (msg) {
            msg.textContent = "ℹ️ This itinerary is already saved below!";
            msg.style.color = "#0284c7";
            setTimeout(() => { if (msg) msg.textContent = ""; }, 2500);
        }
        const savedSec = document.getElementById("savedSection");
        if (savedSec) savedSec.scrollIntoView({ behavior: "smooth" });
        return;
    }

    const interestSelect = document.getElementById("planInterest");
    const interest = interestSelect ? interestSelect.value : "all";
    const currentItin = buildItinerary(dest, days, interest, originCity);

    const entry = {
        id: "itin_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
        destination: dest,
        origin: currentItin.origin,
        days: days,
        costs: { travel, hotel, food, total },
        dayPlans: currentItin.dayPlans,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    };

    saved.push(entry);
    localStorage.setItem("savedItineraries", JSON.stringify(saved));
    localStorage.removeItem("hasDeletedAllSaved");

    if (btn) {
        btn.classList.add("saved");
        btn.innerHTML = "❤️ Saved!";
    }
    if (msg) {
        msg.textContent = "✅ Itinerary saved! View it in Saved Itineraries below.";
        msg.style.color = "#16a34a";
        setTimeout(() => { if (msg) msg.textContent = ""; }, 3000);
    }
    updateSavedCount();
    renderSavedItineraries();

    // Smoothly scroll to the visible Saved Itineraries section
    setTimeout(() => {
        const savedSec = document.getElementById("savedSection");
        if (savedSec) savedSec.scrollIntoView({ behavior: "smooth" });
    }, 350);
}

function normalizeSavedItem(item, idx) {
    if (!item) return null;
    const dest = item.destination || "Araku Valley";
    const days = parseInt(item.days) || 3;
    const origin = item.origin || "Visakhapatnam";
    const itin = buildItinerary(dest, days, "all", origin);

    const travelCost = (item.costs && item.costs.travel != null) ? item.costs.travel : itin.costs.travel;
    const hotelCost = (item.costs && item.costs.hotel != null) ? item.costs.hotel : itin.costs.hotel;
    const foodCost = (item.costs && item.costs.food != null) ? item.costs.food : itin.costs.food;
    const totalCost = (item.costs && item.costs.total != null) ? item.costs.total : (item.estimatedCost || itin.costs.total);

    const dayPlans = (item.dayPlans && item.dayPlans.length > 0) ? item.dayPlans : itin.dayPlans;

    // Assign a stable ID if missing
    const safeId = item.id ? String(item.id) : ("itin_" + dest.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + days + "_" + (idx || 0));

    return {
        id: safeId,
        destination: dest,
        origin: origin,
        days: days,
        costs: {
            travel: travelCost,
            hotel: hotelCost,
            food: foodCost,
            total: totalCost
        },
        dayPlans: dayPlans,
        date: item.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    };
}

function getSavedItinerariesList() {
    let raw = JSON.parse(localStorage.getItem("savedItineraries") || "[]");
    if (!Array.isArray(raw)) raw = [];

    // Pre-seed Araku Valley sample if empty so user immediately sees what they saved
    if (raw.length === 0 && localStorage.getItem("hasDeletedAllSaved") !== "true") {
        const defaultAraku = buildItinerary("Araku Valley", 3, "all", "Visakhapatnam");
        raw = [{
            id: "itin_araku_valley_3_0",
            destination: "Araku Valley",
            origin: "Visakhapatnam",
            days: 3,
            costs: defaultAraku.costs,
            dayPlans: defaultAraku.dayPlans,
            date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        }];
        localStorage.setItem("savedItineraries", JSON.stringify(raw));
        return raw;
    }

    let needsSave = false;
    const normalized = raw.map((item, idx) => {
        if (!item) return null;
        const norm = normalizeSavedItem(item, idx);
        if (!item.id || String(item.id) !== norm.id || !item.costs || !item.dayPlans || !item.origin) {
            needsSave = true;
        }
        return norm;
    }).filter(Boolean);

    if (needsSave) {
        localStorage.setItem("savedItineraries", JSON.stringify(normalized));
    }

    return normalized;
}

function updateSavedCount() {
    const saved = getSavedItinerariesList();
    const count = saved.length;
    const navEl = document.getElementById("navSavedCount");
    const secEl = document.getElementById("savedSectionCount");
    if (navEl) navEl.textContent = count;
    if (secEl) secEl.textContent = count;
}

function renderSavedItineraries() {
    const listEl = document.getElementById("savedItinerariesList");
    if (!listEl) return;

    if (!isLoggedIn()) {
        listEl.innerHTML = `
            <div class="saved-empty-state">
                <span class="empty-icon">🔒</span>
                <h3>Login to View Saved Itineraries</h3>
                <p>Sign in to your account to view your saved travel plans, daily activity schedules, and budget breakdowns.</p>
                <a href="/login.html" class="btn-plan-now">Login to View Plans</a>
            </div>
        `;
        const navEl = document.getElementById("navSavedCount");
        const secEl = document.getElementById("savedSectionCount");
        if (navEl) navEl.textContent = "0";
        if (secEl) secEl.textContent = "0";
        return;
    }

    const saved = getSavedItinerariesList();

    if (saved.length === 0) {
        listEl.innerHTML = `
            <div class="saved-empty-state">
                <span class="empty-icon">🗺️</span>
                <h3>No saved itineraries yet</h3>
                <p>Plan a trip using the planner above and click <strong>♡ Save Itinerary</strong> to keep your plans here.</p>
                <a href="#planner" class="btn-plan-now">Plan a Trip Now</a>
            </div>
        `;
        const navEl = document.getElementById("navSavedCount");
        const secEl = document.getElementById("savedSectionCount");
        if (navEl) navEl.textContent = "0";
        if (secEl) secEl.textContent = "0";
        return;
    }

    listEl.innerHTML = saved.map(item => {
        const daysTimelineHTML = (item.dayPlans || []).map((dp, idx) => {
            const acts = (dp.activities || []).map(a => `<li>${a}</li>`).join("");
            return `
                <div class="saved-tl-item">
                    <div class="saved-tl-dot"></div>
                    <div class="saved-tl-body">
                        <h4 class="saved-tl-day-title">Day ${idx + 1} – ${dp.title}</h4>
                        <ul class="saved-tl-acts">
                            ${acts}
                        </ul>
                    </div>
                </div>
            `;
        }).join("");

        return `
            <div class="saved-itinerary-card" id="saved-card-${item.id}">
                <div class="saved-card-top">
                    <div class="saved-card-heading">
                        <h3>📍 ${item.destination}</h3>
                        <span class="saved-origin-badge">from ${item.origin || 'Visakhapatnam'}</span>
                        <span class="saved-days-pill">${item.days} ${item.days > 1 ? 'Days' : 'Day'} Trip</span>
                    </div>
                    <span class="saved-date-tag">Saved on ${item.date}</span>
                </div>

                <div class="saved-costs-row">
                    <div class="saved-cost-chip">Travel: <strong>${formatINR(item.costs.travel)}</strong></div>
                    <div class="saved-cost-chip">Hotel: <strong>${formatINR(item.costs.hotel)}</strong></div>
                    <div class="saved-cost-chip">Food: <strong>${formatINR(item.costs.food)}</strong></div>
                    <div class="saved-cost-chip total-chip">Total Cost: <strong>${formatINR(item.costs.total)}</strong></div>
                </div>

                <div class="saved-plan-label">🗓️ Day-by-Day Itinerary Plan:</div>

                <div class="saved-full-timeline">
                    ${daysTimelineHTML}
                </div>

                <div class="saved-card-footer">
                    <button type="button" class="btn-load-itin" onclick="loadSavedItinerary('${item.destination.replace(/'/g, "\\'")}', ${item.days}, '${(item.origin || "Visakhapatnam").replace(/'/g, "\\'")}')">📋 View / Edit in Planner</button>
                    <button type="button" class="btn-del-itin" onclick="deleteSavedItinerary('${item.id}', '${item.destination.replace(/'/g, "\\'")}', ${item.days})">🗑️ Delete Itinerary</button>
                </div>
            </div>
        `;
    }).join("");
}

function deleteSavedItinerary(id, dest, days) {
    let saved = getSavedItinerariesList();
    const initialCount = saved.length;

    // 1. Primary deletion: Match by ID
    let updated = saved.filter(item => String(item.id) !== String(id));

    // 2. Fallback deletion: If ID did not match, match by destination and days
    if (updated.length === initialCount && dest != null && days != null) {
        const matchIndex = saved.findIndex(item => item.destination === dest && String(item.days) === String(days));
        if (matchIndex !== -1) {
            saved.splice(matchIndex, 1);
            updated = saved;
        }
    }

    localStorage.setItem("savedItineraries", JSON.stringify(updated));
    
    if (updated.length === 0) {
        localStorage.setItem("hasDeletedAllSaved", "true");
        const listEl = document.getElementById("savedItinerariesList");
        if (listEl) {
            listEl.innerHTML = `
                <div class="saved-empty-state">
                    <span class="empty-icon">🗺️</span>
                    <h3>No saved itineraries yet</h3>
                    <p>Plan a trip using the planner above and click <strong>♡ Save Itinerary</strong> to keep your plans here.</p>
                    <a href="#planner" class="btn-plan-now">Plan a Trip Now</a>
                </div>
            `;
        }
        const navEl = document.getElementById("navSavedCount");
        const secEl = document.getElementById("savedSectionCount");
        if (navEl) navEl.textContent = "0";
        if (secEl) secEl.textContent = "0";
    } else {
        updateSavedCount();
        renderSavedItineraries();
    }

    const destSelect = document.getElementById("planDestination");
    const daysInput = document.getElementById("planDays");
    if (destSelect && daysInput) {
        const btn = document.getElementById("btnSaveItin");
        const stillSaved = updated.some(item => item.destination === destSelect.value && String(item.days) === String(daysInput.value));
        if (btn && !stillSaved) {
            btn.classList.remove("saved");
            btn.innerHTML = "♡ Save Itinerary";
        }
    }
}

function loadSavedItinerary(destination, days, origin) {
    const originInput = document.getElementById("planOrigin");
    const destSelect = document.getElementById("planDestination");
    const daysInput = document.getElementById("planDays");
    if (originInput && origin) originInput.value = origin;
    if (destSelect) destSelect.value = destination;
    if (daysInput) daysInput.value = days;
    generateItinerary();
    document.getElementById("planner").scrollIntoView({ behavior: "smooth" });
}

function setPlannerDays(d) {
    const daysInput = document.getElementById("planDays");
    if (daysInput) {
        daysInput.value = d;
        generateItinerary();
    }
}

// ── Hotels & Restaurants Data (Matches Mockup) ───────────────
const hotelsData = [
    {
        id: "h1",
        name: "Hotel Taj Resorts",
        location: "Agra, Uttar Pradesh",
        rating: 4.5,
        reviews: 330,
        originalPrice: 2800,
        price: 2100,
        amenities: ["wifi", "ac", "breakfast"],
        tags: ["Free WiFi", "AC Rooms", "Breakfast Included"],
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80"
    },
    {
        id: "h2",
        name: "The Park Hotel",
        location: "Agra, Uttar Pradesh",
        rating: 4.2,
        reviews: 184,
        originalPrice: 2200,
        price: 1800,
        amenities: ["wifi", "ac"],
        tags: ["Free WiFi", "AC Rooms"],
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&q=80"
    },
    {
        id: "h3",
        name: "Hotel Grand Luxury",
        location: "Agra, Uttar Pradesh",
        rating: 4.7,
        reviews: 256,
        originalPrice: 3800,
        price: 3200,
        amenities: ["wifi", "ac", "breakfast"],
        tags: ["Free WiFi", "AC Rooms", "Breakfast Included"],
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&q=80"
    },
    {
        id: "h4",
        name: "Haritha Hill Resort Araku",
        location: "Araku Valley, Andhra Pradesh",
        rating: 4.6,
        reviews: 412,
        originalPrice: 2000,
        price: 1500,
        amenities: ["wifi", "ac", "breakfast"],
        tags: ["Hill View", "AC Rooms", "Breakfast Included"],
        image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=80"
    },
    {
        id: "h5",
        name: "Pawan Valley Resort",
        location: "Araku Valley, Andhra Pradesh",
        rating: 4.3,
        reviews: 195,
        originalPrice: 1600,
        price: 1200,
        amenities: ["wifi", "breakfast"],
        tags: ["Free WiFi", "Valley View", "Breakfast"],
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80"
    },
    {
        id: "h6",
        name: "Tribal Valley Eco Stay",
        location: "Araku Valley, Andhra Pradesh",
        rating: 4.1,
        reviews: 128,
        originalPrice: 1200,
        price: 950,
        amenities: ["breakfast"],
        tags: ["Eco Stay", "Bonfire", "Breakfast"],
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80"
    },
    {
        id: "h7",
        name: "Novotel Varun Beach",
        location: "Visakhapatnam, Andhra Pradesh",
        rating: 4.8,
        reviews: 520,
        originalPrice: 5500,
        price: 4200,
        amenities: ["wifi", "ac", "breakfast"],
        tags: ["Sea View", "Infinity Pool", "AC Rooms"],
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=80"
    },
    {
        id: "h8",
        name: "Dolphin Hotel",
        location: "Visakhapatnam, Andhra Pradesh",
        rating: 4.3,
        reviews: 280,
        originalPrice: 2400,
        price: 1900,
        amenities: ["wifi", "ac", "breakfast"],
        tags: ["City Center", "AC Rooms", "Breakfast"],
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80"
    },
    {
        id: "h9",
        name: "Goa Marriott Resort & Spa",
        location: "Goa, India",
        rating: 4.7,
        reviews: 480,
        originalPrice: 6500,
        price: 5200,
        amenities: ["wifi", "ac", "breakfast"],
        tags: ["Beachfront", "Spa & Pool", "AC Rooms"],
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80"
    },
    {
        id: "h10",
        name: "Calangute Beach Paradise",
        location: "Goa, India",
        rating: 4.4,
        reviews: 310,
        originalPrice: 2600,
        price: 1950,
        amenities: ["wifi", "ac"],
        tags: ["Near Beach", "AC Rooms", "Free WiFi"],
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&q=80"
    }
];

const restaurantsData = [
    {
        id: "r1",
        name: "Peshawri Mughlai Cuisine",
        location: "Agra, Uttar Pradesh",
        rating: 4.8,
        reviews: 420,
        originalPrice: 1800,
        price: 1400,
        features: ["ac", "family"],
        tags: ["Mughlai Specialties", "AC Dining", "Family Friendly"],
        unitLabel: "/ for two",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80"
    },
    {
        id: "r2",
        name: "Bamboo Chicken Hut Araku",
        location: "Araku Valley, Andhra Pradesh",
        rating: 4.7,
        reviews: 350,
        originalPrice: 650,
        price: 500,
        features: ["outdoor", "family"],
        tags: ["Tribal Bamboo Chicken", "Outdoor Seating", "Local Delicacies"],
        unitLabel: "/ for two",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"
    },
    {
        id: "r3",
        name: "Sea Inn Coastal Kitchen",
        location: "Visakhapatnam, Andhra Pradesh",
        rating: 4.6,
        reviews: 290,
        originalPrice: 950,
        price: 750,
        features: ["ac", "family"],
        tags: ["Fresh Andhra Seafood", "AC Rooms", "Royyala Vepudu"],
        unitLabel: "/ for two",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80"
    },
    {
        id: "r4",
        name: "Fisherman's Wharf",
        location: "Goa, India",
        rating: 4.6,
        reviews: 560,
        originalPrice: 1500,
        price: 1100,
        features: ["outdoor", "family"],
        tags: ["Goan Fish Curry", "Live Music", "Outdoor Seating"],
        unitLabel: "/ for two",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80"
    },
    {
        id: "r5",
        name: "Dasaprakash South Indian Diner",
        location: "Agra, Uttar Pradesh",
        rating: 4.5,
        reviews: 210,
        originalPrice: 750,
        price: 600,
        features: ["veg", "family", "ac"],
        tags: ["Pure Veg", "South Indian Thalis", "Family Friendly"],
        unitLabel: "/ for two",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80"
    },
    {
        id: "r6",
        name: "Araku Tribal Organic Café",
        location: "Araku Valley, Andhra Pradesh",
        rating: 4.4,
        reviews: 180,
        originalPrice: 500,
        price: 400,
        features: ["veg", "outdoor"],
        tags: ["Araku Filter Coffee", "Millet Snacks", "Outdoor Seating"],
        unitLabel: "/ for two",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80"
    }
];

let currentHRTab = "hotels";

function switchHRTab(tab) {
    currentHRTab = tab;
    const tabH = document.getElementById("tabHotels");
    const tabR = document.getElementById("tabRestaurants");
    const searchInput = document.getElementById("hrSearchInput");
    const groupTitle = document.getElementById("amenitiesGroupTitle");
    const checkWrap = document.getElementById("amenitiesCheckboxes");

    if (tab === "hotels") {
        if (tabH) tabH.classList.add("active");
        if (tabR) tabR.classList.remove("active");
        if (searchInput) searchInput.placeholder = "Search hotels in your destination...";
        if (groupTitle) groupTitle.textContent = "Amenities";
        if (checkWrap) {
            checkWrap.innerHTML = `
                <label class="hr-checkbox-label">
                    <input type="checkbox" name="hrAmenity" value="wifi" onchange="filterHREntries()">
                    <span>Free WiFi</span>
                </label>
                <label class="hr-checkbox-label">
                    <input type="checkbox" name="hrAmenity" value="ac" onchange="filterHREntries()">
                    <span>AC Rooms</span>
                </label>
                <label class="hr-checkbox-label">
                    <input type="checkbox" name="hrAmenity" value="breakfast" onchange="filterHREntries()">
                    <span>Breakfast Included</span>
                </label>
            `;
        }
    } else {
        if (tabR) tabR.classList.add("active");
        if (tabH) tabH.classList.remove("active");
        if (searchInput) searchInput.placeholder = "Search restaurants in your destination...";
        if (groupTitle) groupTitle.textContent = "Features";
        if (checkWrap) {
            checkWrap.innerHTML = `
                <label class="hr-checkbox-label">
                    <input type="checkbox" name="hrAmenity" value="veg" onchange="filterHREntries()">
                    <span>Pure Veg</span>
                </label>
                <label class="hr-checkbox-label">
                    <input type="checkbox" name="hrAmenity" value="outdoor" onchange="filterHREntries()">
                    <span>Outdoor Seating</span>
                </label>
                <label class="hr-checkbox-label">
                    <input type="checkbox" name="hrAmenity" value="family" onchange="filterHREntries()">
                    <span>Family Dining</span>
                </label>
            `;
        }
    }

    filterHREntries();
}

function filterHREntries() {
    const list = currentHRTab === "hotels" ? hotelsData : restaurantsData;
    const searchVal = (document.getElementById("hrSearchInput") ? document.getElementById("hrSearchInput").value : "").toLowerCase().trim();

    const priceChecks = Array.from(document.querySelectorAll("input[name='hrPrice']:checked")).map(c => c.value);
    const ratingChecks = Array.from(document.querySelectorAll("input[name='hrRating']:checked")).map(c => parseFloat(c.value));
    const amenityChecks = Array.from(document.querySelectorAll("input[name='hrAmenity']:checked")).map(c => c.value);

    const filtered = list.filter(item => {
        if (searchVal) {
            const matchName = item.name.toLowerCase().includes(searchVal);
            const matchLoc = item.location.toLowerCase().includes(searchVal);
            if (!matchName && !matchLoc) return false;
        }

        if (priceChecks.length > 0) {
            const p = item.price;
            const matchesPrice = priceChecks.some(range => {
                if (range === "under1000") return p < 1000;
                if (range === "1000-2000") return p >= 1000 && p <= 2000;
                if (range === "2000-5000") return p > 2000 && p <= 5000;
                if (range === "above5000") return p > 5000;
                return false;
            });
            if (!matchesPrice) return false;
        }

        if (ratingChecks.length > 0) {
            const minRating = Math.min(...ratingChecks);
            if (item.rating < minRating) return false;
        }

        if (amenityChecks.length > 0) {
            const itemTags = item.amenities || item.features || [];
            const hasAll = amenityChecks.every(chk => itemTags.includes(chk));
            if (!hasAll) return false;
        }

        return true;
    });

    renderHRCards(filtered, currentHRTab);
}

function renderHRCards(list, type) {
    const container = document.getElementById("hrCardsContainer");
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div style="background:white; padding:40px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
                <p style="font-size:16px; color:#64748b; margin:0;">No ${type} found matching your filters. Try clearing your search or filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(item => {
        const btnText = type === "hotels" ? "Book Now" : "Book Table";
        const unit = item.unitLabel || "/ night";
        return `
            <div class="hr-card">
                <img src="${item.image}" alt="${item.name}" class="hr-card-img" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80'">
                <div class="hr-card-info">
                    <h3 class="hr-card-title">${item.name}</h3>
                    <div class="hr-card-rating">
                        <span>⭐ ${item.rating}</span>
                        <span class="review-count">(${item.reviews} reviews)</span>
                    </div>
                    <div class="hr-card-location">
                        <span>📍</span>
                        <span>${item.location}</span>
                    </div>
                    <div class="hr-card-tags">
                        ${(item.tags || []).map(t => `<span class="hr-tag">${t}</span>`).join("")}
                    </div>
                </div>
                <div class="hr-card-action">
                    ${item.originalPrice ? `<span class="hr-price-original">₹${item.originalPrice.toLocaleString("en-IN")}</span>` : ""}
                    <span class="hr-price-current">₹${item.price.toLocaleString("en-IN")} <span class="hr-price-unit">${unit}</span></span>
                    <button type="button" class="btn-book" onclick="openBookingModal('${item.name.replace(/'/g, "\\'")}', '${item.location.replace(/'/g, "\\'")}', ${item.price}, '${type}')">${btnText}</button>
                </div>
            </div>
        `;
    }).join("");
}

// ── Booking Modal Functions ──────────────────────────────────
let currentBookingItem = null;

function openBookingModal(name, location, price, type) {
    if (!isLoggedIn()) {
        window.location.href = "/login.html";
        return;
    }
    currentBookingItem = { name, location, price, type };
    const modal = document.getElementById("bookingModal");
    const title = document.getElementById("modalTitle");
    const sub = document.getElementById("modalSubtitle");
    const success = document.getElementById("modalSuccessMsg");

    if (modal) {
        modal.style.display = "flex";
        if (title) title.textContent = type === "hotels" ? `Book Stay: ${name}` : `Reserve Table: ${name}`;
        if (sub) sub.textContent = `📍 ${location} • ₹${price.toLocaleString("en-IN")} ${type === "hotels" ? '/ night' : '/ for two'}`;
        if (success) success.textContent = "";
        const dateInput = document.getElementById("bookDate");
        if (dateInput && !dateInput.value) {
            dateInput.valueAsDate = new Date();
        }
    }
}

function closeBookingModal() {
    const modal = document.getElementById("bookingModal");
    if (modal) modal.style.display = "none";
}

function handleBookingSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("bookName").value.trim();
    const phone = document.getElementById("bookPhone").value.trim();
    const date = document.getElementById("bookDate").value;
    const guests = document.getElementById("bookGuests").value;
    const msg = document.getElementById("modalSuccessMsg");

    if (msg) {
        msg.textContent = `🎉 Booking Confirmed for ${name}! Date: ${date} (${guests}). Confirmation sent to ${phone}.`;
        msg.style.color = "#16a34a";
    }

    setTimeout(() => {
        closeBookingModal();
        alert(`Booking Confirmed for ${currentBookingItem ? currentBookingItem.name : 'your destination'}!\nThank you, ${name}.`);
    }, 1500);
}

// Live update on planner input changes
const originInputEl = document.getElementById("planOrigin");
if (originInputEl) {
    originInputEl.addEventListener("input", generateItinerary);
    originInputEl.addEventListener("change", generateItinerary);
}
["planDestination", "planInterest"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", generateItinerary);
});
const daysInputEl = document.getElementById("planDays");
if (daysInputEl) {
    daysInputEl.addEventListener("input", generateItinerary);
    daysInputEl.addEventListener("change", generateItinerary);
}
const budgetInput = document.getElementById("planBudget");
if (budgetInput) {
    budgetInput.addEventListener("input", generateItinerary);
}
const hrSearchInput = document.getElementById("hrSearchInput");
if (hrSearchInput) {
    hrSearchInput.addEventListener("input", filterHREntries);
}

// Expose globally for inline HTML event handlers
window.switchHRTab = switchHRTab;
window.filterHREntries = filterHREntries;
window.setPlannerDays = setPlannerDays;
window.deleteSavedItinerary = deleteSavedItinerary;
window.loadSavedItinerary = loadSavedItinerary;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.handleBookingSubmit = handleBookingSubmit;
window.generateItinerary = generateItinerary;
window.handleSaveCurrentItinerary = handleSaveCurrentItinerary;
window.isLoggedIn = isLoggedIn;
window.handlePlannerSubmit = handlePlannerSubmit;
window.handleNavPlanTrip = handleNavPlanTrip;
window.handleNavSavedItin = handleNavSavedItin;

// Auto-resume pending plan after login
(function checkPendingPlan() {
    if (isLoggedIn()) {
        const pending = localStorage.getItem("pendingPlanDestination");
        if (pending) {
            localStorage.removeItem("pendingPlanDestination");
            const select = document.getElementById("planDestination");
            if (select) {
                select.value = pending;
            }
            setTimeout(() => {
                const plannerSec = document.getElementById("planner");
                if (plannerSec) plannerSec.scrollIntoView({ behavior: "smooth" });
                generateItinerary();
            }, 300);
        }
    }
})();

// Run initial dropdown population, count update, hotel rendering, and auto-render
populatePlannerDropdown();
updateSavedCount();
renderSavedItineraries();
filterHREntries();
generateItinerary();


document.getElementById("addDestinationForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("newName").value.trim();
    const location = document.getElementById("newLocation").value.trim();
    const description = document.getElementById("newDescription").value.trim();
    const message = document.getElementById("addDestinationMessage");

    try {
        const response = await fetch("/api/destinations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                name: name,
                location: location,
                description: description
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Could not save destination.";
            return;
        }

        const savedDestination = data.destination;

        const alreadyExists = destinations.some(function(item) {
            return item.name.toLowerCase() === savedDestination.name.toLowerCase();
        });

        if (!alreadyExists) {
            destinations.push({
                ...savedDestination,
                description: "Explore this beautiful destination."
            });
        }

        displayDestinations(destinations);
        populatePlannerDropdown();

        document.getElementById("search").value = "";
        this.reset();

        message.textContent = "Destination saved and displayed successfully!";

    } catch (error) {
        message.textContent = "Error. Check that your server is running.";
        console.error(error);
    }
});

