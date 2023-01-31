import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL = "https://api.tvmaze.com"
const PLACEHOLDER_IMAGE_AT_THE_TOP_OF_THE_FILE = "https://innovating.capital/wp-content/uploads/2021/05/vertical-placeholder-image.jpg"


interface IApiShow {
  id: number;
  name: string;
  summary: string;
  image: {
    medium: string;
  } | null;
}

interface IShow {
  id: number;
  name: string;
  summary: string;
  image: string
}

interface IEpisode {
  id: number;
  name: string;
  season: string;
  number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term: string): Promise<[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(`${BASE_URL}/search/shows?q=${term}`);
  console.log(response.data);

  const showData = response.data.map((result: { show: IApiShow }) => {

    const s = result.show;

    return {
      id: s.id,
      name: s.name,
      summary: s.summary,
      image: s.image?.medium || PLACEHOLDER_IMAGE_AT_THE_TOP_OF_THE_FILE
    }
  });

  console.log(showData);

  return showData;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows: IShow[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number): Promise<IEpisode[]> {
  const response = await axios.get(`${BASE_URL}/shows/${id}/episodes`)

  const episodesData = response.data.map((e: IEpisode) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number
  }));

  return episodesData;
}

/** Adds list of episodes to the DOM, displaying their name, season, and
 * episode.
 */
function populateEpisodes(episodes: IEpisode[]): void {
  $episodesArea.empty();

  for (let e of episodes) {
    let $episode = $(`
      <li>
        ${e.name} (season ${e.season}, episode ${e.number})
      </li>
    `)

    $episodesArea.append($episode);
  }

  $episodesArea.show();
}

/** Controller function to fetch episodes and append them to the DOM. */
async function getAndShowEpisodes(event: JQuery.ClickEvent): Promise<void> {
  event.preventDefault();

  const $button = $(event.target);
  const showId = $button.closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getAndShowEpisodes);