import { env } from "@/config";
import { WeatherData } from "../weather";

export function confirmEmailTemplate(
  city: string,
  confirmToken: string
): string {
  return `
    <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #3498db;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          .welcome-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
            color: #3498db;
          }
          .button { 
            display: inline-block; 
            background: #3498db; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
            transition: background-color 0.3s;
          }
          .button:hover {
            background: #2980b9;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #7f8c8d;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .city-name {
            color: #3498db;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="welcome-icon">🌤️</div>
          <h1>Welcome to Weather Updates!</h1>
          <p>Hello there,</p>
          <p>We're excited to have you join our weather update service for <span class="city-name">${city}</span>! 🎉</p>
          <p>To start receiving your personalized weather updates, please confirm your subscription by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${env.API_URL}/confirm/${confirmToken}" class="button">Confirm My Subscription</a>
          </p>
          <p style="color: #7f8c8d; font-size: 14px;">If you didn't request this subscription, you can safely ignore this email.</p>
          <div class="footer">
            <p>Weather Forecast API Service</p>
            <p>Stay informed, stay prepared!</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function weatherUpdateTemplate(
  city: string,
  weatherData: WeatherData,
  unsubscribeToken: string
): string {
  return `
    <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #3498db;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          .weather-box { 
            background: #f8f9fa; 
            border-radius: 12px; 
            padding: 25px; 
            margin: 25px 0;
            border: 1px solid #e9ecef;
          }
          .weather-property { 
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .weather-icon {
            font-size: 24px;
            width: 40px;
            text-align: center;
          }
          .weather-value { 
            font-weight: bold;
            color: #3498db;
            font-size: 18px;
          }
          .unsubscribe { 
            margin-top: 30px; 
            font-size: 13px;
            color: #7f8c8d;
            text-align: center;
          }
          .unsubscribe a {
            color: #3498db;
            text-decoration: none;
          }
          .unsubscribe a:hover {
            text-decoration: underline;
          }
          .footer { 
            margin-top: 30px; 
            font-size: 12px; 
            color: #7f8c8d;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .city-name {
            color: #3498db;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Your Weather Update</h1>
          <p>Hello there,</p>
          <p>Here's your latest weather update for <span class="city-name">${city}</span>:</p>
          
          <div class="weather-box">
            <div class="weather-property">
              <span class="weather-icon">🌡️</span>
              <span>Temperature:</span>
              <span class="weather-value">${weatherData.temperature}°C</span>
            </div>
            <div class="weather-property">
              <span class="weather-icon">💧</span>
              <span>Humidity:</span>
              <span class="weather-value">${weatherData.humidity}%</span>
            </div>
            <div class="weather-property">
              <span class="weather-icon">☁️</span>
              <span>Conditions:</span>
              <span class="weather-value">${weatherData.description}</span>
            </div>
          </div>
          
          <p class="unsubscribe">
            Not interested in weather updates anymore? 
            <a href="${env.API_URL}/unsubscribe/${unsubscribeToken}">Unsubscribe here</a>
          </p>
          
          <div class="footer">
            <p>Weather Forecast API Service</p>
            <p>Stay informed, stay prepared!</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
