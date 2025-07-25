document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = window.API_CONFIG.API_URL;

  const weatherCheckForm = document.getElementById("weatherCheckForm");
  const weatherResult = document.getElementById("weather-result");
  const feedback = document.getElementById("feedback");
  
  weatherCheckForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = weatherCheckForm.querySelector(".submit-btn");
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Getting Weather...";

    const city = document.getElementById("weather-city").value;
    weatherResult.classList.add("hidden");

    try {
      const response = await fetch(`${API_BASE_URL}/api/weather?city=${city}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not fetch weather data.");
      }
      displayWeather({ ...data, city });
    } catch (error) {
      showFeedback(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  function displayWeather(data) {
    const { temperature, description, humidity, city } = data;
    weatherResult.innerHTML = `
			<h3>Weather in ${city}</h3>
			<p><strong>Temperature:</strong> ${temperature}°C</p>
			<p><strong>Condition:</strong> ${description}</p>
			<p><strong>Humidity:</strong> ${humidity}%</p>
		`;
    weatherResult.classList.remove("hidden");
  }

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove("hidden");

    setTimeout(() => {
      feedback.classList.add("hidden");
    }, 5000);
  }
});
