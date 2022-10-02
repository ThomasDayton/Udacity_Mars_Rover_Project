// import immutablejs.js
//const Immutable = require('immutable');

// Changed to be immutable via ImmutableJs
let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  	rover_pictures: '',
  	selected_rover: 0,
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
  	// Changed to be immutable via ImmutableJs
    //store = Object.assign(store, newState)
  	store = store.merge(newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}


// create content
const App = (state) => {
    let { rovers, apod } = state;
    return `
        <header></header>
        <main>
            ${Greeting(state.get("user").get("name"))}
            <section>
                <h3>NASA Astronomy Picture of the Day</h3>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(state.get("apod"))}
            </section>
            <br>
            <section>
            <h3>Mars Rovers Picture Gallery</h3>
            <div class="center">
            	${getRoverButtons(state.get("rovers"))}
            </div>
            <br>
            ${MarsRovers(state.get("rovers"), state.get("rover_pictures"), state.get("selected_rover"))}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod && apod.get("date"))
    if (!apod || apod.get("date") === today.getDate() ) {
        getImageOfTheDay()
    }

    // check if the photo of the day is actually type video!
    if (apod && apod.get("media_type") === "video") {
        return (`
            <p>See today's featured video <a href="${apod && apod.get("url")}">here</a></p>
            <p>${apod && apod.get("title")}</p>
            <p>${apod && apod.get("explanation")}</p>
        `)
    } else {
        return (`
            <img src="${apod && apod.get("image").get("url")}" height="350px" width="100%" />
            <p>${apod && apod.get("image").get("explanation")}</p>
        `)
    }
}

// Pure Function that renders the rover pictures
const MarsRovers = (rovers, pictures, selected_rover) => {
  //If the the images do not already exist, request the images
  if(!pictures){
    addRoverPicturesToState(rovers);
  }
  if(pictures) {
    return getRoverPicturesHTML(pictures, selected_rover);
  }
}

// Function that takes the available rovers and makes a button for each of them, with each button having the functionality to switch the displayed photos to photos from its respective rover
const makeRoverButton = (roverData) => {
  return `<button onclick="changeSelectedRover(${roverData.get("index")})">${roverData.get("rover")}</button>`
}

// Simple HOF that takes a function (in this case, an HTML-displaying function) and its parameters
const highOrderHTML = (fn, params) => {
  return fn(params);
}

// A callback function to be passed to to the reducer that makes the rover buttons
const roverButtonReducer = (previousData, currentRover, currentIndex) => {
  if(previousData === ``){
      return highOrderHTML(makeRoverButton, Immutable.Map({index: currentIndex, rover: currentRover}));
    } else {
      return previousData.concat(highOrderHTML(makeRoverButton, Immutable.Map({index: currentIndex, rover: currentRover})));
    }
}

// A simple helper function that takes a list and a reducer callback function, then runs reduce using the callback on the list
const highOrderReduce = (fn, list) => {
  return list.reduce(fn, ``)
}

// Function that prints a button for each rover in the rover array, with each button having the functionality to change the selected rover to its respective rover
const getRoverButtons = (rovers) => {
  return highOrderReduce(roverButtonReducer, rovers);
}

// Function to change the selected rover
const changeSelectedRover = (selected_rover) => {
  updateStore({ selected_rover });
}

// A callback function to be passed to a reducer that returns the HTML-styled photos for the selected rover
const roverPhotoReducer = (previousData, currentPicture) => {
  if(previousData === ``){
      return highOrderHTML(makePhoto, currentPicture);
    } else {
      return previousData.concat(highOrderHTML(makePhoto, currentPicture));
    }
}

// A function that makes the HTML for the info for each rover photo, which is displayed beneath its respective photo
const makePictureInfoDiv = (divClass, pictureData) => {
  return `
  <div class=${divClass}>
  	<p>Rover Name: ${pictureData.get("rover").get("name")}</p><br>
    <p>Launch Date: ${pictureData.get("rover").get("launch_date")}</p><br>
    <p>Landing Date: ${pictureData.get("rover").get("landing_date")}</p><br>
    <p>Photo Taken (Earth Date): ${pictureData.get("earth_date")}</p><br>
    <p>Rover Status: ${pictureData.get("rover").get("status")}</p>
  </div>
  `
}

// A simple HOF that takes a div-creating function, the class that the resulting div should have, and the data needed to make the items within the div, then returns the result of the div-creating function
const makeDiv = (divFunction, divClass, divData) => {
  return divFunction(divClass, divData);
}

// A function that makes the HTML div that contains the photo (note that it calls the makeDiv function within it, despite being called from that function)
const makePictureDiv = (divClass, pictureData) => {
  return `
  	<div class=${divClass}>
      <img src=${pictureData.get("img_src")}>
      ${makeDiv(makePictureInfoDiv, "container",  pictureData)}
    </div>
  `
}

// A simple function that creatrs the HTML for each photo given to it
const makePhoto = (picture) => {
  return makeDiv(makePictureDiv, "photo", picture);
}

// A function that returns the HTML for all of the photos of the rover given to it
const getRoverPicturesHTML = (pictures, selected_rover) => {
  return highOrderReduce(roverPhotoReducer, pictures.get(selected_rover));
}

// Asynchronous function that retrieves the rover pictures and puts them into an array in the state variable
const addRoverPicturesToState = async (rovers) => {
  const rover_pictures = await Promise.all(rovers.map(async (rover) => {
    const rover_data = await getRoverPictures(rover);
    return rover_data.image.latest_photos;
  }));
  updateStore({ rover_pictures });
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = () => {

    fetch(`/apod`)
        .then(res => res.json())
        .then(apod => updateStore({ apod }));
}

// API Call to get rover pictures
const getRoverPictures = async (rover) => {
  const photo_data = await fetch(`/rovers/${rover}`);
  const photo_json = await photo_data.json();
  return photo_json;
}