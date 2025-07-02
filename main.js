const warehouse = { lat: 54.907129, lon: 38.054109 };

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const tariffs = [
  { name: "а/м до 1т", max: 1000, load: ["верхняя", "боковая"], base: 4000, extra: 1000, per_km: 100 },
  { name: "а/м до 1.5т", max: 1500, load: ["верхняя", "боковая"], base: 4000, extra: 1500, per_km: 100 },
  { name: "а/м до 3т", max: 3000, load: ["верхняя", "боковая"], base: 4500, extra: 1500, per_km: 115 },
  { name: "а/м 5т", max: 5000, load: ["верхняя", "боковая"], base: 5000, extra: 1500, per_km: 144 },
  { name: "а/м 5т гидролифт", max: 5000, load: ["верхняя", "боковая"], base: 6000, extra: 2000, per_km: 154 },
  { name: "а/м 10т", max: 10000, load: ["верхняя", "боковая"], base: 8000, extra: 3000, per_km: 210 },
  { name: "Еврофура 20т", max: 20000, load: ["верхняя", "боковая"], base: 10000, extra: 3500, per_km: 250 },
  { name: "Манипулятор 5т", max: 5000, load: ["manipulator"], base: 15000, extra: 0, per_km: 240 },
  { name: "Манипулятор 10т", max: 10000, load: ["manipulator"], base: 20000, extra: 0, per_km: 240 },
  { name: "Манипулятор 15т", max: 15000, load: ["manipulator"], base: 25000, extra: 0, per_km: 240 }
];

function getVehicle(weight, loadType) {
  return tariffs.find(t => t.max >= weight && t.load.includes(loadType)) || tariffs[tariffs.length - 1];
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const weight = parseFloat(document.getElementById("weight").value);
  const loadType = document.getElementById("loading_type").value;
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);
  const distance = haversine(warehouse.lat, warehouse.lon, lat, lon);
  const inZone = distance <= 40;
  const v = getVehicle(weight, loadType);
  const cost = inZone ? (v.base + v.extra) : (v.base + v.extra + (distance - 40) * v.per_km);
  document.getElementById("result").innerHTML = `
    <p>Расстояние: ${distance.toFixed(2)} км</p>
    <p>Автомобиль: ${v.name}</p>
    <p>Зона: ${inZone ? "внутри 40 км" : "за пределами"}</p>
    <h3>Итоговая стоимость: ${Math.round(cost)} ₽</h3>
  `;
});

const map = L.map('map').setView([warehouse.lat, warehouse.lon], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let marker;
map.on('click', function(e) {
  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);
  document.getElementById("lat").value = e.latlng.lat;
  document.getElementById("lon").value = e.latlng.lng;
});