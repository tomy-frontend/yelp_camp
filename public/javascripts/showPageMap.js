mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  center: campground.geometry.coordinates,
  zoom: 12,
});

new mapboxgl.Marker().setLngLat(campground.geometry.coordinates).addTo(map);
