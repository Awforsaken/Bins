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
      brown: "#985D35",
      red: "#EE3F22",
      yellow: "#FD8812",
      teal: "#00A9A4",
      pink: "#ED008C"
  };

  let weekIndex = 0;

  async function fetchBinData(propertyId) {
    try {
        const response = await fetch(`https://www.bury.gov.uk/app-services/getPropertyById?id=${propertyId}`);
        const data = await response.json();

        if (data.error) {
            console.error("Error fetching bin data:", data.error);
            return;
        }

        const bins = data.response.bins;
        const calendar = data.response.calendar;

        // Populate wasteTypes with fetched data
        Object.entries(bins).forEach(([type, bin]) => {
            if (wasteTypes[type]) {
                wasteTypes[type].dates = calendar
                    .flatMap(month => month.dates.map(day => ({
                        date: day.date,
                        monthName: month.date.split(" ")[1], // Extract the month name from the calendar
                        bins: day.bins
                    })))
                    .filter(day => day.bins.includes(type))
                    .map(day => new Date(`${day.date}, ${day.monthName}`)) // Create proper Date objects
                    .map(date => date.toISOString().split("T")[0]); // Format as "YYYY-MM-DD"
            }
        });

        updateDisplay(weekIndex);
    } catch (error) {
        console.error("Failed to fetch bin data:", error);
    }
}


  function findNextCollectionDates(baseDate) {
      const referenceDate = typeof baseDate === "string" ? new Date(baseDate) : baseDate;

      const nextCollections = Object.entries(wasteTypes)
          .map(([type, config]) => {
              const nextDate = config.dates.find(dateStr => new Date(dateStr) >= referenceDate);
              return nextDate ? { type, date: nextDate, config } : null;
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (nextCollections.length > 1) {
          const earliestDate = nextCollections[0].date;
          return nextCollections.filter(collection => collection.date === earliestDate);
      }

      return nextCollections.length > 0
          ? nextCollections
          : [{ type: "none", date: null }];
  }

  function updateDisplay(dateOffset) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dateOffset * 7);

      const todayStr = new Date().toISOString().split("T")[0];
      const baseDateStr = baseDate.toISOString().split("T")[0];

      const nextCollections = findNextCollectionDates(baseDate);

      const dateTitleElement = document.getElementById("date-title");
      const block1 = document.getElementById("waste-block-1");
      const block2 = document.getElementById("waste-block-2");

      if (nextCollections[0].date === null) {
          dateTitleElement.textContent = "No upcoming collections";
          return;
      }

      const targetDate = nextCollections[0].date;
      const dateObj = new Date(targetDate);

      const today = new Date();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const daysDifference = Math.ceil((dateObj.getTime() - today.getTime()) / millisecondsPerDay);

      const isToday = targetDate === todayStr;
      const formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long"
      });

      let dateTitle = formattedDate;
      if (isToday) {
          dateTitle += " (today)";
      } else if (daysDifference === 1) {
          dateTitle += " (tomorrow)";
      } else if (daysDifference > 1) {
          dateTitle += ` (in ${daysDifference} days)`;
      }

      dateTitleElement.textContent = dateTitle;

      block1.className = "waste-block";
      block2.className = "waste-block";

      if (nextCollections.length === 1) {
          const collection = nextCollections[0];
          const typeConfig = collection.config;
          block1.className = `waste-block bg-${typeConfig.color} full`;
          block1.innerHTML = `<div>${typeConfig.icon}</div> ${typeConfig.label}`;
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

  document.getElementById("current").addEventListener("click", function () {
      weekIndex = 0;
      updateDisplay(weekIndex);
  });

  document.getElementById("next-week").addEventListener("click", function () {
      weekIndex++;
      updateDisplay(weekIndex);
  });

  document.getElementById("prev-week").addEventListener("click", function () {
      weekIndex--;
      updateDisplay(weekIndex);
  });

  // Fetch data initially
  fetchBinData(608641);
});
