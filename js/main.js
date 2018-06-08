let restaurants,
  neighborhoods,
  cuisines
var map
var mymap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
window.initMap = () => {
  //define and initalize location though
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  let leaflet = [loc.lat, loc.lng];
  mymap = L.map('mapid').setView(leaflet, 12);    //* leaflet code
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoia2F0aHdlYXZlciIsImEiOiJjamkzb3cydnIwMHRvM2txY25zdGxiMTJlIn0.Q2vjPob84qXvilM4vhMeaA'
}).addTo(mymap);
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  for(i=0;i<markers.length;i++) {
    mymap.removeLayer(markers[i]);
    }
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img lazyload';    //added lazyload to class
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);  changed image source for lazyloading
  image.src = "/img/handtinyblack.gif";
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
    /* Add lowsrc to image for phones */
  image.lowsrc = DBHelper.imageUrlForRestaurant(restaurant).slice(0, -4) + "-small.jpg";
    /* Add srcset for responsive images */
  image.setAttribute('srcset', DBHelper.imageUrlForRestaurant(restaurant).slice(0, -4) + "-large.jpg 2x, " +
    DBHelper.imageUrlForRestaurant(restaurant).slice(0, -4) + "-medium.jpg 1x, " +
    DBHelper.imageUrlForRestaurant(restaurant).slice(0, -4) + "-small.jpg 100w");

    /*  Add alt to image */
  image.setAttribute('alt',restaurant.name);
  li.append(image);

  const name = document.createElement('h1');
  /* add span to restaurant to format smaller names */
  if (restaurant.name.length < 10) {
    name.innerHTML = '<span class="smallName">' + restaurant.name + '</span>';
  } else {
    name.innerHTML = '<span class="largeName">' + restaurant.name + '</span>';
  }
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  //* add arial-label
  more.setAttribute('aria-label','View Details ' + restaurant.name);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    //*leafmap marker code
    const markerURL = "<a href=" + DBHelper.urlForRestaurant(restaurant) + ">" + restaurant.name + "</a>";
    /*
    L.marker([restaurant.latlng.lat,restaurant.latlng.lng]).addTo(mymap)
    .bindPopup(markerURL)
    self.markers.push(L.marker); */

    var Lmarker =  L.marker([restaurant.latlng.lat,restaurant.latlng.lng]);
    markers.push(Lmarker);
    Lmarker.addTo(mymap)
    .bindPopup(markerURL);

  });
}
