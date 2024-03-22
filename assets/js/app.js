const cl = console.log;

const addBtn = document.getElementById("addBtn");
const ourmodal = document.getElementById("ourmodal");
const backdrop = document.getElementById("backdrop");
const cancel = [...document.querySelectorAll(".cancel")];
const movieContainer = document.getElementById("movieContainer");
const titleControl = document.getElementById("title");
const imgSource = document.getElementById("imgSource");
const rating = document.getElementById("rating");
const formControl = document.getElementById("formControl");
const updateBtn = document.getElementById("updateBtn");
const addMovie = document.getElementById("addMovie");
const loader = document.getElementById("loader");


let baseUrl = `https://movie-modal-2-default-rtdb.asia-southeast1.firebasedatabase.app/`;
let postsUrl = `${baseUrl}/movies.json`;

const onAddMovieBtn = () => {
    ourmodal.classList.toggle("d-none");
    backdrop.classList.toggle("d-none")
}


const onDeleteBtn = (eve) => {
    let getId = eve.closest(".card").id;
    let deleteUrl = `${baseUrl}/movies/${getId}.json`;

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async(result) => {
        if (result.isConfirmed) {
            try{
                let res = await makeApiCall("DELETE", deleteUrl);
                document.getElementById(getId).remove();
            }catch(err){
                cl(err);
            }finally{
                loader.classList.add("d-none")
            }
          Swal.fire({
            title: "Deleted!",
            text: "Your movie has been deleted.",
            icon: "success"
          });
        }
      })
}

const onEditBtn = async(eve) => {
    let getId = eve.closest(".card").id;
    localStorage.setItem("getId", getId);
    let editUrl = `${baseUrl}/movies/${getId}.json`;
    try{
        let res = await makeApiCall("GET", editUrl);
        titleControl.value = res.title;
        imgSource.value = res.path;
        rating.value = res.rating;
        onAddMovieBtn();
        addMovie.classList.add("d-none");
        updateBtn.classList.remove("d-none");
    }catch(err){
        cl(err);
    }finally{
        loader.classList.add("d-none")
    }
}


const makeApiCall = async(methodName, apiUrl, msgBody) => {
    let msgData = msgBody ? JSON.stringify(msgBody) : null;
    loader.classList.remove("d-none");
    let res = await fetch(apiUrl, {
        method : methodName,
        body : msgData
    })

    return res.json();
}

const createMovieCards = (arr) => {
    movieContainer.innerHTML = arr.map(obj => {
        return `
        <div class="card mt-4 movieCard" id="${obj.id}"> 
            <div class="card-header">
                <h4>${obj.title}</h4>
            </div>
            <div class="card-body cardBody p-0">
                <img src="${obj.path}" alt="movieImg">
            </div>
            <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-primary" type="button" onclick="onEditBtn(this)">Edit</button>
                <button class="btn btn-danger" type="button" onclick="onDeleteBtn(this)">Delete</button>
            </div>
        </div>
        `
    }).join(" ");
}

const getDBdata = async() => {
    try{
        let res = await makeApiCall("GET", postsUrl);
        cl(res);
        let object = res;
        let movieArr = [];
        for (const key in object) {
            let obj = {...object[key], id:key}
            movieArr.push(obj);
            createMovieCards(movieArr);
        }
    }catch(err){
        cl(err)
    }finally{
        loader.classList.add("d-none")
    }
}
getDBdata()

const creatCard = (obj) => {
    let card = document.createElement("div");
    card.id = obj.id;
    card.className = "card mt-4 movieCard";
    card.innerHTML = `
                        <div class="card-header">
                            <h4>${obj.title}</h4>
                        </div>
                        <div class="card-body cardBody p-0">
                            <img src="${obj.path}" alt="movieImg">
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-primary" type="button" onclick="onEditBtn(this)">Edit</button>
                            <button class="btn btn-danger" type="button" onclick="onDeleteBtn(this)">Delete</button>
                        </div>
    `
    movieContainer.prepend(card);
    Swal.fire({
        title : `Movie Added successfully !!!`,
        icon : `success`
    })
}

const postDataInDB = async(eve) => {
    eve.preventDefault();
    let obj = {
        title : titleControl.value,
        path : imgSource.value,
        rating : rating.value
    }
    try{
        let res = await makeApiCall("POST", postsUrl, obj);
        obj.id = res.name;
        creatCard(obj);
        onAddMovieBtn();
    }catch(err){
        cl(err);
    }finally{
        formControl.reset();
        loader.classList.add("d-none");
    }
}


const onUpdateHandler = async() => {
    let getId = localStorage.getItem("getId");
    let updateUrl = `${baseUrl}/movies/${getId}.json`;
    let updatedObj = {
        title : titleControl.value,
        path : imgSource.value,
        rating : rating.value
    }
    try{
        let res = await makeApiCall("PATCH", updateUrl, updatedObj);
        let card = [...document.getElementById(getId).children];
        cl(card);
        card[0].innerHTML = `<h4>${updatedObj.title}</h4>`;
        card[1].innerHTML = `<img src="${updatedObj.path}" alt="movieImg">`;
        onAddMovieBtn();
        Swal.fire({
            title : `Movie Updated !!!`,
            icon : `Success`
        })
    }catch(err){
        cl(err);
    }finally{
        loader.classList.add("d-none")
    }
}








cancel.forEach(ele => {
    ele.addEventListener("click", onAddMovieBtn);
})
addBtn.addEventListener("click", onAddMovieBtn);
formControl.addEventListener("submit", postDataInDB);
updateBtn.addEventListener("click", onUpdateHandler);