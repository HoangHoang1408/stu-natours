export const displayMap = function (locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaG9hbmcxNDgyMDAyIiwiYSI6ImNrczZ3azR0YTBncDQyb3BscHZhNWN5ZnUifQ.4UlAU0JAnZfkQHHmfn9Ybg';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hoang1482002/cks6yja9pba0a18qglg985mky',
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    bounds.extend(loc.coordinates);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.day}:${loc.description}</p>`)
      .addTo(map);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      left: 50,
      right: 50,
      bottom: 200,
    },
  });
};
