document.addEventListener("DOMContentLoaded", function () {
    console.log("Script initiated: Checking for property ID in the URL.");
  
    const modal = document.getElementById("error-modal");
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const postcodeInput = document.getElementById("postcode-input");
    const fetchAddressesButton = document.getElementById("fetch-addresses");
    const postcodeError = document.getElementById("postcode-error");
    const addressSelection = document.getElementById("address-selection");
    const applyAddressButton = document.getElementById("apply-address");
    const cancelModalButton = document.getElementById("cancel-modal");
    const editAddressButton = document.getElementById("edit-address");
  
    // Function to show modal
    function showModal(message, allowCancel) {
      step1.style.display = "flex";
      step2.style.display = "none";
      postcodeInput.value = ""; // Reset input
      postcodeError.textContent = message || "";
      modal.classList.add("show");
      cancelModalButton.style.display = allowCancel ? "block" : "none";
      console.log("Modal displayed. Cancel allowed:", allowCancel);
    }
  
    // Function to hide modal
    function hideModal() {
      modal.classList.remove("show");
      console.log("Modal hidden.");
    }
  
    // Function to toggle the "Edit Address" button
    function toggleEditButton(show) {
      editAddressButton.style.display = show ? "flex" : "none";
      console.log("Edit Address button", show ? "shown" : "hidden");
    }
  
    // Event listener for close button
    cancelModalButton.addEventListener("click", hideModal);
  
    // Event listener for Edit Address button
    editAddressButton.addEventListener("click", function () {
      showModal("Edit your address or select a new one.", true);
    });
  
    // Fetch addresses for the given postcode
    fetchAddressesButton.addEventListener("click", function () {
      const postcode = postcodeInput.value.trim();
      if (!postcode) {
        postcodeError.textContent = "Please enter a valid postcode.";
        return;
      }
  
      const apiUrl = `https://www.bury.gov.uk/app-services/getProperties?postcode=${postcode}`;
      console.log("Fetching addresses with URL:", apiUrl);
  
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch addresses");
          }
          return response.json();
        })
        .then((data) => {
          if (data.error || !data.response || data.response.length === 0) {
            postcodeError.textContent = "No addresses found for this postcode.";
            return;
          }
  
          console.log("Addresses fetched:", data.response);
          populateAddressSelection(data.response);
          step1.style.display = "none";
          step2.style.display = "flex";
        })
        .catch((error) => {
          console.error("Error fetching addresses:", error);
          postcodeError.textContent = "An error occurred while fetching addresses.";
        });
    });
  
    // Populate address selection form
    function populateAddressSelection(addresses) {
      addressSelection.innerHTML = ""; // Clear previous options
      addresses.forEach((address) => {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "address";
        radio.value = address.id;
        radio.id = `address-${address.id}`;
  
        const label = document.createElement("label");
        label.htmlFor = `address-${address.id}`;
        label.textContent = `${address.addressLine1}, ${address.city}, ${address.postcode}`;
  
        const wrapper = document.createElement("div");
        wrapper.appendChild(radio);
        wrapper.appendChild(label);
  
        addressSelection.appendChild(wrapper);
      });
    }
  
    // Apply selected address
    applyAddressButton.addEventListener("click", function () {
      const selectedAddress = document.querySelector('input[name="address"]:checked');
      if (!selectedAddress) {
        alert("Please select an address.");
        return;
      }
  
      const id = selectedAddress.value;
      console.log("Selected ID:", id);
  
      // Update URL and re-run the code
      const newUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
      window.history.replaceState(null, "", newUrl);
      hideModal();
  
      // Trigger the previously written logic
      console.log("Re-triggering code with updated ID.");
      toggleEditButton(true); // Show "Edit Address" button
    });
  
    // Initial check for ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
      showModal("No valid property ID found in the URL.", false); // Don't allow cancel
      toggleEditButton(false); // Hide "Edit Address" button
    } else {
      console.log("Valid ID found in URL:", id);
      toggleEditButton(true); // Show "Edit Address" button
      // Proceed with the previous logic for valid ID...
    }
  });
  