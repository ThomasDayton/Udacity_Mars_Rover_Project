// import immutablejs.js
//const Immutable = require('immutable');

// Changed to be immutable via ImmutableJs
let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  	rover_pictures: Immutable.List([]),
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
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
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
            <h3>Mars Rovers</h3>
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
  //If the images do not already exist, request them
  if(R.isEmpty(pictures)){
    const rover_pictures = rovers.map( x => getRoverPictures(state, x));
  }
  //console.log(state.get("rover_pictures").toJS());
  
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {

    fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/apod`)
        .then(res => res.json())
        .then(apod => updateStore(state, { apod }));
}

// API Call to get rover pictures
const getRoverPictures = (state, rover) => {
  fetch(`https://r950324c957034xreactr0lcusuk-3000.udacity-student-workspaces.com/rover/${rover}`)
  .then(res => res.json())
  .then(rover_pictures => updateStore(state, state.get("rover_pictures").push(rover_pictures)));
}