export const EVENTS = [
    {
        id: 1,
        title: "MUBAS Costume Party",
        date: "Coming this Weekend",
        description: "The biggest costume event of the semester. Bring your best outfit!",
        image: "https://images.unsplash.com/photo-1545128485-c400e77d2758?q=80&w=1000&auto=format&fit=crop",
        location: "MUBAS Sports Complex",
        stallTypes: [
            { id: 'drinks', name: 'Drinks & Beverages', dailyPrice: 5000, weeklyPrice: 20000 },
            { id: 'food', name: 'Food & Snacks', dailyPrice: 6000, weeklyPrice: 25000 },
            { id: 'cocktails', name: 'Cocktails & Mixes', dailyPrice: 8000, weeklyPrice: 35000 },
        ]
    },
    {
        id: 2,
        title: "Open Air Festival",
        date: "Next Weekend",
        description: "Live music, fresh air, and good vibes under the stars.",
        image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop",
        location: "Open Air Grounds",
        stallTypes: [
            { id: 'drinks', name: 'Drinks & Beverages', dailyPrice: 5000, weeklyPrice: 20000 },
            { id: 'food', name: 'Food & Snacks', dailyPrice: 7000, weeklyPrice: 30000 },
        ]
    },
    {
        id: 3,
        title: "Talent Show Showcase",
        date: "End of Month",
        description: "Witness the amazing talents of MUBAS students in music, dance, and more.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
        location: "Great Hall",
        stallTypes: [
            { id: 'snacks', name: 'Light Snacks & Drinks', dailyPrice: 4000, weeklyPrice: 15000 },
        ]
    }
];
