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

const updateStore = (state, newState) => {
  	// Changed to be immutable via ImmutableJs
    //store = Object.assign(store, newState)
  	store = state.merge(newState);
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
            ${Greeting(store.get("user").get("name"))}
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
                ${ImageOfTheDay(state, state.get("apod"))}
            </section>
            <br>
            <section>
            <h3>Mars Rovers Picture Gallery</h3>
            <div class="center">
            	${getRoverButtons(state.get("rovers"))}
            </div>
            <br>
            ${MarsRovers(state, state.get("rovers"), state.get("rover_pictures"), state.get("selected_rover"))}
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
const ImageOfTheDay = (state, apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod && apod.get("date"))
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.get("date") === today.getDate() ) {
        getImageOfTheDay(state)
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
const MarsRovers = (state, rovers, pictures, selected_rover) => {
  //If the the images do not already exist, request the images
  if(!pictures){
    addRoverPicturesToState(state, rovers);
  }
  if(pictures) {
    return getRoverPicturesHTML(pictures, selected_rover);
  }
}

// Function that prints a button for each rover in the rover array, with each button having the functionality to change the selected rover to its respective rover
const getRoverButtons = (rovers) => {
  return rovers.reduce( (previousData, currentRover, currentIndex) => {
    if(previousData === ``){
      return `<button onclick="changeSelectedRover(${currentIndex})">${currentRover}</button>`;
    } else {
      return previousData.concat(`<button onclick="changeSelectedRover(${currentIndex})">${currentRover}</button>`);
    }
  }, ``);
}

// Function to change the selected rover
const changeSelectedRover = (selected_rover) => {
  updateStore(store, { selected_rover });
}

const getRoverPicturesHTML = (pictures, selected_rover) => {
  console.log(pictures.toJS());
  return pictures.get(selected_rover).reduce((previousData, currentPicture) => {
    if(previousData === ``){
      return `
      <div class="photo">
        <img src=${currentPicture.get("img_src")} width="600" height="400">
        <div class="container">
          <p>Rover Name: ${currentPicture.get("rover").get("name")}</p><br>
          <p>Launch Date: ${currentPicture.get("rover").get("launch_date")}</p><br>
          <p>Landing Date: ${currentPicture.get("rover").get("landing_date")}</p><br>
          <p>Photo Taken (Earth Date): ${currentPicture.get("earth_date")}</p><br>
          <p>Rover Status: ${currentPicture.get("rover").get("status")}</p>
        </div>
      </div>
      `;
    } else {
      return previousData.concat(`
      <div class="photo">
        <img src=${currentPicture.get("img_src")}>
        <div class="container">
          <p>Rover Name: ${currentPicture.get("rover").get("name")}</p><br>
          <p>Launch Date: ${currentPicture.get("rover").get("launch_date")}</p><br>
          <p>Landing Date: ${currentPicture.get("rover").get("landing_date")}</p><br>
          <p>Photo Taken (Earth Date): ${currentPicture.get("earth_date")}</p><br>
          <p>Rover Status: ${currentPicture.get("rover").get("status")}</p>
        </div>
      </div>
      `);
    }
  }, ``);
}

// Asynchronous function that retrieves the rover pictures and puts them into an array in the state variable
const addRoverPicturesToState = async (state, rovers) => {
  const rover_pictures = await Promise.all(rovers.map(async (rover) => {
    const rover_data = await getRoverPictures(rover);
    return rover_data.image.latest_photos;
  }));
  updateStore(state, { rover_pictures });
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {

    fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/apod`)
        .then(res => res.json())
        .then(apod => updateStore(state, { apod }));
}

// API Call to get rover pictures
const getRoverPictures = async (rover) => {
  const photo_data = await fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/rovers/${rover}`);
  const photo_json = await photo_data.json();
  return photo_json;
}