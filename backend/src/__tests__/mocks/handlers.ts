import { http, HttpResponse, passthrough } from "msw";

export const handlers = [
  http.all("http://127.0.0.1*", () => passthrough()),
  http.get("https://api.weatherapi.com/v1/current.json", ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get("q");
    const key = url.searchParams.get("key");

    if (!city || !key) {
      return HttpResponse.error();
    }

    return HttpResponse.json({
      current: {
        temp_c: 20,
        humidity: 50,
        condition: {
          text: "Sunny",
        },
      },
    });
  }),
];
