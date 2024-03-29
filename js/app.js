// #region ***  other                           ***********
let wall,
  wallItem,
  routes,
  selectedPath,
  ropeId = 1,
  currentuser,
  notification;

// fix
//

const fetchPromise = function (url, method = "GET", body = null) {
  return fetch(url, {
    method: method,
    body: body,
  })
    .then((response) => {
      let res = response.json();
      return res;
    })
    .catch((error) => {
      console.error(error);
    });
};

const toggleNav = function () {
  let toggleTrigger = document.querySelectorAll(".js-toggle-nav");

  for (let i = 0; i < toggleTrigger.length; i++) {
    toggleTrigger[i].addEventListener("click", function () {
      document.querySelector("body").classList.toggle("has-mobile-nav");
    });
  }
};

const togggleStars = function () {
  const starEls = document.querySelectorAll(".star.rating");

  starEls.forEach((star) => {
    star.addEventListener("click", function (e) {
      let starEl = e.currentTarget;
      let starRating = starEl.dataset.rating;
      starEl.parentNode.setAttribute("data-stars", starRating);
    });
  });
};

const drawSelectedPath = function () {
  const topDiffrence =
    wallItem[20].getBoundingClientRect().top -
    wallItem[0].getBoundingClientRect().top;
  const leftDiffrence =
    wallItem[1].getBoundingClientRect().left -
    wallItem[0].getBoundingClientRect().left;
  let cords = [];

  for (let i = 0; i < routes.length; i++) {
    for (let j = 0; j < routes[i].grips.length; j++) {
      if (routes[i].routeID != selectedPath) {
        break;
      }

      let top = routes[i].grips[j].points.x * topDiffrence - topDiffrence;

      if (top < 0) {
        top = 0;
      }

      let left = routes[i].grips[j].points.y * leftDiffrence - leftDiffrence;

      if (left < 0) {
        left = 0;
      }

      cords.push({
        xpoint: top,
        ypoint: left,
      });
    }
  }

  var points = cords;
  var Gen = d3
    .line()
    .x((p) => p.xpoint)
    .y((p) => p.ypoint)
    .curve(d3.curveCardinal);
  d3.select("#gfg").selectAll("path").remove();
  d3.select("#gfg")
    .append("path")
    .attr("d", Gen(points))
    .attr("fill", "none")
    .attr("stroke", "#5804f4")
    .attr("stroke-width", "2")
    .attr("class", "js-path");
  animatePath();
};

const animatePath = function () {
  const path = document.querySelector(".js-path");
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = 0 - length;
};

// #endregion

// #region ***  Visualisation - show___         ***********
const showWall = function () {
  let html = "";

  for (let i = 0; i < 1420; i++) {
    html += '<div class="c-wall__grid--item js-grid-item"></div>';
  }

  html += '<svg id="gfg" width="200" height="200" class="c-wall__svg"></svg>';
  document.querySelector(".js-wall").innerHTML = html;
};

const showRouteButtons = function () {
  console.log(routes);

  if (routes.length == null) {
    document.querySelector(
      ".js-wall_route--options"
    ).innerHTML = `<div class="o-hide-accessible c-options c-option--hidden js-path-select"/>Er zijn geen routes voor dit touw op dit moment</div>`;
    return;
  }

  let html = "";
  for (let i = 0; i < routes.length; i++) {
    let route_id = routes[i].routeID;
    let routeName = routes[i].name;
    let difficulty = routes[i].difficulty;
    let builder =
      routes[i].builder.lastname + " " + routes[i].builder.firstname;
    let rating = Math.round(routes[i].avgRating);
    let starSVG = "";

    for (let j = 0; j < 5; j++) {
      if (j < rating) {
        starSVG += `<svg xmlns="http://www.w3.org/2000/svg"class="c-wall__star c-wall__star--fill"width="40"height="38"viewBox="0 0 40 38"><path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z"transform="translate(-4 -6)"/></svg>`;
      } else {
        starSVG += `<svg xmlns="http://www.w3.org/2000/svg"class="c-wall__star"width="40"height="38"viewBox="0 0 40 38"><path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z"transform="translate(-4 -6)"/></svg>`;
      }
    }

    let checked = "";

    if (i == 0) {
      checked = "checked";
      selectedPath = route_id;
    }

    html += `
      <input class="o-hide-accessible c-options c-option--hidden js-path-select"type="radio"id="${
        i + 1
      }"name="routes"data-id="${route_id}"${checked}/>
      <label class="c-label c-label--options c-custom-options"for="${i + 1}">
      <span class="u-mb-clear c-wall__rating--title">${routeName}</span>
      <span class="u-mb-clear c-wall__rating--subtitle">Niveu: <span>${difficulty}</span>
      </span><span class="u-mb-s c-wall__rating--subtitle">Builder: <span>${builder}</span>
      </span><span class="u-mb-clear c-wall__rating--subtitle">Rating:</span>
      <span>${starSVG}</span>
      </label>`;
  }

  document.querySelector(".js-wall_route--options").innerHTML = html;
  showGrips();

  if (currentuser != null) {
    getRouteDetailsByID();
  }
};

const showGrips = async function () {
  wall = document.querySelectorAll(".c-wall");
  wallItem = document.querySelectorAll(".c-wall__grid--item");

  for (let i = 0; i < routes.length; i++) {
    for (let j = 0; j < routes[i].grips.length; j++) {
      let index =
        routes[i].grips[j].points.x -
        1 +
        (routes[i].grips[j].points.y - 1) * 20;
      wallItem[index].classList.add("c-wall__grid--item--grip");
      wallItem[index].setAttribute("data-id", routes[i].routeID);

      switch (routes[i].grips[j].handgriptype) {
        case "Bak":
          wallItem[index].classList.add("c-wall__grid--item--grip--bak");
          break;
        case "Sloper":
          wallItem[index].classList.add("c-wall__grid--item--grip--sloper");
          break;
        case "Crimp":
          wallItem[index].classList.add("c-wall__grid--item--grip--crimp");
          break;
        case "Pocket":
          wallItem[index].classList.add("c-wall__grid--item--grip--pocket");
          break;
        case "Jug":
          wallItem[index].classList.add("c-wall__grid--item--grip--jug");
          break;
        case "Undercling":
          wallItem[index].classList.add("c-wall__grid--item--grip--undercling");
          break;
        case "Mono":
          wallItem[index].classList.add("c-wall__grid--item--grip--mono");
          break;
        case "Bidoigt":
          wallItem[index].classList.add("c-wall__grid--item--grip--bidoigt");
          break;
      }
    }
  }

  drawSelectedPath();
  listenToRouteClick();
};

const showRopes = function (ropes) {
  let wall = document.querySelector(".js-route-touw");
  let html = ``;
  for (let i = 0; i < ropes.length; i++) {
    html += `<div class="c-touw">
      <img src="${ropes[i].image}" class="c-touw__backgouround" alt="Rope achtergrond" />
      <div class="c-touw__content">
        <h1 class="c-touw__content--title">Touw ${ropes[i].rope}</h1>
        <a href="https://meeclimb.azurewebsites.net/touwDetail?touw=${ropes[i].rope}" class="c-touw__content--button">Bekijk routes</a>
      </div>
      </div>`;
  }
  wall.innerHTML = html;
};

const showRopesRanking = function (ropes) {
  let wall = document.querySelector(".js-select-rope");
  let html = ``;
  for (let i = 0; i < ropes.length; i++) {
    html += `<option value="${ropes[i].rope}">Touw ${ropes[i].rope}</option>`;
  }
  wall.innerHTML = html;
  getSelectedRopeRoutes();
};

const getSelectedRopeRoutes = async function () {
  const url =
    "https://meeclimb.azurewebsites.net/api/routes?rope=" + selectedRope;
  routes = await fetchPromise(url);
  if (routes.length != 0) {
    selectedRoute = routes[0].routeID;
    showRouteRanking(routes);
  } else {
    document.querySelector(
      ".js-select-route"
    ).innerHTML = `<option value="0">Geen routes op dit touw</option>`;
    listenToSelectchange();
  }
};

const showRouteRanking = function (routes) {
  let wall = document.querySelector(".js-select-route");
  let html = ``;
  for (let i = 0; i < routes.length; i++) {
    html += `<option value="${routes[i].routeID}">${i + 1} | ${
      routes[i].name
    }</option>`;
  }
  wall.innerHTML = html;
  getRankingOfRoute();
  listenToSelectchange();
};

const listenToSelectchange = function () {
  document
    .querySelector(".js-select-rope")
    .addEventListener("change", ropeChange);

  document
    .querySelector(".js-select-route")
    .addEventListener("change", routeChange);
};

const ropeChange = function (event) {
  selectedRope = event.target.value;
  document
    .querySelector(".js-select-rope")
    .removeEventListener("change", ropeChange);
  document
    .querySelector(".js-select-rope")
    .removeEventListener("change", routeChange);
  getSelectedRopeRoutes();
};
const routeChange = function (event) {
  selectedRoute = event.target.value;
  document
    .querySelector(".js-select-rope")
    .removeEventListener("change", ropeChange);
  document
    .querySelector(".js-select-rope")
    .removeEventListener("change", routeChange);
  getRankingOfRoute();
};

const getRankingOfRoute = async function () {
  const url =
    "https://meeclimb.azurewebsites.net/api/route/ranking/" + selectedRoute;
  ranking = await fetchPromise(url);
  console.log(ranking);
  showRanking(ranking);
};

const showRanking = function (ranking) {
  let wall = document.querySelector(".js-ranking");
  let html;
  if (ranking.length <= 0) {
    html = `<li class="c-ranking__item">
            <div>
              <p class="u-mb-clear c-ranking__item--nummer">0</p>
              <p class="u-mb-clear c-ranking__item--name">Te wijning Data</p>
            </div>
            <p class="u-mb-clear c-ranking__item--sec"><span>0</span>sec</p>
          </li>`;
  } else {
    document.querySelector(".js-1-name").innerHTML =
      ranking[0].user.firstname + " " + ranking[0].user.lastname;
    document.querySelector(".js-1-time").innerHTML = ranking[0].prestation;
    document.querySelector(".js-1-img").src = ranking[0].user.image;
    document.querySelector(".js-2-name").innerHTML =
      ranking[1].user.firstname + " " + ranking[i].user.lastname;
    document.querySelector(".js-2-time").innerHTML = ranking[1].prestation;
    document.querySelector(".js-2-img").src = ranking[0].user.image;
    document.querySelector(".js-3-name").innerHTML =
      ranking[2].user.firstname + " " + ranking[i].user.lastname;
    document.querySelector(".js-3-time").innerHTML = ranking[2].prestation;
    document.querySelector(".js-3-img").src = ranking[0].user.image;
    for (let i = 0; i < ranking.length; i++) {
      html += `<li class="c-ranking__item">
            <div>
              <p class="u-mb-clear c-ranking__item--nummer">${ranking[i].rang}</p>
              <p class="u-mb-clear c-ranking__item--name">${ranking[i].climber.firstname} ${ranking[i].climber.firstname}</p>
            </div>
            <p class="u-mb-clear c-ranking__item--sec"><span>${ranking[i].prestation}</span>sec</p>
          </li>`;
    }
    wall.innerHTML = html;
  }
};

const showComments = function (comments) {
  console.log(comments);
  let html = `<div class="c-commend__add">
      <label for="cocmment">Voeg een comment toe:</label>
      <textarea name="comment" id="comment" class="c-comment__area js-comment" rows="4" placeholder="Wat vond u van deze route?"></textarea>
      <div class="stars js-star-rating" data-stars="1">
        <svg xmlns="http://www.w3.org/2000/svg" class="star rating" data-rating="1" width="24" height="24" viewBox="0 0 40 38">
          <path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z" transform="translate(-4 -6)" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="star rating" data-rating="2" width="24" height="24" viewBox="0 0 40 38">
          <path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z" transform="translate(-4 -6)" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="star rating" data-rating="3" width="24" height="24" viewBox="0 0 40 38">
          <path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z" transform="translate(-4 -6)" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="star rating" data-rating="4" width="24" height="24" viewBox="0 0 40 38">
          <path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z" transform="translate(-4 -6)" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="star rating" data-rating="5" width="24" height="24" viewBox="0 0 40 38">
          <path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z" transform="translate(-4 -6)" />
        </svg>
      </div>
      <label for="send_comment" class="c-commen__button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Verstuur
      </label>
      <input type="button" name="send_comment" id="send_comment" class="o-hide-accessible js-add-comment" />
    </div>;`;
  html += `<h3 class="c-comment__header u-mb-clear">Recente reacties:</h3>`;
  html += `<div class="c-comments">`;
  let lengte = comments.ratings.length > 5 ? 5 : comments.ratings.length;
  for (let i = 0; i < lengte; i++) {
    let rating = Math.round(comments.avgRating);
    let starSVG = "";
    for (let j = 0; j < 5; j++) {
      if (j < rating) {
        starSVG += `<svg xmlns="http://www.w3.org/2000/svg"class="c-wall__star c-wall__star--fill"width="40"height="38"viewBox="0 0 40 38"><path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z"transform="translate(-4 -6)"/></svg>`;
      } else {
        starSVG += `<svg xmlns="http://www.w3.org/2000/svg"class="c-wall__star"width="40"height="38"viewBox="0 0 40 38"><path d="M11.65,44,14.9,29.95,4,20.5l14.4-1.25L24,6l5.6,13.25L44,20.5,33.1,29.95,36.35,44,24,36.55Z"transform="translate(-4 -6)"/></svg>`;
      }
    }
    html += `<div class="c-comment">
                <div class="c-comment-top">
                  <img src="${
                    comments.ratings[i].ratedBy.image
                  }" alt="Profile picture from ${
      comments.ratings[i].ratedBy.firstname
    } ${comments.ratings[i].ratedBy.lastname}" class="c-comment__img" />
                  <div>
                    <p class="c-comment__name u-mb-xs">${
                      comments.ratings[i].ratedBy.firstname
                    } ${comments.ratings[i].ratedBy.lastname}</p>
                    <p class="c-comment__date u-mb-clear">${new Date(
                      comments.ratings[i].timestamp
                    ).toLocaleString("nl-be", {
                      weekday: "long",
                      month: "short",
                      year: "numeric",
                    })}</p>
                  </div>
                </div>
                <div class="c-comment__stars">${starSVG}</div>
                <div class="c-comment__text">${
                  comments.ratings[i].comment
                }</div>
              </div>`;
  }
  html += `</div>`;

  document.querySelector(".js-comments").innerHTML = html;
  togggleStars();
  listenToAddComment();
};

const showCommunity = function (data) {
  console.log(data);
  let html = "";
  if (data.length == 0) {
    html += `<h1 class="c-community--title">Recente activiteiten</h1>`;
    html += `<p class="c-community--empty">Er zijn nog geen activiteiten</p>`;
  } else {
    html = '<h1 class="c-community--title">Recente activiteiten</h1>';
    for (let i = 0; i < data.length; i++) {
      let liked;
      for (let j = 0; j < data[i].likedby.length; j++) {
        if (data[i].likes[j].climberId === currentUser.climberID) {
          liked = "checked";
        } else {
          liked = "";
        }
      }
      let comments = data[i].comments;
      let length = comments.length > 3 ? 3 : comments.length;
      let commentshmtl = '<div class="c-comments">';
      for (let j = 0; j < length; j++) {
        commentshmtl += `<div class="c-comment">
                <div class="c-comment-top">
                  <img src="${
                    comments[j].commentedby.image
                  }" alt="Profiel foto van ${
          comments[j].commentedby.firstname
        } ${comments[j].commentedby.lastname}" class="c-comment__img" />
                  <div>
                    <p class="c-comment__name u-mb-xs">${
                      comments[j].commentedby.firstname
                    } ${comments[j].commentedby.lastname}</p>
                    <p class="c-comment__date u-mb-clear">${new Date(
                      comments[j].timestsamp
                    )}</p>
                  </div>
                </div>
                <div class="c-comment__text">${comments[j].comment}</div>
              </div>
            `;
      }
      commentshmtl += "</div>";

      html += `<div class="c-community__item">
          <div class="c-community__item--topbar">
            <div class="c-community__item--topbar--left">
              <img src="${data[i].climber.image}" alt="profile picture of ${
        data[i].climber.firstname
      } ${data[i].climber.lastname}" class="c-community__item--avatar" />
              <div>
                <p class="c-community__item--topbar--name u-mb-clear">${
                  data[i].climber.firstname
                } ${data[i].climber.lastname}</p>
                <p class="c-community__item--topbar--date u-mb-clear">${new Date(
                  data[i].startTime
                ).toLocaleString("nl-be", {
                  weekday: "long",
                  month: "short",
                  year: "numeric",
                })}</p>
              </div>
            </div>
            <input type="checkbox" name="like" id="like" class="o-hide-accessible c-heart-checkbox js-like-button" ${liked} data-id="${
        data[i].activityID
      }" />
            <label for="like" class="c-community__heart">
              <svg xmlns="http://www.w3.org/2000/svg" class="c-community__heart--symbol" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              <span>${data[i].amountLikes}</span>
            </label>
          </div>
          <div class="c-community__stats">
            <div class="c-community__stat">
              <span class="c-community__stat--titel">Route</span
              ><span class="c-community__stat--value"
                >Touw ${data[i].route.rope} <br />
                Route ${data[i].route.naam}</span
              >
            </div>
            <div class="c-community__stat"><span class="c-community__stat--titel">Niveau</span><span class="c-community__stat--value">${
              data[i].route.difficulty
            }</span></div>
            <div class="c-community__stat"><span class="c-community__stat--titel">Tijd</span><span class="c-community__stat--value">${
              data[i].prestation
            }</span></div>
          </div>
          <hr class="c-community--bar" />
          <div class="c-activity__comment--add">
            <textarea name="comment" id="comment" class="c-comment__area js-add-comment-activitie--text" rows="1" placeholder="Voeg een reactie toe"></textarea>
            <label for="send_comment" class="c-commen__button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </label>
            <input type="submit" name="send_comment" id="send_comment" class="o-hide-accessible js-add-comment-activitie" data-id="${
              data[i].activityID
            }" />
          </div>
            ${commentshmtl}
        </div>`;
      listenToLikeButton();
      listenToAddCommentButton();
    }
  }
};

const listenToAddCommentButton = function () {
  const addCommentButton = document.querySelector(".js-add-comment-activitie");
  addCommentButton.addEventListener("click", addCommentActivitie);
};

const addCommentActivitie = async function (event) {
  const id = event.target.getAttribute("data-id");
  const comment = document.querySelector(
    ".js-add-comment-activitie--text"
  ).value;
  const data = {
    activityID: id,
    comment: comment,
  };
  console.log(data);
  let url = "https://meeclimb.azurewebsites.net/api/activity/comment";
  const response = await fetchPromise(url, "POST", data);
  document
    .querySelector(".js-add-comment-activitie")
    .removeEventListener("click", addCommentActivitie);
  getCommunity();
};

const listenToLikeButton = function () {
  const likeButtons = document.querySelectorAll(".js-like-button");
  for (let i = 0; i < likeButtons.length; i++) {
    likeButtons[i].addEventListener("click", likeActivitie);
  }
};

const likeActivitie = async function (event) {
  const id = event.target.getAttribute("data-id");
  const liked = event.target.checked;

  if (liked) {
    let url = "https://meeclimb.azurewebsites.net/api/activity/like";
    const data = {
      activityID: id,
    };
    console.log(data);
    const response = await fetchPromise(url, "POST", data);
  } else {
    let url = "https://meeclimb.azurewebsites.net/api/activity/like/" + id;
    const response = await fetchPromise(url, "DELETE");
  }
  removeEventListenerLikes();
  getCommunity();
};

const removeEventListenerLikes = function () {
  const likeButtons = document.querySelectorAll(".js-like-button");
  for (let i = 0; i < likeButtons.length; i++) {
    likeButtons[i].removeEventListener("click", likeActivitie);
  }
};

// #endregion

// #region ***  Data Access - get___                     ***********
const getRopeId = function () {
  let url = window.location.search;
  let urlParams = new URLSearchParams(url);
  ropeId = urlParams.get("touw");
  if (ropeId == null) {
    ropeId = 1;
  }
  document.querySelector(".js-rope-name").innerHTML = "Touw " + ropeId;
  getWallRoutes(ropeId);
};

const getWallRoutes = async function (rope_id) {
  const url = "https://meeclimb.azurewebsites.net/api/routes?rope=" + rope_id;
  routes = await fetchPromise(url);
  showRouteButtons();
};

const getRopes = async function () {
  const url = "https://meeclimb.azurewebsites.net/api/ropes";
  const ropes = await fetchPromise(url);
  showRopes(ropes);
};

const getRopesRanking = async function () {
  const url = "https://meeclimb.azurewebsites.net/api/ropes";
  const ropes = await fetchPromise(url);
  if (ropes.length != 0) {
    selectedRope = ropes[0].rope;
    showRopesRanking(ropes);
  } else {
    document.querySelector(
      ".js-select-rope"
    ).innerHTML = `<option value="0" data-builder="0">Geen touwen</option>`;
    document.querySelector(
      ".js-select-route"
    ).innerHTML = `<option value="0" data-builder="0">Geen routes</option>`;
  }
};

const getRouteDetailsByID = async function () {
  const url =
    "https://meeclimb.azurewebsites.net/api/routes?routeID=" + selectedPath;
  const response = await fetchPromise(url);
  showComments(response);
};

const getCommunity = async function () {
  const url = "https://meeclimb.azurewebsites.net/api/friends/activities";
  const response = await fetchPromise(url);
  showCommunity(response);
};
// #endregion

// #region ***  Event Listeners - listenTo___            ***********
const listenToRouteClick = function () {
  let options = document.querySelectorAll(".js-path-select");

  options.forEach((option) => {
    option.addEventListener("change", function (event) {
      selectedPath = this.getAttribute("data-id");
      drawSelectedPath();
      getRouteDetailsByID();
    });
  });
};

const listenToWindowResize = function () {
  window.addEventListener("resize", function () {
    drawSelectedPath();
  });
};

const listenToLogout = function () {
  document.querySelector(".js-logout").addEventListener("click", function () {
    logout();
  });
};

const listenToSeachFriend = function () {
  document
    .querySelector(".js-search-climber")
    .addEventListener("click", function (event) {
      document.querySelector(".js-overlay--addfriend").style.display = "flex";
      document
        .querySelector(".js-cancel-friend")
        .addEventListener("click", cancelFriend);
      document
        .querySelector(".js-add-friend-name")
        .addEventListener("input", addFriendsearch);
    });
};

const cancelFriend = function () {
  document.querySelector(".js-overlay--addfriend").style.display = "none";
  document
    .querySelector(".js-cancel-friend")
    .removeEventListener("click", cancelFriend);
};

const addFriendsearch = async function (event) {
  let search = event.target.value;
  let url = "https://meeclimb.azurewebsites.net/api/user?nickname=" + search;
  let data = await fetchPromise(url);

  let lengte = data.length > 5 ? 5 : data.length;

  let html = ``;
  for (let i = 0; i < lengte; i++) {
    html += `<div class="c-overlay--friend-sug">
            <p class="u-mb-clear">${data[i].firstname} ${data[i].lastname}</p>
            <input type="button" value="toevoegen" data-id=${data[i].climberID} class="js-add-fried-button c-overlay-add-friend--button"/>
          </div>`;
  }

  document.querySelector(".js-friend-sug").innerHTML = html;
  let buttons = document.querySelectorAll(".js-add-fried-button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      let id = this.getAttribute("data-id");
      addFriend(id);
    });
  });
};

const addFriend = async function (id) {
  let url = "https://meeclimb.azurewebsites.net/api/friend/request";
  let data = {
    friendID: id,
  };
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.status == 201) {
    document.querySelector(".js-overlay--addfriend").style.display = "none";
    document
      .querySelector(".js-cancel-friend")
      .removeEventListener("click", cancelFriend);
    document
      .querySelector(".js-add-friend-name")
      .removeEventListener("input", addFriendsearch);
  }
  if (response.status == 400) {
    document.querySelector(
      ".js-friend-sug"
    ).innerHTML = `<div class="c-overlay--friend-sug"><p class="u-mb-clear">Je bent al vrienden met deze persoon</p></div>`;
  }
};

const listenToAddComment = function () {
  document
    .querySelector(".js-add-comment")
    .addEventListener("click", addComment);
};

const addComment = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/route/rate";
  let data = {
    routeID: selectedPath,
    comment: document.querySelector(".js-comment").value,
    rating: document
      .querySelector(".js-star-rating")
      .getAttribute("data-stars"),
  };
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.status == 201) {
    document
      .querySelector(".js-add-comment")
      .removeEventListener("click", addComment);
    getWallRoutes(ropeId);
  }
};

const listenToNotification = async function () {
  notifications = await fetchPromise(
    "https://meeclimb.azurewebsites.net/api/friend/requests"
  );
  let buttons = document.querySelectorAll(".js-notification");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      document
        .querySelector(".js-notification-item")
        .classList.toggle("u-display--block");
    });
  }

  console.log(notifications);
  if (notifications == null) {
    console.log("geen notificaties");
  }

  if (notifications.length > 0) {
    const buttons = document.querySelectorAll(".js-notification");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.add("has-notification");
    }
    let html = ``;
    notifications.forEach((notification) => {
      console.log("notification");
      console.log(notification);
      html += `<div>${notification.firstname} ${notification.lastname} heeft je een vriedschapverzoek gestuurd</div>
      <div class="c-notification--buttons" data-id=${notification.climberID}>
          <input type="button" value="accept" class="c-notification--button js-notification-accept" />
          <input type="button" value="ignore" class="c-notification--button js-notification-ignore" />
        </div>`;
    });

      

    document.querySelectorAll(".js-notification-accept").forEach((button) => {
      button.addEventListener("click", async function () {
        document
          .querySelector(".js-notification-item")
          .classList.toggle("u-display--block");
        let url =
          "https://meeclimb.azurewebsites.net/api/friend/request/accept";
        let data = {
          friendID: button.parentElement.dataset.id,
          accept: true,
        };
        await fetchPromise(url, "PUT", data);
      });
    });

    document.querySelectorAll(".js-notification-accept").forEach((button) => {
      button.addEventListener("click", async function () {
        document
          .querySelector(".js-notification-item")
          .classList.toggle("u-display--block");
        let url =
          "https://meeclimb.azurewebsites.net/api/friend/request/accept";
        let data = {
          friendID: button.parentElement.dataset.id,
          accept: false,
        };
        await fetchPromise(url, "PUT", data);
      });
    });
  } else {
		const buttons = document.querySelectorAll(".js-notification");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove("has-notification");
    }
		console.log("geen notificaties");
		document.querySelector(".js-notification-text").innerHTML = "Je hebt geen meldingen";
	}
};

// #endregion

let selectedRope, selectedRoute, selectedBuidler;

// #region get dashboard data
const getRopesSelect = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/ropes";
  const data = await fetchPromise(url);
  if (data.length != 0) {
    selectedRope = data[0].rope;
    showRopesDashboard(data);
  } else {
    document.querySelector(
      ".js-select-rope"
    ).innerHTML = `<option value="0">Geen touwen</option>`;
  }
};

const showRopesDashboard = function (ropes) {
  if (ropes.length == 0) {
    document.querySelector(
      ".js-select-rope"
    ).innerHTML = `<option value="0">Geen touwen</option>`;
    listenToUIDashboard();
  } else {
    let html = ``;
    for (let i = 0; i < ropes.length; -i++) {
      html += `<option value="${ropes[i].rope}">Touw ${ropes[i].rope}</option>`;
    }
    document.querySelector(".js-select-rope").innerHTML = html;
    getRouteSelect();
  }
};

const getRouteSelect = async function () {
  let url =
    "https://meeclimb.azurewebsites.net/api/routes?rope=" + selectedRope;
  const data = await fetchPromise(url);
  if (data.length != 0) {
    selectedRoute = data[0].routeID;
    selectedBuidler = data[0].builder.climberID;
    showRoutesDashboard(data);
  } else {
    document.querySelector(
      ".js-select-route"
    ).innerHTML = `<option value="0" data-builder="0">Geen routes</option>`;
    listenToUIDashboard();
  }
};

const showRoutesDashboard = function (data) {
  let html = ``;
  for (let i = 0; i < data.length; i++) {
    html += `<option value="${data[i].routeID}" data-builder="${
      data[i].builder.climberID
    }">${i + 1} | ${
      data[i].name == null ? "geen naam" : data[i].name
    }</option>`;
  }
  document.querySelector(".js-select-route").innerHTML = html;
  getDetailRouteSelect();
};

const getDetailRouteSelect = async function () {
  let url =
    "https://meeclimb.azurewebsites.net/api/routes?routeID=" + selectedRoute;
  const data = await fetchPromise(url);
  showDetailRouteDashboard(data);
};

const showDetailRouteDashboard = function (data) {
  document.querySelector(".js-route-name").value = data.name;
  document.querySelector(".js-route-niveau").value = data.difficulty;
  document.querySelector(".js-route-color").value = data.color;
  showGripsDashboard(data);
};
// #endregion

// #region add grips
const addGrip = function (event) {
  let type = event.target.getAttribute("data-id");
  let items = document.querySelectorAll(".c-wall__grid--item");
  let index = 0;
  while (index != "stop") {
    if (items[index].draggable == false) {
      items[index].classList.add("draggable");
      items[index].classList.add("c-wall__grid--item--grip--" + type);
      items[index].setAttribute("draggable", true);
      index = "stop";
    } else {
      index++;
    }
  }

  removeEventListeners();
  listenToUIDashboard();
};
// #endregion

// #region drag and drop functions
const dragstart = function (event) {
  event.dataTransfer.setData("text", event.target.id);
};

const dragover = function (event) {
  event.preventDefault();
};

const drop = function (event) {
  event.preventDefault();

  var data = event.dataTransfer.getData("text");
  var movable = document.getElementById(data);
  if (
    movable == null ||
    event.target.classList == movable.classList ||
    event.target.classList[3]
  )
    return;
  event.target.setAttribute("draggable", true);
  event.target.setAttribute("data-id", movable.getAttribute("data-id"));
  event.target.classList = movable.classList;
  movable.removeAttribute("draggable");
  movable.removeAttribute("data-id");
  movable.classList = "c-wall__grid--item dropzone";
  removeEventListeners();
  listenToUIDashboard();
};
// #endregion

// #region eventlisteners
const listenToUIDashboard = async function () {
  let draggable = document.querySelectorAll(".draggable");
  draggable.forEach(function (movable) {
    movable.addEventListener("dragstart", dragstart);
  });

  let dropzone = document.querySelectorAll(".dropzone");
  dropzone.forEach(function (dropZone) {
    dropZone.addEventListener("dragover", dragover);
  });

  dropzone.forEach(function (dropZone) {
    dropZone.addEventListener("drop", drop);
  });

  let typeGrip = document.querySelectorAll(".js-add__grip");
  typeGrip.forEach(function (type) {
    type.addEventListener("click", addGrip);
  });

  let selectRopeElement = document.querySelector(".js-select-rope");
  selectRopeElement.addEventListener("change", ropeSelectChange);

  let selectRouteElement = document.querySelector(".js-select-route");
  selectRouteElement.addEventListener("change", routeSelectChange);

  let saveSettingsElement = document.querySelector(".js-save-settings");
  saveSettingsElement.addEventListener("click", saveSettings);

  let cancelSettingsElement = document.querySelector(".js-cancel-settings");
  cancelSettingsElement.addEventListener("click", cancelSettings);

  let deleteTouwElement = document.querySelector(".js-delete-rope");
  deleteTouwElement.addEventListener("click", deleteTouw);

  let deleteRouteElement = document.querySelector(".js-delete-route");
  deleteRouteElement.addEventListener("click", deleteRoute);

  let addRopeElement = document.querySelector(".js-add-rope");
  addRopeElement.addEventListener("click", addRope);

  let addRouteElement = document.querySelector(".js-add-route");
  addRouteElement.addEventListener("click", addRoute);
};

const removeEventListeners = function () {
  let draggable = document.querySelectorAll(".draggable");
  let dropzone = document.querySelectorAll(".dropzone");

  draggable.forEach(function (movable) {
    movable.removeEventListener("dragstart", dragstart);
  });

  dropzone.forEach(function (dropZone) {
    dropZone.removeEventListener("dragover", dragover);
  });

  dropzone.forEach(function (dropZone) {
    dropZone.removeEventListener("drop", drop);
  });

  let typeGrip = document.querySelectorAll(".js-add__grip");
  typeGrip.forEach(function (type) {
    type.removeEventListener("click", addGrip);
  });

  let selectRopeElement = document.querySelector(".js-select-rope");
  selectRopeElement.removeEventListener("change", ropeSelectChange);

  let selectRouteElement = document.querySelector(".js-select-route");
  selectRouteElement.removeEventListener("change", routeSelectChange);

  let saveSettingsElement = document.querySelector(".js-save-settings");
  saveSettingsElement.removeEventListener("click", saveSettings);

  let cancelSettingsElement = document.querySelector(".js-cancel-settings");
  cancelSettingsElement.removeEventListener("click", cancelSettings);

  let deleteTouwElement = document.querySelector(".js-delete-rope");
  deleteTouwElement.removeEventListener("click", deleteTouw);

  let deleteRouteElement = document.querySelector(".js-delete-route");
  deleteRouteElement.removeEventListener("click", deleteRoute);
};
// #endregion

// #region add rope
const addRope = function () {
  document.querySelector(".js-overlay--addrope").style.display = "flex";
  listenToAddRope();
};

const listenToAddRope = function () {
  document
    .querySelector(".js-annuleren-rope")
    .addEventListener("click", cancelAddRope);
  document
    .querySelector(".js-toevoegen-rope")
    .addEventListener("click", toevoegenRope);
};

const cancelAddRope = function () {
  document.querySelector(".js-overlay--addrope").style.display = "none";
  document
    .querySelector(".js-annuleren-rope")
    .removeEventListener("click", cancelAddRope);
  document
    .querySelector(".js-annuleren-rope")
    .removeEventListener("click", toevoegenRope);
};

const toevoegenRope = async function () {
  let res = await fetch("https://meeclimb.azurewebsites.net/api/rope", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: document.querySelector(".js-route-image").value,
    }),
  });
  if (res.status == 201) {
    document.querySelector(".js-overlay--addrope").style.display = "none";
    document
      .querySelector(".js-annuleren-rope")
      .removeEventListener("click", cancelAddRope);
    document
      .querySelector(".js-annuleren-rope")
      .removeEventListener("click", toevoegenRope);
    getRopesSelect();
  }
};
// #endregion

// #region add route
const addRoute = function () {
  document.querySelector(".js-overlay--addroute").style.display = "flex";
  listenToAddRoute();
};

const listenToAddRoute = function () {
  document
    .querySelector(".js-annuleren-route")
    .addEventListener("click", cancelAddRoute);
  document
    .querySelector(".js-toevoegen-route")
    .addEventListener("click", toevoegenRoute);
};

const cancelAddRoute = function () {
  document.querySelector(".js-overlay--addroute").style.display = "none";
  document
    .querySelector(".js-annuleren-route")
    .removeEventListener("click", cancelAddRoute);
  document
    .querySelector(".js-annuleren-route")
    .removeEventListener("click", toevoegenRoute);
};

const toevoegenRoute = async function () {
  let routeName = document.querySelector(".js-add-route-name").value;
  let routeNiveau = document.querySelector(".js-add-route-niveau").value;
  let routeColor = document.querySelector(".js-add-route-color").value;

  let data = {
    name: routeName,
    difficulty: routeNiveau,
    builder: selectedBuidler,
    color: routeColor,
    rope: selectedRope,
    grips: [],
  };

  let res = await fetch("https://meeclimb.azurewebsites.net/api/route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (res.status == 201) {
    document
      .querySelector(".js-annuleren-route")
      .removeEventListener("click", cancelAddRoute);
    document
      .querySelector(".js-annuleren-route")
      .removeEventListener("click", toevoegenRoute);
    getRouteSelect();
  }
};
// #endregion

// #region select change
const ropeSelectChange = function (event) {
  if (event.target.value != 0) {
    selectedRope = event.target.value;
    getRouteSelect();
  }
};

const routeSelectChange = function (event) {
  if (event.target.value != 0) {
    selectedRoute = event.target.value;
    selectedBuidler =
      event.target.options[event.target.selectedIndex].getAttribute(
        "data-builder"
      );
    getDetailRouteSelect();
  }
};
// #endregion

// #region delete
const deleteRoute = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/route/" + selectedRoute;
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (response.status == 200) {
    getRopesSelect();
  }
};

const deleteTouw = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/rope/" + selectedRope;
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (response.status == 200) {
    getRopesSelect();
  }
};
// #endregion

// #region save settings
const saveSettings = async function () {
  let routeName = document.querySelector(".js-route-name").value;
  let routeNiveau = document.querySelector(".js-route-niveau").value;
  let routeColor = document.querySelector(".js-route-color").value;
  let coords = await getGripsCoords();

  let data = {
    routeID: selectedRoute,
    name: routeName,
    difficulty: routeNiveau,
    builder: selectedBuidler,
    color: routeColor,
    rope: selectedRope,
    grips: coords,
  };
  console.log(data);
  let url = "https://meeclimb.azurewebsites.net/api/route";
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log(response);
  console.log(response.json());
  if (response.status == 201) {
    getDetailRouteSelect();
  }
  removeEventListeners();
  listenToUIDashboard();
};

const cancelSettings = function () {
  getDetailRouteSelect();
};
// #endregion

// #region show dashboard data
const showWallDashboard = function () {
  let html = "";
  for (let i = 0; i < 1420; i++) {
    html += `<div class="c-wall__grid--item dropzone " id=${i}></div>`;
  }
  document.querySelector(".js-wall").innerHTML = html;
};

const showGripsDashboard = function (data) {
  showWallDashboard();
  if (data.grips.length == 0) {
    removeEventListeners();
    listenToUIDashboard();
    return;
  }
  wall = document.querySelectorAll(".c-wall");
  wallItem = document.querySelectorAll(".c-wall__grid--item");
  for (let j = 0; j < data.grips.length; j++) {
    try {
      let index =
        data.grips[j].points.x - 1 + (data.grips[j].points.y - 1) * 20;
      wallItem[index].setAttribute("data-id", data.routeID);
      wallItem[index].setAttribute("draggable", "true");
      wallItem[index].classList.add("draggable");

      switch (data.grips[j].handgriptype) {
        case "Bak":
          wallItem[index].classList.add("c-wall__grid--item--grip--bak");
          break;
        case "Sloper":
          wallItem[index].classList.add("c-wall__grid--item--grip--sloper");
          break;
        case "Crimp":
          wallItem[index].classList.add("c-wall__grid--item--grip--crimp");
          break;
        case "Pocket":
          wallItem[index].classList.add("c-wall__grid--item--grip--pocket");
          break;
        case "Jug":
          wallItem[index].classList.add("c-wall__grid--item--grip--jug");
          break;
        case "Undercling":
          wallItem[index].classList.add("c-wall__grid--item--grip--undercling");
          break;
        case "Mono":
          wallItem[index].classList.add("c-wall__grid--item--grip--mono");
          break;
        case "Bidoigt":
          wallItem[index].classList.add("c-wall__grid--item--grip--bidoigt");
          break;
        default:
          wallItem[index].classList.add("c-wall__grid--item--grip--bak");
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }
  removeEventListeners();
  listenToUIDashboard();
};

const getGripsCoords = function () {
  const items = document.getElementsByClassName("c-wall__grid--item");
  let data = [];
  for (let i = 0; i < items.length; i++) {
    let classes = items[i].classList;
    if (classes.length > 3) {
      let stone = classes[3].split("--");
      let id = items[i].getAttribute("id");
      let x = id % 20;
      let y = (id - x) / 20;
      let grip = {
        type: "handgrip",
        handgriptype: stone[3],
        points: {
          x: x + 1,
          y: y + 1,
        },
      };
      data.push(grip);
    }
  }
  return data;
};
// #endregion

// #region ***  User / login  ***********
const GetLogin = async function () {
  let url = "https://meeclimb.azurewebsites.net/auth/login";
  currentuser = await fetchPromise(url);
  if (currentuser != null) {
    console.log(currentuser);
    showLogin();
  }
};

const showLogin = function () {
  let htmladmin =
    currentuser.isAdmin == true
      ? '<a class="c-nav__link" href="https://meeclimb.azurewebsites.net/dashboard">Dashboard</a>'
      : "";

  let htmlDesktop = `<div class="c-nav__profile c-nav__profile--meta js-profile">
    ${htmladmin}
              <a href="#notifications" class="c-nav__notification js-notification"
                ><svg xmlns="http://www.w3.org/2000/svg" class="c-nav__notification--symbole" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></a
              ><a href="https://meeclimb.azurewebsites.net/account"><img src="${currentuser.image}" class="c-nav__profileimg c-nav__profileimg--account" alt="profile image form ${currentuser.lastname} ${currentuser.firstname}" /></a>
            </div>`;
  let htmlMobile = `<div class="c-nav__profile js-profile">
    ${htmladmin}
              <a href="#notifications" class="c-nav__notification js-notification"
                ><svg xmlns="http://www.w3.org/2000/svg" class="c-nav__notification--symbole" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></a
              ><a href="https://meeclimb.azurewebsites.net/account"><img src="${currentuser.image}" class="c-nav__profileimg c-nav__profileimg--account" alt="profile image form ${currentuser.lastname} ${currentuser.firstname}" /></a>
            </div>`;
  let htmlDashboard = `<div class="c-nav__profile js-profile">
              <a href="#notifications" class="c-nav__notification js-notification"
                ><svg xmlns="http://www.w3.org/2000/svg" class="c-nav__notification--symbole" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></a
              ><a href="https://meeclimb.azurewebsites.net/account"><img src="${currentuser.image}" class="c-nav__profileimg c-nav__profileimg--account" alt="profile image form ${currentuser.lastname} ${currentuser.firstname}" /></a>
            </div>`;

  let profile = document.querySelectorAll(".js-profile");
  if (document.querySelector("#dashboard")) {
    profile[0].innerHTML = htmlDashboard;
  } else {
    profile[0].innerHTML = htmlDesktop;
    profile[1].innerHTML = htmlMobile;
  }
  if (document.querySelector("#account")) {
    showDetailUser();
    if (currentuser.rfid == "00000") {
      document
        .querySelector(".js-link-rfid")
        .addEventListener("click", async function () {
          alert("scan nu je kaartje");
          const url =
            "https://meeclimb.azurewebsites.net/api/user/onboarding/process";
          const data = {};
          await fetchPromise(url, "POST", data);
        });
    } else {
      document.querySelector(".js-link-rfid").style.display = "none";
    }
    getUserInteractions();
  }
  if (document.querySelector("#index")) {
    document.querySelector(
      ".js-button-more"
    ).href = `https://meeclimb.azurewebsites.net/home`;
  }
};

const getUserInteractions = async function () {
  const url = "https://meeclimb.azurewebsites.net/api/user/interaction";
  const response = await fetchPromise(url);
  showUserInteractions(response);
};

const showUserInteractions = function (data) {
  console.log(data);
  document.querySelector(
    ".js-profile-friends"
  ).innerHTML = `${data.amountFriends}`;
  document.querySelector(
    ".js-profile-climbs"
  ).innerHTML = `${data.amountClimbs}`;
  document.querySelector(".js-profile-likes").innerHTML = `${data.amountLikes}`;
};
const showDetailUser = function () {
  document.querySelector(
    ".js-profile-name"
  ).innerHTML = `${currentuser.firstname} ${currentuser.lastname}`;
  document.querySelector(
    ".js-profile-nickname"
  ).innerHTML = `${currentuser.nickname}`;
  document.querySelector(".js-profile-img").src = `${currentuser.image}`;

  document.querySelector(".js-profile-bio").innderHTML = `${currentuser.bio}`;
};

const getActivityUser = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/activities";
  const activity = await fetchPromise(url);
  showActivityUser(activity);
};

const showActivityUser = function (data) {
  if (data.length == 0) {
    document.querySelector(
      ".js-activity"
    ).innerHTML = `<h1 class="c-account__activities--title">Recente activiteiten</h1><p class="c-comment__name u-mb-xs">Geen activiteiten</p>`;
    return;
  } else {
    console.log(data);
    let html = "";
    if (data.length == 0) {
      html +=
        '<h1 class="c-account__activities--title">Recente activiteiten</h1>';
      html += "Geen data";
    } else {
      for (let i = 0; i < data.length; i++) {
        let liked = "";
        for (let j = 0; j < data[i].likedby.length; j++) {
          console.log(currentuser);
          if (data[i].likedby[j] == currentuser.climberID) {
            liked = "checked";
          } else {
            liked = "";
          }
        }
        console.log(data);
        let comments = data[i].comments;
        let length = comments.length > 3 ? 3 : comments.length;
        let commentshmtl = '<div class="c-comments">';
        for (let j = 0; j < length; j++) {
          commentshmtl += `<div class="c-comment">
                <div class="c-comment-top">
                  <img src="${
                    comments[j].commentedby.image
                  }" alt="profiel foto van ${
            comments[j].commentedby.firstname
          } ${comments[j].commentedby.lastname}" class="c-comment__img" />
                  <div>
                    <p class="c-comment__name u-mb-xs">${
                      comments[j].commentedby.firstname
                    } ${comments[j].commentedby.lastname}</p>
                    <p class="c-comment__date u-mb-clear">${new Date(
                      comments[j].commentedby.timestsamp
                    ).toLocaleString("nl-be", {
                      weekday: "long",
                      month: "short",
                      year: "numeric",
                    })}</p>
                  </div>
                </div>
                <div class="c-comment__text">${comments[j].comment}</div>
              </div>
            `;
        }
        commentshmtl += "</div>";
        html += `<div class="c-community__item">
          <div class="c-community__item--topbar">
            <div class="c-community__item--topbar--left">
              <img src="${data[i].climber.image}" alt="profile picture of ${
          data[i].climber.firstname
        } ${data[i].climber.lastname}" class="c-community__item--avatar" />
              <div>
                <p class="c-community__item--topbar--name u-mb-clear">${
                  data[i].climber.firstname
                } ${data[i].climber.lastname}</p>
                <p class="c-community__item--topbar--date u-mb-clear">${new Date(
                  data[i].startTime
                ).toLocaleString("nl-be", {
                  weekday: "long",
                  month: "short",
                  year: "numeric",
                })}</p>
              </div>
            </div>
            <input type="checkbox" name="like" id="like" class="o-hide-accessible c-heart-checkbox js-like-button" ${liked} data-id="${
          data[i].activityID
        }" />
            <label for="like" class="c-community__heart">
              <svg xmlns="http://www.w3.org/2000/svg" class="c-community__heart--symbol" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              <span>${data[i].amountLikes}</span>
            </label>
          </div>
          <div class="c-community__stats">
            <div class="c-community__stat">
              <span class="c-community__stat--titel">Route</span
              ><span class="c-community__stat--value"
                >Touw ${data[i].route.rope} <br />
                Route ${data[i].route.name}</span
              >
            </div>
            <div class="c-community__stat"><span class="c-community__stat--titel">Niveau</span><span class="c-community__stat--value">${
              data[i].route.difficulty
            }</span></div>
            <div class="c-community__stat"><span class="c-community__stat--titel">Tijd</span><span class="c-community__stat--value">${
              data[i].prestation
            }</span></div>
          </div>
          <hr class="c-community--bar" />
          <div class="c-activity__comment--add">
            <textarea name="comment" id="comment" class="c-comment__area js-add-comment-activitie--text" rows="1" placeholder="Voeg een reactie toe"></textarea>
            <label for="send_comment" class="c-commen__button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </label>
            <input type="submit" name="send_comment" id="send_comment" class="o-hide-accessible js-add-comment-activitie" data-id="${
              data[i].activityID
            }" />
          </div>
            ${commentshmtl}
        </div>`;
      }
    }
  }
  document.querySelector(".js-activity").innerHTML = html;
  listenToLikeButton();
  listenToAddCommentButton();
};

const logout = async function () {
  let url = "https://meeclimb.azurewebsites.net/auth/logout";
  const result = await fetch(url);
  if (result.status === 200) {
    window.location.href = "https://meeclimb.azurewebsites.net/home";
  }
};
// #endregion

// #region Socket
/*
  const createSocketConnection = async function () {
    let res = await fetch(`https://meeclimb.azurewebsites.net/api/negotiate`);
    let url = await res.text();
    let ws = new WebSocket(url);
  
    ws.onopen = () => {
      console.log('[Connected to server]');
    };
  
    ws.onmessage = (event) => {
      console.log(`[Server] ${event.data}`);
    };
  
    ws.onclose = () => {
      console.log('[Disconnected]');
      setTimeout(createSocketConnection, 1000);
    };
  };
  */

const listenToAcceptButton = function (event) {
  notification = event.data;
  const button = document.querySelector(".js-notification-accept");
  button.addEventListener("click", acceptFriendRequest);
};

const acceptFriendRequest = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/friend/request/accept";
  let data = {
    friendID: notification.climberID,
    accept: true,
  };
  const response = await fetchPromise(url, "PUT", data);

  if (response.status == 200) {
    notification = null;
    document.querySelector(".js-notification-text").innerHTML =
      "Je hebt geen notificaties";
  }
};

const listenToHome = function () {
  const button = document.querySelectorAll(".js-home");
  button.forEach((element) => {
    element.addEventListener("click", function () {
      window.location.href = "https://meeclimb.azurewebsites.net/home";
    });
  });
};

const listenToEditWall = function () {
  const button = document.querySelectorAll(".js-edit-wall");
  button.forEach((element) => {
    element.addEventListener("click", function () {
      document.querySelector(".js-main-edit").classList.remove("u-hide");
      document.querySelector(".js-main-setting").classList.add("u-hide");
      document.querySelectorAll(".js-label-edit").forEach(function (e) {
        e.target.classList.add("c-db-option--selected");
      });
      document.querySelector(".js-label-setting").forEach(function (e) {
        e.classList.remove("c-db-option--selected");
      });
    });
  });
};

const listentToSetting = function () {
  const button = document.querySelectorAll(".js-setting");
  button.forEach((element) => {
    element.addEventListener("click", function () {
      document.querySelector(".js-main-edit").classList.add("u-hide");
      document.querySelector(".js-main-setting").classList.remove("u-hide");
      let editbuttons = document.querySelectorAll(".js-label-edit");
      for (let i = 0; i < editbuttons.length; i++) {
        editbuttons[i].classList.remove("c-db-option--selected");
      }
      let settingbuttons = document.querySelector(".js-label-setting");
      for (let i = 0; i < settingbuttons.length; i++) {
        settingbuttons[i].classList.remove("c-db-option--selected");
      }
      getAllUsers();
    });
  });
};

const getAllUsers = async function () {
  let url = "https://meeclimb.azurewebsites.net/api/users";
  const response = await fetchPromise(url);
  showAllusers(response);
};

const showAllusers = function (data) {
  let html = "";
  for (let i = 0; i < data.length; i++) {
    html += `<div class="c-db-user">
        <div class="c-db-user__name">${data[i].firstname} ${data[i].lastname}</div>
        <div class="c-db-user__email">${data[i].platform}</div>  
        <div class="c-db-user__button">
          <button class="c-db-user__button--add js-remove-user" data-id="${data[i].climberID}">User verwijderen</button>
        </div>
      </div>`;
  }
  document.querySelector(".js-all-users").innerHTML = html;
  listenToAddFriendButton();
};

const listenToAddFriendButton = function () {
  const buttons = document.querySelectorAll(".js-remove-user");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", removeUser);
  }
};

const removeUser = async function (event) {
  let url =
    "https://meeclimb.azurewebsites.net/api/user/" +
    event.target.getAttribute("data-id");
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (response.status == 200) {
    getAllUsers();
  }
};

// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
document.addEventListener("DOMContentLoaded", async function () {
  toggleNav();
  await GetLogin();
  listenToNotification();
  
  if (document.querySelector("#ropes")) {
    getRopes();
  }
  if (document.querySelector("#ropeDetail")) {
    showWall();
    getRopeId();
    listenToWindowResize();
  }
  
  if (document.querySelector("#dashboard")) {
    getRopesSelect();
    listenToHome();
    listenToLogout();
    listentToSetting();
    listenToEditWall();
  }
  if (document.querySelector("#account")) {
    listenToSeachFriend();
    listenToLogout();
    getActivityUser();
  }

  if (document.querySelector("#ranking")) {
    getRopesRanking();
  }
  if (document.querySelector("#community")) {
    getCommunity();
  }
  if (document.querySelector("#invite")) {
    //createSocketConnection();
    getRopesInvite();
  }
});
// #endregion

const getRopesInvite = async function () {
  const url = "https://meeclimb.azurewebsites.net/api/ropes";
  const ropes = await fetchPromise(url);
  if (ropes.length != 0) {
    selectedRope = ropes[0].rope;
    showRopesInvite(ropes);
  } else {
    document.querySelector(
      ".js-select-rope"
    ).innerHTML = `<option value="0" data-builder="0">Geen touwen</option>`;
    document.querySelector(
      ".js-select-route"
    ).innerHTML = `<option value="0" data-builder="0">Geen routes</option>`;
  }
};

const showRopesInvite = function (ropes) {
  let wall = document.querySelector(".js-select-rope");
  let html = ``;
  for (let i = 0; i < ropes.length; i++) {
    html += `<option value="${ropes[i].rope}">Touw ${ropes[i].rope}</option>`;
  }
  wall.innerHTML = html;
  getSelectedRopeInvite();
};

const getSelectedRopeInvite = async function () {
  const url =
    "https://meeclimb.azurewebsites.net/api/routes?rope=" + selectedRope;
  routes = await fetchPromise(url);
  if (routes.length != 0) {
    selectedRoute = routes[0].routeID;
    showRouteRanking(routes);
  } else {
    document.querySelector(
      ".js-select-route"
    ).innerHTML = `<option value="0">Geen routes op dit touw</option>`;
    listenToSelectchange();
    listenToSelectRouteButton();
  }
}

let selectedRouteInvite
const listenToSelectRouteButton = function () {
  document.querySelector(".js-select-button").addEventListener("click", function (event) {
    selectedRouteInvite = event.target.getAttribute("data-id");
    listenToSeachInvite();
  });
};

const listenToSeachInvite = function () {
  document.querySelector(".js-overlay--route").style.display = "none";
  document
    .querySelector(".js-search-climber")
    .addEventListener("click", function (event) {
      document.querySelector(".js-overlay--addfriend").style.display = "flex";
      document.querySelector(".js-cancel-friend").addEventListener("click", cancelInvite);
      document.querySelector(".js-add-friend-name").addEventListener("input", inviteSearch);
    });
};

const cancelInvite = function () {
  window.location.href = "https://meeclimb.azurewebsites.net/account";
};

const inviteSearch = async function (event) {
  let search = event.target.value;
  let url = "https://meeclimb.azurewebsites.net/api/user?nickname=" + search;
  let data = await fetchPromise(url);

  let lengte = data.length > 5 ? 5 : data.length;

  let html = ``;
  for (let i = 0; i < lengte; i++) {
    html += `<div class="c-overlay--friend-sug">
            <p class="u-mb-clear">${data[i].firstname} ${data[i].lastname}</p>
            <input type="button" value="toevoegen" data-id=${data[i].climberID} class="js-invite-button c-overlay-add-friend--button"/>
          </div>`;
  }
  document.querySelector(".js-friend-sug").innerHTML = html;
  let buttons = document.querySelectorAll(".js-invite-button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      let id = this.getAttribute("data-id");
      inviteFriend(id);
    });
  });
};

const inviteFriend = async function (id) {
  let url = "https://meeclimb.be/api/activity/invite";
  let data = {
    routeID: selectedRouteInvite,
    friendID: id,
  };
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.status == 201) {
    document.querySelector(".js-overlay--addfriend").style.display = "none";
    document
      .querySelector(".js-cancel-friend")
      .removeEventListener("click", cancelFriend);
    document
      .querySelector(".js-add-friend-name")
      .removeEventListener("input", addFriendsearch);
  }
  if (response.status == 400) {
    document.querySelector(
      ".js-friend-sug"
    ).innerHTML = `<div class="c-overlay--friend-sug"><p class="u-mb-clear">Je deze persoon al een uitnodeging gesetuurd</p></div>`;
  }
};