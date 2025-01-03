document.addEventListener("DOMContentLoaded", function () {
    // Define waste types and their default properties
    const wasteTypes = {
      general: {
        label: "General Waste",
        color: "grey",
        icon: "🗑️",
        dates: [
          "2024-12-10", "2024-12-31", "2025-01-21", "2025-02-11", 
          "2025-03-04", "2025-03-25", "2025-04-15", "2025-05-06", "2025-05-27"
        ]
      },
      recyclables: {
        label: "Glass & Cans",
        color: "blue",
        icon: "♻️",
        dates: [
          "2024-12-03", "2024-12-23", "2025-01-14", "2025-02-04", 
          "2025-02-25", "2025-03-18", "2025-04-08", "2025-04-29", "2025-05-20"
        ]
      },
      paper: {
        label: "Paper & Cardboard",
        color: "green",
        icon: "📄",
        dates: [
          "2024-12-17", "2025-01-07", "2025-01-28", "2025-02-18", 
          "2025-03-11", "2025-04-01", "2025-04-22", "2025-05-13"
        ]
      },
      garden: {
        label: "Garden Waste",
        color: "brown",
        icon: "🌿",
        dates: [
          "2024-12-03", "2024-12-17", "2025-01-14", "2025-01-28", 
          "2025-02-11", "2025-02-25", "2025-03-11", "2025-04-22", "2025-05-06", "2025-05-20"
        ]
      }
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
  
    function updateWasteTypeColor(type, newColor) {
      if (wasteTypes[type] && availableColors[newColor]) {
        wasteTypes[type].color = newColor;
        updateDisplay(weekIndex);
      }
    }
  
    function addWasteType(typeId, config) {
      if (!wasteTypes[typeId]) {
        wasteTypes[typeId] = {
          label: config.label,
          color: config.color,
          icon: config.icon || "🗑️",
          dates: config.dates || []
        };
        updateDisplay(weekIndex);
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
  
    updateDisplay(weekIndex);
  
    window.wasteManager = {
      updateWasteTypeColor,
      addWasteType,
      availableColors,
      wasteTypes
    };
  });
  