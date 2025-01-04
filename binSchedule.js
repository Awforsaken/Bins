document.addEventListener("DOMContentLoaded", function () {
    const wasteTypes = {
        grey: { label: "General Waste", color: "grey", icon: "🗑️", dates: [] },
        blue: { label: "Glass & Cans", color: "blue", icon: "♻️", dates: [] },
        green: { label: "Paper & Cardboard", color: "green", icon: "📄", dates: [] },
        brown: { label: "Garden Waste", color: "brown", icon: "🌿", dates: [] }
    };

    const availableColors = {
        grey: "#54656F",
        green: "#18B26A",
        blue: "#0089D1",
        brown: "#985D35"
    };

    let currentCalendarIndex = 0;
    let calendarArray = [];

    function getPropertyIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id") || "608641";
    }

    function parseDate(dayStr, monthYearStr) {
        // Remove day name if present and trim
        let day = dayStr.replace(/^[A-Za-z]+\s+/, '').trim();
        
        // Remove ordinal indicators (st, nd, rd, th)
        day = day.replace(/(st|nd|rd|th)/, '');
        
        // Split month year into parts
        const [month, year] = monthYearStr.split(' ');
        
        // Create date string in a format JS can parse
        const dateStr = `${day} ${month} ${year}`;
        return new Date(dateStr);
    }

    async function fetchBinData(propertyId) {
        try {
            const response = await fetch(`https://www.bury.gov.uk/app-services/getPropertyById?id=${propertyId}`);
            const data = await response.json();

            if (data.error) {
                console.error("Error fetching bin data:", data.error);
                return;
            }

            // Process calendar data
            calendarArray = data.response.calendar.flatMap(month => 
                month.dates.map(entry => ({
                    ...entry,
                    fullDate: parseDate(entry.date, month.date),
                    bins: entry.bins
                }))
            );

            // Sort by date
            calendarArray.sort((a, b) => a.fullDate - b.fullDate);

            // Set initial index to first future date
            const now = new Date();
            currentCalendarIndex = calendarArray.findIndex(entry => entry.fullDate > now);
            if (currentCalendarIndex === -1) currentCalendarIndex = 0;

            updateDisplay();
        } catch (error) {
            console.error("Failed to fetch bin data:", error);
        }
    }

    function findNextCollectionDates() {
        const currentEntry = calendarArray[currentCalendarIndex];
        
        if (!currentEntry) return [{ type: "none", date: null }];

        const collections = currentEntry.bins
            .filter(binType => wasteTypes[binType])
            .map(binType => ({
                type: binType,
                date: currentEntry.fullDate,
                config: wasteTypes[binType]
            }));

        return collections.length > 0 ? collections : [{ type: "none", date: null }];
    }

    function updateDisplay() {
        const nextCollections = findNextCollectionDates();
        const dateTitleElement = document.getElementById("date-title");
        const block1 = document.getElementById("waste-block-1");
        const block2 = document.getElementById("waste-block-2");

        if (nextCollections[0].type === "none") {
            dateTitleElement.textContent = "No upcoming collections";
            return;
        }

        const currentEntry = calendarArray[currentCalendarIndex];
        const dateObj = currentEntry.fullDate;
        const today = new Date();
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const daysDifference = Math.ceil((dateObj - today) / millisecondsPerDay);

        const formattedDate = dateObj.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        let dateTitle = formattedDate;
        if (daysDifference === 0) {
            dateTitle += " (today)";
        } else if (daysDifference === 1) {
            dateTitle += " (tomorrow)";
        } else if (daysDifference > 1) {
            dateTitle += ` (in ${daysDifference} days)`;
        }

        dateTitleElement.textContent = dateTitle;

        // Reset block styles
        block1.className = "waste-block";
        block2.className = "waste-block";

        if (nextCollections.length === 1) {
            const collection = nextCollections[0];
            block1.className = `waste-block bg-${collection.config.color} full`;
            block1.innerHTML = `<div>${collection.config.icon}</div> ${collection.config.label}`;
            block2.style.display = "none";
        } else if (nextCollections.length > 1) {
            const type1 = nextCollections[0].config;
            const type2 = nextCollections[1].config;

            block1.className = `waste-block bg-${type1.color} half`;
            block1.innerHTML = `<div>${type1.icon}</div> ${type1.label}`;

            block2.className = `waste-block bg-${type2.color} half`;
            block2.innerHTML = `<div>${type2.icon}</div> ${type2.label}`;
            block2.style.display = "flex";
        }
    }

    // Event Listeners
    document.getElementById("current").addEventListener("click", function () {
        const now = new Date();
        currentCalendarIndex = calendarArray.findIndex(entry => entry.fullDate > now);
        if (currentCalendarIndex === -1) currentCalendarIndex = 0;
        updateDisplay();
    });

    document.getElementById("next-week").addEventListener("click", function () {
        if (currentCalendarIndex < calendarArray.length - 1) {
            currentCalendarIndex++;
            updateDisplay();
        }
    });

    document.getElementById("prev-week").addEventListener("click", function () {
        if (currentCalendarIndex > 0) {
            currentCalendarIndex--;
            updateDisplay();
        }
    });

    // Initialize
    const propertyId = getPropertyIdFromUrl();
    fetchBinData(propertyId);
});