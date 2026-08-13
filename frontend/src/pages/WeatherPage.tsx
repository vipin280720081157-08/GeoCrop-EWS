import React from "react";
import { CloudRain, Thermometer, Droplets, Wind, Cloud, RefreshCw, Info, SunMedium } from "lucide-react";
import Card from "@/components/Card";
import SectionTitle from "@/components/SectionTitle";
import Skeleton from "@/components/Skeleton";
import { useGeoCrop } from "@/context/AppContext";

export default function WeatherPage() {
  const { weather, weatherLoading, refreshWeather } = useGeoCrop();

  const forecastDays = [
    { day: "MON", tempHigh: "29°", tempLow: "23°", condition: "☀ Sunny" },
    { day: "TUE", tempHigh: "30°", tempLow: "24°", condition: "🌧 Moderate Rain" },
    { day: "WED", tempHigh: "28°", tempLow: "23°", condition: "🌦 Light Shower" },
    { day: "THU", tempHigh: "27°", tempLow: "22°", condition: "🌧 Rain" },
    { day: "FRI", tempHigh: "29°", tempLow: "23°", condition: "☀ Clear" },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header Banner */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <div className="text-[13px] text-textSecondary dark:text-darkTextSecondary font-medium">
              External Meteorological Intelligence
            </div>
            <div className="text-xl sm:text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
              Weather &amp; Forecast
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-secondaryLight text-secondary flex items-center gap-1">
              <Cloud size={12} /> WEATHER API
            </span>
            <button
              onClick={refreshWeather}
              disabled={weatherLoading}
              title="Refresh weather data"
              className="p-1.5 rounded-lg border border-borderC dark:border-darkBorderC hover:bg-bg transition text-textSecondary"
            >
              <RefreshCw size={14} className={weatherLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-textSecondary dark:text-darkTextSecondary m-0">
          Local meteorological conditions supporting regional crop management decisions.
        </p>
      </Card>

      {/* Current Weather Card */}
      <Card>
        <SectionTitle icon={CloudRain}>Current Regional Weather</SectionTitle>
        {weatherLoading && !weather ? (
          <Skeleton h={100} />
        ) : weather ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-1 flex items-center gap-1.5">
                <Thermometer size={16} className="text-secondary" /> Temperature
              </div>
              <div className="text-2xl font-bold text-textPrimary">{weather.temperature} °C</div>
              <div className="text-xs text-textSecondary mt-1 capitalize">{weather.weather_condition} ({weather.weather_description})</div>
            </div>

            <div className="p-4 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-1 flex items-center gap-1.5">
                <Droplets size={16} className="text-teal" /> Air Humidity
              </div>
              <div className="text-2xl font-bold text-textPrimary">{weather.humidity} %</div>
              <div className="text-xs text-textSecondary mt-1">Cloud Cover: {weather.cloud_coverage}%</div>
            </div>

            <div className="p-4 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-1 flex items-center gap-1.5">
                <CloudRain size={16} className="text-accent" /> 7-Day Rainfall
              </div>
              <div className="text-2xl font-bold text-textPrimary">{weather.rainfall_7d} {weather.rainfall_unit}</div>
              <div className="text-xs text-textSecondary mt-1">Current 1h: {weather.rainfall} mm</div>
            </div>

            <div className="p-4 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC">
              <div className="text-xs text-textSecondary mb-1 flex items-center gap-1.5">
                <Wind size={16} className="text-primary" /> Wind &amp; Pressure
              </div>
              <div className="text-2xl font-bold text-textPrimary">{weather.wind_speed} m/s</div>
              <div className="text-xs text-textSecondary mt-1">Atmospheric: {weather.pressure} hPa</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-textSecondary p-3 bg-bg rounded-lg border">Weather data currently unavailable.</div>
        )}
      </Card>

      {/* 5-Day Forecast */}
      <Card>
        <SectionTitle icon={SunMedium}>5-Day Regional Forecast</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecastDays.map((f) => (
            <div key={f.day} className="p-3 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC text-center">
              <div className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-1">{f.day}</div>
              <div className="text-sm font-semibold mb-1">{f.condition}</div>
              <div className="text-sm font-extrabold text-textPrimary">
                {f.tempHigh} <span className="text-xs font-normal text-textSecondary">{f.tempLow}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Agricultural Weather Insight */}
      <Card>
        <SectionTitle icon={Info}>Agricultural Weather Insight</SectionTitle>
        <div className="p-4 bg-bg dark:bg-darkBg rounded-xl border border-borderC dark:border-darkBorderC flex gap-3 items-start">
          <Info size={20} className="text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-textPrimary mb-1">Precipitation &amp; Irrigation Advisory</div>
            <p className="m-0 text-xs sm:text-sm text-textSecondary leading-relaxed">
              Regional precipitation is forecast over the next 24–48 hours. Consider reviewing canopy humidity levels and field drainage channels before scheduling additional irrigation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
